const waitForAsync = Zone[Zone.__symbol__('asyncTest')];

function assertInsideProxyZone() {
  expect(Zone.current.name).toEqual('ProxyZone');
}
function assertInsideSyncDescribeZone() {
  expect(Zone.current.name).toEqual('syncTestZone for jest.describe');
}
describe('describe', () => {
  assertInsideSyncDescribeZone();
  beforeEach(() => {
    assertInsideProxyZone();
  });
  beforeAll(() => {
    assertInsideProxyZone();
  });
  afterEach(() => {
    assertInsideProxyZone();
  });
  afterAll(() => {
    assertInsideProxyZone();
  });

  it('dummy test since jest does not allow before/after each without test', () => {
    expect(true).toBe(true);
  });
});
describe.each([[1, 2]])('describe.each', (arg1, arg2) => {
  assertInsideSyncDescribeZone();
  expect(arg1).toBe(1);
  expect(arg2).toBe(2);
});
describe('test', () => {
  it('it', () => {
    assertInsideProxyZone();
  });
  it.each([[1, 2]])('it.each', (arg1, arg2) => {
    assertInsideProxyZone();
    expect(arg1).toBe(1);
    expect(arg2).toBe(2);
  });
  test('test', () => {
    assertInsideProxyZone();
  });
  test.each([[]])('test.each', () => {
    assertInsideProxyZone();
  });

  test.each([
    ['1', 1],
    ['2', 2],
  ])(
    'Test.each ["%s", %s]',
    waitForAsync((p1, p2) => {
      expect(typeof p1).toEqual('string');
      expect(typeof p2).toEqual('number');
      expect(p1).toEqual('' + p2);
    }),
  );
});

it('it', () => {
  assertInsideProxyZone();
});
it('it with done', (done) => {
  assertInsideProxyZone();
  done();
});

it.each([[1, 2]])('it.each', (arg1, arg2, done) => {
  assertInsideProxyZone();
  expect(arg1).toBe(1);
  expect(arg2).toBe(2);
  done();
});

it.each([2])('it.each with 1D array', (arg1) => {
  assertInsideProxyZone();
  expect(arg1).toBe(2);
});

it.each([2])('it.each with 1D array and done', (arg1, done) => {
  assertInsideProxyZone();
  expect(arg1).toBe(2);
  done();
});

it.each`
  foo  | bar
  ${1} | ${2}
`('it.each should work with table as a tagged template literal', ({foo, bar}) => {
  expect(foo).toBe(1);
  expect(bar).toBe(2);
});

it.each`
  foo  | bar
  ${1} | ${2}
`('it.each should work with table as a tagged template literal with done', ({foo, bar}, done) => {
  expect(foo).toBe(1);
  expect(bar).toBe(2);
  done();
});

it.each`
  foo  | bar
  ${1} | ${2}
`('(async) it.each should work with table as a tagged template literal', async ({foo, bar}) => {
  expect(foo).toBe(1);
  expect(bar).toBe(2);
});

it.failing('it is not equal', () => {
  expect(5).toBe(6); // this test will pass
});

test('test', () => {
  assertInsideProxyZone();
});
test.each([[]])('test.each', () => {
  assertInsideProxyZone();
});

test.todo('todo');
test.failing('it is not equal', () => {
  expect(5).toBe(6); // this test will pass
});

function enableJestPatch() {
  global[Zone.__symbol__('fakeAsyncDisablePatchingFakeTimer')] = true;
}

function disableJestPatch() {
  global[Zone.__symbol__('fakeAsyncDisablePatchingFakeTimer')] = false;
}
const {resetFakeAsyncZone, flushMicrotasks, discardPeriodicTasks, tick, flush, fakeAsync} =
  Zone[Zone.__symbol__('fakeAsyncTest')];

