/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, inject, output} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {ButtonComponent} from '../../shared/button/button.component';
import {SUPPORTED_APIS} from '../../application-providers/supported_apis';
import {Settings} from '../../application-services/settings';
import {ThemePreference} from '../../application-services/theme_types';

@Component({
  selector: 'ng-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  imports: [MatIcon, ButtonComponent],
  host: {
    '(document:click)': 'onDocClick()',
    '(click)': 'onHostClick()',
  },
})
export class SettingsComponent {
  protected readonly settings = inject(Settings);
  protected readonly supportedApis = inject(SUPPORTED_APIS);

  protected readonly close = output<void>();

  protected readonly themeOptions: {value: ThemePreference; label: string}[] = [
    {value: 'system', label: 'System'},
    {value: 'dark', label: 'Dark'},
    {value: 'light', label: 'Light'},
  ];
  private hostClicked = false;

  onThemeChange(e: Event) {
    const theme = (e.target as HTMLInputElement).value as ThemePreference;
    this.settings.theme.set(theme);
  }

  onDocClick() {
    if (this.hostClicked) {
      this.hostClicked = false;
    } else {
      this.close.emit();
    }
  }

  onHostClick() {
    this.hostClicked = true;
  }
}
