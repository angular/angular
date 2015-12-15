var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { CONST_EXPR, isPresent, NumberWrapper } from 'angular2/src/facade/lang';
import { Map } from 'angular2/src/facade/collection';
import { Injectable, Provider } from 'angular2/src/core/di';
import { AppViewListener } from 'angular2/src/core/linker/view_listener';
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
import { Renderer } from 'angular2/src/core/render/api';
import { DebugElement_ } from 'angular2/src/core/debug/debug_element';
const NG_ID_PROPERTY = 'ngid';
const INSPECT_GLOBAL_NAME = 'ng.probe';
const NG_ID_SEPARATOR = '#';
// Need to keep the views in a global Map so that multiple angular apps are supported
var _allIdsByView = new Map();
var _allViewsById = new Map();
var _nextId = 0;
function _setElementId(element, indices) {
    if (isPresent(element) && DOM.isElementNode(element)) {
        DOM.setData(element, NG_ID_PROPERTY, indices.join(NG_ID_SEPARATOR));
    }
}
function _getElementId(element) {
    var elId = DOM.getData(element, NG_ID_PROPERTY);
    if (isPresent(elId)) {
        return elId.split(NG_ID_SEPARATOR).map(partStr => NumberWrapper.parseInt(partStr, 10));
    }
    else {
        return null;
    }
}
/**
 * Returns a {@link DebugElement} for the given native DOM element, or
 * null if the given native element does not have an Angular view associated
 * with it.
 */
export function inspectNativeElement(element) {
    var elId = _getElementId(element);
    if (isPresent(elId)) {
        var view = _allViewsById.get(elId[0]);
        if (isPresent(view)) {
            return new DebugElement_(view, elId[1]);
        }
    }
    return null;
}
export let DebugElementViewListener = class {
    constructor(_renderer) {
        this._renderer = _renderer;
        DOM.setGlobalVar(INSPECT_GLOBAL_NAME, inspectNativeElement);
    }
    onViewCreated(view) {
        var viewId = _nextId++;
        _allViewsById.set(viewId, view);
        _allIdsByView.set(view, viewId);
        for (var i = 0; i < view.elementRefs.length; i++) {
            var el = view.elementRefs[i];
            _setElementId(this._renderer.getNativeElementSync(el), [viewId, i]);
        }
    }
    onViewDestroyed(view) {
        var viewId = _allIdsByView.get(view);
        _allIdsByView.delete(view);
        _allViewsById.delete(viewId);
    }
};
DebugElementViewListener = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [Renderer])
], DebugElementViewListener);
/**
 * Providers which support debugging Angular applications (e.g. via `ng.probe`).
 *
 * ## Example
 *
 * {@example platform/dom/debug/ts/debug_element_view_listener/providers.ts region='providers'}
 */
export const ELEMENT_PROBE_PROVIDERS = CONST_EXPR([
    DebugElementViewListener,
    CONST_EXPR(new Provider(AppViewListener, { useExisting: DebugElementViewListener })),
]);
/**
 * Use {@link ELEMENT_PROBE_PROVIDERS}.
 *
 * @deprecated
 */
export const ELEMENT_PROBE_BINDINGS = ELEMENT_PROBE_PROVIDERS;
