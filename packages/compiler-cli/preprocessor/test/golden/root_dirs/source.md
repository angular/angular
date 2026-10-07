# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "rootDirs": ["src", "extra"]
  },
  "files": ["src/app/app.component.ts"]
}
```

# /src/app/app.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.styles.css',
  standalone: true,
})
export class AppComponent {}
```

# /extra/app/app.component.html
```html
<div>Hello from extra rootDir!</div>
```

# /extra/app/app.styles.css
```
div { color: red }
```