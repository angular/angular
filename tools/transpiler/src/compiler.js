import {Compiler as TraceurCompiler} from 'traceur/src/Compiler';
import {ClassTransformer} from './dart_class_transformer';
import {DartTreeWriter} from './dart_writer';
import {CollectingErrorReporter} from 'traceur/src/util/CollectingErrorReporter';
import {Parser} from './parser';
import {SourceFile} from 'traceur/src/syntax/SourceFile';
import {
  options as traceurOptions
} from 'traceur/src/Options';

export class Compiler extends TraceurCompiler {

  constructor(options, sourceRoot) {
    super(options, sourceRoot);
  }

  transform(tree, moduleName = undefined) {
    if (this.options_.outputLanguage.toLowerCase() === 'dart') {
      var transformer = new ClassTransformer();
      return transformer.transformAny(tree);
    } else {
      return super(tree, moduleName);
    }
  }

  write(tree, outputName = undefined, sourceRoot = undefined) {
    if (this.options_.outputLanguage.toLowerCase() === 'dart') {
      var writer = new DartTreeWriter(this.options_.moduleName, outputName);
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
    // Here we mutate the global/module options object to be used in parsing.
    traceurOptions.setFromObject(this.options_);

    var errorReporter = new CollectingErrorReporter();
    sourceName = this.sourceName(sourceName);
    var sourceFile = new SourceFile(sourceName, content);
    var parser = new Parser(sourceFile, errorReporter);
    var tree =
        this.options_.script ? parser.parseScript() : parser.parseModule();
    this.throwIfErrors(errorReporter);
    return tree;
  }
}
