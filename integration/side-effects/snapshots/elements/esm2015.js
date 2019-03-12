import "@angular/core";

import "rxjs";

import "rxjs/operators";

const elProto = Element.prototype;

const matches = elProto.matches || elProto.matchesSelector || elProto.mozMatchesSelector || elProto.msMatchesSelector || elProto.oMatchesSelector || elProto.webkitMatchesSelector;
