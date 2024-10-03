import {Component, Directive, Input, NgModule, Pipe} from '@angular/core';

@Directive({
    selector: 'div',
    standalone: false
})
export class DivDir {
  @Input() ternary!: any;
  @Input() pipe!: any;
  @Input() and!: any;
  @Input() or!: any;
}

@Pipe({
    name: 'pipe',
    standalone: false
})
export class PipePipe {
  transform(v: any, a: any, a2: any) {}
}

@Component({
    selector: 'my-component',
    template: `<div
    [ternary]="cond ? [a] : [0]"
    [pipe]="value | pipe:1:2"
    [and]="cond && [b]"
    [or]="cond || [c]"
  ></div>`,
    standalone: false
})
export class MyComponent {
  id = 'one';
  cond = '';
  value = '';
  a = '';
  b = '';
  c = '';
}

@NgModule({declarations: [MyComponent, DivDir, PipePipe]})
export class MyModule {
}
