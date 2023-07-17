import {InjectionToken, NgModule} from '@angular/core';

const PROVIDERS = [{provide: new InjectionToken('token'), useValue: 1}];

@NgModule({providers: PROVIDERS})
export class FooModule {
}
