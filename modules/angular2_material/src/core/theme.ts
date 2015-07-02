import {Directive} from 'angular2/angular2';

@Directive({selector: '[md-theme]'})
export class MdTheme {
  color: string;

  constructor() {
    this.color = 'sky-blue'
  }
}
