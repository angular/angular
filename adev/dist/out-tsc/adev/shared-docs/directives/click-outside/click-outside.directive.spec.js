/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {ClickOutside} from './click-outside.directive';
import {By} from '@angular/platform-browser';
describe('ClickOutside', () => {
  let component;
  let fixture;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ExampleComponent],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(ExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should docsClickOutside be emitted when user click outside `content` element', () => {
    const clickedOutsideSpy = spyOn(component, 'clickedOutside');
    const button = fixture.debugElement.query(By.css('button[id="exampleButton"]'));
    button.nativeElement.click();
    expect(clickedOutsideSpy).toHaveBeenCalledTimes(1);
  });
  it('should not docsClickOutside be emitted when user click inside `content` element', () => {
    const clickedOutsideSpy = spyOn(component, 'clickedOutside');
    const content = fixture.debugElement.query(By.css('div[id="content"]'));
    content.nativeElement.click();
    expect(clickedOutsideSpy).not.toHaveBeenCalled();
  });
  it('should not docsClickOutside be emitted when user click inside `content` element', () => {
    const clickedOutsideSpy = spyOn(component, 'clickedOutside');
    const button = fixture.debugElement.query(By.css('button[id="ignoreThisButton"]'));
    button.nativeElement.click();
    expect(clickedOutsideSpy).not.toHaveBeenCalled();
  });
});
let ExampleComponent = (() => {
  let _classDecorators = [
    Component({
      template: `
    <div class="container">
      <button type="button" id="exampleButton">Click me</button>
      <button type="button" id="ignoreThisButton">Click me</button>
      <div
        id="content"
        (docsClickOutside)="clickedOutside()"
        [docsClickOutsideIgnore]="docsClickOutsideIgnore"
      >
        Content
      </div>
    </div>
  `,
      imports: [ClickOutside],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ExampleComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      ExampleComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    docsClickOutsideIgnore = ['ignoreThisButton'];
    clickedOutside() {}
  };
  return (ExampleComponent = _classThis);
})();
//# sourceMappingURL=click-outside.directive.spec.js.map
