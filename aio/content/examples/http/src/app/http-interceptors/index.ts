// #docplaster
// #docregion interceptor-providers
/* "Barrel" of Http Interceptors */
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// #enddocregion interceptor-providers
import { AuthInterceptor } from './auth-interceptor';
import { CachingInterceptor } from './caching-interceptor';
import { CustomJsonInterceptor , CustomJsonParser, JsonParser} from './custom-json-interceptor';
import { EnsureHttpsInterceptor } from './ensure-https-interceptor';
import { LoggingInterceptor } from './logging-interceptor';
// #docregion interceptor-providers
import { NoopInterceptor } from './noop-interceptor';
// #enddocregion interceptor-providers
import { TrimNameInterceptor } from './trim-name-interceptor';
import { UploadInterceptor } from './upload-interceptor';
import { RetryInterceptor } from './retry-interceptor';
// #docregion interceptor-providers

/** Http interceptor providers in outside-in order */
export const httpInterceptorProviders = [
  // #docregion noop-provider
  { provide: HTTP_INTERCEPTORS, useClass: NoopInterceptor, multi: true },
  // #enddocregion noop-provider, interceptor-providers
  // #docregion custom-json-interceptor
  { provide: HTTP_INTERCEPTORS, useClass: CustomJsonInterceptor, multi: true },
  { provide: JsonParser, useClass: CustomJsonParser },
  // #enddocregion custom-json-interceptor

  { provide: HTTP_INTERCEPTORS, useClass: EnsureHttpsInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: TrimNameInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: UploadInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: CachingInterceptor, multi: true },

  // #docregion interceptor-providers
];
// #enddocregion interceptor-providers
