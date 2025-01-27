one :: Integer
one = 1

type MyInt = Int

fib :: Integer -> Integer
fib 0 = 0
fib 1 = 1
fib n = fib (n-1) + fib (n-2)

not True = False
not False = True

wot True = 1
wot False = crash
    where
        crash = undefined

zot = undefined

pot :: a
pot =
    let kettle = undefined
    in kettle

lot = undefined

type MyDouble = Double

dot = undefined
