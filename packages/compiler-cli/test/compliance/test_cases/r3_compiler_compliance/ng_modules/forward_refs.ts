import {ModuleWithProviders, NgModule} from '@angular/core';

export function provideModule(): ModuleWithProviders<ForwardModule> {
  return {ngModule: ForwardModule};
}

@NgModule({imports: [provideModule()]})
export class TestModule {
}

@NgModule()
export class ForwardModule {
}