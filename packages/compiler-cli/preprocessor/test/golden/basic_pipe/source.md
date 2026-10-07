# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["upcase.pipe.ts", "generic.pipe.ts"]
}
```

# /upcase.pipe.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'upcase',
  pure: true,
  standalone: true,
})
export class UpcasePipe implements PipeTransform {
  transform(value: string): string {
    return value.toUpperCase();
  }
}
```

# /generic.pipe.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'generic',
  pure: true,
  standalone: true,
})
export class GenericPipe<T> implements PipeTransform {
  transform(value: T): T {
    return value;
  }
}
```

