import {ON_PUSH} from './constants';
import {StringWrapper} from 'angular2/src/facade/lang';

export class DirectiveRecord {
  elementIndex:number;
  directiveIndex:number;
  callOnAllChangesDone:boolean;
  callOnChange:boolean;
  changeDetection:string;

  constructor(elementIndex:number, directiveIndex:number, 
              callOnAllChangesDone:boolean, callOnChange:boolean, changeDetection:string) {
    this.elementIndex = elementIndex;
    this.directiveIndex = directiveIndex;
    this.callOnAllChangesDone = callOnAllChangesDone;
    this.callOnChange = callOnChange;
    this.changeDetection = changeDetection;
  }

  isOnPushChangeDetection():boolean {
    return StringWrapper.equals(this.changeDetection, ON_PUSH);
  }

  get name() {
    return `${this.elementIndex}_${this.directiveIndex}`;
  }
}