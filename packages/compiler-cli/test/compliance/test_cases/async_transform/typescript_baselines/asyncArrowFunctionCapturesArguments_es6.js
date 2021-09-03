class C {
    method() {
        const ɵarguments = arguments;

        function other() { }

        var asyncArrow = (foo) => Zone.__awaiter(this, [foo], function* asyncArrow_generator(foo) {
            yield foo;
            yield other.apply(this, ɵarguments);
        });

        const localArgs = arguments;

        const syncArrow = (foo) => {
            other.apply(this, arguments);
        };
    }
}