import path from 'path';

const fullFilePath = '/tmp/page-loader-mbkhac/ru-hexlet-io-courses_files/file_example.html';
const rootDir = path.dirname(fullFilePath);
// const relativeFilePath = path.parse(fullFilePath).dir;
// console.log(path.parse(rootDir));
console.log(path.parse(rootDir));
