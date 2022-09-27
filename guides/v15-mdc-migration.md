# Migrating to MDC-based Angular Material Components

In Angular Material v15, many of the components have been refactored to be based on the official
[Material Design Components for Web (MDC)](https://github.com/material-components/material-components-web).
The components from the following imports have been refactored:

| Import path                        | Summary of changes                                   |
|------------------------------------|------------------------------------------------------|
| @angular/material/autocomplete     | Style changes only                                   |
| @angular/material/button           | Style changes, API changes                           |
| @angular/material/card             | Style changes only                                   |
| @angular/material/checkbox         | Style changes, changes to event behavior             |
| @angular/material/chips            | Complete rewrite                                     |
| @angular/material/core             | Style changes only                                   |
| @angular/material/dialog           | Style changes, changes to change detection behavior  |
| @angular/material/form-field       | Style changes, some appearances removed, API changes |
| @angular/material/input            | Style changes only                                   |
| @angular/material/list             | Style changes, API changes                           |
| @angular/material/menu             | Style changes, API changes                           |
| @angular/material/paginator        | Style changes only                                   |
| @angular/material/progress-bar     | Style changes only                                   |
| @angular/material/progress-spinner | Style changes only                                   |
| @angular/material/radio            | Style changes only                                   |
| @angular/material/select           | Style changes only                                   |
| @angular/material/slide-toggle     | Style changes only                                   |
| @angular/material/slider           | Complete rewrite                                     |
| @angular/material/snack-bar        | Style changes, API changes                           |
| @angular/material/table            | Style changes only                                   |
| @angular/material/tabs             | Style changes, API changes                           |
| @angular/material/tooltip          | Style changes only                                   |

The refactored components offer several benefits over the old implementations, including:
* Improved accessibility
* Better adherence to the Material Design spec
* Faster adoption of future versions of the Material Design spec, due to being based on common
  infrastructure

## What has changed?

The new components have different internal DOM and CSS styles. However, most of the TypeScript APIs
and component/directive selectors for the new components have been kept as close as possible to the
old implementation. This makes it straightforward to migrate your application and get it running
with the new components.

Due to the new DOM and CSS, you will likely find that some styles in your application need to be
adjusted, particularly if your CSS is overriding styles on internal elements on any of the migrated
components.

There are a few components with larger changes to their APIs that were necessary in order to
integrate with MDC. These components include:
* form-field
* chips
* slider
* list

See below for a [comprehensive list of changes](#comprehensive-list-of-changes) for all components.

The old implementation of each new component is now deprecated, but still available from a "legacy"
import. For example, you can import the old `mat-button` implementation can be used by importing the
legacy button module.

```ts
import {MatLegacyButtonModule} from '@angular/material/legacy-button';
```

## How to Migrate

You can start your migration by running Angular Material's automated refactoring tool. This tool,
implemented as an [Angular Schematic](https://angular.io/guide/schematics), updates the majority
your code to the new component versions. While some follow-up is necessary, you can reduce the
manual effort by following these best practices:

You can reduce the amount of manual effort needed by ensuring that your application follows good
practices before migrating.
* Avoid overriding styles on internal Angular Material elements in your CSS as much as possible. If
  you find yourself frequently overriding styles on internal elements, consider using a component
  that is designed for more style customization, such as the ones available in the
  [Angular CDK](/cdk).
* Use [component harnesses](/guide/using-component-harnesses) to interact with Angular Material
  components in tests rather than inspecting internal elements, properties, or methods of the
  component. Using component harnesses makes your tests easier to understand and more robust to
  changes in Angular Material

### 1. Update to Angular Material v15

Angular Material includes a schematic to help migrate applications to use the new MDC-based
components. To get started, upgrade your application to Angular Material 15.

```shell
ng update @angular/material^15
```

As part of this update, a schematic will run to automatically move your application to use the
"legacy" imports containing the old component implementations. This provides a quick path to getting
your application running on v15 with minimal manual changes.

### 2. Run the migration tool

After upgrading to v15, you can run the migration tool to switch from the legacy component
implementations to the new MDC-based ones.

```shell
ng generate # TODO(wagnermaciel): Insert command here.
```

This command updates your TypeScript, styles, and templates to the new implementations, updating as
much as it can automatically.

#### Running a Partial Migration

Depending on the size and complexity of your application, you may want to migrate a single component
(or small group of components) at a time, rather than all at once.
TODO(wagnermaciel): Add details on this: script params, which components need to move together

You may also want to migrate your app one module at a time instead of all together. You can use both
the old implementation and new implementation in the same application, as long as they aren't used
in the same `NgModule`. TODO(wagnermaciel): Add detail on this: script params.

### 3. Check for TODOs left by the migration tool.

In situations where the migration tool is not able to automatically update your code, it will
attempt to add comments for a human to follow up. These TODO comments follow a common format, so
they can be easily identified.

```ts
// TODO(wagnermaciel): Do we have a common format for all TODOs the script adds?
```

To search for all comments left by the migration tool, search for `TODO(...):` in your IDE.

TODO(amysorto): Can we have the schematic generate a CSV of TODOs that can be imported into Jira

### 4. Verify Your Application

After running the migration and addressing the TODOs, manually verify that everything is working
correctly.

Run your tests and confirm that they pass. It's possible that your tests depended on internal DOM or
async timing details of the old component implementations and may need to be updated. If you find
you need to update some tests, consider using [component harnesses](./using-component-harnesses) to
make the tests more robust.

Run your application and verify that the new components look right. Due to the changes in internal
DOM and CSS of the components, you may need to tweak some of your application's styles.

## Comprehensive List of Changes

### Library-wide Changes

* Component size, color, spacing, shadows, and animations all change slightly across the board.
  These changes generally improve spec-compliance and accessibility.

* CSS classes applied to components use the `mat-mdc` prefix, whereas before it was simply a `mat`
  prefix. Elements that roughly correspond to element in the old implementation have been given the
  same class name (aside from the prefix). For example, the button’s host class is `mat-mdc-button`
  instead of `mat-button`. However, not all elements in the previous implementation have an
  equivalent element in the new implementation.

### Core Styles & Theming

* `mat.core()` no longer includes component typography styles. If your application was relying on
  this, you may need to add typography styles explicitly now. This can be done all at once:

  ```scss
  @import '@angular/material' as mat;

  @include mat.all-component-typographies();
  ```

  or individually for components your application uses:

  ```scss
  @import '@angular/material' as mat;

  @include mat.button-typography();
  @include mat.card-typography();
  // ...
  ```

* Default typography levels defined by `mat.define-typography-config` have been updated to reflect
  changes to the Material Design spec.

* All components now have themeable density. Styles for the default density level (0) will be
  included by default when you include a theme mixin.

  ```scss
  @import '@angular/material' as mat;

  $theme: mat.define-light-theme((
    color: ...
  ));

  // Adds density level 0 styles
  @include mat.all-component-themes($theme);
  ```

  If you prefer a different default density level, you can set it in your theme config:

  ```scss
  $theme: mat.define-light-theme((
    color: ...,
    density: -1
  ));
  ```

TODO(mmalerba): link to density docs once they exist.

### Autocomplete

* Long options now wrap instead of truncating.

* Option heights are no longer capped at `48px`.

* Option list now has an `8px` top and bottom padding.

* Options list now has an animation when opening and closing.

### Button

* Accessibility: Icon buttons are now 48px instead of 40px.

* Accessibility: Buttons have a slightly different hover/focus/active colors, improving contrast
  ratios.

* Flat buttons have a different padding than raised buttons (this is apparent if you manually apply
  a background color to flat buttons).

* Unthemed icon buttons may not show correctly on components such as snack-bars, since the container
  does not match the expected application theme background.

* Overriding button colors may require additional selectors. Application authors should always
  prefer changing component colors via the supported theme API.

* Outline buttons use a colored border instead of grey.

* Icons in the button content will automatically be placed before the button text, unless the icon
  has the `iconPositionEnd` attribute.

* FABs have extra attributes: `appearance` and `lowered`.

* FABs default to an outline appearance instead of fill.

* The button's theming mixins have been split into separate mixins for buttons
  (`mat.mdc-button-theme`), icon buttons (`mat.mdc-icon-button-theme`), and FABs
  (`mat.mdc-fab-theme`).

* Icons next to button text now match font-size. Buttons with only icons and no text will not align
  properly (this does not apply to the icon-button).

### Card

* By default, mat-card does not apply any internal padding. Instead, this padding is defined on the
  card content areas: `<mat-card-content>`, `<mat-card-header>`, and `<mat-card-actions>`.

* `<mat-card-content>` no longer sets any typography styles, users are free to add whatever
  typography styles make sense for their application, either to `<mat-card-content>` itself or any
  child elements as appropriate.

### Checkbox

* Clicks on the checkbox now trigger directly on the native checkbox element rather than a shim div.
  Native checkboxes have bizarre behavior when calling `preventDefault` on their `click` event, so
  users should not call `preventDefault` on `click`.

* Accessibility: Checkbox touch targets are larger, now 40px instead of 16px, which is more
  accessible.

* Checkbox color may be changed to white or black due to a change in heuristics based on the
  application’s theme. Previously, the check’s color would be set to the theme’s background color.
  With MDC, it is determined by whether white or black has the most contrast against the primary
  color.

* Accessibility: Focus state is slightly darker, improving contrast ratio

* Many checkboxes on the page may cause the animation to seem slow

* Text styles will not be inherited; you will need to specifically target the checkbox’s `label`.

* After toggling a checkbox with the mouse, the ripple will remain visible instead of animating out.

### Chips

* The chips component has been split into multiple variants corresponding with more appropriate
  interaction patterns for accessibility. The original `mat-chip-list` used `role="listbox"`, but
  this interaction pattern is not suited for all use-cases. The new chips have:

  * `<mat-chip-listbox>` with `<mat-chip-option>` - this is the closest to the previous interaction
    pattern. This is the only variant that supports selection state for chips. This pattern aligns
    with the filter chips pattern specified in the Material Design spec. This pattern should be used
    when you want the user to select one or more values from a list of options.

  * `<mat-chip-grid>` with `<mat-chip-row>` - this pattern should be used for any text input + chips
    interaction.

  * `<mat-chip-set>` with `<mat-chip>` - this variant has no accessibility pattern and assumes one
    will be applied at the application level. This allows the application to implement a custom
    accessibility pattern with the chips visuals.

* The migration tool always changes the legacy `<mat-chip-list>` to `<mat-chip-listbox>` to minimize
  differences before and after. You should separately consider changing to `<mat-chip-grid>` on a
  case-by-case basis.

### Dialog

* The `.mat-dialog-container` does not contain a 24px padding anymore. Instead, the inner dialog
  directives are responsible for adding the right padding. This will be apparent if your dialog does
  not use any of the directives like `mat-dialog-content`.

* `mat-dialog-content` uses the font-settings specified by the Material Design spec, which includes
  a rather roomy line-height. If you have an information-dense dialog that doesn't look good with
  these settings, you can avoid using `<mat-dialog-content>` and just use a div with custom padding,
  or use custom typography settings that can be applied with the `mat.mdc-dialog-typography` mixin.

* The old dialog triggered an extra change detection, which may have masked change detection issues
  in your application that need to be fixed when migrating.

### Form Field

* The "legacy" and "standard" form-field appearance settings no longer exist, as these have been
  dropped from the Material Design spec.

* The removed "legacy" appearance promoted input placeholders to the floating label if the label was
  not specified. All newer appearance settings require explicitly specifying a `<mat-label>` if one
  was not provided before. This change addresses an accessibility best practice of not using labels
  and placeholders interchangeably.

* By default, MatFormField still reserves exactly one line of space below the field for hint or
  error text. However, there is a new option `@Input() subscriptSizing: 'fixed'|'dynamic'`. When
  this setting is set to `fixed` (default), the form-field reserves enough space in the layout to
  show one line of hint or error text. When set to `dynamic`, the form-field expands and contracts
  the amount of space it takes in the layout to fit the error / hint that is currently shown.

* The text inside `<mat-hint>` is larger and darker in order to meet W3C text guidelines.

* While the previous form-field had a single directive for prefixes (`matPrefix`) and a single
  directive for suffixes (`matSuffix`), the MDC-based form-field distinguishes between text
  prefix/suffixes which are baseline aligned with the input text, and icon prefix/suffixes which are
  center aligned in the form-field. Use `matTextPrefix` or `matTextSuffix` to indicate a text
  prefix/suffix, and `matIconPrefix` or `matIconSuffix` to indicate an icon prefix/suffix. The old
  `matSuffix` and `matPrefix` APIs will behave like icons, though they are now deprecated.

* The `floatLabel` input no longer accepts `'never'`. `floatLabel="never"` was only supported by the
  legacy form-field appearance which has been dropped. It was used to achieve a floating label that
  behaved like a placeholder. If you need this behavior, use the `placeholder` property on `<input>`
  instead.

### Input

* MatInput must be inside `<mat-form-field>`. Previously it was (unintentionally) possible to use an
  `<input matInput>` without the form field if the page loaded form field styles elsewhere.

* The MDC-based MatInput hides the native calendar picker indicator associated with
  `<input matInput type="date">`, if you want this indicator to appear for your inputs, use the
  following styles:

    ```scss
    .mat-mdc-input-element::-webkit-calendar-picker-indicator {
      display: block;
    }
    ```

### List

* The API has been reworked to support text wrapping and better integration with the Material Design
  specification.

* Previously, list items were commonly created using multiple `span` elements with the `matLine`
  directive applied. Each `span` resulting in a line, and the first one becoming the primary line.
  With the new API, the `matLine` directive has been split into two more granular and meaningful
  directives:
  * `matListItemTitle`
  * `matListItemLine`

* Text outside of a `matListItemLine` (so-called "unscoped content") will result in an additional
  line being acquired (as if the content was put into a line).

  ```html
  <mat-list-item>
    <span matListItemTitle>Title</span>
    Second line
  </mat-list-item>
  ```

* The amount of lines is automatically inferred. e.g. in the snippet above the list item will
  acquire space for two lines. With the new API you can now set an explicit number of lines on the
  `<mat-list-item>` to activate wrapping.

  ```html
  <mat-list-item lines="3">
    <span matListItemTitle>Title</span>
    This text will wrap into the third line. Space for three lines is acquired by the
    list item.
  </mat-list-item>
  ```

  Note that text inside a `matListItemTitle` or `matListItemLine` will never wrap. Only unscoped
  content will wrap/take up the remaining space based on explicit number of lines provided.

* Aside from the differences in how lines are composed, some other directives have been renamed to
  use more explicit naming:
  * `matListIcon` is now `matListItemIcon`
  * `matListAvatar` is now `matListItemAvatar`

* Lastly, also a new directive (`matListItemMeta`) is available to put content into the meta section
  of a list item (usually the end of the list item). Previously unscoped content in a list item was
  put into the meta section.

* Recommended migration steps for common use of a list item:
  1. Change the first `matLine` to `matListItemTitle`
  2. Change all other `matLine`'s to `matListItemLine`
  3. Change all `matListIcon` to `matListItemIcon`
  4. Change all `matListAvatar` to `matListItemAvatar`
  5. Wrap all unscoped content (content outside a `matLine`) in a `matListItemMeta` container.

### Menu

* The icon for a menu item appears before the text, regardless of the order in the DOM.

  * If you have a piece of content such as an `<img>` that you want to use in place of a
    `<mat-icon>` use `ngProjectAs="mat-icon"` to project it into the icon slot.

  * If you need your icon to appear at the end of the item (not officially supported by the spec)
    you can wrap both the text and your icon in a span, e.g.

    ```html
    <span>
      <span>Text</span>
      <mat-icon>end_icon</mat-icon>
    </span>
    ```

* The text in menu items wrap instead of being hidden with an ellipses.

### Option / Optgroup

* Long options now wrap instead of truncating with an ellipsis.

### Paginator

* The form-field inside of `mat-paginator` only supports the `appearance` options offered by the new
  form-field (`fill` and `outline`).

### Progress Bar

* Hiding the bar with `visibility: hidden` will not hide all internal elements because they apply
  a `visibility: visible` style. Instead, style it with `opacity: 0` or `display: none`, or remove
  it completely with `ngIf`.

* Height is always set to 4px and does not get shorter or taller using `height` styles.

### Progress Spinner

* Host element is no longer `display: block` which may affect layout. To fix layout issues add
  `display: block` back to the element.

### Radio

* Radio-button labels are no longer `width: 100%`. This helps prevent users from accidentally
  selecting a radio when clicking on whitespace that appears inert on the page.

### Select

* `MatSelect` no longer aligns the selected option in the dropdown menu with the trigger text.

* Long options now wrap instead of truncating.

* Option heights are no longer capped at `48px`.

* Option list now has an `8px` top and bottom padding.

* Option list animation has changed.

* Previously the dropdown menu width could be wider than the parent form-field, but now the dropdown
  is the same width as the form-field

### Slide Toggle

* Accessibility: MDC-based version uses `<button role="switch">` to represent the toggle rather than
  `<input type="checkbox">`

* Accessibility: The touch target is much larger than the slide toggle; to match the legacy size,
  you can provide a `-5` density to the slide toggle’s theme mixin:

  ```scss
  @use '@angular/material' as mat;

  @include mat.slide-toggle-theme(
    map-merge($theme, (density: -5))
  );
  ```

* The label is closer to the enabled toggle

### Slider

* Accessibility: sliders now work with mobile device screen readers.

* To accommodate range sliders, the implementation has changed from the `<mat-slider>` element being
  the form control to the `<mat-slider>` element containing 1-2 `<input>` elements (the slider
  "thumbs") that act as the form control(s). The value, associated events (`input`, `change`), and
  labels (`aria-label`) now live on the `<input>` elements instead.

* Vertical sliders and inverted sliders are no longer supported, as they are no longer part of the
  Material Design spec. TODO(jelbourn): should we add a note that vertical sliders are likely to
  return in a future version?

* Range sliders are now supported. TODO(wagnermaciel): add more about this.

### Snack Bar

* For simple, text-based snack-bars, there are no significant changes.

* For simple snack-bars with an action button, they use the MDC-based mat-button, so your
  application will need to include the Sass theming mixin for the MDC-based button

* For snack-bars that use custom structured content (i.e. calls to `MatSnackBar.openFromComponent`
  and `MatSnackBar.openFromTemplate`), you should use the following new directives to annotate your
  content:
  * `matSnackBarLabel` to mark the text displayed to users
  * `matSnackBarActions` to mark the element containing the action buttons
  * `matSnackBarAction` to mark individual action buttons
  * If you do not specify any of these directives, it will treat the entire custom component /
    template as text.

* Tests that open a snack-bar now require calling `flush()` before attempting to access the content
  of the snackbar. Updating your tests to use [component harnesses](./using-component-harnesses)
  before running the migration tool should make this transition seamless.

### Table

* Every cell has `16px` left and right padding. Previously only a `24px` padding applied to the
  leftmost and rightmost cells.

* Header text size and color matches the data rows.

* Text will not wrap by default; to enable text wrapping, apply the `white-space: normal` style to
  the table cell.

* Row height is `52px` instead of `48px`.

* Cells have box-sizing `border-box` instead of `content-box`. This may affect custom width styles.

* The paginator property of the `MatTableDataSource` has a generic interface that matches most of
  the paginator API. You may need to explicitly type the paginator to access the full API, e.g.
  `new MatTableDataSource<MyData, MatPaginator>();`

* MDC-based flex tables (`<mat-table>`) display borders on their cells instead of the rows.

* The last row of the table no longer has a bottom border since the table is assumed to be
  surrounded by a border.

* Flex table row height is set using `height` instead of `min-height`.

### Tabs

* Accessibility: `MatTabNav` now throws an error if the `[tabPanel]` input is not provided. The
  `[tabPanel]` input and associated `mat-tab-nav-panel` component improve accessibility.
  TODO(crisbeto): This point needs further elaboration.

* The selected tab label now uses a text color from the theme, matching the selection indicator.

* Tab header labels default to stretching the width of the container. This can be turned off by
  providing `mat-stretch-tabs="false"`.

### Tooltip

* Accessibility: the background color is now completely opaque, preventing text bleed-through.

* The default font-size has changed from `10px` to `12px`.

* The line height has changed from `normal` to `16px`.

* Text overflow has changed from `ellipsis` to `clip`.

* The tooltip now has a min-width of 40px.

* The text alignment for single line tooltips is now `center` and changes to `left` for multiline
  tooltips.
