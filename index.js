import fs from 'fs';
import Listr from 'listr';

const readFIle = (filePath) => new Promise((resolve, reject) => {
  fs.promises.readFile(filePath, 'utf8').then(() => {
    resolve('done');
  }).catch((err) => {
    reject(err);
  });
});

const files = ['./README.md', './package.json'];

Promise.all(files.map((el) => {
  const task = new Listr([
    {
      title: `read ${el} file`,
      task: () => readFIle(el),
    },
  ]);

  return task.run().catch((err) => {
    console.error(err);
  });
})).then(() => console.log('All files read successfully'));
