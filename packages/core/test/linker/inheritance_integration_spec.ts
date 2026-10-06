/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Directive, HostBinding} from '../../src/core';
import {TestBed} from '../../testing';

@Directive({
  selector: '[directiveA]',
})
class DirectiveA {}

@Directive({
  selector: '[directiveB]',
})
class DirectiveB {
  @HostBinding('title') title = 'DirectiveB Title';
}

@Component({
  selector: 'component-a',
  template: 'ComponentA Template',
})
class ComponentA {}

@Component({
  selector: 'component-extends-directive',
  template: 'ComponentExtendsDirective Template',
})
class ComponentExtendsDirective extends DirectiveA {}

class ComponentWithNoAnnotation extends ComponentA {}

@Directive({
  selector: '[directiveExtendsComponent]',
})
class DirectiveExtendsComponent extends ComponentA {
  @HostBinding('title') title = 'DirectiveExtendsComponent Title';
}

class DirectiveWithNoAnnotation extends DirectiveB {}

@Component({
  template: '...',
})
class App {}

describe('Inheritance logic', () => {
  it('should handle Components that extend Directives', () => {
    const template = '<component-extends-directive></component-extends-directive>';
    TestBed.overrideComponent(App, {
      set: {template, imports: [ComponentExtendsDirective]},
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.firstChild.innerHTML).toBe('ComponentExtendsDirective Template');
  });

  it('should handle classes with no annotations that extend Components', () => {
    const template = '<component-a></component-a>';
    TestBed.overrideComponent(App, {
      set: {template, imports: [ComponentWithNoAnnotation]},
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.firstChild.innerHTML).toBe('ComponentA Template');
  });

  it('should handle classes with no annotations that extend Directives', () => {
    const template = '<div directiveB></div>';
    TestBed.overrideComponent(App, {set: {template, imports: [DirectiveWithNoAnnotation]}});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.firstChild.title).toBe('DirectiveB Title');
  });

  it('should throw in case a Directive tries to extend a Component', () => {
    const template = '<div directiveExtendsComponent>Some content</div>';
    TestBed.overrideComponent(App, {set: {template, imports: [DirectiveExtendsComponent]}});
    expect(() => TestBed.createComponent(App)).toThrowError(
      'NG0903: Directives cannot inherit Components. Directive DirectiveExtendsComponent is attempting to extend component ComponentA',
    );
  });
});
