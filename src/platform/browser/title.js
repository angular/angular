'use strict';var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
/**
 * A service that can be used to get and set the title of a current HTML document.
 *
 * Since an Angular 2 application can't be bootstrapped on the entire HTML document (`<html>` tag)
 * it is not possible to bind to the `text` property of the `HTMLTitleElement` elements
 * (representing the `<title>` tag). Instead, this service can be used to set and get the current
 * title value.
 */
var Title = (function () {
    function Title() {
    }
    /**
     * Get the title of the current HTML document.
     * @returns {string}
     */
    Title.prototype.getTitle = function () { return dom_adapter_1.DOM.getTitle(); };
    /**
     * Set the title of the current HTML document.
     * @param newTitle
     */
    Title.prototype.setTitle = function (newTitle) { dom_adapter_1.DOM.setTitle(newTitle); };
    return Title;
})();
exports.Title = Title;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcGxhdGZvcm0vYnJvd3Nlci90aXRsZS50cyJdLCJuYW1lcyI6WyJUaXRsZSIsIlRpdGxlLmNvbnN0cnVjdG9yIiwiVGl0bGUuZ2V0VGl0bGUiLCJUaXRsZS5zZXRUaXRsZSJdLCJtYXBwaW5ncyI6IkFBQUEsNEJBQWtCLHVDQUF1QyxDQUFDLENBQUE7QUFFMUQ7Ozs7Ozs7R0FPRztBQUNIO0lBQUFBO0lBWUFDLENBQUNBO0lBWENEOzs7T0FHR0E7SUFDSEEsd0JBQVFBLEdBQVJBLGNBQXFCRSxNQUFNQSxDQUFDQSxpQkFBR0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFN0NGOzs7T0FHR0E7SUFDSEEsd0JBQVFBLEdBQVJBLFVBQVNBLFFBQWdCQSxJQUFJRyxpQkFBR0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDeERILFlBQUNBO0FBQURBLENBQUNBLEFBWkQsSUFZQztBQVpZLGFBQUssUUFZakIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RE9NfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyJztcblxuLyoqXG4gKiBBIHNlcnZpY2UgdGhhdCBjYW4gYmUgdXNlZCB0byBnZXQgYW5kIHNldCB0aGUgdGl0bGUgb2YgYSBjdXJyZW50IEhUTUwgZG9jdW1lbnQuXG4gKlxuICogU2luY2UgYW4gQW5ndWxhciAyIGFwcGxpY2F0aW9uIGNhbid0IGJlIGJvb3RzdHJhcHBlZCBvbiB0aGUgZW50aXJlIEhUTUwgZG9jdW1lbnQgKGA8aHRtbD5gIHRhZylcbiAqIGl0IGlzIG5vdCBwb3NzaWJsZSB0byBiaW5kIHRvIHRoZSBgdGV4dGAgcHJvcGVydHkgb2YgdGhlIGBIVE1MVGl0bGVFbGVtZW50YCBlbGVtZW50c1xuICogKHJlcHJlc2VudGluZyB0aGUgYDx0aXRsZT5gIHRhZykuIEluc3RlYWQsIHRoaXMgc2VydmljZSBjYW4gYmUgdXNlZCB0byBzZXQgYW5kIGdldCB0aGUgY3VycmVudFxuICogdGl0bGUgdmFsdWUuXG4gKi9cbmV4cG9ydCBjbGFzcyBUaXRsZSB7XG4gIC8qKlxuICAgKiBHZXQgdGhlIHRpdGxlIG9mIHRoZSBjdXJyZW50IEhUTUwgZG9jdW1lbnQuXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICBnZXRUaXRsZSgpOiBzdHJpbmcgeyByZXR1cm4gRE9NLmdldFRpdGxlKCk7IH1cblxuICAvKipcbiAgICogU2V0IHRoZSB0aXRsZSBvZiB0aGUgY3VycmVudCBIVE1MIGRvY3VtZW50LlxuICAgKiBAcGFyYW0gbmV3VGl0bGVcbiAgICovXG4gIHNldFRpdGxlKG5ld1RpdGxlOiBzdHJpbmcpIHsgRE9NLnNldFRpdGxlKG5ld1RpdGxlKTsgfVxufVxuIl19