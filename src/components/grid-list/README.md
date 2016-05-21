# md-grid-list

`md-grid-list` is an alternative list view that arranges cells into grid-based layout. 
See Material Design spec [here](https://www.google.com/design/spec/components/grid-lists.html).

## Usage

### Simple grid list

To use `md-grid-list`, first import the grid list directives and add them to your component's directives 
array:

```javascript
@Component({
  ...
  directives: [MD_GRID_LIST_DIRECTIVES]
})
```

In your template, create an `md-grid-list` element and specify the number of columns you want for
your grid using the `cols` property (this is the only mandatory attribute). 

You can define each tile using an `md-grid-tile` element, passing any tile content between its tags.

Tiles are greedily placed in the first position of the grid that fits them, so row count depends on 
how many tiles can fit in each row, given the col count and the colspan/rowspan of each tile.

```html
<md-grid-list cols="4" [style.background]="'lightblue'">
   <md-grid-tile>One</md-grid-tile>
   <md-grid-tile>Two</md-grid-tile>
   <md-grid-tile>Three</md-grid-tile>
   <md-grid-tile>Four</md-grid-tile>
</md-grid-list>
```

Output:

<img src="https://material.angularjs.org/material2_assets/grid-list/basic-grid-list.png">

## Grid list config

####`cols`

The `cols` property controls the number of columns displayed in your grid. It must be set or the 
grid list will not be able to generate your layout.

Ex: `<md-grid-list cols="3">...`

Default: There is no reasonable default value for this, so if it is unspecified, the grid list will 
throw an error.

####`rowHeight`

Row height for the list can be calculated in three ways:

1. **Fixed height**: The height can be in `px`, `em`, or `rem`.  If no units are specified, `px` 
units are assumed. 
   
   Ex: `<md-grid-list cols="3" rowHeight="100px">...`
        
2. **Ratio**: This ratio is width:height, and must be passed in with a colon, not a decimal.

   Ex: `<md-grid-list cols="3" rowHeight="4:3">...`.
        
3. **Fit**:  This mode automatically divides the available height by the number of rows.  Please note
the height of the grid-list or its container must be set.  

   Ex: `<md-grid-list cols="3" rowHeight="fit">...`

Defaults to a 1:1 ratio of width:height. 
        
####`gutterSize`

Gutter size can be set to any `px`, `em`, or `rem` value with the `gutterSize` property.  If no 
units are specified, `px` units are assumed.

Ex: `<md-grid-list cols="3" gutterSize="4px">...`

Defaults to `1px`.
        
## Grid tile config

You can set the rowspan and colspan of each tile individually, using the `rowspan` and `colspan` 
properties.  If not set, they both default to `1`.

```html
<md-grid-list cols="4" rowHeight="100px">
  <md-grid-tile *ngFor="let tile of tiles" [colspan]="tile.cols" [rowspan]="tile.rows"
  [style.background]="tile.color">
    {{tile.text}}
  </md-grid-tile>
</md-grid-list>
```

```javascript
...
export class MyComp {
  tiles: any[] = [
    {text: 'One', cols: 3, rows: 1, color: 'lightblue'},
    {text: 'Two', cols: 1, rows: 2, color: 'lightgreen'},
    {text: 'Three', cols: 1, rows: 1, color: 'lightpink'},
    {text: 'Four', cols: 2, rows: 1, color: '#DDBDF1'},
  ];
}
```

Output:

<img src="https://material.angularjs.org/material2_assets/grid-list/fancy-grid-list.png">

## TODO

- Grid tile headers and footers
- Responsive sizing support