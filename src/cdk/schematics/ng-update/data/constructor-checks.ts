/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TargetVersion} from '../../update-tool/target-version';
import {VersionChanges} from '../../update-tool/version-changes';

export type ConstructorChecksUpgradeData = string;

/**
 * List of class names for which the constructor signature has been changed. The new constructor
 * signature types don't need to be stored here because the signature will be determined
 * automatically through type checking.
 */
export const constructorChecks: VersionChanges<ConstructorChecksUpgradeData> = {
  [TargetVersion.V13]: [
    {
      pr: 'https://github.com/angular/components/pull/23328',
      changes: ['CdkStepper']
    }
  ],
  [TargetVersion.V12]: [
    {
      pr: 'https://github.com/angular/components/pull/21876',
      changes: ['CdkTable', 'StickyStyler'],
    },
    {
      pr: 'https://github.com/angular/components/issues/21900',
      changes: ['CdkStepper'],
    },
  ],
  [TargetVersion.V11]: [
    {
      pr: 'https://github.com/angular/components/pull/20454',
      changes: ['ScrollDispatcher', 'ViewportRuler', 'CdkVirtualScrollViewport'],
    },
    {
      pr: 'https://github.com/angular/components/pull/20500',
      changes: ['CdkDropList'],
    },
    {
      pr: 'https://github.com/angular/components/pull/20572',
      changes: ['CdkTreeNodePadding'],
    },
    {
      pr: 'https://github.com/angular/components/pull/20511',
      changes: ['OverlayContainer', 'FullscreenOverlayContainer', 'OverlayRef', 'Overlay'],
    },
  ],
  [TargetVersion.V10]: [
    {
      pr: 'https://github.com/angular/components/pull/19347',
      changes: ['Platform'],
    },
  ],
  [TargetVersion.V9]: [
    {
      pr: 'https://github.com/angular/components/pull/17084',
      changes: ['DropListRef'],
    },
  ],
  [TargetVersion.V8]: [
    {
      pr: 'https://github.com/angular/components/pull/15647',
      changes: [
        'CdkDrag',
        'CdkDropList',
        'ConnectedPositionStrategy',
        'FlexibleConnectedPositionStrategy',
        'OverlayPositionBuilder',
        'CdkTable',
      ],
    },
  ],
  [TargetVersion.V7]: [],
  [TargetVersion.V6]: [],
};
