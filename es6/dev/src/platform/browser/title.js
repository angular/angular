import { DOM } from 'angular2/src/platform/dom/dom_adapter';
/**
 * A service that can be used to get and set the title of a current HTML document.
 *
 * Since an Angular 2 application can't be bootstrapped on the entire HTML document (`<html>` tag)
 * it is not possible to bind to the `text` property of the `HTMLTitleElement` elements
 * (representing the `<title>` tag). Instead, this service can be used to set and get the current
 * title value.
 */
export class Title {
    /**
     * Get the title of the current HTML document.
     * @returns {string}
     */
    getTitle() { return DOM.getTitle(); }
    /**
     * Set the title of the current HTML document.
     * @param newTitle
     */
    setTitle(newTitle) { DOM.setTitle(newTitle); }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcGxhdGZvcm0vYnJvd3Nlci90aXRsZS50cyJdLCJuYW1lcyI6WyJUaXRsZSIsIlRpdGxlLmdldFRpdGxlIiwiVGl0bGUuc2V0VGl0bGUiXSwibWFwcGluZ3MiOiJPQUFPLEVBQUMsR0FBRyxFQUFDLE1BQU0sdUNBQXVDO0FBRXpEOzs7Ozs7O0dBT0c7QUFDSDtJQUNFQTs7O09BR0dBO0lBQ0hBLFFBQVFBLEtBQWFDLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBRTdDRDs7O09BR0dBO0lBQ0hBLFFBQVFBLENBQUNBLFFBQWdCQSxJQUFJRSxHQUFHQSxDQUFDQSxRQUFRQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUN4REYsQ0FBQ0E7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RE9NfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyJztcblxuLyoqXG4gKiBBIHNlcnZpY2UgdGhhdCBjYW4gYmUgdXNlZCB0byBnZXQgYW5kIHNldCB0aGUgdGl0bGUgb2YgYSBjdXJyZW50IEhUTUwgZG9jdW1lbnQuXG4gKlxuICogU2luY2UgYW4gQW5ndWxhciAyIGFwcGxpY2F0aW9uIGNhbid0IGJlIGJvb3RzdHJhcHBlZCBvbiB0aGUgZW50aXJlIEhUTUwgZG9jdW1lbnQgKGA8aHRtbD5gIHRhZylcbiAqIGl0IGlzIG5vdCBwb3NzaWJsZSB0byBiaW5kIHRvIHRoZSBgdGV4dGAgcHJvcGVydHkgb2YgdGhlIGBIVE1MVGl0bGVFbGVtZW50YCBlbGVtZW50c1xuICogKHJlcHJlc2VudGluZyB0aGUgYDx0aXRsZT5gIHRhZykuIEluc3RlYWQsIHRoaXMgc2VydmljZSBjYW4gYmUgdXNlZCB0byBzZXQgYW5kIGdldCB0aGUgY3VycmVudFxuICogdGl0bGUgdmFsdWUuXG4gKi9cbmV4cG9ydCBjbGFzcyBUaXRsZSB7XG4gIC8qKlxuICAgKiBHZXQgdGhlIHRpdGxlIG9mIHRoZSBjdXJyZW50IEhUTUwgZG9jdW1lbnQuXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICBnZXRUaXRsZSgpOiBzdHJpbmcgeyByZXR1cm4gRE9NLmdldFRpdGxlKCk7IH1cblxuICAvKipcbiAgICogU2V0IHRoZSB0aXRsZSBvZiB0aGUgY3VycmVudCBIVE1MIGRvY3VtZW50LlxuICAgKiBAcGFyYW0gbmV3VGl0bGVcbiAgICovXG4gIHNldFRpdGxlKG5ld1RpdGxlOiBzdHJpbmcpIHsgRE9NLnNldFRpdGxlKG5ld1RpdGxlKTsgfVxufVxuIl19