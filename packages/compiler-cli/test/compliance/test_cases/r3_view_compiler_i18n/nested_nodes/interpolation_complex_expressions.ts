import {Component, NgModule, Pipe} from '@angular/core';

@Pipe({
    name: 'async',
    standalone: false
})
export class AsyncPipe {
  transform(v: any) {}
}

@Component({
    selector: 'my-component',
    template: `
  <div i18n>
    {{ valueA | async }}
    {{ valueA?.a?.b }}
    {{ valueA.getRawValue()?.getTitle() }}
  </div>
  `,
    standalone: false
})
export class MyComponent {
  valueA!: any;
}

@NgModule({declarations: [MyComponent, AsyncPipe]})
export class MyModule {
}
