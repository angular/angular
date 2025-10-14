import {__esDecorate, __runInitializers} from 'tslib';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {catchError, map, tap} from 'rxjs/operators';
const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
};
let HeroService = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HeroService = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      HeroService = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    heroesUrl = 'api/heroes'; // URL to web api
    http = inject(HttpClient);
    /** GET heroes from the server */
    getHeroes() {
      return this.http.get(this.heroesUrl).pipe(
        tap((heroes) => this.log('fetched heroes')),
        catchError(this.handleError('getHeroes')),
      );
    }
    /** GET hero by id. Return `undefined` when id not found */
    getHero(id) {
      if (typeof id === 'string') {
        id = parseInt(id, 10);
      }
      const url = `${this.heroesUrl}/?id=${id}`;
      return this.http.get(url).pipe(
        map((heroes) => heroes[0]), // returns a {0|1} element array
        tap((h) => {
          const outcome = h ? 'fetched' : 'did not find';
          this.log(`${outcome} hero id=${id}`);
        }),
        catchError(this.handleError(`getHero id=${id}`)),
      );
    }
    //////// Save methods //////////
    /** POST: add a new hero to the server */
    addHero(hero) {
      return this.http.post(this.heroesUrl, hero, httpOptions).pipe(
        tap((addedHero) => this.log(`added hero w/ id=${addedHero.id}`)),
        catchError(this.handleError('addHero')),
      );
    }
    /** DELETE: delete the hero from the server */
    deleteHero(hero) {
      const id = typeof hero === 'number' ? hero : hero.id;
      const url = `${this.heroesUrl}/${id}`;
      return this.http.delete(url, httpOptions).pipe(
        tap((_) => this.log(`deleted hero id=${id}`)),
        catchError(this.handleError('deleteHero')),
      );
    }
    /** PUT: update the hero on the server */
    updateHero(hero) {
      return this.http.put(this.heroesUrl, hero, httpOptions).pipe(
        tap((_) => this.log(`updated hero id=${hero.id}`)),
        catchError(this.handleError('updateHero')),
      );
    }
    /**
     * Returns a function that handles Http operation failures.
     * This error handler lets the app continue to run as if no error occurred.
     *
     * @param operation - name of the operation that failed
     */
    handleError(operation = 'operation') {
      return (error) => {
        // TODO: send the error to remote logging infrastructure
        console.error(error); // log to console instead
        // If a native error is caught, do not transform it. We only want to
        // transform response errors that are not wrapped in an `Error`.
        if (error.error instanceof Event) {
          throw error.error;
        }
        const message = `server returned code ${error.status} with body "${error.error}"`;
        // TODO: better job of transforming error for user consumption
        throw new Error(`${operation} failed: ${message}`);
      };
    }
    log(message) {
      console.log('HeroService: ' + message);
    }
  };
  return (HeroService = _classThis);
})();
export {HeroService};
//# sourceMappingURL=hero.service.js.map
