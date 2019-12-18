/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {withBody} from '@angular/private/testing';

describe('bootstrap', () => {
  it('should bootstrap using #id selector',
     withBody('<div>before|</div><button id="my-app"></button>', async() => {
       try {
         const ngModuleRef = await platformBrowserDynamic().bootstrapModule(IdSelectorAppModule);
         expect(document.body.textContent).toEqual('before|works!');
         ngModuleRef.destroy();
       } catch (err) {
         console.error(err);
       }
     }));

  it('should bootstrap using one of selectors from the list',
     withBody('<div>before|</div><div class="bar"></div>', async() => {
       try {
         const ngModuleRef =
             await platformBrowserDynamic().bootstrapModule(MultipleSelectorsAppModule);
         expect(document.body.textContent).toEqual('before|works!');
         ngModuleRef.destroy();
       } catch (err) {
         console.error(err);
       }
     }));
});

@Component({
  selector: '#my-app',
  template: 'works!',
})
export class IdSelectorAppComponent {
}

@NgModule({
  imports: [BrowserModule],
  declarations: [IdSelectorAppComponent],
  bootstrap: [IdSelectorAppComponent],
})
export class IdSelectorAppModule {
}

@Component({
  selector: '[foo],span,.bar',
  template: 'works!',
})
export class MultipleSelectorsAppComponent {
}

@NgModule({
  imports: [BrowserModule],
  declarations: [MultipleSelectorsAppComponent],
  bootstrap: [MultipleSelectorsAppComponent],
})
export class MultipleSelectorsAppModule {
}