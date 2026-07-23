import {Injectable, InjectionToken, NgModule} from '@angular/core';

export abstract class Base {}

@Injectable()
export class Impl extends Base {}

@Injectable()
export class Legacy {}

export const TOKEN = new InjectionToken<string>('TOKEN');
export const MULTI = new InjectionToken<string[]>('MULTI');

@NgModule({
  providers: [
    Impl,
    {provide: Base, useClass: Impl},
    {provide: Legacy, useExisting: Impl},
    {provide: TOKEN, useValue: 'hello'},
    {provide: MULTI, useValue: 'a', multi: true},
    {provide: MULTI, useValue: 'b', multi: true},
    {provide: 'STR', useFactory: (b: Base) => b, deps: [Base]},
  ],
})
export class ProvidersModule {}
