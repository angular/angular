import {Component} from 'angular2/core';


@Component({
  selector: 'demo-app',
  providers: [],
  templateUrl: 'demo-app/demo-app.html',
  directives: [],
  pipes: []
})
export class DemoApp {
  defaultMeaning: number = 42;
  
  meaningOfLife(meaning: number) {
    return `The meaning of life is ${meaning || this.defaultMeaning}`;
  }
}
