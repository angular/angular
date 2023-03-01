## RouterLinkWithHref migration

Since Angular v15, the `RouterLink` contains the logic of the `RouterLinkWithHref` directive and now developers can always import and use the `RouterLink` directive when they need to add a `[routerLink]` in templates. This migration finds all imports and usages of the `RouterLinkWithHref` class and rewrites them to `RouterLink` instead.

#### Before
```ts
import { RouterLinkWithHref } from '@angular/router';

@Component({
  standalone: true,
  template: `<a [routerLink]="'/abc'">`,
  imports: [RouterLinkWithHref]
})
export class MyComponent {
  @ViewChild(RouterLinkWithHref) aLink!: RouterLinkWithHref;
}
```

#### After
```ts
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  template: `<a [routerLink]="'/abc'">`,
  imports: [RouterLink]
})
export class MyComponent {
  @ViewChild(RouterLink) aLink!: RouterLink;
}
```
