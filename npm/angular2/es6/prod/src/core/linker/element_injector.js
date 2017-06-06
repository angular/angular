import { Injector, THROW_IF_NOT_FOUND } from 'angular2/src/core/di/injector';
const _UNDEFINED = new Object();
export class ElementInjector extends Injector {
    constructor(_view, _nodeIndex) {
        super();
        this._view = _view;
        this._nodeIndex = _nodeIndex;
    }
    get(token, notFoundValue = THROW_IF_NOT_FOUND) {
        var result = _UNDEFINED;
        if (result === _UNDEFINED) {
            result = this._view.injectorGet(token, this._nodeIndex, _UNDEFINED);
        }
        if (result === _UNDEFINED) {
            result = this._view.parentInjector.get(token, notFoundValue);
        }
        return result;
    }
}
