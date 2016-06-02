import {
  describe,
  it,
  iit,
  expect,
  ddescribe,
  beforeEach
} from '@angular/core/testing/testing_internal';
import {isBlank} from '@angular/facade/src/lang';
import {ListWrapper} from '@angular/facade/src/collection';

import {
  StaticReflector,
  StaticReflectorHost,
  StaticSymbol
} from '@angular/compiler-cli/src/static_reflector';

describe('StaticReflector', () => {
  let noContext = new StaticSymbol('', '');
  let host: StaticReflectorHost;
  let reflector: StaticReflector;

  beforeEach(() => {
    host = new MockReflectorHost();
    reflector = new StaticReflector(host);
  });

  function simplify(context: StaticSymbol, value: any) {
    return reflector.simplify(context, value);
  }

  it('should get annotations for NgFor', () => {
    let NgFor = host.findDeclaration('angular2/src/common/directives/ng_for', 'NgFor');
    let annotations = reflector.annotations(NgFor);
    expect(annotations.length).toEqual(1);
    let annotation = annotations[0];
    expect(annotation.selector).toEqual('[ngFor][ngForOf]');
    expect(annotation.inputs).toEqual(['ngForTrackBy', 'ngForOf', 'ngForTemplate']);
  });

  it('should get constructor for NgFor', () => {
    let NgFor = host.findDeclaration('angular2/src/common/directives/ng_for', 'NgFor');
    let ViewContainerRef =
        host.findDeclaration('angular2/src/core/linker/view_container_ref', 'ViewContainerRef');
    let TemplateRef = host.findDeclaration('angular2/src/core/linker/template_ref', 'TemplateRef');
    let IterableDiffers = host.findDeclaration(
        'angular2/src/core/change_detection/differs/iterable_differs', 'IterableDiffers');
    let ChangeDetectorRef = host.findDeclaration(
        'angular2/src/core/change_detection/change_detector_ref', 'ChangeDetectorRef');

    let parameters = reflector.parameters(NgFor);
    expect(parameters)
        .toEqual([[ViewContainerRef], [TemplateRef], [IterableDiffers], [ChangeDetectorRef]]);
  });

  it('should get annotations for HeroDetailComponent', () => {
    let HeroDetailComponent =
        host.findDeclaration('src/app/hero-detail.component', 'HeroDetailComponent');
    let annotations = reflector.annotations(HeroDetailComponent);
    expect(annotations.length).toEqual(1);
    let annotation = annotations[0];
    expect(annotation.selector).toEqual('my-hero-detail');
    expect(annotation.directives)
        .toEqual([[host.findDeclaration('angular2/src/common/directives/ng_for', 'NgFor')]]);
  });

  it('should get and empty annotation list for an unknown class', () => {
    let UnknownClass = host.findDeclaration('src/app/app.component', 'UnknownClass');
    let annotations = reflector.annotations(UnknownClass);
    expect(annotations).toEqual([]);
  });

  it('should get propMetadata for HeroDetailComponent', () => {
    let HeroDetailComponent =
        host.findDeclaration('src/app/hero-detail.component', 'HeroDetailComponent');
    let props = reflector.propMetadata(HeroDetailComponent);
    expect(props['hero']).toBeTruthy();
  });

  it('should get an empty object from propMetadata for an unknown class', () => {
    let UnknownClass = host.findDeclaration('src/app/app.component', 'UnknownClass');
    let properties = reflector.propMetadata(UnknownClass);
    expect(properties).toEqual({});
  });

  it('should get empty parameters list for an unknown class ', () => {
    let UnknownClass = host.findDeclaration('src/app/app.component', 'UnknownClass');
    let parameters = reflector.parameters(UnknownClass);
    expect(parameters).toEqual([]);
  });

  it('should simplify primitive into itself', () => {
    expect(simplify(noContext, 1)).toBe(1);
    expect(simplify(noContext, true)).toBe(true);
    expect(simplify(noContext, "some value")).toBe("some value");
  });

  it('should simplify an array into a copy of the array',
     () => { expect(simplify(noContext, [1, 2, 3])).toEqual([1, 2, 3]); });

  it('should simplify an object to a copy of the object', () => {
    let expr = {a: 1, b: 2, c: 3};
    expect(simplify(noContext, expr)).toEqual(expr);
  });

  it('should simplify &&', () => {
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '&&', left: true, right: true}))).toBe(true);
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '&&', left: true, right: false}))).toBe(false);
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '&&', left: false, right: true}))).toBe(false);
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '&&', left: false, right: false}))).toBe(false);
  });

  it('should simplify ||', () => {
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '||', left: true, right: true}))).toBe(true);
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '||', left: true, right: false}))).toBe(true);
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '||', left: false, right: true}))).toBe(true);
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '||', left: false, right: false}))).toBe(false);
  });

  it('should simplify &', () => {
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '&', left: 0x22, right: 0x0F}))).toBe(0x22 & 0x0F);
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '&', left: 0x22, right: 0xF0}))).toBe(0x22 & 0xF0);
  });

  it('should simplify |', () => {
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '|', left: 0x22, right: 0x0F}))).toBe(0x22 | 0x0F);
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '|', left: 0x22, right: 0xF0}))).toBe(0x22 | 0xF0);
  });

  it('should simplify ^', () => {
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '|', left: 0x22, right: 0x0F}))).toBe(0x22 | 0x0F);
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '|', left: 0x22, right: 0xF0}))).toBe(0x22 | 0xF0);
  });

  it('should simplify ==', () => {
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '==', left: 0x22, right: 0x22}))).toBe(0x22 == 0x22);
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '==', left: 0x22, right: 0xF0}))).toBe(0x22 == 0xF0);
  });

  it('should simplify !=', () => {
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '!=', left: 0x22, right: 0x22}))).toBe(0x22 != 0x22);
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '!=', left: 0x22, right: 0xF0}))).toBe(0x22 != 0xF0);
  });

  it('should simplify ===', () => {
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '===', left: 0x22, right: 0x22}))).toBe(0x22 === 0x22);
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '===', left: 0x22, right: 0xF0}))).toBe(0x22 === 0xF0);
  });

  it('should simplify !==', () => {
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '!==', left: 0x22, right: 0x22}))).toBe(0x22 !== 0x22);
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '!==', left: 0x22, right: 0xF0}))).toBe(0x22 !== 0xF0);
  });

  it('should simplify >', () => {
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '>', left: 1, right: 1}))).toBe(1 > 1);
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '>', left: 1, right: 0}))).toBe(1 > 0);
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '>', left: 0, right: 1}))).toBe(0 > 1);
  });

  it('should simplify >=', () => {
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '>=', left: 1, right: 1}))).toBe(1 >= 1);
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '>=', left: 1, right: 0}))).toBe(1 >= 0);
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '>=', left: 0, right: 1}))).toBe(0 >= 1);
  });

  it('should simplify <=', () => {
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '<=', left: 1, right: 1}))).toBe(1 <= 1);
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '<=', left: 1, right: 0}))).toBe(1 <= 0);
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '<=', left: 0, right: 1}))).toBe(0 <= 1);
  });

  it('should simplify <', () => {
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '<', left: 1, right: 1}))).toBe(1 < 1);
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '<', left: 1, right: 0}))).toBe(1 < 0);
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '<', left: 0, right: 1}))).toBe(0 < 1);
  });

  it('should simplify <<', () => {
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '<<', left: 0x55, right: 2}))).toBe(0x55 << 2);
  });

  it('should simplify >>', () => {
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '>>', left: 0x55, right: 2}))).toBe(0x55 >> 2);
  });

  it('should simplify +', () => {
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '+', left: 0x55, right: 2}))).toBe(0x55 + 2);
  });

  it('should simplify -', () => {
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '-', left: 0x55, right: 2}))).toBe(0x55 - 2);
  });

  it('should simplify *', () => {
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '*', left: 0x55, right: 2}))).toBe(0x55 * 2);
  });

  it('should simplify /', () => {
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '/', left: 0x55, right: 2}))).toBe(0x55 / 2);
  });

  it('should simplify %', () => {
    expect(simplify(noContext, ({ __symbolic: 'binop', operator: '%', left: 0x55, right: 2}))).toBe(0x55 % 2);
  });

  it('should simplify prefix -', () => {
    expect(simplify(noContext, ({ __symbolic: 'pre', operator: '-', operand: 2}))).toBe(-2);
  });

  it('should simplify prefix ~', () => {
    expect(simplify(noContext, ({ __symbolic: 'pre', operator: '~', operand: 2}))).toBe(~2);
  });

  it('should simplify prefix !', () => {
    expect(simplify(noContext, ({ __symbolic: 'pre', operator: '!', operand: true}))).toBe(!true);
    expect(simplify(noContext, ({ __symbolic: 'pre', operator: '!', operand: false}))).toBe(!false);
  });

  it('should simplify an array index', () => {
    expect(simplify(noContext, ({__symbolic: "index", expression: [1, 2, 3], index: 2}))).toBe(3);
  });

  it('should simplify an object index', () => {
    let expr = {__symbolic: "select", expression: {a: 1, b: 2, c: 3}, member: "b"};
    expect(simplify(noContext, expr)).toBe(2);
  });

  it('should simplify a module reference', () => {
    expect(simplify(new StaticSymbol('/src/cases', ''),
                    ({__symbolic: "reference", module: "./extern", name: "s"})))
        .toEqual("s");
  });

  it('should simplify a non existing reference as a static symbol', () => {
    expect(simplify(new StaticSymbol('/src/cases', ''),
                    ({__symbolic: "reference", module: "./extern", name: "nonExisting"})))
        .toEqual(host.getStaticSymbol('/src/extern.d.ts', 'nonExisting'));
  });
});

