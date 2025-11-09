import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class MetadataRegistry {
  private readonly _registry = new Map<any, () => any>();

  register(token: any, getter: () => any): void {
    this._registry.set(token, getter);
  }

  get(token: any): () => any {
    return this._registry.get(token) ?? (() => undefined);
  }
}
