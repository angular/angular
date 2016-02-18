import {Component} from 'angular2/src/core/metadata';
import {Injectable} from 'angular2/core';

@Component({
  selector: 'basic',
  template: '<div>{{ctxProp}}</div>',

})
@Injectable()
export class Basic {
  ctxProp: string;
  ctxNumProp: number;
  ctxBoolProp: boolean;
  constructor() {
    this.ctxProp = 'initial value';
    this.ctxNumProp = 0;
    this.ctxBoolProp = false;
  }

  throwError() { throw 'boom'; }
}
