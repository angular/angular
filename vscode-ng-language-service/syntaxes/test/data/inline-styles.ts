/* clang-format off */

@Component({
//// Property key/value test
  styles: [ '.example { width: 100px; }' ],

//// Multiple styles test
  styles: [
    '.example { width: 100px; }',
    '.example { height: 100px; }',
  ],

//// String delimiter tests
  styles: [ `.example { width: 100px; }` ],
  styles: [ ".example { width: 100px; }" ],
  styles: [ '.example { width: 100px; }' ],

//// Parenthesization tests
  styles: ( (( [ ( '.example { width: 100px; }' ) ] )) ),
//// styles string
  styles: ( ((  ( '.example { width: 100px; }' )  )) ),
  styles:  `.example { width: 100px; }` ,
  styles:  ".example { width: 100px; }" ,
  styles:  '.example { width: 100px; }' ,
})
export class TMComponent{}
