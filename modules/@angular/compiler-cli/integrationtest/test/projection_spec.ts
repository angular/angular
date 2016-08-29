/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
    var mainCompFixture = createComponent(ProjectingComp);

    var debugElement = mainCompFixture.debugElement;
    var compWithProjection = debugElement.query(By.directive(CompWithNgContent));
    expect(compWithProjection.children.length).toBe(1);
    expect(compWithProjection.children[0].attributes['greeting']).toEqual('Hello world!');
  });
});
