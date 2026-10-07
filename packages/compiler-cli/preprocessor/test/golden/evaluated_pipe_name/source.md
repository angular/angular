# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.ts"]
}
```

# /names.ts
```ts
export const PIPE_NAME = 'shout';
export const PREFIX = 'wh';
```

# /pipes.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';
import { PIPE_NAME, PREFIX } from './names';

// The name comes from an imported constant: ngtsc's partial evaluator follows the import.
@Pipe({ name: PIPE_NAME })
export class ShoutPipe implements PipeTransform {
  transform(value: string): string {
    return value.toUpperCase();
  }
}

// An expression over an imported constant folds as well.
@Pipe({ name: PREFIX + 'isper' })
export class WhisperPipe implements PipeTransform {
  transform(value: string): string {
    return value.toLowerCase();
  }
}
```

# /app.ts
```ts
import { Component } from '@angular/core';
import { ShoutPipe, WhisperPipe } from './pipes';

@Component({
  selector: 'app-root',
  template: '{{ greeting | shout }} {{ greeting | whisper }}',
  imports: [ShoutPipe, WhisperPipe],
})
export class App {
  greeting = 'hello';
}
```
