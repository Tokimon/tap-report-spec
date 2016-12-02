const tapParser = require('tap-parser');
const reporter = require('./reporter');

// TODO connect with output

function eventBinder(parser, report, write, fail) {
  parser.on('child', (childParser) => {
    eventBinder(childParser, report, write, fail);
  });

  parser.on('comment', (name) => {
    name = name.replace(/^#\s+|[\n\s]+$/g, '');
    if(/^(tests|pass|fail)/.test(name)) { return; }
    if(/^time/.test(name)) {
      write(report.summary());
      return;
    }

    report.test(name.replace('Subtest: ', ''));
  });

  parser.on('assert', (assertion) => {
    const test = report.currTest();
    if(!test || assertion.time) { return; }

    const data = Object.assign({
      id: assertion.id,
      name: assertion.name
    }, assertion.diag);

    if(assertion.ok) {
      test.pass(data);
    } else {
      test.fail(data);
    }
  });

  parser.on('extra', (comment) => {
    const test = report.currTest();

    if(test) {
      test.comment(comment);
    } else {
      write(comment);
    }
  });

  parser.on('complete', (done) => {
    const out = report.endTest();
    out && write(`\n${out}`);
  });
}


module.exports = (detailLevel, write, fail) => {
  const parser = tapParser();
  const report = reporter(detailLevel);

  eventBinder(parser, report, write, fail);

  return parser;
};
