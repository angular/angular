import {
  it,
  describe,
  expect,
  beforeEach,
  inject,
  fakeAsync,
  flushMicrotasks,
  tick,
  beforeEachProviders,
  getTestInjector
} from '@angular/core/testing';
import {TestComponentBuilder, ComponentFixture} from '@angular/compiler/testing';
import {Component, provide} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdLiveAnnouncer, LIVE_ANNOUNCER_ELEMENT_TOKEN} from './live-announcer';

describe('MdLiveAnnouncer', () => {
  let live: MdLiveAnnouncer;
  let builder: TestComponentBuilder;
  let liveEl: Element;

  beforeEachProviders(() => [MdLiveAnnouncer]);

  beforeEach(inject([TestComponentBuilder, MdLiveAnnouncer],
    (tcb: TestComponentBuilder, _live: MdLiveAnnouncer) => {
      builder = tcb;
      live = _live;
      liveEl = getLiveElement();
    }));

  afterEach(() => {
    // In our tests we always remove the current live element, because otherwise we would have
    // multiple live elements due multiple service instantiations.
    liveEl.parentNode.removeChild(liveEl);
  });

  it('should correctly update the announce text', fakeAsyncTest(() => {
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

  it('should correctly update the politeness attribute', fakeAsyncTest(() => {
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

  it('should apply the aria-live value polite by default', fakeAsyncTest(() => {
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

  it('should allow to use a custom live element', fakeAsyncTest(() => {
    let customLiveEl = document.createElement('div');

    // We need to reset our test injector here, because it is already instantiated above.
    getTestInjector().reset();

    getTestInjector().addProviders([
      provide(LIVE_ANNOUNCER_ELEMENT_TOKEN, {useValue: customLiveEl}),
      MdLiveAnnouncer
    ]);

    let injector = getTestInjector().createInjector();
    let liveService: MdLiveAnnouncer = injector.get(MdLiveAnnouncer);

    liveService.announce('Custom Element');

    // This flushes our 100ms timeout for the screenreaders.
    tick(100);

    expect(customLiveEl.textContent).toBe('Custom Element');
  }));

});

function fakeAsyncTest(fn: () => void) {
  return inject([], fakeAsync(fn));
}

function getLiveElement(): Element {
  return document.body.querySelector('.md-live-announcer');
}

@Component({
  selector: 'test-app',
  template: `<button (click)="announceText('Test')">Announce</button>`,
})
class TestApp {

  constructor(private live: MdLiveAnnouncer) {
  };

  announceText(message: string) {
    this.live.announce(message);
  }

}

