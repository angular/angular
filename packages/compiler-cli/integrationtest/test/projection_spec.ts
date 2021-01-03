/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import './init';
import {By} from '@angular/platform-browser';
import {CompWithNgContent, ProjectingComp} from '../src/projection';
import {createComponent} from './util';

describe('content projection', () => {
  it('should support basic content projection', () => {
    const mainCompFixture = createComponent(ProjectingComp);

    const debugElement = mainCompFixture.debugElement;
    const compWithProjection = debugElement.query(By.directive(CompWithNgContent));
    expect(compWithProjection.children.length).toBe(1);
    expect(compWithProjection.children[0].attributes['greeting']).toEqual('Hello world!');
  });
});
