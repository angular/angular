import {TransformedIdentifierToken} from '../syntax/trees/ParseTrees';
import {ParseTreeWriter as JavaScriptParseTreeWriter} from 'traceur/src/outputgeneration/ParseTreeWriter';

export class ES5ParseTreeWriter extends JavaScriptParseTreeWriter {
  constructor(outputPath) {
    super(outputPath);
  }

  /**
   * @param {TypeName} tree
   */
  visitTypeName(tree) {
    super.visitTypeName(tree);
    if (tree instanceof TransformedIdentifierToken) {
      write_('/*' + tree.original + '*/');
    }
  }
}
