declare const $localize: any;

export class Bar {
  name: string = 'World';
  message: string = $localize `Hello, ${name}!`;
}