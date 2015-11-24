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
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
import { Injectable } from 'angular2/angular2';
import { LocationStrategy, normalizeQueryParams } from './location_strategy';
/**
 * `HashLocationStrategy` is a {@link LocationStrategy} used to configure the
 * {@link Location} service to represent its state in the
 * [hash fragment](https://en.wikipedia.org/wiki/Uniform_Resource_Locator#Syntax)
 * of the browser's URL.
 *
 * For instance, if you call `location.go('/foo')`, the browser's URL will become
 * `example.com#/foo`.
 *
 * ### Example
 *
 * ```
 * import {Component, provide} from 'angular2/angular2';
 * import {
 *   ROUTER_DIRECTIVES,
 *   ROUTER_PROVIDERS,
 *   RouteConfig,
 *   Location,
 *   LocationStrategy,
 *   HashLocationStrategy
 * } from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   constructor(location: Location) {
 *     location.go('/foo');
 *   }
 * }
 *
 * bootstrap(AppCmp, [
 *   ROUTER_PROVIDERS,
 *   provide(LocationStrategy, {useClass: HashLocationStrategy})
 * ]);
 * ```
 */
export let HashLocationStrategy = class extends LocationStrategy {
    constructor() {
        super();
        this._location = DOM.getLocation();
        this._history = DOM.getHistory();
    }
    onPopState(fn) {
        DOM.getGlobalEventTarget('window').addEventListener('popstate', fn, false);
    }
    getBaseHref() { return ''; }
    path() {
        // the hash value is always prefixed with a `#`
        // and if it is empty then it will stay empty
        var path = this._location.hash;
        // Dart will complain if a call to substring is
        // executed with a position value that extends the
        // length of string.
        return (path.length > 0 ? path.substring(1) : path) +
            normalizeQueryParams(this._location.search);
    }
    prepareExternalUrl(internal) {
        return internal.length > 0 ? ('#' + internal) : internal;
    }
    pushState(state, title, path, queryParams) {
        var url = path + normalizeQueryParams(queryParams);
        if (url.length == 0) {
            url = this._location.pathname;
        }
        else {
            url = this.prepareExternalUrl(url);
        }
        this._history.pushState(state, title, url);
    }
    forward() { this._history.forward(); }
    back() { this._history.back(); }
};
HashLocationStrategy = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], HashLocationStrategy);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFzaF9sb2NhdGlvbl9zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9yb3V0ZXIvaGFzaF9sb2NhdGlvbl9zdHJhdGVneS50cyJdLCJuYW1lcyI6WyJIYXNoTG9jYXRpb25TdHJhdGVneSIsIkhhc2hMb2NhdGlvblN0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiSGFzaExvY2F0aW9uU3RyYXRlZ3kub25Qb3BTdGF0ZSIsIkhhc2hMb2NhdGlvblN0cmF0ZWd5LmdldEJhc2VIcmVmIiwiSGFzaExvY2F0aW9uU3RyYXRlZ3kucGF0aCIsIkhhc2hMb2NhdGlvblN0cmF0ZWd5LnByZXBhcmVFeHRlcm5hbFVybCIsIkhhc2hMb2NhdGlvblN0cmF0ZWd5LnB1c2hTdGF0ZSIsIkhhc2hMb2NhdGlvblN0cmF0ZWd5LmZvcndhcmQiLCJIYXNoTG9jYXRpb25TdHJhdGVneS5iYWNrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztPQUFPLEVBQUMsR0FBRyxFQUFDLE1BQU0sdUNBQXVDO09BQ2xELEVBQUMsVUFBVSxFQUFDLE1BQU0sbUJBQW1CO09BQ3JDLEVBQUMsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQUMsTUFBTSxxQkFBcUI7QUFHMUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FxQ0c7QUFDSCxnREFDMEMsZ0JBQWdCO0lBSXhEQTtRQUNFQyxPQUFPQSxDQUFDQTtRQUNSQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxHQUFHQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQTtRQUNuQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsR0FBR0EsQ0FBQ0EsVUFBVUEsRUFBRUEsQ0FBQ0E7SUFDbkNBLENBQUNBO0lBRURELFVBQVVBLENBQUNBLEVBQWlCQTtRQUMxQkUsR0FBR0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFVBQVVBLEVBQUVBLEVBQUVBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQzdFQSxDQUFDQTtJQUVERixXQUFXQSxLQUFhRyxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVwQ0gsSUFBSUE7UUFDRkksK0NBQStDQTtRQUMvQ0EsNkNBQTZDQTtRQUM3Q0EsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFFL0JBLCtDQUErQ0E7UUFDL0NBLGtEQUFrREE7UUFDbERBLG9CQUFvQkE7UUFDcEJBLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1lBQzVDQSxvQkFBb0JBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0lBQ3JEQSxDQUFDQTtJQUVESixrQkFBa0JBLENBQUNBLFFBQWdCQTtRQUNqQ0ssTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsR0FBR0EsUUFBUUEsQ0FBQ0EsR0FBR0EsUUFBUUEsQ0FBQ0E7SUFDM0RBLENBQUNBO0lBRURMLFNBQVNBLENBQUNBLEtBQVVBLEVBQUVBLEtBQWFBLEVBQUVBLElBQVlBLEVBQUVBLFdBQW1CQTtRQUNwRU0sSUFBSUEsR0FBR0EsR0FBR0EsSUFBSUEsR0FBR0Esb0JBQW9CQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUNuREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsTUFBTUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcEJBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFFBQVFBLENBQUNBO1FBQ2hDQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxrQkFBa0JBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQ3JDQSxDQUFDQTtRQUNEQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUM3Q0EsQ0FBQ0E7SUFFRE4sT0FBT0EsS0FBV08sSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFNUNQLElBQUlBLEtBQVdRLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0FBQ3hDUixDQUFDQTtBQTlDRDtJQUFDLFVBQVUsRUFBRTs7eUJBOENaO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RPTX0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlcic7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL2FuZ3VsYXIyJztcbmltcG9ydCB7TG9jYXRpb25TdHJhdGVneSwgbm9ybWFsaXplUXVlcnlQYXJhbXN9IGZyb20gJy4vbG9jYXRpb25fc3RyYXRlZ3knO1xuaW1wb3J0IHtFdmVudExpc3RlbmVyLCBIaXN0b3J5LCBMb2NhdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9icm93c2VyJztcblxuLyoqXG4gKiBgSGFzaExvY2F0aW9uU3RyYXRlZ3lgIGlzIGEge0BsaW5rIExvY2F0aW9uU3RyYXRlZ3l9IHVzZWQgdG8gY29uZmlndXJlIHRoZVxuICoge0BsaW5rIExvY2F0aW9ufSBzZXJ2aWNlIHRvIHJlcHJlc2VudCBpdHMgc3RhdGUgaW4gdGhlXG4gKiBbaGFzaCBmcmFnbWVudF0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVW5pZm9ybV9SZXNvdXJjZV9Mb2NhdG9yI1N5bnRheClcbiAqIG9mIHRoZSBicm93c2VyJ3MgVVJMLlxuICpcbiAqIEZvciBpbnN0YW5jZSwgaWYgeW91IGNhbGwgYGxvY2F0aW9uLmdvKCcvZm9vJylgLCB0aGUgYnJvd3NlcidzIFVSTCB3aWxsIGJlY29tZVxuICogYGV4YW1wbGUuY29tIy9mb29gLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudCwgcHJvdmlkZX0gZnJvbSAnYW5ndWxhcjIvYW5ndWxhcjInO1xuICogaW1wb3J0IHtcbiAqICAgUk9VVEVSX0RJUkVDVElWRVMsXG4gKiAgIFJPVVRFUl9QUk9WSURFUlMsXG4gKiAgIFJvdXRlQ29uZmlnLFxuICogICBMb2NhdGlvbixcbiAqICAgTG9jYXRpb25TdHJhdGVneSxcbiAqICAgSGFzaExvY2F0aW9uU3RyYXRlZ3lcbiAqIH0gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAQ29tcG9uZW50KHtkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdfSlcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgey4uLn0sXG4gKiBdKVxuICogY2xhc3MgQXBwQ21wIHtcbiAqICAgY29uc3RydWN0b3IobG9jYXRpb246IExvY2F0aW9uKSB7XG4gKiAgICAgbG9jYXRpb24uZ28oJy9mb28nKTtcbiAqICAgfVxuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHBDbXAsIFtcbiAqICAgUk9VVEVSX1BST1ZJREVSUyxcbiAqICAgcHJvdmlkZShMb2NhdGlvblN0cmF0ZWd5LCB7dXNlQ2xhc3M6IEhhc2hMb2NhdGlvblN0cmF0ZWd5fSlcbiAqIF0pO1xuICogYGBgXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIYXNoTG9jYXRpb25TdHJhdGVneSBleHRlbmRzIExvY2F0aW9uU3RyYXRlZ3kge1xuICBwcml2YXRlIF9sb2NhdGlvbjogTG9jYXRpb247XG4gIHByaXZhdGUgX2hpc3Rvcnk6IEhpc3Rvcnk7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9sb2NhdGlvbiA9IERPTS5nZXRMb2NhdGlvbigpO1xuICAgIHRoaXMuX2hpc3RvcnkgPSBET00uZ2V0SGlzdG9yeSgpO1xuICB9XG5cbiAgb25Qb3BTdGF0ZShmbjogRXZlbnRMaXN0ZW5lcik6IHZvaWQge1xuICAgIERPTS5nZXRHbG9iYWxFdmVudFRhcmdldCgnd2luZG93JykuYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBmbiwgZmFsc2UpO1xuICB9XG5cbiAgZ2V0QmFzZUhyZWYoKTogc3RyaW5nIHsgcmV0dXJuICcnOyB9XG5cbiAgcGF0aCgpOiBzdHJpbmcge1xuICAgIC8vIHRoZSBoYXNoIHZhbHVlIGlzIGFsd2F5cyBwcmVmaXhlZCB3aXRoIGEgYCNgXG4gICAgLy8gYW5kIGlmIGl0IGlzIGVtcHR5IHRoZW4gaXQgd2lsbCBzdGF5IGVtcHR5XG4gICAgdmFyIHBhdGggPSB0aGlzLl9sb2NhdGlvbi5oYXNoO1xuXG4gICAgLy8gRGFydCB3aWxsIGNvbXBsYWluIGlmIGEgY2FsbCB0byBzdWJzdHJpbmcgaXNcbiAgICAvLyBleGVjdXRlZCB3aXRoIGEgcG9zaXRpb24gdmFsdWUgdGhhdCBleHRlbmRzIHRoZVxuICAgIC8vIGxlbmd0aCBvZiBzdHJpbmcuXG4gICAgcmV0dXJuIChwYXRoLmxlbmd0aCA+IDAgPyBwYXRoLnN1YnN0cmluZygxKSA6IHBhdGgpICtcbiAgICAgICAgICAgbm9ybWFsaXplUXVlcnlQYXJhbXModGhpcy5fbG9jYXRpb24uc2VhcmNoKTtcbiAgfVxuXG4gIHByZXBhcmVFeHRlcm5hbFVybChpbnRlcm5hbDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gaW50ZXJuYWwubGVuZ3RoID4gMCA/ICgnIycgKyBpbnRlcm5hbCkgOiBpbnRlcm5hbDtcbiAgfVxuXG4gIHB1c2hTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5UGFyYW1zOiBzdHJpbmcpIHtcbiAgICB2YXIgdXJsID0gcGF0aCArIG5vcm1hbGl6ZVF1ZXJ5UGFyYW1zKHF1ZXJ5UGFyYW1zKTtcbiAgICBpZiAodXJsLmxlbmd0aCA9PSAwKSB7XG4gICAgICB1cmwgPSB0aGlzLl9sb2NhdGlvbi5wYXRobmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdXJsID0gdGhpcy5wcmVwYXJlRXh0ZXJuYWxVcmwodXJsKTtcbiAgICB9XG4gICAgdGhpcy5faGlzdG9yeS5wdXNoU3RhdGUoc3RhdGUsIHRpdGxlLCB1cmwpO1xuICB9XG5cbiAgZm9yd2FyZCgpOiB2b2lkIHsgdGhpcy5faGlzdG9yeS5mb3J3YXJkKCk7IH1cblxuICBiYWNrKCk6IHZvaWQgeyB0aGlzLl9oaXN0b3J5LmJhY2soKTsgfVxufVxuIl19