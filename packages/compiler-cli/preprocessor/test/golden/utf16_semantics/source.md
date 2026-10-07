# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "es2022",
    "moduleResolution": "bundler",
    "experimentalDecorators": true,
    "skipLibCheck": true
  },
  "files": ["utf16-semantics.ts"]
}
```

# /utf16-semantics.ts
```typescript
// José is here 😊
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div>José & 😊</div>
  `,
  standalone: true,
})
export class Utf16Component {
  // "José" has 'é' (2 bytes, 1 char)
  // "😊" is 4 bytes, 2 chars (surrogates)
  @Input() 
  jose: string = 'José';

  @Input('aliased😊')
  aliased: string;
}
```
