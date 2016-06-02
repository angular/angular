import {Injector, THROW_IF_NOT_FOUND} from '../di/injector';
import {BaseException} from '../facade/exceptions';
import {isBlank} from '../facade/lang';

const _UNDEFINED = /*@ts2dart_const*/ new Object();

export abstract class CodegenInjector<CONFIG> implements Injector {
  constructor(
      public parent: Injector, private _hasProviderProperties: boolean, public config: CONFIG) {
    if (_hasProviderProperties && isBlank(config)) {
      throw new BaseException('This injector needs a config object!');
    }
  }

  get(token: any, notFoundValue: any = THROW_IF_NOT_FOUND): any {
    var result = this.getInternal(token, _UNDEFINED);
    return result === _UNDEFINED ? this.parent.get(token, notFoundValue) : result;
  }

  abstract getInternal(token: any, notFoundValue: any): any;
}

export class InjectorFactory<CONFIG> {
  constructor(private _injectorFactory: (parent: Injector, config: CONFIG) => Injector) {}

  create(parent: Injector = null, config: CONFIG = null): Injector {
    if (isBlank(parent)) {
      parent = Injector.NULL;
    }
    return this._injectorFactory(parent, config);
  }
}
