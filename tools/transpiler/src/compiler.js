import {Compiler as TraceurCompiler} from 'traceur/src/Compiler';
import {DartTransformer} from './codegeneration/DartTransformer';
import {DartParseTreeWriter} from './outputgeneration/DartParseTreeWriter';
import {CollectingErrorReporter} from 'traceur/src/util/CollectingErrorReporter';
import {Parser} from './parser';
import {SourceFile} from 'traceur/src/syntax/SourceFile';
import {Options} from 'traceur/src/Options';

export class Compiler extends TraceurCompiler {

  constructor(options, sourceRoot) {
    super(options, sourceRoot);
    this.moduleName_ = sourceRoot;
  }

  transform(tree, moduleName = undefined) {
    if (this.options_.outputLanguage.toLowerCase() === 'dart') {
      var errorReporter = new CollectingErrorReporter();
      var transformer = new DartTransformer(errorReporter, this.options_);
      var transformedTree = transformer.transform(tree);
      this.throwIfErrors(errorReporter);
      return transformedTree;
    } else {
      return super.transform(tree, moduleName);
    }
  }

  write(tree, outputName = undefined, sourceRoot = undefined) {
    if (this.options_.outputLanguage.toLowerCase() === 'dart') {
      var writer = new DartParseTreeWriter(this.moduleName_, outputName);
      writer.visitAny(tree);
      return writer.toString();
    } else {
      return super.write(tree, outputName, sourceRoot);
    }
  }

  // Copy of the original method to use our custom Parser
  parse(content, sourceName) {
    if (!content) {
      throw new Error('Compiler: no content to compile.');
    } else if (!sourceName) {
      throw new Error('Compiler: no source name for content.');
    }

    this.sourceMapGenerator_ = null;
    var traceurOptions = new Options();
    // Here we mutate the global/module options object to be used in parsing.
    traceurOptions.setFromObject(this.options_);

    var errorReporter = new CollectingErrorReporter();
    sourceName = this.sourceName(sourceName);
    var sourceFile = new SourceFile(sourceName, content);
    var parser = new Parser(sourceFile, errorReporter, this.options_);
    var tree =
        this.options_.script ? parser.parseScript() : parser.parseModule();
    this.throwIfErrors(errorReporter);
    return tree;
  }
}
