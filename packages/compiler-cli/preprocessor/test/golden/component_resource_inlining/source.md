# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node"
  },
  "files": ["app.component.ts"]
}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';

// Decorator styleUrls (multiple, collapsed) + template `<link>`/`<style>`: the inlined
// `ɵsetClassMetadata` styles array must include every style source in cascade order
// (decorator styleUrls, template <link>, decorator inline styles, template <style>).
@Component({
  selector: 'styled-cmp',
  templateUrl: './styled.html',
  styleUrls: ['./styled.css', './styled-extra.css'],
  styles: ['.from-inline { color: orange; }'],
  standalone: true,
})
export class StyledComponent {}

// Empty `styleUrls: []`: resource stripping must still fire (the property is present),
// dropping `styleUrls` from `ɵsetClassMetadata` just like the reference's
// `transformDecoratorResources`, which keys off property presence rather than content.
@Component({
  selector: 'empty-styleurls-cmp',
  template: '<div>Hello</div>',
  styleUrls: [],
  standalone: true,
})
export class EmptyStyleUrlsComponent {}
```

# /styled.html
```html
<link rel="stylesheet" href="./styled-link.css" />
<style>.from-template-style { color: purple; }</style>
<div>Hello</div>
```

# /styled.css
```css
.from-style-urls { color: blue; }
```

# /styled-extra.css
```css
.from-style-urls-extra { color: green; }
```

# /styled-link.css
```css
.from-template-link { color: red; }
```
