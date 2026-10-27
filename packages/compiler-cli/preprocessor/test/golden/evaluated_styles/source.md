# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["styled.ts"]
}
```

# /styles.ts
```ts
export const SHARED_STYLES = ['.shared { color: red; }'];
export const HOST_STYLE = ':host { display: block; }';
export const PANEL_URL = './panel.css';
export const THEME_URLS = ['./theme.css', './panel.css'];
```

# /panel.css
```css
.panel { padding: 4px; }
```

# /theme.css
```css
.theme { color: green; }
```

# /styled.ts
```ts
import { Component } from '@angular/core';
import { HOST_STYLE, PANEL_URL, SHARED_STYLES, THEME_URLS } from './styles';

const LOCAL_STYLES = ['.local { color: blue; }'];
const LOCAL_URLS = ['./theme.css'];

// A spread of a constant from this file: ngtsc's evaluator flattens it.
@Component({
  selector: 'local-spread',
  template: '<div class="local">local</div>',
  styles: [...LOCAL_STYLES, '.extra { margin: 0; }'],
})
export class LocalSpread {}

// The whole array from another file.
@Component({
  selector: 'imported-array',
  template: '<div class="shared">shared</div>',
  styles: SHARED_STYLES,
})
export class ImportedArray {}

// An imported string next to a spread of an imported array.
@Component({
  selector: 'imported-mixed',
  template: '<div class="shared">mixed</div>',
  styles: [HOST_STYLE, ...SHARED_STYLES],
})
export class ImportedMixed {}

// A single stylesheet URL held in an imported constant.
@Component({
  selector: 'imported-style-url',
  template: '<div class="panel">panel</div>',
  styleUrl: PANEL_URL,
})
export class ImportedStyleUrl {}

// `styleUrls` given as a whole imported array.
@Component({
  selector: 'imported-style-urls',
  template: '<div class="theme">theme</div>',
  styleUrls: THEME_URLS,
})
export class ImportedStyleUrls {}

// `styleUrls` mixing a spread of a local constant and an imported element.
@Component({
  selector: 'mixed-style-urls',
  template: '<div class="theme panel">both</div>',
  styleUrls: [...LOCAL_URLS, PANEL_URL],
})
export class MixedStyleUrls {}
```
