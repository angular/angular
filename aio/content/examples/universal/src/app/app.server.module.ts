// #docplaster
// #docregion absolute-url-interceptor
import {HTTP_INTERCEPTORS} from '@angular/common/http';
// #enddocregion absolute-url-interceptor
import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

// #docregion absolute-url-interceptor
import {AbsoluteUrlInterceptor} from './absolute-url.interceptor';
// #enddocregion absolute-url-interceptor
import { AppModule } from './app.module';
import { AppComponent } from './app.component';

// #docplaster ...
// #docregion absolute-url-interceptor
@NgModule({
  // #enddocregion absolute-url-interceptor
  imports: [
    AppModule,
    ServerModule,
  ],
  // #docplaster
  // #docregion absolute-url-interceptor
  providers: [
    // Add server-only providers here.
    // #docplaster
    // #enddocregion absolute-url-interceptor
    //
    // NOTE:
    // This interceptor is not needed for this example app. It is only included here as an
    // illustration of how to include server-only providers to an app.
    // #docregion absolute-url-interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AbsoluteUrlInterceptor,
      multi: true,
    },
  ],
  // #enddocregion absolute-url-interceptor
  bootstrap: [AppComponent],
// #docplaster ...
// #docregion absolute-url-interceptor
})
export class AppServerModule {}
// #enddocregion absolute-url-interceptor
