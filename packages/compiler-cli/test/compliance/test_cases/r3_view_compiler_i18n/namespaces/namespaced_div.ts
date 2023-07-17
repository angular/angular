import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <svg xmlns="http://www.w3.org/2000/svg">
    <foreignObject>
      <xhtml:div xmlns="http://www.w3.org/1999/xhtml" i18n>
        Count: <span>5</span>
      </xhtml:div>
    </foreignObject>
  </svg>
`,
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}