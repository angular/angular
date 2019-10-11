declare const $localize: any;

export function foo() {
  let name: string = 'World';
  let message: string = $localize `Hello, ${name}!`;
  console.log(message);
}