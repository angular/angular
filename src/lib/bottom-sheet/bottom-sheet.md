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
import {MAT_BOTTOM_SHEET_DATA} from '@angular/material';

@Component({
  selector: 'hobbit-sheet',
  template: 'passed in {{ data.names }}',
})
export class HobbitSheet {
  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: any) { }
}
```

### Configuring bottom sheet content via `entryComponents`

Similarly to `MatDialog`, `MatBottomSheet` instantiates components at run-time. In order for it to
work, the Angular compiler needs extra information to create the necessary `ComponentFactory` for
your bottom sheet content component.

Any components that are include inside of a bottom sheet have to be added to the `entryComponents`
inside your `NgModule`.


```ts
@NgModule({
  imports: [
    // ...
    MatBottomSheetModule
  ],

  declarations: [
    AppComponent,
    ExampleBottomSheetComponent
  ],

  entryComponents: [
    ExampleBottomSheetComponent
  ],

  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
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
By default, the bottom sheet has `role="dialog"` on the root element and can be labelled using the
`ariaLabel` property on the `MatBottomSheetConfig`.

When a bottom sheet is opened, it will move focus to the first focusable element that it can find.
In order to prevent users from tabbing into elements in the background, the Material bottom sheet
uses a [focus trap](https://material.angular.io/cdk/a11y/overview#focustrap) to contain focus
within itself. Once a bottom sheet is closed, it will return focus to the element that was focused
before it was opened.

#### Focus management
By default, the first tabbable element within the bottom sheet will receive focus upon open.
This can be configured by setting the `cdkFocusInitial` attribute on another focusable element.

#### Keyboard interaction
By default pressing the escape key will close the bottom sheet. While this behavior can
be turned off via the `disableClose` option, users should generally avoid doing so
as it breaks the expected interaction pattern for screen-reader users.
