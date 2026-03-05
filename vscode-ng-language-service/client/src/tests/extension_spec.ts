/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type * as vscode from 'vscode';

import {shouldRestartOnConfigurationChange} from '../config_change';

describe('extension config restart policy', () => {
  it('does not restart for inlay-only angular settings', () => {
    expect(
      shouldRestartOnConfigurationChange(
        createConfigChangeEvent(['angular', 'angular.inlayHints']),
      ),
    ).toBeFalse();
  });

  it('does not restart for editor inlay hints only', () => {
    expect(
      shouldRestartOnConfigurationChange(createConfigChangeEvent(['editor.inlayHints'])),
    ).toBeFalse();
  });

  it('restarts for non-inlay angular settings', () => {
    expect(shouldRestartOnConfigurationChange(createConfigChangeEvent(['angular.log']))).toBeTrue();
  });

  it('restarts for mixed inlay and non-inlay angular settings', () => {
    expect(
      shouldRestartOnConfigurationChange(
        createConfigChangeEvent(['angular', 'angular.inlayHints', 'angular.suggest']),
      ),
    ).toBeTrue();
  });

  it('restarts for typescript.tsdk changes', () => {
    expect(
      shouldRestartOnConfigurationChange(createConfigChangeEvent(['typescript.tsdk'])),
    ).toBeTrue();
  });

  it('does not restart for unrelated settings', () => {
    expect(
      shouldRestartOnConfigurationChange(createConfigChangeEvent(['editor.fontSize'])),
    ).toBeFalse();
  });
});

function createConfigChangeEvent(affected: string[]): vscode.ConfigurationChangeEvent {
  return {
    affectsConfiguration: (section: string): boolean => {
      return affected.some((entry) => entry === section || entry.startsWith(`${section}.`));
    },
  } as vscode.ConfigurationChangeEvent;
}
