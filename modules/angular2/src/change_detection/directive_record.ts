import {ON_PUSH} from './constants';
import {StringWrapper} from 'angular2/src/facade/lang';

// HACK: workaround for Traceur behavior.
// It expects all transpiled modules to contain this marker.
// TODO: remove this when we no longer use traceur
export var __esModule = true;

export class DirectiveIndex {
  constructor(public elementIndex: number, public directiveIndex: number) {}

  get name() { return `${this.elementIndex}_${this.directiveIndex}`; }
}

export class DirectiveRecord {
  constructor(public directiveIndex: DirectiveIndex, public callOnAllChangesDone: boolean,
              public callOnChange: boolean, public changeDetection: string) {}

  isOnPushChangeDetection(): boolean { return StringWrapper.equals(this.changeDetection, ON_PUSH); }
}