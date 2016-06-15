require('reflect-metadata');
require('@angular/platform-server/src/parse5_adapter.js').Parse5DomAdapter.makeCurrent();
require('zone.js/dist/zone-node.js');
require('zone.js/dist/long-stack-trace-zone.js');
var fs = require('fs');

import {GeneratedComponentResolver} from '../tmp/generated_component_resolver';

import {AnimateCmp} from '../src/animate';
import {AnimateCmpNgFactory} from '../src/animate.ngfactory';
import {Basic} from '../src/basic';
import {BasicNgFactory} from '../src/basic.ngfactory';
import {CompWithProviders, CompWithReferences} from '../src/features';
import {CompWithProvidersNgFactory, CompWithReferencesNgFactory} from '../src/features.ngfactory';

function _findWithinMap(map: {[key: string]: string | string[]}, item: string): any {
  for (var key in map) {
    let value = map[key];
    if (value == item) {
      return value;
    }
    if (Array.isArray(value)) {
      var detectedValue = value.find(val => val == item);
      if (detectedValue) {
        return value;
      }
    }
  }
  return null;
}

describe('GeneratedComponentResolver', () => {
  var tsconfigContents = JSON.parse(fs.readFileSync('./tsconfig.json', 'utf8'));

  var resolver: GeneratedComponentResolver;
  beforeEach(() => { resolver = new GeneratedComponentResolver(); });

  describe('tsconfig.json', () => {
    var importItems: any;
    beforeEach(() => {
      importItems = tsconfigContents['angularCompilerOptions']['componentResolver']['imports'];
    });

    it('should include AnimateCmp as an angularCompilerOptions import dependency', () => {
      var result = _findWithinMap(importItems, 'AnimateCmp');
      expect(result).toEqual('AnimateCmp');
    });

    it('should include CompWithProviders and CompWithReferences as angularCompilerOptions import dependencies',
       () => {
         var result = _findWithinMap(importItems, 'CompWithProviders');
         expect(result).toEqual(['CompWithProviders', 'CompWithReferences']);

         result = _findWithinMap(importItems, 'CompWithReferences');
         expect(result).toEqual(['CompWithProviders', 'CompWithReferences']);
       });

    it('should include Basic as an angularCompilerOptions import dependency', () => {
      var result = _findWithinMap(importItems, 'Basic');
      expect(result).toEqual(null);
    });
  });

  it('should resolve the AnimateCmp component', (done) => {
    resolver.resolveComponent(AnimateCmp).then(result => {
      expect(result).toBe(AnimateCmpNgFactory);
      done();
    });
  });

  it('should resolve the CompWithProviders component', (done) => {
    resolver.resolveComponent(CompWithProviders).then(result => {
      expect(result).toBe(CompWithProvidersNgFactory);
      done();
    });
  });

  it('should resolve the CompWithReferences component', (done) => {
    resolver.resolveComponent(CompWithReferences).then(result => {
      expect(result).toBe(CompWithReferencesNgFactory);
      done();
    });
  });

  it('should throw an error when a component is resolved that was not included within tsconfig',
     (done) => {
       resolver.resolveComponent(Basic).catch(e => {
         expect(e).toEqual('No precompiled component Basic found');
         done();
       });
     });

  it('should throw an error when a string valued input is resolved', (done) => {
    resolver.resolveComponent('AnimateCmp').catch(e => {
      expect(e).toEqual('No precompiled component AnimateCmp found');
      done();
    });
  });
});
