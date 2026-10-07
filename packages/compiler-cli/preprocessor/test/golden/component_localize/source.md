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
  selector: 'localize-simple-cmp',
  template: `
    <div i18n>Hello World</div>
    <div i18n="site header|Header description@@customHeaderId">Welcome</div>
  `,
  standalone: true,
})
export class LocalizeSimpleCmp {}

@Component({
  selector: 'localize-interpolation-cmp',
  template: `
    <div i18n="greeting|Greeting to user@@greetUser">Hello, {{ name }}!</div>
    <div i18n>You have {{ count }} new notifications.</div>
  `,
  standalone: true,
})
export class LocalizeInterpolationCmp {
  name = 'Angular';
  count = 5;
}

@Component({
  selector: 'localize-attributes-cmp',
  template: `
    <input i18n-title="input tooltip|Description for tooltip@@inputTitleId" title="Username input" />
  `,
  standalone: true,
})
export class LocalizeAttributesCmp {}
```
