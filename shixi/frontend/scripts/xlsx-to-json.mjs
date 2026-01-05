import { readFile, writeFile } from 'node:fs/promises';
import { read, utils } from 'xlsx';

const conversions = [
  {
    name: 'users',
    input: '../public/users.xlsx',
    output: '../public/users.json',
  },
  {
    name: 'company',
    input: '../public/company.xlsx',
    output: '../public/company.json',
  },
];

async function convertFile(entry) {
  const workbook = read(await readFile(new URL(entry.input, import.meta.url)));
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = sheet ? utils.sheet_to_json(sheet, { defval: '' }) : [];
  await writeFile(new URL(entry.output, import.meta.url), JSON.stringify(data, null, 2));
  console.log(`public/${entry.name}.json 已生成，共`, data.length, '条记录');
}

async function main() {
  for (const entry of conversions) {
    await convertFile(entry);
  }
}

main().catch((error) => {
  console.error('转换失败', error);
  process.exit(1);
});

