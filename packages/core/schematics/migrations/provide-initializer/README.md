## Replace `APP_INITIALIZER`, `ENVIRONMENT_INITIALIZER`, and `PLATFORM_INITIALIZER` with provider functions

Replaces `APP_INITIALIZER`, `ENVIRONMENT_INITIALIZER`, and `PLATFORM_INITIALIZER` with their respective provider functions: `provideAppInitializer`, `provideEnvironmentInitializer`, and `providePlatformInitializer`.

#### Before

```ts
import {APP_INITIALIZER} from '@angular/core';

const providers = [
  {
    provide: APP_INITIALIZER,
    useValue: () => { console.log('hello'); },
    multi: true,
  }
];
```

#### After

```ts
import {provideAppInitializer} from '@angular/core';

const providers = [provideAppInitializer(() => { console.log('hello'); })];
```
