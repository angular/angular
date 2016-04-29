import {Component, Injectable} from 'angular2/core';
import {FORM_DIRECTIVES} from 'angular2/common';
import {MyComp} from './a/multiple_components';

@Component({
  selector: 'basic',
  templateUrl: './basic.html',
  directives: [MyComp, FORM_DIRECTIVES],
})
@Injectable()
export class Basic {
  ctxProp: string;
  constructor() { this.ctxProp = 'initial value'; }
}
