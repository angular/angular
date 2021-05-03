import {Injectable} from '@angular/core';

class SomeDep {}
class MyAlternateService {}

@Injectable({providedIn: 'root', useFactory: () => new MyAlternateService(), deps: [SomeDep]})
export class MyService {
}
