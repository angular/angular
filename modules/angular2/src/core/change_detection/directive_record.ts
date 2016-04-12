import {StringWrapper, normalizeBool, isBlank} from 'angular2/src/facade/lang';
import {isDefaultChangeDetectionStrategy, ChangeDetectionStrategy} from './constants';

export class DirectiveIndex {
  constructor(public elementIndex: number, public directiveIndex: number) {}

  get name() { return `${this.elementIndex}_${this.directiveIndex}`; }
}

export class DirectiveRecord {
  directiveIndex: DirectiveIndex;
  callAfterContentInit: boolean;
  callAfterContentChecked: boolean;
  callAfterViewInit: boolean;
  callAfterViewChecked: boolean;
  callOnChanges: boolean;
  callDoCheck: boolean;
  callOnInit: boolean;
  callOnDestroy: boolean;
  changeDetection: ChangeDetectionStrategy;
  // array of [emitter property name, eventName]
  outputs: string[][];

  constructor({directiveIndex, callAfterContentInit, callAfterContentChecked, callAfterViewInit,
               callAfterViewChecked, callOnChanges, callDoCheck, callOnInit, callOnDestroy,
               changeDetection, outputs}: {
    directiveIndex?: DirectiveIndex,
    callAfterContentInit?: boolean,
    callAfterContentChecked?: boolean,
    callAfterViewInit?: boolean,
    callAfterViewChecked?: boolean,
    callOnChanges?: boolean,
    callDoCheck?: boolean,
    callOnInit?: boolean,
    callOnDestroy?: boolean,
    changeDetection?: ChangeDetectionStrategy,
    outputs?: string[][]
  } = {}) {
    this.directiveIndex = directiveIndex;
    this.callAfterContentInit = normalizeBool(callAfterContentInit);
    this.callAfterContentChecked = normalizeBool(callAfterContentChecked);
    this.callOnChanges = normalizeBool(callOnChanges);
    this.callAfterViewInit = normalizeBool(callAfterViewInit);
    this.callAfterViewChecked = normalizeBool(callAfterViewChecked);
    this.callDoCheck = normalizeBool(callDoCheck);
    this.callOnInit = normalizeBool(callOnInit);
    this.callOnDestroy = normalizeBool(callOnDestroy);
    this.changeDetection = changeDetection;
    this.outputs = outputs;
  }

  isDefaultChangeDetection(): boolean {
    return isDefaultChangeDetectionStrategy(this.changeDetection);
  }
}
