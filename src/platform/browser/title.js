'use strict';var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
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
//# sourceMappingURL=title.js.map