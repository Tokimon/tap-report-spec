module.exports = (test) => {
  test('All skipped test', { skip: true }, (t) => {
    t.pass('Successfull test');
    t.fail('Failing test');
    t.throws && t.throws('Throwing test');
    t.skip('Skipped test');
  });
};
