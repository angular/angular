/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Platform} from '@angular/cdk/platform';
import {
  AfterContentInit,
  Directive,
  ElementRef,
  HostBinding,
  NgZone,
  OnDestroy,
  QueryList
} from '@angular/core';
import {RippleConfig, RippleRenderer, RippleTarget, setLines} from '@angular/material/core';
import {Subscription} from 'rxjs';
import {startWith} from 'rxjs/operators';

function toggleClass(el: Element, className: string, on: boolean) {
  if (on) {
    el.classList.add(className);
  } else {
    el.classList.remove(className);
  }
}

@Directive()
/** @docs-private */
export abstract class MatListBase {
  // @HostBinding is used in the class as it is expected to be extended. Since @Component decorator
  // metadata is not inherited by child classes, instead the host binding data is defined in a way
  // that can be inherited.
  // tslint:disable-next-line:no-host-decorator-in-concrete
  @HostBinding('class.mdc-list--non-interactive')
  _isNonInteractive: boolean = false;
}

@Directive()
/** @docs-private */
export abstract class MatListItemBase implements AfterContentInit, OnDestroy, RippleTarget {
  lines: QueryList<ElementRef<Element>>;

  rippleConfig: RippleConfig = {};

  // TODO(mmalerba): Add @Input for disabling ripple.
  rippleDisabled: boolean;

  private _subscriptions = new Subscription();

  private _rippleRenderer: RippleRenderer;

  constructor(protected _element: ElementRef, protected _ngZone: NgZone, listBase: MatListBase,
              platform: Platform) {
    const el = this._element.nativeElement;
    this.rippleDisabled = listBase._isNonInteractive;
    if (!listBase._isNonInteractive) {
      el.classList.add('mat-mdc-list-item-interactive');
    }
    this._rippleRenderer =
        new RippleRenderer(this, this._ngZone, el, platform);
    this._rippleRenderer.setupTriggerEvents(el);
  }

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
            this._element.nativeElement.classList
                .toggle('mat-mdc-list-item-single-line', lines.length <= 1);
            lines.forEach((line: ElementRef<Element>, index: number) => {
              toggleClass(line.nativeElement,
                  'mdc-list-item__primary-text', index === 0 && lines.length > 1);
              toggleClass(line.nativeElement, 'mdc-list-item__secondary-text', index !== 0);
            });
            setLines(lines, this._element, 'mat-mdc');
          }));
    });
  }

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
    this._rippleRenderer._removeTriggerEvents();
  }
}
