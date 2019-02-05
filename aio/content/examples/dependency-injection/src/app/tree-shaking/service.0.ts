// #docregion
import { Injectable, InjectionToken, Inject } from '@angular/core';

export const DEP_TOKEN = new InjectionToken<string>('dep');

@Injectable({
  providedIn: 'root',
  useFactory: (dependency) => new Service(dependency),
  deps: [DEP_TOKEN]
})
export class Service {
  constructor(@Inject(DEP_TOKEN) private dep: string) {
  }
}
