# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "files": ["test.ts"]
}
```

# /test.ts
```ts
import { Component, Inject, Injectable, Optional, Self, SkipSelf, Host, Attribute, InjectionToken } from '@angular/core';

export const TOKEN = 'TOKEN';
export const INJECTED_TOKEN = new InjectionToken<string>('INJECTED_TOKEN');

@Injectable()
export class Service {}

export const Namespace = {
  Token: 'NamespaceToken'
};

@Component({
  selector: 'app-test',
  template: '',
  standalone: true,
})
export class TestComponent {
  constructor(
    @Inject(TOKEN) public token: string,
    @Inject('literal-token') public literalToken: string,
    @Inject(Namespace.Token) public namespaceToken: string,
    @Inject(INJECTED_TOKEN) public injectedToken: string,
    @Optional() public optional: Service,
    @Self() public self: Service,
    @SkipSelf() public skipSelf: Service,
    @Host() public host: Service,
    @Attribute('attr') public attr: string,
    @Optional() @Inject(TOKEN) public optionalToken: string,
    @Self() @Optional() public selfOptional: Service,
  ) {}
}
```
