The `matSort` and `mat-sort-header` are used, respectively, to add sorting state and display
to tabular data.

<!-- example(sort-overview) -->

### Adding sort to table headers

To add sorting behavior and styling to a set of table headers, add the `<mat-sort-header>` component
to each header and provide an `id` that will identify it. These headers should be contained within a
parent element with the `matSort` directive, which will emit a `matSortChange` event when the user
 triggers sorting on the header.

Users can trigger the sort header through a mouse click or keyboard action. When this happens, the
`matSort` will emit a `matSortChange` event that contains the ID of the header triggered and the
direction to sort (`asc` or `desc`).

#### Changing the sort order

By default, a sort header starts its sorting at `asc` and then `desc`. Triggering the sort header
after `desc` will remove sorting.

To reverse the sort order for all headers, set the `matSortStart` to `desc` on the `matSort`
directive. To reverse the order only for a specific header, set the `start` input only on the header
instead.

To prevent the user from clearing the sort state from an already sorted column, set
`matSortDisableClear` to `true` on the `matSort` to affect all headers, or set `disableClear` to
`true` on a specific header.

#### Disabling sorting

If you want to prevent the user from changing the sorting order of any column, you can use the
`matSortDisabled` binding on the `mat-sort`, or the `disabled` on a single `mat-sort-header`.

#### Using sort with the mat-table

When used on a `mat-table` header, it is not required to set a `mat-sort-header` id on because
by default it will use the id of the column.

<!-- example(table-sorting) -->

### Accessibility

When you apply `MatSortHeader` to a header cell element, the component wraps the content of the
header cell inside a button. The text content of the header cell then becomes the accessible
label for the sort button. However, the header cell text typically describes the column and does
not indicate that interacting with the control performs a sorting action. To clearly communicate
that the header performs sorting, always use the `sortActionDescription` input to provide a
description for the button element, such as "Sort by last name".

`MatSortHeader` applies the `aria-sort` attribute to communicate the active sort state to
assistive technology. However, most screen readers do not announce changes to the value of
`aria-sort`, meaning that screen reader users do not receive feedback that sorting occurred. To
remedy this, use the `matSortChange` event on the `MatSort` directive to announce state
updates with the `LiveAnnouncer` service from `@angular/cdk/a11y`.

If your application contains many tables and sort headers, consider creating a custom
directives to consistently apply `sortActionDescription` and announce sort state changes. 
