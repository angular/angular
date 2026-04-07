import {Injectable, Optional} from '@angular/core';

class SomeDep {}
class MyAlternateService {
  constructor(dep: SomeDep, optional: SomeDep|null) {}
}

@Injectable({
  providedIn: 'root',
  useFactory: (dep: SomeDep, optional: SomeDep|null) => new MyAlternateService(dep, optional),
  deps: [SomeDep, [new Optional(), SomeDep]]
})
export class MyService {
}
