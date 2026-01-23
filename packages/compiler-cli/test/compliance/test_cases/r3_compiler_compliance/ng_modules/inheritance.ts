import {Injectable, NgModule} from '@angular/core';

@Injectable()
export class Service {
}

@NgModule({providers: [Service]})
export class BaseModule {
  constructor(private service: Service) {}
}

@NgModule({})
export class BasicModule extends BaseModule {
}
