import {Component, NgModule, Pipe} from '@angular/core';

@Pipe({name: 'uppercase'})
export class UppercasePipe {
  transform(v: any) {}
}

@Component({
  selector: 'my-component',
  template: `
  <div i18n>
  My i18n block #1 with value: {{ valueA }}
  <span i18n-title title="Span title {{ valueB }} and {{ valueC }}">
    Plain text in nested element (block #1)
  </span>
</div>
<div i18n>
  My i18n block #2 with value {{ valueD | uppercase }}
  <span i18n-title title="Span title {{ valueE }}">
    Plain text in nested element (block #2)
  </span>
</div>
`,
})
export class MyComponent {
  valueA!: any;
  valueB!: any;
  valueC!: any;
  valueD!: any;
  valueE!: any;
}

@NgModule({declarations: [UppercasePipe, MyComponent]})
export class MyModule {
}
