/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import * as formBuilderExample from './ts/formBuilder/module.js';
import * as nestedFormArrayExample from './ts/nestedFormArray/module.js';
import * as nestedFormGroupExample from './ts/nestedFormGroup/module.js';
import * as ngModelGroupExample from './ts/ngModelGroup/module.js';
import * as radioButtonsExample from './ts/radioButtons/module.js';
import * as reactiveRadioButtonsExample from './ts/reactiveRadioButtons/module.js';
import * as reactiveSelectControlExample from './ts/reactiveSelectControl/module.js';
import * as selectControlExample from './ts/selectControl/module.js';
import * as simpleFormExample from './ts/simpleForm/module.js';
import * as simpleFormControlExample from './ts/simpleFormControl/module.js';
import * as simpleFormGroupExample from './ts/simpleFormGroup/module.js';
import * as simpleNgModelExample from './ts/simpleNgModel/module.js';

@Component({selector: 'example-app', template: '<router-outlet></router-outlet>'})
export class TestsAppComponent {
}

@NgModule({
  imports: [
    formBuilderExample.AppModule, nestedFormArrayExample.AppModule,
    nestedFormGroupExample.AppModule, ngModelGroupExample.AppModule, radioButtonsExample.AppModule,
    reactiveRadioButtonsExample.AppModule, reactiveSelectControlExample.AppModule,
    selectControlExample.AppModule, simpleFormExample.AppModule, simpleFormControlExample.AppModule,
    simpleFormGroupExample.AppModule, simpleNgModelExample.AppModule,

    // Router configuration so that the individual e2e tests can load their
    // app components.
    RouterModule.forRoot([
      {path: 'formBuilder', component: formBuilderExample.AppComponent},
      {path: 'nestedFormArray', component: nestedFormArrayExample.AppComponent},
      {path: 'nestedFormGroup', component: nestedFormGroupExample.AppComponent},
      {path: 'ngModelGroup', component: ngModelGroupExample.AppComponent},
      {path: 'radioButtons', component: radioButtonsExample.AppComponent},
      {path: 'reactiveRadioButtons', component: reactiveRadioButtonsExample.AppComponent},
      {path: 'reactiveSelectControl', component: reactiveSelectControlExample.AppComponent},
      {path: 'selectControl', component: selectControlExample.AppComponent},
      {path: 'simpleForm', component: simpleFormExample.AppComponent},
      {path: 'simpleFormControl', component: simpleFormControlExample.AppComponent},
      {path: 'simpleFormGroup', component: simpleFormGroupExample.AppComponent},
      {path: 'simpleNgModel', component: simpleNgModelExample.AppComponent}
    ])
  ],
  declarations: [TestsAppComponent],
  bootstrap: [TestsAppComponent]
})
export class TestsAppModule {
}
