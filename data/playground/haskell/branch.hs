data a :*: b = a :*: b
type a :+: b = Either a b

fst :: a :*: b -> a
fst (a :*: b) = a

pair a b = a :*: b

fromLeft :: a :+: b -> a
fromLeft (Left a) = a
fromLeft _ = undefined

fib :: Integer -> Integer
fib 0 = 0
fib 1 = 1
fib n = fib (n-1) + fib (n-2)

abs :: Int -> Int
abs x
    | x >= 0    =  x
    | otherwise = -x

bap :: Int -> Int
bap x
    | x > 0, x == 0 =  x
    | otherwise = -x

compare :: Int -> Int -> Ordering
compare x y
    | x <  y = LT
    | x == y = EQ
    | x  > y = GT

fromEither :: (a -> c) -> (b -> c) -> Either a b -> c
fromEither f g x = case x of
    Left  l -> f l
    Right r -> g r

someFunction x (y1 : y2 : ys) (a, b, (c, [d])) = undefined

compose :: (a -> b) -> (b -> c) -> (a -> c)
compose f g x = g (f x)

zipWith :: (a -> b -> c) -> [a] -> [b] -> [c]
zipWith f [] [] = []
zipWith f (x : xs) (y : ys) = f x y : zipWith f xs ys
