/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {parseNgCompilerOptions} from '../language_service';

import {setup} from './mock_host';

const {project} = setup();

describe('parseNgCompilerOptions', () => {
  it('should read angularCompilerOptions in tsconfig.json', () => {
    const options = parseNgCompilerOptions(project);
    expect(options).toEqual(jasmine.objectContaining({
      enableIvy: true,  // default for ivy is true
      fullTemplateTypeCheck: true,
      strictInjectionParameters: true,
    }));
  });
});
