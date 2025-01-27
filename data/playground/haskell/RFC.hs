-- RFC 1: What should "arg" match?
fst :: (a, b) -> a
fst tup@(x, y) = x
--  ^^^^^^^^^^     <- 🎉 the whole pattern
--  ^^^            <- 👀 only the name of the whole argument, if given
--  ^^^  ^  ^      <- 🚀 all names in the pattern

-- RFC 2: What should "branch" match?
foo = bar
  where
    bar = 1
--   🎉 `foo = bar` and `bar = 1`
--   👀 `foo = bar where bar = 1`
--   🚀 `foo = bar where bar = 1` and `bar = 1`

-- RFC 3: What should "condition" match?
bap :: Int -> Int
bap | 1 == 1, 2 == 2 = undefined
--   🎉 `1 == 1` and `2 == 2`
--   👀 `1 == 1, 2 == 2`
