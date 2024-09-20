/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

let db: any;
class MyService {}
class MyMockService implements MyService {}

describe('some component', () => {
  it('does something', () => {
    // This is a test.
  });
});

// tslint:disable-next-line:ban
fdescribe('some component', () => {
  it('has a test', () => {
    // This test will run.
  });
});
describe('another component', () => {
  it('also has a test', () => {
    throw 'This test will not run.';
  });
});

xdescribe('some component', () => {
  it('has a test', () => {
    throw 'This test will not run.';
  });
});
describe('another component', () => {
  it('also has a test', () => {
    // This test will run.
  });
});

describe('some component', () => {
  // tslint:disable-next-line:ban
  fit('has a test', () => {
    // This test will run.
  });
  it('has another test', () => {
    throw 'This test will not run.';
  });
});

describe('some component', () => {
  xit('has a test', () => {
    throw 'This test will not run.';
  });
  it('has another test', () => {
    // This test will run.
  });
});

describe('some component', () => {
  beforeEach(() => {
    db.connect();
  });
  it('uses the db', () => {
    // Database is connected.
  });
});

describe('some component', () => {
  afterEach((done: Function) => {
    db.reset().then((_: any) => done());
  });
  it('uses the db', () => {
    // This test can leave the database in a dirty state.
    // The afterEach will ensure it gets reset.
  });
});
