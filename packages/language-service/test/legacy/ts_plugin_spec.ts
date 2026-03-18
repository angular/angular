/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {LanguageService} from '../../src/language_service';
import {initialize} from '../../src/ts_plugin';

import {APP_COMPONENT, setup} from './mock_host';

describe('getExternalFiles()', () => {
  it('should return all typecheck files', () => {
    const {project, tsLS} = setup();
    const plugin = initialize({typescript: ts});

    let externalFiles = plugin.getExternalFiles?.(project, ts.ProgramUpdateLevel.Full);
    // Initially there are no external files because Ivy compiler hasn't done
    // a global analysis
    expect(externalFiles).toEqual([]);
    // Trigger global analysis
    const ngLS = new LanguageService(project, tsLS, {});
    ngLS.getSemanticDiagnostics(APP_COMPONENT);
    // Now that global analysis is run, we should have all the typecheck files
    externalFiles = plugin.getExternalFiles?.(project, ts.ProgramUpdateLevel.Full);
    // Includes 1 typecheck file, 1 template, and 1 css files
    expect(externalFiles?.length).toBe(3);
    expect(externalFiles?.[0].endsWith('app.component.ngtypecheck.ts')).toBeTrue();
  });

  it('should return all typecheck files when using ensureProjectAnalyzed', () => {
    const {project, tsLS} = setup();
    const plugin = initialize({typescript: ts});

    let externalFiles = plugin.getExternalFiles?.(project, ts.ProgramUpdateLevel.Full);
    expect(externalFiles).toEqual([]);
    // Trigger compilation using the lighter ensureProjectAnalyzed() method
    // instead of getSemanticDiagnostics(). This initializes the Angular compiler
    // (analysis + resolution) without per-file type-checking overhead.
    const ngLS = new LanguageService(project, tsLS, {});
    ngLS.ensureProjectAnalyzed();
    // After ensureProjectAnalyzed(), the Angular compiler state is initialized.
    // Typecheck files are created lazily during diagnostics, so they don't exist yet.
    // But subsequent getSemanticDiagnostics() calls should work correctly since
    // the compiler is already analyzed.
    ngLS.getSemanticDiagnostics(APP_COMPONENT);
    externalFiles = plugin.getExternalFiles?.(project, ts.ProgramUpdateLevel.Full);
    // Includes 1 typecheck file, 1 template, and 1 css files
    expect(externalFiles?.length).toBe(3);
    expect(externalFiles?.[0].endsWith('app.component.ngtypecheck.ts')).toBeTrue();
  });
});
