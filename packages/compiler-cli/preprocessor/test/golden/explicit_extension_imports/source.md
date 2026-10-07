# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.ts"]
}
```

# /types.ts
```typescript
export interface MyService {
    doSomething(): void;
}
```

# /app.ts
```typescript
import {Component, Injectable} from '@angular/core';
import {MyService} from './types.ts'; // Explicit extension

@Injectable()
export class TestService {
    constructor(private myService: MyService) {}
}

@Component({
  selector: 'test-component',
  standalone: true,
  template: `<div></div>`,
})
export class TestComponent {
  constructor(private myService: MyService) {}
}
```
