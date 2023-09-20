import fs from 'fs';
import os from 'os';
import nock from 'nock';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import pageLoad from '../src/load.js';
import after from '../__fixtures__/html.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const normalizeHtml = (text) => text.replace(/\s+/g, '');
const dirExists = (dirPath) => new Promise((resolve) => {
  resolve(fs.promises.access(dirPath));
})
  .then(() => true)
  .catch(() => false);

nock.disableNetConnect();

const testAddress = 'https://ru.hexlet.io/courses';

let tmpDir;

beforeEach(async () => {
  tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

describe('correct cases', () => {
  const testDomain = 'https://ru.hexlet.io';

  const mockData = [
  // create a fake server
    { domain: '/courses', data: 'ru-hexlet-io-courses.html', status: 200 },
    { domain: '/courses.html', data: 'ru-hexlet-io-courses_files/ru-hexlet-io-courses.html', status: 200 },
    { domain: '/assets/application.css', data: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css', status: 200 },
    { domain: '/assets/professions/nodejs.png', data: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png', status: 200 },
    { domain: '/packs/js/runtime.js', data: 'ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js', status: 200 },
  ];

  mockData.forEach((el) => {
  // nock returns for each request the data from the fake server
    const { domain, data, status } = el;
    nock(testDomain)
      .persist()
      .get(domain)
      .reply(status, () => new Promise((resolve) => {
        const filepath = getFixturePath(data);
        const asset = fs.promises.readFile(filepath, 'utf8');
        resolve(asset);
      })
        .then((response) => response));
  });

  test('checks the correct file path', async () => {
    const expectedData = path.join(tmpDir, 'ru-hexlet-io-courses.html');
    const filePath = await pageLoad(testAddress, tmpDir);
    expect(filePath).toBe(expectedData);
  });

  test('checks if a dir was created', async () => {
    const expectedDir = path.join(tmpDir, 'ru-hexlet-io-courses_files');
    await pageLoad(testAddress, tmpDir);
    const result = await dirExists(expectedDir);
    expect(result).toBeTruthy();
  });

  test('checks the html page after downloading', async () => {
    const filePath = await pageLoad(testAddress, tmpDir);
    const resultData = await fs.promises.readFile(filePath, 'utf8');
    const resultFile = normalizeHtml(resultData);
    const expectedData = normalizeHtml(after);
    expect(resultFile).toBe(expectedData);
  });
});

describe('wrong cases', () => {
  const wrongURL = 'http://wrongURL.com';
  nock(wrongURL)
    .persist()
    .get('/')
    .replyWithError({ response: { status: 400 } });
  nock(testAddress)
    .persist()
    .get('')
    .reply(200);

  describe('network errors', () => {
    test('throws NetworkError for invalid HTTP request', async () => {
      await expect(pageLoad(wrongURL, tmpDir)).rejects.toThrow('BAD_REQUEST');
    });
  });

  describe('file system error', () => {
    test('directory doesn\'t exist', async () => {
      await expect(pageLoad(testAddress, 'bla')).rejects.toThrow();
    });

    test('access to the directory is denied', async () => {
      await fs.promises.chmod(tmpDir, 0o000);
      await expect(pageLoad(testAddress, tmpDir)).rejects.toThrow();
    });
  });
});
