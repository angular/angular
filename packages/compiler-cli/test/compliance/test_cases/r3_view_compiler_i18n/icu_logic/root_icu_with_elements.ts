import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
    <span i18n="someText1">{
      someField,
      select,
      WEBSITE {
        <strong>someText</strong>
      }
    }</span>

    <span>
    {
      someField,
      select,
      WEBSITE {
        <strong>someText</strong>
      }
    }
    </span>
`,
})
export class MyComponent {
  someField!: any;
}