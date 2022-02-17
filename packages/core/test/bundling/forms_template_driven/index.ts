/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Component, NgModule, ɵNgModuleFactory as NgModuleFactory, ɵwhenRendered as whenRendered} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule, platformBrowser} from '@angular/platform-browser';

@Component({
  selector: 'app-template-forms',
  template: `
    <form novalidate>
      <div ngModelGroup="profileForm">
        <div>
          First Name:
          <input name="first" ngModel required />
        </div>
        <div>
          Last Name:
          <input name="last" ngModel />
        </div>
        <div>
          Subscribe:
          <input name="subscribed" type="checkbox" ngModel />
        </div>

        <div>Disabled: <input name="foo" ngModel disabled /></div>

        <div *ngFor="let city of addresses; let i = index">
          City <input [(ngModel)]="addresses[i].city" name="name" />
        </div>

        <button (click)="addCity()">Add City</button>
      </div>
    </form>
  `
})
class TemplateFormsComponent {
  name = {first: 'Nancy', last: 'Drew', subscribed: true};
  addresses = [{city: 'Toronto'}];
  constructor() {
    // We use this reference in our test
    (window as any).templateFormsComponent = this;
  }

  addCity() {
    this.addresses.push({city: ''});
  }
}

@Component({
  selector: 'app-root',
  template: `
    <app-template-forms></app-template-forms>
  `
})
class RootComponent {
}

@NgModule({
  declarations: [RootComponent, TemplateFormsComponent],
  imports: [BrowserModule, FormsModule],
})
class FormsExampleModule {
  ngDoBootstrap(app: any) {
    app.bootstrap(RootComponent);
  }
}

function bootstrapApp() {
  return platformBrowser().bootstrapModuleFactory(
      new NgModuleFactory(FormsExampleModule), {ngZone: 'noop'});
}

// This bundle includes `@angular/core` within it which means that the test asserting
// against it will load a different core bundle. These symbols are exposed so that they
// can interact with the correct `@angular/core` instance.
module.exports = {
  whenRendered,
  bootstrapApp
};
