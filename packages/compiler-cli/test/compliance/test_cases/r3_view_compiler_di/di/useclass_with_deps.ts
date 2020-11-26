import {Injectable} from '@angular/core';

class SomeDep {}

@Injectable()
class MyAlternateService {
}

@Injectable({useClass: MyAlternateService, deps: [SomeDep]})
export class MyService {
}
