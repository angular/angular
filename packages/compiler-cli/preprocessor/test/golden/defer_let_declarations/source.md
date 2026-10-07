# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts", "deferred.cmp.ts", "test.pipe.ts"]
}
```

# /deferred.cmp.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-deferred',
  template: 'Deferred content',
  standalone: true
})
export class DeferredComponent {}
```

# /test.pipe.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'testPipe',
  standalone: true
})
export class TestPipe implements PipeTransform {
  transform(value: string): string {
    return value + ' piped';
  }
}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { DeferredComponent } from './deferred.cmp';
import { TestPipe } from './test.pipe';

@Component({
  selector: 'app-root',
  template: `
    @defer {
      @let pipedValue = data | testPipe;
      <app-deferred/>
      <span>{{ pipedValue }}</span>
    } @placeholder {
      Placeholder
    }
  `,
  standalone: true,
  imports: [DeferredComponent, TestPipe]
})
export class AppComponent {
  data = 'hello';
}
```
