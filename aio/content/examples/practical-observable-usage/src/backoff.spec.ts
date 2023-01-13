import { interval } from 'rxjs';
import { tap } from 'rxjs/operators';
import { backoff } from './backoff';

describe('backoff()', () => {
  beforeEach(() => jasmine.clock().install());
  afterEach(() => jasmine.clock().uninstall());

  it('should retry in case of error', () => {
    const mockConsole = {log: jasmine.createSpy('log')};
    const source = interval(10).pipe(
      tap(i => {
        if (i > 0) {
          throw new Error('Test error');
        }
      }),
      backoff(3, 100),
    );
    source.subscribe({
      next: v => mockConsole.log(`Emitted: ${v}`),
      error: e => mockConsole.log(`Errored: ${e.message || e}`),
      complete: () => mockConsole.log('Completed'),
    });

    // Initial try:
    // Errors on second emission and schedules retrying (with delay).
    jasmine.clock().tick(10);
    expect(mockConsole.log.calls.allArgs()).toEqual([['Emitted: 0']]);

    jasmine.clock().tick(10);
    expect(mockConsole.log.calls.allArgs()).toEqual([['Emitted: 0']]);
    mockConsole.log.calls.reset();

    // First re-attempt after 100ms:
    // Errors again on second emission and schedules retrying (with larger delay).
    jasmine.clock().tick(100);
    expect(mockConsole.log).not.toHaveBeenCalled();

    jasmine.clock().tick(10);
    expect(mockConsole.log.calls.allArgs()).toEqual([['Emitted: 0']]);

    jasmine.clock().tick(10);
    expect(mockConsole.log.calls.allArgs()).toEqual([['Emitted: 0']]);
    mockConsole.log.calls.reset();

    // Second re-attempt after 400ms:
    // Errors again on second emission and schedules retrying (with even larger delay).
    jasmine.clock().tick(400);
    expect(mockConsole.log).not.toHaveBeenCalled();

    jasmine.clock().tick(10);
    expect(mockConsole.log.calls.allArgs()).toEqual([['Emitted: 0']]);

    jasmine.clock().tick(10);
    expect(mockConsole.log.calls.allArgs()).toEqual([['Emitted: 0']]);
    mockConsole.log.calls.reset();

    // Third re-attempt after 900ms:
    // Errors again on second emission and gives up (no retrying).
    jasmine.clock().tick(900);
    expect(mockConsole.log).not.toHaveBeenCalled();

    jasmine.clock().tick(10);
    expect(mockConsole.log.calls.allArgs()).toEqual([['Emitted: 0']]);
    mockConsole.log.calls.reset();

    jasmine.clock().tick(10);
    expect(mockConsole.log.calls.allArgs()).toEqual([['Errored: Test error']]);
  });
});
