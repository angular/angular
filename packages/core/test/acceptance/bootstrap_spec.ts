/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {getComponentDef} from '@angular/core/src/render3/definition';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {onlyInIvy, withBody} from '@angular/private/testing';

describe('bootstrap', () => {
  onlyInIvy('VE does not allow reading selectors').it('Component should have id selector', () => {
    const componentDef = getComponentDef(MyAppComponent) !;
    expect(componentDef.selectors).toEqual([['', 'id', 'my-app']]);
  });

  it('should bootstrap using #id selector', withBody('<div #my-app>', async() => {
       try {
         const ngModuleRef = await platformBrowserDynamic().bootstrapModule(MyAppModule);
         expect(document.body.textContent).toEqual('works!');
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
export class MyAppComponent {
}

@NgModule({imports: [BrowserModule], declarations: [MyAppComponent], bootstrap: [MyAppComponent]})
export class MyAppModule {
}
