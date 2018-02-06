/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export interface Host {
  write(path: string, content: string): Promise<void>;
  read(path: string): Promise<string>;
}


export interface Change {
  apply(host: Host): Promise<void>;

  // The file this change should be applied to. Some changes might not apply to
  // a file (maybe the config).
  readonly path: string | null;

  // The order this change should be applied. Normally the position inside the file.
  // Changes are applied from the bottom of a file to the top.
  readonly order: number;

  // The description of this change. This will be outputted in a dry or verbose run.
  readonly description: string;
}


/**
 * An operation that does nothing.
 */
export class NoopChange implements Change {
  description = 'No operation.';
  order = Infinity;
  path = null;
  apply() { return Promise.resolve(); }
}


/**
 * Will add text to the source code.
 */
export class InsertChange implements Change {

  order: number;
  description: string;

  constructor(public path: string, public pos: number, public toAdd: string) {
    if (pos < 0) {
      throw new Error('Negative positions are invalid');
    }
    this.description = `Inserted ${toAdd} into position ${pos} of ${path}`;
    this.order = pos;
  }

  /**
   * This method does not insert spaces if there is none in the original string.
   */
  apply(host: Host) {
    return host.read(this.path).then(content => {
      const prefix = content.substring(0, this.pos);
      const suffix = content.substring(this.pos);

      return host.write(this.path, `${prefix}${this.toAdd}${suffix}`);
    });
  }
}

/**
 * Will remove text from the source code.
 */
export class RemoveChange implements Change {

  order: number;
  description: string;

  constructor(public path: string, private pos: number, private toRemove: string) {
    if (pos < 0) {
      throw new Error('Negative positions are invalid');
    }
    this.description = `Removed ${toRemove} into position ${pos} of ${path}`;
    this.order = pos;
  }

  apply(host: Host): Promise<void> {
    return host.read(this.path).then(content => {
      const prefix = content.substring(0, this.pos);
      const suffix = content.substring(this.pos + this.toRemove.length);

      // TODO: throw error if toRemove doesn't match removed string.
      return host.write(this.path, `${prefix}${suffix}`);
    });
  }
}

/**
 * Will replace text from the source code.
 */
export class ReplaceChange implements Change {
  order: number;
  description: string;

  constructor(public path: string, private pos: number, private oldText: string,
              private newText: string) {
    if (pos < 0) {
      throw new Error('Negative positions are invalid');
    }
    this.description = `Replaced ${oldText} into position ${pos} of ${path} with ${newText}`;
    this.order = pos;
  }

  apply(host: Host): Promise<void> {
    return host.read(this.path).then(content => {
      const prefix = content.substring(0, this.pos);
      const suffix = content.substring(this.pos + this.oldText.length);
      const text = content.substring(this.pos, this.pos + this.oldText.length);

      if (text !== this.oldText) {
        return Promise.reject(new Error(`Invalid replace: "${text}" != "${this.oldText}".`));
      }

      // TODO: throw error if oldText doesn't match removed string.
      return host.write(this.path, `${prefix}${this.newText}${suffix}`);
    });
  }
}
