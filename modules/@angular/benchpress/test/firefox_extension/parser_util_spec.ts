/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {convertPerfProfileToEvents} from '../../src/firefox_extension/lib/parser_util';

function assertEventsEqual(actualEvents: any[], expectedEvents: any[]) {
  expect(actualEvents.length == expectedEvents.length);
  for (let i = 0; i < actualEvents.length; ++i) {
    const actualEvent = actualEvents[i];
    const expectedEvent = expectedEvents[i];
    for (const key in actualEvent) {
      expect(actualEvent[key]).toEqual(expectedEvent[key]);
    }
  }
};

export function main() {
  describe('convertPerfProfileToEvents', function() {
    it('should convert single instantaneous event', function() {
      const profileData = {
        threads: [
          {samples: [{time: 1, frames: [{location: 'FirefoxDriver.prototype.executeScript'}]}]}
        ]
      };
      const perfEvents = convertPerfProfileToEvents(profileData);
      assertEventsEqual(perfEvents, [{ph: 'X', ts: 1, name: 'script'}]);
    });

    it('should convert single non-instantaneous event', function() {
      const profileData = {
        threads: [{
          samples: [
            {time: 1, frames: [{location: 'FirefoxDriver.prototype.executeScript'}]},
            {time: 2, frames: [{location: 'FirefoxDriver.prototype.executeScript'}]},
            {time: 100, frames: [{location: 'FirefoxDriver.prototype.executeScript'}]}
          ]
        }]
      };
      const perfEvents = convertPerfProfileToEvents(profileData);
      assertEventsEqual(
          perfEvents, [{ph: 'B', ts: 1, name: 'script'}, {ph: 'E', ts: 100, name: 'script'}]);
    });

    it('should convert multiple instantaneous events', function() {
      const profileData = {
        threads: [{
          samples: [
            {time: 1, frames: [{location: 'FirefoxDriver.prototype.executeScript'}]},
            {time: 2, frames: [{location: 'PresShell::Paint'}]}
          ]
        }]
      };
      const perfEvents = convertPerfProfileToEvents(profileData);
      assertEventsEqual(
          perfEvents, [{ph: 'X', ts: 1, name: 'script'}, {ph: 'X', ts: 2, name: 'render'}]);
    });

    it('should convert multiple mixed events', function() {
      const profileData = {
        threads: [{
          samples: [
            {time: 1, frames: [{location: 'FirefoxDriver.prototype.executeScript'}]},
            {time: 2, frames: [{location: 'PresShell::Paint'}]},
            {time: 5, frames: [{location: 'FirefoxDriver.prototype.executeScript'}]},
            {time: 10, frames: [{location: 'FirefoxDriver.prototype.executeScript'}]}
          ]
        }]
      };
      const perfEvents = convertPerfProfileToEvents(profileData);
      assertEventsEqual(perfEvents, [
        {ph: 'X', ts: 1, name: 'script'}, {ph: 'X', ts: 2, name: 'render'},
        {ph: 'B', ts: 5, name: 'script'}, {ph: 'E', ts: 10, name: 'script'}
      ]);
    });

    it('should add args to gc events', function() {
      const profileData = {threads: [{samples: [{time: 1, frames: [{location: 'forceGC'}]}]}]};
      const perfEvents = convertPerfProfileToEvents(profileData);
      assertEventsEqual(perfEvents, [{ph: 'X', ts: 1, name: 'gc', args: {usedHeapSize: 0}}]);
    });

    it('should skip unknown events', function() {
      const profileData = {
        threads: [{
          samples: [
            {time: 1, frames: [{location: 'FirefoxDriver.prototype.executeScript'}]},
            {time: 2, frames: [{location: 'foo'}]}
          ]
        }]
      };
      const perfEvents = convertPerfProfileToEvents(profileData);
      assertEventsEqual(perfEvents, [{ph: 'X', ts: 1, name: 'script'}]);
    });
  });
};
