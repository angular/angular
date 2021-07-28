function* func_generator() {
    'use strict';
    var b = (yield p) || a;
}
function func() {
    return Zone.__awaiter(this, [], func_generator);
}
