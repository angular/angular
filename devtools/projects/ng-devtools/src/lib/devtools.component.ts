/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {animate, style, transition, trigger} from '@angular/animations';
import {Platform} from '@angular/cdk/platform';
import {DOCUMENT} from '@angular/common';
import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import {Events, MessageBus} from 'protocol';
import {interval} from 'rxjs';

import {FrameManager} from './frame_manager';
import {ThemeService} from './theme-service';
import {MatTooltip, MatTooltipModule} from '@angular/material/tooltip';
import {DevToolsTabsComponent} from './devtools-tabs/devtools-tabs.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {Frame} from './application-environment';

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
})
export class DevToolsComponent implements OnInit, OnDestroy {
  AngularStatus = AngularStatus;
  angularStatus: AngularStatus = AngularStatus.UNKNOWN;
  angularVersion: WritableSignal<string | undefined> = signal(undefined);
  angularIsInDevMode = true;
  hydration: boolean = false;
  ivy: WritableSignal<boolean | undefined> = signal(undefined);

  supportedVersion = computed(() => {
    const version = this.angularVersion();
    if (!version) {
      return false;
    }
    const majorVersion = parseInt(version.toString().split('.')[0], 10);

    // Check that major version is either greater or equal to the last supported version
    // or that the major version is 0 for the (0.0.0-PLACEHOLDER) dev build case.
    return (majorVersion >= LAST_SUPPORTED_VERSION || majorVersion === 0) && this.ivy();
  });

  private readonly _firefoxStyleName = 'firefox_styles.css';
  private readonly _chromeStyleName = 'chrome_styles.css';
  private readonly _messageBus = inject<MessageBus<Events>>(MessageBus);
  private readonly _themeService = inject(ThemeService);
  private readonly _platform = inject(Platform);
  private readonly _document = inject(DOCUMENT);
  private readonly _frameManager = inject(FrameManager);

  private _interval$ = interval(500).subscribe((attempt) => {
    if (attempt === DETECT_ANGULAR_ATTEMPTS) {
      this.angularStatus = AngularStatus.DOES_NOT_EXIST;
    }
    this._messageBus.emit('queryNgAvailability');
  });

  inspectFrame(frame: Frame) {
    this._frameManager.inspectFrame(frame);
  }

  ngOnInit(): void {
    this._themeService.initializeThemeWatcher();

    this._messageBus.once('ngAvailability', ({version, devMode, ivy, hydration}) => {
      this.angularStatus = version ? AngularStatus.EXISTS : AngularStatus.DOES_NOT_EXIST;
      this.angularVersion.set(version);
      this.angularIsInDevMode = devMode;
      this.ivy.set(ivy);
      this._interval$.unsubscribe();
      this.hydration = hydration;
    });

    const browserStyleName = this._platform.FIREFOX
      ? this._firefoxStyleName
      : this._chromeStyleName;
    this._loadStyle(browserStyleName);
  }

  /** Add a style file in header based on fileName */
  private _loadStyle(styleName: string) {
    const head = this._document.getElementsByTagName('head')[0];

    const style = this._document.createElement('link');
    style.rel = 'stylesheet';
    style.href = `./styles/${styleName}`;

    head.appendChild(style);
  }

  ngOnDestroy(): void {
    this._interval$.unsubscribe();
  }
}
