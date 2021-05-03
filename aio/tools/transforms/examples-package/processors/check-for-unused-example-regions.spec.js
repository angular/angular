/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const testPackage = require('../../helpers/test-package');
const Dgeni = require('dgeni');

describe('checkForUnusedExampleRegions', () => {
  var processor, exampleMap;

  beforeEach(function() {
    const dgeni = new Dgeni([testPackage('examples-package', true)]);
    const injector = dgeni.configureInjector();
    exampleMap = injector.get('exampleMap');
    processor = injector.get('checkForUnusedExampleRegions');
  });

  describe('$process()', () => {
    it('should error if there is a named example region which has not been used', () => {
      exampleMap['examples'] = {
        'some/file': {
          regions: {
            '': {id: 'some/file#'},
            'used': {id: 'some/file#used', usedInDoc: {}},
            'not-used': {id: 'some/file#not-used'},
          }
        }
      };
      expect(() => processor.$process())
          .toThrowError('There is 1 unused example region:\n - some/file#not-used');
    });

    it('should not error if there are no example folders', () => {
      expect(() => processor.$process()).not.toThrowError();
    });

    it('should not error if there are no example files', () => {
      exampleMap['examples'] = {};
      expect(() => processor.$process()).not.toThrowError();
    });

    it('should not error if there are no example regions', () => {
      exampleMap['examples'] = {
        'some/file': {
          regions: {},
        },
      };
      expect(() => processor.$process()).not.toThrowError();
    });

    it('should not error if there are no named example regions', () => {
      exampleMap['examples'] = {
        'some/file': {
          regions: {
            '': {id: 'some/file#'},
          },
        },
      };
      expect(() => processor.$process()).not.toThrowError();
    });

    it('should not error if there are no unused named example regions', () => {
      exampleMap['examples'] = {
        'some/file': {
          regions: {
            '': {id: 'some/file#'},
            'used': {id: 'some/file#used', usedInDoc: {}},
          }
        }
      };
      expect(() => processor.$process()).not.toThrowError();
    });
  });
});
