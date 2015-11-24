import { isPresent } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { Map, MapWrapper, Set, SetWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
export class ReflectionInfo {
    constructor(annotations, parameters, factory, interfaces, propMetadata) {
        this.annotations = annotations;
        this.parameters = parameters;
        this.factory = factory;
        this.interfaces = interfaces;
        this.propMetadata = propMetadata;
    }
}
export class Reflector {
    constructor(reflectionCapabilities) {
        /** @internal */
        this._injectableInfo = new Map();
        /** @internal */
        this._getters = new Map();
        /** @internal */
        this._setters = new Map();
        /** @internal */
        this._methods = new Map();
        this._usedKeys = null;
        this.reflectionCapabilities = reflectionCapabilities;
    }
    isReflectionEnabled() { return this.reflectionCapabilities.isReflectionEnabled(); }
    /**
     * Causes `this` reflector to track keys used to access
     * {@link ReflectionInfo} objects.
     */
    trackUsage() { this._usedKeys = new Set(); }
    /**
     * Lists types for which reflection information was not requested since
     * {@link #trackUsage} was called. This list could later be audited as
     * potential dead code.
     */
    listUnusedKeys() {
        if (this._usedKeys == null) {
            throw new BaseException('Usage tracking is disabled');
        }
        var allTypes = MapWrapper.keys(this._injectableInfo);
        return allTypes.filter(key => !SetWrapper.has(this._usedKeys, key));
    }
    registerFunction(func, funcInfo) {
        this._injectableInfo.set(func, funcInfo);
    }
    registerType(type, typeInfo) {
        this._injectableInfo.set(type, typeInfo);
    }
    registerGetters(getters) { _mergeMaps(this._getters, getters); }
    registerSetters(setters) { _mergeMaps(this._setters, setters); }
    registerMethods(methods) { _mergeMaps(this._methods, methods); }
    factory(type) {
        if (this._containsReflectionInfo(type)) {
            var res = this._getReflectionInfo(type).factory;
            return isPresent(res) ? res : null;
        }
        else {
            return this.reflectionCapabilities.factory(type);
        }
    }
    parameters(typeOrFunc) {
        if (this._injectableInfo.has(typeOrFunc)) {
            var res = this._getReflectionInfo(typeOrFunc).parameters;
            return isPresent(res) ? res : [];
        }
        else {
            return this.reflectionCapabilities.parameters(typeOrFunc);
        }
    }
    annotations(typeOrFunc) {
        if (this._injectableInfo.has(typeOrFunc)) {
            var res = this._getReflectionInfo(typeOrFunc).annotations;
            return isPresent(res) ? res : [];
        }
        else {
            return this.reflectionCapabilities.annotations(typeOrFunc);
        }
    }
    propMetadata(typeOrFunc) {
        if (this._injectableInfo.has(typeOrFunc)) {
            var res = this._getReflectionInfo(typeOrFunc).propMetadata;
            return isPresent(res) ? res : {};
        }
        else {
            return this.reflectionCapabilities.propMetadata(typeOrFunc);
        }
    }
    interfaces(type) {
        if (this._injectableInfo.has(type)) {
            var res = this._getReflectionInfo(type).interfaces;
            return isPresent(res) ? res : [];
        }
        else {
            return this.reflectionCapabilities.interfaces(type);
        }
    }
    getter(name) {
        if (this._getters.has(name)) {
            return this._getters.get(name);
        }
        else {
            return this.reflectionCapabilities.getter(name);
        }
    }
    setter(name) {
        if (this._setters.has(name)) {
            return this._setters.get(name);
        }
        else {
            return this.reflectionCapabilities.setter(name);
        }
    }
    method(name) {
        if (this._methods.has(name)) {
            return this._methods.get(name);
        }
        else {
            return this.reflectionCapabilities.method(name);
        }
    }
    /** @internal */
    _getReflectionInfo(typeOrFunc) {
        if (isPresent(this._usedKeys)) {
            this._usedKeys.add(typeOrFunc);
        }
        return this._injectableInfo.get(typeOrFunc);
    }
    /** @internal */
    _containsReflectionInfo(typeOrFunc) { return this._injectableInfo.has(typeOrFunc); }
    importUri(type) { return this.reflectionCapabilities.importUri(type); }
}
function _mergeMaps(target, config) {
    StringMapWrapper.forEach(config, (v, k) => target.set(k, v));
}
//# sourceMappingURL=reflector.js.map