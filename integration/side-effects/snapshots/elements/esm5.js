import "tslib";

import "@angular/core";

import "rxjs";

import "rxjs/operators";

var elProto = Element.prototype;

var matches = elProto.matches || elProto.matchesSelector || elProto.mozMatchesSelector || elProto.msMatchesSelector || elProto.oMatchesSelector || elProto.webkitMatchesSelector;
