import {Inject, Injectable, InjectionToken, SkipSelf} from '@angular/core';
import {CustomParamDecorator} from './custom';

export const TOKEN = new InjectionToken<string>('TOKEN');
class Service {}

@Injectable()
export class ParamerizedInjectable {
  constructor(
      service: Service, @Inject(TOKEN) token: string, @CustomParamDecorator() custom: Service,
      @Inject(TOKEN) @SkipSelf() @CustomParamDecorator() mixed: string) {}
}

@Injectable()
export class NoCtor {
}

@Injectable()
export class EmptyCtor {
  constructor() {}
}

@Injectable()
export class NoDecorators {
  constructor(service: Service) {}
}

@Injectable()
export class CustomInjectable {
  constructor(@CustomParamDecorator() service: Service) {}
}
