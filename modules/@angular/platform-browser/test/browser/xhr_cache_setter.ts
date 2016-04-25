export function setTemplateCache(cache): void {
  (<any>window).$templateCache = cache;
}
