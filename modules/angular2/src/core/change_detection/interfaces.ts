import {Locals} from './parser/locals';
import {BindingTarget, BindingRecord} from './binding_record';
import {DirectiveIndex, DirectiveRecord} from './directive_record';
import {ChangeDetectionStrategy} from './constants';
import {ChangeDetectorRef} from './change_detector_ref';

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

  addContentChild(cd: ChangeDetector): void;
  addViewChild(cd: ChangeDetector): void;
  removeContentChild(cd: ChangeDetector): void;
  removeViewChild(cd: ChangeDetector): void;
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
  constructor(public genDebugInfo: boolean, public logBindingUpdate: boolean,
              public useJit: boolean) {}
}

export class ChangeDetectorDefinition {
  constructor(public id: string, public strategy: ChangeDetectionStrategy,
              public variableNames: string[], public bindingRecords: BindingRecord[],
              public eventRecords: BindingRecord[], public directiveRecords: DirectiveRecord[],
              public genConfig: ChangeDetectorGenConfig) {}
}
