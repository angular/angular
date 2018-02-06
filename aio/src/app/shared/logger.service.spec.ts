import { ErrorHandler, ReflectiveInjector } from '@angular/core';
import { Logger } from './logger.service';

describe('logger service', () => {
  let logSpy: jasmine.Spy;
  let warnSpy: jasmine.Spy;
  let logger: Logger;
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    logSpy = spyOn(console, 'log');
    warnSpy = spyOn(console, 'warn');
    const injector = ReflectiveInjector.resolveAndCreate([
      Logger,
      { provide: ErrorHandler, useClass: MockErrorHandler }
    ]);
    logger = injector.get(Logger);
    errorHandler = injector.get(ErrorHandler);
  });

  describe('log', () => {
    it('should delegate to console.log', () => {
      logger.log('param1', 'param2', 'param3');
      expect(console.log).toHaveBeenCalledWith('param1', 'param2', 'param3');
    });
  });

  describe('warn', () => {
    it('should delegate to console.warn', () => {
      logger.warn('param1', 'param2', 'param3');
      expect(console.warn).toHaveBeenCalledWith('param1', 'param2', 'param3');
    });
  });

  describe('error', () => {
    it('should delegate to ErrorHandler', () => {
      logger.error('param1', 'param2', 'param3');
      expect(errorHandler.handleError).toHaveBeenCalledWith('param1 param2 param3');
    });
  });
});


class MockErrorHandler implements ErrorHandler {
  handleError = jasmine.createSpy('handleError');
}
