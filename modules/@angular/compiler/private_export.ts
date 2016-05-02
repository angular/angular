import * as selector from './src/selector';
import * as pathUtil from './src/output/path_util';

export namespace __compiler_private__ {
  export type SelectorMatcher = selector.SelectorMatcher;
  export var SelectorMatcher = selector.SelectorMatcher;

  export type CssSelector = selector.CssSelector;
  export var CssSelector = selector.CssSelector;

  export type AssetUrl = pathUtil.AssetUrl;
  export var AssetUrl = pathUtil.AssetUrl;

  export type ImportGenerator = pathUtil.ImportGenerator;
  export var ImportGenerator = pathUtil.ImportGenerator;
}
