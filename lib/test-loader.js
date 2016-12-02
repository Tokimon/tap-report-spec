const glob = require('glob-promise');
const yargs = require('yargs');

const args = yargs.argv;
const test = require(args._[1]).test;

glob(args._[0])
  .then((files) => files.forEach((file) => {
    require(file)(test);
  }));
