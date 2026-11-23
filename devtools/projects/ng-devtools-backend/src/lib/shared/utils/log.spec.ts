/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// tslint:disable:no-console

import {DEBUG_LOG_MSG_PREFIX, LOG_MSG_PREFIX, debugLog, log, setupLogging} from './log';

describe('log utils', () => {
  afterEach(() => setupLogging(false));

  describe('log', () => {
    it('should log with the user-facing prefix', () => {
      spyOn(console, 'log');

      log('hello', 42);

      expect(console.log).toHaveBeenCalledWith(LOG_MSG_PREFIX, 'hello', 42);
    });

    it('should log warnings with the user-facing prefix', () => {
      spyOn(console, 'warn');

      log.warn('careful');

      expect(console.warn).toHaveBeenCalledWith(LOG_MSG_PREFIX, 'careful');
    });

    it('should log debug messages with the user-facing prefix', () => {
      spyOn(console, 'debug');

      log.debug('debugging');

      expect(console.debug).toHaveBeenCalledWith(LOG_MSG_PREFIX, 'debugging');
    });

    it('should log info messages with the user-facing prefix', () => {
      spyOn(console, 'info');

      log.info('info');

      expect(console.info).toHaveBeenCalledWith(LOG_MSG_PREFIX, 'info');
    });

    it('should log errors with the user-facing prefix', () => {
      spyOn(console, 'error');

      log.error('oops');

      expect(console.error).toHaveBeenCalledWith(LOG_MSG_PREFIX, 'oops');
    });

    it('should support log.log for compatibility', () => {
      spyOn(console, 'log');

      log.log('compat');

      expect(console.log).toHaveBeenCalledWith(LOG_MSG_PREFIX, 'compat');
    });

    it('should log regardless of dev mode', () => {
      spyOn(console, 'log');
      setupLogging(true);

      log('dev');

      expect(console.log).toHaveBeenCalledWith(LOG_MSG_PREFIX, 'dev');
    });
  });

  describe('debugLog', () => {
    it('should not log when dev mode is disabled', () => {
      spyOn(console, 'log');

      debugLog('hidden');

      expect(console.log).not.toHaveBeenCalled();
    });

    it('should not log warnings when dev mode is disabled', () => {
      spyOn(console, 'warn');

      debugLog.warn('hidden');

      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should not log debug messages when dev mode is disabled', () => {
      spyOn(console, 'debug');

      debugLog.debug('hidden');

      expect(console.debug).not.toHaveBeenCalled();
    });

    it('should not log info messages when dev mode is disabled', () => {
      spyOn(console, 'info');

      debugLog.info('hidden');

      expect(console.info).not.toHaveBeenCalled();
    });

    it('should not log errors when dev mode is disabled', () => {
      spyOn(console, 'error');

      debugLog.error('hidden');

      expect(console.error).not.toHaveBeenCalled();
    });

    it('should log with the dev-only prefix when dev mode is enabled', () => {
      spyOn(console, 'log');
      setupLogging(true);

      debugLog('shown', {a: 1});

      expect(console.log).toHaveBeenCalledWith(DEBUG_LOG_MSG_PREFIX, 'shown', {a: 1});
    });

    it('should log warnings with the dev-only prefix when dev mode is enabled', () => {
      spyOn(console, 'warn');
      setupLogging(true);

      debugLog.warn('shown');

      expect(console.warn).toHaveBeenCalledWith(DEBUG_LOG_MSG_PREFIX, 'shown');
    });

    it('should log debug messages with the dev-only prefix when dev mode is enabled', () => {
      spyOn(console, 'debug');
      setupLogging(true);

      debugLog.debug('shown');

      expect(console.debug).toHaveBeenCalledWith(DEBUG_LOG_MSG_PREFIX, 'shown');
    });

    it('should log info messages with the dev-only prefix when dev mode is enabled', () => {
      spyOn(console, 'info');
      setupLogging(true);

      debugLog.info('shown');

      expect(console.info).toHaveBeenCalledWith(DEBUG_LOG_MSG_PREFIX, 'shown');
    });

    it('should log errors with the dev-only prefix when dev mode is enabled', () => {
      spyOn(console, 'error');
      setupLogging(true);

      debugLog.error('shown');

      expect(console.error).toHaveBeenCalledWith(DEBUG_LOG_MSG_PREFIX, 'shown');
    });

    it('should support debugLog.log for compatibility', () => {
      spyOn(console, 'log');
      setupLogging(true);

      debugLog.log('compat');

      expect(console.log).toHaveBeenCalledWith(DEBUG_LOG_MSG_PREFIX, 'compat');
    });
  });
});
