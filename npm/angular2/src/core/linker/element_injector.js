'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var injector_1 = require('angular2/src/core/di/injector');
var _UNDEFINED = new Object();
var ElementInjector = (function (_super) {
    __extends(ElementInjector, _super);
    function ElementInjector(_view, _nodeIndex) {
        _super.call(this);
        this._view = _view;
        this._nodeIndex = _nodeIndex;
    }
    ElementInjector.prototype.get = function (token, notFoundValue) {
        if (notFoundValue === void 0) { notFoundValue = injector_1.THROW_IF_NOT_FOUND; }
        var result = _UNDEFINED;
        if (result === _UNDEFINED) {
            result = this._view.injectorGet(token, this._nodeIndex, _UNDEFINED);
        }
        if (result === _UNDEFINED) {
            result = this._view.parentInjector.get(token, notFoundValue);
        }
        return result;
    };
    return ElementInjector;
}(injector_1.Injector));
exports.ElementInjector = ElementInjector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudF9pbmplY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9lbGVtZW50X2luamVjdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHlCQUEyQywrQkFBK0IsQ0FBQyxDQUFBO0FBRzNFLElBQU0sVUFBVSxHQUFzQixJQUFJLE1BQU0sRUFBRSxDQUFDO0FBRW5EO0lBQXFDLG1DQUFRO0lBQzNDLHlCQUFvQixLQUFtQixFQUFVLFVBQWtCO1FBQUksaUJBQU8sQ0FBQztRQUEzRCxVQUFLLEdBQUwsS0FBSyxDQUFjO1FBQVUsZUFBVSxHQUFWLFVBQVUsQ0FBUTtJQUFhLENBQUM7SUFFakYsNkJBQUcsR0FBSCxVQUFJLEtBQVUsRUFBRSxhQUF1QztRQUF2Qyw2QkFBdUMsR0FBdkMsNkNBQXVDO1FBQ3JELElBQUksTUFBTSxHQUFHLFVBQVUsQ0FBQztRQUN4QixFQUFFLENBQUMsQ0FBQyxNQUFNLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQztZQUMxQixNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDdEUsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLE1BQU0sS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQzFCLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQy9ELENBQUM7UUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFDSCxzQkFBQztBQUFELENBQUMsQUFiRCxDQUFxQyxtQkFBUSxHQWE1QztBQWJZLHVCQUFlLGtCQWEzQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RvciwgVEhST1dfSUZfTk9UX0ZPVU5EfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9pbmplY3Rvcic7XG5pbXBvcnQge0FwcFZpZXd9IGZyb20gJy4vdmlldyc7XG5cbmNvbnN0IF9VTkRFRklORUQgPSAvKkB0czJkYXJ0X2NvbnN0Ki8gbmV3IE9iamVjdCgpO1xuXG5leHBvcnQgY2xhc3MgRWxlbWVudEluamVjdG9yIGV4dGVuZHMgSW5qZWN0b3Ige1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF92aWV3OiBBcHBWaWV3PGFueT4sIHByaXZhdGUgX25vZGVJbmRleDogbnVtYmVyKSB7IHN1cGVyKCk7IH1cblxuICBnZXQodG9rZW46IGFueSwgbm90Rm91bmRWYWx1ZTogYW55ID0gVEhST1dfSUZfTk9UX0ZPVU5EKTogYW55IHtcbiAgICB2YXIgcmVzdWx0ID0gX1VOREVGSU5FRDtcbiAgICBpZiAocmVzdWx0ID09PSBfVU5ERUZJTkVEKSB7XG4gICAgICByZXN1bHQgPSB0aGlzLl92aWV3LmluamVjdG9yR2V0KHRva2VuLCB0aGlzLl9ub2RlSW5kZXgsIF9VTkRFRklORUQpO1xuICAgIH1cbiAgICBpZiAocmVzdWx0ID09PSBfVU5ERUZJTkVEKSB7XG4gICAgICByZXN1bHQgPSB0aGlzLl92aWV3LnBhcmVudEluamVjdG9yLmdldCh0b2tlbiwgbm90Rm91bmRWYWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn1cbiJdfQ==