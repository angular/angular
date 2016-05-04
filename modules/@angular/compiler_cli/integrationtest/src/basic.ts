import {Component, Inject} from '@angular/core';
import {FORM_DIRECTIVES, NgIf} from '@angular/common';
import {MyComp} from './a/multiple_components';

@Component({
  selector: 'basic',
  templateUrl: './basic.html',
  styles: ['.red { color: red }'],
  styleUrls: ['./basic.css'],
  directives: [MyComp, FORM_DIRECTIVES, NgIf]
})
export class Basic {
  ctxProp: string;
  ctxBool: boolean;
  constructor() { this.ctxProp = 'initialValue'; }
}
