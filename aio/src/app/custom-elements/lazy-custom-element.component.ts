import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgElement, WithProperties } from '@angular/elements';
import { SearchResult, SearchResults } from 'app/search/interfaces';
import { Logger } from 'app/shared/logger.service';
import { ElementsLoader } from './elements-loader';

@Component({
  selector: 'aio-lazy-ce',
  template: '',
})
export class LazyCustomElementComponent implements OnInit {
  @Input() selector = '';

  constructor(
    protected elementRef: ElementRef,
    private elementsLoader: ElementsLoader,
    private logger: Logger,
  ) {}

  ngOnInit() {
    if (!this.selector || /[^\w-]/.test(this.selector)) {
      this.logger.error(new Error(`Invalid selector for 'aio-lazy-ce': ${this.selector}`));
      return;
    }

    this.elementRef.nativeElement.innerHTML = `<${this.selector}></${this.selector}>`;
    this.elementsLoader.loadCustomElement(this.selector);
  }
}

@Component({
  selector: 'aio-lazy-search-results-ce',
  template: '',
})
export class LazySearchResultsCustomElementComponent extends LazyCustomElementComponent implements OnInit {
  @Input()
  searchResults: SearchResults | null = null;

  @Output()
  resultSelected = new EventEmitter<SearchResult>();

  ngOnInit() {
    console.log('Init');
    this.selector = 'aio-search-results';
    super.ngOnInit();

    const searchResultsElem: NgElement & WithProperties<{
      searchResults: SearchResults | null;
      addEventListener: (
        type: 'resultSelected',
        listener: (this: HTMLUnknownElement, ev: CustomEvent<SearchResult>) => unknown,
        options?: boolean | AddEventListenerOptions,
      ) => void;
    }> = this.elementRef.nativeElement.firstElementChild;

    searchResultsElem.searchResults = this.searchResults;
    searchResultsElem.addEventListener('resultSelected', evt => {
      this.resultSelected.next(evt.detail);
    });

    Object.defineProperty(this, 'searchResults', {
      get() { return searchResultsElem.searchResults; },
      set(value) { searchResultsElem.searchResults = value; },
    });
  }
}
