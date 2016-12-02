module.exports = (test) => {
  test('Spec reporter test', (t) => {
    t.ok(false, 'Failing test');
    t.ok(true, 'Successfull test');
    t.ok(true, 'Successfull test');
    t.ok(false, 'Failing test');

    t.test('Child test 1', (t2) => {
      t2.plan(2);
      t2.ok(false, 'After CHILD - Failing test');
      t2.ok(true, 'After CHILD - Successfull test');
    });

    t.ok(false, 'Failing test');
    t.ok(true, 'Successfull test');
    t.ok(true, 'Successfull test');

    t.test('Child test 2', (t2) => {
      t2.ok(true, 'Successfull test');
      t2.ok(true, 'Successfull test');

      t2.test('Child Child test', (t3) => {
        t3.plan(3);

        t3.ok(true, 'Successfull test');
        t3.ok(false, 'Failing test');
        t3.ok(true, 'Successfull test');
      });

      t2.ok(false, 'After CHILD - Failing test');
      t2.ok(true, 'After CHILD - Successfull test');

      t2.end();
    });

    console.log('Some comment');

    t.end();
  });

  test('Subsequent test', (t) => {
    t.plan(1);
    t.ok('TADAAA!');
  });
};
