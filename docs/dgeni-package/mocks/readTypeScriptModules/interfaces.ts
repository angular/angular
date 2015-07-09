export interface MyInterface {
  optionalProperty? : string
  <T, U extends Findable<T>>(param: T) : U
  new (param: number) : MyInterface
}