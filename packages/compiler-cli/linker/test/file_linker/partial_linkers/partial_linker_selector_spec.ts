/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import semver from 'semver';

import {MockLogger} from '../../../../src/ngtsc/logging/testing';
import {PartialLinker} from '../../../src/file_linker/partial_linkers/partial_linker';
import {LinkerRange, PartialLinkerSelector} from '../../../src/file_linker/partial_linkers/partial_linker_selector';

describe('PartialLinkerSelector', () => {
  let logger: MockLogger;
  const linkerA = {name: 'linkerA'} as any;
  const linkerA2 = {name: 'linkerA2'} as any;
  const linkerB = {name: 'linkerB'} as any;
  const linkerB2 = {name: 'linkerB2'} as any;

  beforeEach(() => {
    logger = new MockLogger();
  });

  describe('supportsDeclaration()', () => {
    it('should return true if there is at least one linker that matches the given function name',
       () => {
         const selector = createSelector('error');
         expect(selector.supportsDeclaration('declareA')).toBe(true);
         expect(selector.supportsDeclaration('invalid')).toBe(false);
       });

    it('should return false for methods on `Object`', () => {
      const selector = createSelector('error');
      expect(selector.supportsDeclaration('toString')).toBe(false);
    });
  });

  describe('getLinker()', () => {
    it('should return the linker that matches the name and version', () => {
      const selector = createSelector('error');
      expect(selector.getLinker('declareA', '11.1.2', '11.1.4')).toBe(linkerA);
      expect(selector.getLinker('declareA', '12.0.0', '12.1.0')).toBe(linkerA);
      expect(selector.getLinker('declareA', '12.0.1', '12.1.0')).toBe(linkerA2);
      expect(selector.getLinker('declareB', '11.2.5', '11.3.0')).toBe(linkerB);
      expect(selector.getLinker('declareB', '12.0.5', '12.0.5')).toBe(linkerB2);
    });

    it('should return the linker that matches the name and version, ignoring pre-releases', () => {
      const selector = createSelector('error');
      expect(selector.getLinker('declareA', '11.1.0-next.1', '11.1.0-next.1')).toBe(linkerA);
      expect(selector.getLinker('declareA', '11.1.0-next.7', '11.1.0-next.7')).toBe(linkerA);
      expect(selector.getLinker('declareA', '12.0.0-next.7', '12.0.0-next.7')).toBe(linkerA);
      expect(selector.getLinker('declareA', '12.0.1-next.7', '12.0.1-next.7')).toBe(linkerA2);
    });

    it('should return the most recent linker if `version` is `0.0.0-PLACEHOLDER`, regardless of `minVersion`',
       () => {
         const selector = createSelector('error');
         expect(selector.getLinker('declareA', '11.1.2', '0.0.0-PLACEHOLDER')).toBe(linkerA2);
         expect(selector.getLinker('declareA', '0.0.0-PLACEHOLDER', '11.1.2')).toBe(linkerA);
         expect(selector.getLinker('declareA', '0.0.0-PLACEHOLDER', '0.0.0-PLACEHOLDER'))
             .toBe(linkerA2);
       });

    it('should throw an error if there is no linker that matches the given name', () => {
      const selector = createSelector('error');
      // `$foo` is not a valid name, even though `11.1.2` is a valid version for other declarations
      expect(() => selector.getLinker('$foo', '11.1.2', '11.2.0'))
          .toThrowError('Unknown partial declaration function $foo.');
    });

    describe('[unknown declaration version]', () => {
      describe('[unknownDeclarationVersionHandling is "ignore"]', () => {
        it('should use the most recent linker, with no log warning', () => {
          const selector = createSelector('ignore');
          expect(selector.getLinker('declareA', '13.1.0', '13.1.5')).toBe(linkerA2);
          expect(logger.logs.warn).toEqual([]);
        });
      });

      describe('[unknownDeclarationVersionHandling is "warn"]', () => {
        it('should use the most recent linker and log a warning', () => {
          const selector = createSelector('warn');
          expect(selector.getLinker('declareA', '13.1.0', '14.0.5')).toBe(linkerA2);
          expect(logger.logs.warn).toEqual([
            [`This application depends upon a library published using Angular version 14.0.5, ` +
             `which requires Angular version 13.1.0 or newer to work correctly.\n` +
             `Consider upgrading your application to use a more recent version of Angular.\n` +
             'Attempting to continue using this version of Angular.']
          ]);
        });
      });

      describe('[unknownDeclarationVersionHandling is "error"]', () => {
        it('should throw an error', () => {
          const selector = createSelector('error');
          expect(() => selector.getLinker('declareA', '13.1.0', '14.0.5'))
              .toThrowError(
                  `This application depends upon a library published using Angular version 14.0.5, ` +
                  `which requires Angular version 13.1.0 or newer to work correctly.\n` +
                  `Consider upgrading your application to use a more recent version of Angular.`);
        });
      });
    });
  });

  /**
   * Create a selector for testing
   */
  function createSelector(unknownDeclarationVersionHandling: 'error'|'warn'|'ignore') {
    const linkerMap = new Map<string, LinkerRange<unknown>[]>();
    linkerMap.set('declareA', [
      {range: new semver.Range('<=12.0.0'), linker: linkerA},
      {range: new semver.Range('<=13.0.0'), linker: linkerA2}
    ]);
    linkerMap.set('declareB', [
      {range: new semver.Range('<=12.0.0'), linker: linkerB},
      {range: new semver.Range('<=12.1.0'), linker: linkerB2},
    ]);
    return new PartialLinkerSelector(linkerMap, logger, unknownDeclarationVersionHandling);
  }
});
