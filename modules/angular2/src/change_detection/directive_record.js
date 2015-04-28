import {ON_PUSH} from './constants';
import {StringWrapper} from 'angular2/src/facade/lang';

export class DirectiveIndex {
  elementIndex:number;
  directiveIndex:number;

  constructor(elementIndex:number, directiveIndex:number) {
    this.elementIndex = elementIndex;
    this.directiveIndex = directiveIndex;
  }

  get name() {
    return `${this.elementIndex}_${this.directiveIndex}`;
  }
}

export class DirectiveRecord {
  directiveIndex:DirectiveIndex;
  callOnAllChangesDone:boolean;
  callOnChange:boolean;
  changeDetection:string;

  constructor(directiveIndex:DirectiveIndex, callOnAllChangesDone:boolean, callOnChange:boolean, changeDetection:string) {
    this.directiveIndex = directiveIndex;
    this.callOnAllChangesDone = callOnAllChangesDone;
    this.callOnChange = callOnChange;
    this.changeDetection = changeDetection;
  }

  isOnPushChangeDetection():boolean {
    return StringWrapper.equals(this.changeDetection, ON_PUSH);
  }
}