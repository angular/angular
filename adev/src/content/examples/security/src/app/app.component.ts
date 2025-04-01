// #docregion
import {Component} from '@angular/core';
import {BypassSecurityComponent} from './bypass-security.component';
import {InnerHtmlBindingComponent} from './inner-html-binding.component';

@Component({
  selector: 'app-root',
  template: `
    <h1>Security</h1>
    <app-inner-html-binding></app-inner-html-binding>
    <app-bypass-security></app-bypass-security>
  `,
  imports: [BypassSecurityComponent, InnerHtmlBindingComponent],
})
export class AppComponent {}
