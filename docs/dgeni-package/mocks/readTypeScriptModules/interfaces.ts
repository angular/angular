export interface MyInterface {
  optionalProperty? : string
  (param: string) : string
  new (param: number) : MyInterface
}