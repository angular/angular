import {CONST} from 'angular2/src/core/facade/lang';
import {Locals} from './parser/locals';
import {BindingTarget, BindingRecord} from './binding_record';
import {DirectiveIndex, DirectiveRecord} from './directive_record';
import {ChangeDetectionStrategy} from './constants';
import {ChangeDetectorRef} from './change_detector_ref';

/**
 * Interface used by Angular to control the change detection strategy for an application.
 *
 * Angular implements the following change detection strategies by default:
 *
 * - {@link DynamicChangeDetection}: slower, but does not require `eval()`.
 * - {@link JitChangeDetection}: faster, but requires `eval()`.
 *
 * In JavaScript, you should always use `JitChangeDetection`, unless you are in an environment that
 *has
 * [CSP](https://developer.mozilla.org/en-US/docs/Web/Security/CSP), such as a Chrome Extension.
 *
 * In Dart, use `DynamicChangeDetection` during development. The Angular transformer generates an
 *analog to the
 * `JitChangeDetection` strategy at compile time.
 *
 *
 * See: {@link DynamicChangeDetection}, {@link JitChangeDetection},
 * {@link PreGeneratedChangeDetection}
 *
 * # Example
 * ```javascript
 * bootstrap(MyApp, [bind(ChangeDetection).toValue(new DynamicChangeDetection())]);
 * ```
 */
@CONST()
export class ChangeDetection {
  getProtoChangeDetector(id: string, definition: ChangeDetectorDefinition): ProtoChangeDetector {
    return null;
  }

  get generateDetectors(): boolean { return null; }

  get genConfig(): ChangeDetectorGenConfig { return null; }
}

export class DebugContext {
  constructor(public element: any, public componentElement: any, public directive: any,
              public context: any, public locals: any, public injector: any) {}
}

export interface ChangeDispatcher {
  getDebugContext(elementIndex: number, directiveIndex: DirectiveIndex): DebugContext;
  notifyOnBinding(bindingTarget: BindingTarget, value: any): void;
  logBindingUpdate(bindingTarget: BindingTarget, value: any): void;
  notifyAfterContentChecked(): void;
  notifyAfterViewChecked(): void;
}

export interface ChangeDetector {
  parent: ChangeDetector;
  mode: ChangeDetectionStrategy;
  ref: ChangeDetectorRef;

  addChild(cd: ChangeDetector): void;
  addShadowDomChild(cd: ChangeDetector): void;
  removeChild(cd: ChangeDetector): void;
  removeShadowDomChild(cd: ChangeDetector): void;
  remove(): void;
  hydrate(context: any, locals: Locals, directives: any, pipes: any): void;
  dehydrate(): void;
  markPathToRootAsCheckOnce(): void;

  handleEvent(eventName: string, elIndex: number, locals: Locals);
  detectChanges(): void;
  checkNoChanges(): void;
}

export interface ProtoChangeDetector { instantiate(dispatcher: ChangeDispatcher): ChangeDetector; }

export class ChangeDetectorGenConfig {
  constructor(public genCheckNoChanges: boolean, public genDebugInfo: boolean,
              public logBindingUpdate: boolean) {}
}

export class ChangeDetectorDefinition {
  constructor(public id: string, public strategy: ChangeDetectionStrategy,
              public variableNames: string[], public bindingRecords: BindingRecord[],
              public eventRecords: BindingRecord[], public directiveRecords: DirectiveRecord[],
              public genConfig: ChangeDetectorGenConfig) {}
}
