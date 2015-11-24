var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { AppRootUrl } from "angular2/src/compiler/app_root_url";
import { DOM } from "angular2/src/platform/dom/dom_adapter";
import { Injectable } from "angular2/src/core/di";
/**
 * Extension of {@link AppRootUrl} that uses a DOM anchor tag to set the root url to
 * the current page's url.
 */
export let AnchorBasedAppRootUrl = class extends AppRootUrl {
    constructor() {
        super("");
        // compute the root url to pass to AppRootUrl
        var a = DOM.createElement('a');
        DOM.resolveAndSetHref(a, './', null);
        this.value = DOM.getHref(a);
    }
};
AnchorBasedAppRootUrl = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], AnchorBasedAppRootUrl);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5jaG9yX2Jhc2VkX2FwcF9yb290X3VybC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21waWxlci9hbmNob3JfYmFzZWRfYXBwX3Jvb3RfdXJsLnRzIl0sIm5hbWVzIjpbIkFuY2hvckJhc2VkQXBwUm9vdFVybCIsIkFuY2hvckJhc2VkQXBwUm9vdFVybC5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLG9DQUFvQztPQUN0RCxFQUFDLEdBQUcsRUFBQyxNQUFNLHVDQUF1QztPQUNsRCxFQUFDLFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtBQUUvQzs7O0dBR0c7QUFDSCxpREFDMkMsVUFBVTtJQUNuREE7UUFDRUMsTUFBTUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFDVkEsNkNBQTZDQTtRQUM3Q0EsSUFBSUEsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDL0JBLEdBQUdBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDckNBLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLEdBQUdBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQzlCQSxDQUFDQTtBQUNIRCxDQUFDQTtBQVREO0lBQUMsVUFBVSxFQUFFOzswQkFTWjtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBcHBSb290VXJsfSBmcm9tIFwiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2FwcF9yb290X3VybFwiO1xuaW1wb3J0IHtET019IGZyb20gXCJhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyXCI7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gXCJhbmd1bGFyMi9zcmMvY29yZS9kaVwiO1xuXG4vKipcbiAqIEV4dGVuc2lvbiBvZiB7QGxpbmsgQXBwUm9vdFVybH0gdGhhdCB1c2VzIGEgRE9NIGFuY2hvciB0YWcgdG8gc2V0IHRoZSByb290IHVybCB0b1xuICogdGhlIGN1cnJlbnQgcGFnZSdzIHVybC5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFuY2hvckJhc2VkQXBwUm9vdFVybCBleHRlbmRzIEFwcFJvb3RVcmwge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihcIlwiKTtcbiAgICAvLyBjb21wdXRlIHRoZSByb290IHVybCB0byBwYXNzIHRvIEFwcFJvb3RVcmxcbiAgICB2YXIgYSA9IERPTS5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgRE9NLnJlc29sdmVBbmRTZXRIcmVmKGEsICcuLycsIG51bGwpO1xuICAgIHRoaXMudmFsdWUgPSBET00uZ2V0SHJlZihhKTtcbiAgfVxufVxuIl19