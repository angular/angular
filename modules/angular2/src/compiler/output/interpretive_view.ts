import {isPresent} from 'angular2/src/facade/lang';
import {AppView} from 'angular2/src/core/linker/view';
import {BaseException} from 'angular2/src/facade/exceptions';
import {InstanceFactory, DynamicInstance} from './output_interpreter';

export class InterpretiveAppViewInstanceFactory implements InstanceFactory {
  createInstance(superClass: any, clazz: any, args: any[], props: Map<string, any>,
                 getters: Map<string, Function>, methods: Map<string, Function>): any {
    if (superClass === AppView) {
      return new _InterpretiveAppView(args, props, getters, methods);
    }
    throw new BaseException(`Can't instantiate class ${superClass} in interpretative mode`);
  }
}

class _InterpretiveAppView extends AppView<any> implements DynamicInstance {
  constructor(args: any[], public props: Map<string, any>, public getters: Map<string, Function>,
              public methods: Map<string, Function>) {
    super(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9],
          args[10]);
  }
  createInternal(rootSelector: string): void {
    var m = this.methods.get('createInternal');
    if (isPresent(m)) {
      m(rootSelector);
    } else {
      super.createInternal(rootSelector);
    }
  }
  injectorGetInternal(token: any, nodeIndex: number, notFoundResult: any): any {
    var m = this.methods.get('injectorGetInternal');
    if (isPresent(m)) {
      return m(token, nodeIndex, notFoundResult);
    } else {
      return super.injectorGet(token, nodeIndex, notFoundResult);
    }
  }
  destroyInternal(): void {
    var m = this.methods.get('destroyInternal');
    if (isPresent(m)) {
      return m();
    } else {
      return super.destroyInternal();
    }
  }
  dirtyParentQueriesInternal(): void {
    var m = this.methods.get('dirtyParentQueriesInternal');
    if (isPresent(m)) {
      return m();
    } else {
      return super.dirtyParentQueriesInternal();
    }
  }
  detectChangesInternal(throwOnChange: boolean): void {
    var m = this.methods.get('detectChangesInternal');
    if (isPresent(m)) {
      return m(throwOnChange);
    } else {
      return super.detectChangesInternal(throwOnChange);
    }
  }
}
