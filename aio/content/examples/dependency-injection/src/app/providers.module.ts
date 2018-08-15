import { NgModule } from '@angular/core';

import {
  Provider1Component,
  Provider3Component,
  Provider4Component,
  Provider5Component,
  Provider6aComponent,
  Provider6bComponent,
  Provider7Component,
  Provider8Component,
  Provider9Component,
  Provider10Component,
  ProvidersComponent,
} from './providers.component';

@NgModule({
  declarations: [
    Provider1Component,
    Provider3Component,
    Provider4Component,
    Provider5Component,
    Provider6aComponent,
    Provider6bComponent,
    Provider7Component,
    Provider8Component,
    Provider9Component,
    Provider10Component,
    ProvidersComponent,
  ],
  exports: [ ProvidersComponent ]
 })
 export class ProvidersModule {}
