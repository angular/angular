'use strict';"use strict";
/**
 * This class should not be used directly by an application developer. Instead, use
 * {@link Location}.
 *
 * `PlatformLocation` encapsulates all calls to DOM apis, which allows the Router to be platform
 * agnostic.
 * This means that we can have different implementation of `PlatformLocation` for the different
 * platforms
 * that angular supports. For example, the default `PlatformLocation` is {@link
 * BrowserPlatformLocation},
 * however when you run your app in a WebWorker you use {@link WebWorkerPlatformLocation}.
 *
 * The `PlatformLocation` class is used directly by all implementations of {@link LocationStrategy}
 * when
 * they need to interact with the DOM apis like pushState, popState, etc...
 *
 * {@link LocationStrategy} in turn is used by the {@link Location} service which is used directly
 * by
 * the {@link Router} in order to navigate between routes. Since all interactions between {@link
 * Router} /
 * {@link Location} / {@link LocationStrategy} and DOM apis flow through the `PlatformLocation`
 * class
 * they are all platform independent.
 */
var PlatformLocation = (function () {
    function PlatformLocation() {
    }
    Object.defineProperty(PlatformLocation.prototype, "pathname", {
        /* abstract */ get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlatformLocation.prototype, "search", {
        /* abstract */ get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlatformLocation.prototype, "hash", {
        /* abstract */ get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    return PlatformLocation;
}());
exports.PlatformLocation = PlatformLocation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm1fbG9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvcGxhdGZvcm0vYnJvd3Nlci9sb2NhdGlvbi9wbGF0Zm9ybV9sb2NhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUJHO0FBQ0g7SUFBQTtJQWdCQSxDQUFDO0lBWGdCLHNCQUFJLHNDQUFRO1FBQTNCLGNBQWMsTUFBQyxjQUF5QixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFDdkMsc0JBQUksb0NBQU07UUFBekIsY0FBYyxNQUFDLGNBQXVCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUNyQyxzQkFBSSxrQ0FBSTtRQUF2QixjQUFjLE1BQUMsY0FBcUIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBU3BELHVCQUFDO0FBQUQsQ0FBQyxBQWhCRCxJQWdCQztBQWhCcUIsd0JBQWdCLG1CQWdCckMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhpcyBjbGFzcyBzaG91bGQgbm90IGJlIHVzZWQgZGlyZWN0bHkgYnkgYW4gYXBwbGljYXRpb24gZGV2ZWxvcGVyLiBJbnN0ZWFkLCB1c2VcbiAqIHtAbGluayBMb2NhdGlvbn0uXG4gKlxuICogYFBsYXRmb3JtTG9jYXRpb25gIGVuY2Fwc3VsYXRlcyBhbGwgY2FsbHMgdG8gRE9NIGFwaXMsIHdoaWNoIGFsbG93cyB0aGUgUm91dGVyIHRvIGJlIHBsYXRmb3JtXG4gKiBhZ25vc3RpYy5cbiAqIFRoaXMgbWVhbnMgdGhhdCB3ZSBjYW4gaGF2ZSBkaWZmZXJlbnQgaW1wbGVtZW50YXRpb24gb2YgYFBsYXRmb3JtTG9jYXRpb25gIGZvciB0aGUgZGlmZmVyZW50XG4gKiBwbGF0Zm9ybXNcbiAqIHRoYXQgYW5ndWxhciBzdXBwb3J0cy4gRm9yIGV4YW1wbGUsIHRoZSBkZWZhdWx0IGBQbGF0Zm9ybUxvY2F0aW9uYCBpcyB7QGxpbmtcbiAqIEJyb3dzZXJQbGF0Zm9ybUxvY2F0aW9ufSxcbiAqIGhvd2V2ZXIgd2hlbiB5b3UgcnVuIHlvdXIgYXBwIGluIGEgV2ViV29ya2VyIHlvdSB1c2Uge0BsaW5rIFdlYldvcmtlclBsYXRmb3JtTG9jYXRpb259LlxuICpcbiAqIFRoZSBgUGxhdGZvcm1Mb2NhdGlvbmAgY2xhc3MgaXMgdXNlZCBkaXJlY3RseSBieSBhbGwgaW1wbGVtZW50YXRpb25zIG9mIHtAbGluayBMb2NhdGlvblN0cmF0ZWd5fVxuICogd2hlblxuICogdGhleSBuZWVkIHRvIGludGVyYWN0IHdpdGggdGhlIERPTSBhcGlzIGxpa2UgcHVzaFN0YXRlLCBwb3BTdGF0ZSwgZXRjLi4uXG4gKlxuICoge0BsaW5rIExvY2F0aW9uU3RyYXRlZ3l9IGluIHR1cm4gaXMgdXNlZCBieSB0aGUge0BsaW5rIExvY2F0aW9ufSBzZXJ2aWNlIHdoaWNoIGlzIHVzZWQgZGlyZWN0bHlcbiAqIGJ5XG4gKiB0aGUge0BsaW5rIFJvdXRlcn0gaW4gb3JkZXIgdG8gbmF2aWdhdGUgYmV0d2VlbiByb3V0ZXMuIFNpbmNlIGFsbCBpbnRlcmFjdGlvbnMgYmV0d2VlbiB7QGxpbmtcbiAqIFJvdXRlcn0gL1xuICoge0BsaW5rIExvY2F0aW9ufSAvIHtAbGluayBMb2NhdGlvblN0cmF0ZWd5fSBhbmQgRE9NIGFwaXMgZmxvdyB0aHJvdWdoIHRoZSBgUGxhdGZvcm1Mb2NhdGlvbmBcbiAqIGNsYXNzXG4gKiB0aGV5IGFyZSBhbGwgcGxhdGZvcm0gaW5kZXBlbmRlbnQuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBQbGF0Zm9ybUxvY2F0aW9uIHtcbiAgYWJzdHJhY3QgZ2V0QmFzZUhyZWZGcm9tRE9NKCk6IHN0cmluZztcbiAgYWJzdHJhY3Qgb25Qb3BTdGF0ZShmbjogVXJsQ2hhbmdlTGlzdGVuZXIpOiB2b2lkO1xuICBhYnN0cmFjdCBvbkhhc2hDaGFuZ2UoZm46IFVybENoYW5nZUxpc3RlbmVyKTogdm9pZDtcblxuICAvKiBhYnN0cmFjdCAqLyBnZXQgcGF0aG5hbWUoKTogc3RyaW5nIHsgcmV0dXJuIG51bGw7IH1cbiAgLyogYWJzdHJhY3QgKi8gZ2V0IHNlYXJjaCgpOiBzdHJpbmcgeyByZXR1cm4gbnVsbDsgfVxuICAvKiBhYnN0cmFjdCAqLyBnZXQgaGFzaCgpOiBzdHJpbmcgeyByZXR1cm4gbnVsbDsgfVxuXG4gIGFic3RyYWN0IHJlcGxhY2VTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCB1cmw6IHN0cmluZyk6IHZvaWQ7XG5cbiAgYWJzdHJhY3QgcHVzaFN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nKTogdm9pZDtcblxuICBhYnN0cmFjdCBmb3J3YXJkKCk6IHZvaWQ7XG5cbiAgYWJzdHJhY3QgYmFjaygpOiB2b2lkO1xufVxuXG4vKipcbiAqIEEgc2VyaWFsaXphYmxlIHZlcnNpb24gb2YgdGhlIGV2ZW50IGZyb20gb25Qb3BTdGF0ZSBvciBvbkhhc2hDaGFuZ2VcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBVcmxDaGFuZ2VFdmVudCB7IHR5cGU6IHN0cmluZzsgfVxuXG5leHBvcnQgaW50ZXJmYWNlIFVybENoYW5nZUxpc3RlbmVyIHsgKGU6IFVybENoYW5nZUV2ZW50KTogYW55OyB9XG4iXX0=