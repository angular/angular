import { ORIGIN_URL } from '../app/hero.service';
import { NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { ServerModule } from '@angular/platform-server';
import { AppComponent } from '../app/app.component';
import { AppModule } from '../app/app.module';

@NgModule({
  imports: [
    ServerModule,
    AppModule
  ],
  bootstrap: [
    AppComponent
  ],
  providers: [
    {provide: APP_BASE_HREF, useValue: '/'},
    {provide: ORIGIN_URL, useValue: 'http://localhost:3200/' }
	//   { provide: NgModuleFactoryLoader, useClass: ServerRouterLoader }
  ]
})
export class AppServerModule {
}
