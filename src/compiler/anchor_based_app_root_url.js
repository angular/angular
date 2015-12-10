'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var app_root_url_1 = require("angular2/src/compiler/app_root_url");
var dom_adapter_1 = require("angular2/src/platform/dom/dom_adapter");
var di_1 = require("angular2/src/core/di");
/**
 * Extension of {@link AppRootUrl} that uses a DOM anchor tag to set the root url to
 * the current page's url.
 */
var AnchorBasedAppRootUrl = (function (_super) {
    __extends(AnchorBasedAppRootUrl, _super);
    function AnchorBasedAppRootUrl() {
        _super.call(this, "");
        // compute the root url to pass to AppRootUrl
        var a = dom_adapter_1.DOM.createElement('a');
        dom_adapter_1.DOM.resolveAndSetHref(a, './', null);
        this.value = dom_adapter_1.DOM.getHref(a);
    }
    AnchorBasedAppRootUrl = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], AnchorBasedAppRootUrl);
    return AnchorBasedAppRootUrl;
})(app_root_url_1.AppRootUrl);
exports.AnchorBasedAppRootUrl = AnchorBasedAppRootUrl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5jaG9yX2Jhc2VkX2FwcF9yb290X3VybC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21waWxlci9hbmNob3JfYmFzZWRfYXBwX3Jvb3RfdXJsLnRzIl0sIm5hbWVzIjpbIkFuY2hvckJhc2VkQXBwUm9vdFVybCIsIkFuY2hvckJhc2VkQXBwUm9vdFVybC5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSw2QkFBeUIsb0NBQW9DLENBQUMsQ0FBQTtBQUM5RCw0QkFBa0IsdUNBQXVDLENBQUMsQ0FBQTtBQUMxRCxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUVoRDs7O0dBR0c7QUFDSDtJQUMyQ0EseUNBQVVBO0lBQ25EQTtRQUNFQyxrQkFBTUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFDVkEsNkNBQTZDQTtRQUM3Q0EsSUFBSUEsQ0FBQ0EsR0FBR0EsaUJBQUdBLENBQUNBLGFBQWFBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQy9CQSxpQkFBR0EsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxDQUFDQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNyQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsaUJBQUdBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQzlCQSxDQUFDQTtJQVJIRDtRQUFDQSxlQUFVQSxFQUFFQTs7OEJBU1pBO0lBQURBLDRCQUFDQTtBQUFEQSxDQUFDQSxBQVRELEVBQzJDLHlCQUFVLEVBUXBEO0FBUlksNkJBQXFCLHdCQVFqQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBcHBSb290VXJsfSBmcm9tIFwiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2FwcF9yb290X3VybFwiO1xuaW1wb3J0IHtET019IGZyb20gXCJhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyXCI7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gXCJhbmd1bGFyMi9zcmMvY29yZS9kaVwiO1xuXG4vKipcbiAqIEV4dGVuc2lvbiBvZiB7QGxpbmsgQXBwUm9vdFVybH0gdGhhdCB1c2VzIGEgRE9NIGFuY2hvciB0YWcgdG8gc2V0IHRoZSByb290IHVybCB0b1xuICogdGhlIGN1cnJlbnQgcGFnZSdzIHVybC5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFuY2hvckJhc2VkQXBwUm9vdFVybCBleHRlbmRzIEFwcFJvb3RVcmwge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihcIlwiKTtcbiAgICAvLyBjb21wdXRlIHRoZSByb290IHVybCB0byBwYXNzIHRvIEFwcFJvb3RVcmxcbiAgICB2YXIgYSA9IERPTS5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgRE9NLnJlc29sdmVBbmRTZXRIcmVmKGEsICcuLycsIG51bGwpO1xuICAgIHRoaXMudmFsdWUgPSBET00uZ2V0SHJlZihhKTtcbiAgfVxufVxuIl19