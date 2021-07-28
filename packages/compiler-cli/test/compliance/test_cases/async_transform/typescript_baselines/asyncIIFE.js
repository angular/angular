function f1() {
    function* anonymous_generator() {
        yield 10;
        throw new Error();
    }
    (() => Zone.__awaiter(this, [], anonymous_generator))();
    var x = 1;
}