describe('jest modern fakeTimers with zone.js fakeAsync', () => {
  beforeEach(() => {
    jest.useFakeTimers('modern');
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  test('should run into fakeAsync() automatically', () => {
    const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
    expect(fakeAsyncZoneSpec).toBeTruthy();
    expect(typeof fakeAsyncZoneSpec.tick).toEqual('function');
  });

  test('setSystemTime should set FakeDate.currentFakeTime', () => {
    const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
    let d = fakeAsyncZoneSpec.getRealSystemTime();
    jest.setSystemTime(d);
    expect(Date.now()).toEqual(d);
    for (let i = 0; i < 10_000_000; i++) {}
    expect(fakeAsyncZoneSpec.getRealSystemTime()).not.toEqual(d);
    d = fakeAsyncZoneSpec.getRealSystemTime();
    let timeoutTriggered = false;
    setTimeout(() => {
      timeoutTriggered = true;
    }, 100);
    jest.setSystemTime(d);
    tick(100);
    expect(timeoutTriggered).toBe(true);
    expect(Date.now()).toEqual(d + 100);
  });

  test('runAllTicks should run all microTasks', () => {
    const logs = [];
    Promise.resolve(1).then((v) => logs.push(v));
    expect(logs).toEqual([]);
    jest.runAllTicks();
    expect(logs).toEqual([1]);
  });

  test('runAllTimers should run all macroTasks', () => {
    const logs = [];
    Promise.resolve(1).then((v) => logs.push(v));
    setTimeout(() => {
      logs.push('timeout');
    });
    const id = setInterval(() => {
      logs.push('interval');
    }, 100);
    expect(logs).toEqual([]);
    jest.runAllTimers();
    expect(logs).toEqual([1, 'timeout', 'interval']);
    clearInterval(id);
  });

  test('advanceTimersByTime should act as tick', () => {
    const logs = [];
    setTimeout(() => {
      logs.push('timeout');
    }, 100);
    expect(logs).toEqual([]);
    jest.advanceTimersByTime(100);
    expect(logs).toEqual(['timeout']);
  });

  test('runOnlyPendingTimers should run all macroTasks and ignore new spawn macroTasks', () => {
    const logs = [];
    Promise.resolve(1).then((v) => logs.push(v));
    let nestedTimeoutId;
    setTimeout(() => {
      logs.push('timeout');
      nestedTimeoutId = setTimeout(() => {
        logs.push('new timeout');
      });
    });
    expect(logs).toEqual([]);
    jest.runOnlyPendingTimers();
    expect(logs).toEqual([1, 'timeout']);
    clearTimeout(nestedTimeoutId);
  });

  test('advanceTimersToNextTimer should trigger correctly', () => {
    const logs = [];
    setTimeout(() => {
      logs.push('timeout1');
    }, 100);
    setTimeout(() => {
      logs.push('timeout11');
    }, 100);
    setTimeout(() => {
      logs.push('timeout2');
    }, 200);
    setTimeout(() => {
      logs.push('timeout3');
    }, 300);
    expect(logs).toEqual([]);
    jest.advanceTimersToNextTimer();
    expect(logs).toEqual(['timeout1', 'timeout11']);
    jest.advanceTimersToNextTimer(2);
    expect(logs).toEqual(['timeout1', 'timeout11', 'timeout2', 'timeout3']);
  });

  test('clearAllTimers should clear all macroTasks', () => {
    const logs = [];
    setTimeout(() => {
      logs.push('timeout1');
    }, 100);
    setTimeout(() => {
      logs.push('timeout2');
    }, 200);
    setInterval(() => {
      logs.push('interval');
    }, 100);
    expect(logs).toEqual([]);
    jest.clearAllTimers();
    jest.advanceTimersByTime(300);
    expect(logs).toEqual([]);
  });

  test('getTimerCount should get the count of macroTasks correctly', () => {
    const logs = [];
    setTimeout(() => {
      logs.push('timeout1');
    }, 100);
    setTimeout(() => {
      logs.push('timeout2');
    }, 200);
    setInterval(() => {
      logs.push('interval');
    }, 100);
    expect(logs).toEqual([]);
    expect(jest.getTimerCount()).toEqual(3);
    jest.clearAllTimers();
  });
});

describe('jest legacy fakeTimers with zone.js fakeAsync', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  test('should run into fakeAsync() automatically', () => {
    const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
    expect(fakeAsyncZoneSpec).toBeTruthy();
    expect(typeof fakeAsyncZoneSpec.tick).toEqual('function');
  });

  test('runAllTicks should run all microTasks', () => {
    const logs = [];
    Promise.resolve(1).then((v) => logs.push(v));
    expect(logs).toEqual([]);
    jest.runAllTicks();
    expect(logs).toEqual([1]);
  });

  test('runAllTimers should run all macroTasks', () => {
    const logs = [];
    Promise.resolve(1).then((v) => logs.push(v));
    setTimeout(() => {
      logs.push('timeout');
    });
    const id = setInterval(() => {
      logs.push('interval');
    }, 100);
    expect(logs).toEqual([]);
    jest.runAllTimers();
    expect(logs).toEqual([1, 'timeout', 'interval']);
    clearInterval(id);
  });

  test('advanceTimersByTime should act as tick', () => {
    const logs = [];
    setTimeout(() => {
      logs.push('timeout');
    }, 100);
    expect(logs).toEqual([]);
    jest.advanceTimersByTime(100);
    expect(logs).toEqual(['timeout']);
  });

  test('runOnlyPendingTimers should run all macroTasks and ignore new spawn macroTasks', () => {
    const logs = [];
    Promise.resolve(1).then((v) => logs.push(v));
    let nestedTimeoutId;
    setTimeout(() => {
      logs.push('timeout');
      nestedTimeoutId = setTimeout(() => {
        logs.push('new timeout');
      });
    });
    expect(logs).toEqual([]);
    jest.runOnlyPendingTimers();
    expect(logs).toEqual([1, 'timeout']);
    clearTimeout(nestedTimeoutId);
  });

  test('advanceTimersToNextTimer should trigger correctly', () => {
    const logs = [];
    setTimeout(() => {
      logs.push('timeout1');
    }, 100);
    setTimeout(() => {
      logs.push('timeout11');
    }, 100);
    setTimeout(() => {
      logs.push('timeout2');
    }, 200);
    setTimeout(() => {
      logs.push('timeout3');
    }, 300);
    expect(logs).toEqual([]);
    jest.advanceTimersToNextTimer();
    expect(logs).toEqual(['timeout1', 'timeout11']);
    jest.advanceTimersToNextTimer(2);
    expect(logs).toEqual(['timeout1', 'timeout11', 'timeout2', 'timeout3']);
  });

  test('clearAllTimers should clear all macroTasks', () => {
    const logs = [];
    setTimeout(() => {
      logs.push('timeout1');
    }, 100);
    setTimeout(() => {
      logs.push('timeout2');
    }, 200);
    setInterval(() => {
      logs.push('interval');
    }, 100);
    expect(logs).toEqual([]);
    jest.clearAllTimers();
    jest.advanceTimersByTime(300);
    expect(logs).toEqual([]);
  });

  test('getTimerCount should get the count of macroTasks correctly', () => {
    const logs = [];
    setTimeout(() => {
      logs.push('timeout1');
    }, 100);
    setTimeout(() => {
      logs.push('timeout2');
    }, 200);
    setInterval(() => {
      logs.push('interval');
    }, 100);
    expect(logs).toEqual([]);
    expect(jest.getTimerCount()).toEqual(3);
    jest.clearAllTimers();
  });
});

describe('jest fakeTimers inside test should call native delegate', () => {
  test('setSystemTime should set FakeDate.currentRealTime', () => {
    let fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
    expect(fakeAsyncZoneSpec).toBeFalsy();
    jest.useFakeTimers('modern');
    fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
    expect(fakeAsyncZoneSpec).toBeFalsy();
    const d = Date.now();
    jest.setSystemTime(d);
    for (let i = 0; i < 100000; i++) {}
    expect(jest.getRealSystemTime()).not.toEqual(d);
    jest.useRealTimers();
  });

  test('runAllTicks should run all microTasks', () => {
    jest.useFakeTimers();
    const logs = [];
    process.nextTick(() => {
      logs.push(1);
    });
    expect(logs).toEqual([]);
    jest.runAllTicks();
    expect(logs).toEqual([1]);
    jest.useRealTimers();
  });

  test('runAllTimers should run all macroTasks', () => {
    jest.useFakeTimers();
    const logs = [];
    process.nextTick(() => {
      logs.push(1);
    });
    setTimeout(() => {
      logs.push('timeout');
    });
    const id = setInterval(() => {
      logs.push('interval');
      clearInterval(id);
    }, 100);
    expect(logs).toEqual([]);
    jest.runAllTimers();
    expect(logs).toEqual([1, 'timeout', 'interval']);
    jest.useRealTimers();
  });

  test('advanceTimersByTime should act as tick', () => {
    jest.useFakeTimers();
    const logs = [];
    setTimeout(() => {
      logs.push('timeout');
    }, 100);
    expect(logs).toEqual([]);
    jest.advanceTimersByTime(100);
    expect(logs).toEqual(['timeout']);
    jest.useRealTimers();
  });

  test('runOnlyPendingTimers should run all macroTasks and ignore new spawn macroTasks', () => {
    jest.useFakeTimers();
    const logs = [];
    let nestedTimeoutId;
    setTimeout(() => {
      logs.push('timeout');
      nestedTimeoutId = setTimeout(() => {
        logs.push('new timeout');
      });
    });
    expect(logs).toEqual([]);
    jest.runOnlyPendingTimers();
    expect(logs).toEqual(['timeout']);
    clearTimeout(nestedTimeoutId);
    jest.useRealTimers();
  });

  test('advanceTimersToNextTimer should trigger correctly', () => {
    jest.useFakeTimers();
    const logs = [];
    setTimeout(() => {
      logs.push('timeout1');
    }, 100);
    setTimeout(() => {
      logs.push('timeout11');
    }, 100);
    setTimeout(() => {
      logs.push('timeout2');
    }, 200);
    setTimeout(() => {
      logs.push('timeout3');
    }, 300);
    expect(logs).toEqual([]);
    jest.advanceTimersToNextTimer();
    expect(logs).toEqual(['timeout1', 'timeout11']);
    jest.advanceTimersToNextTimer(2);
    expect(logs).toEqual(['timeout1', 'timeout11', 'timeout2', 'timeout3']);
    jest.useRealTimers();
  });

  test('clearAllTimers should clear all macroTasks', () => {
    jest.useFakeTimers();
    const logs = [];
    setTimeout(() => {
      logs.push('timeout1');
    }, 100);
    setTimeout(() => {
      logs.push('timeout2');
    }, 200);
    setInterval(() => {
      logs.push('interval');
    }, 100);
    expect(logs).toEqual([]);
    jest.clearAllTimers();
    jest.advanceTimersByTime(300);
    expect(logs).toEqual([]);
    jest.useRealTimers();
  });

  test('getTimerCount should get the count of macroTasks correctly', () => {
    jest.useFakeTimers();
    const logs = [];
    setTimeout(() => {
      logs.push('timeout1');
    }, 100);
    setTimeout(() => {
      logs.push('timeout2');
    }, 200);
    setInterval(() => {
      logs.push('interval');
    }, 100);
    expect(logs).toEqual([]);
    expect(jest.getTimerCount()).toEqual(3);
    jest.clearAllTimers();
    jest.useRealTimers();
  });
});
