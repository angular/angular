/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, NgZone, OnDestroy} from '@angular/core';
import {MediaMatcher} from './media-matcher';
import {asapScheduler, combineLatest, Observable, Subject, Observer} from 'rxjs';
import {debounceTime, map, startWith, takeUntil} from 'rxjs/operators';
import {coerceArray} from '@angular/cdk/coercion';


/** The current state of a layout breakpoint. */
export interface BreakpointState {
  /** Whether the breakpoint is currently matching. */
  matches: boolean;
  /**
   * A key boolean pair for each query provided to the observe method,
   * with its current matched state.
   */
  breakpoints: {
    [key: string]: boolean;
  };
}

/** The current state of a layout breakpoint. */
interface InternalBreakpointState {
  /** Whether the breakpoint is currently matching. */
  matches: boolean;
  /** The media query being to be matched */
  query: string;
}

interface Query {
  observable: Observable<InternalBreakpointState>;
  mql: MediaQueryList;
}

/** Utility for checking the matching state of @media queries. */
@Injectable({providedIn: 'root'})
export class BreakpointObserver implements OnDestroy {
  /**  A map of all media queries currently being listened for. */
  private _queries = new Map<string, Query>();
  /** A subject for all other observables to takeUntil based on. */
  private _destroySubject = new Subject<void>();

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
    const queries = splitQueries(coerceArray(value));
    return queries.some(mediaQuery => this._registerQuery(mediaQuery).mql.matches);
  }

  /**
   * Gets an observable of results for the given queries that will emit new results for any changes
   * in matching of the given queries.
   * @param value One or more media queries to check.
   * @returns A stream of matches for the given queries.
   */
  observe(value: string | string[]): Observable<BreakpointState> {
    const queries = splitQueries(coerceArray(value));
    const observables = queries.map(query => this._registerQuery(query).observable);

    return combineLatest(observables).pipe(
      debounceTime(0, asapScheduler),
      map((breakpointStates: InternalBreakpointState[]) => {
        const response: BreakpointState = {
          matches: false,
          breakpoints: {},
        };
        breakpointStates.forEach((state: InternalBreakpointState) => {
          response.matches = response.matches || state.matches;
          response.breakpoints[state.query] = state.matches;
        });
        return response;
      }));
  }

  /** Registers a specific query to be listened for. */
  private _registerQuery(query: string): Query {
    // Only set up a new MediaQueryList if it is not already being listened for.
    if (this._queries.has(query)) {
      return this._queries.get(query)!;
    }

    const mql: MediaQueryList = this.mediaMatcher.matchMedia(query);

    // Create callback for match changes and add it is as a listener.
    const queryObservable = new Observable<MediaQueryList>((observer: Observer<MediaQueryList>) => {
      // Listener callback methods are wrapped to be placed back in ngZone. Callbacks must be placed
      // back into the zone because matchMedia is only included in Zone.js by loading the
      // webapis-media-query.js file alongside the zone.js file.  Additionally, some browsers do not
      // have MediaQueryList inherit from EventTarget, which causes inconsistencies in how Zone.js
      // patches it.
      const handler = (e: any) => this.zone.run(() => observer.next(e));
      mql.addListener(handler);

      return () => {
        mql.removeListener(handler);
      };
    }).pipe(
      startWith(mql),
      map((nextMql: MediaQueryList) => ({query, matches: nextMql.matches})),
      takeUntil(this._destroySubject)
    );

    // Add the MediaQueryList to the set of queries.
    const output = {observable: queryObservable, mql};
    this._queries.set(query, output);
    return output;
  }
}

/**
 * Split each query string into separate query strings if two queries are provided as comma
 * separated.
 */
function splitQueries(queries: string[]): string[] {
  return queries.map((query: string) => query.split(','))
                .reduce((a1: string[], a2: string[]) => a1.concat(a2))
                .map(query => query.trim());
}
