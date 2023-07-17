import {Injectable} from '@angular/core';

@Injectable()
class MyAlternateService {
}

@Injectable({providedIn: 'root', useClass: MyAlternateService})
export class MyService {
}
