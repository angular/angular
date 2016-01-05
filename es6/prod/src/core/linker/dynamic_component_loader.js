var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/src/core/di';
import { Compiler } from './compiler';
import { isPresent } from 'angular2/src/facade/lang';
import { AppViewManager } from 'angular2/src/core/linker/view_manager';
/**
 * Represents an instance of a Component created via {@link DynamicComponentLoader}.
 *
 * `ComponentRef` provides access to the Component Instance as well other objects related to this
 * Component Instance and allows you to destroy the Component Instance via the {@link #dispose}
 * method.
 */
export class ComponentRef {
    /**
     * The {@link ViewRef} of the Host View of this Component instance.
     */
    get hostView() { return this.location.parentView; }
    /**
     * @internal
     *
     * The instance of the component.
     *
     * TODO(i): this api should be removed
     */
    get hostComponent() { return this.instance; }
}
export class ComponentRef_ extends ComponentRef {
    /**
     * TODO(i): refactor into public/private fields
     */
    constructor(location, instance, componentType, injector, _dispose) {
        super();
        this._dispose = _dispose;
        this.location = location;
        this.instance = instance;
        this.componentType = componentType;
        this.injector = injector;
    }
    /**
     * @internal
     *
     * Returns the type of this Component instance.
     *
     * TODO(i): this api should be removed
     */
    get hostComponentType() { return this.componentType; }
    dispose() { this._dispose(); }
}
/**
 * Service for instantiating a Component and attaching it to a View at a specified location.
 */
export class DynamicComponentLoader {
}
export let DynamicComponentLoader_ = class extends DynamicComponentLoader {
    constructor(_compiler, _viewManager) {
        super();
        this._compiler = _compiler;
        this._viewManager = _viewManager;
    }
    loadAsRoot(type, overrideSelector, injector, onDispose) {
        return this._compiler.compileInHost(type).then(hostProtoViewRef => {
            var hostViewRef = this._viewManager.createRootHostView(hostProtoViewRef, overrideSelector, injector);
            var newLocation = this._viewManager.getHostElement(hostViewRef);
            var component = this._viewManager.getComponent(newLocation);
            var dispose = () => {
                if (isPresent(onDispose)) {
                    onDispose();
                }
                this._viewManager.destroyRootHostView(hostViewRef);
            };
            return new ComponentRef_(newLocation, component, type, injector, dispose);
        });
    }
    loadIntoLocation(type, hostLocation, anchorName, providers = null) {
        return this.loadNextToLocation(type, this._viewManager.getNamedElementInComponentView(hostLocation, anchorName), providers);
    }
    loadNextToLocation(type, location, providers = null) {
        return this._compiler.compileInHost(type).then(hostProtoViewRef => {
            var viewContainer = this._viewManager.getViewContainer(location);
            var hostViewRef = viewContainer.createHostView(hostProtoViewRef, viewContainer.length, providers);
            var newLocation = this._viewManager.getHostElement(hostViewRef);
            var component = this._viewManager.getComponent(newLocation);
            var dispose = () => {
                var index = viewContainer.indexOf(hostViewRef);
                if (index !== -1) {
                    viewContainer.remove(index);
                }
            };
            return new ComponentRef_(newLocation, component, type, null, dispose);
        });
    }
};
DynamicComponentLoader_ = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [Compiler, AppViewManager])
], DynamicComponentLoader_);
