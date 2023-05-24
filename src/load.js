import fs from 'fs';
import axios from 'axios';
import path from 'path';
import process from 'process';
import * as cheerio from 'cheerio';
import nock from 'nock';

const testURL = 'https://ru.hexlet.io/courses';
nock(testURL).get('').reply(200, async () => {
  const data = await fs.promises.readFile('../__fixtures__/before.html', 'utf-8');
  return data;
});

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
const downloadResource = (domain, data, dirWithRes) => {
  const $ = cheerio.load(data);
  const tags = [{ tag: 'img', href: 'src' }, { tag: 'link', href: 'href' }];
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

const downloadPage = (url, dir = process.cwd()) => {
  const filePath = path.join(dir, buildName(url, '.html'));
  const dirResource = path.join(dir, buildName(url, '_files'));

  return new Promise((resolve) => {
    const data = axios.get(url);
    fs.promises.mkdir(dirResource);
    resolve(data);
  })
    .then((response) => downloadResource(url, response.data, dirResource))
    .then((response) => {
      console.log(response);
      fs.promises.writeFile(filePath, response);
      console.log(filePath);
      return filePath;
    })
    .catch((err) => {
      throw new Error(err.message);
    });
};
downloadPage(testURL);
// console.log(buildName('https://assets/professions/nodejs.png'));
// export default downloadPage;

// 2) To load all resources
// 3) make tests
