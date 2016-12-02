'use strict';

const color = require('chalk');
const test = require('./test');
const tools = require('./tools');


const settings = {
  HIDE_ERROR_REPORT: 64
};

module.exports = (detailLevel) => {
  const start = process.hrtime();
  const rootPad = 1;

  let currTest = null;

  return {
    tests: [],

    test(name) {
      let t;

      if(currTest) {
        t = currTest.child(name);
      } else {
        t = test(rootPad, name);
        this.tests.push(t);
      }

      currTest = t;
      return t;
    },

    currTest() { return currTest; },

    endTest() {
      if(currTest) {
        const output = !currTest.parent ? currTest.write(detailLevel) : null;
        currTest = currTest.parent || null;
        return output;
      }
    },

    summary() {
      const end = process.hrtime(start);
      const pad1 = tools.padding(rootPad);

      const hideErrorReports = (detailLevel & settings.HIDE_ERROR_REPORT) > 0;

      let output = [];

      const data = this.tests.reduce((data, testcase) => {
        data.total += testcase.total();
        data.pass += testcase.totalPassed();
        data.fail += testcase.totalFailed();
        if(!hideErrorReports) {
          data.reports.push(testcase.write(
            testcase.settings.HIDE_VALID +
            testcase.settings.HIDE_COMMENT
          ));
        }

        return data;
      }, { total: 0, pass: 0, fail: 0, reports: [] });

      const separator = `${pad1}${color.gray(tools.fill('-', 50))}\n`;

      output.push(separator);

      if((data.total !== data.pass && data.total !== data.fail) || !data.total) {
        output.push(`${pad1}  Total:    ${data.total}`);
      }

      if(data.pass) { output.push(`${pad1}${tools.pass(`Passing:  ${data.pass}`)}`); }
      if(data.fail) { output.push(`${pad1}${tools.fail(`Failing:  ${data.fail}`)}`); }

      output.push(color.cyan(`${pad1}  Duration: ${end.join('.')} sec`));

      output = `\n${output.join('\n')}`;

      if(data.reports.length) {
        output = `${output}\n\n${separator}\n\n${data.reports.join('\n\n')}`;
      }

      return `${output}\n`;
    }
  };
};
