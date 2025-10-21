import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import formidable from 'formidable';
import fs from 'fs';
import { parse } from 'csv-parse';
import CryptoJS from 'crypto-js';
import { authenticate } from '../../../utils/auth';

export const config = {
  api: { bodyParser: false }
};

const ENC_KEY = process.env.ENCRYPTION_KEY || 'enckeydev';

function encrypt(text:string){
  return CryptoJS.AES.encrypt(text, ENC_KEY).toString();
}

function parseNIK(nik:string){
  if (!nik || nik.length < 16) return { gender: null, birthDate: null, age: null };
  try {
    const day = parseInt(nik.substring(6,8));
    const month = parseInt(nik.substring(8,10)) - 1;
    const year = 1900 + parseInt(nik.substring(10,12));
    const gender = day > 40 ? 'Female' : 'Male';
    const realDay = day > 40 ? day - 40 : day;
    const birthDate = new Date(year, month, realDay).toISOString();
    const age = new Date().getFullYear() - year;
    return { gender, birthDate, age };
  } catch (e) {
    return { gender: null, birthDate: null, age: null };
  }
}

export default authenticate(async (req: NextApiRequest, res: NextApiResponse) => {
  const form = formidable({ multiples: false, keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: 'parse error' });
    const file:any = files.file;
    if (!file) return res.status(400).json({ error: 'file required' });
    const path = file.filepath || file.path;
    const records:any[] = [];
    fs.createReadStream(path)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (row) => {
        const nikRaw = row.NIK || row.nik || row.Nik || '';
        const { gender, birthDate, age } = parseNIK(nikRaw);
        records.push({
          name: row.Name || row.name || row.nama || '',
          nik_enc: encrypt(String(nikRaw)),
          noKK: row.NOKK || row.noKK || row.Nokk || '',
          address: row.Address || row.address || row.Alamat || '',
          dtsenStatus: row.DTSENStatus || row.DTSEN || '',
          desilGrade: row.DesilGrade || '',
          occupation: row.Occupation || row.Pekerjaan || '',
          occupationStatus: row.OccupationStatus || '',
          bpntStatus: row.BPNTStatus || '',
          pbiStatus: row.PBIStatus || '',
          pkhStatus: row.PKHStatus || '',
          familyAssets: row.FamilyAssets || row['Family Assets'] || '',
          gender,
          birthDate: birthDate ? new Date(birthDate) : null,
          age: age || null
        });
      })
      .on('end', async () => {
        // upsert citizens and build family summary
        const created = [];
        for (const r of records) {
          try {
            const c = await prisma.citizen.upsert({
              where: { nik_enc: r.nik_enc },
              update: r,
              create: r
            });
            created.push(c);
          } catch (e:any) {
            // ignore duplicates or errors for now
          }
        }
        // update families
        const familyMap:any = {};
        for (const c of created) {
          const noKK = c.noKK || 'unknown';
          if (!familyMap[noKK]) familyMap[noKK] = { members: 0, assets: 0, headName: null };
          familyMap[noKK].members += 1;
          const assets = parseFloat(String(c.familyAssets || '0')) || 0;
          familyMap[noKK].assets += assets;
        }
        for (const noKK of Object.keys(familyMap)) {
          const f = familyMap[noKK];
          await prisma.family.upsert({
            where: { noKK },
            update: { memberCount: f.members, totalAssets: f.assets },
            create: { noKK, memberCount: f.members, totalAssets: f.assets }
          });
        }
        // log import
        await prisma.importJob.create({ data: { module: 'citizens', filename: file.originalFilename || 'upload.csv', status: 'done', summary: { imported: created.length } }});
        // remove temp file
        try { fs.unlinkSync(path); } catch(e){}
        res.json({ ok: true, imported: created.length });
      })
      .on('error', (err2) => res.status(500).json({ error: String(err2) }));
  });
}, ['ADMIN','OPERATOR']);
