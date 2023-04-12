import fs from 'fs';
import axios from 'axios';
import path from 'path';
import process from 'process';

const makeFileName = (file) => {
  const [, addressWithoutProtocol] = file.split('//');
  const result = addressWithoutProtocol.split(/[./]/g).join('-');
  return result.concat('.html');
};

const pageLoad = (dir = process.cwd(), url) => {
  const filePath = path.join(dir, makeFileName(url));
  return new Promise((resolve) => {
    const data = axios.get(url);
    resolve(data);
  })
  .then((response) => {
    return fs.promises.writeFile(filePath, response.data);
  })
  .then(() => {
    console.log(filePath)
    return filePath;
  })
  .catch((err) => {
    throw new Error(err.message);
  });
};

export default pageLoad;