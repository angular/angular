'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
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
}(exceptions_1.BaseException));
exports.InvalidPipeArgumentException = InvalidPipeArgumentException;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52YWxpZF9waXBlX2FyZ3VtZW50X2V4Y2VwdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9jb21tb24vcGlwZXMvaW52YWxpZF9waXBlX2FyZ3VtZW50X2V4Y2VwdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxxQkFBOEIsMEJBQTBCLENBQUMsQ0FBQTtBQUN6RCwyQkFBOEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUUvRTtJQUFrRCxnREFBYTtJQUM3RCxzQ0FBWSxJQUFVLEVBQUUsS0FBYTtRQUNuQyxrQkFBTSx1QkFBcUIsS0FBSyxvQkFBZSxnQkFBUyxDQUFDLElBQUksQ0FBQyxNQUFHLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBQ0gsbUNBQUM7QUFBRCxDQUFDLEFBSkQsQ0FBa0QsMEJBQWEsR0FJOUQ7QUFKWSxvQ0FBNEIsK0JBSXhDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1R5cGUsIHN0cmluZ2lmeX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcblxuZXhwb3J0IGNsYXNzIEludmFsaWRQaXBlQXJndW1lbnRFeGNlcHRpb24gZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IodHlwZTogVHlwZSwgdmFsdWU6IE9iamVjdCkge1xuICAgIHN1cGVyKGBJbnZhbGlkIGFyZ3VtZW50ICcke3ZhbHVlfScgZm9yIHBpcGUgJyR7c3RyaW5naWZ5KHR5cGUpfSdgKTtcbiAgfVxufVxuIl19