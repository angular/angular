/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, from, Observable, Observer, of} from 'rxjs';
import {concatMap, first} from 'rxjs/operators';

import {delayResponse} from './delay-response';
import {getStatusText, isSuccess, STATUS} from './http-status-codes';
import {InMemoryBackendConfig, InMemoryBackendConfigArgs, InMemoryDbService, ParsedRequestUrl, parseUri, PassThruBackend, removeTrailingSlash, RequestCore, RequestInfo, RequestInfoUtilities, ResponseOptions, UriInfo} from './interfaces';

/**
 * Base class for in-memory web api back-ends
 * Simulate the behavior of a RESTy web api
 * backed by the simple in-memory data store provided by the injected `InMemoryDbService` service.
 * Conforms mostly to behavior described here:
 * http://www.restapitutorial.com/lessons/httpmethods.html
 */
export abstract class BackendService {
  protected config: InMemoryBackendConfigArgs = new InMemoryBackendConfig();
  protected db: {[key: string]: any} = {};
  protected dbReadySubject: BehaviorSubject<boolean>|undefined;
  private passThruBackend: PassThruBackend|undefined;
  protected requestInfoUtils = this.getRequestInfoUtils();

  constructor(protected inMemDbService: InMemoryDbService, config: InMemoryBackendConfigArgs = {}) {
    const loc = this.getLocation('/');
    this.config.host = loc.host;      // default to app web server host
    this.config.rootPath = loc.path;  // default to path when app is served (e.g.'/')
    Object.assign(this.config, config);
  }

  protected get dbReady(): Observable<boolean> {
    if (!this.dbReadySubject) {
      // first time the service is called.
      this.dbReadySubject = new BehaviorSubject<boolean>(false);
      this.resetDb();
    }
    return this.dbReadySubject.asObservable().pipe(first((r: boolean) => r));
  }

  /**
   * Process Request and return an Observable of Http Response object
   * in the manner of a RESTy web api.
   *
   * Expect URI pattern in the form :base/:collectionName/:id?
   * Examples:
   *   // for store with a 'customers' collection
   *   GET api/customers          // all customers
   *   GET api/customers/42       // the character with id=42
   *   GET api/customers?name=^j  // 'j' is a regex; returns customers whose name starts with 'j' or
   * 'J' GET api/customers.json/42  // ignores the ".json"
   *
   * Also accepts direct commands to the service in which the last segment of the apiBase is the
   * word "commands" Examples: POST commands/resetDb, GET/POST commands/config - get or (re)set the
   * config
   *
   *   HTTP overrides:
   *     If the injected inMemDbService defines an HTTP method (lowercase)
   *     The request is forwarded to that method as in
   *     `inMemDbService.get(requestInfo)`
   *     which must return either an Observable of the response type
   *     for this http library or null|undefined (which means "keep processing").
   */
  protected handleRequest(req: RequestCore): Observable<any> {
    //  handle the request when there is an in-memory database
    return this.dbReady.pipe(concatMap(() => this.handleRequest_(req)));
  }

