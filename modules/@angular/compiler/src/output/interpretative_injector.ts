import {Injector} from '@angular/core';

import {CodegenInjector} from '../../core_private';
import {BaseException} from '../../src/facade/exceptions';
import {isPresent} from '../../src/facade/lang';

import {InstanceFactory, DynamicInstance} from './output_interpreter';

export class InterpretiveInjectorInstanceFactory implements InstanceFactory {
  createInstance(
      superClass: any, clazz: any, args: any[], props: Map<string, any>,
      getters: Map<string, Function>, methods: Map<string, Function>): any {
    if (superClass === CodegenInjector) {
      args = args.concat([null]);
      return new _InterpretiveInjector(args, clazz, props, getters, methods);
    }
    throw new BaseException(`Can't instantiate class ${superClass} in interpretative mode`);
  }
}

class _InterpretiveInjector extends CodegenInjector<any> implements DynamicInstance {
  constructor(
      args: any[], public clazz: any, public props: Map<string, any>,
      public getters: Map<string, Function>, public methods: Map<string, Function>) {
    super(args[0], args[1], args[2]);
  }
  getInternal(token: any, notFoundResult: any): any {
    var m = this.methods.get('getInternal');
    return m(token, notFoundResult);
  }
}
