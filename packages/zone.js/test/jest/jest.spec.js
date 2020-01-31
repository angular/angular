function assertInsideProxyZone() {
  expect(Zone.current.name).toEqual('ProxyZone');
}
function assertInsideSyncDescribeZone() {
  expect(Zone.current.name).toEqual('syncTestZone for jest.describe');
}
describe('describe', () => {
  assertInsideSyncDescribeZone();
  beforeEach(() => { assertInsideProxyZone(); });
  beforeAll(() => { assertInsideProxyZone(); });
  afterEach(() => { assertInsideProxyZone(); });
  afterAll(() => { assertInsideProxyZone(); });
});
describe.each([[1, 2]])('describe.each', (arg1, arg2) => {
  assertInsideSyncDescribeZone();
  expect(arg1).toBe(1);
  expect(arg2).toBe(2);
});
describe('test', () => {
  it('it', () => { assertInsideProxyZone(); });
  it.each([[1, 2]])('it.each', (arg1, arg2) => {
    assertInsideProxyZone();
    expect(arg1).toBe(1);
    expect(arg2).toBe(2);
  });
  test('test', () => { assertInsideProxyZone(); });
  test.each([[]])('test.each', () => { assertInsideProxyZone(); });
});

it('it', () => { assertInsideProxyZone(); });
it.each([[1, 2]])('it.each', (arg1, arg2) => {
  assertInsideProxyZone();
  expect(arg1).toBe(1);
  expect(arg2).toBe(2);
});
test('test', () => { assertInsideProxyZone(); });
test.each([[]])('test.each', () => { assertInsideProxyZone(); });

test.todo('todo');
