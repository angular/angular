import { isPresent, isFunction, global, stringify } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
export class ReflectionCapabilities {
    constructor(reflect) {
        this._reflect = isPresent(reflect) ? reflect : global.Reflect;
    }
    isReflectionEnabled() { return true; }
    factory(t) {
        switch (t.length) {
            case 0:
                return () => new t();
            case 1:
                return (a1) => new t(a1);
            case 2:
                return (a1, a2) => new t(a1, a2);
            case 3:
                return (a1, a2, a3) => new t(a1, a2, a3);
            case 4:
                return (a1, a2, a3, a4) => new t(a1, a2, a3, a4);
            case 5:
                return (a1, a2, a3, a4, a5) => new t(a1, a2, a3, a4, a5);
            case 6:
                return (a1, a2, a3, a4, a5, a6) => new t(a1, a2, a3, a4, a5, a6);
            case 7:
                return (a1, a2, a3, a4, a5, a6, a7) => new t(a1, a2, a3, a4, a5, a6, a7);
            case 8:
                return (a1, a2, a3, a4, a5, a6, a7, a8) => new t(a1, a2, a3, a4, a5, a6, a7, a8);
            case 9:
                return (a1, a2, a3, a4, a5, a6, a7, a8, a9) => new t(a1, a2, a3, a4, a5, a6, a7, a8, a9);
            case 10:
                return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) => new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
            case 11:
                return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) => new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
            case 12:
                return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) => new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
            case 13:
                return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) => new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
            case 14:
                return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14) => new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14);
            case 15:
                return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15) => new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15);
            case 16:
                return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16) => new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16);
            case 17:
                return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17) => new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17);
            case 18:
                return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18) => new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18);
            case 19:
                return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19) => new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19);
            case 20:
                return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20) => new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20);
        }
        ;
        throw new Error(`Cannot create a factory for '${stringify(t)}' because its constructor has more than 20 arguments`);
    }
    /** @internal */
    _zipTypesAndAnnotaions(paramTypes, paramAnnotations) {
        var result;
        if (typeof paramTypes === 'undefined') {
            result = new Array(paramAnnotations.length);
        }
        else {
            result = new Array(paramTypes.length);
        }
        for (var i = 0; i < result.length; i++) {
            // TS outputs Object for parameters without types, while Traceur omits
            // the annotations. For now we preserve the Traceur behavior to aid
            // migration, but this can be revisited.
            if (typeof paramTypes === 'undefined') {
                result[i] = [];
            }
            else if (paramTypes[i] != Object) {
                result[i] = [paramTypes[i]];
            }
            else {
                result[i] = [];
            }
            if (isPresent(paramAnnotations) && isPresent(paramAnnotations[i])) {
                result[i] = result[i].concat(paramAnnotations[i]);
            }
        }
        return result;
    }
    parameters(typeOrFunc) {
        // Prefer the direct API.
        if (isPresent(typeOrFunc.parameters)) {
            return typeOrFunc.parameters;
        }
        if (isPresent(this._reflect) && isPresent(this._reflect.getMetadata)) {
            var paramAnnotations = this._reflect.getMetadata('parameters', typeOrFunc);
            var paramTypes = this._reflect.getMetadata('design:paramtypes', typeOrFunc);
            if (isPresent(paramTypes) || isPresent(paramAnnotations)) {
                return this._zipTypesAndAnnotaions(paramTypes, paramAnnotations);
            }
        }
        // The array has to be filled with `undefined` because holes would be skipped by `some`
        let parameters = new Array(typeOrFunc.length);
        parameters.fill(undefined);
        return parameters;
    }
    annotations(typeOrFunc) {
        // Prefer the direct API.
        if (isPresent(typeOrFunc.annotations)) {
            var annotations = typeOrFunc.annotations;
            if (isFunction(annotations) && annotations.annotations) {
                annotations = annotations.annotations;
            }
            return annotations;
        }
        if (isPresent(this._reflect) && isPresent(this._reflect.getMetadata)) {
            var annotations = this._reflect.getMetadata('annotations', typeOrFunc);
            if (isPresent(annotations))
                return annotations;
        }
        return [];
    }
    propMetadata(typeOrFunc) {
        // Prefer the direct API.
        if (isPresent(typeOrFunc.propMetadata)) {
            var propMetadata = typeOrFunc.propMetadata;
            if (isFunction(propMetadata) && propMetadata.propMetadata) {
                propMetadata = propMetadata.propMetadata;
            }
            return propMetadata;
        }
        if (isPresent(this._reflect) && isPresent(this._reflect.getMetadata)) {
            var propMetadata = this._reflect.getMetadata('propMetadata', typeOrFunc);
            if (isPresent(propMetadata))
                return propMetadata;
        }
        return {};
    }
    interfaces(type) {
        throw new BaseException("JavaScript does not support interfaces");
    }
    getter(name) { return new Function('o', 'return o.' + name + ';'); }
    setter(name) {
        return new Function('o', 'v', 'return o.' + name + ' = v;');
    }
    method(name) {
        let functionBody = `if (!o.${name}) throw new Error('"${name}" is undefined');
        return o.${name}.apply(o, args);`;
        return new Function('o', 'args', functionBody);
    }
    // There is not a concept of import uri in Js, but this is useful in developing Dart applications.
    importUri(type) { return './'; }
}
