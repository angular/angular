/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runfiles} from '@bazel/runfiles';
import {readFileSync} from 'fs';

describe('ng_module with ivy enabled', () => {
  describe('default compilation mode', () => {
    it('should generate definitions', () => {
      const outputFile = runfiles.resolveWorkspaceRelative(
          'packages/bazel/test/ngc-wrapped/ivy_enabled/test_module_default_compilation.js');
      const fileContent = readFileSync(outputFile, 'utf8');
      expect(fileContent).toContain(`TestComponent.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent(`);
    });
  });

  describe('full compilation mode', () => {
    it('should generate definitions', () => {
      const outputFile = runfiles.resolveWorkspaceRelative(
          'packages/bazel/test/ngc-wrapped/ivy_enabled/test_module_full_compilation.js');
      const fileContent = readFileSync(outputFile, 'utf8');
      expect(fileContent).toContain(`TestComponent.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent(`);
    });
  });

  describe('partial compilation mode', () => {
    it('should generate declarations', () => {
      const outputFile = runfiles.resolveWorkspaceRelative(
          'packages/bazel/test/ngc-wrapped/ivy_enabled/test_module_partial_compilation.js');
      const fileContent = readFileSync(outputFile, 'utf8');
      expect(fileContent).toContain(`TestComponent.ɵcmp = i0.ɵɵngDeclareComponent(`);
    });
  });
});
