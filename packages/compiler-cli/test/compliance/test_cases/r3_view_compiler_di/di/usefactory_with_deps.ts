import {Injectable, Optional} from '@angular/core';

class SomeDep {}
class MyAlternateService {}

@Injectable({providedIn: 'root', useFactory: () => new MyAlternateService(), deps: [SomeDep]})
export class MyService {
}

@Injectable({
  providedIn: 'root',
  useFactory: () => new MyAlternateService(),
  deps: [[new Optional(), SomeDep]]
})
export class MyOptionalService {
}
