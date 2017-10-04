/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Directive,
  ElementRef,
  NgModule,
  Output,
  Input,
  EventEmitter,
  OnDestroy,
  AfterContentInit,
  Injectable,
  NgZone,
} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {RxChain, debounceTime} from '@angular/cdk/rxjs';

/**
 * Factory that creates a new MutationObserver and allows us to stub it out in unit tests.
 * @docs-private
 */
@Injectable()
export class MatMutationObserverFactory {
  create(callback: MutationCallback): MutationObserver | null {
    return typeof MutationObserver === 'undefined' ? null : new MutationObserver(callback);
  }
}

/**
 * Directive that triggers a callback whenever the content of
 * its associated element has changed.
 */
@Directive({
  selector: '[cdkObserveContent]',
  exportAs: 'cdkObserveContent',
})
export class ObserveContent implements AfterContentInit, OnDestroy {
  private _observer: MutationObserver | null;

  /** Event emitted for each change in the element's content. */
  @Output('cdkObserveContent') event = new EventEmitter<MutationRecord[]>();

  /** Used for debouncing the emitted values to the observeContent event. */
  private _debouncer = new Subject<MutationRecord[]>();

  /** Debounce interval for emitting the changes. */
  @Input() debounce: number;

  constructor(
    private _mutationObserverFactory: MatMutationObserverFactory,
    private _elementRef: ElementRef,
    private _ngZone: NgZone) { }

  ngAfterContentInit() {
    if (this.debounce > 0) {
      this._ngZone.runOutsideAngular(() => {
        RxChain.from(this._debouncer)
          .call(debounceTime, this.debounce)
          .subscribe((mutations: MutationRecord[]) => this.event.emit(mutations));
      });
    } else {
      this._debouncer.subscribe(mutations => this.event.emit(mutations));
    }

    this._observer = this._ngZone.runOutsideAngular(() => {
      return this._mutationObserverFactory.create((mutations: MutationRecord[]) => {
        this._debouncer.next(mutations);
      });
    });

    if (this._observer) {
      this._observer.observe(this._elementRef.nativeElement, {
        characterData: true,
        childList: true,
        subtree: true
      });
    }
  }

  ngOnDestroy() {
    if (this._observer) {
      this._observer.disconnect();
    }

    this._debouncer.complete();
  }
}


@NgModule({
  exports: [ObserveContent],
  declarations: [ObserveContent],
  providers: [MatMutationObserverFactory]
})
export class ObserversModule {}
