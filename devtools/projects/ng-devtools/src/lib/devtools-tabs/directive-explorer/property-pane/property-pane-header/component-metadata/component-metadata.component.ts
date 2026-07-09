/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  ɵFramework as Framework,
  computed,
  inject,
  input,
  ɵAcxChangeDetectionStrategy as AcxChangeDetectionStrategy,
  ɵAcxViewEncapsulation as AcxViewEncapsulation,
  ChangeDetectionStrategy as AngularChangeDetectionStrategy,
  ViewEncapsulation as AngularViewEncapsulation,
} from '@angular/core';

import {
  AcxDirectiveMetadata,
  AngularDirectiveMetadata,
  ComponentType,
} from '../../../../../../../../protocol';

import {DocsRefButtonComponent} from '../../../../../shared/docs-ref-button/docs-ref-button.component';
import {ElementPropertyResolver} from '../../../property-resolver/element-property-resolver';
import {APP_DATA} from '../../../../../application-providers/app_data';

// Legacy `Native` (gone since v11) is no longer required since the minimal supported version is v12.
const ANGULAR_VIEW_ENCAPSULATION: {[key in AngularViewEncapsulation]: string} = {
  [AngularViewEncapsulation.Emulated]: 'Emulated',
  [AngularViewEncapsulation.None]: 'None',
  [AngularViewEncapsulation.ShadowDom]: 'ShadowDom',
  [AngularViewEncapsulation.ExperimentalIsolatedShadowDom]: 'ExperimentalIsolatedShadowDom',
};

const ACX_VIEW_ENCAPSULATION: {[key in AcxViewEncapsulation]: string} = {
  [AcxViewEncapsulation.Emulated]: 'Emulated',
  [AcxViewEncapsulation.None]: 'None',
};

// Legacy support (i.e. pre-v21.2)
const ANGULAR_PRE_V21_2_CHANGE_DETECTION: {[key in AngularChangeDetectionStrategy]: string} = {
  [AngularChangeDetectionStrategy.Default]: 'Default', // Deprecated as of v21.2+
  [AngularChangeDetectionStrategy.OnPush]: 'OnPush',
};

const ANGULAR_CHANGE_DETECTION: {[key in AngularChangeDetectionStrategy]: string} = {
  [AngularChangeDetectionStrategy.OnPush]: 'OnPush',
  [AngularChangeDetectionStrategy.Eager]: 'Eager',
};

const ACX_CHANGE_DETECTION: {[key in AcxChangeDetectionStrategy]: string} = {
  [AcxChangeDetectionStrategy.Default]: 'Default',
  [AcxChangeDetectionStrategy.OnPush]: 'OnPush',
};

@Component({
  selector: 'ng-component-metadata',
  templateUrl: './component-metadata.component.html',
  styleUrls: ['./component-metadata.component.scss'],
  imports: [DocsRefButtonComponent],
})
export class ComponentMetadataComponent {
  private readonly nestedProps = inject(ElementPropertyResolver);
  private readonly appData = inject(APP_DATA);

  protected readonly currentSelectedComponent = input.required<ComponentType>();

  protected readonly controller = computed(() => {
    const comp = this.currentSelectedComponent();
    if (!comp) {
      return;
    }
    return this.nestedProps.getDirectiveController(comp.name);
  });

  protected readonly viewEncapsulation = computed(() => {
    const metadata = this.controller()?.directiveMetadata;
    if (!metadata) return undefined;

    const encapsulation = (metadata as AngularDirectiveMetadata | AcxDirectiveMetadata)
      .encapsulation;

    switch (metadata.framework) {
      case Framework.Angular:
        return ANGULAR_VIEW_ENCAPSULATION[encapsulation as AngularViewEncapsulation];
      case Framework.ACX:
        return ACX_VIEW_ENCAPSULATION[encapsulation as AcxViewEncapsulation];
      default:
        return undefined;
    }
  });

  protected readonly changeDetectionStrategy = computed(() => {
    const metadata = this.controller()?.directiveMetadata;
    if (!metadata) return undefined;

    const meta = metadata as Partial<AcxDirectiveMetadata | AngularDirectiveMetadata>;
    const changeDetection = meta.changeDetection;

    switch (metadata.framework) {
      case Framework.Angular:
        const {majorVersion, minorVersion} = this.appData();

        // Show legacy `Default` for pre-v21.2
        const isPre21_2 =
          (0 < majorVersion && majorVersion < 21) || (majorVersion === 21 && minorVersion < 2);
        const ngCdMap = isPre21_2 ? ANGULAR_PRE_V21_2_CHANGE_DETECTION : ANGULAR_CHANGE_DETECTION;

        return ngCdMap[changeDetection as AngularChangeDetectionStrategy];
      case Framework.ACX:
        return ACX_CHANGE_DETECTION[changeDetection as AcxChangeDetectionStrategy];
      default:
        return undefined;
    }
  });
}
