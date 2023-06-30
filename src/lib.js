import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

// const require = createRequire(import.meta.url);
// require('axios-debug-log');
// const axios = require('axios');

const isSrcLocal = (url, src) => {
  const domain = new URL(url).hostname;
  const srcDomain = new URL(src, url).hostname;
  return domain === srcDomain;
};

const buildName = (address, type) => {
  const addressElements = path.parse(address);
  const { dir, ext, name } = addressElements;
  const addressWithoutProtocol = dir.replace(/^(\/|^https?:\/\/)/, '').concat('/', '');
  const result = addressWithoutProtocol.split(/[./]/g).join('-');
  const extension = type ?? ext;
  return result.concat(name, extension);
};

const loadUrl = (resources) => {
  const { url, filePath } = resources;
  new Promise((resolve) => {
    const data = url; // const data = axios.get(url, { responseType: 'stream' });
    resolve(data);
  }).then((response) => {
    fs.promises.writeFile(filePath, response);
  }).catch((err) => {
    throw new Error(err.message);
  });
};

const downloadResources = (domain, data, dirWithRes) => {
  const $ = cheerio.load(data);
  const tags = [{ tag: 'img', href: 'src' }, { tag: 'link', href: 'href' }, { tag: 'script', href: 'src' }];
  const resources = tags.reduce((acc, el) => {
    const { tag, href } = el;
    $(tag).each(function () {
      const oldSrc = $(this).attr(href);
      const canonical = $(this).attr('rel') === 'canonical';
      const localDomain = isSrcLocal(domain, oldSrc);
      const newName = localDomain ? path.join(dirWithRes, buildName(oldSrc)) : oldSrc;
      const newSrc = canonical ? path.join(dirWithRes, buildName(domain, '.html')) : newName;
      $(this).attr(href, newSrc);
      if (oldSrc !== newSrc) {
        acc.push({ url: oldSrc, filePath: newSrc });
      }
    });
    return acc;
  }, []);
  Promise.all(resources.map((el) => loadUrl(el)));
  return $.html();
};

export { downloadResources, buildName };
