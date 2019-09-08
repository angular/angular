/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {getLContext} from '@angular/core/src/render3/context_discovery';
import {LViewDebug, toDebug} from '@angular/core/src/render3/instructions/lview_debug';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {onlyInIvy} from '@angular/private/testing';

describe('Debug Representation', () => {

  onlyInIvy('Ivy specific').it('should generate a human readable version', () => {

    @Component({selector: 'my-comp', template: '<div id="123">Hello World</div>'})
    class MyComponent {
    }

    TestBed.configureTestingModule({declarations: [MyComponent]});
    const fixture = TestBed.createComponent(MyComponent);
    fixture.detectChanges();

    const hostView = toDebug(getLContext(fixture.componentInstance) !.lView);
    expect(hostView.host).toEqual(null);
    const myCompView = hostView.childViews[0] as LViewDebug;
    expect(myCompView.host).toContain('<div id="123">Hello World</div>');
    expect(myCompView.nodes ![0].html).toEqual('<div id="123">');
    expect(myCompView.nodes ![0].nodes ![0].html).toEqual('Hello World');
  });
});
