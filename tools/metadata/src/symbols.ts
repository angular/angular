import * as ts from 'typescript';

// TOOD: Remove when tools directory is upgraded to support es6 target
interface Map<K, V> {
  has(v: V): boolean;
  set(k: K, v: V): void;
  get(k: K): V;
}
interface MapConstructor {
  new<K, V>(): Map<K, V>;
}
declare var Map: MapConstructor;

var a: Array<number>;

/**
 * A symbol table of ts.Symbol to a folded value used during expression folding in Evaluator.
 *
 * This is a thin wrapper around a Map<> using the first declaration location instead of the symbol
 * itself as the key. In the TypeScript binder and type checker, mulitple symbols are sometimes
 * created for a symbol depending on what scope it is in (e.g. export vs. local). Using the
 * declaration node as the key results in these duplicate symbols being treated as identical.
 */
export class Symbols {
  private map = new Map<ts.Node, any>();

  public has(symbol: ts.Symbol): boolean { return this.map.has(symbol.getDeclarations()[0]); }

  public set(symbol: ts.Symbol, value): void { this.map.set(symbol.getDeclarations()[0], value); }

  public get(symbol: ts.Symbol): any { return this.map.get(symbol.getDeclarations()[0]); }

  static empty: Symbols = new Symbols();
}
