The `mat-table` provides a Material Design styled data-table that can be used to display rows of
data.

This table builds on the foundation of the CDK data-table and uses a similar interface for its
data input and template, except that its element and attribute selectors will be prefixed
with `mat-` instead of `cdk-`. For more information on the interface and a detailed look at how
the table is implemented, see the
[guide covering the CDK data-table](https://material.angular.io/guide/cdk-table).

### Getting Started

<!-- example(table-basic) -->

#### 1. Write your mat-table and provide data

Begin by adding the `<table mat-table>` component to your template and passing in data.

The simplest way to provide data to the table is by passing a data array to the table's `dataSource`
input. The table will take the array and render a row for each object in the data array.

```html
<table mat-table [dataSource]="myDataArray">
  ...
</table>
```

Since the table optimizes for performance, it will not automatically check for changes to the data
array. Instead, when objects are added, removed, or moved on the data array, you can trigger an
update to the table's rendered rows by calling its `renderRows()` method.

While an array is the _simplest_ way to bind data into the data source, it is also
the most limited. For more complex applications, using a `DataSource` instance
is recommended. See the section "Advanced data sources" below for more information.

#### 2. Define the column templates

Next, write your table's column templates.

Each column definition should be given a unique name and contain the content for its header and row
cells.

Here's a simple column definition with the name `'score'`. The header cell contains the text
"Score" and each row cell will render the `score` property of each row's data.

```html
<ng-container matColumnDef="score">
  <th mat-header-cell *matHeaderCellDef> Score </th>
  <td mat-cell *matCellDef="let user"> {{user.score}} </td>
</ng-container>
```

Note that the cell templates are not restricted to only showing simple string values, but are
flexible and allow you to provide any template.

If your column is only responsible for rendering a single string value for the header and cells,
you can instead define your column using the `mat-text-column`. The following column definition is
equivalent to the one above.

```html
<mat-text-column name="score"></mat-text-column>
```

Check out the API docs and examples of the `mat-text-column` to see how you can customize the header
text, text alignment, and cell data accessor.  Note that this is not compatible with the flex-layout
table. Also, a data accessor should be provided if your data may have its properties minified
since the string name will no longer match after minification.

#### 3. Define the row templates

Finally, once you have defined your columns, you need to tell the table which columns will be
rendered in the header and data rows.

To start, create a variable in your component that contains the list of the columns you want to
render.

```ts
columnsToDisplay = ['userName', 'age'];
```

Then add `mat-header-row` and `mat-row` to the content of your `mat-table` and provide your
column list as inputs.

```html
<tr mat-header-row *matHeaderRowDef="columnsToDisplay"></tr>
<tr mat-row *matRowDef="let myRowData; columns: columnsToDisplay"></tr>
```

Note that this list of columns provided to the rows can be in any order, not necessarily the order in
which you wrote the column definitions. Also, you do not necessarily have to include every column
that was defined in your template.

This means that by changing your column list provided to the rows, you can easily re-order and
include/exclude columns dynamically.

### Advanced data sources

The simplest way to provide data to your table is by passing a data array. More complex use-cases
may benefit from a more flexible approach involving an Observable stream or by encapsulating your
data source logic into a `DataSource` class.

#### Observable stream of data arrays

An alternative approach to providing data to the table is by passing an Observable stream that emits
the data array to be rendered each time it is changed. The table will listen to this stream and
automatically trigger an update to the rows each time a new data array is emitted.

#### DataSource

For most real-world applications, providing the table a `DataSource` instance will be the best way to
manage data. The `DataSource` is meant to serve as a place to encapsulate any sorting, filtering,
pagination, and data retrieval logic specific to the application.

A `DataSource` is simply a class that has at a minimum the following methods: `connect` and
`disconnect`. The `connect` method will be called by the table to provide an `Observable` that emits
the data array that should be rendered. The table will call `disconnect` when the table is destroyed,
which may be the right time to clean up any subscriptions that may have been registered in the
`connect` method.

Although Angular Material provides a ready-made table `DataSource` class, `MatTableDataSource`, you may
want to create your own custom `DataSource` class for more complex use cases. This can be done by
extending the abstract `DataSource` class with a custom `DataSource` class that then implements the
`connect` and `disconnect` methods. For use cases where the custom `DataSource` must also inherit
functionality by extending a different base class, the `DataSource` base class can be
implemented instead (`MyCustomDataSource extends SomeOtherBaseClass implements DataSource`) to
respect Typescript's restriction to only implement one base class.

### Styling Columns

Each table cell has an automatically generated class based on which column it appears in. The format for this
generated class is `mat-column-NAME`. For example, cells in a column named "symbol" can be targeted with the
selector `.mat-column-symbol`.

<!-- example(table-column-styling) -->

### Row Templates

Event handlers and property binding on the row templates will be applied to each row rendered by the table. For example,
adding a `(click)` handler to the row template will cause each individual row to call the handler when clicked.

<!-- example(table-row-binding) -->

### Features

The `MatTable` is focused on a single responsibility: efficiently render rows of data in a
performant and accessible way.

You'll notice that the table itself doesn't come out of the box with a lot of features, but expects
that the table will be included in a composition of components that fills out its features.

For example, you can add sorting and pagination to the table by using MatSort and MatPaginator and
mutating the data provided to the table according to their outputs.

To simplify the use case of having a table that can sort, paginate, and filter an array of data,
the Angular Material library comes with a `MatTableDataSource` that has already implemented
the logic of determining what rows should be rendered according to the current table state. To add
these feature to the table, check out their respective sections below.

#### Pagination

To paginate the table's data, add a `<mat-paginator>` after the table.

If you are using the `MatTableDataSource` for your table's data source, simply provide the
`MatPaginator` to your data source. It will automatically listen for page changes made by the user
and send the right paged data to the table.

Otherwise if you are implementing the logic to paginate your data, you will want to listen to the
paginator's `(page)` output and pass the right slice of data to your table.

For more information on using and configuring the `<mat-paginator>`, check out the
[mat-paginator docs](https://material.angular.io/components/legacy-paginator/overview).

The `MatPaginator` is one provided solution to paginating your table's data, but it is not the only
option. In fact, the table can work with any custom pagination UI or strategy since the `MatTable`
and its interface is not tied to any one specific implementation.

<!-- example(table-pagination) -->

#### Sorting

To add sorting behavior to the table, add the `matSort` directive to the table and add
`mat-sort-header` to each column header cell that should trigger sorting. Note that you have to import `MatSortModule` in order to initialize the `matSort` directive (see [API docs](https://material.angular.io/components/sort/api)).

```html
<!-- Name Column -->
<ng-container matColumnDef="position">
  <th mat-header-cell *matHeaderCellDef mat-sort-header> Name </th>
  <td mat-cell *matCellDef="let element"> {{element.position}} </td>
</ng-container>
```

If you are using the `MatTableDataSource` for your table's data source, provide the `MatSort`
directive to the data source and it will automatically listen for sorting changes and change the
order of data rendered by the table.

By default, the `MatTableDataSource` sorts with the assumption that the sorted column's name
matches the data property name that the column displays. For example, the following column
definition is named `position`, which matches the name of the property displayed in the row cell.

Note that if the data properties do not match the column names, or if a more complex data property
accessor is required, then a custom `sortingDataAccessor` function can be set to override the
default data accessor on the `MatTableDataSource`.

If you are not using the `MatTableDataSource`, but instead implementing custom logic to sort your
data, listen to the sort's `(matSortChange)` event and re-order your data according to the sort state.
If you are providing a data array directly to the table, don't forget to call `renderRows()` on the
table, since it will not automatically check the array for changes.

<!-- example(table-sorting) -->

For more information on using and configuring the sorting behavior, check out the
[matSort docs](https://material.angular.io/components/sort/overview).

The `MatSort` is one provided solution to sorting your table's data, but it is not the only option.
In fact, the table can work with any custom sorting UI or strategy since the `MatTable` and
its interface is not tied to any one specific implementation.

#### Filtering

Angular Material does not provide a specific component to be used for filtering the `MatTable`
since there is no single common approach to adding a filter UI to table data.

A general strategy is to add an input where users can type in a filter string and listen to this
input to change what data is offered from the data source to the table.

If you are using the `MatTableDataSource`, simply provide the filter string to the
`MatTableDataSource`. The data source will reduce each row data to a serialized form and will filter
out the row if it does not contain the filter string. By default, the row data reducing function
will concatenate all the object values and convert them to lowercase.

For example, the data object `{id: 123, name: 'Mr. Smith', favoriteColor: 'blue'}` will be reduced
to `123mr. smithblue`. If your filter string was `blue` then it would be considered a match because
it is contained in the reduced string, and the row would be displayed in the table.

To override the default filtering behavior, a custom `filterPredicate` function can be set which
takes a data object and filter string and returns true if the data object is considered a match.

If you want to show a message when not data matches the filter, you can use the `*matNoDataRow`
directive.

<!--- example(table-filtering) -->

#### Selection

Right now there is no formal support for adding a selection UI to the table, but Angular Material
does offer the right components and pieces to set this up. The following steps are one solution but
it is not the only way to incorporate row selection in your table.

##### 1. Add a selection model

Get started by setting up a `SelectionModel` from `@angular/cdk/collections` that will maintain the
selection state.

```js
const initialSelection = [];
const allowMultiSelect = true;
this.selection = new SelectionModel<MyDataType>(allowMultiSelect, initialSelection);
```

##### 2. Define a selection column

Add a column definition for displaying the row checkboxes, including a main toggle checkbox for
the header. The column name should be added to the list of displayed columns provided to the
header and data row.

```html
<ng-container matColumnDef="select">
  <th mat-header-cell *matHeaderCellDef>
    <mat-checkbox (change)="$event ? toggleAllRows() : null"
                  [checked]="selection.hasValue() && isAllSelected()"
                  [indeterminate]="selection.hasValue() && !isAllSelected()">
    </mat-checkbox>
  </th>
  <td mat-cell *matCellDef="let row">
    <mat-checkbox (click)="$event.stopPropagation()"
                  (change)="$event ? selection.toggle(row) : null"
                  [checked]="selection.isSelected(row)">
    </mat-checkbox>
  </td>
</ng-container>
```

##### 3. Add event handling logic

Implement the behavior in your component's logic to handle the header's main toggle and checking
if all rows are selected.

```js
/** Whether the number of selected elements matches the total number of rows. */
isAllSelected() {
  const numSelected = this.selection.selected.length;
  const numRows = this.dataSource.data.length;
  return numSelected == numRows;
}

/** Selects all rows if they are not all selected; otherwise clear selection. */
toggleAllRows() {
  this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
}
```

##### 4. Include overflow styling

Finally, adjust the styling for the select column so that its overflow is not hidden. This allows
the ripple effect to extend beyond the cell.

```css
.mat-column-select {
  overflow: initial;
}
```

<!--- example(table-selection) -->

#### Footer row

A footer row can be added to the table by adding a footer row definition to the table and adding
footer cell templates to column definitions. The footer row will be rendered after the rendered
data rows.

```html
<ng-container matColumnDef="cost">
  <th mat-header-cell *matHeaderCellDef> Cost </th>
  <td mat-cell *matCellDef="let data"> {{data.cost}} </td>
  <td mat-footer-cell *matFooterCellDef> {{totalCost}} </td>
</ng-container>

...

<tr mat-header-row *matHeaderRowDef="columnsToDisplay"></tr>
<tr mat-row *matRowDef="let myRowData; columns: columnsToDisplay"></tr>
<tr mat-footer-row *matFooterRowDef="columnsToDisplay"></tr>
```

<!--- example(table-footer-row) -->

#### Sticky Rows and Columns

By using `position: sticky` styling, the table's rows and columns can be fixed so that they do not
leave the viewport even when scrolled. The table provides inputs that will automatically apply the
correct CSS styling so that the rows and columns become sticky.

In order to fix the header row to the top of the scrolling viewport containing the table, you can
add a `sticky` input to the `matHeaderRowDef`.

<!--- example(table-sticky-header) -->

Similarly, this can also be applied to the table's footer row. Note that if you are using the native
`<table>` and using Safari, then the footer will only stick if `sticky` is applied to all the
rendered footer rows.

<!--- example(table-sticky-footer) -->

It is also possible to fix cell columns to the start or end of the horizontally scrolling viewport.
To do this, add the `sticky` or `stickyEnd` directive to the `ng-container` column definition.

<!--- example(table-sticky-columns) -->

Note that on Safari mobile when using the flex-based table, a cell stuck in more than one direction
will struggle to stay in the correct position as you scroll. For example, if a header row is stuck
to the top and the first column is stuck, then the top-left-most cell will appear jittery as you
scroll.

Also, sticky positioning in Edge will appear shaky for special cases. For example, if the scrolling
container has a complex box shadow and has sibling elements, the stuck cells will appear jittery.
There is currently an [open issue with Edge](https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/17514118/)
to resolve this.


#### Multiple row templates

When using the `multiTemplateDataRows` directive to support multiple rows for each data object, the context of `*matRowDef` is the same except that the `index` value is replaced by `dataIndex` and `renderIndex`.

### Accessibility

By default, `MatTable` applies `role="table"`, assuming the table's contains primarily static
content. You can change the role by explicitly setting `role="grid"` or `role="treegrid"` on the
table element. While changing the role will update child element roles, such as changing
`role="cell"` to `role="gridcell"`, this does _not_ apply additional keyboard input handling or
focus management to the table.

Always provide an accessible label for your tables via `aria-label` or `aria-labelledby` on the
table element.

### Tables with `display: flex`

The `MatTable` does not require that you use a native HTML table. Instead, you can use an
alternative approach that uses `display: flex` for the table's styles.

This alternative approach replaces the native table element tags with the `MatTable` directive
selectors. For example, `<table mat-table>` becomes `<mat-table>`; `<tr mat-row>` becomes
`<mat-row>`. The following shows a previous example using this alternative template:

```html
<mat-table [dataSource]="dataSource">
  <!-- User name Definition -->
  <ng-container matColumnDef="username">
    <mat-header-cell *matHeaderCellDef> User name </mat-header-cell>
    <mat-cell *matCellDef="let row"> {{row.username}} </mat-cell>
  </ng-container>

  <!-- Age Definition -->
  <ng-container matColumnDef="age">
    <mat-header-cell *matHeaderCellDef> Age </mat-header-cell>
    <mat-cell *matCellDef="let row"> {{row.age}} </mat-cell>
  </ng-container>

  <!-- Title Definition -->
  <ng-container matColumnDef="title">
    <mat-header-cell *matHeaderCellDef> Title </mat-header-cell>
    <mat-cell *matCellDef="let row"> {{row.title}} </mat-cell>
  </ng-container>

  <!-- Header and Row Declarations -->
  <mat-header-row *matHeaderRowDef="['username', 'age', 'title']"></mat-header-row>
  <mat-row *matRowDef="let row; columns: ['username', 'age', 'title']"></mat-row>
</mat-table>
```

Note that this approach means you cannot include certain native-table features such colspan/rowspan
or have columns that resize themselves based on their content.

### Tables with `MatRipple`

By default, `MatTable` does not set up Material Design ripples for rows. A ripple effect can be
added to table rows by using the `MatRipple` directive from `@angular/material/core`. Due to
limitations in browsers, ripples cannot be applied native `th` or `tr` elements. The recommended
approach for setting up ripples is using the non-native `display: flex` variant of `MatTable`.

<!--- example(table-with-ripples) -->

More details about ripples on native table rows and their limitations can be found [in this issue](https://github.com/angular/components/issues/11883#issuecomment-634942981).

