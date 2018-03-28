export class UsesTypeLiterals {
  a: number | undefined;
  b: number | null;
  c: number | true;
  d: number | null | undefined;
  e: Array<string | null | undefined>;
}