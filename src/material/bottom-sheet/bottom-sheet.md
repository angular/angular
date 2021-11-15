The `MatBottomSheet` service can be used to open Material Design panels to the bottom of the screen.
These panels are intended primarily as an interaction on mobile devices where they can be used as an
alternative to dialogs and menus.

<!-- example(bottom-sheet-overview) -->

You can open a bottom sheet by calling the `open` method with a component to be loaded and an
optional config object. The `open` method will return an instance of `MatBottomSheetRef`:

```ts
const bottomSheetRef = bottomSheet.open(SocialShareComponent, {
  ariaLabel: 'Share on social media'
});
```

The `MatBottomSheetRef` is a reference to the currently-opened bottom sheet and can be used to close
it or to subscribe to events. Note that only one bottom sheet can be open at a time. Any component
contained inside of a bottom sheet can inject the `MatBottomSheetRef` as well.

```ts
bottomSheetRef.afterDismissed().subscribe(() => {
  console.log('Bottom sheet has been dismissed.');
});

bottomSheetRef.dismiss();
```

### Sharing data with the bottom sheet component.
If you want to pass in some data to the bottom sheet, you can do so using the `data` property:

```ts
const bottomSheetRef = bottomSheet.open(HobbitSheet, {
  data: { names: ['Frodo', 'Bilbo'] },
});
```

Afterwards you can access the injected data using the `MAT_BOTTOM_SHEET_DATA` injection token:

```ts
import {Component, Inject} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA} from '@angular/material/bottom-sheet';

@Component({
  selector: 'hobbit-sheet',
  template: 'passed in {{ data.names }}',
})
export class HobbitSheet {
  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: {names: string[]}) { }
}
```

### Specifying global configuration defaults
Default bottom sheet options can be specified by providing an instance of `MatBottomSheetConfig`
for `MAT_BOTTOM_SHEET_DEFAULT_OPTIONS` in your application's root module.

```ts
@NgModule({
  providers: [
    {provide: MAT_BOTTOM_SHEET_DEFAULT_OPTIONS, useValue: {hasBackdrop: false}}
  ]
})
```


### Accessibility

`MatBottomSheet` creates modal dialogs that implement the ARIA `role="dialog"` pattern. This root
dialog element should be given an accessible label via the `ariaLabel` property of
`MatBottomSheetConfig`.

#### Keyboard interaction
By default, the escape key closes `MatBottomSheet`. While you can disable this behavior by using
the `disableClose` property of `MatBottomSheetConfig`, doing this breaks the expected interaction
pattern for the ARIA `role="dialog"` pattern.

#### Focus management

When opened, `MatBottomSheet` traps browser focus such that it cannot escape the root
`role="dialog"` element. By default, the first tabbable element in the bottom sheet receives focus.
You can customize which element receives focus with the `autoFocus` property of
`MatBottomSheetConfig`, which supports the following values.

| Value            | Behavior                                                                 |
|------------------|--------------------------------------------------------------------------|
| `first-tabbable` | Focus the first tabbable element. This is the default setting.           |
| `first-header`   | Focus the first header element (`role="heading"`, `h1` through `h6`)     |
| `dialog`         | Focus the root `role="dialog"` element.                                  |
| Any CSS selector | Focus the first element matching the given selector.                     |

While the default setting applies the best behavior for most applications, special cases may benefit
from these alternatives. Always test your application to verify the behavior that works best for
your users.

#### Focus restoration

When closed, `MatBottomSheet` restores focus to the element that previously held focus when the
bottom sheet opened. However, if that previously focused element no longer exists, you must
add additional handling to return focus to an element that makes sense for the user's workflow.
Opening a bottom sheet from a menu is one common pattern that causes this situation. The menu
closes upon clicking an item, thus the focused menu item is no longer in the DOM when the bottom
sheet attempts to restore focus.

You can add handling for this situation with the `afterDismissed()` observable from
`MatBottomSheetRef`.

```typescript
const bottomSheetRef = bottomSheet.open(FileTypeChooser);
bottomSheetRef.afterDismissed().subscribe(() => {
  // Restore focus to an appropriate element for the user's workflow here.
});
```
