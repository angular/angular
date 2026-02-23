/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export interface ConfigurationChangeLike {
  affectsConfiguration(section: string): boolean;
}

export function shouldRestartOnConfigurationChange(e: ConfigurationChangeLike): boolean {
  if (e.affectsConfiguration('typescript.tsdk')) {
    return true;
  }

  if (!e.affectsConfiguration('angular')) {
    return false;
  }

  const affectsInlayHints =
    e.affectsConfiguration('angular.inlayHints') || e.affectsConfiguration('editor.inlayHints');

  if (!affectsInlayHints) {
    return true;
  }

  const affectsNonInlayAngularSettings =
    e.affectsConfiguration('angular.log') ||
    e.affectsConfiguration('angular.trace.server') ||
    e.affectsConfiguration('angular.enable-strict-mode-prompt') ||
    e.affectsConfiguration('angular.suggest') ||
    e.affectsConfiguration('angular.forceStrictTemplates') ||
    e.affectsConfiguration('angular.suppressAngularDiagnosticCodes') ||
    e.affectsConfiguration('angular.server');

  return affectsNonInlayAngularSettings;
}
