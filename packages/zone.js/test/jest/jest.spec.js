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
});

it('it', () => {
  assertInsideProxyZone();
});
it('it with done', done => {
  assertInsideProxyZone();
  done();
});

it.each([[1, 2]])('it.each', (arg1, arg2, done) => {
  assertInsideProxyZone();
  expect(arg1).toBe(1);
  expect(arg2).toBe(2);
  done();
});

it.each([2])('it.each with 1D array', arg1 => {
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

test('test', () => {
  assertInsideProxyZone();
});
test.each([[]])('test.each', () => {
  assertInsideProxyZone();
});

test.todo('todo');
