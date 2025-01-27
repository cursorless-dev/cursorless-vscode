{
    a = { a = b; c = d; };
    a = {
        a = b;
        c = d;
    };

    a = {
        a = {
            b = 1; };

        c = { d = [ "1" 2 ] };
    };

    a = rec {
        a = b;
        b = a + 1;
    };
}