  protected handleRequest_(req: RequestCore): Observable<any> {
    const url = req.urlWithParams ? req.urlWithParams : req.url;

    // Try override parser
    // If no override parser or it returns nothing, use default parser
    const parser = this.bind('parseRequestUrl');
    const parsed: ParsedRequestUrl =
        (parser && parser(url, this.requestInfoUtils)) || this.parseRequestUrl(url);

    const collectionName = parsed.collectionName;
    const collection = this.db[collectionName];

    const reqInfo: RequestInfo = {
      req: req,
      apiBase: parsed.apiBase,
      collection: collection,
      collectionName: collectionName,
      headers: this.createHeaders({'Content-Type': 'application/json'}),
      id: this.parseId(collection, collectionName, parsed.id),
      method: this.getRequestMethod(req),
      query: parsed.query,
      resourceUrl: parsed.resourceUrl,
      url: url,
      utils: this.requestInfoUtils
    };

    let resOptions: ResponseOptions;

    if (/commands\/?$/i.test(reqInfo.apiBase)) {
      return this.commands(reqInfo);
    }

    const methodInterceptor = this.bind(reqInfo.method);
    if (methodInterceptor) {
      // InMemoryDbService intercepts this HTTP method.
      // if interceptor produced a response, return it.
      // else InMemoryDbService chose not to intercept; continue processing.
      const interceptorResponse = methodInterceptor(reqInfo);
      if (interceptorResponse) {
        return interceptorResponse;
      }
    }

    if (this.db[collectionName]) {
      // request is for a known collection of the InMemoryDbService
      return this.createResponse$(() => this.collectionHandler(reqInfo));
    }

    if (this.config.passThruUnknownUrl) {
      // unknown collection; pass request thru to a "real" backend.
      return this.getPassThruBackend().handle(req);
    }

    // 404 - can't handle this request
    resOptions = this.createErrorResponseOptions(
        url, STATUS.NOT_FOUND, `Collection '${collectionName}' not found`);
    return this.createResponse$(() => resOptions);
  }

  /**
   * Add configured delay to response observable unless delay === 0
   */
  protected addDelay(response: Observable<any>): Observable<any> {
    const d = this.config.delay;
    return d === 0 ? response : delayResponse(response, d || 500);
  }

  /**
   * Apply query/search parameters as a filter over the collection
   * This impl only supports RegExp queries on string properties of the collection
   * ANDs the conditions together
   */
  protected applyQuery(collection: any[], query: Map<string, string[]>): any[] {
    // extract filtering conditions - {propertyName, RegExps) - from query/search parameters
    const conditions: {name: string, rx: RegExp}[] = [];
    const caseSensitive = this.config.caseSensitiveSearch ? undefined : 'i';
    query.forEach((value: string[], name: string) => {
      value.forEach(v => conditions.push({name, rx: new RegExp(decodeURI(v), caseSensitive)}));
    });

    const len = conditions.length;
    if (!len) {
      return collection;
    }

    // AND the RegExp conditions
    return collection.filter(row => {
      let ok = true;
      let i = len;
      while (ok && i) {
        i -= 1;
        const cond = conditions[i];
        ok = cond.rx.test(row[cond.name]);
      }
      return ok;
    });
  }

  /**
   * Get a method from the `InMemoryDbService` (if it exists), bound to that service
   */
  protected bind<T extends Function>(methodName: string) {
    const fn = (this.inMemDbService as any)[methodName];
    return fn ? fn.bind(this.inMemDbService) as T : undefined;
  }

  protected bodify(data: any) {
    return this.config.dataEncapsulation ? {data} : data;
  }

  protected clone(data: any) {
    return JSON.parse(JSON.stringify(data));
  }

  protected collectionHandler(reqInfo: RequestInfo): ResponseOptions {
    // const req = reqInfo.req;
    let resOptions: ResponseOptions;
    switch (reqInfo.method) {
      case 'get':
        resOptions = this.get(reqInfo);
        break;
      case 'post':
        resOptions = this.post(reqInfo);
        break;
      case 'put':
        resOptions = this.put(reqInfo);
        break;
      case 'delete':
        resOptions = this.delete(reqInfo);
        break;
      default:
        resOptions = this.createErrorResponseOptions(
            reqInfo.url, STATUS.METHOD_NOT_ALLOWED, 'Method not allowed');
        break;
    }

    // If `inMemDbService.responseInterceptor` exists, let it morph the response options
    const interceptor = this.bind('responseInterceptor');
    return interceptor ? interceptor(resOptions, reqInfo) : resOptions;
  }

