# Rendering Data Rows

The table's primary responsibility is to render rows of cells. The types of rows that may be rendered are header,
footer, and data rows. This document focuses on how the table tries to efficienctly render the data rows.

## Background

Each table's template is defined as a set of row and column templates. The row template defines the template that should
be rendered for a header, footer, or data row. The column templates include the cell templates that will be inserted
into each rendered row.

Each data object may be rendered with one or more row templates. When new data in provided to the table, the table
determines which rows need to be rendered. In order to be efficient, the table attempts to understand how the new list
of rendered rows differs from the previous list of rendered rows so that it can re-use the current list of rendered rows
if possible.

## Rendering

Each time data is provided, the table needs to create the list of rows that will be rendered and keep track of which
data object will be provided as context for each row. For each item in the list, this pair is combined into an object
that uses the `RenderRow` interface. The interface also helps keep track of the data object's index in the provided
data array input.

```ts
export interface RenderRow<T> {
  data: T;
  dataIndex: number;
  rowDef: CdkRowDef<T>;
}
```

When possible, `RenderRow` objects are re-used from the previous rendering. That is, if a particular data object and row
template pairing was previously rendered, it should be used for the new list as well. This makes sure that the
differ can use check-by-reference logic to find the changes between two lists. Note that if a `RenderRow` object is
reused, it should be updated with the correct data index, in case it has moved since last used.

Once the list of `RenderRow` objects has been created, it should be compared to the previous list of `RenderRow`
objects to find the difference in terms of inserts/deletions/moves. This is trivially done using the `IterableDiffer`
logic provided by Angular Core.

Finally, the table uses the list of operations and manipulates the rows through add/remove/move operations.

## Caching `RenderRow` objects

Each `RenderRow` should be cached such that it is a constant-time lookup and retrieval based on the data object and
row template pairing.

In order to achieve this, the cache is built as a map of maps where the key of the outer map is the data object and
the key of the inner map is the row template. The value of the inner map should be an array of the matching cached
`RenderRow` objects that were previously rendered.

