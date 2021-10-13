/* eslint-disable jasmine/no-spec-dupes */
const removeEslintComments = require('./removeEslintComments');

describe('removeEslintComments', () => {

  it('should return the given input if that is null or undefined', () => {
    expect(removeEslintComments(null, 'ts')).toEqual(null);
    expect(removeEslintComments(undefined, 'html')).toEqual(undefined);
  });

  it('should return the given input if the provided fileType is neither js, ts nor html', () => {
    const testText = `
      Simple text containing comments js comments like:
        /* eslint-disable */
      and html ones like:
        <!-- eslint-disable-line -->
    `;
    expect(removeEslintComments(testText)).toEqual(testText);
    expect(removeEslintComments(testText, 'css')).toEqual(testText);
    expect(removeEslintComments(testText, 'json')).toEqual(testText);
  });

  describe('js and ts', () => {
    const rmv = source => removeEslintComments(source, 'ts');

    it('should remove correctly eslint-disable comments', () => {
      let source = `/* eslint-disable @angular-eslint/no-input-rename,
      @angular-eslint/no-inputs-metadata-property,
      @angular-eslint/no-output-rename,
      @angular-eslint/no-outputs-metadata-property */
      import { Component, EventEmitter, Input, Output } from '@angular/core';

      @Component({
      `;
      expect(rmv(source)).toMatch(
        createRegexForMatching(
        'import { Component, EventEmitter, Input, Output } from \'@angular/core\';\n\n {6}@Component({\n {6}'
        )
      );
      source = `/* eslint-disable foo */
          var foo = 'foo';`;
      expect(rmv(source)).toEqual('var foo = \'foo\';');
      source = `/* eslint-disable foo, bar, baz */
          var fooBarBaz = 'foo, bar and baz';`;
      expect(rmv(source)).toEqual('var fooBarBaz = \'foo, bar and baz\';');
    });

    it('should remove correctly eslint-enable and eslint-disable comments', () => {
      const source = `
        /* eslint-disable */
        import { test } from './test';
        if ( test != null ) {
        /* eslint-enable */
      `;
      expect(rmv(source)).toMatch(
        createRegexForMatching(
          '\n {8}import { test } from \'./test\';\n {8}if ( test != null ) {\n {6}'
        )
      );
    });

    it('should remove correctly eslint-disable-line comments', () => {
      let source = 'var i = 1; // eslint-disable-line no-var';
      expect(rmv(source)).toEqual('var i = 1;');
      source = 'const foo = "foo";// eslint-disable-line';
      expect(rmv(source)).toEqual('const foo = "foo";');
      source = 'const bar = 123; /* eslint-disable-line no-unused-vars */';
      expect(rmv(source)).toEqual('const bar = 123;');
      source = 'var baz = false; /* eslint-disable-line no-unused-vars, no-var */';
      expect(rmv(source)).toEqual('var baz = false;');
    });

    it('should remove correctly eslint-disable-next-line comments', () => {
      let source = `// eslint-disable-next-line @typescript-eslint/quotes
      const string = "string test";`;
      expect(rmv(source)).toEqual('const string = "string test";');
      source = '// eslint-disable-next-line foo';
      expect(rmv(source)).toEqual('');
      source = `// eslint-disable-next-line no-console, quotes
      console.log("log test");`;
      expect(rmv(source)).toEqual('console.log("log test");');
    });

    it('should remove correctly a mix of different types of eslint comments', () => {
      let source = `
      /* eslint-disable */
      var mixed1 = 'test';
      /* eslint-enable */
      mixed1 = "test1"; // eslint-disable-line semi, quotes

      // eslint-disable-next-line eqeqeq
      return mixed1 == 'test';
      `;
      expect(rmv(source)).toMatch(
        createRegexForMatching(
          '\n {6}var mixed1 = \'test\';\n {6}mixed1 = "test1";\n\n {6}return mixed1 == \'test\';\n {6}'
        )
      );
      source = `
      /* eslint-enable *//* eslint-disable */
      var mixed2 = "test"; // eslint-disable-line
      /* eslint-disable */
      // eslint-disable-next-line
      console.log(mixed2);
      /* eslint-enable */
      `;
      expect(rmv(source)).toMatch(
        createRegexForMatching('var mixed2 = "test";\n {6}console.log(mixed2);\n {6}')
      );
    });

    it('should handle any number of spaces around the eslint directive', () => {
      let source = `// eslint-disable-next-line        no-vars
        var v1 = 123;
      `;
      expect(rmv(source)).toMatch(createRegexForMatching('var v1 = 123;\n {6}'));
      source = 'var v2 = 234;//eslint-disable-line     ';
      expect(rmv(source)).toEqual('var v2 = 234;');
      source = 'var v3 = 345;//                 eslint-disable-line     no-vars';
      expect(rmv(source)).toEqual('var v3 = 345;');
      source = `     /*        eslint-disable no-vars              */
        var v4 = 456;
        /*eslint-enable no-vars*/
        `;
      expect(rmv(source)).toMatch(createRegexForMatching(' {5}var v4 = 456;\n {8}'));
      source = `/*eslint-disable foo*/
        var v5 = 567;`;
      expect(rmv(source)).toEqual('var v5 = 567;');
    });

    it('should ignore generic comments containing eslint terms', () => {
      let source = `
        /* this is not an eslint-disable comment */
        // and this is not an eslint-disable-line comment
        // this isn't an eslint comment at all
        `;
      expect(rmv(source)).toEqual(source);
    });

    it('should ignore incorrect eslint comments', () => {
      const source = `
        /* eslint-disable-nonsense */
        // eslint-disable-next line
        // eslint-disable-next-line-nonsense
        // eslint-disable-line-nonsense
        // eslint-disable--next-line
        /* eslint disable */
        // eslint-enable-line
        // eslint-enable-next-line
      `;
      expect(rmv(source)).toEqual(source);
    });

    it('should remove html eslint comments', () => {
      const source = `
        import { Component, OnInit, Input } from '@angular/core';

        @Component({
          selector: 'app-test',
          template: \`
            <!-- eslint-disable @angular-eslint/template/eqeqeq -->
            <p *ngIf="eslintTest != null" (click)="eslintTest()"> <!-- eslint-disable-line @angular-eslint/template/eqeqeq -->
              run eslint test
            </p>
          \`,
          styles: []
        })
        export class TestComponent implements OnInit {
          @Input() eslintTest: () => {};
      `;
      expect(rmv(source)).toMatch(
        createRegexForMatching(
          '\n {8}import { Component, OnInit, Input } from \'@angular/core\';\n\n {8}@Component({\n' +
          ' {10}selector: \'app-test\',\n {10}template: `\n' +
          ' {12}<p *ngIf="eslintTest != null" (click)="eslintTest()">\n' +
          ' {14}run eslint test\n {12}</p>\n {10}`,\n {10}styles: []\n {8}})\n' +
          ' {8}export class TestComponent implements OnInit {\n' +
          ' {10}@Input() eslintTest: () => {};\n {6}'
        )
      );
    });

    it('should remove correctly eslint directive comments containing descriptions', () => {
      let source = `// eslint-disable-next-line a-rule, another-rule -- those are buggy!!
      const aRule = "another-rule";`;
      expect(rmv(source)).toEqual('const aRule = "another-rule";');
      source = `/* eslint-disable max-len, no-var --
        Disabling the rule is necessary here because we have
        variables declared with var which contain very long strings
      */

      export class Utils {`;
      expect(rmv(source)).toMatch(createRegexForMatching('\n {6}export class Utils {'));
    });

  });

  describe('html', () => {
    const rmv = source => removeEslintComments(source, 'html');

    it('should remove correctly eslint-disable comments', () => {
      const source = `<!-- eslint-disable @angular-eslint/template/eqeqeq,
                              @angular-eslint/template/accessibility-alt-text -->
                          <img *ngIf="src == null" scr="test" />`;
      expect(rmv(source)).toEqual('<img *ngIf="src == null" scr="test" />');
    });

    it('should remove correctly eslint-enable and eslint-disable comments', () => {
      const source = `<!-- eslint-disable @angular-eslint/template/accessibility-alt-text -->
      <img scr="test1" />
      <!-- eslint-enable @angular-eslint/template/accessibility-alt-text -->`;
      expect(rmv(source)).toEqual('<img scr="test1" />');
    });

    it('should remove correctly eslint-disable-line comments', () => {
      let source = '<span *ngIf="i == 8">eight</span> <!-- eslint-disable-line @angular-eslint/template/eqeqeq -->';
      expect(rmv(source)).toEqual('<span *ngIf="i == 8">eight</span>');
      source = '<span *ngIf="i == 9">nine</span><!-- eslint-disable-line -->';
      expect(rmv(source)).toEqual('<span *ngIf="i == 9">nine</span>');
      source = `<div *ngIf="i == 10"> <!-- eslint-disable-line -->
        <label>Ten</label>
      </div>`;
      expect(rmv(source)).toMatch(createRegexForMatching('<div *ngIf="i == 10">\n {8}<label>Ten</label>\n {6}</div>'));
    });

    it('should remove correctly eslint-disable-next-line comments', () => {
      const source = `<!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events -->
      <a (click)="onClick()">disable-next-line link</a>`;
      expect(rmv(source)).toEqual('<a (click)="onClick()">disable-next-line link</a>');
    });

    it('should remove correctly a mix of different types of eslint comments', () => {
      let source = `
      <!-- eslint-disable -->
      <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events -->
      <a (click)="onClick()"> mixed1 </a> <!-- eslint-disable-line -->
      <!-- eslint-enable -->
      `;
      expect(rmv(source)).toMatch(createRegexForMatching('\n {6}<a (click)="onClick()"> mixed1 </a>\n {6}'));
      source = `
      <!-- eslint-disable --><!-- eslint-disable -->
      <a (click)="onClick()"> mixed2 </a> <!-- eslint-disable-line -->
      `;
      expect(rmv(source)).toMatch(createRegexForMatching('\n {6}<a (click)="onClick()"> mixed2 </a>\n {6}'));
    });

    it('should handle any number of spaces around the eslint directive', () => {
      let source = '<label>label outside a form</label><!--eslint-disable-line-->';
      expect(rmv(source)).toEqual('<label>label outside a form</label>');
      source = `<!--   eslint-disable-next-line     @angular-eslint/template/click-events-have-key-events -->
      <div (click)="click()" class="not-a-real-btn">click me</div>`;
      expect(rmv(source)).toEqual('<div (click)="click()" class="not-a-real-btn">click me</div>');
      source = `<!--eslint-disable-next-line-->
      <label>another label outside a form</label>`;
      expect(rmv(source)).toEqual('<label>another label outside a form</label>');
    });

    it('should ignore generic comments containing eslint terms', () => {
      let source = '<p *ngIf="text == null">{{ text }}</p> <!-- this like could be disabled with an eslint-disable-line comment -->';
      expect(rmv(source)).toEqual(source);
      source = `<!-- eslint-disable -->
        <!-- eslint ignores this next line -->
        <label>this label is not in a form, eslint should complain</label>
      <!-- eslint-enable -->`;
      expect(rmv(source)).toMatch(
        createRegexForMatching(
        '<!-- eslint ignores this next line -->\n {8}<label>this label is not in a form, eslint should complain</label>'
        )
      );
      source = `<!-- eslint-disable foo, bar, baz -->
        <p>Foo, Bar and Baz</p>
      <!-- eslint-enable -->`;
      expect(rmv(source)).toEqual('<p>Foo, Bar and Baz</p>');
    });

    it('should ignore incorrect eslint comments', () => {
      const source = `
        <!-- eslint-disable-nonsense -->
        <!-- eslint-disable-next line -->
        <!-- eslint-disable-next-line-nonsense -->
        <!-- eslint-disable-line-nonsense -->
        <!-- eslint-disable--next-line -->
        <!-- eslint disable -->
        <!-- eslint-enable-line -->
        <!-- eslint-enable-next-line -->
      `;
      expect(rmv(source)).toEqual(source);
    });

    it('should remove correctly eslint directive comments containing descriptions', () => {
      let source = `<!-- eslint-disable-next-line foo -- the following span needs to violate foo for business reasons -->
      <span>violating foo</span>`;
      expect(rmv(source)).toEqual('<span>violating foo</span>');
      source = `
      <!-- eslint-disable foo, bar, baz
        --
        This whole template does not respect rules foo, bar and baz,
        a task for refactoring it has been added to the backlog for
        now we just eslint-disable foo, bar and baz for the whole file
      -->

      <main>`;
      expect(rmv(source)).toMatch(createRegexForMatching('\n {6}\n {6}<main>'));
    });

  });

});

/**
 * Creates a regex based on a provided string, it performs a partial escape
 * of its special characters excluding curly braces surrounding a number so that it
 * converts a string such as "if(test) {3}{ }" to the regex /if\(test\) {3}\{ \}/,
 * it also surrounds the regex with ^ and $ (for stricter checkings)
 *
 * @param str input string
 * @returns output regex
 */
function createRegexForMatching(str) {
  const partiallyEscapedString = str.replace(/(?:[.?*+\\|^$()[\]])|{(?!\d+})|(?<!{\d+)}/g, '\\$&');
  return new RegExp(`^${partiallyEscapedString}$`);
}
