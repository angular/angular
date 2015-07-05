import {ON_PUSH} from './constants';
import {StringWrapper, normalizeBool} from 'angular2/src/facade/lang';

export class DirectiveIndex {
  constructor(public elementIndex: number, public directiveIndex: number) {}

  get name() { return `${this.elementIndex}_${this.directiveIndex}`; }
}

export class DirectiveRecord {
  directiveIndex: DirectiveIndex;
  callOnAllChangesDone: boolean;
  callOnChange: boolean;
  callOnCheck: boolean;
  callOnInit: boolean;
  isComponent: boolean;
  changeDetection: string;

  constructor({directiveIndex, callOnAllChangesDone, callOnChange, callOnCheck, callOnInit,
               changeDetection, isComponent}: {
    directiveIndex?: DirectiveIndex,
    callOnAllChangesDone?: boolean,
    callOnChange?: boolean,
    callOnCheck?: boolean,
    callOnInit?: boolean,
    isComponent?: boolean,
    changeDetection?: string
  } = {}) {
    this.directiveIndex = directiveIndex;
    this.callOnAllChangesDone = normalizeBool(callOnAllChangesDone);
    this.callOnChange = normalizeBool(callOnChange);
    this.callOnCheck = normalizeBool(callOnCheck);
    this.callOnInit = normalizeBool(callOnInit);
    this.isComponent = normalizeBool(isComponent);
    this.changeDetection = changeDetection;
  }

  isOnPushChangeDetection(): boolean { return StringWrapper.equals(this.changeDetection, ON_PUSH); }
}