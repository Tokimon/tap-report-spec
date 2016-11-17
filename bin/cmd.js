#!/usr/bin/env node

const tapSpec = require('../')();

process.stdin
  .pipe(tapSpec)
  .pipe(process.stdout);

process.on('exit', (status) => {
  if(status === 1 || tapSpec.failed) { process.exit(1); }
});
