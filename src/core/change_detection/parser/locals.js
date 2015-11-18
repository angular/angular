'use strict';var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var Locals = (function () {
    function Locals(parent, current) {
        this.parent = parent;
        this.current = current;
    }
    Locals.prototype.contains = function (name) {
        if (this.current.has(name)) {
            return true;
        }
        if (lang_1.isPresent(this.parent)) {
            return this.parent.contains(name);
        }
        return false;
    };
    Locals.prototype.get = function (name) {
        if (this.current.has(name)) {
            return this.current.get(name);
        }
        if (lang_1.isPresent(this.parent)) {
            return this.parent.get(name);
        }
        throw new exceptions_1.BaseException("Cannot find '" + name + "'");
    };
    Locals.prototype.set = function (name, value) {
        // TODO(rado): consider removing this check if we can guarantee this is not
        // exposed to the public API.
        // TODO: vsavkin maybe it should check only the local map
        if (this.current.has(name)) {
            this.current.set(name, value);
        }
        else {
            throw new exceptions_1.BaseException("Setting of new keys post-construction is not supported. Key: " + name + ".");
        }
    };
    Locals.prototype.clearValues = function () { collection_1.MapWrapper.clearValues(this.current); };
    return Locals;
})();
exports.Locals = Locals;
//# sourceMappingURL=locals.js.map