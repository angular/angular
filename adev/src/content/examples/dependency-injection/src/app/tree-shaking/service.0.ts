import {Injectable} from '@angular/core';

// #docregion
@Injectable({
  providedIn: 'root',
  useFactory: () => new Service('dependency'),
})
export class Service {
  constructor(private dep: string) {}
}
