import {Component, Injectable} from '@angular/core';

@Component({
  template: '<div>Hello {{ name }}!</div>',
})
@Injectable()
export class HelloWorldComponent {
  name: string = 'world';
}
