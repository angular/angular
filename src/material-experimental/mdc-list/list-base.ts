/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AfterContentInit, Directive, ElementRef, NgZone, OnDestroy, QueryList} from '@angular/core';
import {setLines} from '@angular/material/core';
import {Subscription} from 'rxjs';
import {startWith} from 'rxjs/operators';

export class MatListBase {}

@Directive()
export abstract class MatListItemBase implements AfterContentInit, OnDestroy {
  lines: QueryList<ElementRef<Element>>;

  private _subscriptions = new Subscription();

  constructor(protected _element: ElementRef, protected _ngZone: NgZone) {}

  ngAfterContentInit() {
    this._monitorLines();
  }

  /**
   * Subscribes to changes in `MatLine` content children and annotates them appropriately when they
   * change.
   */
  private _monitorLines() {
    this._ngZone.runOutsideAngular(() => {
      this._subscriptions.add(this.lines.changes.pipe(startWith(this.lines))
          .subscribe((lines: QueryList<ElementRef<Element>>) => {
            lines.forEach((line: ElementRef<Element>, index: number) => {
              line.nativeElement.classList.toggle('mdc-list-item__primary-text', index === 0);
              line.nativeElement.classList.toggle('mdc-list-item__secondary-text', index !== 0);
            });
            setLines(lines, this._element, 'mat-mdc');
          }));
    });
  }

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }
}
