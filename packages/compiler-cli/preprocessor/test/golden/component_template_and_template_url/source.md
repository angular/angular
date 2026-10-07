# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.ts"]
}
```

# /app.ng.html
```html
<div>External Template Content</div>
```

# /app.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-comp',
  template: '',
  templateUrl: './app.ng.html',
  standalone: true,
})
export class AppComp {}
```
