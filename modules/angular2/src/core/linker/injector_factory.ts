import {Injector, THROW_IF_NOT_FOUND} from '../di/injector';
import {BaseException} from 'angular2/src/facade/exceptions';
import {isBlank, CONST_EXPR, CONST} from 'angular2/src/facade/lang';

const _UNDEFINED = CONST_EXPR(new Object());

export abstract class CodegenInjector<MODULE> implements Injector {
  constructor(
      public parent: Injector, _needsMainModule, public mainModule: MODULE) {
    if (_needsMainModule && isBlank(mainModule)) {
      throw new BaseException('This injector needs a main module instance!');
    }
  }

  get(token: any, notFoundValue: any = THROW_IF_NOT_FOUND): any {
    var result = this.getInternal(token, _UNDEFINED);
    return result === _UNDEFINED ? this.parent.get(token, notFoundValue) : result;
  }

  abstract getInternal(token: any, notFoundValue: any): any;
}

@CONST()
export class InjectorFactory<MODULE> {
  constructor(private _injectorFactory: (parent: Injector, mainModule: MODULE) => Injector) {}

  create(parent: Injector = null, mainModule: MODULE = null): Injector {
    if (isBlank(parent)) {
      parent = Injector.NULL;
    }
    return this._injectorFactory(parent, mainModule);
  }
}
