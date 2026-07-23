import {Component, Directive, NgModule, Pipe} from '@angular/core';

@Component({
  selector: 'my-cmp',
  template: '',
  standalone: false,
})
export class MyComponent {}

@Directive({
  selector: '[my-dir]',
  standalone: false,
})
export class MyDirective {}

@Pipe({
  name: 'myPipe',
  standalone: false,
})
export class MyPipe {
  transform(value: unknown) {
    return value;
  }
}

@NgModule({})
export class SharedModule {}

@NgModule({
  declarations: [MyComponent, MyDirective, MyPipe],
  imports: [SharedModule],
  exports: [MyComponent, SharedModule],
})
export class MyModule {}
