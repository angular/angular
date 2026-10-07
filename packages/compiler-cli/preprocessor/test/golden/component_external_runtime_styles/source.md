# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node"
  },
  "angularCompilerOptions": {
    "externalRuntimeStyles": true
  },
  "files": ["app.component.ts"]
}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';

// With the `externalRuntimeStyles` compiler option, file-based styleUrls are NOT inlined.
// Instead the resolved resource URLs are emitted via `ɵɵExternalStylesFeature([...])` so a
// dev server can serve them on-demand, and the styleUrls are stripped from `ɵsetClassMetadata`.
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./style-a.css', './style-b.css'],
  standalone: true,
})
export class AppComponent {}
```

# /app.component.html
```html
<div>Hello</div>
```

# /style-a.css
```css
.a { color: blue; }
```

# /style-b.css
```css
.b { color: green; }
```
