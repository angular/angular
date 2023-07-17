/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter} from 'events';

describe('nodejs EventEmitter', () => {
  let zone: Zone, zoneA: Zone, zoneB: Zone, emitter: EventEmitter, expectZoneACount: number,
      zoneResults: string[];
  beforeEach(() => {
    zone = Zone.current;
    zoneA = zone.fork({name: 'A'});
    zoneB = zone.fork({name: 'B'});

    emitter = new EventEmitter();
    expectZoneACount = 0;

    zoneResults = [];
  });

  function expectZoneA(value: string) {
    expectZoneACount++;
    expect(Zone.current.name).toBe('A');
    expect(value).toBe('test value');
  }

  function listenerA() {
    zoneResults.push('A');
  }

  function listenerB() {
    zoneResults.push('B');
  }

  function shouldNotRun() {
    fail('this listener should not run');
  }

  it('should register listeners in the current zone', () => {
    zoneA.run(() => {
      emitter.on('test', expectZoneA);
      emitter.addListener('test', expectZoneA);
    });
    zoneB.run(() => emitter.emit('test', 'test value'));
    expect(expectZoneACount).toBe(2);
  });
  it('allows chaining methods', () => {
    zoneA.run(() => {
      expect(emitter.on('test', expectZoneA)).toBe(emitter);
      expect(emitter.addListener('test', expectZoneA)).toBe(emitter);
    });
  });
  it('should remove listeners properly', () => {
    zoneA.run(() => {
      emitter.on('test', shouldNotRun);
      emitter.on('test2', shouldNotRun);
      emitter.removeListener('test', shouldNotRun);
    });
    zoneB.run(() => {
      emitter.removeListener('test2', shouldNotRun);
      emitter.emit('test', 'test value');
      emitter.emit('test2', 'test value');
    });
  });
  it('should remove listeners by calling off properly', () => {
    zoneA.run(() => {
      emitter.on('test', shouldNotRun);
      emitter.on('test2', shouldNotRun);
      emitter.off('test', shouldNotRun);
    });
    zoneB.run(() => {
      emitter.off('test2', shouldNotRun);
      emitter.emit('test', 'test value');
      emitter.emit('test2', 'test value');
    });
  });
  it('remove listener should return event emitter', () => {
    zoneA.run(() => {
      emitter.on('test', shouldNotRun);
      expect(emitter.removeListener('test', shouldNotRun)).toEqual(emitter);
      emitter.emit('test', 'test value');
    });
  });
  it('should return all listeners for an event', () => {
    zoneA.run(() => {
      emitter.on('test', expectZoneA);
    });
    zoneB.run(() => {
      emitter.on('test', shouldNotRun);
    });
    expect(emitter.listeners('test')).toEqual([expectZoneA, shouldNotRun]);
  });
  it('should return empty array when an event has no listeners', () => {
    zoneA.run(() => {
      expect(emitter.listeners('test')).toEqual([]);
    });
  });
  it('should prepend listener by order', () => {
    zoneA.run(() => {
      emitter.on('test', listenerA);
      emitter.on('test', listenerB);
      expect(emitter.listeners('test')).toEqual([listenerA, listenerB]);
      emitter.emit('test');
      expect(zoneResults).toEqual(['A', 'B']);
      zoneResults = [];

      emitter.removeAllListeners('test');

      emitter.on('test', listenerA);
      emitter.prependListener('test', listenerB);
      expect(emitter.listeners('test')).toEqual([listenerB, listenerA]);
      emitter.emit('test');
      expect(zoneResults).toEqual(['B', 'A']);
    });
  });
  it('should remove All listeners properly', () => {
    zoneA.run(() => {
      emitter.on('test', expectZoneA);
      emitter.on('test', expectZoneA);
      emitter.removeAllListeners('test');
      expect(emitter.listeners('test').length).toEqual(0);
    });
  });
  it('remove All listeners should return event emitter', () => {
    zoneA.run(() => {
      emitter.on('test', expectZoneA);
      emitter.on('test', expectZoneA);
      expect(emitter.removeAllListeners('test')).toEqual(emitter);
      expect(emitter.listeners('test').length).toEqual(0);
    });
  });
  it('should remove All listeners properly even without a type parameter', () => {
    zoneA.run(() => {
      emitter.on('test', shouldNotRun);
      emitter.on('test1', shouldNotRun);
      emitter.removeAllListeners();
      expect(emitter.listeners('test').length).toEqual(0);
      expect(emitter.listeners('test1').length).toEqual(0);
    });
  });
  it('should remove once listener after emit', () => {
    zoneA.run(() => {
      emitter.once('test', expectZoneA);
      emitter.emit('test', 'test value');
      expect(emitter.listeners('test').length).toEqual(0);
    });
  });
  it('should remove once listener properly before listener triggered', () => {
    zoneA.run(() => {
      emitter.once('test', shouldNotRun);
      emitter.removeListener('test', shouldNotRun);
      emitter.emit('test');
    });
  });
  it('should trigger removeListener when remove listener', () => {
    zoneA.run(() => {
      emitter.on('removeListener', function(type: string, handler: any) {
        zoneResults.push('remove' + type);
      });
      emitter.on('newListener', function(type: string, handler: any) {
        zoneResults.push('new' + type);
      });
      emitter.on('test', shouldNotRun);
      emitter.removeListener('test', shouldNotRun);
      expect(zoneResults).toEqual(['newtest', 'removetest']);
    });
  });
  it('should trigger removeListener when remove all listeners with eventname ', () => {
    zoneA.run(() => {
      emitter.on('removeListener', function(type: string, handler: any) {
        zoneResults.push('remove' + type);
      });
      emitter.on('test', shouldNotRun);
      emitter.on('test1', expectZoneA);
      emitter.removeAllListeners('test');
      expect(zoneResults).toEqual(['removetest']);
      expect(emitter.listeners('removeListener').length).toBe(1);
    });
  });
  it('should trigger removeListener when remove all listeners without eventname', () => {
    zoneA.run(() => {
      emitter.on('removeListener', function(type: string, handler: any) {
        zoneResults.push('remove' + type);
      });
      emitter.on('test', shouldNotRun);
      emitter.on('test1', shouldNotRun);
      emitter.removeAllListeners();
      expect(zoneResults).toEqual(['removetest', 'removetest1']);
      expect(emitter.listeners('test').length).toBe(0);
      expect(emitter.listeners('test1').length).toBe(0);
      expect(emitter.listeners('removeListener').length).toBe(0);
    });
  });
  it('should not enter endless loop when register uncaughtException to process', () => {
    require('domain');
    zoneA.run(() => {
      process.on('uncaughtException', function() {});
    });
  });
  it('should be able to addEventListener with symbol eventName', () => {
    zoneA.run(() => {
      const testSymbol = Symbol('test');
      const test1Symbol = Symbol('test1');
      emitter.on(testSymbol, expectZoneA);
      emitter.on(test1Symbol, shouldNotRun);
      emitter.removeListener(test1Symbol, shouldNotRun);
      expect(emitter.listeners(testSymbol).length).toBe(1);
      expect(emitter.listeners(test1Symbol).length).toBe(0);
      emitter.emit(testSymbol, 'test value');
    });
  });
});
