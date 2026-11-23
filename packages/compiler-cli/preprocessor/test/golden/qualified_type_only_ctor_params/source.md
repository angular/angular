# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["test.ts"]
}
```

# /node_modules/angular/package.json
```json
{
  "name": "angular",
  "types": "index.d.ts"
}
```

# /node_modules/angular/index.d.ts
```ts
declare namespace angularMock {
  interface IQService {
    when(): void;
  }
}

declare const angularMock: {};

export = angularMock;
```

# /node_modules/thirdparty/package.json
```json
{
  "name": "thirdparty",
  "types": "index.d.ts"
}
```

# /node_modules/thirdparty/index.d.ts
```ts
export declare class RealService {
  ping(): void;
}
```

# /test.ts
```ts
import { Injectable, Inject, Component, Attribute, OnInit } from '@angular/core';
import * as angular from 'angular';
import * as core from '@angular/core';
import * as tp from 'thirdparty';

export class LocalService {}

@Injectable({providedIn: 'root'})
export class TestService {
  constructor(
    @Inject('$q') private readonly $q: angular.IQService,
    private readonly rawQ: angular.IQService,
  ) {}
}

@Component({
  selector: 'app-hybrid',
  template: '<div></div>',
})
export class HybridComponent {
  constructor(
    @Attribute('name') private readonly attrName: string,
    @Attribute('cls') private readonly attrCls: LocalService,
    private readonly readonlyMap: ReadonlyMap<string, any>,
    private readonly ngZone: core.NgZone,
    private readonly hook: core.OnInit,
    private readonly namedHook: OnInit,
    private readonly optionalLocal: LocalService | undefined,
    private readonly nullableLocal: LocalService | null,
  ) {}
}

// `tp.RealService` is a real class, but single-file analysis cannot see that through a package
// namespace import, so standard mode emits the metadata type under a `@ts-ignore`. Optimize mode
// reads the package's `.d.ts`, proves it is a value, and drops the guard.
@Injectable({providedIn: 'root'})
export class ThirdPartyService {
  constructor(private readonly real: tp.RealService) {}
}
```
