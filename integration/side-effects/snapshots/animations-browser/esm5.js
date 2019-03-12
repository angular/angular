import "tslib";

import "@angular/animations";

import "@angular/core";

function isNode() {
    return "undefined" !== typeof process;
}

var _isNode = isNode();

if (_isNode || "undefined" !== typeof Element) if (_isNode || Element.prototype.matches) ; else {
    var proto = Element.prototype;
    var fn_1 = proto.matchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector || proto.oMatchesSelector || proto.webkitMatchesSelector;
}
