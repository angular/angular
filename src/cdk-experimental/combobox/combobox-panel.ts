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
  selector: 'ng-template[cdkComboboxPanel]',
  exportAs: 'cdkComboboxPanel',
})
export class CdkComboboxPanel<T = unknown> {

  valueUpdated: Subject<T> = new Subject<T>();
  contentIdUpdated: Subject<string> = new Subject<string>();
  contentTypeUpdated: Subject<AriaHasPopupValue> = new Subject<AriaHasPopupValue>();

  contentId: string = '';
  contentType: AriaHasPopupValue;

  constructor(readonly _templateRef: TemplateRef<unknown>) {}

  /** Tells the parent combobox to closet he panel and sends back the content value. */
  closePanel(data?: T) {
    this.valueUpdated.next(data);
  }

  /** Registers the content's id and the content type with the panel. */
  _registerContent(contentId: string, contentType: AriaHasPopupValue) {
    this.contentId = contentId;
    if (contentType !== 'listbox' && contentType !== 'dialog') {
      throw Error('CdkComboboxPanel currently only supports listbox or dialog content.');
    }
    this.contentType = contentType;

    this.contentIdUpdated.next(this.contentId);
    this.contentTypeUpdated.next(this.contentType);
  }
}
