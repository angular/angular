/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PropertyNameUpgradeData, TargetVersion, VersionChanges} from '@angular/cdk/schematics';

export const propertyNames: VersionChanges<PropertyNameUpgradeData> = {
  [TargetVersion.V11]: [
    {
      pr: 'https://github.com/angular/components/pull/20449',
      changes: [
        {
          replace: 'getPopupConnectionElementRef',
          replaceWith: 'getConnectedOverlayOrigin',
          limitedTo: {classes: ['MatDatepickerInput']},
        },
      ],
    },
  ],
  [TargetVersion.V9]: [
    {
      pr: 'https://github.com/angular/components/pull/17333',
      changes: [
        {
          replace: 'afterOpen',
          replaceWith: 'afterOpened',
          limitedTo: {classes: ['MatDialogRef']},
        },
        {
          replace: 'beforeClose',
          replaceWith: 'beforeClosed',
          limitedTo: {classes: ['MatDialogRef']},
        },
        {
          replace: 'afterOpen',
          replaceWith: 'afterOpened',
          limitedTo: {classes: ['MatDialog']},
        },
      ],
    },
  ],
  [TargetVersion.V6]: [
    {
      pr: 'https://github.com/angular/components/pull/10163',
      changes: [
        {replace: 'change', replaceWith: 'selectionChange', limitedTo: {classes: ['MatSelect']}},
        {
          replace: 'onOpen',
          replaceWith: 'openedChange.pipe(filter(isOpen => isOpen))',
          limitedTo: {classes: ['MatSelect']},
        },
        {
          replace: 'onClose',
          replaceWith: 'openedChange.pipe(filter(isOpen => !isOpen))',
          limitedTo: {classes: ['MatSelect']},
        },
      ],
    },

    {
      pr: 'https://github.com/angular/components/pull/10218',
      changes: [
        {
          replace: 'align',
          replaceWith: 'labelPosition',
          limitedTo: {classes: ['MatRadioGroup', 'MatRadioButton']},
        },
      ],
    },

    {
      pr: 'https://github.com/angular/components/pull/10253',
      changes: [
        {
          replace: 'extraClasses',
          replaceWith: 'panelClass',
          limitedTo: {classes: ['MatSnackBarConfig']},
        },
      ],
    },

    {
      pr: 'https://github.com/angular/components/pull/10279',
      changes: [
        {
          replace: 'align',
          replaceWith: 'position',
          limitedTo: {classes: ['MatDrawer', 'MatSidenav']},
        },
        {
          replace: 'onAlignChanged',
          replaceWith: 'onPositionChanged',
          limitedTo: {classes: ['MatDrawer', 'MatSidenav']},
        },
        {
          replace: 'onOpen',
          replaceWith: 'openedChange.pipe(filter(isOpen => isOpen))',
          limitedTo: {classes: ['MatDrawer', 'MatSidenav']},
        },
        {
          replace: 'onClose',
          replaceWith: 'openedChange.pipe(filter(isOpen => !isOpen))',
          limitedTo: {classes: ['MatDrawer', 'MatSidenav']},
        },
      ],
    },

    {
      pr: 'https://github.com/angular/components/pull/10293',
      changes: [
        {
          replace: 'shouldPlaceholderFloat',
          replaceWith: 'shouldLabelFloat',
          limitedTo: {classes: ['MatFormFieldControl', 'MatSelect']},
        },
      ],
    },

    {
      pr: 'https://github.com/angular/components/pull/10294',
      changes: [
        {replace: 'dividerColor', replaceWith: 'color', limitedTo: {classes: ['MatFormField']}},
        {
          replace: 'floatPlaceholder',
          replaceWith: 'floatLabel',
          limitedTo: {classes: ['MatFormField']},
        },
      ],
    },

    {
      pr: 'https://github.com/angular/components/pull/10309',
      changes: [
        {
          replace: 'selectChange',
          replaceWith: 'selectedTabChange',
          limitedTo: {classes: ['MatTabGroup']},
        },
        {
          replace: '_dynamicHeightDeprecated',
          replaceWith: 'dynamicHeight',
          limitedTo: {classes: ['MatTabGroup']},
        },
      ],
    },

    {
      pr: 'https://github.com/angular/components/pull/10311',
      changes: [
        {replace: 'destroy', replaceWith: 'destroyed', limitedTo: {classes: ['MatChip']}},
        {replace: 'onRemove', replaceWith: 'removed', limitedTo: {classes: ['MatChip']}},
      ],
    },

    {
      pr: 'https://github.com/angular/components/pull/10342',
      changes: [
        {replace: 'align', replaceWith: 'labelPosition', limitedTo: {classes: ['MatCheckbox']}},
      ],
    },

    {
      pr: 'https://github.com/angular/components/pull/10344',
      changes: [
        {
          replace: '_positionDeprecated',
          replaceWith: 'position',
          limitedTo: {classes: ['MatTooltip']},
        },
      ],
    },

    {
      pr: 'https://github.com/angular/components/pull/10373',
      changes: [
        {
          replace: '_thumbLabelDeprecated',
          replaceWith: 'thumbLabel',
          limitedTo: {classes: ['MatSlider']},
        },
        {
          replace: '_tickIntervalDeprecated',
          replaceWith: 'tickInterval',
          limitedTo: {classes: ['MatSlider']},
        },
      ],
    },
  ],
};
