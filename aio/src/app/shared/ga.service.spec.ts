import { ReflectiveInjector } from '@angular/core';

import { GaService } from 'app/shared/ga.service';
import { WindowToken } from 'app/shared/window';

describe('GaService', () => {
  let gaService: GaService;
  let injector: ReflectiveInjector;
  let gaSpy: jasmine.Spy;
  let mockWindow: any;

  beforeEach(() => {
    gaSpy = jasmine.createSpy('ga');
    mockWindow = { ga: gaSpy };
    injector = ReflectiveInjector.resolveAndCreate([GaService, { provide: WindowToken, useFactory: () => mockWindow }]);
    gaService = injector.get(GaService);
  });

  it('should initialize ga with "create" when constructed', () => {
    const first = gaSpy.calls.first().args;
    expect(first[0]).toBe('create');
  });

  describe('#locationChanged(url)', () => {
    it('should send page to url w/ leading slash', () => {
      gaService.locationChanged('testUrl');
      expect(gaSpy).toHaveBeenCalledWith('set', 'page', '/testUrl');
      expect(gaSpy).toHaveBeenCalledWith('send', 'pageview');
    });
  });

  describe('#sendPage(url)', () => {
    it('should set page to url w/ leading slash', () => {
      gaService.sendPage('testUrl');
      expect(gaSpy).toHaveBeenCalledWith('set', 'page', '/testUrl');
    });

    it('should send "pageview" ', () => {
      gaService.sendPage('testUrl');
      expect(gaSpy).toHaveBeenCalledWith('send', 'pageview');
    });

    it('should not send twice with same URL, back-to-back', () => {
      gaService.sendPage('testUrl');
      gaSpy.calls.reset();
      gaService.sendPage('testUrl');
      expect(gaSpy).not.toHaveBeenCalled();
    });

    it('should send again even if only the hash changes', () => {
      // Therefore it is up to caller NOT to call it when hash changes if this is unwanted.
      // See LocationService and its specs
      gaService.sendPage('testUrl#one');
      expect(gaSpy).toHaveBeenCalledWith('set', 'page', '/testUrl#one');
      expect(gaSpy).toHaveBeenCalledWith('send', 'pageview');
      gaSpy.calls.reset();
      gaService.sendPage('testUrl#two');
      expect(gaSpy).toHaveBeenCalledWith('set', 'page', '/testUrl#two');
      expect(gaSpy).toHaveBeenCalledWith('send', 'pageview');
    });

    it('should send same URL twice when other intervening URL', () => {
      gaService.sendPage('testUrl');
      expect(gaSpy).toHaveBeenCalledWith('set', 'page', '/testUrl');
      expect(gaSpy).toHaveBeenCalledWith('send', 'pageview');
      gaSpy.calls.reset();
      gaService.sendPage('testUrl2');
      expect(gaSpy).toHaveBeenCalledWith('set', 'page', '/testUrl2');
      expect(gaSpy).toHaveBeenCalledWith('send', 'pageview');
      gaSpy.calls.reset();
      gaService.sendPage('testUrl');
      expect(gaSpy).toHaveBeenCalledWith('set', 'page', '/testUrl');
      expect(gaSpy).toHaveBeenCalledWith('send', 'pageview');
    });
  });

  describe('sendEvent', () => {
    it('should send "event" with associated data', () => {
      gaService.sendEvent('some source', 'some campaign', 'a label', 45);
      expect(gaSpy).toHaveBeenCalledWith('send', 'event', 'some source', 'some campaign', 'a label', 45);
    });
  });

  it('should support replacing the `window.ga` function', () => {
    const gaSpy2 = jasmine.createSpy('new ga');
    mockWindow.ga = gaSpy2;
    gaSpy.calls.reset();

    gaService.sendPage('testUrl');
    expect(gaSpy).not.toHaveBeenCalled();
    expect(gaSpy2).toHaveBeenCalledWith('set', 'page', '/testUrl');
    expect(gaSpy2).toHaveBeenCalledWith('send', 'pageview');
  });
});
