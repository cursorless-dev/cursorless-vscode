{
  key = if a then b else c;
  key =
    if a
    then b
    else c;

  a = b; # Inline comment (test)
  b = c; # Inline comment 2
  a = 1 + 1;
  a = a/b/c ? 0;
  a = b: b + 1;

  foo = let
    a = b;
    c = d;
  in
    {
      output = b;
    };

  bar = let
    a = 1;
    b = 2;
  in a + b;

  bar =
    with key;
    let
      a = key;
    in
      a;

  a = x: x + 1;
  b = x: y: x + y + 1;
}
