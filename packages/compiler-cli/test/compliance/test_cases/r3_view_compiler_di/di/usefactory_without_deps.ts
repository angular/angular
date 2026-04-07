import {Injectable} from '@angular/core';

class MyAlternateService {}

function alternateFactory() {
  return new MyAlternateService();
}

@Injectable({providedIn: 'root', useFactory: alternateFactory})
export class MyService {
}
