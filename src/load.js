import fs from 'fs';
import path from 'path';
import process from 'process';
import debug from 'debug';
import nock from 'nock';
import { createRequire } from 'module';
import { downloadResources, buildName } from './lib.js';

const require = createRequire(import.meta.url);
require('axios-debug-log');
const axios = require('axios');

const log = debug('page-loader');

const testURL = 'https://ru.hexlet.io/courses';
nock(testURL).get('').reply(200, async () => {
  const data = await fs.promises.readFile('../__fixtures__/before.html', 'utf-8');
  return data;
});

const downloadPage = (url, dir = process.cwd()) => {
  log(`the data is loading from ${url} into ${dir} `);
  const filePath = path.join(dir, buildName(url, '.html'));
  const dirResource = path.join(dir, buildName(url, '_files'));
  return new Promise((resolve) => {
    const data = axios.get(url);
    fs.promises.mkdir(dirResource);
    resolve(data);
  })
    .then((response) => {
      log('the data is loaded and response status is ', response.status);
      return downloadResources(url, response.data, dirResource);
    })
    .then((response) => {
      log(`resources is downloaded into directory ${dirResource}!`);
      fs.promises.writeFile(filePath, response).catch((err) => {
        throw new Error(err.message);
      });
    }).then(() => {
      log(`the file ${filePath} is created!`);
      return filePath;
    })
    .catch((err) => {
      throw new Error(err.message);
    });
};
downloadPage(testURL, './tmpdir');

// export default downloadPage;
