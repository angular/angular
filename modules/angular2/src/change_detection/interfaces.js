import {List} from 'angular2/src/facade/collection';
import {Locals} from './parser/locals';
import {DEFAULT} from './constants';
import {BindingRecord} from './binding_record';

export class ProtoChangeDetector  {
  instantiate(dispatcher:any, bindingRecords:List, variableBindings:List, directiveRecords:List):ChangeDetector{
    return null;
  }
}

/**
 * Interface used by Angular to control the change detection strategy for an application.
 *
 * Angular implements the following change detection strategies by default:
 *
 * - [dynamicChangeDetection]: slower, but does not require `eval()`.
 * - [jitChangeDetection]: faster, but requires `eval()`.
 *
 * In JavaScript, you should always use `jitChangeDetection`, unless you are in an environment that has
 * [CSP](https://developer.mozilla.org/en-US/docs/Web/Security/CSP), such as a Chrome Extension.
 *
 * In Dart, use `dynamicChangeDetection` during development. The Angular transformer generates an analog to the
 * `jitChangeDetection` strategy at compile time.
 *
 *
 * See: [dynamicChangeDetection], [jitChangeDetection]
 *
 * # Example
 * ```javascript
 * bootstrap(MyApp, [bind(ChangeDetection).toValue(dynamicChangeDetection)]);
 * ```
 * @exportedAs angular2/change_detection
 */
export class ChangeDetection {
  createProtoChangeDetector(name:string, changeControlStrategy:string=DEFAULT):ProtoChangeDetector{
    return null;
  }
}

export class ChangeDispatcher {
  notifyOnBinding(bindingRecord:BindingRecord, value:any) {}
}

export class ChangeDetector {
  parent:ChangeDetector;
  mode:string;

  addChild(cd:ChangeDetector) {}
  addShadowDomChild(cd:ChangeDetector) {}
  removeChild(cd:ChangeDetector) {}
  removeShadowDomChild(cd:ChangeDetector) {}
  remove() {}
  hydrate(context:any, locals:Locals, directives:any) {}
  dehydrate() {}
  markPathToRootAsCheckOnce() {}

  detectChanges() {}
  checkNoChanges() {}
}
