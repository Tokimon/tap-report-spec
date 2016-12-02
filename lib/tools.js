'use strict';

const format = require('chalk');
const symbol = { pass: '✔', fail: '✖' };

module.exports = {
  symbol,

  fill(char, len) {
    let str = '';
    for(let i = 0; i < len; i++) { str += char; }
    return str;
  },

  padding(spacing) { return this.fill('  ', spacing); },

  pass(text) { return format.green(`${symbol.pass}${text ? ` ${text}` : ''}`); },
  fail(text) { return format.red(`${symbol.fail}${text ? ` ${text}` : ''}`); }
};
