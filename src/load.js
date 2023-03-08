import fs from 'fs';
import axios from 'axios';
import path from 'path';

const makeFileName = (file) => {
  const [, addressWithoutProtocol] = file.split('//');
  const result = addressWithoutProtocol.split(/[./]/g).join('-');
  return result.concat('.html');
};

const pageLoader = (dir, url) => {
  const filePath = path.join(dir, makeFileName(url));
  axios.get(url)
    .then((response) => fs.writeFile(filePath, response.data, () => console.log(filePath)));
};
export default pageLoader;