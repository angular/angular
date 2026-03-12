import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <div>
    Some content
    <div *ngIf="visible">
      <div i18n>
        Some other content {{ valueA }}
        <div>
          More nested levels with bindings {{ valueB | uppercase }}
        </div>
      </div>
    </div>
  </div>
`,
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}