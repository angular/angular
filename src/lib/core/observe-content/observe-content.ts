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
} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';

/**
 * Factory that creates a new MutationObserver and allows us to stub it out in unit tests.
 * @docs-private
 */
@Injectable()
export class MdMutationObserverFactory {
  create(callback): MutationObserver {
    return new MutationObserver(callback);
  }
}

/**
 * Directive that triggers a callback whenever the content of
 * its associated element has changed.
 */
@Directive({
  selector: '[cdkObserveContent]'
})
export class ObserveContent implements AfterContentInit, OnDestroy {
  private _observer: MutationObserver;

  /** Event emitted for each change in the element's content. */
  @Output('cdkObserveContent') event = new EventEmitter<MutationRecord[]>();

  /** Used for debouncing the emitted values to the observeContent event. */
  private _debouncer = new Subject<MutationRecord[]>();

  /** Debounce interval for emitting the changes. */
  @Input() debounce: number;

  constructor(
    private _mutationObserverFactory: MdMutationObserverFactory,
    private _elementRef: ElementRef) { }

  ngAfterContentInit() {
    if (this.debounce > 0) {
      this._debouncer
        .debounceTime(this.debounce)
        .subscribe(mutations => this.event.emit(mutations));
    } else {
      this._debouncer.subscribe(mutations => this.event.emit(mutations));
    }

    this._observer = this._mutationObserverFactory.create((mutations: MutationRecord[]) => {
      this._debouncer.next(mutations);
    });

    this._observer.observe(this._elementRef.nativeElement, {
      characterData: true,
      childList: true,
      subtree: true
    });
  }

  ngOnDestroy() {
    if (this._observer) {
      this._observer.disconnect();
      this._debouncer.complete();
      this._debouncer = this._observer = null;
    }
  }
}


@NgModule({
  exports: [ObserveContent],
  declarations: [ObserveContent],
  providers: [MdMutationObserverFactory]
})
export class ObserveContentModule {}
