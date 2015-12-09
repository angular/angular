'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var InvalidPipeArgumentException = (function (_super) {
    __extends(InvalidPipeArgumentException, _super);
    function InvalidPipeArgumentException(type, value) {
        _super.call(this, "Invalid argument '" + value + "' for pipe '" + lang_1.stringify(type) + "'");
    }
    return InvalidPipeArgumentException;
})(exceptions_1.BaseException);
exports.InvalidPipeArgumentException = InvalidPipeArgumentException;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52YWxpZF9waXBlX2FyZ3VtZW50X2V4Y2VwdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vcGlwZXMvaW52YWxpZF9waXBlX2FyZ3VtZW50X2V4Y2VwdGlvbi50cyJdLCJuYW1lcyI6WyJJbnZhbGlkUGlwZUFyZ3VtZW50RXhjZXB0aW9uIiwiSW52YWxpZFBpcGVBcmd1bWVudEV4Y2VwdGlvbi5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxxQkFBcUMsMEJBQTBCLENBQUMsQ0FBQTtBQUNoRSwyQkFBOEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUUvRTtJQUFrREEsZ0RBQWFBO0lBQzdEQSxzQ0FBWUEsSUFBVUEsRUFBRUEsS0FBYUE7UUFDbkNDLGtCQUFNQSx1QkFBcUJBLEtBQUtBLG9CQUFlQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBR0EsQ0FBQ0EsQ0FBQ0E7SUFDckVBLENBQUNBO0lBQ0hELG1DQUFDQTtBQUFEQSxDQUFDQSxBQUpELEVBQWtELDBCQUFhLEVBSTlEO0FBSlksb0NBQTRCLCtCQUl4QyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDT05TVCwgVHlwZSwgc3RyaW5naWZ5fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuXG5leHBvcnQgY2xhc3MgSW52YWxpZFBpcGVBcmd1bWVudEV4Y2VwdGlvbiBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3Rvcih0eXBlOiBUeXBlLCB2YWx1ZTogT2JqZWN0KSB7XG4gICAgc3VwZXIoYEludmFsaWQgYXJndW1lbnQgJyR7dmFsdWV9JyBmb3IgcGlwZSAnJHtzdHJpbmdpZnkodHlwZSl9J2ApO1xuICB9XG59XG4iXX0=