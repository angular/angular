/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

<<<<<<< HEAD
import { TestBed, enableTestBedAutoReset, disableTestBedAutoReset } from '../testing';

describe('before_each', () => {

    describe('default behavior', () => {
        const originalTestBedresetTestingModule = TestBed.resetTestingModule;
        let resetTestingModuleCalled = false;

        beforeAll(() => {
            // replace TestBed.resetTestingModule with a mock function
            TestBed.resetTestingModule = () => {
                resetTestingModuleCalled = true;
                return TestBed;
            };
        });

        afterAll(() => {
            TestBed.resetTestingModule = originalTestBedresetTestingModule;
        });

        it ('should call TestBed.resetTestingModule in beforeEach', () => {
            expect(resetTestingModuleCalled).toBeTruthy();
        });
    });

    describe('when disableTestBedAutoReset was called', () => {
        const originalTestBedresetTestingModule = TestBed.resetTestingModule;
        let resetTestingModuleCalled = false;

        beforeAll(() => {
            // replace TestBed.resetTestingModule with a mock function
            TestBed.resetTestingModule = () => {
                resetTestingModuleCalled = true;
                return TestBed;
            };
        });

        beforeAll(disableTestBedAutoReset);

        afterAll(() => {
            TestBed.resetTestingModule = originalTestBedresetTestingModule;
        });

        it ('should not call TestBed.resetTestingModule in beforeEach', () => {
            expect(resetTestingModuleCalled).toBeFalsy();
        });
    });

    describe('when enableTestBedAutoReset was called', () => {
        const originalTestBedresetTestingModule = TestBed.resetTestingModule;
        let resetTestingModuleCalled = false;

        beforeAll(() => {
            // replace TestBed.resetTestingModule with a mock function
            TestBed.resetTestingModule = () => {
                resetTestingModuleCalled = true;
                return TestBed;
            };
        });

        beforeAll(disableTestBedAutoReset);
        beforeAll(enableTestBedAutoReset);

        afterAll(() => {
            TestBed.resetTestingModule = originalTestBedresetTestingModule;
        });

        it ('should call TestBed.resetTestingModule in beforeEach', () => {
            expect(resetTestingModuleCalled).toBeTruthy();
        });
    });
=======
import {TestBed, disableTestBedAutoReset, enableTestBedAutoReset} from '../testing';

describe('before_each', () => {

  describe('default behavior', () => {
    const originalTestBedresetTestingModule = TestBed.resetTestingModule;
    let resetTestingModuleCalled = false;

    beforeAll(() => {
      // replace TestBed.resetTestingModule with a mock function
      TestBed.resetTestingModule = () => {
        resetTestingModuleCalled = true;
        return TestBed;
      };
    });

    afterAll(() => { TestBed.resetTestingModule = originalTestBedresetTestingModule; });

    it('should call TestBed.resetTestingModule in beforeEach',
       () => { expect(resetTestingModuleCalled).toBeTruthy(); });
  });

  describe('when disableTestBedAutoReset was called', () => {
    const originalTestBedresetTestingModule = TestBed.resetTestingModule;
    let resetTestingModuleCalled = false;

    beforeAll(() => {
      // replace TestBed.resetTestingModule with a mock function
      TestBed.resetTestingModule = () => {
        resetTestingModuleCalled = true;
        return TestBed;
      };
    });

    beforeAll(disableTestBedAutoReset);

    afterAll(() => { TestBed.resetTestingModule = originalTestBedresetTestingModule; });

    it('should not call TestBed.resetTestingModule in beforeEach',
       () => { expect(resetTestingModuleCalled).toBeFalsy(); });
  });

  describe('when enableTestBedAutoReset was called', () => {
    const originalTestBedresetTestingModule = TestBed.resetTestingModule;
    let resetTestingModuleCalled = false;

    beforeAll(() => {
      // replace TestBed.resetTestingModule with a mock function
      TestBed.resetTestingModule = () => {
        resetTestingModuleCalled = true;
        return TestBed;
      };
    });

    beforeAll(disableTestBedAutoReset);
    beforeAll(enableTestBedAutoReset);

    afterAll(() => { TestBed.resetTestingModule = originalTestBedresetTestingModule; });

    it('should call TestBed.resetTestingModule in beforeEach',
       () => { expect(resetTestingModuleCalled).toBeTruthy(); });
  });
>>>>>>> dac4928... feat(core): allow tests to disable the automatic calls of TestBed.resetTestingModule in beforeEach
});