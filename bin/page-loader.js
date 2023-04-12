#!/usr/bin/env node
import { program } from 'commander';
import pageLoad from '../src/load.js';

program
  .name('Usage: page-loader [options] <url>')
  .description('Page loader utility')
  .version('1.0.0')
  .option('-o, --output [dir]', 'output dir (default: "/home/user/current-dir"')
  .action(() => {
    const dir = program.opts().output;
    const url = program.args[0];
    return pageLoad(url, dir);
  })
  .parse(process.argv);
