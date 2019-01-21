import {HelloWorldComponent} from './hello-world.component';
import {NgModule} from '@angular/core';

@NgModule({
  declarations: [HelloWorldComponent],
  exports: [HelloWorldComponent],
})
export class HelloWorldModule {}
