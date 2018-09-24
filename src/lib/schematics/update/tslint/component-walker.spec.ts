import * as mockFs from 'mock-fs';
import {dirname, join} from 'path';
import {IOptions} from 'tslint';
import * as ts from 'typescript';
import {ComponentWalker} from './component-walker';

describe('ComponentWalker', () => {

  const defaultRuleOptions: IOptions = {
    ruleArguments: [],
    ruleSeverity: 'error',
    disabledIntervals: [],
    ruleName: 'component-walker-test'
  };

  afterEach(() => mockFs.restore());

  function createSourceFile(content: string) {
    return ts.createSourceFile(join(__dirname, 'test-source-file.ts'), content,
        ts.ScriptTarget.Latest, true);
  }

  it('should report inline stylesheets', () => {
    const sourceFile = createSourceFile(inlineStylesheetSource);
    const walker = new ComponentWalker(sourceFile, defaultRuleOptions);

    spyOn(walker, 'visitInlineStylesheet');

    walker.walk(sourceFile);

    expect(walker.visitInlineStylesheet).toHaveBeenCalledTimes(1);
  });

  it('should report external stylesheets', () => {
    const sourceFile = createSourceFile(externalStylesheetSource);
    const walker = new ComponentWalker(sourceFile, defaultRuleOptions);
    const stylePath = join(dirname(sourceFile.fileName), 'my-component.css');
    const styleContent = ':host { color: red; }';

    spyOn(walker, 'visitExternalStylesheet').and.callFake(node => {
      expect(node.getFullText()).toBe(styleContent);
    });

    mockFs({[stylePath]: styleContent});

    walker.walk(sourceFile);

    expect(walker.visitExternalStylesheet).toHaveBeenCalledTimes(1);
  });

  it('should not throw if an external stylesheet could not be resolved', () => {
    const sourceFile = createSourceFile(externalStylesheetSource);
    const walker = new ComponentWalker(sourceFile, defaultRuleOptions);

    expect(() => walker.walk(sourceFile)).not.toThrow();
    expect(walker.getFailures().length).toBe(1);
  });

  it('should report inline templates', () => {
    const sourceFile = createSourceFile(inlineTemplateSource);
    const walker = new ComponentWalker(sourceFile, defaultRuleOptions);

    spyOn(walker, 'visitInlineTemplate');

    walker.walk(sourceFile);

    expect(walker.visitInlineTemplate).toHaveBeenCalledTimes(1);
  });

  it('should report external templates', () => {
    const sourceFile = createSourceFile(externalTemplateSource);
    const walker = new ComponentWalker(sourceFile, defaultRuleOptions);
    const templatePath = join(dirname(sourceFile.fileName), 'my-component.html');
    const templateContent = '<span>External template</span>';

    spyOn(walker, 'visitExternalTemplate').and.callFake(node => {
      expect(node.getFullText()).toBe(templateContent);
    });

    mockFs({[templatePath]: templateContent});

    walker.walk(sourceFile);

    expect(walker.visitExternalTemplate).toHaveBeenCalledTimes(1);
  });

  it('should not throw if an external template could not be resolved', () => {
    const sourceFile = createSourceFile(externalTemplateSource);
    const walker = new ComponentWalker(sourceFile, defaultRuleOptions);

    expect(() => walker.walk(sourceFile)).not.toThrow();
    expect(walker.getFailures().length).toBe(1);
  });

  it('should not throw if the inline template could not be resolved', () => {
    const sourceFile = createSourceFile(`
      @Component({
        template: myTemplate,
      })
      export class MyComponent {}
    `);
    const walker = new ComponentWalker(sourceFile, defaultRuleOptions);

    expect(() => walker.walk(sourceFile)).not.toThrow();
  });

  it('should not throw if inline styles could not be resolved', () => {
    const sourceFile = createSourceFile(`
      @Component({
        styles: [styleA, styleB, 'c', 'd'],
      })
      export class MyComponent {}
    `);
    const walker = new ComponentWalker(sourceFile, defaultRuleOptions);

    spyOn(walker, 'visitInlineStylesheet');

    expect(() => walker.walk(sourceFile)).not.toThrow();
    expect(walker.visitInlineStylesheet).toHaveBeenCalledTimes(2);
  });

  it('should be able to report additional stylesheet files', () => {
    const sourceFile = createSourceFile(``);
    const walker = new ComponentWalker(sourceFile, defaultRuleOptions);
    const stylesheetPath = './shared-styles/global.css';

    spyOn(walker, 'visitExternalStylesheet').and.callFake(node => {
      expect(node.getText()).toBe('external');
    });

    mockFs({[stylesheetPath]: 'external'});

    walker._reportExtraStylesheetFiles([stylesheetPath]);

    expect(walker.visitExternalStylesheet).toHaveBeenCalledTimes(1);
  });

  it('should not visit stylesheet files multiple times', () => {
    const sourceFile = createSourceFile(`
      @Component({
        styleUrls: ['./my-component.css']
      })
      export class MyComponent {}
    `);
    const walker = new ComponentWalker(sourceFile, defaultRuleOptions);
    const stylePath = join(dirname(sourceFile.fileName), 'my-component.css');

    spyOn(walker, 'visitExternalStylesheet').and.callFake(node => {
      expect(node.getText()).toBe('external');
    });

    mockFs({[stylePath]: 'external'});

    walker._reportExtraStylesheetFiles([stylePath]);
    walker.walk(sourceFile);

    expect(walker.visitExternalStylesheet).toHaveBeenCalledTimes(1);
  });

  it('should create external source files with proper offsets', () => {
    const sourceFile = createSourceFile(`
      @Component({
        styleUrls: ['./my-component.css']
      })
      export class MyComponent {}
    `);
    const walker = new ComponentWalker(sourceFile, defaultRuleOptions);
    const stylePath = join(dirname(sourceFile.fileName), 'my-component.css');
    const styleContent = 'external stylesheet';

    // Since the component walker is an enhanced TSLint rule walker and needs to report
    // the external styles and templates as a TypeScript source file in order to apply
    // replacements, the offsets of the fake TypeScript source file should not differentiate
    // from the original source file. Meaning that the string literal quotes, which are needed to
    // parse the resource file content as TypeScript node, should not invalidate the `width` and
    // `end` offsets of the source file.
    spyOn(walker, 'visitExternalStylesheet').and.callFake(node => {
      expect(node.getStart()).toBe(0);
      expect(node.getEnd()).toBe(styleContent.length);
      expect(node.getWidth()).toBe(styleContent.length);
      expect(node.getFullWidth()).toBe(styleContent.length);
    });

    mockFs({[stylePath]: styleContent});

    walker.walk(sourceFile);

    expect(walker.visitExternalStylesheet).toHaveBeenCalledTimes(1);
  });
});

/** TypeScript source file content that includes a component with inline styles. */
const inlineStylesheetSource = `
  @Component({
    styles: [':host { color: red; }']
  }
  export class MyComponent {}
`;

/** TypeScript source file content that includes an inline component template. */
const inlineTemplateSource = `
  @Component({
    template: '<span>My component</span>'
  }
  export class MyComponent {}
`;

/** TypeScript source file that includes a component with external styles. */
const externalStylesheetSource = `
  @Component({
    styleUrls: ['./my-component.css']
  })
  export class MyComponent {}
`;

/** TypeScript source file that includes a component with an external template. */
const externalTemplateSource = `
  @Component({
    templateUrl: './my-component.html',
  })
  export class MyComponent {}
`;
