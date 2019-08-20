import * as fs from 'fs';
import * as path from 'path';
import {parseExampleFile} from './parse-example-file';
import {parseExampleModuleFile} from './parse-example-module-file';

interface ExampleMetadata {
  component: string;
  sourcePath: string;
  id: string;
  title: string;
  additionalComponents: string[];
  additionalFiles: string[];
  selectorName: string[];
}

interface ExampleModule {
  sourcePath: string;
  name: string;
}

interface AnalyzedExamples {
  exampleMetadata: ExampleMetadata[];
  exampleModules: ExampleModule[];
}

/** Creates an import declaration for the given symbols from the specified file. */
function createImportDeclaration(relativePath: string, symbols: string[]): string {
  const posixRelativePath = relativePath.replace(/\\/g, '/').replace('.ts', '');
  return `import {${symbols.join(',')}} from './${posixRelativePath}';`;
}

/** Inlines the example module template with the specified parsed data. */
function inlineExampleModuleTemplate(parsedData: AnalyzedExamples): string {
  const {exampleMetadata, exampleModules} = parsedData;
  // TODO(devversion): re-add line-breaks for debugging once the example module has
  // been re-added to the repository gitignore.
  // Blocked on https://github.com/angular/angular/issues/30259
  const exampleImports = [
    ...exampleMetadata
      .map(({additionalComponents, component, sourcePath}) =>
        createImportDeclaration(sourcePath, additionalComponents.concat(component))),
    ...exampleModules.map(({name, sourcePath}) => createImportDeclaration(sourcePath, [name])),
  ].join('');
  const quotePlaceholder = '◬';
  const exampleList = exampleMetadata.reduce((result, data) => {
    return result.concat(data.component).concat(data.additionalComponents);
  }, [] as string[]);

  const exampleComponents = exampleMetadata.reduce((result, data) => {
    result[data.id] = {
      title: data.title,
      // Since we use JSON.stringify to output the data below, the `component` will be wrapped
      // in quotes, whereas we want a reference to the class. Add placeholder characters next to
      // where the quotes will be so that we can strip them away afterwards.
      component: `${quotePlaceholder}${data.component}${quotePlaceholder}`,
      additionalFiles: data.additionalFiles,
      selectorName: data.selectorName.join(', '),
    };

    return result;
  }, {} as any);

  return fs.readFileSync(require.resolve('./example-module.template'), 'utf8')
    .replace(/\${exampleImports}/g, exampleImports)
    .replace(/\${exampleComponents}/g, JSON.stringify(exampleComponents))
    .replace(/\${exampleList}/g, exampleList.join(', '))
    .replace(/\${exampleModules}/g, `[${exampleModules.map(m => m.name).join(', ')}]`)
    .replace(new RegExp(`"${quotePlaceholder}|${quotePlaceholder}"`, 'g'), '');
}

/** Converts a given camel-cased string to a dash-cased string. */
function convertToDashCase(name: string): string {
  name = name.replace(/[A-Z]/g, ' $&');
  name = name.toLowerCase().trim();
  return name.split(' ').join('-');
}

/**
 * Analyzes the examples by parsing the given TypeScript files in order to find
 * individual example modules and example metadata.
 */
function analyzeExamples(sourceFiles: string[], baseFile: string): AnalyzedExamples {
  const exampleMetadata: ExampleMetadata[] = [];
  const exampleModules: ExampleModule[] = [];

  for (const sourceFile of sourceFiles) {
    const relativePath = path.relative(baseFile, sourceFile);

    // Collect all individual example modules.
    if (path.basename(sourceFile) === 'module.ts') {
      exampleModules.push(...parseExampleModuleFile(sourceFile).map(name => ({
        name,
        sourcePath: relativePath,
      })));
      continue;
    }

    // Avoid parsing non-example files.
    if (!path.basename(sourceFile, path.extname(sourceFile)).endsWith('-example')) {
      continue;
    }

    const sourceContent = fs.readFileSync(sourceFile, 'utf-8');
    const {primaryComponent, secondaryComponents} = parseExampleFile(sourceFile, sourceContent);

    if (primaryComponent) {
      // Generate a unique id for the component by converting the class name to dash-case.
      const exampleId = convertToDashCase(primaryComponent.component.replace('Example', ''));
      const example: ExampleMetadata = {
        sourcePath: path.relative(baseFile, sourceFile),
        id: exampleId,
        component: primaryComponent.component,
        title: primaryComponent.title.trim(),
        additionalComponents: [],
        additionalFiles: [],
        selectorName: []
      };

      if (secondaryComponents.length) {
        example.selectorName.push(example.component);

        for (const meta of secondaryComponents) {
          example.additionalComponents.push(meta.component);

          if (meta.templateUrl) {
            example.additionalFiles.push(meta.templateUrl);
          }

          if (meta.styleUrls) {
            example.additionalFiles.push(...meta.styleUrls);
          }

          example.selectorName.push(meta.component);
        }
      }

      exampleMetadata.push(example);
    } else {
        throw Error(`Could not find a primary example component in ${sourceFile}. ` +
                    `Ensure that there's a component with an @title annotation.`);
    }
  }

  return {exampleMetadata, exampleModules};
}

/**
 * Generates the example module from the given source files and writes it to a specified output
 * file.
 */
export function generateExampleModule(sourceFiles: string[], outputFile: string,
                                      baseDir: string = path.dirname(outputFile)) {
  const analysisData = analyzeExamples(sourceFiles, baseDir);
  const generatedModuleFile = inlineExampleModuleTemplate(analysisData);

  fs.writeFileSync(outputFile, generatedModuleFile);
}
