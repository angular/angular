/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {global, isPresent, stringify} from '../facade/lang';
import {Type} from '../type';

import {PlatformReflectionCapabilities} from './platform_reflection_capabilities';
import {GetterFn, MethodFn, SetterFn} from './types';

export class ReflectionCapabilities implements PlatformReflectionCapabilities {
  private _reflect: any;

  constructor(reflect?: any) { this._reflect = reflect || global.Reflect; }

  isReflectionEnabled(): boolean { return true; }

  factory<T>(t: Type<T>): (args: any[]) => T { return (...args: any[]) => new t(...args); }

  /** @internal */
  _zipTypesAndAnnotations(paramTypes: any[], paramAnnotations: any[]): any[][] {
    var result: any[][];

    if (typeof paramTypes === 'undefined') {
      result = new Array(paramAnnotations.length);
    } else {
      result = new Array(paramTypes.length);
    }

    for (var i = 0; i < result.length; i++) {
      // TS outputs Object for parameters without types, while Traceur omits
      // the annotations. For now we preserve the Traceur behavior to aid
      // migration, but this can be revisited.
      if (typeof paramTypes === 'undefined') {
        result[i] = [];
      } else if (paramTypes[i] != Object) {
        result[i] = [paramTypes[i]];
      } else {
        result[i] = [];
      }
      if (paramAnnotations && isPresent(paramAnnotations[i])) {
        result[i] = result[i].concat(paramAnnotations[i]);
      }
    }
    return result;
  }

  parameters(type: Type<any>): any[][] {
    // Prefer the direct API.
    if ((<any>type).parameters) {
      return (<any>type).parameters;
    }

    // API of tsickle for lowering decorators to properties on the class.
    if ((<any>type).ctorParameters) {
      const ctorParameters = (<any>type).ctorParameters;
      const paramTypes = ctorParameters.map((ctorParam: any) => ctorParam && ctorParam.type);
      const paramAnnotations = ctorParameters.map(
          (ctorParam: any) =>
              ctorParam && convertTsickleDecoratorIntoMetadata(ctorParam.decorators));
      return this._zipTypesAndAnnotations(paramTypes, paramAnnotations);
    }

    // API for metadata created by invoking the decorators.
    if (isPresent(this._reflect) && isPresent(this._reflect.getMetadata)) {
      const paramAnnotations = this._reflect.getMetadata('parameters', type);
      const paramTypes = this._reflect.getMetadata('design:paramtypes', type);
      if (paramTypes || paramAnnotations) {
        return this._zipTypesAndAnnotations(paramTypes, paramAnnotations);
      }
    }
    // The array has to be filled with `undefined` because holes would be skipped by `some`
    return new Array((<any>type.length)).fill(undefined);
  }

  annotations(typeOrFunc: Type<any>): any[] {
    // Prefer the direct API.
    if ((<any>typeOrFunc).annotations) {
      let annotations = (<any>typeOrFunc).annotations;
      if (typeof annotations === 'function' && annotations.annotations) {
        annotations = annotations.annotations;
      }
      return annotations;
    }

    // API of tsickle for lowering decorators to properties on the class.
    if ((<any>typeOrFunc).decorators) {
      return convertTsickleDecoratorIntoMetadata((<any>typeOrFunc).decorators);
    }

    // API for metadata created by invoking the decorators.
    if (this._reflect && this._reflect.getMetadata) {
      const annotations = this._reflect.getMetadata('annotations', typeOrFunc);
      if (annotations) return annotations;
    }
    return [];
  }

  propMetadata(typeOrFunc: any): {[key: string]: any[]} {
    // Prefer the direct API.
    if ((<any>typeOrFunc).propMetadata) {
      let propMetadata = (<any>typeOrFunc).propMetadata;
      if (typeof propMetadata === 'function' && propMetadata.propMetadata) {
        propMetadata = propMetadata.propMetadata;
      }
      return propMetadata;
    }

    // API of tsickle for lowering decorators to properties on the class.
    if ((<any>typeOrFunc).propDecorators) {
      const propDecorators = (<any>typeOrFunc).propDecorators;
      const propMetadata = <{[key: string]: any[]}>{};
      Object.keys(propDecorators).forEach(prop => {
        propMetadata[prop] = convertTsickleDecoratorIntoMetadata(propDecorators[prop]);
      });
      return propMetadata;
    }

    // API for metadata created by invoking the decorators.
    if (this._reflect && this._reflect.getMetadata) {
      const propMetadata = this._reflect.getMetadata('propMetadata', typeOrFunc);
      if (propMetadata) return propMetadata;
    }
    return {};
  }

  hasLifecycleHook(type: any, lcProperty: string): boolean {
    return type instanceof Type && lcProperty in type.prototype;
  }

  getter(name: string): GetterFn { return <GetterFn>new Function('o', 'return o.' + name + ';'); }

  setter(name: string): SetterFn {
    return <SetterFn>new Function('o', 'v', 'return o.' + name + ' = v;');
  }

  method(name: string): MethodFn {
    const functionBody = `if (!o.${name}) throw new Error('"${name}" is undefined');
        return o.${name}.apply(o, args);`;
    return <MethodFn>new Function('o', 'args', functionBody);
  }

  // There is not a concept of import uri in Js, but this is useful in developing Dart applications.
  importUri(type: any): string {
    // StaticSymbol
    if (typeof type === 'object' && type['filePath']) {
      return type['filePath'];
    }
    // Runtime type
    return `./${stringify(type)}`;
  }

  resolveIdentifier(name: string, moduleUrl: string, runtime: any): any { return runtime; }
  resolveEnum(enumIdentifier: any, name: string): any { return enumIdentifier[name]; }
}

function convertTsickleDecoratorIntoMetadata(decoratorInvocations: any[]): any[] {
  if (!decoratorInvocations) {
    return [];
  }
  return decoratorInvocations.map(decoratorInvocation => {
    const decoratorType = decoratorInvocation.type;
    const annotationCls = decoratorType.annotationCls;
    const annotationArgs = decoratorInvocation.args ? decoratorInvocation.args : [];
    return new annotationCls(...annotationArgs);
  });
}
