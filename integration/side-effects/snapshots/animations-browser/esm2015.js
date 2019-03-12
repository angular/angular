import "@angular/animations";

import "@angular/core";

function isNode() {
    return "undefined" !== typeof process;
}

const _isNode = isNode();

if (_isNode || "undefined" !== typeof Element) if (_isNode || Element.prototype.matches) ; else {
    const proto = Element.prototype;
    const fn = proto.matchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector || proto.oMatchesSelector || proto.webkitMatchesSelector;
}
