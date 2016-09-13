/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Injectable, Input, NgModule, forwardRef} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {UpgradeAdapter} from '@angular/upgrade';
import {IAngularStatic} from '@types/angular';
declare var angular: IAngularStatic;


// #docregion downgradeNg2Component
// Start with instantiating UpgradeAdapter which will be used to create facades between the
// two framworks.
const adapter = new UpgradeAdapter(forwardRef(() => MyNg2Module));

// Declare Angular 2 component as you would normally would.
@Component({selector: 'greet', template: '{{salutation}} {{name}}! - <ng-content></ng-content>'})
class Greeter {
  @Input() salutation: string;
  @Input() name: string;
}

// Add the Angular 2 component into NgModule as normally.
@NgModule({declarations: [Greeter], imports: [BrowserModule]})
class MyNg2Module {
}


var module = angular.module('myExample', []);

// Downgrade the Angular 2 component into AngularJS 2 directive.
module.directive('greet', adapter.downgradeNg2Component(Greeter));

// Here is an example of how the Angular 2 component can be used from Angular JS 1 template
// Notice that the content transclusion / reprojection works as expected.
// Notice thet the downgraded Angular 2 component uses Angular 2 syntax for binding.
module.directive(
    'exampleApp',
    () => ({
      template: `<greet salutation="Hello" [name]=" 'W' + 'orld' ">transclude content</greet>`
    }));

// #enddocregion
adapter.bootstrap(document.body, ['myExample']);
