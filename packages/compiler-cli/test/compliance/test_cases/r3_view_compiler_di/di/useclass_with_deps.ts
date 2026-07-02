import {Injectable} from '@angular/core';

class SomeDep {}

@Injectable()
class MyAlternateService {
  constructor(dep: SomeDep) {}
}

@Injectable({providedIn: 'root', useClass: MyAlternateService, deps: [SomeDep]})
export class MyService {
}
