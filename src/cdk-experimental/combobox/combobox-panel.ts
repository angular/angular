/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export type AriaHasPopupValue = 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';

import {Directive, TemplateRef} from '@angular/core';
import {Subject} from 'rxjs';

@Directive({
  host: {
    'class': 'cdk-combobox-panel',
  },
  selector: 'ng-template[cdkComboboxPanel]',
  exportAs: 'cdkComboboxPanel',
})
export class CdkComboboxPanel<T = unknown> {
  valueUpdated: Subject<T | T[]> = new Subject<T | T[]>();
  contentIdUpdated: Subject<string> = new Subject<string>();
  contentTypeUpdated: Subject<AriaHasPopupValue> = new Subject<AriaHasPopupValue>();

  contentId: string = '';
  contentType: AriaHasPopupValue;

  constructor(readonly _templateRef: TemplateRef<unknown>) {}

  /** Tells the parent combobox to close the panel and sends back the content value. */
  closePanel(data?: T | T[]) {
    this.valueUpdated.next(data || []);
  }

  // TODO: instead of using a focus function, potentially use cdk/a11y focus trapping
  focusContent() {
    // TODO: Use an injected document here
    document.getElementById(this.contentId)?.focus();
  }

  /** Registers the content's id and the content type with the panel. */
  _registerContent(contentId: string, contentType: AriaHasPopupValue) {
    // If content has already been registered, no further contentIds are registered.
    if (this.contentType && this.contentType !== contentType) {
      return;
    }

    this.contentId = contentId;
    if (contentType !== 'listbox' && contentType !== 'dialog') {
      throw Error('CdkComboboxPanel currently only supports listbox or dialog content.');
    }
    this.contentType = contentType;

    this.contentIdUpdated.next(this.contentId);
    this.contentTypeUpdated.next(this.contentType);
  }
}
