import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div i18n="meaningA|descA@@idA">Content A</div>
  <div i18n-title="meaningB|descB@@idB" title="Title B">Content B</div>
  <div i18n-title="meaningC|" title="Title C">Content C</div>
  <div i18n-title="meaningD|descD" title="Title D">Content D</div>
  <div i18n-title="meaningE@@idE" title="Title E">Content E</div>
  <div i18n-title="@@idF" title="Title F">Content F</div>
  <div i18n-title="[BACKUP_$\{MESSAGE}_ID:idH]\`desc@@idG" title="Title G">Content G</div>
  <div i18n="Some text \\' [BACKUP_MESSAGE_ID: xxx]">Content H</div>
`
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}