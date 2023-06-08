/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, inject, NO_TAG_NAME, TAG_NAME, ViewChild} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('tag name injection', () => {
  it('should return the expected value', () => {
    @Directive({selector: `[foo]`})
    class FooDirective {
      tagName = inject(TAG_NAME);
    }

    @Component({
      template: `
        <div foo #v1></div>
        <span foo #v2></span>
        <svg foo #v3></svg>
        <custom-component foo #v4></custom-component>
        <video foo #v5></video>
        <ng-container foo #v6></ng-container>
        <ng-template foo #v7></ng-template>
      `,
    })
    class Parent {
      @ViewChild('v1', {read: FooDirective}) v1!: FooDirective;
      @ViewChild('v2', {read: FooDirective}) v2!: FooDirective;
      @ViewChild('v3', {read: FooDirective}) v3!: FooDirective;
      @ViewChild('v4', {read: FooDirective}) v4!: FooDirective;
      @ViewChild('v5', {read: FooDirective}) v5!: FooDirective;
      @ViewChild('v6', {read: FooDirective}) v6!: FooDirective;
      @ViewChild('v7', {read: FooDirective}) v7!: FooDirective;
    }

    TestBed.configureTestingModule({declarations: [FooDirective, Parent]});
    const fixture = TestBed.createComponent(Parent);
    fixture.detectChanges();

    const parent = fixture.componentInstance;
    expect(parent.v1.tagName).toBe('DIV');
    expect(parent.v2.tagName).toBe('SPAN');
    expect(parent.v3.tagName).toBe('svg');
    expect(parent.v4.tagName).toBe('CUSTOM-COMPONENT');
    expect(parent.v5.tagName).toBe('VIDEO');
    expect(parent.v6.tagName).toBe(NO_TAG_NAME);
    expect(parent.v7.tagName).toBe(NO_TAG_NAME);
  });
});
