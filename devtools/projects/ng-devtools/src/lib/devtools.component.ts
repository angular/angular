/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {animate, style, transition, trigger} from '@angular/animations';
import {Platform} from '@angular/cdk/platform';
import {DOCUMENT} from '@angular/common';
import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {Events, MessageBus} from 'protocol';
import {interval} from 'rxjs';

import {ThemeService} from './theme-service';

@Component({
  selector: 'ng-devtools',
  templateUrl: './devtools.component.html',
  styleUrls: ['./devtools.component.scss'],
  animations: [
    trigger(
        'enterAnimation',
        [
          transition(':enter', [style({opacity: 0}), animate('200ms', style({opacity: 1}))]),
          transition(':leave', [style({opacity: 1}), animate('200ms', style({opacity: 0}))]),
        ]),
  ],
})
export class DevToolsComponent implements OnInit, OnDestroy {
  angularExists: boolean|null = null;
  angularVersion: string|boolean|undefined = undefined;
  angularIsInDevMode = true;
  ivy: boolean;

  private readonly _firefoxStyleName = 'firefox_styles.css';
  private readonly _chromeStyleName = 'chrome_styles.css';

  constructor(
      private _messageBus: MessageBus<Events>, private _themeService: ThemeService,
      private _platform: Platform, @Inject(DOCUMENT) private _document: Document) {}

  private _interval$ = interval(500).subscribe((attempt) => {
    if (attempt === 10) {
      this.angularExists = false;
    }
    this._messageBus.emit('queryNgAvailability');
  });

  ngOnInit(): void {
    this._themeService.initializeThemeWatcher();

    this._messageBus.once('ngAvailability', ({version, devMode, ivy}) => {
      this.angularExists = !!version;
      this.angularVersion = version;
      this.angularIsInDevMode = devMode;
      this.ivy = ivy;
      this._interval$.unsubscribe();
    });

    const browserStyleName =
        this._platform.FIREFOX ? this._firefoxStyleName : this._chromeStyleName;
    this._loadStyle(browserStyleName);
  }

  get majorAngularVersion(): number {
    if (!this.angularVersion) {
      return -1;
    }
    return parseInt(this.angularVersion.toString().split('.')[0], 10);
  }

  get supportedVersion(): boolean {
    return (this.majorAngularVersion >= 9 || this.majorAngularVersion === 0) && this.ivy;
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
