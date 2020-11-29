import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div i18n>
    My i18n block #{{ one }}
    <span>Plain text in nested element</span>
  </div>
  <div i18n>
    My i18n block #{{ two | uppercase }}
    <div>
      <div>
        <span>
          More bindings in more nested element: {{ nestedInBlockTwo }}
        </span>
      </div>
    </div>
  </div>
`,
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}