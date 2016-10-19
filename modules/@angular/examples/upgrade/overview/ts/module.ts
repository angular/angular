/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule, forwardRef} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {UpgradeAdapter} from '@angular/upgrade';
import {IAngularStatic} from '@types/angular';
declare var angular: IAngularStatic;


// #docregion Overview

// Create an UpgradeAdapter which will bridge the two frameworks
const adapter = new UpgradeAdapter(forwardRef(() => MyNg2Module));

// Declare Angular 2 component
@Component({
  selector: 'ng2-comp',
  inputs: ['name'],
  template: 'ng2[<ng1-hello [title]="name">transclude</ng1-hello>](<ng-content></ng-content>)'
})
class Ng2Component {
}

// Place Angular 2 component into its coresponding NgModule
@NgModule({
  declarations: [Ng2Component, adapter.upgradeNg1Component('ng1Hello')],
  imports: [BrowserModule]
})
class MyNg2Module {
}


// Create AngularJS 1 module.
var module = angular.module('myExample', []);

// Downgrade Angular2 component into Angular JS 1 directive. This allows the Angular 2 componnent
// to be used from AngularJS 1 template
module.directive('exampleApp', adapter.downgradeNg2Component(Ng2Component));

// Use the Angular 2 component from AngularJS 1 template
module.directive('ng1Hello', function() {
  return {scope: {title: '='}, template: 'ng1[Hello {{title}}!](<span ng-transclude></span>)'};
});

// Replace your standard AngularSJ 1 bootstrap with the UpgradeAdapter bootstrap.
// The bootstrap method takes the same arguments as AngularJS 1 bootstrap.
adapter.bootstrap(document.body, ['myExample']);
// #enddocregion
