import fs from 'fs';
import os from 'os';
import nock from 'nock';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import pageLoad from '../src/load.js';
import { after } from '../__fixtures__/html.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const normalizeHtml = (text) => text.replace(/\s+/g, '');
const dirExists = (dirPath) => new Promise((resolve) => {
  resolve(fs.promises.access(dirPath));
})
  .then(() => true)
  .catch(() => false);

const testAddress = 'https://ru.hexlet.io/courses';

const testDomain = 'https://ru.hexlet.io';

const server = [
  // create a fake server
  { domain: '/courses', data: 'ru-hexlet-io-courses.html' },
  { domain: '/courses.html', data: 'ru-hexlet-io-courses_files/ru-hexlet-io-courses.html' },
  { domain: '/assets/application.css', data: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css' },
  { domain: '/assets/professions/nodejs.png', data: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png' },
  { domain: '/packs/js/runtime.js', data: 'ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js' },
];

server.forEach((el) => {
  // nock returns for each request the data from the fake server
  const { domain, data } = el;

  nock(testDomain)
    .persist()
    .get(domain)
    .reply(200, () => new Promise((resolve) => {
      const filepath = getFixturePath(data);
      const asset = fs.promises.readFile(filepath, 'utf8');
      resolve(asset);
    })
      .then((response) => response)
      .catch((err) => {
        throw new Error(err.message);
      }));
});

nock.disableNetConnect();

let tmpDir;

beforeEach(async () => {
  tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('check the correct file path', async () => {
  const expectedData = path.join(tmpDir, 'ru-hexlet-io-courses.html');
  const filePath = await pageLoad(testAddress, tmpDir);
  expect(filePath).toBe(expectedData);
});

test('check if a dir was created', async () => {
  const expectedDir = path.join(tmpDir, 'ru-hexlet-io-courses_files');
  await pageLoad(testAddress, tmpDir);
  const result = await dirExists(expectedDir);
  expect(result).toBeTruthy();
});

test('check the html page after downloading', async () => {
  const filePath = await pageLoad(testAddress, tmpDir);
  const resultData = await fs.promises.readFile(filePath, 'utf8');
  const resultFile = normalizeHtml(resultData);
  const expectedData = normalizeHtml(after);
  expect(resultFile).toBe(expectedData);
});
