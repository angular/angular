import {
  inject,
  fakeAsync,
  flushMicrotasks,
  tick,
  addProviders,
  TestComponentBuilder,
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdLiveAnnouncer, LIVE_ANNOUNCER_ELEMENT_TOKEN} from './live-announcer';

describe('MdLiveAnnouncer', () => {
  let live: MdLiveAnnouncer;
  let builder: TestComponentBuilder;
  let liveEl: Element;

  describe('with default element', () => {
    beforeEach(() => TestBed.configureTestingModule({
      declarations: [TestApp],
      providers: [MdLiveAnnouncer]
    }));

    beforeEach(fakeAsync(inject([TestComponentBuilder, MdLiveAnnouncer],
      (tcb: TestComponentBuilder, _live: MdLiveAnnouncer) => {
        builder = tcb;
        live = _live;
        liveEl = getLiveElement();
      })));

    afterEach(() => {
      // In our tests we always remove the current live element, because otherwise we would have
      // multiple live elements due multiple service instantiations.
      liveEl.parentNode.removeChild(liveEl);
    });

    it('should correctly update the announce text', fakeAsync(() => {
      let appFixture: ComponentFixture<TestApp> = null;

      builder.createAsync(TestApp).then(fixture => {
        appFixture = fixture;
      });

      flushMicrotasks();

      let buttonElement = appFixture.debugElement
        .query(By.css('button')).nativeElement;

      buttonElement.click();

      // This flushes our 100ms timeout for the screenreaders.
      tick(100);

      expect(liveEl.textContent).toBe('Test');
    }));

    it('should correctly update the politeness attribute', fakeAsync(() => {
      let appFixture: ComponentFixture<TestApp> = null;

      builder.createAsync(TestApp).then(fixture => {
        appFixture = fixture;
      });

      flushMicrotasks();

      live.announce('Hey Google', 'assertive');

      // This flushes our 100ms timeout for the screenreaders.
      tick(100);

      expect(liveEl.textContent).toBe('Hey Google');
      expect(liveEl.getAttribute('aria-live')).toBe('assertive');
    }));

    it('should apply the aria-live value polite by default', fakeAsync(() => {
      let appFixture: ComponentFixture<TestApp> = null;

      builder.createAsync(TestApp).then(fixture => {
        appFixture = fixture;
      });

      flushMicrotasks();

      live.announce('Hey Google');

      // This flushes our 100ms timeout for the screenreaders.
      tick(100);

      expect(liveEl.textContent).toBe('Hey Google');
      expect(liveEl.getAttribute('aria-live')).toBe('polite');
    }));
  });

  describe('with a custom element', () => {
    let customLiveElement: HTMLElement;

    beforeEach(() => {
      customLiveElement = document.createElement('div');

      addProviders([
        {provide: LIVE_ANNOUNCER_ELEMENT_TOKEN, useValue: customLiveElement},
        MdLiveAnnouncer,
      ]);
    });

    beforeEach(inject([TestComponentBuilder, MdLiveAnnouncer],
      (tcb: TestComponentBuilder, _live: MdLiveAnnouncer) => {
        builder = tcb;
        live = _live;
        liveEl = getLiveElement();
      }));


    it('should allow to use a custom live element', fakeAsync(() => {
      live.announce('Custom Element');

      // This flushes our 100ms timeout for the screenreaders.
      tick(100);

      expect(customLiveElement.textContent).toBe('Custom Element');
    }));
  });

});


function getLiveElement(): Element {
  return document.body.querySelector('.md-live-announcer');
}

@Component({
  selector: 'test-app',
  template: `<button (click)="announceText('Test')">Announce</button>`,
})
class TestApp {

  constructor(private live: MdLiveAnnouncer) { };

  announceText(message: string) {
    this.live.announce(message);
  }

}