  /**
   * Commands reconfigure the in-memory web api service or extract information from it.
   * Commands ignore the latency delay and respond ASAP.
   *
   * When the last segment of the `apiBase` path is "commands",
   * the `collectionName` is the command.
   *
   * Example URLs:
   *   commands/resetdb (POST) // Reset the "database" to its original state
   *   commands/config (GET)   // Return this service's config object
   *   commands/config (POST)  // Update the config (e.g. the delay)
   *
   * Usage:
   *   http.post('commands/resetdb', undefined);
   *   http.get('commands/config');
   *   http.post('commands/config', '{"delay":1000}');
   */
  protected commands(reqInfo: RequestInfo): Observable<any> {
    const command = reqInfo.collectionName.toLowerCase();
    const method = reqInfo.method;

    let resOptions: ResponseOptions = {url: reqInfo.url};

    switch (command) {
      case 'resetdb':
        resOptions.status = STATUS.NO_CONTENT;
        return this.resetDb(reqInfo).pipe(
            concatMap(() => this.createResponse$(() => resOptions, false /* no latency delay */)));

      case 'config':
        if (method === 'get') {
          resOptions.status = STATUS.OK;
          resOptions.body = this.clone(this.config);

          // any other HTTP method is assumed to be a config update
        } else {
          const body = this.getJsonBody(reqInfo.req);
          Object.assign(this.config, body);
          this.passThruBackend = undefined;  // re-create when needed

          resOptions.status = STATUS.NO_CONTENT;
        }
        break;

      default:
        resOptions = this.createErrorResponseOptions(
            reqInfo.url, STATUS.INTERNAL_SERVER_ERROR, `Unknown command "${command}"`);
    }

    return this.createResponse$(() => resOptions, false /* no latency delay */);
  }

  protected createErrorResponseOptions(url: string, status: number, message: string):
      ResponseOptions {
    return {
      body: {error: `${message}`},
      url: url,
      headers: this.createHeaders({'Content-Type': 'application/json'}),
      status: status
    };
  }

  /**
   * Create standard HTTP headers object from hash map of header strings
   * @param headers
   */
  protected abstract createHeaders(headers: {[index: string]: string}): HttpHeaders;

  /**
   * create the function that passes unhandled requests through to the "real" backend.
   */
  protected abstract createPassThruBackend(): PassThruBackend;

  /**
   * return a search map from a location query/search string
   */
  protected abstract createQueryMap(search: string): Map<string, string[]>;

  /**
   * Create a cold response Observable from a factory for ResponseOptions
   * @param resOptionsFactory - creates ResponseOptions when observable is subscribed
   * @param withDelay - if true (default), add simulated latency delay from configuration
   */
  protected createResponse$(resOptionsFactory: () => ResponseOptions, withDelay = true):
      Observable<any> {
    const resOptions$ = this.createResponseOptions$(resOptionsFactory);
    let resp$ = this.createResponse$fromResponseOptions$(resOptions$);
    return withDelay ? this.addDelay(resp$) : resp$;
  }

  /**
   * Create a Response observable from ResponseOptions observable.
   */
  protected abstract createResponse$fromResponseOptions$(resOptions$: Observable<ResponseOptions>):
      Observable<any>;

  /**
   * Create a cold Observable of ResponseOptions.
   * @param resOptionsFactory - creates ResponseOptions when observable is subscribed
   */
  protected createResponseOptions$(resOptionsFactory: () => ResponseOptions):
      Observable<ResponseOptions> {
    return new Observable<ResponseOptions>((responseObserver: Observer<ResponseOptions>) => {
      let resOptions: ResponseOptions;
      try {
        resOptions = resOptionsFactory();
      } catch (error) {
        const err = error.message || error;
        resOptions = this.createErrorResponseOptions('', STATUS.INTERNAL_SERVER_ERROR, `${err}`);
      }

      const status = resOptions.status;
      try {
        resOptions.statusText = status != null ? getStatusText(status) : undefined;
      } catch (e) { /* ignore failure */
      }
      if (status != null && isSuccess(status)) {
        responseObserver.next(resOptions);
        responseObserver.complete();
      } else {
        responseObserver.error(resOptions);
      }
      return () => {};  // unsubscribe function
    });
  }

