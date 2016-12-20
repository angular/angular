import {Component} from '@angular/core';
import {async, TestBed} from '@angular/core/testing';
import {ObserveContentModule} from './observe-content';

/**
 * TODO(elad): `ProxyZone` doesn't seem to capture the events raised by
 * `MutationObserver` and needs to be investigated
 */

describe('Observe content', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ObserveContentModule],
      declarations: [ComponentWithTextContent, ComponentWithChildTextContent],
    });

    TestBed.compileComponents();
  }));

  describe('text content change', () => {
    it('should call the registered for changes function', done => {
      let fixture = TestBed.createComponent(ComponentWithTextContent);
      fixture.detectChanges();

      // If the hint label is empty, expect no label.
      const spy = spyOn(fixture.componentInstance, 'doSomething').and.callFake(() => {
        expect(spy.calls.any()).toBe(true);
        done();
      });

      expect(spy.calls.any()).toBe(false);

      fixture.componentInstance.text = 'text';
      fixture.detectChanges();
    });
  });

  describe('child text content change', () => {
    it('should call the registered for changes function', done => {
      let fixture = TestBed.createComponent(ComponentWithChildTextContent);
      fixture.detectChanges();

      // If the hint label is empty, expect no label.
      const spy = spyOn(fixture.componentInstance, 'doSomething').and.callFake(() => {
        expect(spy.calls.any()).toBe(true);
        done();
      });

      expect(spy.calls.any()).toBe(false);

      fixture.componentInstance.text = 'text';
      fixture.detectChanges();
    });
  });
});


@Component({ template: `<div (cdkObserveContent)="doSomething()">{{text}}</div>` })
class ComponentWithTextContent {
  text = '';
  doSomething() {}
}

@Component({ template: `<div (cdkObserveContent)="doSomething()"><div>{{text}}<div></div>` })
class ComponentWithChildTextContent {
  text = '';
  doSomething() {}
}
