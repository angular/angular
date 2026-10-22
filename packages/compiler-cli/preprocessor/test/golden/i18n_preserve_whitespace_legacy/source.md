# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": true,
    "i18nPreserveWhitespaceForLegacyExtraction": false
  },
  "files": ["app.ts"]
}
```

# /app.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'app-comp',
  template: '<div i18n>   hello   <span>world</span>   </div>',
})
export class AppComp {}
```