  protected delete({collection, collectionName, headers, id, url}: RequestInfo): ResponseOptions {
    if (id == null) {
      return this.createErrorResponseOptions(
          url, STATUS.NOT_FOUND, `Missing "${collectionName}" id`);
    }
    const exists = this.removeById(collection, id);
    return {
      headers: headers,
      status: (exists || !this.config.delete404) ? STATUS.NO_CONTENT : STATUS.NOT_FOUND
    };
  }

  /**
   * Find first instance of item in collection by `item.id`
   * @param collection
   * @param id
   */
  protected findById<T extends {id: any}>(collection: T[], id: any): T|undefined {
    return collection.find((item: T) => item.id === id);
  }

  /**
   * Generate the next available id for item in this collection
   * Use method from `inMemDbService` if it exists and returns a value,
   * else delegates to `genIdDefault`.
   * @param collection - collection of items with `id` key property
   */
  protected genId<T extends {id: any}>(collection: T[], collectionName: string): any {
    const genId = this.bind('genId');
    if (genId) {
      const id = genId(collection, collectionName);
      if (id != null) {
        return id;
      }
    }
    return this.genIdDefault(collection, collectionName);
  }

  /**
   * Default generator of the next available id for item in this collection
   * This default implementation works only for numeric ids.
   * @param collection - collection of items with `id` key property
   * @param collectionName - name of the collection
   */
  protected genIdDefault<T extends {id: any}>(collection: T[], collectionName: string): any {
    if (!this.isCollectionIdNumeric(collection, collectionName)) {
      throw new Error(`Collection '${
          collectionName}' id type is non-numeric or unknown. Can only generate numeric ids.`);
    }

    let maxId = 0;
    collection.reduce((prev: any, item: any) => {
      maxId = Math.max(maxId, typeof item.id === 'number' ? item.id : maxId);
    }, undefined);
    return maxId + 1;
  }

  protected get({collection, collectionName, headers, id, query, url}: RequestInfo):
      ResponseOptions {
    let data = collection;

    if (id != null && id !== '') {
      data = this.findById(collection, id);
    } else if (query) {
      data = this.applyQuery(collection, query);
    }

    if (!data) {
      return this.createErrorResponseOptions(
          url, STATUS.NOT_FOUND, `'${collectionName}' with id='${id}' not found`);
    }
    return {body: this.bodify(this.clone(data)), headers: headers, status: STATUS.OK};
  }

  /** Get JSON body from the request object */
  protected abstract getJsonBody(req: any): any;

  /**
   * Get location info from a url, even on server where `document` is not defined
   */
  protected getLocation(url: string): UriInfo {
    if (!url.startsWith('http')) {
      // get the document iff running in browser
      const doc = (typeof document === 'undefined') ? undefined : document;
      // add host info to url before parsing.  Use a fake host when not in browser.
      const base = doc ? doc.location.protocol + '//' + doc.location.host : 'http://fake';
      url = url.startsWith('/') ? base + url : base + '/' + url;
    }
    return parseUri(url);
  }

  /**
   * get or create the function that passes unhandled requests
   * through to the "real" backend.
   */
  protected getPassThruBackend(): PassThruBackend {
    return this.passThruBackend ? this.passThruBackend :
                                  this.passThruBackend = this.createPassThruBackend();
  }

  /**
   * Get utility methods from this service instance.
   * Useful within an HTTP method override
   */
  protected getRequestInfoUtils(): RequestInfoUtilities {
    return {
      createResponse$: this.createResponse$.bind(this),
      findById: this.findById.bind(this),
      isCollectionIdNumeric: this.isCollectionIdNumeric.bind(this),
      getConfig: () => this.config,
      getDb: () => this.db,
      getJsonBody: this.getJsonBody.bind(this),
      getLocation: this.getLocation.bind(this),
      getPassThruBackend: this.getPassThruBackend.bind(this),
      parseRequestUrl: this.parseRequestUrl.bind(this),
    };
  }

