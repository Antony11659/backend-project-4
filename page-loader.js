#!usr/bin/env node
import { program } from "commander";

program
  .name('Usage: page-loader [options] <url>')
  .description('Page loader utility')
  .version("1.0.0")
  .option('-o, --output [dir]', 'output dir (default: "/home/user/current-dir"')
  .parse(process.argv);