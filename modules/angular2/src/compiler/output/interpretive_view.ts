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
  injectorGet(token: any, nodeIndex: number, notFoundResult: any): any {
    var m = this.methods.get('injectorGet');
    if (isPresent(m)) {
      return m(token, nodeIndex, notFoundResult);
    } else {
      return super.injectorGet(token, nodeIndex, notFoundResult);
    }
  }
  injectorPrivateGet(token: any, nodeIndex: number, notFoundResult: any): any {
    var m = this.methods.get('injectorPrivateGet');
    if (isPresent(m)) {
      return m(token, nodeIndex, notFoundResult);
    } else {
      return super.injectorPrivateGet(token, nodeIndex, notFoundResult);
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
  afterContentLifecycleCallbacksInternal(): void {
    var m = this.methods.get('afterContentLifecycleCallbacksInternal');
    if (isPresent(m)) {
      return m();
    } else {
      return super.afterContentLifecycleCallbacksInternal();
    }
  }
  updateContentQueriesInternal(): void {
    var m = this.methods.get('updateContentQueriesInternal');
    if (isPresent(m)) {
      return m();
    } else {
      return super.updateContentQueriesInternal();
    }
  }
  afterViewLifecycleCallbacksInternal(): void {
    var m = this.methods.get('afterViewLifecycleCallbacksInternal');
    if (isPresent(m)) {
      return m();
    } else {
      return super.afterViewLifecycleCallbacksInternal();
    }
  }
  updateViewQueriesInternal(): void {
    var m = this.methods.get('updateViewQueriesInternal');
    if (isPresent(m)) {
      return m();
    } else {
      return super.updateViewQueriesInternal();
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
  detectChangesInInputsInternal(): void {
    var m = this.methods.get('detectChangesInInputsInternal');
    if (isPresent(m)) {
      return m();
    } else {
      return super.detectChangesInInputsInternal();
    }
  }
  detectChangesHostPropertiesInternal(): void {
    var m = this.methods.get('detectChangesHostPropertiesInternal');
    if (isPresent(m)) {
      return m();
    } else {
      return super.detectChangesHostPropertiesInternal();
    }
  }
  checkNoChangesInternal(): void {
    var m = this.methods.get('checkNoChangesInternal');
    if (isPresent(m)) {
      return m();
    } else {
      return super.checkNoChangesInternal();
    }
  }
}
