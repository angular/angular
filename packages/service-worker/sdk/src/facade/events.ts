/**
 * @experimental
 */
export interface Callback<T> { (event: T): void; }

function nop(event: any): void {}

/**
 * @experimental
 */
export class NgSwEvents {
  install: Callback<InstallEvent> = nop;
  activate: Callback<ActivateEvent> = nop;
  fetch: Callback<FetchEvent> = nop;
  message: Callback<MessageEvent> = nop;
  push: Callback<PushEvent> = nop;

  constructor(scope: ServiceWorkerGlobalScope) {
    scope.addEventListener('install', (event: InstallEvent) => this.install(event));
    scope.addEventListener('activate', (event: ActivateEvent) => this.activate(event));
    scope.addEventListener('fetch', (event: FetchEvent) => this.fetch(event));
    scope.addEventListener('message', (event: MessageEvent) => this.message(event));
    scope.addEventListener('push', (event: PushEvent) => this.push(event));
  }
}
