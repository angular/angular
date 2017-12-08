The `mat-table` provides a Material Design styled data-table that can be used to display rows of 
data. 

The table's template consists of two parts: column definitions and row definitions. Each column 
definition contains templates for that column's header and content cells. Each row definition 
captures the columns used for that row and any bindings applied to the row element.

A `DataSource` provides data to the table by emitting an `Observable` stream of the items to be 
rendered. Each emit includes the _entire set of items_ that should be displayed. The table, 
listening to this stream, will render a row per item. Any manipulation of the data being displayed 
(e.g. sorting, pagination, filtering) should be captured by the `DataSource`, ultimately emitting 
a new set of items to reflect any changes.

This table builds on the foundation of the CDK data-table and uses a similar interface for its 
data source input and template, except that its element and attribute selectors will be prefixed 
with `mat-` instead of `cdk-`. For detailed information on the interface and how it works, see the 
[guide covering the CDK data-table](https://material.angular.io/guide/cdk-table).

### Getting Started

<!-- example(table-basic) -->

#### 1. Define the table's columns

Start by writing your table's column definitions. Each column definition should be given a unique 
name and contain the content for its header and row cells.

Here's a simple column definition with the name `'userName'`. The header cell contains the text 
"Name" and each row cell will render the `name` property of each row's data.

```html
<ng-container matColumnDef="userName">
  <mat-header-cell *matHeaderCellDef> Name </mat-header-cell>
  <mat-cell *matCellDef="let user"> {{user.name}} </mat-cell>
</ng-container>
```

#### 2. Define the table's rows

After defining your columns, provide the header and data row templates that will be rendered out by 
the table. Each row needs to be given a list of the columns that it should contain. The order of 
the names will define the order of the cells rendered. It is not required to provide a list of all 
the defined column names, but only the ones that you want to have rendered.

```html
<mat-header-row *matHeaderRowDef="['userName', 'age']"></mat-header-row>
<mat-row *matRowDef="let myRowData; columns: ['userName', 'age']"></mat-row>
```

#### 3. Provide data

The column and row definitions now capture _how_ data will render - all that's left is to provide 
the data itself. For simple scenarios with client-side operations, `MatTableDataSource` offers a 
quick and easy starting point. Simply create an instance of `MatTableDataSource` and set the items 
to be displayed to the `data` property. For more advanced scenarios, applications will implement 
one or more custom `DataSource` to capture more specific behaviors.

```ts
this.myDataSource = new MatTableDataSource();
this.myDataSource.data = dataToRender;
```

```html
<mat-table [dataSource]=”myDataSource”>
  ...
</mat-table>
```

### Features

#### Pagination

To paginate the table's data, add a `<mat-paginator>` after the `<mat-table>` and provide the 
`MatPaginator` to the `MatTableDataSource`. The data source will automatically listen for page 
changes made by the user and send the right paged data to the table.

For more information on using and configuring the `<mat-paginator>`, check out the 
[mat-paginator docs](https://material.angular.io/components/paginator/overview).

The `MatPaginator` is one provided solution to paginating your table's data, but it is not the only 
option. In fact, the table can work with any custom pagination UI or strategy since the `MatTable` and `DataSource` interface is not tied to any one specific implementation.

<!-- example(table-pagination) -->

#### Sorting

To add sorting behavior to the table, add the `matSort` directive to the `<mat-table>` and add 
`mat-sort-header` to each column header cell that should trigger sorting. Provide the `MatSort` directive to the `MatTableDataSource` and it will automatically listen for sorting changes and change the order of data rendered by the table.

By default, the `MatTableDataSource` sorts with the assumption that the sorted column's name 
matches the data property name that the column displays. For example, the following column definition is named `position`, which matches the name of the property displayed in the row cell.

```html
<!-- Name Column -->
<ng-container matColumnDef="position">
  <mat-header-cell *matHeaderCellDef mat-sort-header> Name </mat-header-cell>
  <mat-cell *matCellDef="let element"> {{element.position}} </mat-cell>
</ng-container>
```

If the data properties do not match the column names, or if a more complex data property accessor 
is required, then a custom `sortingDataAccessor` function can be set to override the default data accessor on the `MatTableDataSource`.

<!-- example(table-sorting) -->

For more information on using and configuring the sorting behavior, check out the 
[matSort docs](https://material.angular.io/components/sort/overview).

The `MatSort` is one provided solution to sorting your table's data, but it is not the only option. 
In fact, the table can work with any custom pagination UI or strategy since the `MatTable` and `DataSource` interface is not tied to any one specific implementation.

#### Filtering

Angular Material does not provide a specific component to be used for filtering the `MatTable` 
since there is no single common approach to adding a filter UI to table data.

A general strategy is to add an input where users can type in a filter string and listen to this 
input to change what data is offered from the data source to the table. 

If you are using the `MatTableDataSource`, simply provide the filter string to the 
`MatTableDataSource`. The data source will reduce each row data to a serialized form and will filter out the row if it does not contain the filter string. By default, the row data reducing function will concatenate all the object values and convert them to lowercase.

For example, the data object `{id: 123, name: 'Mr. Smith', favoriteColor: 'blue'}` will be reduced 
to `123mr. smithblue`. If your filter string was `blue` then it would be considered a match because it is contained in the reduced string, and the row would be displayed in the table.

To override the default filtering behavior, a custom `filterPredicate` function can be set which 
takes a data object and filter string and returns true if the data object is considered a match.

<!--- example(table-filtering) -->

#### Selection

Right now there is no formal support for adding a selection UI to the table, but Angular Material 
does offer the right components and pieces to set this up. The following steps are one solution but it is not the only way to incorporate row selection in your table.

##### 1. Add a selection model

Get started by setting up a `SelectionModel` from `@angular/cdk/collections` that will maintain the 
selection state.

```js
const initialSelection = [];
const allowMultiSelect = true;
this.selection = new SelectionModel<MyDataType>(allowMultiSelect, initialSelection);
```

##### 2. Define a selection column

Add a column definition for displaying the row checkboxes, including a master toggle checkbox for 
the header. The column name should be added to the list of displayed columns provided to the `<mat-header-row>` and `<mat-row>`.

```html
<ng-container matColumnDef="select">
  <mat-header-cell *matHeaderCellDef>
    <mat-checkbox (change)="$event ? masterToggle() : null"
                  [checked]="selection.hasValue() && isAllSelected()"
                  [indeterminate]="selection.hasValue() && !isAllSelected()">
    </mat-checkbox>
  </mat-header-cell>
  <mat-cell *matCellDef="let row">
    <mat-checkbox (click)="$event.stopPropagation()"
                  (change)="$event ? selection.toggle(row) : null"
                  [checked]="selection.isSelected(row)">
    </mat-checkbox>
  </mat-cell>
</ng-container>
```

##### 3. Add event handling logic

Implement the behavior in your component's logic to handle the header's master toggle and checking 
if all rows are selected.

```js
/** Whether the number of selected elements matches the total number of rows. */
isAllSelected() {
  const numSelected = this.selection.selected.length;
  const numRows = this.dataSource.data.length;
  return numSelected == numRows;
}

/** Selects all rows if they are not all selected; otherwise clear selection. */
masterToggle() {
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

### Accessibility
Tables without text or labels should be given a meaningful label via `aria-label` or 
`aria-labelledby`. The `aria-readonly` defaults to `true` if it's not set.

Table's default role is `grid`, and it can be changed to `treegrid` through `role` attribute.

`mat-table` does not manage any focus/keyboard interaction on its own. Users can add desired 
focus/keyboard interactions in their application.
