/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OutputNameUpgradeData, TargetVersion, VersionChanges} from '@angular/cdk/schematics';

export const outputNames: VersionChanges<OutputNameUpgradeData> = {
  [TargetVersion.V6]: [
    {
      pr: 'https://github.com/angular/components/pull/10163',
      changes: [
        {
          replace: 'change',
          replaceWith: 'selectionChange',
          limitedTo: {
            elements: ['mat-select'],
          },
        },
        {
          replace: 'onClose',
          replaceWith: 'closed',
          limitedTo: {
            elements: ['mat-select'],
          },
        },
        {
          replace: 'onOpen',
          replaceWith: 'opened',
          limitedTo: {
            elements: ['mat-select'],
          },
        },
      ],
    },

    {
      pr: 'https://github.com/angular/components/pull/10279',
      changes: [
        {
          replace: 'align-changed',
          replaceWith: 'positionChanged',
          limitedTo: {
            elements: ['mat-drawer', 'mat-sidenav'],
          },
        },
        {
          replace: 'close',
          replaceWith: 'closed',
          limitedTo: {
            elements: ['mat-drawer', 'mat-sidenav'],
          },
        },
        {
          replace: 'open',
          replaceWith: 'opened',
          limitedTo: {
            elements: ['mat-drawer', 'mat-sidenav'],
          },
        },
      ],
    },

    {
      pr: 'https://github.com/angular/components/pull/10309',
      changes: [
        {
          replace: 'selectChange',
          replaceWith: 'selectedTabChange',
          limitedTo: {
            elements: ['mat-tab-group'],
          },
        },
      ],
    },

    {
      pr: 'https://github.com/angular/components/pull/10311',
      changes: [
        {
          replace: 'remove',
          replaceWith: 'removed',
          limitedTo: {
            attributes: ['mat-chip', 'mat-basic-chip'],
            elements: ['mat-chip', 'mat-basic-chip'],
          },
        },
        {
          replace: 'destroy',
          replaceWith: 'destroyed',
          limitedTo: {
            attributes: ['mat-chip', 'mat-basic-chip'],
            elements: ['mat-chip', 'mat-basic-chip'],
          },
        },
      ],
    },
  ],
};
