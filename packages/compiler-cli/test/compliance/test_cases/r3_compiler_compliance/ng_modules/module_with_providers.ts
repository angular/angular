import {InjectionToken, ModuleWithProviders, NgModule} from '@angular/core';

export const CONFIG = new InjectionToken<string>('CONFIG');

@NgModule({})
export class LibModule {
  static forRoot(value: string): ModuleWithProviders<LibModule> {
    return {
      ngModule: LibModule,
      providers: [{provide: CONFIG, useValue: value}],
    };
  }
}

@NgModule({
  imports: [LibModule.forRoot('app')],
})
export class AppModule {}
