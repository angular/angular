import {Component} from '@angular/core';
import {async, TestBed, ComponentFixture, fakeAsync, tick} from '@angular/core/testing';
import {ObserversModule, MutationObserverFactory} from './observe-content';

// TODO(elad): `ProxyZone` doesn't seem to capture the events raised by
// `MutationObserver` and needs to be investigated

describe('Observe content', () => {
  describe('basic usage', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [ObserversModule],
        declarations: [ComponentWithTextContent, ComponentWithChildTextContent]
      });

      TestBed.compileComponents();
    }));

    it('should trigger the callback when the content of the element changes', done => {
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

    it('should trigger the callback when the content of the children changes', done => {
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

  describe('debounced', () => {
    let fixture: ComponentFixture<ComponentWithDebouncedListener>;
    let callbacks: Function[];
    let invokeCallbacks = (args?: any) => callbacks.forEach(callback => callback(args));

    beforeEach(async(() => {
      callbacks = [];

      TestBed.configureTestingModule({
        imports: [ObserversModule],
        declarations: [ComponentWithDebouncedListener],
        providers: [{
          provide: MutationObserverFactory,
          useValue: {
            create: function(callback: Function) {
              callbacks.push(callback);

              return {
                observe: () => {},
                disconnect: () => {}
              };
            }
          }
        }]
      });

      TestBed.compileComponents();

      fixture = TestBed.createComponent(ComponentWithDebouncedListener);
      fixture.detectChanges();
    }));

    it('should debounce the content changes', fakeAsync(() => {
      invokeCallbacks();
      invokeCallbacks();
      invokeCallbacks();

      tick(500);
      expect(fixture.componentInstance.spy).toHaveBeenCalledTimes(1);
    }));
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

@Component({
  template: `<div (cdkObserveContent)="spy($event)" [debounce]="debounce">{{text}}</div>`
})
class ComponentWithDebouncedListener {
  debounce = 500;
  spy = jasmine.createSpy('MutationObserver callback');
}
