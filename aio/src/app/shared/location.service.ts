import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class LocationService {

  private urlSubject: BehaviorSubject<string>;
  get currentUrl() { return this.urlSubject.asObservable(); }

  constructor(private location: Location) {
    this.urlSubject = new BehaviorSubject(location.path(true));
    this.location.subscribe(state => this.urlSubject.next(state.url));
  }

  go(url: string) {
    url = this.location.normalize(url);
    this.location.go(url);
    this.urlSubject.next(url);
  }
}
