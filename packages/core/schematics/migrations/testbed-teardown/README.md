## TestBed teardown behavior migration

In Angular version 13, the `teardown` flag in `TestBed` will be enabled by default. This migration
automatically opts out existing apps from the new teardown behavior. It works by looking through
the entire project for `initTestEnvironment` calls and adding the `teardown` flag to them.

If no `initTestEnvironment` calls were found, the migration will add the `teardown` flag to all
`configureTestingModule` and `withModule` calls instead.

#### Before
```ts
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
```

#### After
```ts
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
  teardown: { destroyAfterEach: false }
});
```
