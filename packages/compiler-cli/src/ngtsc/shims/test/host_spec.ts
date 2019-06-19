/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {GeneratedShimsHostWrapper} from '../src/host';

describe('shim host', () => {
  it('should not have optional methods when delegate does not have them', function() {
    const delegate = {} as unknown as ts.CompilerHost;
    const shimsHost = new GeneratedShimsHostWrapper(delegate, []);

    expect(shimsHost.resolveModuleNames).not.toBeDefined();
    expect(shimsHost.resolveTypeReferenceDirectives).not.toBeDefined();
    expect(shimsHost.directoryExists).not.toBeDefined();
    expect(shimsHost.getDirectories).not.toBeDefined();
  });

  it('should delegate optional methods if available', function() {
    const delegate = {
      resolveModuleNames: () => undefined,
      resolveTypeReferenceDirectives: () => undefined,
      directoryExists: () => undefined,
      getDirectories: () => undefined,
    } as unknown as ts.CompilerHost;
    const shimsHost = new GeneratedShimsHostWrapper(delegate, []);

    expect(shimsHost.resolveModuleNames).toBeDefined();
    expect(shimsHost.resolveTypeReferenceDirectives).toBeDefined();
    expect(shimsHost.directoryExists).toBeDefined();
    expect(shimsHost.getDirectories).toBeDefined();
  });
});
