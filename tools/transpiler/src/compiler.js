import {Compiler as TraceurCompiler} from 'traceur/src/Compiler';
import {CollectingErrorReporter} from 'traceur/src/util/CollectingErrorReporter';
import {Parser} from './parser';
import {SourceFile} from 'traceur/src/syntax/SourceFile';
import {Options} from 'traceur/src/Options';

export class Compiler extends TraceurCompiler {

  constructor(options, sourceRoot) {
    super(options, sourceRoot);
    this.moduleName_ = sourceRoot;
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
