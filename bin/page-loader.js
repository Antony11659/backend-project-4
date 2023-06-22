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
    debug.enable('loadData');
    const url = program.args[0];
    return pageLoad(url, dir);
  })
  .parse(process.argv);
