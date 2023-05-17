import fs from 'fs';
import axios from 'axios';
import path from 'path';
import process from 'process';
import * as cheerio from 'cheerio';

const buildName = (file, type) => {
  const [, addressWithoutProtocol] = file.split('//');
  const result = addressWithoutProtocol.split(/[./]/g).join('-');
  return result.concat(type);
};

const generateImageName = (url) => 'ru-hexlet-io-assets-professions-nodejs.png'; 

const loadUrl = (url, newUrl, localPath) => new Promise((resolve) => {
  const data = axios.get(url, { responseType: 'stream' });
  resolve(data);
}).then((response) => {
  const imageFile = path.join(localPath, newUrl);
  fs.promises.writeFile(imageFile, response.data);
})
  .catch((err) => new Error(err));

const downloadImage = (data, localPath) => {
  const $ = cheerio.load(data);
  $('img').each(function () {
    const oldSrc = $(this).attr('src');
    // const newSrc = path.join(localPath, generateImageName(oldSrc));
    const newSrc = '/assets/professions/nodejs.png';
    loadUrl(oldSrc, generateImageName(oldSrc), localPath); // newSrc should be here
    $(this).attr('src', newSrc);
  });
  return $.html();
};

const downloadPage = (url, dir = process.cwd()) => {
  const filePath = path.join(dir, buildName(url, '.html'));
  const imageDir = path.join(dir, buildName(url, '_files'));

  return new Promise((resolve) => {
    const data = axios.get(url);
    fs.promises.mkdir(imageDir);
    resolve(data);
  })
    .then((response) => downloadImage(response.data, imageDir))
    .then((response) => {
      fs.promises.writeFile(filePath, response);
      console.log(filePath);
      return filePath;
    })
    .catch((err) => {
      throw new Error(err.message);
    });
};

// downloadPage('https://ru.hexlet.io/courses ');
export default downloadPage;
