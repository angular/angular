import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div i18n-title title="Some &amp; attribute"></div>
  <div i18n>Some &amp; message</div>
  <div i18n-title title="Some &amp; {{'interpolated'}} attribute"></div>
  <div i18n>Some &amp; {{'interpolated' }} message</div>
  <div i18n>&amp;</div>
  <div i18n>&amp;&quot;</div>
  <div i18n-title title="&quot;"></div>
  <div i18n-title title="&quot;&quot;"></div>
`
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
