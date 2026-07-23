import {Injectable, NgModule} from '@angular/core';

@NgModule({})
export class SomeModule {}

@Injectable({providedIn: 'platform'})
export class PlatformService {}

@Injectable({providedIn: 'any'})
export class AnyService {}

@Injectable({providedIn: SomeModule})
export class ModuleScopedService {}
