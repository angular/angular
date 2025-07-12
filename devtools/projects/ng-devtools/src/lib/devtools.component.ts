/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {animate, style, transition, trigger} from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import {Events, MessageBus, SupportedApis} from '../../../protocol';
import {interval} from 'rxjs';

import {FrameManager} from './application-services/frame_manager';
import {ThemeService} from './application-services/theme_service';
import {MatTooltip, MatTooltipModule} from '@angular/material/tooltip';
import {DevToolsTabsComponent} from './devtools-tabs/devtools-tabs.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {Frame} from './application-environment';
import {BrowserStylesService} from './application-services/browser_styles_service';
import {WINDOW_PROVIDER} from './application-providers/window_provider';
import {MatIconRegistry} from '@angular/material/icon';

const DETECT_ANGULAR_ATTEMPTS = 10;

enum AngularStatus {
  /**
   * This page may have Angular but we don't know yet. We're still trying to detect it.
   */
  UNKNOWN,

  /**
   * We've given up on trying to detect Angular. We tried ${DETECT_ANGULAR_ATTEMPTS} times and
   * failed.
   */
  DOES_NOT_EXIST,

  /**
   * Angular was detected somewhere on the page.
   */
  EXISTS,
}

const LAST_SUPPORTED_VERSION = 9;

@Component({
  selector: 'ng-devtools',
  templateUrl: './devtools.component.html',
  styleUrls: ['./devtools.component.scss'],
  animations: [
    trigger('enterAnimation', [
      transition(':enter', [style({opacity: 0}), animate('200ms', style({opacity: 1}))]),
      transition(':leave', [style({opacity: 1}), animate('200ms', style({opacity: 0}))]),
    ]),
  ],
  imports: [DevToolsTabsComponent, MatTooltip, MatProgressSpinnerModule, MatTooltipModule],
  providers: [WINDOW_PROVIDER, ThemeService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevToolsComponent implements OnDestroy {
  readonly AngularStatus = AngularStatus;
  readonly angularStatus = signal(AngularStatus.UNKNOWN);
  readonly angularVersion = signal<string | undefined>(undefined);
  readonly angularIsInDevMode = signal(true);
  readonly hydration = signal(false);
  readonly supportedApis = signal<SupportedApis>({
    profiler: false,
    dependencyInjection: false,
    routes: false,
    signals: false,
  });
  readonly ivy = signal<boolean | undefined>(undefined);

  readonly supportedVersion = computed(() => {
    const version = this.angularVersion();
    if (!version) {
      return false;
    }
    const majorVersion = parseInt(version.toString().split('.')[0], 10);

    // Check that major version is either greater or equal to the last supported version
    // or that the major version is 0 for the (0.0.0-PLACEHOLDER) dev build case.
    return (majorVersion >= LAST_SUPPORTED_VERSION || majorVersion === 0) && this.ivy();
  });

  private readonly _messageBus = inject<MessageBus<Events>>(MessageBus);
  private readonly _frameManager = inject(FrameManager);

  private _interval$ = interval(500).subscribe((attempt) => {
    if (attempt === DETECT_ANGULAR_ATTEMPTS) {
      this.angularStatus.set(AngularStatus.DOES_NOT_EXIST);
    }
    this._messageBus.emit('queryNgAvailability');
  });

  constructor() {
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
      this.supportedApis.set(supportedApis);
    });
  }

  inspectFrame(frame: Frame) {
    this._frameManager.inspectFrame(frame);
  }

  ngOnDestroy(): void {
    this._interval$.unsubscribe();
  }
}
