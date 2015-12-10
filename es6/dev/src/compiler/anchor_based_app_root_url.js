var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5jaG9yX2Jhc2VkX2FwcF9yb290X3VybC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21waWxlci9hbmNob3JfYmFzZWRfYXBwX3Jvb3RfdXJsLnRzIl0sIm5hbWVzIjpbIkFuY2hvckJhc2VkQXBwUm9vdFVybCIsIkFuY2hvckJhc2VkQXBwUm9vdFVybC5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxvQ0FBb0M7T0FDdEQsRUFBQyxHQUFHLEVBQUMsTUFBTSx1Q0FBdUM7T0FDbEQsRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7QUFFL0M7OztHQUdHO0FBQ0gsaURBQzJDLFVBQVU7SUFDbkRBO1FBQ0VDLE1BQU1BLEVBQUVBLENBQUNBLENBQUNBO1FBQ1ZBLDZDQUE2Q0E7UUFDN0NBLElBQUlBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBLGFBQWFBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQy9CQSxHQUFHQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO1FBQ3JDQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUM5QkEsQ0FBQ0E7QUFDSEQsQ0FBQ0E7QUFURDtJQUFDLFVBQVUsRUFBRTs7MEJBU1o7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QXBwUm9vdFVybH0gZnJvbSBcImFuZ3VsYXIyL3NyYy9jb21waWxlci9hcHBfcm9vdF91cmxcIjtcbmltcG9ydCB7RE9NfSBmcm9tIFwiYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlclwiO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tIFwiYW5ndWxhcjIvc3JjL2NvcmUvZGlcIjtcblxuLyoqXG4gKiBFeHRlbnNpb24gb2Yge0BsaW5rIEFwcFJvb3RVcmx9IHRoYXQgdXNlcyBhIERPTSBhbmNob3IgdGFnIHRvIHNldCB0aGUgcm9vdCB1cmwgdG9cbiAqIHRoZSBjdXJyZW50IHBhZ2UncyB1cmwuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBBbmNob3JCYXNlZEFwcFJvb3RVcmwgZXh0ZW5kcyBBcHBSb290VXJsIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoXCJcIik7XG4gICAgLy8gY29tcHV0ZSB0aGUgcm9vdCB1cmwgdG8gcGFzcyB0byBBcHBSb290VXJsXG4gICAgdmFyIGEgPSBET00uY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIERPTS5yZXNvbHZlQW5kU2V0SHJlZihhLCAnLi8nLCBudWxsKTtcbiAgICB0aGlzLnZhbHVlID0gRE9NLmdldEhyZWYoYSk7XG4gIH1cbn1cbiJdfQ==