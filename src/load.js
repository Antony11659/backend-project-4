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

const loadUrl = (url, newUrl, localPath) => new Promise((resolve) => {
  const data = axios.get(url, { responseType: 'stream' });
  resolve(data);
}).then((response) => {
  const imageFile = path.join(localPath, newUrl);
  // fs.promises.writeFile(imageFile, response.data);
})
  .catch((err) => new Error(err));

const downloadResource = (domain, data, dirWithRes) => {
  const $ = cheerio.load(data);
  // $('img').each(function () {
  //   const oldSrc = $(this).attr('src');
  //   // const newSrc = path.join(localPath, generateImageName(oldSrc));
  //   const newSrc = '/assets/professions/nodejs.png';
  //   loadUrl(oldSrc, generateImageName(oldSrc), localPath); // newSrc should be here
  //   $(this).attr('src', newSrc);
  // });

  // SELECT ALL RESOURCES
  $('img').each(function () {
    const oldSrc = $(this).attr('src');
    const newSrc = isSrcLocal(domain, oldSrc) ? path.join(dirWithRes, buildName(oldSrc)) : oldSrc;
    $(this).attr('src', newSrc);
  });
  $('script').each(function () {
    const oldSrc = $(this).attr('src');
    const newSrc = isSrcLocal(domain, oldSrc) ? path.join(dirWithRes, buildName(oldSrc)) : oldSrc;
    $(this).attr('src', newSrc);
  });
  $('link').each(function () {
    const oldSrc = $(this).attr('href');
    const canonical = $(this).attr('rel') === 'canonical';
    const newName = isSrcLocal(domain, oldSrc) ? path.join(dirWithRes, buildName(oldSrc)) : oldSrc;
    const newSrc = canonical ? path.join(dirWithRes, buildName(domain, '.html')) : newName;
    $(this).attr('href', newSrc);
  });
  console.log($.html());
};

const downloadPage = (url, dir = process.cwd()) => {
  const filePath = path.join(dir, buildName(url, '.html'));
  const dirResource = path.join(dir, buildName(url, '_files'));

  return new Promise((resolve) => {
    const data = axios.get(url);
    // fs.promises.mkdir(imageDir);
    resolve(data);
  })
    .then((response) => downloadResource(url, response.data, dirResource))
    // .then((response) => {
  // console.log(response);
  // fs.promises.writeFile(filePath, response);
  // console.log(filePath);
  // return filePath;
    // })
    .catch((err) => {
      throw new Error(err.message);
    });
};

// downloadPage(testURL);
console.log(buildName("https://assets/professions/nodejs.png"));
// export default downloadPage;
// 1) <link href="/courses" rel="canonical">  =>  <link href="-courses.css" rel="canonical">
//  something is wrong with generating the name
// (should be <link href="ru-hexlet-io-courses_files/ru-hexlet-io-courses.html" rel="canonical">)
// 2) To load all resources
// 3) make tests
