/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LanguageService} from '../../language_service';
import {getExternalFiles} from '../../ts_plugin';

import {APP_COMPONENT, setup} from './mock_host';

describe('getExternalFiles()', () => {
  it('should return all typecheck files', () => {
    const {project, tsLS} = setup();
    let externalFiles = getExternalFiles(project);
    // Initially there are no external files because Ivy compiler hasn't done
    // a global analysis
    expect(externalFiles).toEqual([]);
    // Trigger global analysis
    const ngLS = new LanguageService(project, tsLS, {});
    ngLS.getSemanticDiagnostics(APP_COMPONENT);
    // Now that global analysis is run, we should have all the typecheck files
    externalFiles = getExternalFiles(project);
    expect(externalFiles.length).toBe(1);
    expect(externalFiles[0].endsWith('app.component.ngtypecheck.ts')).toBeTrue();
  });
});