class MockReflectorHost implements StaticReflectorHost {
  private staticTypeCache = new Map<string, StaticSymbol>();

  angularImportLocations() {
    return {
      coreDecorators: 'angular2/src/core/metadata',
      diDecorators: 'angular2/src/core/di/decorators',
      diMetadata: 'angular2/src/core/di/metadata',
      provider: 'angular2/src/core/di/provider'
    };
  }
  getStaticSymbol(declarationFile: string, name: string): StaticSymbol {
    var cacheKey = `${declarationFile}:${name}`;
    var result = this.staticTypeCache.get(cacheKey);
    if (isBlank(result)) {
      result = new StaticSymbol(declarationFile, name);
      this.staticTypeCache.set(cacheKey, result);
    }
    return result;
  }

  // In tests, assume that symbols are not re-exported
  findDeclaration(modulePath: string, symbolName: string, containingFile?: string): StaticSymbol {
    function splitPath(path: string): string[] { return path.split(/\/|\\/g); }

    function resolvePath(pathParts: string[]): string {
      let result: string[] = [];
      ListWrapper.forEachWithIndex(pathParts, (part, index) => {
        switch (part) {
          case '':
          case '.':
            if (index > 0) return;
            break;
          case '..':
            if (index > 0 && result.length != 0) result.pop();
            return;
        }
        result.push(part);
      });
      return result.join('/');
    }

    function pathTo(from: string, to: string): string {
      let result = to;
      if (to.startsWith('.')) {
        let fromParts = splitPath(from);
        fromParts.pop();  // remove the file name.
        let toParts = splitPath(to);
        result = resolvePath(fromParts.concat(toParts));
      }
      return result;
    }

    if (modulePath.indexOf('.') === 0) {
      return this.getStaticSymbol(pathTo(containingFile, modulePath) + '.d.ts', symbolName);
    }
    return this.getStaticSymbol('/tmp/' + modulePath + '.d.ts', symbolName);
  }

