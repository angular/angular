import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class LocationService {

  private urlSubject: BehaviorSubject<string>;
  get currentUrl() { return this.urlSubject.asObservable(); }

  constructor(private location: Location) {

    const initialUrl = this.stripLeadingSlashes(location.path(true));
    this.urlSubject = new BehaviorSubject(initialUrl);

    this.location.subscribe(state => {
      const url = this.stripLeadingSlashes(state.url);
      return this.urlSubject.next(url);
    });
  }

  go(url: string) {
    this.location.go(url);
    this.urlSubject.next(url);
  }

  private stripLeadingSlashes(url: string) {
    return url.replace(/^\/+/, '');
  }
}
