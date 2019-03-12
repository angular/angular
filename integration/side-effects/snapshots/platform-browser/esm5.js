import "tslib";

import "@angular/common";

import { ɵglobal } from "@angular/core";

var nodeContains;

if (ɵglobal["Node"]) nodeContains = ɵglobal["Node"].prototype.contains || function(node) {
    return !!(16 & this.compareDocumentPosition(node));
};

var ɵ0 = function(v) {
    return "__zone_symbol__" + v;
};

var __symbol__ = "undefined" !== typeof Zone && Zone["__symbol__"] || ɵ0;

var blackListedEvents = "undefined" !== typeof Zone && Zone[__symbol__("BLACK_LISTED_EVENTS")];
