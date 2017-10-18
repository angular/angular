// #docregion
import { Component }         from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <hero-list></hero-list>
    <hero-list-promise></hero-list-promise>
    <app-wiki></app-wiki>
    <app-wiki-smart></app-wiki-smart>
  `
})
export class AppComponent { }
