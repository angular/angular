function* f0_generator() { }
function* f1_generator() { }
function* f3_generator() { }
function* f4_generator() { }
function* f5_generator() { }
function* f6_generator() { }
function* f7_generator() { }
function* f8_generator() { }
function* f9_generator() { }
function* f10_generator() { return p; }
function* f11_generator() { return mp; }
function* f12_generator() { return mp; }
function* f13_generator() { return p; }
function* m1_generator() { }
function* m2_generator() { }
function* m3_generator() { }
function* m4_generator() { }
function* m5_generator() { }
function* m6_generator() { }
function* f14_generator() {
    block: {
        yield 1;
        break block;
    }
}
function f0() {
    return Zone.__awaiter(this, [], f0_generator);
}
function f1() {
    return Zone.__awaiter(this, [], f1_generator);
}
function f3() {
    return Zone.__awaiter(this, [], f3_generator);
}
let f4 = function () {
    return Zone.__awaiter(this, [], f4_generator);
};
let f5 = function () {
    return Zone.__awaiter(this, [], f5_generator);
};
let f6 = function () {
    return Zone.__awaiter(this, [], f6_generator);
};
let f7 = () => Zone.__awaiter(this, [], f7_generator);
let f8 = () => Zone.__awaiter(this, [], f8_generator);
let f9 = () => Zone.__awaiter(this, [], f9_generator);
let f10 = () => Zone.__awaiter(this, [], f10_generator);
let f11 = () => Zone.__awaiter(this, [], f11_generator);
let f12 = () => Zone.__awaiter(this, [], f12_generator);
let f13 = () => Zone.__awaiter(this, [], f13_generator);
let o = {
    m1() {
        return Zone.__awaiter(this, [], function* m1_generator_1() { });
    },
    m2() {
        return Zone.__awaiter(this, [], function* m2_generator_1() { });
    },
    m3() {
        return Zone.__awaiter(this, [], function* m3_generator_1() { });
    }
};
class C {
    m1() {
        return Zone.__awaiter(this, [], m1_generator);
    }
    m2() {
        return Zone.__awaiter(this, [], m2_generator);
    }
    m3() {
        return Zone.__awaiter(this, [], m3_generator);
    }
    static m4() {
        return Zone.__awaiter(this, [], m4_generator);
    }
    static m5() {
        return Zone.__awaiter(this, [], m5_generator);
    }
    static m6() {
        return Zone.__awaiter(this, [], m6_generator);
    }
}
var M;
(function (M) {
    function f1() {
        return Zone.__awaiter(this, [], function* f1_generator_1() { });
    }
    M.f1 = f1;
})(M || (M = {}));
function f14() {
    return Zone.__awaiter(this, [], f14_generator);
}
