module.exports = (test) => {
  test('All bad tests', (t) => {
    t.fail('BAAD');
    t.fail('BAAAD');
    t.fail('BAAAAD');
    t.fail('BAAAAAD');
    t.fail('BAAAAAAD');
  });
};
