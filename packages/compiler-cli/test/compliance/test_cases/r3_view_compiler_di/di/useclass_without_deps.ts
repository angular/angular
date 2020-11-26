import {Injectable} from '@angular/core';

@Injectable()
class MyAlternateService {
}

@Injectable({useClass: MyAlternateService})
export class MyService {
}
