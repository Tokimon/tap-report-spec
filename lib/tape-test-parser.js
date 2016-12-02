const tapOut = require('tap-out');
const reporter = require('./reporter');

// TODO connect with output

module.exports = (write, fail) => {
  const parser = tapOut();
  const report = reporter();

  parser.on('test', (comment) => {
    report.testEnd();
    report.test(comment);
  });

  parser.on('assert', (assertion) => {
    const data = Object.assign({
      id: assertion.id,
      name: assertion.name
    }, assertion.diag);

    const test = report.currTest();

    if(assertion.ok) {
      test.pass(data);
    } else {
      test.fail(data);
    }
  });

  parser.on('comment', (text) => {
    report.currTest().comment(text.raw);
  });

  parser.on('output', () => {
    report.summary();
  });

  return parser;
};
