import fs from 'fs';
import path from 'path';
import process from 'process';
import debug from 'debug';
import { createRequire } from 'module';
import { downloadAssets, buildName } from './utilities.js';
import handleError from './errors/errorHandler.js';

const require = createRequire(import.meta.url);
require('axios-debug-log');
const axios = require('axios');

const log = debug('page-loader');

const downloadPage = (url, dir = process.cwd()) => {
  const filePath = path.join(dir, buildName(url, '.html'));
  const dirAssetsPath = path.join(dir, buildName(url, '_files'));

  log(`the directory ${dir} is checking...`);
  // eslint-disable-next-line no-bitwise
  return fs.promises.access(dir, fs.constants.R_OK | fs.constants.W_OK).then(() => {
    log(`the directory ${dir} is valid`);
    log(`the data is loading from ${url} into ${dir}`);
    fs.promises.mkdir(dirAssetsPath);
    return axios.get(url)
      .then((response) => {
        const { data, status } = response;
        log('response status is ', status);
        return downloadAssets(url, data, dirAssetsPath);
      })
      .then((response) => fs.promises.writeFile(filePath, response))
      .then(() => {
        log(`resources is downloaded into directory ${dirAssetsPath}!`);
        log(`the file ${filePath} is created!`);
        return filePath;
      });
  }).catch((err) => {
    handleError(err);
  });
};
export default downloadPage;
