'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * A base class for the WrappedException that can be used to identify
 * a WrappedException from ExceptionHandler without adding circular
 * dependency.
 */
var BaseWrappedException = (function (_super) {
    __extends(BaseWrappedException, _super);
    function BaseWrappedException(message) {
        _super.call(this, message);
    }
    Object.defineProperty(BaseWrappedException.prototype, "wrapperMessage", {
        get: function () { return ''; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseWrappedException.prototype, "wrapperStack", {
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseWrappedException.prototype, "originalException", {
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseWrappedException.prototype, "originalStack", {
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseWrappedException.prototype, "context", {
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseWrappedException.prototype, "message", {
        get: function () { return ''; },
        enumerable: true,
        configurable: true
    });
    return BaseWrappedException;
}(Error));
exports.BaseWrappedException = BaseWrappedException;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZV93cmFwcGVkX2V4Y2VwdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9mYWNhZGUvYmFzZV93cmFwcGVkX2V4Y2VwdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7OztHQUlHO0FBQ0g7SUFBMEMsd0NBQUs7SUFDN0MsOEJBQVksT0FBZTtRQUFJLGtCQUFNLE9BQU8sQ0FBQyxDQUFDO0lBQUMsQ0FBQztJQUVoRCxzQkFBSSxnREFBYzthQUFsQixjQUErQixNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFDM0Msc0JBQUksOENBQVk7YUFBaEIsY0FBMEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBQ3hDLHNCQUFJLG1EQUFpQjthQUFyQixjQUErQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFDN0Msc0JBQUksK0NBQWE7YUFBakIsY0FBMkIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBQ3pDLHNCQUFJLHlDQUFPO2FBQVgsY0FBcUIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBQ25DLHNCQUFJLHlDQUFPO2FBQVgsY0FBd0IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBQ3RDLDJCQUFDO0FBQUQsQ0FBQyxBQVRELENBQTBDLEtBQUssR0FTOUM7QUFUWSw0QkFBb0IsdUJBU2hDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEEgYmFzZSBjbGFzcyBmb3IgdGhlIFdyYXBwZWRFeGNlcHRpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBpZGVudGlmeVxuICogYSBXcmFwcGVkRXhjZXB0aW9uIGZyb20gRXhjZXB0aW9uSGFuZGxlciB3aXRob3V0IGFkZGluZyBjaXJjdWxhclxuICogZGVwZW5kZW5jeS5cbiAqL1xuZXhwb3J0IGNsYXNzIEJhc2VXcmFwcGVkRXhjZXB0aW9uIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcpIHsgc3VwZXIobWVzc2FnZSk7IH1cblxuICBnZXQgd3JhcHBlck1lc3NhZ2UoKTogc3RyaW5nIHsgcmV0dXJuICcnOyB9XG4gIGdldCB3cmFwcGVyU3RhY2soKTogYW55IHsgcmV0dXJuIG51bGw7IH1cbiAgZ2V0IG9yaWdpbmFsRXhjZXB0aW9uKCk6IGFueSB7IHJldHVybiBudWxsOyB9XG4gIGdldCBvcmlnaW5hbFN0YWNrKCk6IGFueSB7IHJldHVybiBudWxsOyB9XG4gIGdldCBjb250ZXh0KCk6IGFueSB7IHJldHVybiBudWxsOyB9XG4gIGdldCBtZXNzYWdlKCk6IHN0cmluZyB7IHJldHVybiAnJzsgfVxufVxuIl19