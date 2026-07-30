/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Directive, ElementRef} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {hasClass} from '@angular/private/testing';
import {expect} from '@angular/private/testing/matchers';

describe('non-bindable', () => {
  it('should not interpolate children', async () => {
    const template = '<div>{{text}}<span ngNonBindable>{{text}}</span></div>';
    const fixture = createTestComponent(template);

    await fixture.whenStable();
    expect(fixture.nativeElement).toHaveText('foo{{text}}');
  });

  it('should ignore directives on child nodes', async () => {
    const template = '<div ngNonBindable><span id=child test-dec>{{text}}</span></div>';
    const fixture = createTestComponent(template);
    await fixture.whenStable();

    // We must use getDOM().querySelector instead of fixture.query here
    // since the elements inside are not compiled.
    const span = fixture.nativeElement.querySelector('#child');
    expect(hasClass(span, 'compiled')).toBeFalsy();
  });

  it('should trigger directives on the same node', async () => {
    const template = '<div><span id=child ngNonBindable test-dec>{{text}}</span></div>';
    const fixture = createTestComponent(template);
    await fixture.whenStable();
    const span = fixture.nativeElement.querySelector('#child');
    expect(hasClass(span, 'compiled')).toBeTruthy();
  });
});

@Directive({
  selector: '[test-dec]',
})
class TestDirective {
  constructor(el: ElementRef) {
    el.nativeElement.classList.add('compiled');
  }
}

@Component({
  selector: 'test-cmp',
  template: '',
  imports: [TestDirective],
})
class TestComponent {
  text: string;
  constructor() {
    this.text = 'foo';
  }
}

function createTestComponent(template: string): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {set: {template: template}}).createComponent(
    TestComponent,
  );
}