  /**
   * return canonical HTTP method name (lowercase) from the request object
   * e.g. (req.method || 'get').toLowerCase();
   * @param req - request object from the http call
   *
   */
  protected abstract getRequestMethod(req: any): string;

  protected indexOf(collection: any[], id: number) {
    return collection.findIndex((item: any) => item.id === id);
  }

  /** Parse the id as a number. Return original value if not a number. */
  protected parseId(collection: any[], collectionName: string, id: string): any {
    if (!this.isCollectionIdNumeric(collection, collectionName)) {
      // Can't confirm that `id` is a numeric type; don't parse as a number
      // or else `'42'` -> `42` and _get by id_ fails.
      return id;
    }
    const idNum = parseFloat(id);
    return isNaN(idNum) ? id : idNum;
  }

  /**
   * return true if can determine that the collection's `item.id` is a number
   * This implementation can't tell if the collection is empty so it assumes NO
   * */
  protected isCollectionIdNumeric<T extends {id: any}>(collection: T[], collectionName: string):
      boolean {
    // collectionName not used now but override might maintain collection type information
    // so that it could know the type of the `id` even when the collection is empty.
    return !!(collection && collection[0]) && typeof collection[0].id === 'number';
  }

  /**
   * Parses the request URL into a `ParsedRequestUrl` object.
   * Parsing depends upon certain values of `config`: `apiBase`, `host`, and `urlRoot`.
   *
   * Configuring the `apiBase` yields the most interesting changes to `parseRequestUrl` behavior:
   *   When apiBase=undefined and url='http://localhost/api/collection/42'
   *     {base: 'api/', collectionName: 'collection', id: '42', ...}
   *   When apiBase='some/api/root/' and url='http://localhost/some/api/root/collection'
   *     {base: 'some/api/root/', collectionName: 'collection', id: undefined, ...}
   *   When apiBase='/' and url='http://localhost/collection'
   *     {base: '/', collectionName: 'collection', id: undefined, ...}
   *
   * The actual api base segment values are ignored. Only the number of segments matters.
   * The following api base strings are considered identical: 'a/b' ~ 'some/api/' ~ `two/segments'
   *
   * To replace this default method, assign your alternative to your
   * InMemDbService['parseRequestUrl']
   */
  protected parseRequestUrl(url: string): ParsedRequestUrl {
    try {
      const loc = this.getLocation(url);
      let drop = (this.config.rootPath || '').length;
      let urlRoot = '';
      if (loc.host !== this.config.host) {
        // url for a server on a different host!
        // assume it's collection is actually here too.
        drop = 1;  // the leading slash
        urlRoot = loc.protocol + '//' + loc.host + '/';
      }
      const path = loc.path.substring(drop);
      const pathSegments = path.split('/');
      let segmentIndex = 0;

      // apiBase: the front part of the path devoted to getting to the api route
      // Assumes first path segment if no config.apiBase
      // else ignores as many path segments as are in config.apiBase
      // Does NOT care what the api base chars actually are.
      let apiBase: string;
      if (this.config.apiBase == null) {
        apiBase = pathSegments[segmentIndex++];
      } else {
        apiBase = removeTrailingSlash(this.config.apiBase.trim());
        if (apiBase) {
          segmentIndex = apiBase.split('/').length;
        } else {
          segmentIndex = 0;  // no api base at all; unwise but allowed.
        }
      }
      apiBase += '/';

      let collectionName = pathSegments[segmentIndex++];
      // ignore anything after a '.' (e.g.,the "json" in "customers.json")
      collectionName = collectionName && collectionName.split('.')[0];

      const id = pathSegments[segmentIndex++];
      const query = this.createQueryMap(loc.query);
      const resourceUrl = urlRoot + apiBase + collectionName + '/';
      return {apiBase, collectionName, id, query, resourceUrl};
    } catch (err) {
      const msg = `unable to parse url '${url}'; original error: ${err.message}`;
      throw new Error(msg);
    }
  }

