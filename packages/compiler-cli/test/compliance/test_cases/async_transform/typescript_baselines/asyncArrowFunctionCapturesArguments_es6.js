class C {
    method() {
        const ɵarguments = arguments;
        function* asyncArrow_generator(foo) {
            yield foo;
            yield other.apply(this, ɵarguments);
        }

        function other() { }

        var asyncArrow = (foo) => Zone.__awaiter(this, [foo], asyncArrow_generator);

        const localArgs = arguments;

        const syncArrow = (foo) => {
            other.apply(this, arguments);
        };
    }
}