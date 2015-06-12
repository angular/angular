/**
 * @module
 * @description
 * This is the module description
 */

export * from 'importedSrc';

/**
 * This is some random other comment
 */

/**
 * This is MyClass
 */
export class MyClass {
  message: String;

  /**
   * Create a new MyClass
   * @param {String} name The name to say hello to
   */
  constructor(name) { this.message = 'hello ' + name; }

  /**
   * Return a greeting message
   */
  greet() { return this.message; }
}

/**
 * An exported function
 */
export var myFn = (val: number) => return val * 2;