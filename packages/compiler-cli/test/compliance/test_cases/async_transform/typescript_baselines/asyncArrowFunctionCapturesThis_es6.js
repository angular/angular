class C {
    method() {
        function* fn_generator() { return yield this; }
        var fn = () => Zone.__awaiter(this, [], fn_generator);
    }
}
