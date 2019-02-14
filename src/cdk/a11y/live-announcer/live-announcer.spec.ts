import {MutationObserverFactory} from '@angular/cdk/observers';
import {Component, Input} from '@angular/core';
import {ComponentFixture, fakeAsync, flush, inject, TestBed, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {A11yModule} from '../index';
import {LiveAnnouncer} from './live-announcer';
import {
  LIVE_ANNOUNCER_ELEMENT_TOKEN,
  LIVE_ANNOUNCER_DEFAULT_OPTIONS,
  LiveAnnouncerDefaultOptions,
} from './live-announcer-tokens';


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

    it('should be able to clear out the aria-live element manually', fakeAsync(() => {
      announcer.announce('Hey Google');
      tick(100);
      expect(ariaLiveElement.textContent).toBe('Hey Google');

      announcer.clear();
      expect(ariaLiveElement.textContent).toBeFalsy();
    }));

    it('should be able to clear out the aria-live element by setting a duration', fakeAsync(() => {
      announcer.announce('Hey Google', 2000);
      tick(100);
      expect(ariaLiveElement.textContent).toBe('Hey Google');

      tick(2000);
      expect(ariaLiveElement.textContent).toBeFalsy();
    }));

    it('should clear the duration of previous messages when announcing a new one', fakeAsync(() => {
      announcer.announce('Hey Google', 2000);
      tick(100);
      expect(ariaLiveElement.textContent).toBe('Hey Google');

      announcer.announce('Hello there');
      tick(2500);
      expect(ariaLiveElement.textContent).toBe('Hello there');
    }));

    it('should remove the aria-live element from the DOM on destroy', fakeAsync(() => {
      announcer.announce('Hey Google');

      // This flushes our 100ms timeout for the screenreaders.
      tick(100);

      // Call the lifecycle hook manually since Angular won't do it in tests.
      announcer.ngOnDestroy();

      expect(document.body.querySelector('.cdk-live-announcer-element'))
          .toBeFalsy('Expected that the aria-live element was remove from the DOM.');
    }));

    it('should return a promise that resolves after the text has been announced', fakeAsync(() => {
      const spy = jasmine.createSpy('announce spy');
      announcer.announce('something').then(spy);

      expect(spy).not.toHaveBeenCalled();
      tick(100);
      expect(spy).toHaveBeenCalled();
    }));

    it('should ensure that there is only one live element at a time', fakeAsync(() => {
      announcer.ngOnDestroy();
      fixture.destroy();

      TestBed.resetTestingModule().configureTestingModule({
        imports: [A11yModule],
        declarations: [TestApp],
      });

      const extraElement = document.createElement('div');
      extraElement.classList.add('cdk-live-announcer-element');
      document.body.appendChild(extraElement);

      inject([LiveAnnouncer], (la: LiveAnnouncer) => {
        announcer = la;
        ariaLiveElement = getLiveElement();
        fixture = TestBed.createComponent(TestApp);
      })();

      announcer.announce('Hey Google');
      tick(100);

      expect(document.body.querySelectorAll('.cdk-live-announcer-element').length)
          .toBe(1, 'Expected only one live announcer element in the DOM.');
    }));

    it('should clear any previous timers when a new one is started', fakeAsync(() => {
      expect(ariaLiveElement.textContent).toBeFalsy();

      announcer.announce('One');
      tick(50);

      announcer.announce('Two');
      tick(75);

      expect(ariaLiveElement.textContent).toBeFalsy();

      tick(25);

      expect(ariaLiveElement.textContent).toBe('Two');
    }));

    it('should clear pending timeouts on destroy', fakeAsync(() => {
      announcer.announce('Hey Google');
      announcer.ngOnDestroy();

      // Since we're testing whether the timeouts were flushed, we don't need any
      // assertions here. `fakeAsync` will fail the test if a timer was left over.
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

  describe('with a default options', () => {
    beforeEach(() => {
      return TestBed.configureTestingModule({
        imports: [A11yModule],
        declarations: [TestApp],
        providers: [{
          provide: LIVE_ANNOUNCER_DEFAULT_OPTIONS,
          useValue: {
            politeness: 'assertive',
            duration: 1337
          } as LiveAnnouncerDefaultOptions
        }],
      });
    });

    beforeEach(inject([LiveAnnouncer], (la: LiveAnnouncer) => {
      announcer = la;
      ariaLiveElement = getLiveElement();
    }));

    it('should pick up the default politeness from the injection token', fakeAsync(() => {
      announcer.announce('Hello');

      tick(2000);

      expect(ariaLiveElement.getAttribute('aria-live')).toBe('assertive');
    }));

    it('should pick up the default politeness from the injection token', fakeAsync(() => {
      announcer.announce('Hello');

      tick(100);
      expect(ariaLiveElement.textContent).toBe('Hello');

      tick(1337);
      expect(ariaLiveElement.textContent).toBeFalsy();
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

  it('should not announce the same text multiple times', fakeAsync(() => {
    fixture.componentInstance.content = 'Content';
    fixture.detectChanges();
    invokeMutationCallbacks();
    flush();

    expect(announcer.announce).toHaveBeenCalledTimes(1);

    fixture.detectChanges();
    invokeMutationCallbacks();
    flush();

    expect(announcer.announce).toHaveBeenCalledTimes(1);
  }));

});


function getLiveElement(): Element {
  return document.body.querySelector('.cdk-live-announcer-element')!;
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
