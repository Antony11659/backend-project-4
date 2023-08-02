import fs from 'fs';
import path from 'path';
import process from 'process';
import debug from 'debug';
import nock from 'nock';
import { createRequire } from 'module';
import { downloadAssets, buildName } from './utilities.js';
import FileSystemError from '../errors/FileSystemError.js';
import NetworkError from '../errors/NetworkError.js';

const require = createRequire(import.meta.url);
require('axios-debug-log');
const axios = require('axios');

const log = debug('page-loader');

// const testURL = 'https://page-loader.hexlet.repl.co';
const testURL = 'https://ru.hexlet.io/courses';
nock(testURL).get('').reply(200, async () => {
  const data = await fs.promises.readFile('../__fixtures__/before.txt', 'utf-8');
  return data;
});

const downloadPage = (url, dir = process.cwd()) => {
  log(`the data is loading from ${url} into ${dir}`);
  const filePath = path.join(dir, buildName(url, '.html'));
  const dirResourcePath = path.join(dir, buildName(url, '_files'));
  return new Promise((resolve) => {
    const data = axios.get(url).catch((err) => {
      throw new NetworkError(err);
    });
    fs.promises.mkdir(dirResourcePath);
    resolve(data);
  })
    .then((response) => {
      const { data, status } = response;
      log('the data is loaded and response status is ', status);
      downloadAssets(url, data, dirResourcePath);
      fs.promises.writeFile(filePath, data).catch((err) => {
        throw new FileSystemError(err.message);
      });
    }).then((response) => console.log(response))
    .then(() => {
      log(`resources is downloaded into directory ${dirResourcePath}!`);
      log(`the file ${filePath} is created!`);
      return filePath;
    })
    .catch((err) => {
      throw new FileSystemError(err.message);
    });
};
// downloadPage(testURL, './tmpdir');
downloadPage(testURL);
export default downloadPage;
