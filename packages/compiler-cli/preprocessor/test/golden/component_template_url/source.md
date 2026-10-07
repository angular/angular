# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts"]
}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
})
export class AppComponent {}
```

# /app.component.html
```html
<div>Hello from templateUrl</div>
```
