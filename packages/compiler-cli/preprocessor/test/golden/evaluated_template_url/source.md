# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app/header.component.ts", "app/footer.component.ts"]
}
```

# /lib/paths.d.ts
```ts
export declare const HEADER_TEMPLATE_URL = "./header_templates/default_header.html";
export declare const HEADER_STYLE_URLS: ["./header.css"];
```

# /shared/footer_paths.ts
```ts
export const FOOTER_TEMPLATE_URL = './footer.html';
export const FOOTER_TEMPLATE_INDEX = 1;
```

# /app/header_templates/default_header.html
```html
<header>default header</header>
```

# /app/header.css
```css
header { color: red; }
```

# /app/footer.html
```html
<footer>footer</footer>
```

# /app/header.component.ts
```ts
import { Component } from '@angular/core';
import { HEADER_TEMPLATE_URL, HEADER_STYLE_URLS } from '../lib/paths';

@Component({
  selector: 'app-header',
  templateUrl: HEADER_TEMPLATE_URL,
  styleUrls: HEADER_STYLE_URLS,
})
export class HeaderComponent {}
```

# /app/footer.component.ts
```ts
import { Component } from '@angular/core';
import { FOOTER_TEMPLATE_URL, FOOTER_TEMPLATE_INDEX } from '../shared/footer_paths';

@Component({
  selector: 'app-footer',
  templateUrl: FOOTER_TEMPLATE_URL,
})
export class FooterComponent {}

@Component({
  selector: 'app-bad-footer',
  templateUrl: FOOTER_TEMPLATE_INDEX,
})
export class BadFooterComponent {}
```
