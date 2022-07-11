import { Injector } from '@angular/core';

import { AnalyticsService } from 'app/shared/analytics.service';
import { WindowToken } from 'app/shared/window';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let injector: Injector;
  let legacyGaSpy: jasmine.Spy;
  let gtagSpy: jasmine.Spy;
  let gtagAppendNodeSpy: jasmine.Spy;
  let windowOnErrorHandler: (event: ErrorEvent) => void;

  let mockWindow: any;

  beforeEach(() => {
    legacyGaSpy = jasmine.createSpy('ga');
    gtagSpy = jasmine.createSpy('gtag');
    gtagAppendNodeSpy = jasmine.createSpy('gtag.js script head attach');

    mockWindow = {
      ga: legacyGaSpy,
      name: 'Some name',
      document: {
        head: {appendChild: gtagAppendNodeSpy},
        createElement: (tag: string) => document.createElement(tag),
      },
      addEventListener: (_name: string, handler: typeof windowOnErrorHandler) =>
        windowOnErrorHandler = handler,
    };

    injector = Injector.create({
      providers: [
        { provide: AnalyticsService, deps: [WindowToken] },
        { provide: WindowToken, useFactory: () => mockWindow, deps: [] }
    ]});

    service = injector.get(AnalyticsService);

    // The `gtag` function is attached to the `Window`, so we can spy on it
    // after the service has been initialized.
    gtagSpy = spyOn(mockWindow, 'gtag');
  });

  it('should initialize ga with "create" when constructed', () => {
    const first = legacyGaSpy.calls.first().args;
    expect(first[0]).toBe('create');
  });

  it('should initialize ga with anonymize ips', () => {
    const first = legacyGaSpy.calls.argsFor(1);
    expect(first).toEqual(['set', 'anonymizeIp', true]);
  });

  describe('#locationChanged(url)', () => {
    it('should set page to url w/ leading slash', () => {
      service.locationChanged('testUrl');
      expect(legacyGaSpy).toHaveBeenCalledWith('set', 'page', '/testUrl');
    });

    it('should send "pageview" ', () => {
      service.locationChanged('testUrl');
      expect(legacyGaSpy).toHaveBeenCalledWith('send', 'pageview');
    });

    it('should not send twice with same URL, back-to-back', () => {
      service.locationChanged('testUrl');
      legacyGaSpy.calls.reset();
      service.locationChanged('testUrl');
      expect(legacyGaSpy).not.toHaveBeenCalled();
    });

    it('should send again even if only the hash changes', () => {
      // Therefore it is up to caller NOT to call it when hash changes if this is unwanted.
      // See LocationService and its specs
      service.locationChanged('testUrl#one');
      expect(legacyGaSpy).toHaveBeenCalledWith('set', 'page', '/testUrl#one');
      expect(legacyGaSpy).toHaveBeenCalledWith('send', 'pageview');
      legacyGaSpy.calls.reset();
      service.locationChanged('testUrl#two');
      expect(legacyGaSpy).toHaveBeenCalledWith('set', 'page', '/testUrl#two');
      expect(legacyGaSpy).toHaveBeenCalledWith('send', 'pageview');
    });

    it('should send same URL twice when other intervening URL', () => {
      service.locationChanged('testUrl');
      expect(legacyGaSpy).toHaveBeenCalledWith('set', 'page', '/testUrl');
      expect(legacyGaSpy).toHaveBeenCalledWith('send', 'pageview');
      legacyGaSpy.calls.reset();
      service.locationChanged('testUrl2');
      expect(legacyGaSpy).toHaveBeenCalledWith('set', 'page', '/testUrl2');
      expect(legacyGaSpy).toHaveBeenCalledWith('send', 'pageview');
      legacyGaSpy.calls.reset();
      service.locationChanged('testUrl');
      expect(legacyGaSpy).toHaveBeenCalledWith('set', 'page', '/testUrl');
      expect(legacyGaSpy).toHaveBeenCalledWith('send', 'pageview');
    });
  });

  describe('sendEvent', () => {
    it('should send "event" with associated data', () => {
      // ensure no calls from initialization of the service
      // result in a false-positive check here.
      legacyGaSpy.calls.reset();
      gtagSpy.calls.reset();

      service.sendEvent('some_name', {works: 'true', confirmed: true, count: 3});
      expect(gtagSpy).toHaveBeenCalledWith('event', 'some_name', {works: 'true', confirmed: true, count: 3});
      expect(legacyGaSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe('error reporting', () => {
    it('should subscribe to window uncaught errors and report them', () => {
      spyOn(service, 'reportError');

      windowOnErrorHandler(new ErrorEvent('error', {
        error: new Error('Test Error')
      }));

      expect(service.reportError).toHaveBeenCalledTimes(1);
      expect(service.reportError).toHaveBeenCalledWith(
          jasmine.stringContaining('Test Error\n'), true);
    });

    it('should report errors to analytics by dispatching `gtag` and `ga` events', () => {
      legacyGaSpy.calls.reset();
      gtagSpy.calls.reset();

      windowOnErrorHandler(new ErrorEvent('error', {
        error: new Error('Test Error')
      }));

      expect(legacyGaSpy).toHaveBeenCalledTimes(1);
      expect(legacyGaSpy).toHaveBeenCalledWith('send', 'exception',
        jasmine.objectContaining({
          exDescription: jasmine.stringContaining('Test Error\n'),
          exFatal: true
        })
      );

      expect(gtagSpy).toHaveBeenCalledTimes(1);
      expect(gtagSpy).toHaveBeenCalledWith('event', 'exception',
        jasmine.objectContaining({
          description: jasmine.stringContaining('Test Error\n'),
          fatal: true
        })
      );
    });
  });

  it('should support replacing the legacy `window.ga` function', () => {
    const gaSpy2 = jasmine.createSpy('new ga');
    mockWindow.ga = gaSpy2;
    legacyGaSpy.calls.reset();

    service.locationChanged('testUrl');
    expect(legacyGaSpy).not.toHaveBeenCalled();
    expect(gaSpy2).toHaveBeenCalledWith('set', 'page', '/testUrl');
    expect(gaSpy2).toHaveBeenCalledWith('send', 'pageview');
  });
});
