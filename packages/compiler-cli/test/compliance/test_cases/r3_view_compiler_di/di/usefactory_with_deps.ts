import {Injectable} from '@angular/core';

class SomeDep {}
class MyAlternateService {}

@Injectable({useFactory: () => new MyAlternateService(), deps: [SomeDep]})
export class MyService {
}
