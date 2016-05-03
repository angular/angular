import {Component, Inject} from '@angular/core';
import {FORM_DIRECTIVES} from '@angular/common';
import {MyComp} from './a/multiple_components';

@Component({
  selector: 'basic',
  templateUrl: './basic.html',
  styles: ['.red { color: red }'],
  styleUrls: ['./basic.css'],
  directives: [MyComp, FORM_DIRECTIVES]
})
export class Basic {
  ctxProp: string;
  constructor() { this.ctxProp = 'initiaValue'; }
}
