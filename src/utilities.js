import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { createRequire } from 'module';
import Listr from 'listr';
import handleError from '../errors/errorHandler.js';

const require = createRequire(import.meta.url);
require('axios-debug-log');
const axios = require('axios');

const getRelativeFilePath = (fullFilePath) => {
  const rootDir = path.dirname(fullFilePath);
  const relativeDirName = path.parse(rootDir).base;
  const fileName = path.parse(fullFilePath).base;
  const relativeFileName = path.join(relativeDirName, fileName);
  return relativeFileName;
};

const buildName = (address, type) => {
  const addressWithoutProtocol = address.replace(/^(\/|^https?:\/\/)/, '').concat('/', '');
  const { dir, name, ext } = path.parse(addressWithoutProtocol);
  const newName = dir !== '' ? dir.concat('-', name) : name;
  const filePathName = newName.split(/[./]/g).join('-');
  const extension = type ?? ext;
  return filePathName.concat(extension);
};

const loadData = (url, dir) => {
  // replace url with a relative file path into the html file
  const fullFilePath = path.join(dir, buildName(url));
  const relativeFilePath = getRelativeFilePath(fullFilePath);
  return new Promise((resolve, reject) => {
    const data = axios.get(url, { responseType: 'stream' }).catch((error) => {
      reject(handleError(error));
    });
    resolve(data);
  })
    .then((response) => {
      fs.promises.writeFile(fullFilePath, response.data).catch((error) => handleError(error));
    })
    .then(() => relativeFilePath)
    .catch((error) => handleError(error));
};

const makeUrlLine = (url, srcLine) => new URL(srcLine, url).href;

const isDomainLocal = (url, currentUrl) => {
  const localDomain = new URL(url).host;
  const currentDomain = new URL(currentUrl).host;
  return currentDomain === localDomain;
};

const downloadAssets = (domain, data, dirWithAssets) => {
  const tags = [
    { tag: 'link', href: 'href' },
    { tag: 'img', href: 'src' },
    { tag: 'script', href: 'src' },
  ];

  const $ = cheerio.load(data); // take HTML page
  const allLocalLinks = tags.map(({ tag, href }) => $(tag).map((i, el) => { // select all tags
    const url = makeUrlLine(domain, $(el).attr(href));
    if (isDomainLocal(domain, url)) { // if domain of a href is local return task object for List
      const newUrl = ($(el).attr('rel') === 'canonical') ? url.concat('.html') : url;
      return { // object for List lib
        title: url,
        task: () => loadData(newUrl, dirWithAssets).then((res) => { // and download data from href
          const newFilePathName = res;
          $(el).attr(href, newFilePathName); // and replace old url into new file path
        }),
      };
    }
    return []; // if domain isn't local return an empty array;
  }).get());

  const tasks = allLocalLinks.flat(); // get rid of all empty arrays

  return Promise.all([
    new Listr(tasks, { concurrent: true, exitOnError: false }).run().catch(() => {}),
  ]).then(() => $.html()); // return new html page
};

export { downloadAssets, buildName };
