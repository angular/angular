/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Directive, HostBinding} from '@angular/core';
import {TestBed} from '@angular/core/testing';

@Directive({
  selector: '[directiveA]',
  standalone: false,
})
class DirectiveA {}

@Directive({
  selector: '[directiveB]',
  standalone: false,
})
class DirectiveB {
  @HostBinding('title') title = 'DirectiveB Title';
}

@Component({
  selector: 'component-a',
  template: 'ComponentA Template',
  standalone: false,
})
class ComponentA {}

@Component({
  selector: 'component-extends-directive',
  template: 'ComponentExtendsDirective Template',
  standalone: false,
})
class ComponentExtendsDirective extends DirectiveA {}

class ComponentWithNoAnnotation extends ComponentA {}

@Directive({
  selector: '[directiveExtendsComponent]',
  standalone: false,
})
class DirectiveExtendsComponent extends ComponentA {
  @HostBinding('title') title = 'DirectiveExtendsComponent Title';
}

class DirectiveWithNoAnnotation extends DirectiveB {}

@Component({
  selector: 'my-app',
  template: '...',
  standalone: false,
})
class App {}

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

  it('should throw in case a Directive tries to extend a Component', () => {
    TestBed.configureTestingModule({declarations: [DirectiveExtendsComponent, App]});
    const template = '<div directiveExtendsComponent>Some content</div>';
    TestBed.overrideComponent(App, {set: {template}});
    expect(() => TestBed.createComponent(App)).toThrowError(
      'NG0903: Directives cannot inherit Components. Directive DirectiveExtendsComponent is attempting to extend component ComponentA',
    );
  });
});
