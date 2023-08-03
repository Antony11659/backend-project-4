import fs from 'fs';
import os from 'os';
import nock from 'nock';
import path from 'path';
import pageLoad from '../src/load.js';
import { after, before } from '../__fixtures__/html.js';

const testURL = 'https://ru.hexlet.io/courses';

const isDirExists = (dirPath) => new Promise((resolve) => {
  resolve(fs.promises.access(dirPath));
})
  .then(() => true)
  .catch(() => false);

nock(testURL).get('').reply(200, async () => {
  const data = before;
  return data;
});

nock.disableNetConnect();
let tmpDir;

beforeEach(async () => {
  tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('check the correct file path', async () => {
  const expectedData = path.join(tmpDir, 'ru-hexlet-io-courses.html');
  const filePath = await pageLoad(testURL, tmpDir);
  expect(filePath).toBe(expectedData);
});

test('check wrong dir', async () => {
  await expect(async () => {
    await pageLoad(testURL, 'bla');
  }).rejects.toThrow();
});

test('check correct dir', async () => {
  const expectedDir = path.join(tmpDir, 'ru-hexlet-io-courses_files');
  await pageLoad(testURL, tmpDir);
  const result = await isDirExists(expectedDir);
  expect(result).toBeTruthy();
});

// test('net', async () => {
//   await expect(pageLoad(testURL, 'bla')).rejects.toThrow();
// });
