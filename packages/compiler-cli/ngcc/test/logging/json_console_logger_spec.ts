/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {JsonConsoleLogger} from '../../src/logging/json_console_logger';
import {LogLevel} from '../../src/logging/logger';

describe('JsonConsoleLogger', () => {
  it('should pass through calls to Console', () => {
    spyOn(console, 'debug');
    spyOn(console, 'info');
    spyOn(console, 'warn');
    spyOn(console, 'error');
    const logger = new JsonConsoleLogger(LogLevel.debug);

    logger.debug('debug', 'test');
    expect(console.debug).toHaveBeenCalledWith('{"type":"debug","args":["debug","test"]}');

    logger.info('info', 'test');
    expect(console.info).toHaveBeenCalledWith('{"type":"info","args":["info","test"]}');

    logger.warn('warn', 'test');
    expect(console.warn).toHaveBeenCalledWith('{"type":"warn","args":["warn","test"]}');

    logger.error('error', 'test');
    expect(console.error).toHaveBeenCalledWith('{"type":"error","args":["error","test"]}');
  });

  it('should filter out calls below the given log level', () => {
    spyOn(console, 'debug');
    spyOn(console, 'info');
    spyOn(console, 'warn');
    spyOn(console, 'error');
    const logger = new JsonConsoleLogger(LogLevel.warn);

    logger.debug('debug', 'test');
    expect(console.debug).not.toHaveBeenCalled();

    logger.info('info', 'test');
    expect(console.info).not.toHaveBeenCalled();

    logger.warn('warn', 'test');
    expect(console.warn).toHaveBeenCalledWith('{"type":"warn","args":["warn","test"]}');

    logger.error('error', 'test');
    expect(console.error).toHaveBeenCalledWith('{"type":"error","args":["error","test"]}');
  });

  it('should encode newlines within args', () => {
    spyOn(console, 'error');
    const logger = new JsonConsoleLogger(LogLevel.debug);
    logger.error('error\ntest');
    expect(console.error).toHaveBeenCalledWith('{"type":"error","args":["error\\ntest"]}');
  });
});
