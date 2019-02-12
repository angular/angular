/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LayoutModule} from './layout-module';
import {BreakpointObserver, BreakpointState} from './breakpoints-observer';
import {MediaMatcher} from './media-matcher';
import {fakeAsync, TestBed, inject, flush} from '@angular/core/testing';
import {Injectable} from '@angular/core';
import {Subscription} from 'rxjs';
import {take} from 'rxjs/operators';

describe('BreakpointObserver', () => {
  let breakpointObserver: BreakpointObserver;
  let mediaMatcher: FakeMediaMatcher;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [LayoutModule],
      providers: [{provide: MediaMatcher, useClass: FakeMediaMatcher}]
    });
  }));

  beforeEach(inject(
    [BreakpointObserver, MediaMatcher],
    (bm: BreakpointObserver, mm: FakeMediaMatcher) => {
      breakpointObserver = bm;
      mediaMatcher = mm;
    }));

  afterEach(() => {
    mediaMatcher.clear();
  });

  it('retrieves the whether a query is currently matched', fakeAsync(() => {
    const query = 'everything starts as true in the FakeMediaMatcher';
    expect(breakpointObserver.isMatched(query)).toBeTruthy();
  }));

  it('reuses the same MediaQueryList for matching queries', fakeAsync(() => {
    expect(mediaMatcher.queryCount).toBe(0);
    breakpointObserver.observe('query1');
    expect(mediaMatcher.queryCount).toBe(1);
    breakpointObserver.observe('query1');
    expect(mediaMatcher.queryCount).toBe(1);
    breakpointObserver.observe('query2');
    expect(mediaMatcher.queryCount).toBe(2);
    breakpointObserver.observe('query1');
    expect(mediaMatcher.queryCount).toBe(2);
  }));

  it('splits combined query strings into individual matchMedia listeners', fakeAsync(() => {
    expect(mediaMatcher.queryCount).toBe(0);
    breakpointObserver.observe('query1, query2');
    expect(mediaMatcher.queryCount).toBe(2);
    breakpointObserver.observe('query1');
    expect(mediaMatcher.queryCount).toBe(2);
    breakpointObserver.observe('query2, query3');
    expect(mediaMatcher.queryCount).toBe(3);
  }));

  it('accepts an array of queries', fakeAsync(() => {
    const queries = ['1 query', '2 query', 'red query', 'blue query'];
    breakpointObserver.observe(queries);
    expect(mediaMatcher.queryCount).toBe(queries.length);
  }));

  it('completes all events when the breakpoint manager is destroyed', fakeAsync(() => {
    const firstTest = jasmine.createSpy('test1');
    breakpointObserver.observe('test1').subscribe(undefined, undefined, firstTest);
    const secondTest = jasmine.createSpy('test2');
    breakpointObserver.observe('test2').subscribe(undefined, undefined, secondTest);

    flush();
    expect(firstTest).not.toHaveBeenCalled();
    expect(secondTest).not.toHaveBeenCalled();

    breakpointObserver.ngOnDestroy();
    flush();

    expect(firstTest).toHaveBeenCalled();
    expect(secondTest).toHaveBeenCalled();
  }));

  it('emits an event on the observable when values change', fakeAsync(() => {
    const query = '(width: 999px)';
    let queryMatchState = false;
    breakpointObserver.observe(query).subscribe((state: BreakpointState) => {
      queryMatchState = state.matches;
    });

    flush();
    expect(queryMatchState).toBeTruthy();
    mediaMatcher.setMatchesQuery(query, false);
    flush();
    expect(queryMatchState).toBeFalsy();
  }));

  it('emits an event on the observable with the matching state of all queries provided',
    fakeAsync(() => {
      const queryOne = '(width: 999px)';
      const queryTwo = '(width: 700px)';
      let state: BreakpointState = {matches: false, breakpoints: {}};
      breakpointObserver.observe([queryOne, queryTwo]).subscribe((breakpoint: BreakpointState) => {
        state = breakpoint;
      });

      mediaMatcher.setMatchesQuery(queryOne, false);
      mediaMatcher.setMatchesQuery(queryTwo, false);
      flush();
      expect(state.breakpoints).toEqual({[queryOne]: false, [queryTwo]: false});

      mediaMatcher.setMatchesQuery(queryOne, true);
      mediaMatcher.setMatchesQuery(queryTwo, false);
      flush();
      expect(state.breakpoints).toEqual({[queryOne]: true, [queryTwo]: false});
  }));

  it('emits a true matches state when the query is matched', fakeAsync(() => {
    const query = '(width: 999px)';
    breakpointObserver.observe(query).subscribe();
    mediaMatcher.setMatchesQuery(query, true);
    expect(breakpointObserver.isMatched(query)).toBeTruthy();
  }));

  it('emits a false matches state when the query is not matched', fakeAsync(() => {
    const query = '(width: 999px)';
    breakpointObserver.observe(query).subscribe();
    mediaMatcher.setMatchesQuery(query, false);
    expect(breakpointObserver.isMatched(query)).toBeFalsy();
  }));

  it('should not complete other subscribers when preceding subscriber completes', fakeAsync(() => {
    const queryOne = '(width: 700px)';
    const queryTwo = '(width: 999px)';
    const breakpoint = breakpointObserver.observe([queryOne, queryTwo]);
    const subscriptions: Subscription[] = [];
    let emittedValues: number[] = [];

    subscriptions.push(breakpoint.subscribe(() => emittedValues.push(1)));
    subscriptions.push(breakpoint.pipe(take(1)).subscribe(() => emittedValues.push(2)));
    subscriptions.push(breakpoint.subscribe(() => emittedValues.push(3)));
    subscriptions.push(breakpoint.subscribe(() => emittedValues.push(4)));

    mediaMatcher.setMatchesQuery(queryOne, true);
    mediaMatcher.setMatchesQuery(queryTwo, false);
    flush();

    expect(emittedValues).toEqual([1, 2, 3, 4]);
    emittedValues = [];

    mediaMatcher.setMatchesQuery(queryOne, false);
    mediaMatcher.setMatchesQuery(queryTwo, true);
    flush();

    expect(emittedValues).toEqual([1, 3, 4]);

    subscriptions.forEach(subscription => subscription.unsubscribe());
  }));
});

export class FakeMediaQueryList {
  /** The callback for change events. */
  private _listeners: ((mql: MediaQueryListEvent) => void)[] = [];

  constructor(public matches: boolean, public media: string) {}

  /** Toggles the matches state and "emits" a change event. */
  setMatches(matches: boolean) {
    this.matches = matches;
    this._listeners.forEach(listener => listener(this as any));
  }

  /** Registers a callback method for change events. */
  addListener(callback: (mql: MediaQueryListEvent) => void) {
    this._listeners.push(callback);
  }

  /** Removes a callback method from the change events. */
  removeListener(callback: (mql: MediaQueryListEvent) => void) {
    const index = this._listeners.indexOf(callback);

    if (index > -1) {
      this._listeners.splice(index, 1);
    }
  }
}

@Injectable()
export class FakeMediaMatcher {
  /** A map of match media queries. */
  private queries = new Map<string, FakeMediaQueryList>();

  /** The number of distinct queries created in the media matcher during a test. */
  get queryCount(): number {
    return this.queries.size;
  }

  /** Fakes the match media response to be controlled in tests. */
  matchMedia(query: string): FakeMediaQueryList {
    const mql = new FakeMediaQueryList(true, query);
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
    } else {
      throw Error('This query is not being observed.');
    }
  }
}
