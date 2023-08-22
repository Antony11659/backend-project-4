import fs from 'fs';
import path from 'path';
import process from 'process';
import debug from 'debug';
import { createRequire } from 'module';
import { downloadAssets, buildName } from './utilities.js';
import handleError from '../errors/errorHandler.js';

const require = createRequire(import.meta.url);
require('axios-debug-log');
const axios = require('axios');

const log = debug('page-loader');

const downloadPage = (url, dir = process.cwd()) => {
  // log(`the data is loading from ${url} into ${dir}`);
  const filePath = path.join(dir, buildName(url, '.html'));
  const dirAssetsPath = path.join(dir, buildName(url, '_files'));
  // return new Promise((resolve, reject) => {
  //   const data = axios.get(url).catch((err) => {
  //     handleError(err);
  //   });
  //   fs.promises.mkdir(dirAssetsPath).catch((err) => {
  //     handleError(err);
  //   });
  //   resolve(data);
  // })
  return new Promise((resolve, reject) => {
    log(`the directory ${dir} is checking...`);
    const data = fs.promises.access(dir).then(() => {
      log(`the directory ${dir} is valid`);
      log(`the data is loading from ${url} into ${dir}`);
      fs.promises.mkdir(dirAssetsPath).catch((err) => {
        handleError(err);
      });
      return axios.get(url).catch((err) => {
        reject(handleError(err));
      });
    }).catch((err) => {
      handleError(err);
    });
    resolve(data);
  })

    .then((response) => {
      const { data, status } = response;
      log('response status is ', status);
      return downloadAssets(url, data, dirAssetsPath);
    })
    .then((response) => {
      fs.promises.writeFile(filePath, response).catch((err) => {
        handleError(err);
      });
    })
    .then(() => {
      log(`resources is downloaded into directory ${dirAssetsPath}!`);
      log(`the file ${filePath} is created!`);
      return filePath;
    })
    .catch((err) => {
      handleError(err);
    });
};

export default downloadPage;
