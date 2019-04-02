import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {ServerModule} from '@angular/platform-server';
import {KitchenSinkModule} from './kitchen-sink/kitchen-sink';

@Component({
  selector: 'kitchen-sink-root',
  template: `
    <h1>Kitchen sink app</h1>
    <kitchen-sink></kitchen-sink>
  `,
})
export class KitchenSinkRoot {
}

@NgModule({
  imports: [BrowserModule.withServerTransition({appId: 'kitchen-sink'}), KitchenSinkModule],
  declarations: [KitchenSinkRoot],
  exports: [KitchenSinkRoot],
  bootstrap: [KitchenSinkRoot],
})
export class KitchenSinkRootModule {
}

@NgModule({
  imports: [KitchenSinkRootModule, ServerModule],
  bootstrap: [KitchenSinkRoot],
})
export class KitchenSinkRootServerModule {
}
