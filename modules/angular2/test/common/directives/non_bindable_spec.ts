import {
  AsyncTestCompleter,
  TestComponentBuilder,
  beforeEach,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  it,
  xit,
} from 'angular2/testing_internal';
import {DOM} from 'angular2/src/platform/dom/dom_adapter';
import {Component, Directive} from 'angular2/core';
import {ElementRef} from 'angular2/src/core/linker/element_ref';

export function main() {
  describe('non-bindable', () => {
    it('should not interpolate children',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         var template = '<div>{{text}}<span ngNonBindable>{{text}}</span></div>';
         tcb.overrideTemplate(TestComponent, template)
             .createAsync(TestComponent)
             .then((fixture) => {
               fixture.detectChanges();
               expect(fixture.debugElement.nativeElement).toHaveText('foo{{text}}');
               async.done();
             });
       }));

    it('should ignore directives on child nodes',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         var template = '<div ngNonBindable><span id=child test-dec>{{text}}</span></div>';
         tcb.overrideTemplate(TestComponent, template)
             .createAsync(TestComponent)
             .then((fixture) => {
               fixture.detectChanges();

               // We must use DOM.querySelector instead of fixture.query here
               // since the elements inside are not compiled.
               var span = DOM.querySelector(fixture.debugElement.nativeElement, '#child');
               expect(DOM.hasClass(span, 'compiled')).toBeFalsy();
               async.done();
             });
       }));

    it('should trigger directives on the same node',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         var template = '<div><span id=child ngNonBindable test-dec>{{text}}</span></div>';
         tcb.overrideTemplate(TestComponent, template)
             .createAsync(TestComponent)
             .then((fixture) => {
               fixture.detectChanges();
               var span = DOM.querySelector(fixture.debugElement.nativeElement, '#child');
               expect(DOM.hasClass(span, 'compiled')).toBeTruthy();
               async.done();
             });
       }));
  })
}

@Directive({selector: '[test-dec]'})
class TestDirective {
  constructor(el: ElementRef) { DOM.addClass(el.nativeElement, 'compiled'); }
}

@Component({selector: 'test-cmp', directives: [TestDirective], template: ''})
class TestComponent {
  text: string;
  constructor() { this.text = 'foo'; }
}
