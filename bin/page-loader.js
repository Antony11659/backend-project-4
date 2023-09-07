#!/usr/bin/env node
import { program } from 'commander';
import debug from 'debug';
import pageLoad from '../src/load.js';

program
  .name('Usage: page-loader [options] <url>')
  .description('Page loader utility')
  .version('1.0.0')
  .option('-o, --output [dir]', 'output dir (default: "/home/user/current-dir"')
  .option('-d, --debug', 'enable debug console')
  .action(() => {
    const dir = program.opts().output;
    if (program.opts().debug) {
      debug.enable('page-loader, axios');
    }
    const url = program.args[0];
    return pageLoad(url, dir)
      .then((res) => {
        console.log(`Page was successfully downloaded into ${res}`);
      })
      .catch((error) => {
        console.error(`${error.message} while downloading the page ${url}`);
        process.exit(1);
      });
  })
  .parse(process.argv);
