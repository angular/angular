/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {MessageBus} from '../../../protocol';
import {interval} from 'rxjs';
import {FrameManager} from './application-services/frame_manager';
import {ThemeService} from './application-services/theme_service';
import {MatTooltip, MatTooltipModule} from '@angular/material/tooltip';
import {DevToolsTabsComponent} from './devtools-tabs/devtools-tabs.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {BrowserStylesService} from './application-services/browser_styles_service';
import {MatIconRegistry} from '@angular/material/icon';
import {SUPPORTED_APIS} from './application-providers/supported_apis';
const DETECT_ANGULAR_ATTEMPTS = 20;
var AngularStatus;
(function (AngularStatus) {
  /**
   * This page may have Angular but we don't know yet. We're still trying to detect it.
   */
  AngularStatus[(AngularStatus['UNKNOWN'] = 0)] = 'UNKNOWN';
  /**
   * We've given up on trying to detect Angular. We tried ${DETECT_ANGULAR_ATTEMPTS} times and
   * failed.
   */
  AngularStatus[(AngularStatus['DOES_NOT_EXIST'] = 1)] = 'DOES_NOT_EXIST';
  /**
   * Angular was detected somewhere on the page.
   */
  AngularStatus[(AngularStatus['EXISTS'] = 2)] = 'EXISTS';
})(AngularStatus || (AngularStatus = {}));
const LAST_SUPPORTED_VERSION = 9;
let DevToolsComponent = class DevToolsComponent {
  constructor() {
    this.supportedApis = inject(SUPPORTED_APIS);
    this.AngularStatus = AngularStatus;
    this.angularStatus = signal(AngularStatus.UNKNOWN);
    this.angularVersion = signal(undefined);
    this.angularIsInDevMode = signal(true);
    this.hydration = signal(false);
    this.ivy = signal(undefined);
    this.supportedVersion = computed(() => {
      const version = this.angularVersion();
      if (!version) {
        return false;
      }
      const majorVersion = parseInt(version.toString().split('.')[0], 10);
      // Check that major version is either greater or equal to the last supported version
      // or that the major version is 0 for the (0.0.0-PLACEHOLDER) dev build case.
      return (majorVersion >= LAST_SUPPORTED_VERSION || majorVersion === 0) && this.ivy();
    });
    this._messageBus = inject(MessageBus);
    this._frameManager = inject(FrameManager);
    this._interval$ = interval(500).subscribe((attempt) => {
      if (attempt === DETECT_ANGULAR_ATTEMPTS) {
        this.angularStatus.set(AngularStatus.DOES_NOT_EXIST);
      }
      this._messageBus.emit('queryNgAvailability');
    });
    inject(ThemeService).initializeThemeWatcher();
    inject(BrowserStylesService).initBrowserSpecificStyles();
    inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined');
    this._messageBus.once('ngAvailability', ({version, devMode, ivy, hydration, supportedApis}) => {
      this.angularStatus.set(version ? AngularStatus.EXISTS : AngularStatus.DOES_NOT_EXIST);
      this.angularVersion.set(version);
      this.angularIsInDevMode.set(devMode);
      this.ivy.set(ivy);
      this._interval$.unsubscribe();
      this.hydration.set(hydration);
      this.supportedApis.init(supportedApis);
    });
  }
  inspectFrame(frame) {
    this._frameManager.inspectFrame(frame);
  }
  ngOnDestroy() {
    this._interval$.unsubscribe();
  }
};
DevToolsComponent = __decorate(
  [
    Component({
      selector: 'ng-devtools',
      templateUrl: './devtools.component.html',
      styleUrls: ['./devtools.component.scss'],
      imports: [DevToolsTabsComponent, MatTooltip, MatProgressSpinnerModule, MatTooltipModule],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  DevToolsComponent,
);
export {DevToolsComponent};
//# sourceMappingURL=devtools.component.js.map
