import {NgModule} from '@angular/core';
import {Platform} from './platform';


@NgModule({
  providers: [Platform]
})
export class PlatformModule {}


export * from './platform';
export * from './features';
