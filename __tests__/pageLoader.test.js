import fs from 'fs';
import os from 'os';
import nock from 'nock';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import pageLoad from '../src/load.js';
import { after, before } from '../__fixtures__/html.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

const testAddress = 'https://ru.hexlet.io/courses';

const isDirExists = (dirPath) => new Promise((resolve) => {
  resolve(fs.promises.access(dirPath));
})
  .then(() => true)
  .catch(() => false);

const testDomain = 'https://ru.hexlet.io';

const server = [
  // create a fake server which consists of domain and filepath to the data of the domain
  { domain: '/courses', data: 'ru-hexlet-io-courses.html' },
  { domain: '/courses.html', data: 'ru-hexlet-io-courses_files/ru-hexlet-io-courses.html' },
  { domain: '/assets/application.css', data: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css' },
  { domain: '/assets/professions/nodejs.png', data: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png' },
  { domain: '/packs/js/runtime.js', data: 'ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js' },
];

server.forEach((el) => {
  // for each request nock returns the data from fake server
  const { domain, data } = el;

  nock(testDomain)
    .persist()
    .get(domain)
    .reply(200, () => new Promise((resolve, reject) => {
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

// let tmpDir;

// beforeEach(async () => {
const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
// });
pageLoad(testAddress, tmpDir);

// const getData = async (url) => {
//   const { data } = await axios.get(url);
//   console.log(data);
// };

// getData(testAddress);

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
