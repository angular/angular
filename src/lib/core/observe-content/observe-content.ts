import {
  Directive,
  ElementRef,
  NgModule,
  ModuleWithProviders,
  Output,
  EventEmitter,
  OnDestroy,
  AfterContentInit
} from '@angular/core';

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
  @Output('cdkObserveContent') event = new EventEmitter<void>();

  constructor(private _elementRef: ElementRef) {}

  ngAfterContentInit() {
    this._observer = new MutationObserver(mutations => mutations.forEach(() => this.event.emit()));

    this._observer.observe(this._elementRef.nativeElement, {
      characterData: true,
      childList: true,
      subtree: true
    });
  }

  ngOnDestroy() {
    if (this._observer) {
      this._observer.disconnect();
    }
  }
}

@NgModule({
  exports: [ObserveContent],
  declarations: [ObserveContent]
})
export class ObserveContentModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ObserveContentModule,
      providers: []
    };
  }
}
