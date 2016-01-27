import { CONST_EXPR } from 'angular2/src/facade/lang';
import { OpaqueToken } from 'angular2/core';
/**
 * `LocationStrategy` is responsible for representing and reading route state
 * from the browser's URL. Angular provides two strategies:
 * {@link HashLocationStrategy} (default) and {@link PathLocationStrategy}.
 *
 * This is used under the hood of the {@link Location} service.
 *
 * Applications should use the {@link Router} or {@link Location} services to
 * interact with application route state.
 *
 * For instance, {@link HashLocationStrategy} produces URLs like
 * `http://example.com#/foo`, and {@link PathLocationStrategy} produces
 * `http://example.com/foo` as an equivalent URL.
 *
 * See these two classes for more.
 */
export class LocationStrategy {
}
/**
 * The `APP_BASE_HREF` token represents the base href to be used with the
 * {@link PathLocationStrategy}.
 *
 * If you're using {@link PathLocationStrategy}, you must provide a provider to a string
 * representing the URL prefix that should be preserved when generating and recognizing
 * URLs.
 *
 * ### Example
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig} from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   // ...
 * }
 *
 * bootstrap(AppCmp, [
 *   ROUTER_PROVIDERS,
 *   PathLocationStrategy,
 *   provide(APP_BASE_HREF, {useValue: '/my/app'})
 * ]);
 * ```
 */
