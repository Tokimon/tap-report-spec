'use strict';

const nPath = require('path');
const spawn = require('child_process').spawn;
const yargs = require('yargs');
const stream = require('stream');
const duplexer = require('duplexer2');

yargs
  .option('test', {
    alias: 't',
    type: 'array',
    describe: 'Which test to run (name without extension)',
    default: '*'
  })
  .option('runner', {
    alias: 'r',
    type: 'string',
    describe: 'Which test runner to use',
    choices: ['tape', 'tap'],
    default: 'tap'
  })
  .option('detail', {
    alias: 'd',
    type: 'array',
    describe: `What to show in the report (can be combined)
0: hide error details
1: hide validated tests
2: hide asserts
3: hide child reports
4: hide comments
5: hide test names
6: hide summary error reports`,
    default: 6
    // choices: [0, 1, 2, 3, 5, 6]
  })
  .help()
  .alias('help', 'h');

const args = yargs.argv;

const parser = require(`./lib/${args.runner}-test-parser`);

let failed = false;

const levels = [1, 2, 4, 8, 16, 32, 64];

const detailLevel = args.detail
  .filter((val) => !(isNaN(val) || val < 0 || val > levels.length))
  .reduce((a, b) => a + levels[b], 0);



const out = stream.PassThrough();
const tapper = parser(detailLevel, (output) => out.push(output), () => { failed = true; });



let files = args.test;
if(!files.length) { files = ['*']; }

files = files.length > 1 ? `@(${files.join('|')})` : files[0];

const loader = spawn('node', ['./lib/test-loader.js', nPath.resolve(`test/${files}.js`), args.runner]);

loader.stdout.on('data', (data) => {
  process.stdin.push(`${data}`);
});

loader.stderr.on('data', (data) => {
  console.error(`${data}`);
});

loader.on('close', (code) => {
  process.exit(code);
});

process.stdin
  .pipe(duplexer(tapper, out))
  .pipe(process.stdout);
