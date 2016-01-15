export function implementsOnDestroy(pipe: any): boolean {
  return pipe.constructor.prototype.ngOnDestroy;
}
