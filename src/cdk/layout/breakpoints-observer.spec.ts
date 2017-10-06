/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {LayoutModule, BreakpointObserver, BreakpointState} from './index';
import {MediaMatcher} from './media-matcher';
import {async, TestBed, inject} from '@angular/core/testing';
import {Injectable} from '@angular/core';

describe('BreakpointObserver', () => {
  let breakpointManager: BreakpointObserver;
  let mediaMatcher: FakeMediaMatcher;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LayoutModule],
      providers: [{provide: MediaMatcher, useClass: FakeMediaMatcher}]
    });
  }));

  beforeEach(inject(
    [BreakpointObserver, MediaMatcher],
    (bm: BreakpointObserver, mm: FakeMediaMatcher) => {
      breakpointManager = bm;
      mediaMatcher = mm;
    }));

  afterEach(() => {
    mediaMatcher.clear();
  });

  it('retrieves the whether a query is currently matched', () => {
    let query = 'everything starts as true in the FakeMediaMatcher';
    expect(breakpointManager.isMatched(query)).toBeTruthy();
  });

  it('reuses the same MediaQueryList for matching queries', () => {
    expect(mediaMatcher.queryCount).toBe(0);
    breakpointManager.observe('query1');
    expect(mediaMatcher.queryCount).toBe(1);
    breakpointManager.observe('query1');
    expect(mediaMatcher.queryCount).toBe(1);
    breakpointManager.observe('query2');
    expect(mediaMatcher.queryCount).toBe(2);
    breakpointManager.observe('query1');
    expect(mediaMatcher.queryCount).toBe(2);
  });

  it('accepts an array of queries', () => {
    let queries = ['1 query', '2 query', 'red query', 'blue query'];
    breakpointManager.observe(queries);
    expect(mediaMatcher.queryCount).toBe(queries.length);
  });

  it('completes all events when the breakpoint manager is destroyed', () => {
    let firstTest = jasmine.createSpy('test1');
    breakpointManager.observe('test1').subscribe(undefined, undefined, firstTest);
    let secondTest = jasmine.createSpy('test2');
    breakpointManager.observe('test2').subscribe(undefined, undefined, secondTest);

    expect(firstTest).not.toHaveBeenCalled();
    expect(secondTest).not.toHaveBeenCalled();

    breakpointManager.ngOnDestroy();

    expect(firstTest).toHaveBeenCalled();
    expect(secondTest).toHaveBeenCalled();
  });

  it('emits an event on the observable when values change', () => {
    let query = '(width: 999px)';
    let queryMatchState: boolean = false;
    breakpointManager.observe(query).subscribe((state: BreakpointState) => {
      queryMatchState = state.matches;
    });

    async(() => {
      expect(queryMatchState).toBeTruthy();
      mediaMatcher.setMatchesQuery(query, false);
      expect(queryMatchState).toBeFalsy();
    });
  });

  it('emits a true matches state when the query is matched', () => {
    let query = '(width: 999px)';
    mediaMatcher.setMatchesQuery(query, true);
    expect(breakpointManager.isMatched(query)).toBeTruthy();
  });

  it('emits a false matches state when the query is not matched', () => {
    let query = '(width: 999px)';
    mediaMatcher.setMatchesQuery(query, false);
    expect(breakpointManager.isMatched(query)).toBeTruthy();
  });
});

export class FakeMediaQueryList implements MediaQueryList {
  /** The callback for change events. */
  addListenerCallback?: (mql: MediaQueryList) => void;

  constructor(public matches, public media) {}

  /** Toggles the matches state and "emits" a change event. */
  setMatches(matches: boolean) {
    this.matches = matches;
    this.addListenerCallback!(this);
  }

  /** Registers the callback method for change events. */
  addListener(callback: (mql: MediaQueryList) => void) {
    this.addListenerCallback = callback;
  }

  /** Noop, but required for implementing MediaQueryList. */
  removeListener() {}
}

@Injectable()
export class FakeMediaMatcher {
  /** A map of match media queries. */
  private queries: Map<string, FakeMediaQueryList> = new Map();

  /** The number of distinct queries created in the media matcher during a test. */
  get queryCount(): number {
    return this.queries.size;
  }

  /** Fakes the match media response to be controlled in tests. */
  matchMedia(query: string): FakeMediaQueryList {
    let mql = new FakeMediaQueryList(true, query);
    this.queries.set(query, mql);
    return mql;
  }

  /** Clears all queries from the map of queries. */
  clear() {
    this.queries.clear();
  }

  /** Toggles the matching state of the provided query. */
  setMatchesQuery(query: string, matches: boolean) {
    if (this.queries.has(query)) {
      this.queries.get(query)!.setMatches(matches);
    }
  }
}
