'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var abstract_control_directive_1 = require('./abstract_control_directive');
var exceptions_1 = require('angular2/src/facade/exceptions');
/**
 * A base class that all control directive extend.
 * It binds a {@link Control} object to a DOM element.
 *
 * Used internally by Angular forms.
 */
var NgControl = (function (_super) {
    __extends(NgControl, _super);
    function NgControl() {
        _super.apply(this, arguments);
        this.name = null;
        this.valueAccessor = null;
    }
    Object.defineProperty(NgControl.prototype, "validator", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgControl.prototype, "asyncValidator", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    return NgControl;
})(abstract_control_directive_1.AbstractControlDirective);
exports.NgControl = NgControl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9uZ19jb250cm9sLnRzIl0sIm5hbWVzIjpbIk5nQ29udHJvbCIsIk5nQ29udHJvbC5jb25zdHJ1Y3RvciIsIk5nQ29udHJvbC52YWxpZGF0b3IiLCJOZ0NvbnRyb2wuYXN5bmNWYWxpZGF0b3IiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0EsMkNBQXVDLDhCQUE4QixDQUFDLENBQUE7QUFDdEUsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFFN0Q7Ozs7O0dBS0c7QUFDSDtJQUF3Q0EsNkJBQXdCQTtJQUFoRUE7UUFBd0NDLDhCQUF3QkE7UUFDOURBLFNBQUlBLEdBQVdBLElBQUlBLENBQUNBO1FBQ3BCQSxrQkFBYUEsR0FBeUJBLElBQUlBLENBQUNBO0lBTTdDQSxDQUFDQTtJQUpDRCxzQkFBSUEsZ0NBQVNBO2FBQWJBLGNBQTRCRSxNQUFNQSxDQUFDQSwwQkFBYUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBRjtJQUNyREEsc0JBQUlBLHFDQUFjQTthQUFsQkEsY0FBaUNHLE1BQU1BLENBQUNBLDBCQUFhQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFIO0lBRzVEQSxnQkFBQ0E7QUFBREEsQ0FBQ0EsQUFSRCxFQUF3QyxxREFBd0IsRUFRL0Q7QUFScUIsaUJBQVMsWUFROUIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29udHJvbFZhbHVlQWNjZXNzb3J9IGZyb20gJy4vY29udHJvbF92YWx1ZV9hY2Nlc3Nvcic7XG5pbXBvcnQge0Fic3RyYWN0Q29udHJvbERpcmVjdGl2ZX0gZnJvbSAnLi9hYnN0cmFjdF9jb250cm9sX2RpcmVjdGl2ZSc7XG5pbXBvcnQge3VuaW1wbGVtZW50ZWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5cbi8qKlxuICogQSBiYXNlIGNsYXNzIHRoYXQgYWxsIGNvbnRyb2wgZGlyZWN0aXZlIGV4dGVuZC5cbiAqIEl0IGJpbmRzIGEge0BsaW5rIENvbnRyb2x9IG9iamVjdCB0byBhIERPTSBlbGVtZW50LlxuICpcbiAqIFVzZWQgaW50ZXJuYWxseSBieSBBbmd1bGFyIGZvcm1zLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTmdDb250cm9sIGV4dGVuZHMgQWJzdHJhY3RDb250cm9sRGlyZWN0aXZlIHtcbiAgbmFtZTogc3RyaW5nID0gbnVsbDtcbiAgdmFsdWVBY2Nlc3NvcjogQ29udHJvbFZhbHVlQWNjZXNzb3IgPSBudWxsO1xuXG4gIGdldCB2YWxpZGF0b3IoKTogRnVuY3Rpb24geyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9XG4gIGdldCBhc3luY1ZhbGlkYXRvcigpOiBGdW5jdGlvbiB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH1cblxuICBhYnN0cmFjdCB2aWV3VG9Nb2RlbFVwZGF0ZShuZXdWYWx1ZTogYW55KTogdm9pZDtcbn1cbiJdfQ==