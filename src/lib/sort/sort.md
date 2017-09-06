The `mdSort` and `md-sort-header` are used, respectively, to add sorting state and display
to tabular data.

<!-- example(sort-overview) -->

### Adding sort to table headers

To add sorting behavior and styling to a set of table headers, add the `<md-sort-header>` component
to each header and provide an `id` that will identify it. These headers should be contained within a
parent element with the `mdSort` directive, which will emit an `mdSortChange` event when the user
 triggers sorting on the header.

Users can trigger the sort header through a mouse click or keyboard action. When this happens, the
`mdSort` will emit an `mdSortChange` event that contains the ID of the header triggered and the
direction to sort (`asc` or `desc`).

#### Changing the sort order

By default, a sort header starts its sorting at `asc` and then `desc`. Triggering the sort header
after `desc` will remove sorting.

To reverse the sort order for all headers, set the `mdSortStart` to `desc` on the `mdSort` 
directive. To reverse the order only for a specific header, set the `start` input only on the header 
instead.

To prevent the user from clearing the sort sort state from an already sorted column, set 
`mdSortDisableClear` to `true` on the `mdSort` to affect all headers, or set `disableClear` to 
`true` on a specific header.

#### Using sort with the md-table

When used on an `md-table` header, it is not required to set an `md-sort-header` id on because
by default it will use the id of the column.

<!-- example(table-sorting) -->

### Accessibility
The `aria-label` for the sort button can be set in `MdSortHeaderIntl`.
