// Imports
import {IncomingMessage} from 'http';
import * as https from 'https';
import {assertNotMissingOrEmpty} from './utils';

// Constants
const GITHUB_HOSTNAME = 'api.github.com';

// Interfaces - Types
interface RequestParams {
  [key: string]: string | number;
}

type RequestParamsOrNull = RequestParams | null;

// Classes
export class GithubApi {
  protected requestHeaders: {[key: string]: string};

  // Constructor
  constructor(githubToken: string) {
    assertNotMissingOrEmpty('githubToken', githubToken);

    this.requestHeaders = {
      'Authorization': `token ${githubToken}`,
      'User-Agent': `Node/${process.versions.node}`,
    };
  }

  // Methods - Public
  public get<T>(pathname: string, params?: RequestParamsOrNull): Promise<T> {
    const path = this.buildPath(pathname, params);
    return this.request<T>('get', path);
  }

  public post<T>(pathname: string, params?: RequestParamsOrNull, data?: any): Promise<T> {
    const path = this.buildPath(pathname, params);
    return this.request<T>('post', path, data);
  }

  // Methods - Protected
  protected buildPath(pathname: string, params?: RequestParamsOrNull): string {
    if (params == null) {
      return pathname;
    }

    const search = (params === null) ? '' : this.serializeSearchParams(params);
    const joiner = search && '?';

    return `${pathname}${joiner}${search}`;
  }

  protected getPaginated<T>(pathname: string, baseParams: RequestParams = {}, currentPage: number = 0): Promise<T[]> {
    const perPage = 100;
    const params = {
      ...baseParams,
      page: currentPage,
      per_page: perPage,
    };

    return this.get<T[]>(pathname, params).then(items => {
      if (items.length < perPage) {
        return items;
      }

      return this.getPaginated<T>(pathname, baseParams, currentPage + 1).then(moreItems => [...items, ...moreItems]);
    });
  }

  protected request<T>(method: string, path: string, data: any = null): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const options = {
        headers: {...this.requestHeaders},
        host: GITHUB_HOSTNAME,
        method,
        path,
      };

      const onError = (statusCode: number, responseText: string) => {
        const url = `https://${GITHUB_HOSTNAME}${path}`;
        reject(`Request to '${url}' failed (status: ${statusCode}): ${responseText}`);
      };
      const onSuccess = (responseText: string) => {
        try { resolve(JSON.parse(responseText)); } catch (err) { reject(err); }
      };
      const onResponse = (res: IncomingMessage) => {
        const statusCode = res.statusCode || -1;
        const isSuccess = (200 <= statusCode) && (statusCode < 400);
        let responseText = '';

        res.
          on('data', d => responseText += d).
          on('end', () => isSuccess ? onSuccess(responseText) : onError(statusCode, responseText)).
          on('error', reject);
      };

      https.
        request(options, onResponse).
        on('error', reject).
        end(data && JSON.stringify(data));
    });
  }

  protected serializeSearchParams(params: RequestParams): string {
    return Object.keys(params).
      filter(key => params[key] != null).
      map(key => `${key}=${encodeURIComponent(String(params[key]))}`).
      join('&');
  }
}
