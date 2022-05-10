/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ɵComponentDef as ComponentDef, ɵComponentType as ComponentType, ɵɵTemplateDebugSourceFeature as TemplateDebugSourceFeature} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('TemplateDebugSourceFeature', () => {
  it('should record the template source when applied', () => {
    @Component({
      standalone: true,
      selector: 'test-cmp',
      template: '<span>Template</span>',
    })
    class TestCmp {
    }

    TemplateDebugSourceFeature('debug/template/url.html')(
        (TestCmp as ComponentType<TestCmp>).ɵcmp as ComponentDef<TestCmp>);

    @Component({
      standalone: true,
      selector: 'host-cmp',
      imports: [TestCmp],
      template: '<test-cmp></test-cmp>',
    })
    class HostCmp {
    }

    const fixture = TestBed.createComponent(HostCmp);
    fixture.detectChanges();
    expect(fixture.debugElement.children[0].attributes).toEqual({
      'data-debug-source': 'debug/template/url.html'
    });
  });
});
