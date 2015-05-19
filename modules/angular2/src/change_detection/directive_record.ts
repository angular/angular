import {ON_PUSH} from './constants';
import {StringWrapper} from 'angular2/src/facade/lang';

export class DirectiveIndex {
  constructor(public elementIndex: number, public directiveIndex: number) {}

  get name() { return `${this.elementIndex}_${this.directiveIndex}`; }
}

export class DirectiveRecord {
  constructor(public directiveIndex: DirectiveIndex, public callOnAllChangesDone: boolean,
              public callOnChange: boolean, public changeDetection: string) {}

  isOnPushChangeDetection(): boolean { return StringWrapper.equals(this.changeDetection, ON_PUSH); }
}