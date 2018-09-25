/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PropertyNameUpgradeData, TargetVersion, VersionChanges} from '@angular/cdk/schematics';

export const propertyNames: VersionChanges<PropertyNameUpgradeData> = {
  [TargetVersion.V6]: [
    {
      pr: 'https://github.com/angular/material2/pull/10163',
      changes: [
        {
          replace: 'change',
          replaceWith: 'selectionChange',
          whitelist: {
            classes: ['MatSelect']
          }
        },
        {
          replace: 'onOpen',
          replaceWith: 'openedChange.pipe(filter(isOpen => isOpen))',
          whitelist: {
            classes: ['MatSelect']
          }
        },
        {
          replace: 'onClose',
          replaceWith: 'openedChange.pipe(filter(isOpen => !isOpen))',
          whitelist: {
            classes: ['MatSelect']
          }
        }
      ]
    },

    {
      pr: 'https://github.com/angular/material2/pull/10218',
      changes: [
        {
          replace: 'align',
          replaceWith: 'labelPosition',
          whitelist: {
            classes: ['MatRadioGroup', 'MatRadioButton']
          }
        }
      ]
    },

    {
      pr: 'https://github.com/angular/material2/pull/10253',
      changes: [
        {
          replace: 'extraClasses',
          replaceWith: 'panelClass',
          whitelist: {
            classes: ['MatSnackBarConfig']
          }
        }
      ]
    },

    {
      pr: 'https://github.com/angular/material2/pull/10279',
      changes: [
        {
          replace: 'align',
          replaceWith: 'position',
          whitelist: {
            classes: ['MatDrawer', 'MatSidenav']
          }
        },
        {
          replace: 'onAlignChanged',
          replaceWith: 'onPositionChanged',
          whitelist: {
            classes: ['MatDrawer', 'MatSidenav']
          }
        },
        {
          replace: 'onOpen',
          replaceWith: 'openedChange.pipe(filter(isOpen => isOpen))',
          whitelist: {
            classes: ['MatDrawer', 'MatSidenav']
          }
        },
        {
          replace: 'onClose',
          replaceWith: 'openedChange.pipe(filter(isOpen => !isOpen))',
          whitelist: {
            classes: ['MatDrawer', 'MatSidenav']
          }
        }
      ]
    },

    {
      pr: 'https://github.com/angular/material2/pull/10293',
      changes: [
        {
          replace: 'shouldPlaceholderFloat',
          replaceWith: 'shouldLabelFloat',
          whitelist: {
            classes: ['MatFormFieldControl', 'MatSelect']
          }
        }
      ]
    },

    {
      pr: 'https://github.com/angular/material2/pull/10294',
      changes: [
        {
          replace: 'dividerColor',
          replaceWith: 'color',
          whitelist: {
            classes: ['MatFormField']
          }
        },
        {
          replace: 'floatPlaceholder',
          replaceWith: 'floatLabel',
          whitelist: {
            classes: ['MatFormField']
          }
        }
      ]
    },

    {
      pr: 'https://github.com/angular/material2/pull/10309',
      changes: [
        {
          replace: 'selectChange',
          replaceWith: 'selectedTabChange',
          whitelist: {
            classes: ['MatTabGroup']
          }
        },
        {
          replace: '_dynamicHeightDeprecated',
          replaceWith: 'dynamicHeight',
          whitelist: {
            classes: ['MatTabGroup']
          }
        }
      ]
    },

    {
      pr: 'https://github.com/angular/material2/pull/10311',
      changes: [
        {
          replace: 'destroy',
          replaceWith: 'destroyed',
          whitelist: {
            classes: ['MatChip']
          }
        },
        {
          replace: 'onRemove',
          replaceWith: 'removed',
          whitelist: {
            classes: ['MatChip']
          }
        }
      ]
    },

    {
      pr: 'https://github.com/angular/material2/pull/10342',
      changes: [
        {
          replace: 'align',
          replaceWith: 'labelPosition',
          whitelist: {
            classes: ['MatCheckbox']
          }
        }
      ]
    },

    {
      pr: 'https://github.com/angular/material2/pull/10344',
      changes: [
        {
          replace: '_positionDeprecated',
          replaceWith: 'position',
          whitelist: {
            classes: ['MatTooltip']
          }
        }
      ]
    },

    {
      pr: 'https://github.com/angular/material2/pull/10373',
      changes: [
        {
          replace: '_thumbLabelDeprecated',
          replaceWith: 'thumbLabel',
          whitelist: {
            classes: ['MatSlider']
          }
        },
        {
          replace: '_tickIntervalDeprecated',
          replaceWith: 'tickInterval',
          whitelist: {
            classes: ['MatSlider']
          }
        }
      ]
    },
  ]
};