export const APP_BASE_HREF = CONST_EXPR(new OpaqueToken('appBaseHref'));
export function normalizeQueryParams(params) {
    return (params.length > 0 && params.substring(0, 1) != '?') ? ('?' + params) : params;
}
export function joinWithSlash(start, end) {
    if (start.length == 0) {
        return end;
    }
    if (end.length == 0) {
        return start;
    }
    var slashes = 0;
    if (start.endsWith('/')) {
        slashes++;
    }
    if (end.startsWith('/')) {
        slashes++;
    }
    if (slashes == 2) {
        return start + end.substring(1);
    }
    if (slashes == 1) {
        return start + end;
    }
    return start + '/' + end;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb25fc3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL2xvY2F0aW9uX3N0cmF0ZWd5LnRzIl0sIm5hbWVzIjpbIkxvY2F0aW9uU3RyYXRlZ3kiLCJub3JtYWxpemVRdWVyeVBhcmFtcyIsImpvaW5XaXRoU2xhc2giXSwibWFwcGluZ3MiOiJPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sMEJBQTBCO09BQzVDLEVBQUMsV0FBVyxFQUFDLE1BQU0sZUFBZTtBQUd6Qzs7Ozs7Ozs7Ozs7Ozs7O0dBZUc7QUFDSDtBQVNBQSxDQUFDQTtBQUdEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNEJHO0FBQ0gsYUFBYSxhQUFhLEdBQWdCLFVBQVUsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO0FBRXJGLHFDQUFxQyxNQUFjO0lBQ2pEQyxNQUFNQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxJQUFJQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxHQUFHQSxNQUFNQSxDQUFDQSxHQUFHQSxNQUFNQSxDQUFDQTtBQUN4RkEsQ0FBQ0E7QUFFRCw4QkFBOEIsS0FBYSxFQUFFLEdBQVc7SUFDdERDLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ3RCQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQTtJQUNiQSxDQUFDQTtJQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNwQkEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7SUFDZkEsQ0FBQ0E7SUFDREEsSUFBSUEsT0FBT0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDaEJBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ3hCQSxPQUFPQSxFQUFFQSxDQUFDQTtJQUNaQSxDQUFDQTtJQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxVQUFVQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUN4QkEsT0FBT0EsRUFBRUEsQ0FBQ0E7SUFDWkEsQ0FBQ0E7SUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakJBLE1BQU1BLENBQUNBLEtBQUtBLEdBQUdBLEdBQUdBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ2xDQSxDQUFDQTtJQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNqQkEsTUFBTUEsQ0FBQ0EsS0FBS0EsR0FBR0EsR0FBR0EsQ0FBQ0E7SUFDckJBLENBQUNBO0lBQ0RBLE1BQU1BLENBQUNBLEtBQUtBLEdBQUdBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBO0FBQzNCQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7T3BhcXVlVG9rZW59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtVcmxDaGFuZ2VMaXN0ZW5lcn0gZnJvbSAnLi9wbGF0Zm9ybV9sb2NhdGlvbic7XG5cbi8qKlxuICogYExvY2F0aW9uU3RyYXRlZ3lgIGlzIHJlc3BvbnNpYmxlIGZvciByZXByZXNlbnRpbmcgYW5kIHJlYWRpbmcgcm91dGUgc3RhdGVcbiAqIGZyb20gdGhlIGJyb3dzZXIncyBVUkwuIEFuZ3VsYXIgcHJvdmlkZXMgdHdvIHN0cmF0ZWdpZXM6XG4gKiB7QGxpbmsgSGFzaExvY2F0aW9uU3RyYXRlZ3l9IChkZWZhdWx0KSBhbmQge0BsaW5rIFBhdGhMb2NhdGlvblN0cmF0ZWd5fS5cbiAqXG4gKiBUaGlzIGlzIHVzZWQgdW5kZXIgdGhlIGhvb2Qgb2YgdGhlIHtAbGluayBMb2NhdGlvbn0gc2VydmljZS5cbiAqXG4gKiBBcHBsaWNhdGlvbnMgc2hvdWxkIHVzZSB0aGUge0BsaW5rIFJvdXRlcn0gb3Ige0BsaW5rIExvY2F0aW9ufSBzZXJ2aWNlcyB0b1xuICogaW50ZXJhY3Qgd2l0aCBhcHBsaWNhdGlvbiByb3V0ZSBzdGF0ZS5cbiAqXG4gKiBGb3IgaW5zdGFuY2UsIHtAbGluayBIYXNoTG9jYXRpb25TdHJhdGVneX0gcHJvZHVjZXMgVVJMcyBsaWtlXG4gKiBgaHR0cDovL2V4YW1wbGUuY29tIy9mb29gLCBhbmQge0BsaW5rIFBhdGhMb2NhdGlvblN0cmF0ZWd5fSBwcm9kdWNlc1xuICogYGh0dHA6Ly9leGFtcGxlLmNvbS9mb29gIGFzIGFuIGVxdWl2YWxlbnQgVVJMLlxuICpcbiAqIFNlZSB0aGVzZSB0d28gY2xhc3NlcyBmb3IgbW9yZS5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIExvY2F0aW9uU3RyYXRlZ3kge1xuICBhYnN0cmFjdCBwYXRoKCk6IHN0cmluZztcbiAgYWJzdHJhY3QgcHJlcGFyZUV4dGVybmFsVXJsKGludGVybmFsOiBzdHJpbmcpOiBzdHJpbmc7XG4gIGFic3RyYWN0IHB1c2hTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCB1cmw6IHN0cmluZywgcXVlcnlQYXJhbXM6IHN0cmluZyk6IHZvaWQ7XG4gIGFic3RyYWN0IHJlcGxhY2VTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCB1cmw6IHN0cmluZywgcXVlcnlQYXJhbXM6IHN0cmluZyk6IHZvaWQ7XG4gIGFic3RyYWN0IGZvcndhcmQoKTogdm9pZDtcbiAgYWJzdHJhY3QgYmFjaygpOiB2b2lkO1xuICBhYnN0cmFjdCBvblBvcFN0YXRlKGZuOiBVcmxDaGFuZ2VMaXN0ZW5lcik6IHZvaWQ7XG4gIGFic3RyYWN0IGdldEJhc2VIcmVmKCk6IHN0cmluZztcbn1cblxuXG4vKipcbiAqIFRoZSBgQVBQX0JBU0VfSFJFRmAgdG9rZW4gcmVwcmVzZW50cyB0aGUgYmFzZSBocmVmIHRvIGJlIHVzZWQgd2l0aCB0aGVcbiAqIHtAbGluayBQYXRoTG9jYXRpb25TdHJhdGVneX0uXG4gKlxuICogSWYgeW91J3JlIHVzaW5nIHtAbGluayBQYXRoTG9jYXRpb25TdHJhdGVneX0sIHlvdSBtdXN0IHByb3ZpZGUgYSBwcm92aWRlciB0byBhIHN0cmluZ1xuICogcmVwcmVzZW50aW5nIHRoZSBVUkwgcHJlZml4IHRoYXQgc2hvdWxkIGJlIHByZXNlcnZlZCB3aGVuIGdlbmVyYXRpbmcgYW5kIHJlY29nbml6aW5nXG4gKiBVUkxzLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge1JPVVRFUl9ESVJFQ1RJVkVTLCBST1VURVJfUFJPVklERVJTLCBSb3V0ZUNvbmZpZ30gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAQ29tcG9uZW50KHtkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdfSlcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgey4uLn0sXG4gKiBdKVxuICogY2xhc3MgQXBwQ21wIHtcbiAqICAgLy8gLi4uXG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcENtcCwgW1xuICogICBST1VURVJfUFJPVklERVJTLFxuICogICBQYXRoTG9jYXRpb25TdHJhdGVneSxcbiAqICAgcHJvdmlkZShBUFBfQkFTRV9IUkVGLCB7dXNlVmFsdWU6ICcvbXkvYXBwJ30pXG4gKiBdKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgQVBQX0JBU0VfSFJFRjogT3BhcXVlVG9rZW4gPSBDT05TVF9FWFBSKG5ldyBPcGFxdWVUb2tlbignYXBwQmFzZUhyZWYnKSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVRdWVyeVBhcmFtcyhwYXJhbXM6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiAocGFyYW1zLmxlbmd0aCA+IDAgJiYgcGFyYW1zLnN1YnN0cmluZygwLCAxKSAhPSAnPycpID8gKCc/JyArIHBhcmFtcykgOiBwYXJhbXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBqb2luV2l0aFNsYXNoKHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKHN0YXJ0Lmxlbmd0aCA9PSAwKSB7XG4gICAgcmV0dXJuIGVuZDtcbiAgfVxuICBpZiAoZW5kLmxlbmd0aCA9PSAwKSB7XG4gICAgcmV0dXJuIHN0YXJ0O1xuICB9XG4gIHZhciBzbGFzaGVzID0gMDtcbiAgaWYgKHN0YXJ0LmVuZHNXaXRoKCcvJykpIHtcbiAgICBzbGFzaGVzKys7XG4gIH1cbiAgaWYgKGVuZC5zdGFydHNXaXRoKCcvJykpIHtcbiAgICBzbGFzaGVzKys7XG4gIH1cbiAgaWYgKHNsYXNoZXMgPT0gMikge1xuICAgIHJldHVybiBzdGFydCArIGVuZC5zdWJzdHJpbmcoMSk7XG4gIH1cbiAgaWYgKHNsYXNoZXMgPT0gMSkge1xuICAgIHJldHVybiBzdGFydCArIGVuZDtcbiAgfVxuICByZXR1cm4gc3RhcnQgKyAnLycgKyBlbmQ7XG59XG4iXX0=