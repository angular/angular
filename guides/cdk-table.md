The `<cdk-table>` is an unopinionated, customizable data-table with a fully-templated API, dynamic
columns, and an accessible DOM structure. This component acts as the core upon which anyone can
build their own tailored data-table experience.

The table provides a foundation upon which other features, such as sorting and pagination, can be
built. Because it enforces no opinions on these matters, developers have full control over the
interaction patterns associated with the table.

For a Material Design styled table, see the
[documentation for `<mat-table>`](https://material.angular.io/components/table) which builds on
top of the CDK data-table.

<!-- example(cdk-table-basic) -->

### Using the CDK data-table

#### Writing your table template

The first step to writing the data-table template is to define the columns.
A column definition is specified via an `<ng-container>` with the `cdkColumnDef` directive, giving
the column a name. Each column definition then further defines both a header-cell template
(`cdkHeaderCellDef`) and a data-cell template (`cdkCellDef`).

```html
<ng-container cdkColumnDef="username">
  <cdk-header-cell *cdkHeaderCellDef> User name </cdk-header-cell>
  <cdk-cell *cdkCellDef="let row"> {{row.a}} </cdk-cell>
</ng-container>
```

The set of columns defined represent the columns that are _available_ to be rendered. The specific
columns rendered in a given row, and their order, are specified on the row (see below).

Note that `cdkCellDef` exports the row context such that the row data can be referenced in the cell
template. The directive also exports the same properties as `ngFor` (index, even, odd, first,
last).

The next step is to define the table's header-row (`cdkHeaderRowDef`) and data-row (`cdkRowDef`).

```html
<cdk-header-row *cdkHeaderRowDef="['username', 'age', 'title']"></cdk-header-row>
<cdk-row *cdkRowDef="let row; columns: ['username', 'age', 'title']"></cdk-row>
```

These row templates accept the specific columns to be rendered via the name given to the
`cdkColumnDef`.

The `cdkRowDef` also exports row context, which can be used for event and property
bindings on the row element. Any content placed _inside_ of the header row or data row template
will be ignored, as the rendered content of the row comes from the cell templates described
above.

##### Example: table with three columns

```html
<cdk-table [dataSource]="dataSource">
  <!-- User name Definition -->
  <ng-container cdkColumnDef="username">
    <cdk-header-cell *cdkHeaderCellDef> User name </cdk-header-cell>
    <cdk-cell *cdkCellDef="let row"> {{row.username}} </cdk-cell>
  </ng-container>

  <!-- Age Definition -->
  <ng-container cdkColumnDef="age">
    <cdk-header-cell *cdkHeaderCellDef> Age </cdk-header-cell>
    <cdk-cell *cdkCellDef="let row"> {{row.age}} </cdk-cell>
  </ng-container>

  <!-- Title Definition -->
  <ng-container cdkColumnDef="title">
    <cdk-header-cell *cdkHeaderCellDef> Title </cdk-header-cell>
    <cdk-cell *cdkCellDef="let row"> {{row.title}} </cdk-cell>
  </ng-container>

  <!-- Header and Row Declarations -->
  <cdk-header-row *cdkHeaderRowDef="['username', 'age', 'title']"></cdk-header-row>
  <cdk-row *cdkRowDef="let row; columns: ['username', 'age', 'title']"></cdk-row>
</cdk-table>
```

The columns given on the row determine which cells are rendered and in which order. Thus, the
columns can be set via binding to support dynamically changing the columns shown at run-time.

```html
<cdk-row *cdkRowDef="let row; columns: myDisplayedColumns"></cdk-row>
```

It is not required to display all the columns that are defined within the template,
nor use the same ordering. For example, to display the table with only `age`
and `username` and in that order, then the row and header definitions would be written as:

```html
<cdk-row *cdkRowDef="let row; columns: ['age', 'username']"></cdk-row>
```

Event and property bindings can be added directly to the row element.

##### Example: table with event and class binding
```html
<cdk-header-row *cdkHeaderRowDef="['age', 'username']"
                (click)="handleHeaderRowClick(row)">
</cdk-header-row>

<cdk-row *cdkRowDef="let row; columns: ['age', 'username']"
          [class.can-vote]="row.age >= 18"
          (click)="handleRowClick(row)">
</cdk-row>
```

##### Styling columns

Each header and row cell will be provided a CSS class that includes its column. For example,
cells that are displayed in the column `name` will be given the class `cdk-column-name`. This allows
columns to be given styles that will match across the header and rows.

Since columns can be given any string for its name, its possible that it cannot be directly applied
to the CSS class (e.g. `*nameColumn!`). In these cases, the special characters will be replaced by 
the `-` character. For example, cells container in a column named `*nameColumn!` will be given
the class `cdk-column--nameColumn-`.    

#### Connecting the table to a data source

Data is provided to the table through a `DataSource`. When the table receives a data source,
it calls the DataSource's `connect()` method which returns an observable that emits an array of data.
Whenever the data source emits data to this stream, the table will render an update.

Because the _data source_ provides this stream, it bears the responsibility of triggering table
updates. This can be based on _anything_: websocket connections, user interaction, model updates,
time-based intervals, etc. Most commonly, updates will be triggered by user interactions like
sorting and pagination.

##### `trackBy`

To improve performance, a `trackBy` function can be provided to the table similar to Angular’s
[`ngFor` `trackBy`](https://angular.io/api/common/NgForOf#change-propagation). This informs the
table how to uniquely identify rows to track how the data changes with each update.

```html
<cdk-table [dataSource]="dataSource" [trackBy]="myTrackById">
```
