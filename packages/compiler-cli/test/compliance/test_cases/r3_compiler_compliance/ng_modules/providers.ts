import {Injectable, InjectionToken, NgModule} from '@angular/core';

@Injectable()
export class Thing {
}

@Injectable()
export class BaseService {
  constructor(protected thing: Thing) {};
}

@Injectable()
export class ChildService extends BaseService {
}

const MY_TOKEN = new InjectionToken('MY_TOKEN');

@NgModule({
  providers: [
    Thing,
    BaseService,
    ChildService,
    {provide: MY_TOKEN, useFactory: (child: ChildService) => ({child}), deps: [ChildService]},
  ]
})
export class FooModule {
}
