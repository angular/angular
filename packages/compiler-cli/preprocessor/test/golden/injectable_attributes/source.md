# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["service.ts"]
}
```

# /service.ts
```ts
import {Injectable, forwardRef} from '@angular/core';

class SomeClass {}

@Injectable({
  providedIn: 'root',
  useClass: forwardRef(() => SomeClass)
})
export class InjectableWithUseClass {}

@Injectable({
  useExisting: forwardRef(() => SomeClass)
})
export class InjectableWithUseExisting {}

@Injectable({
  useFactory: () => new SomeClass()
})
export class InjectableWithUseFactory {}

@Injectable({
  useValue: { api: 'test' }
})
export class InjectableWithUseValue {}

@Injectable({
  useValue: { api: 'value_wins' },
  useExisting: forwardRef(() => SomeClass),
  useClass: forwardRef(() => SomeClass),
  useFactory: () => new SomeClass()
})
export class PrecedenceUseValue {}

@Injectable({
  useExisting: forwardRef(() => SomeClass),
  useClass: forwardRef(() => SomeClass),
  useFactory: () => new SomeClass()
})
export class PrecedenceUseExisting {}

@Injectable({
  useClass: forwardRef(() => SomeClass),
  useFactory: () => new SomeClass()
})
export class PrecedenceUseClass {}
```
