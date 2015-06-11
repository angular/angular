import {Type, isPresent, global, stringify, BaseException} from 'angular2/src/facade/lang';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {GetterFn, SetterFn, MethodFn} from './types';
import {PlatformReflectionCapabilities} from 'platform_reflection_capabilities';

export class ReflectionCapabilities implements PlatformReflectionCapabilities {
  private _reflect: any;

  constructor(reflect?: any) { this._reflect = isPresent(reflect) ? reflect : global.Reflect; }

  factory(t: Type): Function {
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
        return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) =>
                   new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
      case 11:
        return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) =>
                   new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
      case 12:
        return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) =>
                   new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
      case 13:
        return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) =>
                   new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
      case 14:
        return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14) =>
                   new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14);
      case 15:
        return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15) =>
                   new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15);
      case 16:
        return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16) =>
                   new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16);
      case 17:
        return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17) =>
                   new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16,
                         a17);
      case 18:
        return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18) =>
                   new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17,
                         a18);
      case 19:
        return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18,
                a19) => new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16,
                              a17, a18, a19);
      case 20:
        return (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18,
                a19, a20) => new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15,
                                   a16, a17, a18, a19, a20);
    };

    throw new Error(
        `Cannot create a factory for '${stringify(t)}' because its constructor has more than 20 arguments`);
  }

  _zipTypesAndAnnotaions(paramTypes, paramAnnotations): List<List<any>> {
    var result;

    if (typeof paramTypes === 'undefined') {
      result = ListWrapper.createFixedSize(paramAnnotations.length);
    } else {
      result = ListWrapper.createFixedSize(paramTypes.length);
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
      if (isPresent(paramAnnotations) && isPresent(paramAnnotations[i])) {
        result[i] = result[i].concat(paramAnnotations[i]);
      }
    }
    return result;
  }

  parameters(typeOfFunc): List<List<any>> {
    // Prefer the direct API.
    if (isPresent(typeOfFunc.parameters)) {
      return typeOfFunc.parameters;
    }
    if (isPresent(this._reflect) && isPresent(this._reflect.getMetadata)) {
      var paramAnnotations = this._reflect.getMetadata('parameters', typeOfFunc);
      var paramTypes = this._reflect.getMetadata('design:paramtypes', typeOfFunc);
      if (isPresent(paramTypes) || isPresent(paramAnnotations)) {
        return this._zipTypesAndAnnotaions(paramTypes, paramAnnotations);
      }
    }
    return ListWrapper.createFixedSize(typeOfFunc.length);
  }

  annotations(typeOfFunc): List<any> {
    // Prefer the direct API.
    if (isPresent(typeOfFunc.annotations)) {
      return typeOfFunc.annotations;
    }
    if (isPresent(this._reflect) && isPresent(this._reflect.getMetadata)) {
      var annotations = this._reflect.getMetadata('annotations', typeOfFunc);
      if (isPresent(annotations)) return annotations;
    }
    return [];
  }

  interfaces(type): List<any> { throw new BaseException("JavaScript does not support interfaces"); }

  getter(name: string): GetterFn { return <GetterFn>new Function('o', 'return o.' + name + ';'); }

  setter(name: string): SetterFn {
    return <SetterFn>new Function('o', 'v', 'return o.' + name + ' = v;');
  }

  method(name: string): MethodFn {
    let functionBody = `if (!o.${name}) throw new Error('"${name}" is undefined');
        return o.${name}.apply(o, args);`;
    return <MethodFn>new Function('o', 'args', functionBody);
  }
}
