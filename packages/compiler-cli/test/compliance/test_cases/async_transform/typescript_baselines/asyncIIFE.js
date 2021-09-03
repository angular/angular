function f1() {
    (() => Zone.__awaiter(this, [], function* anonymous_generator() {
        yield 10;
        throw new Error();
    }))();
    var x = 1;
}
