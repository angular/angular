/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Injectable, NgZone, OnDestroy} from '@angular/core';
import {MediaMatcher} from './media-matcher';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {map} from 'rxjs/operators/map';
import {startWith} from 'rxjs/operators/startWith';
import {takeUntil} from 'rxjs/operators/takeUntil';
import {coerceArray} from '@angular/cdk/coercion';
import {combineLatest} from 'rxjs/observable/combineLatest';
import {fromEventPattern} from 'rxjs/observable/fromEventPattern';

/** The current state of a layout breakpoint. */
export interface BreakpointState {
  /** Whether the breakpoint is currently matching. */
  matches: boolean;
}

interface Query {
  observable: Observable<BreakpointState>;
  mql: MediaQueryList;
}

/** Utility for checking the matching state of @media queries. */
@Injectable()
export class BreakpointObserver implements OnDestroy {
  /**  A map of all media queries currently being listened for. */
  private _queries: Map<string, Query> = new Map();
  /** A subject for all other observables to takeUntil based on. */
  private _destroySubject: Subject<{}> = new Subject();

  constructor(private mediaMatcher: MediaMatcher, private zone: NgZone) {}

  /** Completes the active subject, signalling to all other observables to complete. */
  ngOnDestroy() {
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  /**
   * Whether one or more media queries match the current viewport size.
   * @param value One or more media queries to check.
   * @returns Whether any of the media queries match.
   */
  isMatched(value: string | string[]): boolean {
    let queries = coerceArray(value);
    return queries.some(mediaQuery => this._registerQuery(mediaQuery).mql.matches);
  }

  /**
   * Gets an observable of results for the given queries that will emit new results for any changes
   * in matching of the given queries.
   * @returns A stream of matches for the given queries.
   */
  observe(value: string | string[]): Observable<BreakpointState> {
    let queries = coerceArray(value);
    let observables = queries.map(query => this._registerQuery(query).observable);

    return combineLatest(observables, (a: BreakpointState, b: BreakpointState) => {
      return {
        matches: !!((a && a.matches) || (b && b.matches)),
      };
    });
  }

  /** Registers a specific query to be listened for. */
  private _registerQuery(query: string): Query {
    // Only set up a new MediaQueryList if it is not already being listened for.
    if (this._queries.has(query)) {
      return this._queries.get(query)!;
    }

    let mql: MediaQueryList = this.mediaMatcher.matchMedia(query);
    // Create callback for match changes and add it is as a listener.
    let queryObservable = fromEventPattern(
      // Listener callback methods are wrapped to be placed back in ngZone. Callbacks must be placed
      // back into the zone because matchMedia is only included in Zone.js by loading the
      // webapis-media-query.js file alongside the zone.js file.  Additionally, some browsers do not
      // have MediaQueryList inherit from EventTarget, which causes inconsistencies in how Zone.js
      // patches it.
      (listener: MediaQueryListListener) => {
        mql.addListener((e: MediaQueryList) => this.zone.run(() => listener(e)));
      },
      (listener: MediaQueryListListener) => {
        mql.removeListener((e: MediaQueryList) => this.zone.run(() => listener(e)));
      })
      .pipe(
        takeUntil(this._destroySubject),
        startWith(mql),
        map((nextMql: MediaQueryList) => ({matches: nextMql.matches}))
      );

    // Add the MediaQueryList to the set of queries.
    let output = {observable: queryObservable, mql: mql};
    this._queries.set(query, output);
    return output;
  }
}
