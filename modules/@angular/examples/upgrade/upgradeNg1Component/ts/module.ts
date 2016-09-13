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


// #docregion upgradeNg1Componnent
// Start with instantiating UpgradeAdapter which will be used to create facades between the
// two framworks.
const adapter = new UpgradeAdapter(forwardRef(() => MyNg2Module));

// Also create AngularJS 1 module.
const module = angular.module('myExample', []);

// Create an example of component AngularJS 1 directive.
// NOTE: Only directives which have templates can be upgraded.
module.directive('ng1Hello', function() {
  return {scope: {title: '='}, template: 'ng1[Hello {{title}}!](<span ng-transclude></span>)'};
});


// An example of Angular 2 component which will be using Angular JS 1 component directive.
// Note: Anguler 2 binding syntax applies when instantiating AngularJS 1 component directive.
@Component({
  selector: 'ng2-comp',
  inputs: ['name'],
  template: 'ng2[<ng1-hello [title]="name">transclude</ng1-hello>]'
})
class Ng2Component {
}

// Declare all components in the NgModule. Angular 2 components are declared normally, while
// AngularJS components must be also listed using `upgradeNg1Component`.
@NgModule({
  declarations: [Ng2Component, adapter.upgradeNg1Component('ng1Hello')],
  imports: [BrowserModule]
})
class MyNg2Module {
}
// #enddocregion

module.directive('ng2Comp', adapter.downgradeNg2Component(Ng2Component));
module.directive('exampleApp', () => ({template: '<ng2-comp></ng2-comp>'}));
adapter.bootstrap(document.body, ['myExample']);
