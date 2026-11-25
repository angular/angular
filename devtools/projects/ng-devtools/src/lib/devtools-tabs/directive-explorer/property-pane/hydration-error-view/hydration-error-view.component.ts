/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, input, output} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatToolbar} from '@angular/material/toolbar';
import {MatTooltip} from '@angular/material/tooltip';
import {HydrationStatus} from '../../../../../../../protocol';
import {ButtonComponent} from '../../../../shared/button/button.component';

const AT_THIS_LOCATION_MARKER = '<-- AT THIS LOCATION';
const ERROR_CODE_PATTERN = /^NG\d+$/;

export type MismatchedHydrationStatus = Extract<HydrationStatus, {status: 'mismatched'}>;

interface SnippetLine {
  text: string;
  highlighted: boolean;
}

function splitSnippetLines(details: string | null): SnippetLine[] {
  if (!details) {
    return [];
  }
  return details
    .replace(/\n+$/, '')
    .split('\n')
    .map((text) => ({
      text,
      highlighted: text.includes(AT_THIS_LOCATION_MARKER),
    }));
}

@Component({
  selector: 'ng-hydration-error-view',
  templateUrl: './hydration-error-view.component.html',
  styleUrls: ['./hydration-error-view.component.scss', '../styles/view-tab.scss'],
  imports: [MatToolbar, MatIcon, MatTooltip, ButtonComponent],
})
export class HydrationErrorViewComponent {
  readonly hydration = input.required<MismatchedHydrationStatus>();

  readonly inspectDomNode = output<void>();
  readonly logDomNode = output<void>();
  readonly highlightDomNode = output<void>();
  readonly unhighlightDomNode = output<void>();

  protected readonly errorCode = computed(() => {
    const code = this.hydration().errorCode;
    return code && ERROR_CODE_PATTERN.test(code) ? code : null;
  });

  protected readonly docsUrl = computed(() => {
    const code = this.errorCode();
    return code ? `https://angular.dev/errors/${code}` : 'https://angular.dev/guide/hydration';
  });

  protected readonly inspectLabel = computed(() => {
    const status = this.hydration();
    if (!status.hasActualNode) {
      return 'Inspect host';
    }
    return status.isParentFallback ? 'Inspect parent' : 'Inspect DOM node';
  });

  protected readonly inspectTooltip = computed(() => {
    const status = this.hydration();
    if (!status.hasActualNode) {
      return 'Reveal component host element in the Elements panel';
    }
    return status.isParentFallback
      ? 'Reveal parent element of the missing node in the Elements panel'
      : 'Reveal mismatched DOM node in the Elements panel';
  });

  protected readonly logTooltip = computed(() => {
    const status = this.hydration();
    if (!status.hasActualNode) {
      return 'Log component host element to the console';
    }
    return status.isParentFallback
      ? 'Log parent element of the missing node to the console'
      : 'Log mismatched DOM node to the console';
  });

  protected readonly expectedLines = computed(() =>
    splitSnippetLines(this.hydration().expectedNodeDetails),
  );

  protected readonly actualLines = computed(() =>
    splitSnippetLines(this.hydration().actualNodeDetails),
  );
}
