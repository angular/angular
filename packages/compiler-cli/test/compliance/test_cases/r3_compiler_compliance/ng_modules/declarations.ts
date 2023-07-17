import {Component, Directive, NgModule, Pipe, PipeTransform} from '@angular/core';

@Component({selector: 'foo', template: '<div>Hello, {{name}}!</div>'})
export class FooComponent {
  name = 'World';
}

@Directive({selector: '[bar]'})
export class BarDirective {
}

@Pipe({name: 'qux'})
export class QuxPipe implements PipeTransform {
  transform() {}
}

@NgModule({declarations: [FooComponent, BarDirective, QuxPipe], bootstrap: [FooComponent]})
export class FooModule {
}
