import {Decorator} from 'angular2/angular2';

@Decorator({
  selector: '[md-theme]'
})
export class MdTheme {
  color: string;

  constructor() {
    this.color = 'sky-blue'
  }
}
