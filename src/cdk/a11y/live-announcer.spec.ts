import {inject, fakeAsync, tick, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {LiveAnnouncer, LIVE_ANNOUNCER_ELEMENT_TOKEN} from './live-announcer';
import {A11yModule} from './index';


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
