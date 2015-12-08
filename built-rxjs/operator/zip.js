var zip_static_1 = require('./zip-static');
function zipProto() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        observables[_i - 0] = arguments[_i];
    }
    observables.unshift(this);
    return zip_static_1.zip.apply(this, observables);
}
exports.zipProto = zipProto;
//# sourceMappingURL=zip.js.map