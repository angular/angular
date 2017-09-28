`<mat-paginator>` provides navigation for paged information, typically used with a table.

<!-- example(paginator-overview) -->

### Basic use
Each paginator instance requires:
* The number of items per page (default set to 50)
* The total number of items being paged

The current page index defaults to 0, but can be explicitly set via pageIndex.

When the user interacts with the paginator, a `PageEvent` will be fired that can be used to update
any associated data view.

### Page size options
The paginator displays a dropdown of page sizes for the user to choose from. The options for this
dropdown can be set via `pageSizeOptions`

The current pageSize will always appear in the dropdown, even if it is not included in pageSizeOptions.

### Internationalization
The labels for the paginator can be customized by providing your own instance of `MatPaginatorIntl`.
This will allow you to change the following:
 1. The label for the length of each page.
 2. The range text displayed to the user.
 3. The tooltip messages on the navigation buttons.

### Accessibility
The `aria-label`s for next page and previous page buttons can be set in `MatPaginatorIntl`.
