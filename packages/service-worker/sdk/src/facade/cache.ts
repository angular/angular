import {NgSwAdapter} from './adapter';

/**
 * @experimental
 */
export interface NgSwCache {
  load(cache: string, req: string|Request): Promise<Response>;
  store(cache: string, req: string|Request, resp: Response): Promise<any>;
  remove(cache: string): Promise<any>;
  invalidate(cache: string, req: string|Request): Promise<void>;
  keys(): Promise<string[]>;
  keysOf(cache: string): Promise<Request[]>;
}

/**
 * @experimental
 */
export class NgSwCacheImpl implements NgSwCache {
  constructor(private caches: CacheStorage, private adapter: NgSwAdapter) {}

  private normalize(req: string|Request): Request {
    if (typeof req == 'string') {
      return this.adapter.newRequest(req);
    }
    return <Request>req;
  }

  load(cache: string, req: string|Request): Promise<Response> {
    return this.caches.open(cache).then(cache => cache.match(this.normalize(req)));
  }

  store(cache: string, req: string|Request, resp: Response): Promise<any> {
    return this.caches.open(cache).then(cache => cache.put(this.normalize(req), resp));
  }

  invalidate(cache: string, req: string|Request): Promise<any> {
    return this.caches.open(cache).then(cache => cache.delete(this.normalize(req)));
  }

  remove(cache: string): Promise<any> { return this.caches.delete(cache); }

  keys(): Promise<string[]> { return this.caches.keys(); }

  keysOf(cache: string): Promise<Request[]> {
    return this.caches.open(cache).then(cache => cache.keys());
  }
}