  // Create entity
  // Can update an existing entity too if post409 is false.
  protected post({collection, collectionName, headers, id, req, resourceUrl, url}: RequestInfo):
      ResponseOptions {
    const item = this.clone(this.getJsonBody(req));

    if (item.id == null) {
      try {
        item.id = id || this.genId(collection, collectionName);
      } catch (err) {
        const emsg: string = err.message || '';
        if (/id type is non-numeric/.test(emsg)) {
          return this.createErrorResponseOptions(url, STATUS.UNPROCESSABLE_ENTRY, emsg);
        } else {
          return this.createErrorResponseOptions(
              url, STATUS.INTERNAL_SERVER_ERROR,
              `Failed to generate new id for '${collectionName}'`);
        }
      }
    }

    if (id && id !== item.id) {
      return this.createErrorResponseOptions(
          url, STATUS.BAD_REQUEST, `Request id does not match item.id`);
    } else {
      id = item.id;
    }
    const existingIx = this.indexOf(collection, id);
    const body = this.bodify(item);

    if (existingIx === -1) {
      collection.push(item);
      headers.set('Location', resourceUrl + '/' + id);
      return {headers, body, status: STATUS.CREATED};
    } else if (this.config.post409) {
      return this.createErrorResponseOptions(
          url, STATUS.CONFLICT,
          `'${collectionName}' item with id='${
              id} exists and may not be updated with POST; use PUT instead.`);
    } else {
      collection[existingIx] = item;
      return this.config.post204 ? {headers, status: STATUS.NO_CONTENT} :  // successful; no content
          {headers, body, status: STATUS.OK};  // successful; return entity
    }
  }

  // Update existing entity
  // Can create an entity too if put404 is false.
  protected put({collection, collectionName, headers, id, req, url}: RequestInfo): ResponseOptions {
    const item = this.clone(this.getJsonBody(req));
    if (item.id == null) {
      return this.createErrorResponseOptions(
          url, STATUS.NOT_FOUND, `Missing '${collectionName}' id`);
    }
    if (id && id !== item.id) {
      return this.createErrorResponseOptions(
          url, STATUS.BAD_REQUEST, `Request for '${collectionName}' id does not match item.id`);
    } else {
      id = item.id;
    }
    const existingIx = this.indexOf(collection, id);
    const body = this.bodify(item);

    if (existingIx > -1) {
      collection[existingIx] = item;
      return this.config.put204 ? {headers, status: STATUS.NO_CONTENT} :  // successful; no content
          {headers, body, status: STATUS.OK};  // successful; return entity
    } else if (this.config.put404) {
      // item to update not found; use POST to create new item for this id.
      return this.createErrorResponseOptions(
          url, STATUS.NOT_FOUND,
          `'${collectionName}' item with id='${
              id} not found and may not be created with PUT; use POST instead.`);
    } else {
      // create new item for id not found
      collection.push(item);
      return {headers, body, status: STATUS.CREATED};
    }
  }

  protected removeById(collection: any[], id: number) {
    const ix = this.indexOf(collection, id);
    if (ix > -1) {
      collection.splice(ix, 1);
      return true;
    }
    return false;
  }

  /**
   * Tell your in-mem "database" to reset.
   * returns Observable of the database because resetting it could be async
   */
  protected resetDb(reqInfo?: RequestInfo): Observable<boolean> {
    this.dbReadySubject && this.dbReadySubject.next(false);
    const db = this.inMemDbService.createDb(reqInfo);
    const db$ = db instanceof Observable ?
        db :
        typeof (db as any).then === 'function' ? from(db as Promise<any>) : of(db);
    db$.pipe(first()).subscribe((d: {}) => {
      this.db = d;
      this.dbReadySubject && this.dbReadySubject.next(true);
    });
    return this.dbReady;
  }
}
