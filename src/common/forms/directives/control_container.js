'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var abstract_control_directive_1 = require('./abstract_control_directive');
/**
 * A directive that contains multiple {@link NgControl}s.
 *
 * Only used by the forms module.
 */
var ControlContainer = (function (_super) {
    __extends(ControlContainer, _super);
    function ControlContainer() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(ControlContainer.prototype, "formDirective", {
        /**
         * Get the form to which this container belongs.
         */
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ControlContainer.prototype, "path", {
        /**
         * Get the path to this container.
         */
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    return ControlContainer;
})(abstract_control_directive_1.AbstractControlDirective);
exports.ControlContainer = ControlContainer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbF9jb250YWluZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2Zvcm1zL2RpcmVjdGl2ZXMvY29udHJvbF9jb250YWluZXIudHMiXSwibmFtZXMiOlsiQ29udHJvbENvbnRhaW5lciIsIkNvbnRyb2xDb250YWluZXIuY29uc3RydWN0b3IiLCJDb250cm9sQ29udGFpbmVyLmZvcm1EaXJlY3RpdmUiLCJDb250cm9sQ29udGFpbmVyLnBhdGgiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0EsMkNBQXVDLDhCQUE4QixDQUFDLENBQUE7QUFFdEU7Ozs7R0FJRztBQUNIO0lBQXNDQSxvQ0FBd0JBO0lBQTlEQTtRQUFzQ0MsOEJBQXdCQTtJQVk5REEsQ0FBQ0E7SUFOQ0Qsc0JBQUlBLDJDQUFhQTtRQUhqQkE7O1dBRUdBO2FBQ0hBLGNBQTRCRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFGO0lBSzFDQSxzQkFBSUEsa0NBQUlBO1FBSFJBOztXQUVHQTthQUNIQSxjQUF1QkcsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBSDtJQUN2Q0EsdUJBQUNBO0FBQURBLENBQUNBLEFBWkQsRUFBc0MscURBQXdCLEVBWTdEO0FBWlksd0JBQWdCLG1CQVk1QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtGb3JtfSBmcm9tICcuL2Zvcm1faW50ZXJmYWNlJztcbmltcG9ydCB7QWJzdHJhY3RDb250cm9sRGlyZWN0aXZlfSBmcm9tICcuL2Fic3RyYWN0X2NvbnRyb2xfZGlyZWN0aXZlJztcblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSB0aGF0IGNvbnRhaW5zIG11bHRpcGxlIHtAbGluayBOZ0NvbnRyb2x9cy5cbiAqXG4gKiBPbmx5IHVzZWQgYnkgdGhlIGZvcm1zIG1vZHVsZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbnRyb2xDb250YWluZXIgZXh0ZW5kcyBBYnN0cmFjdENvbnRyb2xEaXJlY3RpdmUge1xuICBuYW1lOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgZm9ybSB0byB3aGljaCB0aGlzIGNvbnRhaW5lciBiZWxvbmdzLlxuICAgKi9cbiAgZ2V0IGZvcm1EaXJlY3RpdmUoKTogRm9ybSB7IHJldHVybiBudWxsOyB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcGF0aCB0byB0aGlzIGNvbnRhaW5lci5cbiAgICovXG4gIGdldCBwYXRoKCk6IHN0cmluZ1tdIHsgcmV0dXJuIG51bGw7IH1cbn1cbiJdfQ==