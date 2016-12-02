module.exports = (test) => {
  test('Second reporter test', (t) => {
    t.pass('Successfull test');
    t.fail('Failing test');
    t.threw && t.threw('Throwing test');
    t.end();
  });
};
