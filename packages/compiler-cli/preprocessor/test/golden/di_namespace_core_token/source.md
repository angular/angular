# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["test.ts"]
}
```

# /test.ts
```ts
import * as ng from "@angular/core";
import { Component } from "@angular/core";

@Component({
  selector: "my-component",
  template: "<div></div>",
  standalone: true,
})
export class MyComponent {
  constructor(
    public el: ng.ElementRef,
    public vcr: ng.ViewContainerRef,
    public cdr: ng.ChangeDetectorRef,
  ) {}
}
```
