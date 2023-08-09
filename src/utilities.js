import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { createRequire } from 'module';
import handleError from '../errors/errorHandler.js';

const require = createRequire(import.meta.url);
require('axios-debug-log');
const axios = require('axios');

const dirExists = (dirPath) => new Promise((resolve) => {
  resolve(fs.promises.access(dirPath));
})
  .then(() => true)
  .catch(() => false);

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
  return new Promise((resolve) => {
    const data = axios.get(url, { responseType: 'stream' }).catch((error) => handleError('NETWORK', error));
    resolve(data);
  })
    .then((response) => {
      fs.promises.writeFile(fullFilePath, response.data).catch((error) => handleError('FILE_SYSTEM', error));
    })
    .then(() => relativeFilePath)
    .catch((error) => handleError('FILE_SYSTEM', error));
};

const makeSrcLine = (url, srcLine) => new URL(srcLine, url).href;

const isLocalDomain = (url, currentUrl) => {
  const localDomain = new URL(url).host;
  const currentDomain = new URL(currentUrl).host;
  return currentDomain === localDomain;
};

const downloadAssets = (domain, data, dirWithAssets) => {
  const tags = [
    { tag: 'img', href: 'src' },
    { tag: 'link', href: 'href' },
    { tag: 'script', href: 'src' },
  ];

  const $ = cheerio.load(data);
  // select all local links from the html page
  const allLocalLinks = tags.reduce((acc, { tag, href }) => {
    $(`${tag}[${href}]`).each((_, el) => {
      // make from srcLine the whole url
      const url = makeSrcLine(domain, el.attribs[href]);
      if (isLocalDomain(domain, url)) {
        // if 'rel'='canonical' is present add to this URL '.html' type to create
        //  a more correct name for the file
        const newUrl = ($(el).attr('rel') === 'canonical') ? url.concat('.html') : url;

        const promise = loadData(newUrl, dirWithAssets).then((res) => {
          const filePathName = res;
          $(el).attr(href, filePathName);
        });
        acc.push(promise);
      }
    });
    return acc;
  }, []);

  return Promise.all(allLocalLinks).then(() => $.html());
};

export { downloadAssets, buildName, dirExists };
