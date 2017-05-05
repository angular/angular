import { ReflectiveInjector } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';

import { GaService } from 'app/shared/ga.service';
import { Logger } from 'app/shared/logger.service';

describe('GaService', () => {
  let gaSpy: jasmine.Spy;
  let injector: ReflectiveInjector;

  // filter for 'send' which communicates with server
  // returns the url of the 'send pageview'
  function gaSpySendCalls() {
    let lastUrl: string;
    return gaSpy.calls.all()
      .reduce((acc, c) =>  {
        const args = c.args;
        if (args[0] === 'set') {
          lastUrl = args[2];
        } else if (args[0] === 'send') {
          acc.push(lastUrl);
        }
        return acc;
      }, []);
  }

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
        GaService,
        { provide: Logger, useClass: TestLogger }
    ]);
  });

  describe('with ambient GA', () => {
    let gaService: GaService;

    beforeEach(fakeAsync(() => {
      this.winGa = window['ga']; // remember current GA tracker just in case

      // Replace Google Analytics tracker with spy after calling "ga ready" callback
      window['ga'] = (fn: Function) => {
        window['ga'] = gaSpy = jasmine.createSpy('ga');
        fn();
        tick(GaService.initializeDelay); // see GaService#initializeGa
      };
      gaService = injector.get(GaService);
    }));

    afterEach(() => {
      window['ga'] = this.winGa;
    });

    it('should initialize ga with "create" when constructed', () => {
      const first = gaSpy.calls.first().args;
      expect(first[0]).toBe('create');
    });

    describe('#locationChanged(url)', () => {
      it('should send page to url w/ leading slash', () => {
        gaService.locationChanged('testUrl');
        let args = gaSpy.calls.all()[1].args;
        expect(args).toEqual(['set', 'page', '/testUrl']);
        args = gaSpy.calls.all()[2].args;
        expect(args).toEqual(['send', 'pageview']);
      });
    });

    describe('#sendPage(url)', () => {
      it('should set page to url w/ leading slash', () => {
        gaService.sendPage('testUrl');
        const args = gaSpy.calls.all()[1].args;
        expect(args).toEqual(['set', 'page', '/testUrl']);
      });

      it('should send "pageview" ', () => {
        gaService.sendPage('testUrl');
        const args = gaSpy.calls.all()[2].args;
        expect(args).toEqual(['send', 'pageview']);
      });

      it('should not send twice with same URL, back-to-back', () => {
        gaService.sendPage('testUrl');
        gaService.sendPage('testUrl');
        expect(gaSpySendCalls()).toEqual(['/testUrl']);
      });

      it('should send twice with same URL, back-to-back, even when the hash changes', () => {
        // Therefore it is up to caller NOT to call it when hash changes if this is unwanted.
        // See LocationService and its specs
        gaService.sendPage('testUrl#one');
        gaService.sendPage('testUrl#two');
        expect(gaSpySendCalls()).toEqual([
          '/testUrl#one',
          '/testUrl#two'
        ]);

      });

      it('should send same URL twice when other intervening URL', () => {
        gaService.sendPage('testUrl');
        gaService.sendPage('testUrl2');
        gaService.sendPage('testUrl');
        expect(gaSpySendCalls()).toEqual([
          '/testUrl',
          '/testUrl2',
          '/testUrl'
        ]);
      });
    });

  });

  describe('when no ambient GA', () => {
    let gaService: GaService;
    let logger: TestLogger;

    it('should log with "create" when constructed', () => {
      gaService = injector.get(GaService);
      logger = injector.get(Logger);
      expect(logger.log.calls.count()).toBe(1, 'logger.log should be called');
      const first = logger.log.calls.first().args;
      expect(first[0]).toBe('ga:');
      expect(first[1][0]).toBe('create'); // first[1] is the array of args to ga()
    });
  });
});

class TestLogger {
  log = jasmine.createSpy('log');
}
