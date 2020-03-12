import { ElementPosition } from 'protocol';

interface NumberTrie {
  end?: boolean | any;
  [key: number]: NumberTrie;
}

export class InsertionTrie {
  private _insertionTrie: NumberTrie = {};

  insert(pos: ElementPosition, value: any): void {
    if (!pos.length) {
      return;
    }
    let current = this._insertionTrie;
    for (let i = 0; i < pos.length - 1; i++) {
      const p = pos[i];
      current[p] = current[p] || { end: false };
      current = current[p];
    }
    current[pos[pos.length - 1]] = current[pos[pos.length - 1]] || { end: false };
    current[pos[pos.length - 1]].end = value;
  }

  get(pos: ElementPosition): any {
    if (!pos.length) {
      return true;
    }
    let current = this._insertionTrie;
    for (const p of pos) {
      if (!current[p]) {
        return false;
      }
      current = current[p];
    }
    return current.end;
  }
}
