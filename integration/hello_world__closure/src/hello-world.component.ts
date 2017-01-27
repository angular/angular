import {Component, Injectable} from '@angular/core';

@Component({
  selector: 'hello-world-app',
  template: '<div>Hello {{ name }}!</div>',
})
@Injectable()
export class HelloWorldComponent {
  name: string = 'world';
}
