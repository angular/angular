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
        expect(spy).toHaveBeenCalled();
        done();
      });

      expect(spy).not.toHaveBeenCalled();

      fixture.componentInstance.text = 'text';
      fixture.detectChanges();
    });

    it('should trigger the callback when the content of the children changes', done => {
      let fixture = TestBed.createComponent(ComponentWithChildTextContent);
      fixture.detectChanges();

      // If the hint label is empty, expect no label.
      const spy = spyOn(fixture.componentInstance, 'doSomething').and.callFake(() => {
        expect(spy).toHaveBeenCalled();
        done();
      });

      expect(spy).not.toHaveBeenCalled();

      fixture.componentInstance.text = 'text';
      fixture.detectChanges();
    });

    it('should disconnect the MutationObserver when the directive is disabled', () => {
      const observeSpy = jasmine.createSpy('observe spy');
      const disconnectSpy = jasmine.createSpy('disconnect spy');

      // Note: since we can't know exactly when the native MutationObserver will emit, we can't
      // test this scenario reliably without risking flaky tests, which is why we supply a mock
      // MutationObserver and check that the methods are called at the right time.
      TestBed.overrideProvider(MutationObserverFactory, {
        deps: [],
        useFactory: () => ({
          create: () => ({observe: observeSpy, disconnect: disconnectSpy})
        })
      });

      const fixture = TestBed.createComponent(ComponentWithTextContent);
      fixture.detectChanges();

      expect(observeSpy).toHaveBeenCalledTimes(1);
      expect(disconnectSpy).not.toHaveBeenCalled();

      fixture.componentInstance.disabled = true;
      fixture.detectChanges();

      expect(observeSpy).toHaveBeenCalledTimes(1);
      expect(disconnectSpy).toHaveBeenCalledTimes(1);
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


@Component({
  template: `
    <div
      (cdkObserveContent)="doSomething()"
      [cdkObserveContentDisabled]="disabled">{{text}}</div>
  `
})
class ComponentWithTextContent {
  text = '';
  disabled = false;
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
