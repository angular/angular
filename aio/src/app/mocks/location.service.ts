import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class MockLocationService {
  urlSubject = new BehaviorSubject<string>(this.initialUrl);
  currentUrl = this.urlSubject.asObservable();
  constructor(private initialUrl) {}
}

