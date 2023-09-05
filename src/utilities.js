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
    { tag: 'img', href: 'src' },
    { tag: 'link', href: 'href' },
    { tag: 'script', href: 'src' },
  ];

  const $ = cheerio.load(data);
  // select all local links from the html page
  const allLocalLinks = tags.reduce((acc, { tag, href }) => {
    $(`${tag}[${href}]`).each((_, el) => {
      // make from srcLine the whole url
      const url = makeUrlLine(domain, el.attribs[href]);
      if (isDomainLocal(domain, url)) {
        // if 'rel'='canonical' is present add to this URL '.html' type
        const newUrl = ($(el).attr('rel') === 'canonical') ? url.concat('.html') : url;
        const newFilePath = loadData(newUrl, dirWithAssets).then((res) => {
          const filePathName = res;
          $(el).attr(href, filePathName);
        });
        acc.push(newFilePath);
      }
    });
    return acc;
  }, []);

  return Promise.all(allLocalLinks).then(() => $.html());
};

export { downloadAssets, buildName };
