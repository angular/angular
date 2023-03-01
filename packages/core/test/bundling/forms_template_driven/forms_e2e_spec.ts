/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import '@angular/compiler';

import {withBody} from '@angular/private/testing';
import * as path from 'path';

const PACKAGE = 'angular/packages/core/test/bundling/forms_template_driven';
const BUNDLES = ['bundle.js', 'bundle.debug.min.js', 'bundle.min.js'];

describe('functional test for forms', () => {
  BUNDLES.forEach((bundle) => {
    describe(`using ${bundle} bundle`, () => {
      it('should render template form', withBody('<app-root></app-root>', async () => {
           // load the bundle
           await import(path.join(PACKAGE, bundle));
           // the bundle attaches the following fields to the `window` global.
           const {bootstrapApp} = window as any;

           await bootstrapApp();

           // Template forms
           const templateFormsComponent = (window as any).templateFormsComponent;
           const templateForm = document.querySelector('app-template-forms')!;

           // Check for inputs
           const iputs = templateForm.querySelectorAll('input');
           expect(iputs.length).toBe(5);

           // Check for button
           const templateButtons = templateForm.querySelectorAll('button');
           expect(templateButtons.length).toBe(1);
           expect(templateButtons[0]).toBeDefined();

           // Make sure button click works
           const templateFormSpy = spyOn(templateFormsComponent, 'addCity');
           templateButtons[0].click();
           expect(templateFormSpy).toHaveBeenCalled();
         }));
    });
  });
});
