import {Component, NgModule, Pipe} from '@angular/core';

@Pipe({
    name: 'pipe',
    standalone: false
})
export class PipePipe {
  transform(v: any) {}
}

@Component({
    selector: 'my-component',
    template: `
    <div [class]="{}"
         [class.foo]="fooExp | pipe:2000"
         [style]="myStyleExp | pipe:1000"
         [style.bar]="barExp | pipe:3000"
         [style.baz]="bazExp | pipe:4000">
         {{ item }}</div>`,
    standalone: false
})
export class MyComponent {
  myStyleExp = {};
  fooExp = 'foo';
  barExp = 'bar';
  bazExp = 'baz';
  items = [1, 2, 3];
  item = 1;
}

@NgModule({declarations: [MyComponent, PipePipe]})
export class MyModule {
}
