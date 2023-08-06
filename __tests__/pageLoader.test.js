import fs from 'fs';
import os from 'os';
import nock from 'nock';
import path from 'path';
import pageLoad from '../src/load.js';
import { after, before } from '../__fixtures__/html.js';

const testAddress = 'https://ru.hexlet.io/courses';

const isDirExists = (dirPath) => new Promise((resolve) => {
  resolve(fs.promises.access(dirPath));
})
  .then(() => true)
  .catch(() => false);

const testDomain = 'https://ru.hexlet.io';

const server = [
  { domain: '/courses', data: before },
  { domain: '/assets/application.css', data: 'margin: 0; padding: 0' },
  { domain: '/assets/professions/nodejs.png', data: 'any image file' },
  { domain: '/packs/js/runtime.js', data: 'console.log(\'Hello, hexlet\'):' },
];

server.forEach((el) => {
  const { domain, data } = el;
  
  nock(testDomain)
  .persist()
  .get(domain)
  .reply(200, data)
  // .get('/assets/application.css')
  // .reply(200, server[1].data);
});

nock.disableNetConnect();

// let tmpDir;

// beforeEach(async () => {
const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
pageLoad(testAddress, tmpDir).then((res) => console.log(res));
// });

// test('check the correct file path', async () => {
//   const expectedData = path.join(tmpDir, 'ru-hexlet-io-courses.html');
//   const filePath = await pageLoad(testURL, tmpDir);
//   expect(filePath).toBe(expectedData);
// });

// test('check correct dir', async () => {
//   const expectedDir = path.join(tmpDir, 'ru-hexlet-io-courses_files');
//   await pageLoad(testURL, tmpDir);
//   const result = await isDirExists(expectedDir);
//   expect(result).toBeTruthy();
// });

// test('check the data of the dir', async () => {
//   // const dirPath = path.join(tmpDir, 'ru-hexlet-io-courses_files');
//   const expectedData = await fs.promises.readFile('./__fixtures__/ru-hexlet-io-courses.html', 'utf8');
//   // await pageLoad(testURL, tmpDir);
//   // const result = await isDirExists(expectedDir);
//   const result = '<h1>Hello, world!</h1>';
//   expect(result).toBe(expectedData);
// });
