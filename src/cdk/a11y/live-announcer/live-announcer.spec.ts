import {MutationObserverFactory} from '@angular/cdk/observers';
import {Component, Input} from '@angular/core';
import {ComponentFixture, fakeAsync, flush, inject, TestBed, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {A11yModule} from '../index';
import {LiveAnnouncer} from './live-announcer';
import {LIVE_ANNOUNCER_ELEMENT_TOKEN} from './live-announcer-token';


describe('LiveAnnouncer', () => {
  let announcer: LiveAnnouncer;
  let ariaLiveElement: Element;
  let fixture: ComponentFixture<TestApp>;

  describe('with default element', () => {
    beforeEach(() => TestBed.configureTestingModule({
      imports: [A11yModule],
      declarations: [TestApp],
    }));

    beforeEach(fakeAsync(inject([LiveAnnouncer], (la: LiveAnnouncer) => {
      announcer = la;
      ariaLiveElement = getLiveElement();
      fixture = TestBed.createComponent(TestApp);
    })));

    afterEach(() => {
      // In our tests we always remove the current live element, in
      // order to avoid having multiple announcer elements in the DOM.
      announcer.ngOnDestroy();
    });

    it('should correctly update the announce text', fakeAsync(() => {
      let buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;
      buttonElement.click();

      // This flushes our 100ms timeout for the screenreaders.
      tick(100);

      expect(ariaLiveElement.textContent).toBe('Test');
    }));

    it('should correctly update the politeness attribute', fakeAsync(() => {
      announcer.announce('Hey Google', 'assertive');

      // This flushes our 100ms timeout for the screenreaders.
      tick(100);

      expect(ariaLiveElement.textContent).toBe('Hey Google');
      expect(ariaLiveElement.getAttribute('aria-live')).toBe('assertive');
    }));

    it('should apply the aria-live value polite by default', fakeAsync(() => {
      announcer.announce('Hey Google');

      // This flushes our 100ms timeout for the screenreaders.
      tick(100);

      expect(ariaLiveElement.textContent).toBe('Hey Google');
      expect(ariaLiveElement.getAttribute('aria-live')).toBe('polite');
    }));

    it('should remove the aria-live element from the DOM on destroy', fakeAsync(() => {
      announcer.announce('Hey Google');

      // This flushes our 100ms timeout for the screenreaders.
      tick(100);

      // Call the lifecycle hook manually since Angular won't do it in tests.
      announcer.ngOnDestroy();

      expect(document.body.querySelector('[aria-live]'))
          .toBeFalsy('Expected that the aria-live element was remove from the DOM.');
    }));

    it('should return a promise that resolves after the text has been announced', fakeAsync(() => {
      const spy = jasmine.createSpy('announce spy');
      announcer.announce('something').then(spy);

      expect(spy).not.toHaveBeenCalled();
      tick(100);
      expect(spy).toHaveBeenCalled();
    }));
  });

  describe('with a custom element', () => {
    let customLiveElement: HTMLElement;

    beforeEach(() => {
      customLiveElement = document.createElement('div');

      return TestBed.configureTestingModule({
        imports: [A11yModule],
        declarations: [TestApp],
        providers: [{provide: LIVE_ANNOUNCER_ELEMENT_TOKEN, useValue: customLiveElement}],
      });
    });

    beforeEach(inject([LiveAnnouncer], (la: LiveAnnouncer) => {
      announcer = la;
      ariaLiveElement = getLiveElement();
    }));

    it('should allow to use a custom live element', fakeAsync(() => {
      announcer.announce('Custom Element');

      // This flushes our 100ms timeout for the screenreaders.
      tick(100);

      expect(customLiveElement.textContent).toBe('Custom Element');
    }));
  });
});

describe('CdkAriaLive', () => {
  let mutationCallbacks: Function[] = [];
  let announcer: LiveAnnouncer;
  let announcerSpy: jasmine.Spy;
  let fixture: ComponentFixture<DivWithCdkAriaLive>;

  const invokeMutationCallbacks = () => mutationCallbacks.forEach(cb => cb());

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [A11yModule],
      declarations: [DivWithCdkAriaLive],
      providers: [{
        provide: MutationObserverFactory,
        useValue: {
          create: (callback: Function) => {
            mutationCallbacks.push(callback);

            return {
              observe: () => {},
              disconnect: () => {}
            };
          }
        }
      }]
    });
  }));

  beforeEach(fakeAsync(inject([LiveAnnouncer], (la: LiveAnnouncer) => {
    announcer = la;
    announcerSpy = spyOn(la, 'announce').and.callThrough();
    fixture = TestBed.createComponent(DivWithCdkAriaLive);
    fixture.detectChanges();
    flush();
  })));

  afterEach(fakeAsync(() => {
    // In our tests we always remove the current live element, in
    // order to avoid having multiple announcer elements in the DOM.
    announcer.ngOnDestroy();
  }));

  it('should dynamically update the politeness', fakeAsync(() => {
    fixture.componentInstance.content = 'New content';
    fixture.detectChanges();
    invokeMutationCallbacks();
    flush();

    expect(announcer.announce).toHaveBeenCalledWith('New content', 'polite');

    announcerSpy.calls.reset();
    fixture.componentInstance.politeness = 'off';
    fixture.componentInstance.content = 'Newer content';
    fixture.detectChanges();
    invokeMutationCallbacks();
    flush();

    expect(announcer.announce).not.toHaveBeenCalled();

    announcerSpy.calls.reset();
    fixture.componentInstance.politeness = 'assertive';
    fixture.componentInstance.content = 'Newest content';
    fixture.detectChanges();
    invokeMutationCallbacks();
    flush();

    expect(announcer.announce).toHaveBeenCalledWith('Newest content', 'assertive');
  }));
});


function getLiveElement(): Element {
  return document.body.querySelector('[aria-live]')!;
}

@Component({template: `<button (click)="announceText('Test')">Announce</button>`})
class TestApp {
  constructor(public live: LiveAnnouncer) { }

  announceText(message: string) {
    this.live.announce(message);
  }
}

@Component({template: `<div [cdkAriaLive]="politeness">{{content}}</div>`})
class DivWithCdkAriaLive {
  @Input() politeness = 'polite';
  @Input() content = 'Initial content';
}
