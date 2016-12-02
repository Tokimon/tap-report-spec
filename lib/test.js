  'use strict';

  const color = require('chalk');
  const tools = require('./tools');

  const passed = (text) => `${tools.pass()} ${text}`;
  const failed = (text) => `${tools.fail()} ${text}`;

  function formatFail(pad, assertion, hideDetails) {
    let title = assertion.name || '[Unspecified error]';
    pad = tools.padding(pad + 1);

    const line = tools.fill('-', title.length + 2);
    title = `${pad}${tools.fail(title)}`;

    if(hideDetails) { return `${title}\n`; }

    const output = [`${title}`, line];

    if(assertion.operator) { output.push(color.cyan(`Operator: ${assertion.operator}`)); }
    if(assertion.expected) { output.push(color.cyan(`Expected: ${assertion.expected}`)); }
    if(assertion.actual) { output.push(color.cyan(`Actual: ${assertion.actual}`)); }

    if(assertion.source) { output.push(color.cyan(`Source: ${assertion.source.replace(/(\n\r?)+$/, '')}`)); }

    const at = assertion.at;

    if(at) {
      if(typeof at === 'object') {
        output.push(color.cyan(`At: ${at.file} (${at.line}:${at.column})`));
      } else {
        output.push(color.cyan(`At: ${at}`));
      }
    }

    if(assertion.stack) {
      output.push(color.cyan('Stack trace:'));

      const stack = assertion.stack
      .replace(/(\n\r?)+$/, '')
      .split(/\n\r?/)
      .map((line) => `${tools.padding(1)}${line}`);

      output.push(color.gray(stack.join('\n')));
    }

    output.push(line);

    return output.join('\n').replace(/(\n\r?)/g, `$1${pad}`) + '\n';
  }

  function formatPass(pad, assertion) {
    return `${tools.padding(pad + 1)}${tools.pass(assertion.name)}\n`;
  }

  function formatComment(pad, comment) {
    return `${tools.padding(pad + 1)}${color.yellow(comment)}\n`;
  }



/**
 * 1  hide assert details
 * 2  hide validated tests
 * 4  hide assert reporting
 * 8  hide child reports
 * 16 hide comments
 * 32 hide test names
 */
  const settings = {
    HIDE_DETAIL: 1,
    HIDE_VALID: 2,
    HIDE_ASSERT: 4,
    HIDE_CHILD: 8,
    HIDE_COMMENT: 16,
    HIDE_NAME: 32,

    flow: {
      FAIL: 0,
      PASS: 1,
      CHILD: 2,
      COMMENT: 3
    }
  };



  module.exports = function test(padding, name, parent) {
    return {
      name,
      settings,
      parent: parent || null,
      flow: [], // 0=fail, 1=pass, 2=child, 3=comment
      passed: [],
      failed: [],
      children: [],
      comments: [],

      fail(assertion) {
        this.flow.push(settings.flow.FAIL);
        this.failed.push(assertion);
      },

      pass(assertion) {
        this.flow.push(settings.flow.PASS);
        this.passed.push(assertion);
      },

      child(name) {
        this.flow.push(settings.flow.CHILD);
        const t = test(padding + 1, name, this);
        this.children.push(t);
        return t;
      },

      comment(comment) {
        this.flow.push(settings.flow.COMMENT);
        this.comments.push(comment);
      },

      write(detailLevel) {
        const flowEntries = [
        [this.failed.slice(), formatFail],
        [this.passed.slice(), formatPass],
        [this.children.slice()],
        [this.comments.slice(), formatComment]
        ];



        const hideName = (detailLevel & settings.HIDE_NAME) > 0;
        const hideAssert = (detailLevel & settings.HIDE_ASSERT) > 0;
        const hideValid = (detailLevel & settings.HIDE_VALID) > 0;
        const hideDetail = (detailLevel & settings.HIDE_DETAIL) > 0;
        const hideChild = (detailLevel & settings.HIDE_CHILD) > 0;
        const hideComment = (detailLevel & settings.HIDE_COMMENT) > 0;

        const ignore = [];

        if(hideAssert) { ignore.push(settings.flow.FAIL); }
        if(hideValid || hideAssert) { ignore.push(settings.flow.PASS); }
        if(hideChild) { ignore.push(settings.flow.CHILD); }
        if(hideComment) { ignore.push(settings.flow.COMMENT); }

        let name = color.bold.underline(this.name);

        if(this.isOk()) {
          name = hideValid ? '' : passed(name);
        } else {
          name = failed(name);
        }

        let prevI;

        const output = this.flow
          .filter((i) => ignore.indexOf(i) < 0)
          .reduce((out, i) => {
            const entry = flowEntries[i];
            const item = entry[0].shift();
            const formatter = entry[1];

            const str = formatter
              ? formatter(padding, item, hideDetail)
              : (item.write ? item.write(detailLevel) : '');

            const collapse = [settings.flow.PASS];
            if(hideDetail) { collapse.push(settings.flow.FAIL); }

            let spacing = (collapse.indexOf(i) > -1 && collapse.indexOf(prevI) > -1) || hideAssert
              ? '' : '\n';

            out.push(spacing + str);
            prevI = i;
            return out;
          }, []).join('');

        if(hideName || !name) { return output; }

        return `${tools.padding(padding)}${name}\n${output}`;
      },

      isOk() {
        return this.totalFailed() === 0;
      },

      total() {
        return this.failed.length +
        this.passed.length +
        this.children.reduce((total, child) => total + child.total(), 0);
      },

      totalPassed() {
        return this.passed.length +
        this.children.reduce((total, child) => total + child.totalPassed(), 0);
      },

      totalFailed() {
        return this.failed.length +
        this.children.reduce((total, child) => total + child.totalFailed(), 0);
      }
    };
  };
