import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export class MockLocationService {
  urlSubject = new BehaviorSubject<string>(this.initialUrl);
  currentUrl = this.urlSubject.asObservable();
  constructor(private initialUrl) {}
}

