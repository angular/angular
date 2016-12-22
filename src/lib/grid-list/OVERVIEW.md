`md-grid-list` is a two-dimensional list view that arranges cells into grid-based layout. 
See Material Design spec [here](https://www.google.com/design/spec/components/grid-lists.html).

<!-- example(grid-list-overview) -->

### Setting the number of columns

An `md-grid-list` must specify a `cols` attribute which sets the number of columns in the gird. The
number of rows will be automatically determined based on the number of columns and the number of
items.

### Setting the row height

The height of the rows in a grid list can be set via the `rowHeight` attribute. Row height for the
list can be calculated in three ways:
                                                                                
1. **Fixed height**: The height can be in `px`, `em`, or `rem`.  If no units are specified, `px` 
units are assumed (e.g. `100px`, `5em`, `250`).
        
2. **Ratio**: This ratio is column-width:row-height, and must be passed in with a colon, not a
decimal (e.g. `4:3`).
        
3. **Fit**:  Setting `rowHeight` to `fit` This mode automatically divides the available height by
the number of rows.  Please note the height of the grid-list or its container must be set.  

If `rowHeight` is not specified, it defaults to a `1:1` ratio of width:height. 

### Setting the gutter size

The gutter size can be set to any `px`, `em`, or `rem` value with the `gutterSize` property.  If no 
units are specified, `px` units are assumed. By default the gutter size is `1px`.

### Adding tiles that span multiple rows or columns

It is possible to set the rowspan and colspan of each `md-grid-tile` individually, using the
`rowspan` and `colspan` properties. If not set, they both default to `1`. The `colspan` must not
exceed the number of `cols` in the `md-grid-list`. There is no such restriction on the `rowspan`
however, more rows will simply be added for it the tile to fill.

### Tile headers and footers

A header and footer can be added to an `md-grid-tile` using the `md-grid-tile-header` and
`md-grid-tile-footer` elements respectively.
