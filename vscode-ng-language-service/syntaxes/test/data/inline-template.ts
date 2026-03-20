/* clang-format off */

/* Inline template recognition tests */
@Component({
  //// Property key/value test
  template: '<div></div>',

  //// String delimiter tests
  template: `<div></div>`,
  template: "<div></div>",
  template: '<div></div>',

  //// Parenthesization tests
  template: ( (( '<div></div>' )) ),

  //// Comments tests
  // template: '<div></div>'
  /*
   * template: '<div></div>'
   */
  /**
   * template: '<div></div>'
   */
})
export class TMComponent{}

/* Template syntax tests */
@Component({
  // Interpolation test
  template: '{{property}}',
})
export class TMComponent{}
