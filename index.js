import fs from 'fs';
import * as cheerio from 'cheerio';
import Listr from 'listr';
import { before } from './__fixtures__/html.js';

const makeSrcLine = (url, srcLine) => new URL(srcLine, url).href;

const isDomainLocal = (url, currentUrl) => {
  const localDomain = new URL(url).host;
  const currentDomain = new URL(currentUrl).host;
  return currentDomain === localDomain;
};
const load = (url) => new Promise((resolve) => {
  setTimeout(() => resolve('bla, bla'), 3000);
});

const tags = [
  { tag: 'img', href: 'src' },
  { tag: 'link', href: 'href' },
  { tag: 'script', href: 'src' },
];
const getAllLocalTags = (file) => {
  const $ = cheerio.load(file);
  const domain = 'https://ru.hexlet.io';
  const result = tags.map(({ tag, href }) => $(tag).map((i, el) => {
    const oldSrc = makeSrcLine(domain, $(el).attr(href));
    // console.log(oldSrc, isDomainLocal(domain, oldSrc));
    console.log(oldSrc, isDomainLocal(domain, oldSrc));
    if (isDomainLocal(domain, oldSrc)) {
      return {
        title: oldSrc,
        task: () => load(oldSrc).then((res) => {
          $(tag).attr(href, res);
        }),
      };
    }
    return [];
  }).get());
  const tasks = result.flat();
  return Promise.all([
    new Listr(tasks, { concurrent: true, exitOnError: false }).run().catch(() => {}),
  ]).then(() => $.html());
};
getAllLocalTags(before);
