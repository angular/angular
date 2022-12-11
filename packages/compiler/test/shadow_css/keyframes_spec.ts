/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {shim} from './utils';

describe('ShadowCss, keyframes and animations', () => {
  it('should scope keyframes rules', () => {
    const css = '@keyframes foo {0% {transform:translate(-50%) scaleX(0);}}';
    const expected = '@keyframes host-a_foo {0% {transform:translate(-50%) scaleX(0);}}';
    expect(shim(css, 'host-a')).toEqual(expected);
  });

  it('should scope -webkit-keyframes rules', () => {
    const css = '@-webkit-keyframes foo {0% {-webkit-transform:translate(-50%) scaleX(0);}} ';
    const expected =
        '@-webkit-keyframes host-a_foo {0% {-webkit-transform:translate(-50%) scaleX(0);}}';
    expect(shim(css, 'host-a')).toEqual(expected);
  });

  it('should scope animations using local keyframes identifiers', () => {
    const css = `
        button {
            animation: foo 10s ease;
        }
        @keyframes foo {
            0% {
            transform: translate(-50%) scaleX(0);
            }
        }
        `;
    const result = shim(css, 'host-a');
    expect(result).toContain('animation: host-a_foo 10s ease;');
  });

  it('should not scope animations using non-local keyframes identifiers', () => {
    const css = `
        button {
            animation: foo 10s ease;
        }
        `;
    const result = shim(css, 'host-a');
    expect(result).toContain('animation: foo 10s ease;');
  });

  it('should scope animation-names using local keyframes identifiers', () => {
    const css = `
        button {
            animation-name: foo;
        }
        @keyframes foo {
            0% {
            transform: translate(-50%) scaleX(0);
            }
        }
        `;
    const result = shim(css, 'host-a');
    expect(result).toContain('animation-name: host-a_foo;');
  });

  it('should not scope animation-names using non-local keyframes identifiers', () => {
    const css = `
        button {
            animation-name: foo;
        }
        `;
    const result = shim(css, 'host-a');
    expect(result).toContain('animation-name: foo;');
  });

  it('should handle (scope or not) multiple animation-names', () => {
    const css = `
        button {
            animation-name: foo, bar,baz, qux , quux ,corge ,grault ,garply, waldo;
        }
        @keyframes foo {}
        @keyframes baz {}
        @keyframes quux {}
        @keyframes grault {}
        @keyframes waldo {}`;
    const result = shim(css, 'host-a');
    const animationNames = [
      'host-a_foo',
      ' bar',
      'host-a_baz',
      ' qux ',
      ' host-a_quux ',
      'corge ',
      'host-a_grault ',
      'garply',
      ' host-a_waldo',
    ];
    const expected = `animation-name: ${animationNames.join(',')};`;
    expect(result).toContain(expected);
  });

  it('should handle (scope or not) multiple animation-names defined over multiple lines', () => {
    const css = `
        button {
            animation-name: foo,
                            bar,baz,
                            qux ,
                            quux ,
                            grault,
                            garply, waldo;
        }
        @keyframes foo {}
        @keyframes baz {}
        @keyframes quux {}
        @keyframes grault {}`;
    const result = shim(css, 'host-a');
    ['foo', 'baz', 'quux', 'grault'].forEach(
        scoped => expect(result).toContain(`host-a_${scoped}`));
    ['bar', 'qux', 'garply', 'waldo'].forEach(nonScoped => {
      expect(result).toContain(nonScoped);
      expect(result).not.toContain(`host-a_${nonScoped}`);
    });
  });

  it('should handle (scope or not) multiple animation definitions in a single declaration', () => {
    const css = `
        div {
            animation: 1s ease foo, 2s bar infinite, forwards baz 3s;
        }

        p {
            animation: 1s "foo", 2s "bar";
        }

        span {
            animation: .5s ease 'quux',
                        1s foo infinite, forwards "baz'" 1.5s,
                        2s bar;
        }

        button {
            animation: .5s bar,
                        1s foo 0.3s, 2s quux;
        }

        @keyframes bar {}
        @keyframes quux {}
        @keyframes "baz'" {}`;
    const result = shim(css, 'host-a');
    expect(result).toContain('animation: 1s ease foo, 2s host-a_bar infinite, forwards baz 3s;');
    expect(result).toContain('animation: 1s "foo", 2s "host-a_bar";');
    expect(result).toContain(`
            animation: .5s host-a_bar,
                        1s foo 0.3s, 2s host-a_quux;`);
    expect(result).toContain(`
            animation: .5s ease 'host-a_quux',
                        1s foo infinite, forwards "host-a_baz'" 1.5s,
                        2s host-a_bar;`);
  });

  it(`should not modify css variables ending with 'animation' even if they reference a local keyframes identifier`,
     () => {
       const css = `
        button {
            --variable-animation: foo;
        }
        @keyframes foo {}`;
       const result = shim(css, 'host-a');
       expect(result).toContain('--variable-animation: foo;');
     });

  it(`should not modify css variables ending with 'animation-name' even if they reference a local keyframes identifier`,
     () => {
       const css = `
        button {
            --variable-animation-name: foo;
        }
        @keyframes foo {}`;
       const result = shim(css, 'host-a');
       expect(result).toContain('--variable-animation-name: foo;');
     });

  it('should maintain the spacing when handling (scoping or not) keyframes and animations', () => {
    const css = `
        div {
            animation-name : foo;
            animation:  5s bar   1s backwards;
            animation : 3s baz ;
            animation-name:foobar ;
            animation:1s "foo" ,   2s "bar",3s "quux";
        }

        @-webkit-keyframes  bar {}
        @keyframes foobar  {}
        @keyframes quux {}
        `;
    const result = shim(css, 'host-a');
    expect(result).toContain('animation-name : foo;');
    expect(result).toContain('animation:  5s host-a_bar   1s backwards;');
    expect(result).toContain('animation : 3s baz ;');
    expect(result).toContain('animation-name:host-a_foobar ;');
    expect(result).toContain('@-webkit-keyframes  host-a_bar {}');
    expect(result).toContain('@keyframes host-a_foobar  {}');
    expect(result).toContain('animation:1s "foo" ,   2s "host-a_bar",3s "host-a_quux"');
  });

  it('should correctly process animations defined without any prefixed space', () => {
    let css = '.test{display: flex;animation:foo 1s forwards;} @keyframes foo {}';
    let expected =
        '.test[host-a]{display: flex;animation:host-a_foo 1s forwards;} @keyframes host-a_foo {}';
    expect(shim(css, 'host-a')).toEqual(expected);
    css = '.test{animation:foo 2s forwards;} @keyframes foo {}';
    expected = '.test[host-a]{animation:host-a_foo 2s forwards;} @keyframes host-a_foo {}';
    expect(shim(css, 'host-a')).toEqual(expected);
    css = 'button {display: block;animation-name: foobar;} @keyframes foobar {}';
    expected =
        'button[host-a] {display: block;animation-name: host-a_foobar;} @keyframes host-a_foobar {}';
    expect(shim(css, 'host-a')).toEqual(expected);
  });

  it('should correctly process keyframes defined without any prefixed space', () => {
    let css = '.test{display: flex;animation:bar 1s forwards;}@keyframes bar {}';
    let expected =
        '.test[host-a]{display: flex;animation:host-a_bar 1s forwards;}@keyframes host-a_bar {}';
    expect(shim(css, 'host-a')).toEqual(expected);
    css = '.test{animation:bar 2s forwards;}@-webkit-keyframes bar {}';
    expected = '.test[host-a]{animation:host-a_bar 2s forwards;}@-webkit-keyframes host-a_bar {}';
    expect(shim(css, 'host-a')).toEqual(expected);
  });

  it('should ignore keywords values when scoping local animations', () => {
    const css = `
        div {
            animation: inherit;
            animation: unset;
            animation: 3s ease reverse foo;
            animation: 5s foo 1s backwards;
            animation: none 1s foo;
            animation: .5s foo paused;
            animation: 1s running foo;
            animation: 3s linear 1s infinite running foo;
            animation: 5s foo ease;
            animation: 3s .5s infinite steps(3,end) foo;
            animation: 5s steps(9, jump-start) jump .5s;
            animation: 1s step-end steps;
        }

        @keyframes foo {}
        @keyframes inherit {}
        @keyframes unset {}
        @keyframes ease {}
        @keyframes reverse {}
        @keyframes backwards {}
        @keyframes none {}
        @keyframes paused {}
        @keyframes linear {}
        @keyframes running {}
        @keyframes end {}
        @keyframes jump {}
        @keyframes start {}
        @keyframes steps {}
        `;
    const result = shim(css, 'host-a');
    expect(result).toContain('animation: inherit;');
    expect(result).toContain('animation: unset;');
    expect(result).toContain('animation: 3s ease reverse host-a_foo;');
    expect(result).toContain('animation: 5s host-a_foo 1s backwards;');
    expect(result).toContain('animation: none 1s host-a_foo;');
    expect(result).toContain('animation: .5s host-a_foo paused;');
    expect(result).toContain('animation: 1s running host-a_foo;');
    expect(result).toContain('animation: 3s linear 1s infinite running host-a_foo;');
    expect(result).toContain('animation: 5s host-a_foo ease;');
    expect(result).toContain('animation: 3s .5s infinite steps(3,end) host-a_foo;');
    expect(result).toContain('animation: 5s steps(9, jump-start) host-a_jump .5s;');
    expect(result).toContain('animation: 1s step-end host-a_steps;');
  });

  it('should handle the usage of quotes', () => {
    const css = `
        div {
            animation: 1.5s foo;
        }

        p {
            animation: 1s 'foz bar';
        }

        @keyframes 'foo' {}
        @keyframes "foz bar" {}
        @keyframes bar {}
        @keyframes baz {}
        @keyframes qux {}
        @keyframes quux {}
        `;
    const result = shim(css, 'host-a');
    expect(result).toContain('@keyframes \'host-a_foo\' {}');
    expect(result).toContain('@keyframes "host-a_foz bar" {}');
    expect(result).toContain('animation: 1.5s host-a_foo;');
    expect(result).toContain('animation: 1s \'host-a_foz bar\';');
  });

  it('should handle the usage of quotes containing escaped quotes', () => {
    const css = `
        div {
            animation: 1.5s "foo\\"bar";
        }

        p {
            animation: 1s 'bar\\' \\'baz';
        }

        button {
            animation-name: 'foz " baz';
        }

        @keyframes "foo\\"bar" {}
        @keyframes "bar' 'baz" {}
        @keyframes "foz \\" baz" {}
        `;
    const result = shim(css, 'host-a');
    expect(result).toContain('@keyframes "host-a_foo\\"bar" {}');
    expect(result).toContain(`@keyframes "host-a_bar' 'baz" {}`);
    expect(result).toContain('@keyframes "host-a_foz \\" baz" {}');
    expect(result).toContain('animation: 1.5s "host-a_foo\\"bar";');
    expect(result).toContain('animation: 1s \'host-a_bar\\\' \\\'baz\';');
    expect(result).toContain(`animation-name: 'host-a_foz " baz';`);
  });

  it('should handle the usage of commas in multiple animation definitions in a single declaration',
     () => {
       const css = `
         button {
           animation: 1s "foo bar, baz", 2s 'qux quux';
         }

         div {
           animation: 500ms foo, 1s 'bar, baz', 1500ms bar;
         }

         p {
           animation: 3s "bar, baz", 3s 'foo, bar' 1s, 3s "qux quux";
         }

         @keyframes "qux quux" {}
         @keyframes "bar, baz" {}
       `;
       const result = shim(css, 'host-a');
       expect(result).toContain('@keyframes "host-a_qux quux" {}');
       expect(result).toContain('@keyframes "host-a_bar, baz" {}');
       expect(result).toContain(`animation: 1s "foo bar, baz", 2s 'host-a_qux quux';`);
       expect(result).toContain('animation: 500ms foo, 1s \'host-a_bar, baz\', 1500ms bar;');
       expect(result).toContain(
           `animation: 3s "host-a_bar, baz", 3s 'foo, bar' 1s, 3s "host-a_qux quux";`);
     });

  it('should handle the usage of double quotes escaping in multiple animation definitions in a single declaration',
     () => {
       const css = `
        div {
            animation: 1s "foo", 1.5s "bar";
            animation: 2s "fo\\"o", 2.5s "bar";
            animation: 3s "foo\\"", 3.5s "bar", 3.7s "ba\\"r";
            animation: 4s "foo\\\\", 4.5s "bar", 4.7s "baz\\"";
            animation: 5s "fo\\\\\\"o", 5.5s "bar", 5.7s "baz\\"";
        }

        @keyframes "foo" {}
        @keyframes "fo\\"o" {}
        @keyframes 'foo"' {}
        @keyframes 'foo\\\\' {}
        @keyframes bar {}
        @keyframes "ba\\"r" {}
        @keyframes "fo\\\\\\"o" {}
        `;
       const result = shim(css, 'host-a');
       expect(result).toContain('@keyframes "host-a_foo" {}');
       expect(result).toContain('@keyframes "host-a_fo\\"o" {}');
       expect(result).toContain(`@keyframes 'host-a_foo"' {}`);
       expect(result).toContain('@keyframes \'host-a_foo\\\\\' {}');
       expect(result).toContain('@keyframes host-a_bar {}');
       expect(result).toContain('@keyframes "host-a_ba\\"r" {}');
       expect(result).toContain('@keyframes "host-a_fo\\\\\\"o"');
       expect(result).toContain('animation: 1s "host-a_foo", 1.5s "host-a_bar";');
       expect(result).toContain('animation: 2s "host-a_fo\\"o", 2.5s "host-a_bar";');
       expect(result).toContain(
           'animation: 3s "host-a_foo\\"", 3.5s "host-a_bar", 3.7s "host-a_ba\\"r";');
       expect(result).toContain(
           'animation: 4s "host-a_foo\\\\", 4.5s "host-a_bar", 4.7s "baz\\"";');
       expect(result).toContain(
           'animation: 5s "host-a_fo\\\\\\"o", 5.5s "host-a_bar", 5.7s "baz\\"";');
     });

  it('should handle the usage of single quotes escaping in multiple animation definitions in a single declaration',
     () => {
       const css = `
        div {
            animation: 1s 'foo', 1.5s 'bar';
            animation: 2s 'fo\\'o', 2.5s 'bar';
            animation: 3s 'foo\\'', 3.5s 'bar', 3.7s 'ba\\'r';
            animation: 4s 'foo\\\\', 4.5s 'bar', 4.7s 'baz\\'';
            animation: 5s 'fo\\\\\\'o', 5.5s 'bar', 5.7s 'baz\\'';
        }

        @keyframes foo {}
        @keyframes 'fo\\'o' {}
        @keyframes 'foo'' {}
        @keyframes 'foo\\\\' {}
        @keyframes "bar" {}
        @keyframes 'ba\\'r' {}
        @keyframes "fo\\\\\\'o" {}
        `;
       const result = shim(css, 'host-a');
       expect(result).toContain('@keyframes host-a_foo {}');
       expect(result).toContain('@keyframes \'host-a_fo\\\'o\' {}');
       expect(result).toContain('@keyframes \'host-a_foo\'\' {}');
       expect(result).toContain('@keyframes \'host-a_foo\\\\\' {}');
       expect(result).toContain('@keyframes "host-a_bar" {}');
       expect(result).toContain('@keyframes \'host-a_ba\\\'r\' {}');
       expect(result).toContain(`@keyframes "host-a_fo\\\\\\'o" {}`);
       expect(result).toContain('animation: 1s \'host-a_foo\', 1.5s \'host-a_bar\';');
       expect(result).toContain('animation: 2s \'host-a_fo\\\'o\', 2.5s \'host-a_bar\';');
       expect(result).toContain(
           'animation: 3s \'host-a_foo\\\'\', 3.5s \'host-a_bar\', 3.7s \'host-a_ba\\\'r\';');
       expect(result).toContain(
           'animation: 4s \'host-a_foo\\\\\', 4.5s \'host-a_bar\', 4.7s \'baz\\\'\';');
       expect(result).toContain(
           'animation: 5s \'host-a_fo\\\\\\\'o\', 5.5s \'host-a_bar\', 5.7s \'baz\\\'\'');
     });

  it('should handle the usage of mixed single and double quotes escaping in multiple animation definitions in a single declaration',
     () => {
       const css = `
        div {
            animation: 1s 'f\\"oo', 1.5s "ba\\'r";
            animation: 2s "fo\\"\\"o", 2.5s 'b\\\\"ar';
            animation: 3s 'foo\\\\', 3.5s "b\\\\\\"ar", 3.7s 'ba\\'\\"\\'r';
            animation: 4s 'fo\\'o', 4.5s 'b\\"ar\\"', 4.7s "baz\\'";
        }

        @keyframes 'f"oo' {}
        @keyframes 'fo""o' {}
        @keyframes 'foo\\\\' {}
        @keyframes 'fo\\'o' {}
        @keyframes 'ba\\'r' {}
        @keyframes 'b\\\\"ar' {}
        @keyframes 'b\\\\\\"ar' {}
        @keyframes 'b"ar"' {}
        @keyframes 'ba\\'\\"\\'r' {}
        `;
       const result = shim(css, 'host-a');
       expect(result).toContain(`@keyframes 'host-a_f"oo' {}`);
       expect(result).toContain(`@keyframes 'host-a_fo""o' {}`);
       expect(result).toContain('@keyframes \'host-a_foo\\\\\' {}');
       expect(result).toContain('@keyframes \'host-a_fo\\\'o\' {}');
       expect(result).toContain('@keyframes \'host-a_ba\\\'r\' {}');
       expect(result).toContain(`@keyframes 'host-a_b\\\\"ar' {}`);
       expect(result).toContain(`@keyframes 'host-a_b\\\\\\"ar' {}`);
       expect(result).toContain(`@keyframes 'host-a_b"ar"' {}`);
       expect(result).toContain(`@keyframes 'host-a_ba\\'\\"\\'r' {}`);
       expect(result).toContain(`animation: 1s 'host-a_f\\"oo', 1.5s "host-a_ba\\'r";`);
       expect(result).toContain(`animation: 2s "host-a_fo\\"\\"o", 2.5s 'host-a_b\\\\"ar';`);
       expect(result).toContain(
           `animation: 3s 'host-a_foo\\\\', 3.5s "host-a_b\\\\\\"ar", 3.7s 'host-a_ba\\'\\"\\'r';`);
       expect(result).toContain(
           `animation: 4s 'host-a_fo\\'o', 4.5s 'host-a_b\\"ar\\"', 4.7s "baz\\'";`);
     });

  it('should handle the usage of commas inside quotes', () => {
    const css = `
        div {
            animation: 3s 'bar,, baz';
        }

        p {
            animation-name: "bar,, baz", foo,'ease, linear , inherit', bar;
        }

        @keyframes 'foo' {}
        @keyframes 'bar,, baz' {}
        @keyframes 'ease, linear , inherit' {}
        `;
    const result = shim(css, 'host-a');
    expect(result).toContain('@keyframes \'host-a_bar,, baz\' {}');
    expect(result).toContain('animation: 3s \'host-a_bar,, baz\';');
    expect(result).toContain(
        `animation-name: "host-a_bar,, baz", host-a_foo,'host-a_ease, linear , inherit', bar;`);
  });

  it('should not ignore animation keywords when they are inside quotes', () => {
    const css = `
        div {
            animation: 3s 'unset';
        }

        button {
            animation: 5s "forwards" 1s forwards;
        }

        @keyframes unset {}
        @keyframes forwards {}
        `;
    const result = shim(css, 'host-a');
    expect(result).toContain('@keyframes host-a_unset {}');
    expect(result).toContain('@keyframes host-a_forwards {}');
    expect(result).toContain('animation: 3s \'host-a_unset\';');
    expect(result).toContain('animation: 5s "host-a_forwards" 1s forwards;');
  });

  it('should handle css functions correctly', () => {
    const css = `
        div {
            animation: foo 0.5s alternate infinite cubic-bezier(.17, .67, .83, .67);
        }

        button {
            animation: calc(2s / 2) calc;
        }

        @keyframes foo {}
        @keyframes cubic-bezier {}
        @keyframes calc {}
        `;
    const result = shim(css, 'host-a');
    expect(result).toContain('@keyframes host-a_cubic-bezier {}');
    expect(result).toContain('@keyframes host-a_calc {}');
    expect(result).toContain(
        'animation: host-a_foo 0.5s alternate infinite cubic-bezier(.17, .67, .83, .67);');
    expect(result).toContain('animation: calc(2s / 2) host-a_calc;');
  });
});
