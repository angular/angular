/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConstructorChecksUpgradeData, TargetVersion, VersionChanges} from '@angular/cdk/schematics';

/**
 * List of class names for which the constructor signature has been changed. The new constructor
 * signature types don't need to be stored here because the signature will be determined
 * automatically through type checking.
 */
export const constructorChecks: VersionChanges<ConstructorChecksUpgradeData> = {
  [TargetVersion.V10]: [
    {
      pr: 'https://github.com/angular/components/pull/19307',
      changes: ['MatSlideToggle']
    },
    {
      pr: 'https://github.com/angular/components/pull/19379',
      changes: ['MatSlider']
    },
    {
      pr: 'https://github.com/angular/components/pull/19372',
      changes: ['MatSortHeader']
    },
    {
      pr: 'https://github.com/angular/components/pull/19324',
      changes: ['MatAutocompleteTrigger']
    },
    {
      pr: 'https://github.com/angular/components/pull/19363',
      changes: ['MatTooltip']
    },
    {
      pr: 'https://github.com/angular/components/pull/19323',
      changes: ['MatIcon', 'MatIconRegistry']
    }
  ],
  [TargetVersion.V9]: [
    {
      pr: 'https://github.com/angular/components/pull/17230',
      changes: ['MatSelect']
    },
    {
      pr: 'https://github.com/angular/components/pull/17333',
      changes: ['MatDialogRef']
    }
  ],
  [TargetVersion.V8]: [
    {
      pr: 'https://github.com/angular/components/pull/15647',
      changes: ['MatFormField', 'MatTabLink', 'MatVerticalStepper']
    },
    {pr: 'https://github.com/angular/components/pull/15757', changes: ['MatBadge']},
    {pr: 'https://github.com/angular/components/issues/15734', changes: ['MatButton', 'MatAnchor']},
    {
      pr: 'https://github.com/angular/components/pull/15761',
      changes: ['MatSpinner', 'MatProgressSpinner']
    },
    {pr: 'https://github.com/angular/components/pull/15723', changes: ['MatList', 'MatListItem']},
    {pr: 'https://github.com/angular/components/pull/15722', changes: ['MatExpansionPanel']}, {
      pr: 'https://github.com/angular/components/pull/15737',
      changes: ['MatTabHeader', 'MatTabBody']
    },
    {pr: 'https://github.com/angular/components/pull/15806', changes: ['MatSlideToggle']},
    {pr: 'https://github.com/angular/components/pull/15773', changes: ['MatDrawerContainer']}
  ],

  [TargetVersion.V7]: [
    {
      pr: 'https://github.com/angular/components/pull/11706',
      changes: ['MatDrawerContent'],
    },
    {pr: 'https://github.com/angular/components/pull/11706', changes: ['MatSidenavContent']}
  ],

  [TargetVersion.V6]: [
    {
      pr: 'https://github.com/angular/components/pull/9190',
      changes: ['NativeDateAdapter'],
    },
    {
      pr: 'https://github.com/angular/components/pull/10319',
      changes: ['MatAutocomplete'],
    },
    {
      pr: 'https://github.com/angular/components/pull/10344',
      changes: ['MatTooltip'],
    },
    {
      pr: 'https://github.com/angular/components/pull/10389',
      changes: ['MatIconRegistry'],
    },
    {
      pr: 'https://github.com/angular/components/pull/9775',
      changes: ['MatCalendar'],
    },
  ]
};
