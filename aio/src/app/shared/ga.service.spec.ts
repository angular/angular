import { ReflectiveInjector } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';

import { GaService } from 'app/shared/ga.service';
import { Logger } from 'app/shared/logger.service';

describe('GaService', () => {
  let gaSpy: jasmine.Spy;
  let injector: ReflectiveInjector;


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
        const count1 = gaSpy.calls.count();

        gaService.sendPage('testUrl');
        const count2 = gaSpy.calls.count();
        expect(count2).toEqual(count1);
      });

      it('should send same URL twice when other intervening URL', () => {
        gaService.sendPage('testUrl');
        const count1 = gaSpy.calls.count();

        gaService.sendPage('testUrl2');
        const count2 = gaSpy.calls.count();
        expect(count2).toBeGreaterThan(count1, 'testUrl2 was sent');

        gaService.sendPage('testUrl');
        const count3 = gaSpy.calls.count();
        expect(count3).toBeGreaterThan(count1, 'testUrl was sent 2nd time');
      });
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
