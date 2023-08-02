import fs from 'fs';
import os from 'os';
import nock from 'nock';
import path from 'path';
// import pageLoad from '../src/load.js';
import pageLoad from '../src/instance.js';

const testURL = 'https://ru.hexlet.io/courses';
const expectedData = fs.promises.readFile('../__fixtures__/after.txt', 'utf-8');

nock(testURL).get('').reply(200, async () => {
  const data = await fs.promises.readFile('../__fixtures__/before.txt', 'utf-8');
  return data;
});

nock.disableNetConnect();
pageLoad(testURL);
// let tmpDir;

// beforeEach(async () => {
//   tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
// });

// test('check the created file', async () => {
//   const filePath = await pageLoad(testURL);
//   expect(filePath).toBe(expectedData);
// });

// test('check data and the path of the file', async () => {
//   const filepath = await pageLoad(testURL, tmpDir);
//   const data = await fs.promises.readFile(filepath, 'utf8');
//   const expected = await expectedData;
//   expect(data).toBe(expected);
// });

// test('wrong dir', async () => {
//   await expect(async () => {
//     await pageLoad(testURL, 'bla');
//   }).rejects.toThrow();
// });

// test('net', async () => {
//   await expect(pageLoad(testURL, 'bla')).rejects.toThrow();
// });
