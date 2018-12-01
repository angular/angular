/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AttributeMarker, InitialStylingFlags, ViewEncapsulation} from '@angular/compiler/src/core';
import {setup} from '@angular/compiler/test/aot/test_util';
import {compile, expectEmit} from './mock_compile';

describe('compiler compliance: styling', () => {
  const angularFiles = setup({
    compileAngular: false,
    compileFakeCore: true,
    compileAnimations: false,
  });

  describe('@Component.styles', () => {
    it('should pass in the component metadata styles into the component definition and shim them using style encapsulation',
       () => {
         const files = {
           app: {
             'spec.ts': `
                import {Component, NgModule} from '@angular/core';

                @Component({
                  selector: "my-component",
                  styles: ["div.foo { color: red; }", ":host p:nth-child(even) { --webkit-transition: 1s linear all; }"],
                  template: "..."
                })
                export class MyComponent {
                }

                @NgModule({declarations: [MyComponent]})
                export class MyModule {}
            `
           }
         };

         const template =
             'styles: ["div.foo[_ngcontent-%COMP%] { color: red; }", "[_nghost-%COMP%]   p[_ngcontent-%COMP%]:nth-child(even) { --webkit-transition: 1s linear all; }"]';
         const result = compile(files, angularFiles);
         expectEmit(result.source, template, 'Incorrect template');
       });

    it('should pass in styles, but skip shimming the styles if the view encapsulation signals not to',
       () => {
         const files = {
           app: {
             'spec.ts': `
                import {Component, NgModule} from '@angular/core';

                @Component({
                  selector: "my-component",
                  encapsulation: ${ViewEncapsulation.None},
                  styles: ["div.tall { height: 123px; }", ":host.small p { height:5px; }"],
                  template: "..."
                })
                export class MyComponent {
                }

                @NgModule({declarations: [MyComponent]})
                export class MyModule {}
            `
           }
         };

         const template = 'div.tall { height: 123px; }", ":host.small p { height:5px; }';
         const result = compile(files, angularFiles);
         expectEmit(result.source, template, 'Incorrect template');
       });

    it('should pass in the component metadata styles into the component definition but skip shimming when style encapsulation is set to native',
       () => {
         const files = {
           app: {
             'spec.ts': `
                import {Component, NgModule} from '@angular/core';

                @Component({
                  encapsulation: ${ViewEncapsulation.Native},
                  selector: "my-component",
                  styles: ["div.cool { color: blue; }", ":host.nice p { color: gold; }"],
                  template: "..."
                })
                export class MyComponent {
                }

                @NgModule({declarations: [MyComponent]})
                export class MyModule {}
            `
           }
         };

         const template = `
         MyComponent.ngComponentDef = $r3$.ɵdefineComponent({
           …
           styles: ["div.cool { color: blue; }", ":host.nice p { color: gold; }"],
           encapsulation: 1
         })
         `;
         const result = compile(files, angularFiles);
         expectEmit(result.source, template, 'Incorrect template');
       });
  });

  describe('@Component.animations', () => {
    it('should pass in the component metadata animations into the component definition', () => {
      const files = {
        app: {
          'spec.ts': `
                import {Component, NgModule} from '@angular/core';

                @Component({
                  selector: "my-component",
                  animations: [{name: 'foo123'}, {name: 'trigger123'}],
                  template: ""
                })
                export class MyComponent {
                }

                @NgModule({declarations: [MyComponent]})
                export class MyModule {}
            `
        }
      };

      const template = `
        MyComponent.ngComponentDef = $r3$.ɵdefineComponent({
          type: MyComponent,
          selectors:[["my-component"]],
          factory:function MyComponent_Factory(t){
            return new (t || MyComponent)();
          },
          consts: 0,
          vars: 0,
          template:  function MyComponent_Template(rf, $ctx$) {
          },
          encapsulation: 2,
          data: {
            animations: [{name: 'foo123'}, {name: 'trigger123'}]
          }
        });
      `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should include animations even if the provided array is empty', () => {
      const files = {
        app: {
          'spec.ts': `
                import {Component, NgModule} from '@angular/core';

                @Component({
                  selector: "my-component",
                  animations: [],
                  template: ""
                })
                export class MyComponent {
                }

                @NgModule({declarations: [MyComponent]})
                export class MyModule {}
            `
        }
      };

      const template = `
        MyComponent.ngComponentDef = $r3$.ɵdefineComponent({
          type: MyComponent,
          selectors:[["my-component"]],
          factory:function MyComponent_Factory(t){
            return new (t || MyComponent)();
          },
          consts: 0,
          vars: 0,
          template:  function MyComponent_Template(rf, $ctx$) {
          },
          encapsulation: 2,
          data: {
            animations: []
          }
        });
      `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should generate any animation triggers into the component template', () => {
      const files = {
        app: {
          'spec.ts': `
                import {Component, NgModule} from '@angular/core';

                @Component({
                  selector: "my-component",
                  template: \`
                    <div [@foo]='exp'></div>
                    <div @bar></div>
                    <div [@baz]></div>\`,
                })
                export class MyComponent {
                }

                @NgModule({declarations: [MyComponent]})
                export class MyModule {}
            `
        }
      };

      const template = `
        const $e0_attrs$ = ["@foo", ""];
        const $e1_attrs$ = ["@bar", ""];
        const $e2_attrs$ = ["@baz", ""];
        …
        MyComponent.ngComponentDef = $r3$.ɵdefineComponent({
          …
          template:  function MyComponent_Template(rf, $ctx$) {
            if (rf & 1) {
              $r3$.ɵelement(0, "div", $e0_attrs$);
              $r3$.ɵelement(1, "div", $e1_attrs$);
              $r3$.ɵelement(2, "div", $e2_attrs$);
            }
            if (rf & 2) {
              $r3$.ɵelementAttribute(0, "@foo", $r3$.ɵbind(ctx.exp));
            }
          },
          encapsulation: 2
        });
      `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });
  });

  describe('[style] and [style.prop]', () => {
    it('should create style instructions on the element', () => {
      const files = {
        app: {
          'spec.ts': `
                import {Component, NgModule} from '@angular/core';

                @Component({
                  selector: 'my-component',
                  template: \`<div [style]="myStyleExp"></div>\`
                })
                export class MyComponent {
                  myStyleExp = [{color:'red'}, {color:'blue', duration:1000}]
                }

                @NgModule({declarations: [MyComponent]})
                export class MyModule {}
            `
        }
      };

      const template = `
          template: function MyComponent_Template(rf, $ctx$) {
            if (rf & 1) {
              $r3$.ɵelementStart(0, "div");
              $r3$.ɵelementStyling(null, null, $r3$.ɵdefaultStyleSanitizer);
              $r3$.ɵelementEnd();
            }
            if (rf & 2) {
              $r3$.ɵelementStylingMap(0, null, $ctx$.myStyleExp);
              $r3$.ɵelementStylingApply(0);
            }
          }
          `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should place initial, multi, singular and application followed by attribute style instructions in the template code in that order',
       () => {
         const files = {
           app: {
             'spec.ts': `
                import {Component, NgModule} from '@angular/core';

                @Component({
                  selector: 'my-component',
                  template: \`<div style="opacity:1"
                                   [attr.style]="'border-width: 10px'"
                                   [style.width]="myWidth"
                                   [style]="myStyleExp"
                                   [style.height]="myHeight"></div>\`
                })
                export class MyComponent {
                  myStyleExp = [{color:'red'}, {color:'blue', duration:1000}]
                  myWidth = '100px';
                  myHeight = '100px';
                }

                @NgModule({declarations: [MyComponent]})
                export class MyModule {}
            `
           }
         };

         const template = `
          const $e0_attrs$ = [${AttributeMarker.SelectOnly}, "style"];
          const $e0_styling$ = ["opacity","width","height",${InitialStylingFlags.VALUES_MODE},"opacity","1"];
          …
          MyComponent.ngComponentDef = $r3$.ɵdefineComponent({
              type: MyComponent,
              selectors:[["my-component"]],
              factory:function MyComponent_Factory(t){
                return new (t || MyComponent)();
              },
              consts: 1,
              vars: 1,
              template:  function MyComponent_Template(rf, $ctx$) {
                if (rf & 1) {
                  $r3$.ɵelementStart(0, "div", $e0_attrs$);
                  $r3$.ɵelementStyling(null, $e0_styling$, $r3$.ɵdefaultStyleSanitizer);
                  $r3$.ɵelementEnd();
                }
                if (rf & 2) {
                  $r3$.ɵelementStylingMap(0, null, $ctx$.myStyleExp);
                  $r3$.ɵelementStyleProp(0, 1, $ctx$.myWidth);
                  $r3$.ɵelementStyleProp(0, 2, $ctx$.myHeight);
                  $r3$.ɵelementStylingApply(0);
                  $r3$.ɵelementAttribute(0, "style", $r3$.ɵbind("border-width: 10px"), $r3$.ɵsanitizeStyle);
                }
              },
              encapsulation: 2
            });
        `;

         const result = compile(files, angularFiles);
         expectEmit(result.source, template, 'Incorrect template');
       });

    it('should assign a sanitizer instance to the element style allocation instruction if any url-based properties are detected',
       () => {
         const files = {
           app: {
             'spec.ts': `
                import {Component, NgModule} from '@angular/core';

                @Component({
                  selector: 'my-component',
                  template: \`<div [style.background-image]="myImage">\`
                })
                export class MyComponent {
                  myImage = 'url(foo.jpg)';
                }

                @NgModule({declarations: [MyComponent]})
                export class MyModule {}
            `
           }
         };

         const template = `
          const _c0 = ["background-image"];
          export class MyComponent {
              constructor() {
                  this.myImage = 'url(foo.jpg)';
              }
          }

          MyComponent.ngComponentDef = $r3$.ɵdefineComponent({
            type: MyComponent,
            selectors: [["my-component"]],
            factory: function MyComponent_Factory(t) {
              return new (t || MyComponent)();
            },
            consts: 1,
            vars: 0,
            template:  function MyComponent_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵelementStart(0, "div");
                $r3$.ɵelementStyling(null, _c0, $r3$.ɵdefaultStyleSanitizer);
                $r3$.ɵelementEnd();
              }
              if (rf & 2) {
                $r3$.ɵelementStyleProp(0, 0, ctx.myImage);
                $r3$.ɵelementStylingApply(0);
              }
            },
            encapsulation: 2
          });
        `;

         const result = compile(files, angularFiles);
         expectEmit(result.source, template, 'Incorrect template');
       });

    it('should support [style.foo.suffix] style bindings with a suffix', () => {

      const files = {
        app: {
          'spec.ts': `
             import {Component, NgModule} from '@angular/core';

             @Component({
               selector: 'my-component',
               template: \`<div [style.font-size.px]="12">\`
             })
             export class MyComponent {
             }

             @NgModule({declarations: [MyComponent]})
             export class MyModule {}
         `
        }
      };

      const template = `
          const $e0_styles$= ["font-size"];
          …
          template:  function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵelementStart(0, "div");
              $r3$.ɵelementStyling(null, _c0);
              $r3$.ɵelementEnd();
            }
            if (rf & 2) {
              $r3$.ɵelementStyleProp(0, 0, 12, "px");
              $r3$.ɵelementStylingApply(0);
            }
          }
     `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');

    });
  });

  describe('[class]', () => {
    it('should create class styling instructions on the element', () => {
      const files = {
        app: {
          'spec.ts': `
                import {Component, NgModule} from '@angular/core';

                @Component({
                  selector: 'my-component',
                  template: \`<div [class]="myClassExp"></div>\`
                })
                export class MyComponent {
                  myClassExp = {'foo':true}
                }

                @NgModule({declarations: [MyComponent]})
                export class MyModule {}
            `
        }
      };

      const template = `
          template: function MyComponent_Template(rf, $ctx$) {
            if (rf & 1) {
              $r3$.ɵelementStart(0, "div");
              $r3$.ɵelementStyling();
              $r3$.ɵelementEnd();
            }
            if (rf & 2) {
              $r3$.ɵelementStylingMap(0,$ctx$.myClassExp);
              $r3$.ɵelementStylingApply(0);
            }
          }
          `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should place initial, multi, singular and application followed by attribute class instructions in the template code in that order',
       () => {
         const files = {
           app: {
             'spec.ts': `
                import {Component, NgModule} from '@angular/core';

                @Component({
                  selector: 'my-component',
                  template: \`<div class="grape"
                                   [attr.class]="'banana'"
                                   [class.apple]="yesToApple"
                                   [class]="myClassExp"
                                   [class.orange]="yesToOrange"></div>\`
                })
                export class MyComponent {
                  myClassExp = {a:true, b:true};
                  yesToApple = true;
                  yesToOrange = true;
                }

                @NgModule({declarations: [MyComponent]})
                export class MyModule {}
            `
           }
         };

         const template = `
          const $e0_attrs$ = [${AttributeMarker.SelectOnly}, "class"];
          const $e0_cd$ = ["grape","apple","orange",${InitialStylingFlags.VALUES_MODE},"grape",true];
          …
          MyComponent.ngComponentDef = $r3$.ɵdefineComponent({
              type: MyComponent,
              selectors:[["my-component"]],
              factory:function MyComponent_Factory(t){
                return new (t || MyComponent)();
              },
              consts: 1,
              vars: 1,
              template:  function MyComponent_Template(rf, $ctx$) {
                if (rf & 1) {
                  $r3$.ɵelementStart(0, "div", $e0_attrs$);
                  $r3$.ɵelementStyling($e0_cd$);
                  $r3$.ɵelementEnd();
                }
                if (rf & 2) {
                  $r3$.ɵelementStylingMap(0, $ctx$.myClassExp);
                  $r3$.ɵelementClassProp(0, 1, $ctx$.yesToApple);
                  $r3$.ɵelementClassProp(0, 2, $ctx$.yesToOrange);
                  $r3$.ɵelementStylingApply(0);
                  $r3$.ɵelementAttribute(0, "class", $r3$.ɵbind("banana"));
                }
              },
              encapsulation: 2
            });
        `;

         const result = compile(files, angularFiles);
         expectEmit(result.source, template, 'Incorrect template');
       });

    it('should not generate the styling apply instruction if there are only static style/class attributes',
       () => {
         const files = {
           app: {
             'spec.ts': `
                import {Component, NgModule} from '@angular/core';

                @Component({
                  selector: 'my-component',
                  template: \`<div class="foo"
                                   style="width:100px"
                                   [attr.class]="'round'"
                                   [attr.style]="'height:100px'"></div>\`
                })
                export class MyComponent {}

                @NgModule({declarations: [MyComponent]})
                export class MyModule {}
            `
           }
         };

         const template = `
          const $e0_attrs$ = [${AttributeMarker.SelectOnly}, "class", "style"];
          const $e0_cd$ = ["foo",${InitialStylingFlags.VALUES_MODE},"foo",true];
          const $e0_sd$ = ["width",${InitialStylingFlags.VALUES_MODE},"width","100px"];
          …
          MyComponent.ngComponentDef = $r3$.ɵdefineComponent({
              type: MyComponent,
              selectors:[["my-component"]],
              factory:function MyComponent_Factory(t){
                return new (t || MyComponent)();
              },
              consts: 1,
              vars: 2,
              template:  function MyComponent_Template(rf, $ctx$) {
                if (rf & 1) {
                  $r3$.ɵelementStart(0, "div", $e0_attrs$);
                  $r3$.ɵelementStyling($e0_cd$, $e0_sd$);
                  $r3$.ɵelementEnd();
                }
                if (rf & 2) {
                  $r3$.ɵelementAttribute(0, "class", $r3$.ɵbind("round"));
                  $r3$.ɵelementAttribute(0, "style", $r3$.ɵbind("height:100px"), $r3$.ɵsanitizeStyle);
                }
              },
              encapsulation: 2
            });
        `;

         const result = compile(files, angularFiles);
         expectEmit(result.source, template, 'Incorrect template');
       });
  });

  describe('[style] mixed with [class]', () => {
    it('should combine [style] and [class] bindings into a single instruction', () => {
      const files = {
        app: {
          'spec.ts': `
                import {Component, NgModule} from '@angular/core';

                @Component({
                  selector: 'my-component',
                  template: \`<div [style]="myStyleExp" [class]="myClassExp"></div>\`
                })
                export class MyComponent {
                  myStyleExp = [{color:'red'}, {color:'blue', duration:1000}]
                  myClassExp = 'foo bar apple';
                }

                @NgModule({declarations: [MyComponent]})
                export class MyModule {}
            `
        }
      };

      const template = `
          template: function MyComponent_Template(rf, $ctx$) {
            if (rf & 1) {
              $r3$.ɵelementStart(0, "div");
              $r3$.ɵelementStyling(null, null, $r3$.ɵdefaultStyleSanitizer);
              $r3$.ɵelementEnd();
            }
            if (rf & 2) {
              $r3$.ɵelementStylingMap(0, $ctx$.myClassExp, $ctx$.myStyleExp);
              $r3$.ɵelementStylingApply(0);
            }
          }
          `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should stamp out pipe definitions in the creation block if used by styling bindings',
       () => {
         const files = {
           app: {
             'spec.ts': `
                import {Component, NgModule} from '@angular/core';

                @Component({
                  selector: 'my-component',
                  template: \`<div [style]="myStyleExp | stylePipe" [class]="myClassExp | classPipe"></div>\`
                })
                export class MyComponent {
                  myStyleExp = [{color:'red'}, {color:'blue', duration:1000}]
                  myClassExp = 'foo bar apple';
                }

                @NgModule({declarations: [MyComponent]})
                export class MyModule {}
            `
           }
         };

         const template = `
          template: function MyComponent_Template(rf, $ctx$) {
            if (rf & 1) {
              $r3$.ɵelementStart(0, "div");
              $r3$.ɵelementStyling(null, null, $r3$.ɵdefaultStyleSanitizer);
              $r3$.ɵpipe(1, "classPipe");
              $r3$.ɵpipe(2, "stylePipe");
              $r3$.ɵelementEnd();
            }
            if (rf & 2) {
              $r3$.ɵelementStylingMap(0, $r3$.ɵpipeBind1(1, 0, $ctx$.myClassExp), $r3$.ɵpipeBind1(2, 2, $ctx$.myStyleExp));
              $r3$.ɵelementStylingApply(0);
            }
          }
          `;

         const result = compile(files, angularFiles);
         expectEmit(result.source, template, 'Incorrect template');
       });

    it('should properly offset multiple style pipe references for styling bindings', () => {
      const files = {
        app: {
          'spec.ts': `
                import {Component, NgModule} from '@angular/core';

                @Component({
                  selector: 'my-component',
                  template: \`
                    <div [class]="{}"
                         [class.foo]="fooExp | pipe:2000"
                         [style]="myStyleExp | pipe:1000"
                         [style.bar]="barExp | pipe:3000"
                         [style.baz]="bazExp | pipe:4000">
                         {{ item }}</div>\`
                })
                export class MyComponent {
                  myStyleExp = {};
                  fooExp = 'foo';
                  barExp = 'bar';
                  bazExp = 'baz';
                  items = [1,2,3];
                }

                @NgModule({declarations: [MyComponent]})
                export class MyModule {}
            `
        }
      };

      const template = `
          template: function MyComponent_Template(rf, $ctx$) {
            if (rf & 1) {
              $r3$.ɵelementStart(0, "div");
              $r3$.ɵelementStyling($e0_styling$, $e1_styling$, $r3$.ɵdefaultStyleSanitizer);
              $r3$.ɵpipe(1, "pipe");
              $r3$.ɵpipe(2, "pipe");
              $r3$.ɵpipe(3, "pipe");
              $r3$.ɵpipe(4, "pipe");
              $r3$.ɵtext(5);
              $r3$.ɵelementEnd();
            }
            if (rf & 2) {
              $r3$.ɵelementStylingMap(0, $e2_styling$, $r3$.ɵpipeBind2(1, 1, $ctx$.myStyleExp, 1000));
              $r3$.ɵelementStyleProp(0, 0, $r3$.ɵpipeBind2(2, 4, $ctx$.barExp, 3000));
              $r3$.ɵelementStyleProp(0, 1, $r3$.ɵpipeBind2(3, 7, $ctx$.bazExp, 4000));
              $r3$.ɵelementClassProp(0, 0, $r3$.ɵpipeBind2(4, 10, $ctx$.fooExp, 2000));
              $r3$.ɵelementStylingApply(0);
              $r3$.ɵtextBinding(5, $r3$.ɵinterpolation1(" ", $ctx$.item, ""));
            }
          }
          `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });
  });

  describe('@Component host styles/classes', () => {
    it('should generate style/class instructions for a host component creation definition', () => {
      const files = {
        app: {
          'spec.ts': `
                import {Component, NgModule, HostBinding} from '@angular/core';

                @Component({
                  selector: 'my-component',
                  template: '',
                  host: {
                    'style': 'width:200px; height:500px',
                    'class': 'foo baz'
                  }
                })
                export class MyComponent {
                  @HostBinding('style')
                  myStyle = {width:'100px'};

                  @HostBinding('class')
                  myClass = {bar:false};

                  @HostBinding('style.color')
                  myColorProp = 'red';

                  @HostBinding('class.foo')
                  myFooClass = 'red';
                }

                @NgModule({declarations: [MyComponent]})
                export class MyModule {}
            `
        }
      };

      const template = `
          const _c0 = ["foo", "baz", ${InitialStylingFlags.VALUES_MODE}, "foo", true, "baz", true];
          const _c1 = ["width", "height", "color", ${InitialStylingFlags.VALUES_MODE}, "width", "200px", "height", "500px"];
          …
          hostBindings: function MyComponent_HostBindings(rf, ctx, elIndex) {
            if (rf & 1) {
              $r3$.ɵelementStyling(_c0, _c1, $r3$.ɵdefaultStyleSanitizer, ctx);
            }
            if (rf & 2) {
              $r3$.ɵelementStylingMap(elIndex, ctx.myClass, ctx.myStyle, ctx);
              $r3$.ɵelementStyleProp(elIndex, 2, ctx.myColorProp, null, ctx);
              $r3$.ɵelementClassProp(elIndex, 0, ctx.myFooClass, ctx);
              $r3$.ɵelementStylingApply(elIndex, ctx);
            }
          },
          consts: 0,
          vars: 0,
          `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should generate style/class instructions for multiple host binding definitions', () => {
      const files = {
        app: {
          'spec.ts': `
                import {Component, NgModule, HostBinding} from '@angular/core';

                @Component({
                  selector: 'my-component',
                  template: '',
                  host: {
                    '[style.height.pt]': 'myHeightProp',
                    '[class.bar]': 'myBarClass'
                  }
                })
                export class MyComponent {
                  myHeightProp = 20;
                  myBarClass = true;

                  @HostBinding('style')
                  myStyle = {};

                  @HostBinding('style.width')
                  myWidthProp = '500px';

                  @HostBinding('class.foo')
                  myFooClass = true;

                  @HostBinding('class')
                  myClasses = {a:true, b:true};
                }

                @NgModule({declarations: [MyComponent]})
                export class MyModule {}
            `
        }
      };

      const template = `
          const _c0 = ["bar", "foo"];
          const _c1 = ["height", "width"];
          …
          hostBindings: function MyComponent_HostBindings(rf, ctx, elIndex) {
            if (rf & 1) {
              $r3$.ɵelementStyling(_c0, _c1, $r3$.ɵdefaultStyleSanitizer, ctx);
            }
            if (rf & 2) {
              $r3$.ɵelementStylingMap(elIndex, ctx.myClasses, ctx.myStyle, ctx);
              $r3$.ɵelementStyleProp(elIndex, 0, ctx.myHeightProp, "pt", ctx);
              $r3$.ɵelementStyleProp(elIndex, 1, ctx.myWidthProp, null, ctx);
              $r3$.ɵelementClassProp(elIndex, 0, ctx.myBarClass, ctx);
              $r3$.ɵelementClassProp(elIndex, 1, ctx.myFooClass, ctx);
              $r3$.ɵelementStylingApply(elIndex, ctx);
            }
          },
          consts: 0,
          vars: 0,
          `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should generate styling instructions for multiple directives that contain host binding definitions',
       () => {
         const files = {
           app: {
             'spec.ts': `
                import {Directive, Component, NgModule, HostBinding} from '@angular/core';

                @Directive({selector: '[myWidthDir]'})
                export class WidthDirective {
                  @HostBinding('style.width')
                  myWidth = 200;

                  @HostBinding('class.foo')
                  myFooClass = true;
                }

                @Directive({selector: '[myHeightDir]'})
                export class HeightDirective {
                  @HostBinding('style.height')
                  myHeight = 200;

                  @HostBinding('class.bar')
                  myBarClass = true;
                }

                @Component({
                  selector: 'my-component',
                  template: '
                    <div myWidthDir myHeightDir></div>
                  ',
                })
                export class MyComponent {
                }

                @NgModule({declarations: [MyComponent, WidthDirective, HeightDirective]})
                export class MyModule {}
            `
           }
         };

         const template = `
          const _c0 = ["foo"];
          const _c1 = ["width"];
          const _c2 = ["bar"];
          const _c3 = ["height"];
          …
          function WidthDirective_HostBindings(rf, ctx, elIndex) {
            if (rf & 1) {
              $r3$.ɵelementStyling(_c0, _c1, null, ctx);
            }
            if (rf & 2) {
              $r3$.ɵelementStyleProp(elIndex, 0, ctx.myWidth, null, ctx);
              $r3$.ɵelementClassProp(elIndex, 0, ctx.myFooClass, ctx);
              $r3$.ɵelementStylingApply(elIndex, ctx);
            }
          }
          …
          function HeightDirective_HostBindings(rf, ctx, elIndex) {
            if (rf & 1) {
              $r3$.ɵelementStyling(_c2, _c3, null, ctx);
            }
            if (rf & 2) {
              $r3$.ɵelementStyleProp(elIndex, 0, ctx.myHeight, null, ctx);
              $r3$.ɵelementClassProp(elIndex, 0, ctx.myBarClass, ctx);
              $r3$.ɵelementStylingApply(elIndex, ctx);
            }
          }
          …
          `;

         const result = compile(files, angularFiles);
         expectEmit(result.source, template, 'Incorrect template');
       });
  });

  it('should count only non-style and non-class host bindings on Components', () => {
    const files = {
      app: {
        'spec.ts': `
          import {Component, NgModule, HostBinding} from '@angular/core';

          @Component({
            selector: 'my-component',
            template: '',
            host: {
              'style': 'width:200px; height:500px',
              'class': 'foo baz'
            }
          })
          export class MyComponent {
            @HostBinding('style')
            myStyle = {width:'100px'};

            @HostBinding('class')
            myClass = {bar:false};

            @HostBinding('id')
            id = 'some id';

            @HostBinding('title')
            title = 'some title';
          }

          @NgModule({declarations: [MyComponent]})
          export class MyModule {}
        `
      }
    };

    const template = `
      const $_c0$ = ["foo", "baz", ${InitialStylingFlags.VALUES_MODE}, "foo", true, "baz", true];
      const $_c1$ = ["width", "height", ${InitialStylingFlags.VALUES_MODE}, "width", "200px", "height", "500px"];
      …
      hostBindings: function MyComponent_HostBindings(rf, ctx, elIndex) {
        if (rf & 1) {
          $r3$.ɵallocHostVars(2);
          $r3$.ɵelementStyling($_c0$, $_c1$, $r3$.ɵdefaultStyleSanitizer, ctx);
        }
        if (rf & 2) {
          $r3$.ɵelementProperty(elIndex, "id", $r3$.ɵbind(ctx.id));
          $r3$.ɵelementProperty(elIndex, "title", $r3$.ɵbind(ctx.title));
          $r3$.ɵelementStylingMap(elIndex, ctx.myClass, ctx.myStyle, ctx);
          $r3$.ɵelementStylingApply(elIndex, ctx);
        }
      },
      consts: 0,
      vars: 0,
    `;

    const result = compile(files, angularFiles);
    expectEmit(result.source, template, 'Incorrect template');
  });

  it('should count only non-style and non-class host bindings on Directives', () => {
    const files = {
      app: {
        'spec.ts': `
          import {Directive, Component, NgModule, HostBinding} from '@angular/core';

          @Directive({selector: '[myWidthDir]'})
          export class WidthDirective {
            @HostBinding('style.width')
            myWidth = 200;

            @HostBinding('class.foo')
            myFooClass = true;

            @HostBinding('id')
            id = 'some id';

            @HostBinding('title')
            title = 'some title';
          }
        `
      }
    };

    const template = `
      const $_c0$ = ["foo"];
      const $_c1$ = ["width"];
      …
      hostBindings: function WidthDirective_HostBindings(rf, ctx, elIndex) {
        if (rf & 1) {
          $r3$.ɵallocHostVars(2);
          $r3$.ɵelementStyling($_c0$, $_c1$, null, ctx);
        }
        if (rf & 2) {
          $r3$.ɵelementProperty(elIndex, "id", $r3$.ɵbind(ctx.id));
          $r3$.ɵelementProperty(elIndex, "title", $r3$.ɵbind(ctx.title));
          $r3$.ɵelementStyleProp(elIndex, 0, ctx.myWidth, null, ctx);
          $r3$.ɵelementClassProp(elIndex, 0, ctx.myFooClass, ctx);
          $r3$.ɵelementStylingApply(elIndex, ctx);
        }
      }
    `;

    const result = compile(files, angularFiles);
    expectEmit(result.source, template, 'Incorrect template');
  });
});
