import "@angular/common";

import { ɵglobal } from "@angular/core";

let nodeContains;

if (ɵglobal["Node"]) nodeContains = ɵglobal["Node"].prototype.contains || function(node) {
    return !!(16 & this.compareDocumentPosition(node));
};

const ɵ0 = function(v) {
    return "__zone_symbol__" + v;
};

const __symbol__ = "undefined" !== typeof Zone && Zone["__symbol__"] || ɵ0;

const blackListedEvents = "undefined" !== typeof Zone && Zone[__symbol__("BLACK_LISTED_EVENTS")];
