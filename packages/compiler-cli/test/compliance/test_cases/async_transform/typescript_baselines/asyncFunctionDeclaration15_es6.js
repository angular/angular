function* fn1_generator() { }
function* fn7_generator() { return; }
function* fn8_generator() { return 1; }
function* fn9_generator() { return null; }
function* fn10_generator() { return undefined; }
function* fn11_generator() { return a; }
function* fn12_generator() { return obj; }
function* fn14_generator() { yield 1; }
function* fn15_generator() { yield null; }
function* fn16_generator() { yield undefined; }
function* fn17_generator() { yield a; }
function* fn18_generator() { yield obj; }
function fn1() {
    return Zone.__awaiter(this, [], fn1_generator);
} // valid: Promise<void>
function fn7() {
    return Zone.__awaiter(this, [], fn7_generator);
} // valid: Promise<void>
function fn8() {
    return Zone.__awaiter(this, [], fn8_generator);
} // valid: Promise<number>
function fn9() {
    return Zone.__awaiter(this, [], fn9_generator);
} // valid: Promise<any>
function fn10() {
    return Zone.__awaiter(this, [], fn10_generator);
} // valid: Promise<any>
function fn11() {
    return Zone.__awaiter(this, [], fn11_generator);
} // valid: Promise<any>
function fn12() {
    return Zone.__awaiter(this, [], fn12_generator);
} // valid: Promise<{ then: string; }>
function fn14() {
    return Zone.__awaiter(this, [], fn14_generator);
} // valid: Promise<void>
function fn15() {
    return Zone.__awaiter(this, [], fn15_generator);
} // valid: Promise<void>
function fn16() {
    return Zone.__awaiter(this, [], fn16_generator);
} // valid: Promise<void>
function fn17() {
    return Zone.__awaiter(this, [], fn17_generator);
} // valid: Promise<void>
function fn18() {
    return Zone.__awaiter(this, [], fn18_generator);
} // valid: Promise<void>
