import {Injectable} from '@angular/core';

class MyAlternateService {}

function alternateFactory() {
  return new MyAlternateService();
}

@Injectable({useFactory: alternateFactory})
export class MyService {
}
