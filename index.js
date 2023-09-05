import fs from 'fs';
import * as cheerio from 'cheerio';
import Listr from 'listr';
import { url } from 'inspector';
import { before } from './__fixtures__/html.js';

const makeSrcLine = (url, srcLine) => new URL(srcLine, url).href;
const load = (url) => new Promise((resolve) => {
  setTimeout(() => resolve('bla, bla'), 3000);
});

const getAllLocalTags = (file) => {
  const $ = cheerio.load(file);
  const tags = [
    { tag: 'img', href: 'src' },
    { tag: 'link', href: 'href' },
    { tag: 'script', href: 'src' },
  ];

  const result = tags.map((el) => {
    const { tag, href } = el;
    const urls = $(tag).map(() => {
      const oldSrc = makeSrcLine('https://hexlet.io', $(tag).attr(href));
      return {
        title: `read ${oldSrc} file`,
        task: () => load(oldSrc).then((res) => {
          $(tag).attr(href, res);
        }),
      };
    }).get();
    return urls;
  });
  const tasks = result.flat();

  const listr = new Listr(tasks, { concurrent: true });
  return new Promise((resolve) => {
    resolve(listr.run());
  }).then(() => console.log($.html()));
};
getAllLocalTags(before);
// const readFIle = (filePath) => new Promise((resolve, reject) => {
//   fs.promises.readFile(filePath, 'utf8').then(() => {
//     resolve('done');
//   }).catch((err) => {
//     reject(err);
//   });
// });

// const files = ['./README.md', './package.json'];

// Promise.all(files.map((el) => {
//   const task = new Listr([
//     {
//       title: `read ${el} file`,
//       task: () => readFIle(el),
//     },
//   ]);

//   return task.run().catch((err) => {
//     console.error(err);
//   });
// })).then(() => console.log('All files read successfully'));
