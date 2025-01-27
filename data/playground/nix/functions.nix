{
  # Anonymous function
  a = foo: (foo + 1);
  x = a: b: a + b;

  # Non-built-in function
  ba = test( foo: bar: {
    b = foo;
  });

  # Built-in function
  x = map (x: y: x + x) [ 1 2 3 ];
}
