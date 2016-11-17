'use strict';

const tapOut = require('tap-parser');
const through = require('through2');
const duplexer = require('duplexer');
const format = require('chalk');
const _ = require('lodash');
const symbols = require('figures');

module.exports = function(spec) {
  spec = spec || {};

  const OUTPUT_PADDING = spec.padding || '  ';

  const output = through();
  const parser = tapOut();
  const stream = duplexer(parser, output);
  const startTime = process.hrtime();

  const errorSummary = {};
  let currTest = '';

  output.push('\n');

  parser.on('comment', function(comment) {
    comment = comment.replace(/^#\s+|[\n\s]+$/g, '');
    if(/^(tests|pass|fail)/.test(comment)) { return; }
    output.push('\n' + pad(format.underline(comment)) + '\n\n');

    currTest = comment;
    errorSummary[currTest] = [];
  });

  parser.on('assert', function(assertion) {
    if(assertion.skip || assertion.todo) { return; }

    const name = assertion.name;

    if(assertion.ok) {
      // Passing assertions
      const glyph = format.green(symbols.tick);

      output.push(pad('  ' + glyph + ' ' + format.dim(name) + '\n'));
    } else {
      // Failing assertions
      const glyph = symbols.cross;
      const title = glyph + ' ' + name;
      const raw = format.cyan(prettifyError(assertion.diag));
      const divider = _.fill(
        new Array((title).length + 1),
        '-'
      ).join('');

      errorSummary[currTest].push(name);

      output.push('\n' + pad('  ' + format.red(title) + '\n'));
      output.push(pad('  ' + format.red(divider) + '\n'));
      output.push(raw);

      markFailed();
    }
  });

  parser.on('extra', function(comment) {
    output.push(pad('  ' + format.yellow(comment.raw)) + '\n');
  });

  // All done
  parser.on('complete', function(results) {
    output.push('\n\n');

    // Most likely a failure upstream
    if(results.plan.end < 1) {
      return markFailed();
    }

    if(results.fail > 0) {
      output.push(formatErrors(results));
      output.push('\n');
      markFailed();
    }

    output.push(formatTotals(results));
    output.push('\n\n\n');

    // Exit if no tests run. This is a result of 1 of 2 things:
    //  1. No tests were written
    //  2. There was some error before the TAP got to the parser
    if(results.count === 0) {
      markFailed();
    }
  });

  // Utils

  function markFailed() {
    stream.failed = true;
  }

  function prettifyError(diag) {
    return pad(`operator: ${diag.operator}\n`, 3) +
      pad(`expected: ${diag.expected}\n`, 3) +
      pad(`actual: ${diag.actual}\n`, 3) +
      pad(`at: ${diag.at}\n\n`, 3);
  }

  function formatErrors(results) {
    const failCount = results.fail;
    const past = (failCount === 1) ? 'was' : 'were';
    const plural = (failCount === 1) ? 'failure' : 'failures';

    let out = '\n' + pad(format.red.bold('Failed Tests:') + ' There ' + past + ' ' + format.red.bold(failCount) + ' ' + plural + '\n');
    out += formatFailedAssertions(results);

    return out;
  }

  function formatTotals(results) {
    if(results.count === 0) {
      return pad(format.red(symbols.cross + ' No tests found'));
    }

    const end = process.hrtime(startTime);

    return _.filter([
      pad('total:     ' + results.count),
      pad(format.green('passing:   ' + results.pass)),
      results.fail > 0 ? pad(format.red('failing:   ' + results.fail)) : undefined,
      pad(`duration: ${end.join('.')} sec`)
    ], _.identity).join('\n');
  }

  function formatFailedAssertions(results) {
    let out = '';

    for(const test in errorSummary) {
      const errors = errorSummary[test];
      if(!errors.length) { continue; }

      out += '\n' + pad('  ' + test + '\n\n');

      _.each(errors, function(name) {
        out += pad('    ' + format.red(symbols.cross) + ' ' + format.red(name)) + '\n';
      });
    }

    return out;
  }

  function pad(str, times) {
    if(!times) { times = 1; }

    return _.fill(new Array(times), OUTPUT_PADDING).join('') + str;
  }

  return stream;
};
