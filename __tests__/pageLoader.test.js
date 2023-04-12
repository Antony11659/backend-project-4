import fs from 'fs';
import os from 'os';
import nock from 'nock';
import path from 'path';
import pageLoad from '../src/load.js';

const testURL = 'https://ru.hexlet.io/courses';
const expectedData = '<h1>test passed</h1>';

nock(testURL).get('').reply(200, expectedData);

nock.disableNetConnect();

let tmpDir;

beforeEach(async () => {
  tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('check data and the path of the file', async () => {
  const filepath = await pageLoad(testURL, tmpDir);
  const data = await fs.promises.readFile(filepath, 'utf8');
  expect(data).toBe(expectedData);
});

test('wrong dir', async () => {
  await expect(pageLoad(testURL, 'bla')).rejects.toThrow();
});
