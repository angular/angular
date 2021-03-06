/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AttributeMarker} from '@angular/compiler/src/core';
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
                import {Component, NgModule, ViewEncapsulation} from '@angular/core';

                @Component({
                  selector: "my-component",
                  encapsulation: ViewEncapsulation.None,
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

    it('should pass in the component metadata styles into the component definition but skip shimming when style encapsulation is set to shadow dom',
       () => {
         const files = {
           app: {
             'spec.ts': `
                import {Component, NgModule, ViewEncapsulation} from '@angular/core';

                @Component({
                  encapsulation: ViewEncapsulation.ShadowDom,
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
         MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
           …
           styles: ["div.cool { color: blue; }", ":host.nice p { color: gold; }"],
           encapsulation: 3
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
        MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
          type: MyComponent,
          selectors:[["my-component"]],
          decls: 0,
          vars: 0,
          template:  function MyComponent_Template(rf, $ctx$) {
          },
          encapsulation: 2,
          data: {
            animation: [{name: 'foo123'}, {name: 'trigger123'}]
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
        MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
          type: MyComponent,
          selectors:[["my-component"]],
          decls: 0,
          vars: 0,
          template:  function MyComponent_Template(rf, $ctx$) {
          },
          encapsulation: 2,
          data: {
            animation: []
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
        …
        MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
          …
          decls: 3,
          vars: 3,
          template:  function MyComponent_Template(rf, $ctx$) {
            if (rf & 1) {
              $r3$.ɵɵelement(0, "div");
              $r3$.ɵɵelement(1, "div");
              $r3$.ɵɵelement(2, "div");
            }
            if (rf & 2) {
              $r3$.ɵɵproperty("@foo", ctx.exp);
              $r3$.ɵɵadvance(1);
              $r3$.ɵɵproperty("@bar", undefined);
              $r3$.ɵɵadvance(1);
              $r3$.ɵɵproperty("@baz", undefined);
            }
          },
          encapsulation: 2
        });
      `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should generate animation listeners', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-cmp',
              template: \`
                <div [@myAnimation]="exp"
                  (@myAnimation.start)="onStart($event)"
                  (@myAnimation.done)="onDone($event)"></div>
              \`,
              animations: [trigger(
                   'myAnimation',
                   [transition(
                       '* => state',
                       [style({'opacity': '0'}), animate(500, style({'opacity': '1'}))])])],
            })
            class MyComponent {
              exp: any;
              startEvent: any;
              doneEvent: any;
              onStart(event: any) { this.startEvent = event; }
              onDone(event: any) { this.doneEvent = event; }
            }

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
          `
        }
      };

      const template = `
        …
        MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
          …
          decls: 1,
          vars: 1,
          template: function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelementStart(0, "div");
              $r3$.ɵɵlistener("@myAnimation.start", function MyComponent_Template_div_animation_myAnimation_start_0_listener($event) { return ctx.onStart($event); })("@myAnimation.done", function MyComponent_Template_div_animation_myAnimation_done_0_listener($event) { return ctx.onDone($event); });
              $r3$.ɵɵelementEnd();
            } if (rf & 2) {
              $r3$.ɵɵproperty("@myAnimation", ctx.exp);
            }
          },
          encapsulation: 2,
          …
        });
      `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should generate animation host binding and listener code for directives', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Directive, Component, NgModule} from '@angular/core';

            @Directive({
              selector: '[my-anim-dir]',
              animations: [
                {name: 'myAnim'}
              ],
              host: {
                '[@myAnim]': 'myAnimState',
                '(@myAnim.start)': 'onStart()',
                '(@myAnim.done)': 'onDone()'
              }
            })
            class MyAnimDir {
              onStart() {}
              onDone() {}
              myAnimState = '123';
            }

            @Component({
              selector: 'my-cmp',
              template: \`
                <div my-anim-dir></div>
              \`
            })
            class MyComponent {
            }

            @NgModule({declarations: [MyComponent, MyAnimDir]})
            export class MyModule {}
          `
        }
      };

      const template = `
        MyAnimDir.ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
          …
          hostVars: 1,
          hostBindings: function MyAnimDir_HostBindings(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵsyntheticHostListener("@myAnim.start", function MyAnimDir_animation_myAnim_start_HostBindingHandler() { return ctx.onStart(); })("@myAnim.done", function MyAnimDir_animation_myAnim_done_HostBindingHandler() { return ctx.onDone(); });
            }
            if (rf & 2) {
              $r3$.ɵɵsyntheticHostProperty("@myAnim", ctx.myAnimState);
            }
          }
          …
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
              $r3$.ɵɵelement(0, "div");
            }
            if (rf & 2) {
              $r3$.ɵɵstyleMap($ctx$.myStyleExp);
            }
          }
          `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should correctly count the total slots required when style/class bindings include interpolation',
       () => {
         const files = {
           app: {
             'spec.ts': `
                import {Component, NgModule} from '@angular/core';

                @Component({
                  selector: 'my-component-with-interpolation',
                  template: \`
                    <div class="foo foo-{{ fooId }}"></div>
                  \`
                })
                export class MyComponentWithInterpolation {
                  fooId = '123';
                }

                @Component({
                  selector: 'my-component-with-muchos-interpolation',
                  template: \`
                    <div class="foo foo-{{ fooId }}-{{ fooUsername }}"></div>
                  \`
                })
                export class MyComponentWithMuchosInterpolation {
                  fooId = '123';
                  fooUsername = 'superfoo';
                }

                @Component({
                  selector: 'my-component-without-interpolation',
                  template: \`
                    <div [class]="exp"></div>
                  \`
                })
                export class MyComponentWithoutInterpolation {
                  exp = 'bar';
                }

                @NgModule({declarations: [MyComponentWithInterpolation, MyComponentWithMuchosInterpolation, MyComponentWithoutInterpolation]})
                export class MyModule {}
            `
           }
         };

         const template = `
        …
          decls: 1,
          vars: 3,
          template: function MyComponentWithInterpolation_Template(rf, $ctx$) {
            if (rf & 1) {
              $r3$.ɵɵelement(0, "div");
            }
            if (rf & 2) {
              $r3$.ɵɵclassMapInterpolate1("foo foo-", $ctx$.fooId, "");
            }
          }
        …
          decls: 1,
          vars: 4,
          template: function MyComponentWithMuchosInterpolation_Template(rf, $ctx$) {
            if (rf & 1) {
              $r3$.ɵɵelement(0, "div");
            }
            if (rf & 2) {
              $r3$.ɵɵclassMapInterpolate2("foo foo-", $ctx$.fooId, "-", $ctx$.fooUsername, "");
            }
          }
        …
          decls: 1,
          vars: 2,
          template: function MyComponentWithoutInterpolation_Template(rf, $ctx$) {
            if (rf & 1) {
              $r3$.ɵɵelement(0, "div");
            }
            if (rf & 2) {
              $r3$.ɵɵclassMap($ctx$.exp);
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
          …
          MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
              type: MyComponent,
              selectors:[["my-component"]],
              decls: 1,
              vars: 7,
              consts: [[${AttributeMarker.Styles}, "opacity", "1"]],
              template:  function MyComponent_Template(rf, $ctx$) {
                if (rf & 1) {
                  $r3$.ɵɵelement(0, "div", 0);
                }
                if (rf & 2) {
                  $r3$.ɵɵstyleMap($ctx$.myStyleExp);
                  $r3$.ɵɵstyleProp("width", $ctx$.myWidth)("height", $ctx$.myHeight);
                  $r3$.ɵɵattribute("style", "border-width: 10px", $r3$.ɵɵsanitizeStyle);
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
          MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
            type: MyComponent,
            selectors: [["my-component"]],
            decls: 1,
            vars: 2,
            template:  function MyComponent_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵelement(0, "div");
              }
              if (rf & 2) {
                $r3$.ɵɵstyleProp("background-image", ctx.myImage);
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
          template:  function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelement(0, "div");
            }
            if (rf & 2) {
              $r3$.ɵɵstyleProp("font-size", 12, "px");
            }
          }
     `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should not create instructions for empty style bindings', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`<div [style.color]></div>\`
            })
            export class MyComponent {
            }

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
          `
        }
      };

      const result = compile(files, angularFiles);
      expect(result.source).not.toContain('styling');
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
              $r3$.ɵɵelement(0, "div");
            }
            if (rf & 2) {
              $r3$.ɵɵclassMap($ctx$.myClassExp);
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
          …
          MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
              type: MyComponent,
              selectors:[["my-component"]],
              decls: 1,
              vars: 7,
              consts: [[${AttributeMarker.Classes}, "grape"]],
              template:  function MyComponent_Template(rf, $ctx$) {
                if (rf & 1) {
                  $r3$.ɵɵelement(0, "div", 0);
                }
                if (rf & 2) {
                  $r3$.ɵɵclassMap($ctx$.myClassExp);
                  $r3$.ɵɵclassProp("apple", $ctx$.yesToApple)("orange", $ctx$.yesToOrange);
                  $r3$.ɵɵattribute("class", "banana");
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
                  template: \`<div class="    foo  "
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
          …
          MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
              type: MyComponent,
              selectors:[["my-component"]],
              decls: 1,
              vars: 2,
              consts: [[${AttributeMarker.Classes}, "foo", ${
             AttributeMarker.Styles}, "width", "100px"]],
              template:  function MyComponent_Template(rf, $ctx$) {
                if (rf & 1) {
                  $r3$.ɵɵelement(0, "div", 0);
                }
                if (rf & 2) {
                  $r3$.ɵɵattribute("class", "round")("style", "height:100px", $r3$.ɵɵsanitizeStyle);
                }
              },
              encapsulation: 2
            });
        `;

         const result = compile(files, angularFiles);
         expectEmit(result.source, template, 'Incorrect template');
       });

    it('should not create instructions for empty class bindings', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`<div [class.is-open]></div>\`
            })
            export class MyComponent {
            }

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
          `
        }
      };

      const result = compile(files, angularFiles);
      expect(result.source).not.toContain('styling');
    });
  });

  describe('[style] mixed with [class]', () => {
    it('should split [style] and [class] bindings into a separate instructions', () => {
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
              $r3$.ɵɵelement(0, "div");
            }
            if (rf & 2) {
              $r3$.ɵɵstyleMap($ctx$.myStyleExp);
              $r3$.ɵɵclassMap($ctx$.myClassExp);
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
              $r3$.ɵɵelementStart(0, "div");
              $r3$.ɵɵpipe(1, "stylePipe");
              $r3$.ɵɵpipe(2, "classPipe");
              $r3$.ɵɵelementEnd();
            }
            if (rf & 2) {
              $r3$.ɵɵstyleMap($r3$.ɵɵpipeBind1(1, 4, $ctx$.myStyleExp));
              $r3$.ɵɵclassMap($r3$.ɵɵpipeBind1(2, 6, $ctx$.myClassExp));
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
              $r3$.ɵɵelementStart(0, "div");
              $r3$.ɵɵpipe(1, "pipe");
              $r3$.ɵɵpipe(2, "pipe");
              $r3$.ɵɵpipe(3, "pipe");
              $r3$.ɵɵpipe(4, "pipe");
              $r3$.ɵɵtext(5);
              $r3$.ɵɵelementEnd();
            }
            if (rf & 2) {
              $r3$.ɵɵstyleMap($r3$.ɵɵpipeBind2(1, 11, $ctx$.myStyleExp, 1000));
              $r3$.ɵɵclassMap($r3$.ɵɵpureFunction0(23, _c0));
              $r3$.ɵɵstyleProp("bar", $r3$.ɵɵpipeBind2(2, 14, $ctx$.barExp, 3000))("baz", $r3$.ɵɵpipeBind2(3, 17, $ctx$.bazExp, 4000));
              $r3$.ɵɵclassProp("foo", $r3$.ɵɵpipeBind2(4, 20, $ctx$.fooExp, 2000));
              $r3$.ɵɵadvance(5);
             $r3$.ɵɵtextInterpolate1(" ", $ctx$.item, "");
            }
          }
          `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should always generate select() statements before any styling instructions', () => {
      const files = {
        app: {
          'spec.ts': `
                import {Component, NgModule} from '@angular/core';

                @Component({
                  selector: 'my-component',
                  template: \`
                    <div [style.width]="w1"></div>
                    <div [style.height]="h1"></div>
                    <div [class.active]="a1"></div>
                    <div [class.removed]="r1"></div>
                  \`
                })
                export class MyComponent {
                  w1 = '100px';
                  h1 = '100px';
                  a1 = true;
                  r1 = true;
                }

                @NgModule({declarations: [MyComponent]})
                export class MyModule {}
            `
        }
      };

      const template = `
          …
          template: function MyComponent_Template(rf, $ctx$) {
            …
            if (rf & 2) {
              $r3$.ɵɵstyleProp("width", $ctx$.w1);
              $r3$.ɵɵadvance(1);
              $r3$.ɵɵstyleProp("height", $ctx$.h1);
              $r3$.ɵɵadvance(1);
              $r3$.ɵɵclassProp("active", $ctx$.a1);
              $r3$.ɵɵadvance(1);
              $r3$.ɵɵclassProp("removed", $ctx$.r1);
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
          hostAttrs: [${AttributeMarker.Classes}, "foo", "baz", ${
          AttributeMarker.Styles}, "width", "200px", "height", "500px"],
          hostVars: 8,
          hostBindings: function MyComponent_HostBindings(rf, ctx) {
            if (rf & 2) {
              $r3$.ɵɵstyleMap(ctx.myStyle);
              $r3$.ɵɵclassMap(ctx.myClass);
              $r3$.ɵɵstyleProp("color", ctx.myColorProp);
              $r3$.ɵɵclassProp("foo", ctx.myFooClass);
            }
          },
          decls: 0,
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
          hostVars: 12,
          hostBindings: function MyComponent_HostBindings(rf, ctx) {
            if (rf & 2) {
              $r3$.ɵɵstyleMap(ctx.myStyle);
              $r3$.ɵɵclassMap(ctx.myClasses);
              $r3$.ɵɵstyleProp("height", ctx.myHeightProp, "pt")("width", ctx.myWidthProp);
              $r3$.ɵɵclassProp("bar", ctx.myBarClass)("foo", ctx.myFooClass);
            }
          },
          decls: 0,
          vars: 0,
          `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should generate override instructions for only single-level styling bindings when !important is present',
       () => {
         const files = {
           app: {
             'spec.ts': `
                import {Component, NgModule, HostBinding} from '@angular/core';

                @Component({
                  selector: 'my-component',
                  template: \`
                    <div [style!important]="myStyleExp"
                         [class!important]="myClassExp"
                         [style.height!important]="myHeightExp"
                         [class.bar!important]="myBarClassExp"></div>
                  \`,
                  host: {
                    '[style!important]': 'myStyleExp',
                    '[class!important]': 'myClassExp'
                  }
                })
                export class MyComponent {
                  @HostBinding('class.foo!important')
                  myFooClassExp = true;

                  @HostBinding('style.width!important')
                  myWidthExp = '100px';

                  myBarClassExp = true;
                  myHeightExp = '200px';
                }

                @NgModule({declarations: [MyComponent]})
                export class MyModule {}
            `
           }
         };

         const template = `
            function MyComponent_Template(rf, ctx) {
              if (rf & 1) {
                $r3$.ɵɵelement(0, "div");
              }
              if (rf & 2) {
                $r3$.ɵɵstyleMap(ctx.myStyleExp);
                $r3$.ɵɵclassMap(ctx.myClassExp);
                $r3$.ɵɵstyleProp("height", ctx.myHeightExp);
                $r3$.ɵɵclassProp("bar", ctx.myBarClassExp);
              }
            },
          `;

         const hostBindings = `
            hostVars: 8,
            hostBindings: function MyComponent_HostBindings(rf, ctx) {
              if (rf & 2) {
                $r3$.ɵɵstyleMap(ctx.myStyleExp);
                $r3$.ɵɵclassMap(ctx.myClassExp);
                $r3$.ɵɵstyleProp("width", ctx.myWidthExp);
                $r3$.ɵɵclassProp("foo", ctx.myFooClassExp);
              }
            },
          `;

         const result = compile(files, angularFiles);
         expectEmit(result.source, hostBindings, 'Incorrect template');
         expectEmit(result.source, template, 'Incorrect template');
       });

    it('should support class interpolation', () => {
      const files = {
        app: {
          'spec.ts': `
                  import {Component, NgModule, HostBinding} from '@angular/core';

                  @Component({
                    selector: 'my-component',
                    template: \`
                      <div class="A{{p1}}B"></div>
                      <div class="A{{p1}}B{{p2}}C"></div>
                      <div class="A{{p1}}B{{p2}}C{{p3}}D"></div>
                      <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E"></div>
                      <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F"></div>
                      <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F{{p6}}G"></div>
                      <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F{{p6}}G{{p7}}H"></div>
                      <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F{{p6}}G{{p7}}H{{p8}}I"></div>
                      <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F{{p6}}G{{p7}}H{{p8}}I{{p9}}J"></div>
                    \`,
                  })
                  export class MyComponent {
                    p1 = 100;
                    p2 = 100;
                    p3 = 100;
                    p4 = 100;
                    p5 = 100;
                    p6 = 100;
                    p6 = 100;
                    p7 = 100;
                    p8 = 100;
                    p9 = 100;
                  }

                  @NgModule({declarations: [MyComponent]})
                  export class MyModule {}
              `
        }
      };

      const template = `
              function MyComponent_Template(rf, ctx) {
                if (rf & 1) {
                  …
                }
                if (rf & 2) {
                  $r3$.ɵɵclassMapInterpolate1("A", ctx.p1, "B");
                  $r3$.ɵɵadvance(1);
                  $r3$.ɵɵclassMapInterpolate2("A", ctx.p1, "B", ctx.p2, "C");
                  $r3$.ɵɵadvance(1);
                  $r3$.ɵɵclassMapInterpolate3("A", ctx.p1, "B", ctx.p2, "C", ctx.p3, "D");
                  $r3$.ɵɵadvance(1);
                  $r3$.ɵɵclassMapInterpolate4("A", ctx.p1, "B", ctx.p2, "C", ctx.p3, "D", ctx.p4, "E");
                  $r3$.ɵɵadvance(1);
                  $r3$.ɵɵclassMapInterpolate5("A", ctx.p1, "B", ctx.p2, "C", ctx.p3, "D", ctx.p4, "E", ctx.p5, "F");
                  $r3$.ɵɵadvance(1);
                  $r3$.ɵɵclassMapInterpolate6("A", ctx.p1, "B", ctx.p2, "C", ctx.p3, "D", ctx.p4, "E", ctx.p5, "F", ctx.p6, "G");
                  $r3$.ɵɵadvance(1);
                  $r3$.ɵɵclassMapInterpolate7("A", ctx.p1, "B", ctx.p2, "C", ctx.p3, "D", ctx.p4, "E", ctx.p5, "F", ctx.p6, "G", ctx.p7, "H");
                  $r3$.ɵɵadvance(1);
                  $r3$.ɵɵclassMapInterpolate8("A", ctx.p1, "B", ctx.p2, "C", ctx.p3, "D", ctx.p4, "E", ctx.p5, "F", ctx.p6, "G", ctx.p7, "H", ctx.p8, "I");
                  $r3$.ɵɵadvance(1);
                  $r3$.ɵɵclassMapInterpolateV(["A", ctx.p1, "B", ctx.p2, "C", ctx.p3, "D", ctx.p4, "E", ctx.p5, "F", ctx.p6, "G", ctx.p7, "H", ctx.p8, "I", ctx.p9, "J"]);
                }
              },
            `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should support style interpolation', () => {
      const files = {
        app: {
          'spec.ts': `
                  import {Component, NgModule, HostBinding} from '@angular/core';

                  @Component({
                    selector: 'my-component',
                    template: \`
                      <div style="p1:{{p1}};"></div>
                      <div style="p1:{{p1}};p2:{{p2}};"></div>
                      <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};"></div>
                      <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};"></div>
                      <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};p5:{{p5}};"></div>
                      <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};p5:{{p5}};p6:{{p6}};"></div>
                      <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};p5:{{p5}};p6:{{p6}};p7:{{p7}};"></div>
                      <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};p5:{{p5}};p6:{{p6}};p7:{{p7}};p8:{{p8}};"></div>
                      <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};p5:{{p5}};p6:{{p6}};p7:{{p7}};p8:{{p8}};p9:{{p9}};"></div>
                    \`,
                  })
                  export class MyComponent {
                    p1 = 100;
                    p2 = 100;
                    p3 = 100;
                    p4 = 100;
                    p5 = 100;
                    p6 = 100;
                    p6 = 100;
                    p7 = 100;
                    p8 = 100;
                    p9 = 100;
                  }

                  @NgModule({declarations: [MyComponent]})
                  export class MyModule {}
              `
        }
      };

      const template = `
              function MyComponent_Template(rf, ctx) {
                if (rf & 1) {
                  …
                }
                if (rf & 2) {
                  $r3$.ɵɵstyleMapInterpolate1("p1:", ctx.p1, ";");
                  $r3$.ɵɵadvance(1);
                  $r3$.ɵɵstyleMapInterpolate2("p1:", ctx.p1, ";p2:", ctx.p2, ";");
                  $r3$.ɵɵadvance(1);
                  $r3$.ɵɵstyleMapInterpolate3("p1:", ctx.p1, ";p2:", ctx.p2, ";p3:", ctx.p3, ";");
                  $r3$.ɵɵadvance(1);
                  $r3$.ɵɵstyleMapInterpolate4("p1:", ctx.p1, ";p2:", ctx.p2, ";p3:", ctx.p3, ";p4:", ctx.p4, ";");
                  $r3$.ɵɵadvance(1);
                  $r3$.ɵɵstyleMapInterpolate5("p1:", ctx.p1, ";p2:", ctx.p2, ";p3:", ctx.p3, ";p4:", ctx.p4, ";p5:", ctx.p5, ";");
                  $r3$.ɵɵadvance(1);
                  $r3$.ɵɵstyleMapInterpolate6("p1:", ctx.p1, ";p2:", ctx.p2, ";p3:", ctx.p3, ";p4:", ctx.p4, ";p5:", ctx.p5, ";p6:", ctx.p6, ";");
                  $r3$.ɵɵadvance(1);
                  $r3$.ɵɵstyleMapInterpolate7("p1:", ctx.p1, ";p2:", ctx.p2, ";p3:", ctx.p3, ";p4:", ctx.p4, ";p5:", ctx.p5, ";p6:", ctx.p6, ";p7:", ctx.p7, ";");
                  $r3$.ɵɵadvance(1);
                  $r3$.ɵɵstyleMapInterpolate8("p1:", ctx.p1, ";p2:", ctx.p2, ";p3:", ctx.p3, ";p4:", ctx.p4, ";p5:", ctx.p5, ";p6:", ctx.p6, ";p7:", ctx.p7, ";p8:", ctx.p8, ";");
                  $r3$.ɵɵadvance(1);
                  $r3$.ɵɵstyleMapInterpolateV(["p1:", ctx.p1, ";p2:", ctx.p2, ";p3:", ctx.p3, ";p4:", ctx.p4, ";p5:", ctx.p5, ";p6:", ctx.p6, ";p7:", ctx.p7, ";p8:", ctx.p8, ";p9:", ctx.p9, ";"]);
                }
              },
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

                @Directive({selector: '[myClassDir]'})
                export class ClassDirective {
                  @HostBinding('class')
                  myClassMap = {red: true};
                }

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
                  template: '<div myWidthDir myHeightDir myClassDir></div>',
                })
                export class MyComponent {
                }

                @NgModule({declarations: [MyComponent, WidthDirective, HeightDirective, ClassDirective]})
                export class MyModule {}
            `
           }
         };

         // NOTE: IF YOU ARE CHANGING THIS COMPILER SPEC, YOU MAY NEED TO CHANGE THE DIRECTIVE
         // DEF THAT'S HARD-CODED IN `ng_class.ts`.
         const template = `
          …
          hostVars: 2,
          hostBindings: function ClassDirective_HostBindings(rf, ctx) {
            if (rf & 2) {
              $r3$.ɵɵclassMap(ctx.myClassMap);
            }
          }
          …
          hostVars: 4,
          hostBindings: function WidthDirective_HostBindings(rf, ctx) {
            if (rf & 2) {
              $r3$.ɵɵstyleProp("width", ctx.myWidth);
              $r3$.ɵɵclassProp("foo", ctx.myFooClass);
            }
          }
          …
          hostVars: 4,
          hostBindings: function HeightDirective_HostBindings(rf, ctx) {
            if (rf & 2) {
              $r3$.ɵɵstyleProp("height", ctx.myHeight);
              $r3$.ɵɵclassProp("bar", ctx.myBarClass);
            }
          }
          …
          `;

         const result = compile(files, angularFiles);
         expectEmit(result.source, template, 'Incorrect template');
       });
  });

  describe('interpolations', () => {
    it('should generate the proper update instructions for interpolated classes', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: \`
                <div class="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i{{nine}}j"></div>
                <div class="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i"></div>
                <div class="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h"></div>
                <div class="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g"></div>
                <div class="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f"></div>
                <div class="a{{one}}b{{two}}c{{three}}d{{four}}e"></div>
                <div class="a{{one}}b{{two}}c{{three}}d"></div>
                <div class="a{{one}}b{{two}}c"></div>
                <div class="a{{one}}b"></div>
                <div class="{{one}}"></div>
              \`
            })
            export class MyComponent {
            }
          `
        }
      };

      const template = `
      …
        if (rf & 2) {
          $r3$.ɵɵclassMapInterpolateV(["a", ctx.one, "b", ctx.two, "c", ctx.three, "d", ctx.four, "e", ctx.five, "f", ctx.six, "g", ctx.seven, "h", ctx.eight, "i", ctx.nine, "j"]);
          $r3$.ɵɵadvance(1);
          $r3$.ɵɵclassMapInterpolate8("a", ctx.one, "b", ctx.two, "c", ctx.three, "d", ctx.four, "e", ctx.five, "f", ctx.six, "g", ctx.seven, "h", ctx.eight, "i");
          $r3$.ɵɵadvance(1);
          $r3$.ɵɵclassMapInterpolate7("a", ctx.one, "b", ctx.two, "c", ctx.three, "d", ctx.four, "e", ctx.five, "f", ctx.six, "g", ctx.seven, "h");
          $r3$.ɵɵadvance(1);
          $r3$.ɵɵclassMapInterpolate6("a", ctx.one, "b", ctx.two, "c", ctx.three, "d", ctx.four, "e", ctx.five, "f", ctx.six, "g");
          $r3$.ɵɵadvance(1);
          $r3$.ɵɵclassMapInterpolate5("a", ctx.one, "b", ctx.two, "c", ctx.three, "d", ctx.four, "e", ctx.five, "f");
          $r3$.ɵɵadvance(1);
          $r3$.ɵɵclassMapInterpolate4("a", ctx.one, "b", ctx.two, "c", ctx.three, "d", ctx.four, "e");
          $r3$.ɵɵadvance(1);
          $r3$.ɵɵclassMapInterpolate3("a", ctx.one, "b", ctx.two, "c", ctx.three, "d");
          $r3$.ɵɵadvance(1);
          $r3$.ɵɵclassMapInterpolate2("a", ctx.one, "b", ctx.two, "c");
          $r3$.ɵɵadvance(1);
          $r3$.ɵɵclassMapInterpolate1("a", ctx.one, "b");
          $r3$.ɵɵadvance(1);
          $r3$.ɵɵclassMap(ctx.one);
      }
      …
      `;
      const result = compile(files, angularFiles);

      expectEmit(result.source, template, 'Incorrect handling of interpolated classes');
    });

    it('should throw for interpolations inside individual class bindings', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<div class.something="{{isEnabled}}"></div>'
            })
            export class MyComponent {
            }
          `
        }
      };

      expect(() => compile(files, angularFiles)).toThrowError(/Unexpected interpolation/);
    });

    it('should generate the proper update instructions for interpolated style properties', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: \`
                <div style.color="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i{{nine}}j"></div>
                <div style.color="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i"></div>
                <div style.color="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h"></div>
                <div style.color="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g"></div>
                <div style.color="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f"></div>
                <div style.color="a{{one}}b{{two}}c{{three}}d{{four}}e"></div>
                <div style.color="a{{one}}b{{two}}c{{three}}d"></div>
                <div style.color="a{{one}}b{{two}}c"></div>
                <div style.color="a{{one}}b"></div>
                <div style.color="{{one}}"></div>
              \`
            })
            export class MyComponent {
            }
          `
        }
      };

      const template = `
      …
        if (rf & 2) {
          $r3$.ɵɵstylePropInterpolateV("color", ["a", ctx.one, "b", ctx.two, "c", ctx.three, "d", ctx.four, "e", ctx.five, "f", ctx.six, "g", ctx.seven, "h", ctx.eight, "i", ctx.nine, "j"]);
          $r3$.ɵɵadvance(1);
          $r3$.ɵɵstylePropInterpolate8("color", "a", ctx.one, "b", ctx.two, "c", ctx.three, "d", ctx.four, "e", ctx.five, "f", ctx.six, "g", ctx.seven, "h", ctx.eight, "i");
          $r3$.ɵɵadvance(1);
          $r3$.ɵɵstylePropInterpolate7("color", "a", ctx.one, "b", ctx.two, "c", ctx.three, "d", ctx.four, "e", ctx.five, "f", ctx.six, "g", ctx.seven, "h");
          $r3$.ɵɵadvance(1);
          $r3$.ɵɵstylePropInterpolate6("color", "a", ctx.one, "b", ctx.two, "c", ctx.three, "d", ctx.four, "e", ctx.five, "f", ctx.six, "g");
          $r3$.ɵɵadvance(1);
          $r3$.ɵɵstylePropInterpolate5("color", "a", ctx.one, "b", ctx.two, "c", ctx.three, "d", ctx.four, "e", ctx.five, "f");
          $r3$.ɵɵadvance(1);
          $r3$.ɵɵstylePropInterpolate4("color", "a", ctx.one, "b", ctx.two, "c", ctx.three, "d", ctx.four, "e");
          $r3$.ɵɵadvance(1);
          $r3$.ɵɵstylePropInterpolate3("color", "a", ctx.one, "b", ctx.two, "c", ctx.three, "d");
          $r3$.ɵɵadvance(1);
          $r3$.ɵɵstylePropInterpolate2("color", "a", ctx.one, "b", ctx.two, "c");
          $r3$.ɵɵadvance(1);
          $r3$.ɵɵstylePropInterpolate1("color", "a", ctx.one, "b");
          $r3$.ɵɵadvance(1);
          $r3$.ɵɵstyleProp("color", ctx.one);
      }
      …
      `;
      const result = compile(files, angularFiles);

      expectEmit(result.source, template, 'Incorrect handling of interpolated style properties');
    });

    it('should generate update instructions for interpolated style properties with a suffix',
       () => {
         const files = {
           app: {
             'spec.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: \`
                <div style.width.px="a{{one}}b{{two}}c"></div>
              \`
            })
            export class MyComponent {
            }
          `
           }
         };

         const template = `
            …
            if (rf & 2) {
              $r3$.ɵɵstylePropInterpolate2("width", "a", ctx.one, "b", ctx.two, "c", "px");
            }
            …
          `;
         const result = compile(files, angularFiles);

         expectEmit(result.source, template, 'Incorrect handling of interpolated style properties');
       });

    it('should generate update instructions for interpolated style properties with a sanitizer',
       () => {
         const files = {
           app: {
             'spec.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: \`
                <div style.background="url({{ myUrl1 }})"
                     style.borderImage="url({{ myUrl2 }}) {{ myRepeat }} auto"
                     style.boxShadow="{{ myBoxX }} {{ myBoxY }} {{ myBoxWidth }} black"></div>
              \`
            })
            export class MyComponent {
              myUrl1 = '...';
              myUrl2 = '...';
              myBoxX = '0px';
              myBoxY = '0px';
              myBoxWidth = '100px';
              myRepeat = 'no-repeat';
            }
          `
           }
         };

         const template = `
            …
            if (rf & 2) {
              $r3$.ɵɵstylePropInterpolate1("background", "url(", ctx.myUrl1, ")");
              $r3$.ɵɵstylePropInterpolate2("border-image", "url(", ctx.myUrl2, ") ", ctx.myRepeat, " auto");
              $r3$.ɵɵstylePropInterpolate3("box-shadow", "", ctx.myBoxX, " ", ctx.myBoxY, " ", ctx.myBoxWidth, " black");
            }
            …
          `;
         const result = compile(files, angularFiles);

         expectEmit(result.source, template, 'Incorrect handling of interpolated style properties');
       });

    it('should generate update instructions for interpolated style properties with !important',
       () => {
         const files = {
           app: {
             'spec.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: \`
                <div style.width!important="a{{one}}b{{two}}c"></div>
              \`
            })
            export class MyComponent {
            }
          `
           }
         };

         const template = `
            …
            if (rf & 2) {
              $r3$.ɵɵstylePropInterpolate2("width", "a", ctx.one, "b", ctx.two, "c");
            }
            …
          `;
         const result = compile(files, angularFiles);

         expectEmit(result.source, template, 'Incorrect handling of interpolated style properties');
       });
  });

  describe('instruction chaining', () => {
    it('should chain classProp instruction calls', () => {
      const files = {
        app: {
          'spec.ts': `
             import {Component} from '@angular/core';

             @Component({
               template: \`<div [class.apple]="yesToApple"
                                [class.orange]="yesToOrange"
                                [class.tomato]="yesToTomato"></div>\`
             })
             export class MyComponent {
               yesToApple = true;
               yesToOrange = true;
               tesToTomato = false;
             }
         `
        }
      };

      const template = `
       …
       MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
        …
        template: function MyComponent_Template(rf, $ctx$) {
          …
          if (rf & 2) {
            $r3$.ɵɵclassProp("apple", $ctx$.yesToApple)("orange", $ctx$.yesToOrange)("tomato", $ctx$.yesToTomato);
          }
        },
        encapsulation: 2
      });
     `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should chain styleProp instruction calls', () => {
      const files = {
        app: {
          'spec.ts': `
             import {Component} from '@angular/core';

             @Component({
               template: \`<div [style.color]="color"
                                [style.border]="border"
                                [style.transition]="transition"></div>\`
             })
             export class MyComponent {
               color = 'red';
               border = '1px solid purple';
               transition = 'all 1337ms ease';
             }
         `
        }
      };

      const template = `
       …
       MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
        …
        template: function MyComponent_Template(rf, $ctx$) {
          …
          if (rf & 2) {
            $r3$.ɵɵstyleProp("color", $ctx$.color)("border", $ctx$.border)("transition", $ctx$.transition);
          }
        },
        encapsulation: 2
      });
     `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should chain mixed styleProp and classProp calls', () => {
      const files = {
        app: {
          'spec.ts': `
             import {Component} from '@angular/core';

             @Component({
               template: \`<div
                                [class.apple]="yesToApple"
                                [style.color]="color"
                                [class.orange]="yesToOrange"
                                [style.border]="border"
                                [class.tomato]="yesToTomato"
                                [style.transition]="transition"></div>\`
             })
             export class MyComponent {
               color = 'red';
               border = '1px solid purple';
               transition = 'all 1337ms ease';
               yesToApple = true;
               yesToOrange = true;
               tesToTomato = false;
             }
         `
        }
      };

      const template = `
       …
       MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
        …
        template: function MyComponent_Template(rf, $ctx$) {
          …
          if (rf & 2) {
            $r3$.ɵɵstyleProp("color", $ctx$.color)("border", $ctx$.border)("transition", $ctx$.transition);
            $r3$.ɵɵclassProp("apple", $ctx$.yesToApple)("orange", $ctx$.yesToOrange)("tomato", $ctx$.yesToTomato);
          }
        },
        encapsulation: 2
      });
     `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should chain style interpolations of the same kind', () => {
      const files = {
        app: {
          'spec.ts': `
             import {Component} from '@angular/core';

             @Component({
               template: \`<div
                                style.color="a{{one}}b"
                                style.border="a{{one}}b"
                                style.transition="a{{one}}b"></div>\`
             })
             export class MyComponent {
             }
         `
        }
      };

      const template = `
       …
       MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
        …
        template: function MyComponent_Template(rf, $ctx$) {
          …
          if (rf & 2) {
            $r3$.ɵɵstylePropInterpolate1("color", "a", ctx.one, "b")("border", "a", ctx.one, "b")("transition", "a", ctx.one, "b");
          }
        },
        encapsulation: 2
      });
     `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should chain style interpolations of multiple kinds', () => {
      const files = {
        app: {
          'spec.ts': `
             import {Component} from '@angular/core';

             @Component({
               template: \`<div
                                style.color="a{{one}}b"
                                style.border="a{{one}}b"
                                style.transition="a{{one}}b{{two}}c"
                                style.width="a{{one}}b{{two}}c"
                                style.height="a{{one}}b{{two}}c{{three}}d"
                                style.top="a{{one}}b{{two}}c{{three}}d"></div>\`
             })
             export class MyComponent {
             }
         `
        }
      };

      const template = `
       …
       MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
        …
        template: function MyComponent_Template(rf, $ctx$) {
          …
          if (rf & 2) {
            $r3$.ɵɵstylePropInterpolate1("color", "a", ctx.one, "b")("border", "a", ctx.one, "b");
            $r3$.ɵɵstylePropInterpolate2("transition", "a", ctx.one, "b", ctx.two, "c")("width", "a", ctx.one, "b", ctx.two, "c");
            $r3$.ɵɵstylePropInterpolate3("height", "a", ctx.one, "b", ctx.two, "c", ctx.three, "d")("top", "a", ctx.one, "b", ctx.two, "c", ctx.three, "d");
          }
        },
        encapsulation: 2
      });
     `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should break into multiple chains if there are other styling instructions in between',
       () => {
         const files = {
           app: {
             'spec.ts': `
                  import {Component} from '@angular/core';

                  @Component({
                    template: \`<div
                                      style.color="a{{one}}b"
                                      style.border="a{{one}}b"
                                      [class.apple]="yesToApple"
                                      [style.transition]="transition"
                                      [class.orange]="yesToOrange"
                                      [style.width]="width"
                                      style.height="a{{one}}b"
                                      style.top="a{{one}}b"></div>\`
                  })
                  export class MyComponent {
                    transition = 'all 1337ms ease';
                    width = '42px';
                    yesToApple = true;
                    yesToOrange = true;
                  }
              `
           }
         };

         const template = `
            …
            MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
              …
              template: function MyComponent_Template(rf, $ctx$) {
                …
                if (rf & 2) {
                  $r3$.ɵɵstylePropInterpolate1("color", "a", ctx.one, "b")("border", "a", ctx.one, "b");
                  $r3$.ɵɵstyleProp("transition", ctx.transition)("width", ctx.width);
                  $r3$.ɵɵstylePropInterpolate1("height", "a", ctx.one, "b")("top", "a", ctx.one, "b");
                  $r3$.ɵɵclassProp("apple", ctx.yesToApple)("orange", ctx.yesToOrange);
                }
              },
              encapsulation: 2
            });
          `;

         const result = compile(files, angularFiles);
         expectEmit(result.source, template, 'Incorrect template');
       });

    it('should break into multiple chains if there are other styling interpolation instructions in between',
       () => {
         const files = {
           app: {
             'spec.ts': `
                  import {Component} from '@angular/core';

                  @Component({
                    template: \`<div
                                      style.color="a{{one}}b"
                                      style.border="a{{one}}b"
                                      style.transition="a{{one}}b{{two}}c"
                                      style.width="a{{one}}b{{two}}c{{three}}d"
                                      style.height="a{{one}}b"
                                      style.top="a{{one}}b"></div>\`
                  })
                  export class MyComponent {
                    transition = 'all 1337ms ease';
                    width = '42px';
                  }
              `
           }
         };

         const template = `
            …
            MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
              …
              template: function MyComponent_Template(rf, $ctx$) {
                …
                if (rf & 2) {
                  $r3$.ɵɵstylePropInterpolate1("color", "a", ctx.one, "b")("border", "a", ctx.one, "b");
                  $r3$.ɵɵstylePropInterpolate2("transition", "a", ctx.one, "b", ctx.two, "c");
                  $r3$.ɵɵstylePropInterpolate3("width", "a", ctx.one, "b", ctx.two, "c", ctx.three, "d");
                  $r3$.ɵɵstylePropInterpolate1("height", "a", ctx.one, "b")("top", "a", ctx.one, "b");
                }
              },
              encapsulation: 2
            });
          `;

         const result = compile(files, angularFiles);
         expectEmit(result.source, template, 'Incorrect template');
       });

    it('should chain styling instructions inside host bindings', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, HostBinding} from '@angular/core';

            @Component({
              template: '',
              host: {
                '[class.apple]': 'yesToApple',
                '[style.color]': 'color',
                '[class.tomato]': 'yesToTomato',
                '[style.transition]': 'transition'
              }
            })
            export class MyComponent {
              color = 'red';
              transition = 'all 1337ms ease';
              yesToApple = true;
              tesToTomato = false;

              @HostBinding('style.border')
              border = '1px solid purple';

              @HostBinding('class.orange')
              yesToOrange = true;
            }
           `
        }
      };

      const template = `
         …
         MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
          …
          hostBindings: function MyComponent_HostBindings(rf, $ctx$) {
            …
            if (rf & 2) {
              $r3$.ɵɵstyleProp("color", $ctx$.color)("transition", $ctx$.transition)("border", $ctx$.border);
              $r3$.ɵɵclassProp("apple", $ctx$.yesToApple)("tomato", $ctx$.yesToTomato)("orange", $ctx$.yesToOrange);
            }
          },
          …
        });
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
              'class': 'foo baz',
              'title': 'foo title'
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

            @Input('name')
            name = '';
          }

          @NgModule({declarations: [MyComponent]})
          export class MyModule {}
        `
      }
    };

    const template = `
      hostAttrs: ["title", "foo title", ${AttributeMarker.Classes}, "foo", "baz", ${
        AttributeMarker.Styles}, "width", "200px", "height", "500px"],
      hostVars: 6,
      hostBindings: function MyComponent_HostBindings(rf, ctx) {
        if (rf & 2) {
          $r3$.ɵɵhostProperty("id", ctx.id)("title", ctx.title);
          $r3$.ɵɵstyleMap(ctx.myStyle);
          $r3$.ɵɵclassMap(ctx.myClass);
        }
      }
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
    hostVars: 6,
    hostBindings: function WidthDirective_HostBindings(rf, ctx) {
        if (rf & 2) {
          $r3$.ɵɵhostProperty("id", ctx.id)("title", ctx.title);
          $r3$.ɵɵstyleProp("width", ctx.myWidth);
          $r3$.ɵɵclassProp("foo", ctx.myFooClass);
        }
      }
    `;

    const result = compile(files, angularFiles);
    expectEmit(result.source, template, 'Incorrect template');
  });

  describe('new styling refactor', () => {
    it('should generate the correct amount of host bindings when styling is present', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, Directive, NgModule} from '@angular/core';

            @Directive({
              selector: '[my-dir]',
              host: {
                '[title]': 'title',
                '[class.foo]': 'foo',
                '[@anim]': \`{
                  value: _animValue,
                  params: {
                    param1: _animParam1,
                    param2: _animParam2
                  }
                }\`
              }
            })
            export class MyDir {
              title = '';
              foo = true;
              _animValue = null;
              _animParam1 = null;
              _animParam2 = null;
            }

            @Component({
              selector: 'my-app',
              template: \`
                <div my-dir></div>
              \`
            })
            export class MyAppComp {}

            @NgModule({declarations: [MyAppComp, MyDir]})
            export class MyModule {}
          `
        }
      };

      const template = `
          hostVars: 10,
          hostBindings: function MyDir_HostBindings(rf, ctx) {
            if (rf & 2) {
              $r3$.ɵɵhostProperty("title", ctx.title);
              $r3$.ɵɵsyntheticHostProperty("@anim",
                $r3$.ɵɵpureFunction2(7, _c1, ctx._animValue,
                $r3$.ɵɵpureFunction2(4, _c0, ctx._animParam1, ctx._animParam2)));
              $r3$.ɵɵclassProp("foo", ctx.foo);
            }
          }
      `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });
  });
});
