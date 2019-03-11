import * as fs from 'fs';
import * as path from 'path';
import {parseExampleFile} from './parse-example-file';

interface ExampleMetadata {
  component: string;
  sourcePath: string;
  id: string;
  title: string;
  additionalComponents: string[];
  additionalFiles: string[];
  selectorName: string[];
}

/** Build ES module import statements for the given example metadata. */
function buildImportsTemplate(data: ExampleMetadata): string {
  const components = data.additionalComponents.concat(data.component);
  const relativeSrcPath = data.sourcePath.replace(/\\/g, '/').replace('.ts', '');

  return `import {${components.join(',')}} from './${relativeSrcPath}';`;
}

/** Inlines the example module template with the specified parsed data. */
function inlineExampleModuleTemplate(parsedData: ExampleMetadata[]): string {
  const exampleImports = parsedData.map(m => buildImportsTemplate(m)).join('\n');
  const quotePlaceholder = '◬';
  const exampleList = parsedData.reduce((result, data) => {
    return result.concat(data.component).concat(data.additionalComponents);
  }, [] as string[]);

  const exampleComponents = parsedData.reduce((result, data) => {
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
    .replace('${exampleImports}', exampleImports)
    .replace('${exampleComponents}', JSON.stringify(exampleComponents, null, 2))
    .replace('${exampleList}', `[\n  ${exampleList.join(',\n  ')}\n]`)
    .replace(new RegExp(`"${quotePlaceholder}|${quotePlaceholder}"`, 'g'), '');
}

/** Converts a given camel-cased string to a dash-cased string. */
function convertToDashCase(name: string): string {
  name = name.replace(/[A-Z]/g, ' $&');
  name = name.toLowerCase().trim();
  return name.split(' ').join('-');
}

/** Collects the metadata of the given source files by parsing the given TypeScript files. */
function collectExampleMetadata(sourceFiles: string[], baseFile: string): ExampleMetadata[] {
  const exampleMetadata: ExampleMetadata[] = [];

  for (const sourceFile of sourceFiles) {
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

  return exampleMetadata;
}

/**
 * Generates the example module from the given source files and writes it to a specified output
 * file.
 */
export function generateExampleModule(sourceFiles: string[], outputFile: string,
                                      baseDir: string = path.dirname(outputFile)) {
  const results = collectExampleMetadata(sourceFiles, baseDir);
  const generatedModuleFile = inlineExampleModuleTemplate(results);

  fs.writeFileSync(outputFile, generatedModuleFile);
}
