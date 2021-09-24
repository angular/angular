import {Injectable, Optional} from '@angular/core';

class SomeDep {}
class MyAlternateService {
  constructor(dep: SomeDep|null) {}
}

@Injectable({
  providedIn: 'root',
  useFactory: (dep: SomeDep) => new MyAlternateService(dep),
  deps: [SomeDep]
})
export class MyService {
}

@Injectable({
  providedIn: 'root',
  useFactory: (dep: SomeDep|null) => new MyAlternateService(dep),
  deps: [[new Optional(), SomeDep]]
})
export class MyOptionalService {
}