  getMetadataFor(moduleId: string): any {
    let data: {[key: string]: any} = {
      '/tmp/angular2/src/common/forms/directives.d.ts': {
        "__symbolic": "module",
        "metadata": {
          "FORM_DIRECTIVES": [
            {
              "__symbolic": "reference",
              "name": "NgFor",
              "module": "angular2/src/common/directives/ng_for"
            }
          ]
        }
      },
      '/tmp/angular2/src/common/directives/ng_for.d.ts': {
        "__symbolic": "module",
        "metadata": {
          "NgFor": {
            "__symbolic": "class",
            "decorators": [
              {
                "__symbolic": "call",
                "expression": {
                  "__symbolic": "reference",
                  "name": "Directive",
                  "module": "../../core/metadata"
                },
                "arguments": [
                  {
                    "selector": "[ngFor][ngForOf]",
                    "inputs": ["ngForTrackBy", "ngForOf", "ngForTemplate"]
                  }
                ]
              }
            ],
            "members": {
              "__ctor__": [
                {
                  "__symbolic": "constructor",
                  "parameters": [
                    {
                      "__symbolic": "reference",
                      "module": "../../core/linker/view_container_ref",
                      "name": "ViewContainerRef"
                    },
                    {
                      "__symbolic": "reference",
                      "module": "../../core/linker/template_ref",
                      "name": "TemplateRef"
                    },
                    {
                      "__symbolic": "reference",
                      "module": "../../core/change_detection/differs/iterable_differs",
                      "name": "IterableDiffers"
                    },
                    {
                      "__symbolic": "reference",
                      "module": "../../core/change_detection/change_detector_ref",
                      "name": "ChangeDetectorRef"
                    }
                  ]
                }
              ]
            }
          }
        }
      },
      '/tmp/angular2/src/core/linker/view_container_ref.d.ts':
          {"metadata": {"ViewContainerRef": {"__symbolic": "class"}}},
      '/tmp/angular2/src/core/linker/template_ref.d.ts':
          {"module": "./template_ref", "metadata": {"TemplateRef": {"__symbolic": "class"}}},
      '/tmp/angular2/src/core/change_detection/differs/iterable_differs.d.ts':
          {"metadata": {"IterableDiffers": {"__symbolic": "class"}}},
      '/tmp/angular2/src/core/change_detection/change_detector_ref.d.ts':
          {"metadata": {"ChangeDetectorRef": {"__symbolic": "class"}}},
      '/tmp/src/app/hero-detail.component.d.ts': {
        "__symbolic": "module",
        "metadata": {
          "HeroDetailComponent": {
            "__symbolic": "class",
            "decorators": [
              {
                "__symbolic": "call",
                "expression": {
                  "__symbolic": "reference",
                  "name": "Component",
                  "module": "angular2/src/core/metadata"
                },
                "arguments": [
                  {
                    "selector": "my-hero-detail",
                    "template":
                        "\n  <div *ngIf=\"hero\">\n    <h2>{{hero.name}} details!</h2>\n    <div><label>id: </label>{{hero.id}}</div>\n    <div>\n      <label>name: </label>\n      <input [(ngModel)]=\"hero.name\" placeholder=\"name\"/>\n    </div>\n  </div>\n",
                    "directives": [
                      {
                        "__symbolic": "reference",
                        "name": "FORM_DIRECTIVES",
                        "module": "angular2/src/common/forms/directives"
                      }
                    ]
                  }
                ]
              }
            ],
            "members": {
              "hero": [
                {
                  "__symbolic": "property",
                  "decorators": [
                    {
                      "__symbolic": "call",
                      "expression": {
                        "__symbolic": "reference",
                        "name": "Input",
                        "module": "angular2/src/core/metadata"
                      }
                    }
                  ]
                }
              ]
            }
          }
        }
      },
      '/src/extern.d.ts': {"__symbolic": "module", metadata: {s: "s"}}
    };
    return data[moduleId];
  }
}
