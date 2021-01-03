/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MetadataBundler} from '../../src/metadata/bundler';
import {MetadataCollector} from '../../src/metadata/collector';
import {privateEntriesToIndex} from '../../src/metadata/index_writer';

import {MockStringBundlerHost, SIMPLE_LIBRARY} from './bundler_spec';

describe('index_writer', () => {
  it('should be able to write the index of a simple library', () => {
    const host = new MockStringBundlerHost('/', SIMPLE_LIBRARY);
    const bundler = new MetadataBundler('/lib/index', undefined, host);
    const bundle = bundler.getMetadataBundle();
    const result = privateEntriesToIndex('./index', bundle.privates);
    expect(result).toContain(`export * from './index';`);
    expect(result).toContain(`export {PrivateOne as ɵa} from './src/one';`);
    expect(result).toContain(`export {PrivateTwo as ɵb} from './src/two/index';`);
  });
});
