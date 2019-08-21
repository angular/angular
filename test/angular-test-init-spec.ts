import {ComponentFixture, TestBed} from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {testBlocklist} from './test-blocklist';

/*
 * Common setup / initialization for all unit tests in Angular Material and CDK.
 */

const testBed = TestBed.initTestEnvironment(
    [BrowserDynamicTestingModule], platformBrowserDynamicTesting());
patchTestBedToDestroyFixturesAfterEveryTest(testBed);

(window as any).module = {};
(window as any).isNode = false;
(window as any).isBrowser = true;
(window as any).global = window;


/**
 * Monkey-patches TestBed.resetTestingModule such that any errors that occur during component
 * destruction are thrown instead of silently logged. Also runs TestBed.resetTestingModule after
 * each unit test.
 *
 * Without this patch, the combination of two behaviors is problematic for Angular Material:
 * - TestBed.resetTestingModule catches errors thrown on fixture destruction and logs them without
 *     the errors ever being thrown. This means that any component errors that occur in ngOnDestroy
 *     can encounter errors silently and still pass unit tests.
 * - TestBed.resetTestingModule is only called *before* a test is run, meaning that even *if* the
 *    aforementioned errors were thrown, they would be reported for the wrong test (the test that's
 *    about to start, not the test that just finished).
 */
function patchTestBedToDestroyFixturesAfterEveryTest(testBedInstance: TestBed) {
  // Original resetTestingModule function of the TestBed.
  const _resetTestingModule = testBedInstance.resetTestingModule;

  // Monkey-patch the resetTestingModule to destroy fixtures outside of a try/catch block.
  // With https://github.com/angular/angular/commit/2c5a67134198a090a24f6671dcdb7b102fea6eba
  // errors when destroying components are no longer causing Jasmine to fail.
  testBedInstance.resetTestingModule = function(this: {_activeFixtures: ComponentFixture<any>[]}) {
    try {
      this._activeFixtures.forEach((fixture: ComponentFixture<any>) => fixture.destroy());
    } finally {
      this._activeFixtures = [];
      // Regardless of errors or not, run the original reset testing module function.
      _resetTestingModule.call(this);
    }
  };

  // Angular's testing package resets the testing module before each test. This doesn't work well
  // for us because it doesn't allow developers to see what test actually failed.
  // Fixing this by resetting the testing module after each test.
  // https://github.com/angular/angular/blob/master/packages/core/testing/src/before_each.ts#L25
  afterEach(() => testBedInstance.resetTestingModule());
}


// Filter out any tests explicitly given in the blocklist. The blocklist is empty in the
// components repository, but the file will be overwritten if the framework repository runs
// the Angular component test suites against the latest snapshots. This is helpful because
// sometimes breaking changes that break individual tests land in the framework repository.
// It should be possible to disable these tests until the component repository migrated the
// broken tests once the breaking change is released.
(jasmine.getEnv() as any).configure({
  specFilter: function(spec: jasmine.Spec) {
    return !testBlocklist || !testBlocklist[spec.getFullName()];
  }
});
