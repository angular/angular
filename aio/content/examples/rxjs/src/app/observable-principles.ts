// Demonstrate Observable principles discussed in the doc
// #docplaster
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/interval';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/toPromise';

import { Hero } from './hero';
import { InMemoryDataService }  from './in-memory-data.service';
import { EventAggregatorService } from './event-aggregator.service';


@Injectable()
export class ObservablePrinciples {
  private heroesUrl = 'api/heroes';

  constructor(
    private http: Http,
    private eventService: EventAggregatorService) { }

  functionalArray() {
    // #docregion functional-array
    // double the odd numbers in the array.
    const numbers = [0, 1, 2, 3, 4, 5];
    return numbers.filter(n => n % 2 === 1).map(n => n * 2);
    // #enddocregion functional-array
  }

  functionalEvents() {
    // #docregion functional-events
    // double the next odd integer every tick ... forever.
    const numbers = Observable.interval(0);
    return numbers.filter(n => n % 2 === 1).map(n => n * 2);
    // #enddocregion functional-events
  }

  /**
   * Call the functional array and event example methods
   * and write their results to the EventAggregatorService
   * for display in AppComponent.
   */
  callFunctionalExamples() {

    this.eventService.add({
      type: 'array',
      message: `array of numbers: ${this.functionalArray()}`}
    );

    // Stop after 3
    this.functionalEvents().take(3).subscribe(
      result => this.eventService.add({
        type: 'number stream',
        message: `stream of numbers: ${result}`}
      )
    );
  }

 /////////////////

 /**
  * A `fromPromise` example that converts the `Promise` result
  * of the `fetch` API into an Observable of heroes.
  */
  fetchHeroes(): Observable<Hero[]> {

  // #docregion fromPromise
    // JavaScript fetch returns a Promise
    let promise = fetch(this.heroesUrl)
      .then(resp => resp.json() as Promise<Hero[]>)
      .then(heroes => { console.log(heroes); return heroes; });

    // return an Observable
    return Observable.fromPromise(promise);
  // #enddocregion fromPromise
  }

 /**
  * A `toPromise` example that converts the `Observable` result
  * of the Angular `http` API into a Promise of heroes.
  */
  getHeroes(): Promise<Hero[]> {

  // #docregion toPromise
    // Angular http.get returns an Observable
    let observable = this.http.get(this.heroesUrl)
      .map(resp => resp.json().data as Hero[])
      .do(heroes => console.log(heroes));

    // return a Promise
    return observable.toPromise();
  // #enddocregion toPromise
  }

  /**
   * Call the fromPromise and toPromise example methods
   * and write their results to the EventAggregatorService
   * for display in AppComponent.
   */
  callPromiseExamples() {

    this.fetchHeroes()
      .subscribe(
        heroes => this.eventService.add({type: 'fetch', message: 'fetched heroes'}),
        error => this.eventService.add({type: 'fetch', message: 'fetchHeroes failed'})
      );

    this.getHeroes()
      .then(
        heroes => this.eventService.add({type: 'get', message: 'got heroes'}),
        error => this.eventService.add({type: 'get', message: 'getHeroes failed'})
      );
  }
}

// Fake the JavaScript fetch API (https://fetch.spec.whatwg.org/) because
// don't want to add another polyfill for browsers that don't support fetch
// and it's not important for this example.
function fetch(url: string) {
   const heroes = new InMemoryDataService().createDb().heroes;
   const resp = { json: () => Promise.resolve(heroes) as Promise<any>};
   return new Promise<typeof resp>(resolve => {
      setTimeout(() => resolve(resp), 500); // respond after half second
   });
}
