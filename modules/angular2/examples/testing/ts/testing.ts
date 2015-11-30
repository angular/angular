import {
  describe,
  fdescribe,
  xdescribe,
  it,
  fit,
  xit,
  beforeEach,
  afterEach,
  beforeEachProviders,
  inject
} from 'angular2/testing';
import {provide} from 'angular2/core';

var db: any;
class MyService {}
class MyMockService implements MyService {}

// #docregion describeIt
describe('some component', () => {
  it('does something', () => {
                           // This is a test.
                       });
});
// #enddocregion

// #docregion fdescribe
fdescribe('some component', () => {
  it('has a test', () => {
                       // This test will run.
                   });
});
describe('another component',
         () => { it('also has a test', () => { throw 'This test will not run.'; }); });
// #enddocregion

// #docregion xdescribe
xdescribe('some component', () => { it('has a test', () => {throw 'This test will not run.'}); });
describe('another component', () => {
  it('also has a test', () => {
                            // This test will run.
                        });
});
// #enddocregion

// #docregion fit
describe('some component', () => {
  fit('has a test', () => {
                        // This test will run.
                    });
  it('has another test', () => { throw 'This test will not run.'; });
});
// #enddocregion

// #docregion xit
describe('some component', () => {
  xit('has a test', () => { throw 'This test will not run.'; });
  it('has another test', () => {
                             // This test will run.
                         });
});
// #enddocregion

// #docregion beforeEach
describe('some component', () => {
  beforeEach(() => { db.connect(); });
  it('uses the db', () => {
                        // Database is connected.
                    });
});
// #enddocregion

// #docregion beforeEachProviders
describe('some component', () => {
  beforeEachProviders(() => [provide(MyService, {useClass: MyMockService})]);
  it('uses MyService', inject([MyService], (service) => {
                                               // service is an instance of MyMockService.
                                           }));
});
// #enddocregion

// #docregion afterEach
describe('some component', () => {
  afterEach((done) => { db.reset().then((_) => done()); });
  it('uses the db', () => {
                        // This test can leave the database in a dirty state.
                        // The afterEach will ensure it gets reset.
                    });
});
// #enddocregion
