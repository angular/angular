/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ConsoleLogger, DEBUG, ERROR, WARN} from '../src/console_logger';
import {LogLevel} from '../src/logger';

describe('ConsoleLogger', () => {
  it('should pass through calls to Console', () => {
    spyOn(console, 'debug');
    spyOn(console, 'info');
    spyOn(console, 'warn');
    spyOn(console, 'error');
    const logger = new ConsoleLogger(LogLevel.debug);

    logger.debug('debug', 'test');
    expect(console.debug).toHaveBeenCalledWith(DEBUG, 'debug', 'test');

    logger.info('info', 'test');
    expect(console.info).toHaveBeenCalledWith('info', 'test');

    logger.warn('warn', 'test');
    expect(console.warn).toHaveBeenCalledWith(WARN, 'warn', 'test');

    logger.error('error', 'test');
    expect(console.error).toHaveBeenCalledWith(ERROR, 'error', 'test');
  });

  it('should filter out calls below the given log level', () => {
    spyOn(console, 'debug');
    spyOn(console, 'info');
    spyOn(console, 'warn');
    spyOn(console, 'error');
    const logger = new ConsoleLogger(LogLevel.warn);

    logger.debug('debug', 'test');
    expect(console.debug).not.toHaveBeenCalled();

    logger.info('info', 'test');
    expect(console.info).not.toHaveBeenCalled();

    logger.warn('warn', 'test');
    expect(console.warn).toHaveBeenCalledWith(WARN, 'warn', 'test');

    logger.error('error', 'test');
    expect(console.error).toHaveBeenCalledWith(ERROR, 'error', 'test');
  });

  it('should expose the logging level', () => {
    expect(new ConsoleLogger(LogLevel.debug).level).toEqual(LogLevel.debug);
    expect(new ConsoleLogger(LogLevel.info).level).toEqual(LogLevel.info);
    expect(new ConsoleLogger(LogLevel.warn).level).toEqual(LogLevel.warn);
    expect(new ConsoleLogger(LogLevel.error).level).toEqual(LogLevel.error);
  });
});
