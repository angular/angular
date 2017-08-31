/**
  * @license
  * Copyright Google Inc. All Rights Reserved.
  *
  * Use of this source code is governed by an MIT-style license that can be
  * found in the LICENSE file at https://angular.io/license
  */

import {ConsoleLogger, Logger, NoOpLogger} from '../src/logger';

interface TestConsole {
  log?: (arg?: any) => string;
  warn?: (arg?: any) => string;
  info?: (arg?: any) => string;
  error?: (arg?: any) => string;
  debug?: (arg?: any) => string;
  group?: (arg?: any) => string;
  groupEnd?: (arg?: any) => string;
}

export function main() {
  describe('Logger', () => {
    let logBuffer: string;
    let _console: TestConsole|any;

    beforeEach(() => {
      logBuffer = '';
      _console = {
        log: (arg: any = '') => logBuffer += `log${arg};`,
        warn: (arg: any = '') => logBuffer += `warn${arg};`,
        info: (arg: any = '') => logBuffer += `info${arg};`,
        error: (arg: any = '') => logBuffer += `error${arg};`,
        debug: (arg: any = '') => logBuffer += `debug${arg};`,
        group: (arg: any = '') => logBuffer += `group${arg};`,
        groupEnd: () => logBuffer += 'groupEnd;',
      };
    });

    describe('No op', () => {
      it('should not log anything', () => {
        const logger: Logger = new NoOpLogger();
        logger.info();
        logger.log();
        logger.debug();
        logger.error();
        logger.warn();
        logger.group();
        logger.groupEnd();
        expect(logBuffer).toEqual('');
      });
    });

    describe('Console', () => {
      it('should use console if present', () => {
        const logger: Logger = new ConsoleLogger(_console);
        logger.info('$');
        logger.log('$');
        logger.debug('$');
        logger.error('$');
        logger.warn('$');
        logger.group('$');
        logger.groupEnd();
        expect(logBuffer).toEqual('info$;log$;debug$;error$;warn$;group$;groupEnd;');
      });

      it('should use console.log() if other not present', () => {
        const _console: any = {log: () => logBuffer += 'log;'};
        const logger: Logger = new ConsoleLogger(_console);
        logger.info();
        logger.log();
        logger.debug();
        logger.error();
        logger.warn();
        logger.group();
        logger.groupEnd();
        expect(logBuffer).toEqual('log;log;log;log;log;log;log;');
      });

      it('should use noop if no console', () => {
        const logger: Logger = new ConsoleLogger(<any>{});
        logger.info();
        logger.log();
        logger.debug();
        logger.error();
        logger.warn();
        logger.group();
        logger.groupEnd();
        expect(logBuffer).toEqual('');
      });

      describe('debug', () => {
        it('should skip debugging output if disabled', () => {
          const logger: Logger = new ConsoleLogger(_console, false);
          logger.info();
          logger.log();
          logger.debug();
          logger.error();
          logger.warn();
          logger.group();
          logger.groupEnd();
          expect(logBuffer).toEqual('info;log;error;warn;group;groupEnd;');
        });
      });

      describe('IE logging', () => {
        it(`should work in IE where console methods don't have 'apply' method`, () => {
          removeApplyFunctionForIE(_console);
          const logger: Logger = new ConsoleLogger(_console);
          logger.info('$');
          logger.log('$');
          logger.debug('$');
          logger.error('$');
          logger.warn('$');
          logger.group('$');
          logger.groupEnd();
          expect(logBuffer).toEqual('info$;log$;debug$;error$;warn$;group$;groupEnd;');
        });

        function removeApplyFunctionForIE(console: TestConsole): void {
          delete console.log !.apply;
          delete console.warn !.apply;
          delete console.info !.apply;
          delete console.error !.apply;
          delete console.debug !.apply;
          delete console.group !.apply;
          delete console.groupEnd !.apply;
        }
      });
    });
  });
}
