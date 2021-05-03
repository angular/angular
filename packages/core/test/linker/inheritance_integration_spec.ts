/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, HostBinding} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {describe, expect, it} from '@angular/core/testing/src/testing_internal';
import {modifiedInIvy, onlyInIvy} from '@angular/private/testing';

@Directive({selector: '[directiveA]'})
class DirectiveA {
}

@Directive({selector: '[directiveB]'})
class DirectiveB {
  @HostBinding('title') title = 'DirectiveB Title';
}

@Component({selector: 'component-a', template: 'ComponentA Template'})
class ComponentA {
}

@Component(
    {selector: 'component-extends-directive', template: 'ComponentExtendsDirective Template'})
class ComponentExtendsDirective extends DirectiveA {
}

class ComponentWithNoAnnotation extends ComponentA {}

@Directive({selector: '[directiveExtendsComponent]'})
class DirectiveExtendsComponent extends ComponentA {
  @HostBinding('title') title = 'DirectiveExtendsComponent Title';
}

class DirectiveWithNoAnnotation extends DirectiveB {}

@Component({selector: 'my-app', template: '...'})
class App {
}

describe('Inheritance logic', () => {
  it('should handle Components that extend Directives', () => {
    TestBed.configureTestingModule({declarations: [ComponentExtendsDirective, App]});
    const template = '<component-extends-directive></component-extends-directive>';
    TestBed.overrideComponent(App, {set: {template}});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.firstChild.innerHTML).toBe('ComponentExtendsDirective Template');
  });

  it('should handle classes with no annotations that extend Components', () => {
    TestBed.configureTestingModule({declarations: [ComponentWithNoAnnotation, App]});
    const template = '<component-a></component-a>';
    TestBed.overrideComponent(App, {set: {template}});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.firstChild.innerHTML).toBe('ComponentA Template');
  });

  it('should handle classes with no annotations that extend Directives', () => {
    TestBed.configureTestingModule({declarations: [DirectiveWithNoAnnotation, App]});
    const template = '<div directiveB></div>';
    TestBed.overrideComponent(App, {set: {template}});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.firstChild.title).toBe('DirectiveB Title');
  });

  modifiedInIvy('View Engine allows Directives to extend Components')
      .it('should handle Directives that extend Components', () => {
        TestBed.configureTestingModule({declarations: [DirectiveExtendsComponent, App]});
        const template = '<div directiveExtendsComponent>Some content</div>';
        TestBed.overrideComponent(App, {set: {template}});
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        expect(fixture.nativeElement.firstChild.title).toBe('DirectiveExtendsComponent Title');
      });

  onlyInIvy('Ivy does not allow Directives to extend Components')
      .it('should throw in case a Directive tries to extend a Component', () => {
        TestBed.configureTestingModule({declarations: [DirectiveExtendsComponent, App]});
        const template = '<div directiveExtendsComponent>Some content</div>';
        TestBed.overrideComponent(App, {set: {template}});
        expect(() => TestBed.createComponent(App))
            .toThrowError('Directives cannot inherit Components');
      });
});
