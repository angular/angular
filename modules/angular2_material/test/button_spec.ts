import {
  AsyncTestCompleter,
  TestComponentBuilder,
  beforeEach,
  beforeEachProviders,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  it,
  xit,
} from 'angular2/testing_internal';
import {DebugElement} from 'angular2/src/core/debug/debug_element';

import {Component, View, ViewMetadata, bind, provide} from 'angular2/core';
import {UrlResolver} from 'angular2/compiler';

import {MdButton, MdAnchor} from 'angular2_material/src/components/button/button';

import {TestUrlResolver} from './test_url_resolver';


export function main() {
  describe('MdButton', () => {
    let builder: TestComponentBuilder;

    beforeEachProviders(() => [
      // Need a custom URL resolver for ng-material template files in order for them to work
      // with both JS and Dart output.
      provide(UrlResolver, {useValue: new TestUrlResolver()})
    ]);

    beforeEach(inject([TestComponentBuilder], (tcb) => { builder = tcb; }));

    describe('button[md-button]', () => {
      it('should handle a click on the button', inject([AsyncTestCompleter], (async) => {
           builder.createAsync(TestApp).then(fixture => {
             let testComponent = fixture.debugElement.componentInstance;
             let buttonDebugElement = getChildDebugElement(fixture.debugElement, 'button');

             buttonDebugElement.nativeElement.click();
             expect(testComponent.clickCount).toBe(1);

             async.done();
           });
         }), 10000);

      it('should disable the button', inject([AsyncTestCompleter], (async) => {
           builder.createAsync(TestApp).then(fixture => {
             let testAppComponent = fixture.debugElement.componentInstance;
             let buttonDebugElement = getChildDebugElement(fixture.debugElement, 'button');
             let buttonElement = buttonDebugElement.nativeElement;

             // The button should initially be enabled.
             expect(buttonElement.disabled).toBe(false);

             // After the disabled binding has been changed.
             testAppComponent.isDisabled = true;
             fixture.detectChanges();

             // The button should should now be disabled.
             expect(buttonElement.disabled).toBe(true);

             // Clicking the button should not invoke the handler.
             buttonElement.click();
             expect(testAppComponent.clickCount).toBe(0);
             async.done();
           });
         }), 10000);
    });

    describe('a[md-button]', () => {
      const anchorTemplate = `<a md-button href="http://google.com" [disabled]="isDisabled">Go</a>`;

      beforeEach(() => {
        builder = builder.overrideView(
            TestApp, new ViewMetadata({template: anchorTemplate, directives: [MdAnchor]}));
      });

      it('should remove disabled anchors from tab order', inject([AsyncTestCompleter], (async) => {
           builder.createAsync(TestApp).then(fixture => {
             let testAppComponent = fixture.debugElement.componentInstance;
             let anchorDebugElement = getChildDebugElement(fixture.debugElement, 'a');
             let anchorElement = anchorDebugElement.nativeElement;

             // The anchor should initially be in the tab order.
             expect(anchorElement.tabIndex).toBe(0);

             // After the disabled binding has been changed.
             testAppComponent.isDisabled = true;
             fixture.detectChanges();

             // The anchor should now be out of the tab order.
             expect(anchorElement.tabIndex).toBe(-1);

             async.done();
           });

           it('should preventDefault for disabled anchor clicks',
              inject([AsyncTestCompleter], (async) => {
                // No clear way to test this; see https://github.com/angular/angular/issues/3782
                async.done();
              }));
         }), 10000);
    });
  });
}

/** Gets a child DebugElement by tag name. */
function getChildDebugElement(parent: DebugElement, tagName: string): DebugElement {
  return parent.query(debugEl => debugEl.nativeElement.tagName.toLowerCase() == tagName);
}

/** Test component that contains an MdButton. */
@Component({selector: 'test-app'})
@View({
  directives: [MdButton],
  template:
      `<button md-button type="button" (click)="increment()" [disabled]="isDisabled">Go</button>`
})
class TestApp {
  clickCount: number = 0;
  isDisabled: boolean = false;

  increment() {
    this.clickCount++;
  }
}
