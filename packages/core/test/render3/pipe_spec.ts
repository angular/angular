/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, OnChanges, OnDestroy, Pipe, PipeTransform} from '@angular/core';
import {expect} from '@angular/platform-browser/testing/src/matchers';

import {defineDirective, definePipe} from '../../src/render3/definition';
import {bind, container, containerRefreshEnd, containerRefreshStart, elementEnd, elementProperty, elementStart, embeddedViewEnd, embeddedViewStart, interpolation1, load, text, textBinding} from '../../src/render3/instructions';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {pipe, pipeBind1, pipeBind3, pipeBind4, pipeBindV} from '../../src/render3/pipe';

import {RenderLog, getRendererFactory2, patchLoggingRenderer2} from './imported_renderer2';
import {ComponentFixture, createComponent, getDirectiveOnNode, renderToHtml} from './render_util';


let log: string[] = [];
let person: Person;
let renderLog: RenderLog = new RenderLog();
const rendererFactory2 = getRendererFactory2(document);
patchLoggingRenderer2(rendererFactory2, renderLog);

describe('pipe', () => {
  beforeEach(() => {
    log = [];
    renderLog.clear();
    person = new Person();
  });

  const pipes = () => [CountingPipe, MultiArgPipe, CountingImpurePipe];

  it('should support interpolation', () => {
    function Template(rf: RenderFlags, person: Person) {
      if (rf & RenderFlags.Create) {
        text(0);
        pipe(1, 'countingPipe');
      }
      if (rf & RenderFlags.Update) {
        textBinding(0, interpolation1('', pipeBind1(1, 1, person.name), ''));
      }
    }

    person.init('bob', null);
    expect(renderToHtml(Template, person, 2, 3, null, pipes)).toEqual('bob state:0');
  });

  it('should throw if pipe is not found', () => {
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        text(0);
        pipe(1, 'randomPipeName');
      }
      if (rf & RenderFlags.Update) {
        textBinding(0, interpolation1('', pipeBind1(1, 1, ctx.value), ''));
      }
    }, 2, 3, [], pipes);

    expect(() => {
      const fixture = new ComponentFixture(App);
    }).toThrowError(/Pipe with name 'randomPipeName' not found!/);
  });

  it('should support bindings', () => {
    let directive: any = null;

    @Directive({selector: '[my-dir]', inputs: ['dirProp: elprop'], exportAs: 'mydir'})
    class MyDir {
      dirProp: string;

      constructor() { this.dirProp = ''; }

      static ngDirectiveDef = defineDirective({
        type: MyDir,
        selectors: [['', 'myDir', '']],
        factory: () => new MyDir(),
        inputs: {dirProp: 'elprop'}
      });
    }

    @Pipe({name: 'double'})
    class DoublePipe implements PipeTransform {
      transform(value: any) { return `${value}${value}`; }

      static ngPipeDef = definePipe({
        name: 'double',
        type: DoublePipe,
        factory: function DoublePipe_Factory() { return new DoublePipe(); },
      });
    }

    function Template(rf: RenderFlags, ctx: string) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'div', ['myDir', '']);
        pipe(1, 'double');
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        elementProperty(0, 'elprop', bind(pipeBind1(1, 1, ctx)));
        directive = getDirectiveOnNode(0);
      }
    }
    renderToHtml(Template, 'a', 2, 3, [MyDir], [DoublePipe]);
    expect(directive !.dirProp).toEqual('aa');
  });

  it('should support arguments in pipes', () => {
    function Template(rf: RenderFlags, person: Person) {
      if (rf & RenderFlags.Create) {
        text(0);
        pipe(1, 'multiArgPipe');
      }
      if (rf & RenderFlags.Update) {
        textBinding(
            0, interpolation1('', pipeBind3(1, 1, person.name, 'one', person.address !.city), ''));
      }
    }

    person.init('value', new Address('two'));
    expect(renderToHtml(Template, person, 2, 5, null, pipes)).toEqual('value one two default');
  });

  it('should support calling pipes with different number of arguments', () => {
    function Template(rf: RenderFlags, person: Person) {
      if (rf & RenderFlags.Create) {
        text(0);
        pipe(1, 'multiArgPipe');
        pipe(2, 'multiArgPipe');
      }
      if (rf & RenderFlags.Update) {
        textBinding(
            0, interpolation1(
                   '', pipeBind4(2, 5, pipeBindV(1, 1, [person.name, 'a', 'b']), 0, 1, 2), ''));
      }
    }

    person.init('value', null);
    expect(renderToHtml(Template, person, 3, 10, null, pipes)).toEqual('value a b default 0 1 2');
  });

  it('should do nothing when no change', () => {
    @Pipe({name: 'identityPipe'})
    class IdentityPipe implements PipeTransform {
      transform(value: any) { return value; }

      static ngPipeDef = definePipe({
        name: 'identityPipe',
        type: IdentityPipe,
        factory: function IdentityPipe_Factory() { return new IdentityPipe(); },
      });
    }

    function Template(rf: RenderFlags, person: Person) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'div');
        pipe(1, 'identityPipe');
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        elementProperty(0, 'someProp', bind(pipeBind1(1, 1, 'Megatron')));
      }
    }

    renderToHtml(Template, person, 2, 3, null, [IdentityPipe], rendererFactory2);
    expect(renderLog.log).toEqual(['someProp=Megatron']);

    renderLog.clear();
    renderToHtml(Template, person, 2, 3, null, pipes, rendererFactory2);
    expect(renderLog.log).toEqual([]);
  });

  describe('pure', () => {
    it('should call pure pipes only if the arguments change', () => {
      function Template(rf: RenderFlags, person: Person) {
        if (rf & RenderFlags.Create) {
          text(0);
          pipe(1, 'countingPipe');
        }
        if (rf & RenderFlags.Update) {
          textBinding(0, interpolation1('', pipeBind1(1, 1, person.name), ''));
        }
      }

      // change from undefined -> null
      person.name = null;
      expect(renderToHtml(Template, person, 2, 3, null, pipes)).toEqual('null state:0');
      expect(renderToHtml(Template, person, 2, 3, null, pipes)).toEqual('null state:0');

      // change from null -> some value
      person.name = 'bob';
      expect(renderToHtml(Template, person, 2, 3, null, pipes)).toEqual('bob state:1');
      expect(renderToHtml(Template, person, 2, 3, null, pipes)).toEqual('bob state:1');

      // change from some value -> some other value
      person.name = 'bart';
      expect(renderToHtml(Template, person, 2, 3, null, pipes)).toEqual('bart state:2');
      expect(renderToHtml(Template, person, 2, 3, null, pipes)).toEqual('bart state:2');
    });
  });

  describe('impure', () => {
    it('should call impure pipes on each change detection run', () => {
      function Template(rf: RenderFlags, person: Person) {
        if (rf & RenderFlags.Create) {
          text(0);
          pipe(1, 'countingImpurePipe');
        }
        if (rf & RenderFlags.Update) {
          textBinding(0, interpolation1('', pipeBind1(1, 1, person.name), ''));
        }
      }

      person.name = 'bob';
      expect(renderToHtml(Template, person, 2, 3, null, pipes)).toEqual('bob state:0');
      expect(renderToHtml(Template, person, 2, 3, null, pipes)).toEqual('bob state:1');
    });

    it('should not cache impure pipes', () => {
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div');
          pipe(1, 'countingImpurePipe');
          elementEnd();
          elementStart(2, 'div');
          pipe(3, 'countingImpurePipe');
          elementEnd();
          container(4);
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'someProp', bind(pipeBind1(1, 2, true)));
          elementProperty(2, 'someProp', bind(pipeBind1(3, 4, true)));
          pipeInstances.push(load<CountingImpurePipe>(1), load(3));
          containerRefreshStart(4);
          {
            for (let i of [1, 2]) {
              let rf1 = embeddedViewStart(1, 2, 3);
              {
                if (rf1 & RenderFlags.Create) {
                  elementStart(0, 'div');
                  pipe(1, 'countingImpurePipe');
                  elementEnd();
                }
                if (rf1 & RenderFlags.Update) {
                  elementProperty(0, 'someProp', bind(pipeBind1(1, 1, true)));
                  pipeInstances.push(load<CountingImpurePipe>(1));
                }
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }

      const pipeInstances: CountingImpurePipe[] = [];
      renderToHtml(Template, {}, 5, 6, null, pipes, rendererFactory2);
      expect(pipeInstances.length).toEqual(4);
      expect(pipeInstances[0]).toBeAnInstanceOf(CountingImpurePipe);
      expect(pipeInstances[1]).toBeAnInstanceOf(CountingImpurePipe);
      expect(pipeInstances[1]).not.toBe(pipeInstances[0]);
      expect(pipeInstances[2]).toBeAnInstanceOf(CountingImpurePipe);
      expect(pipeInstances[2]).not.toBe(pipeInstances[0]);
      expect(pipeInstances[3]).toBeAnInstanceOf(CountingImpurePipe);
      expect(pipeInstances[3]).not.toBe(pipeInstances[0]);
    });
  });

  describe('lifecycles', () => {
    @Pipe({name: 'pipeWithOnDestroy'})
    class PipeWithOnDestroy implements PipeTransform, OnDestroy {
      ngOnDestroy() { log.push('pipeWithOnDestroy - ngOnDestroy'); }

      transform(value: any): any { return null; }

      static ngPipeDef = definePipe({
        name: 'pipeWithOnDestroy',
        type: PipeWithOnDestroy,
        factory: function PipeWithOnDestroy_Factory() { return new PipeWithOnDestroy(); },
      });
    }

    it('should call ngOnDestroy on pipes', () => {
      function Template(rf: RenderFlags, person: Person) {
        if (rf & RenderFlags.Create) {
          container(0);
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(0);
          {
            if (person.age > 20) {
              let rf1 = embeddedViewStart(1, 2, 3);
              {
                if (rf1 & RenderFlags.Create) {
                  text(0);
                  pipe(1, 'pipeWithOnDestroy');
                }
                if (rf & RenderFlags.Update) {
                  textBinding(0, interpolation1('', pipeBind1(1, 1, person.age), ''));
                }
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }
      const pipes = [PipeWithOnDestroy];

      person.age = 25;
      renderToHtml(Template, person, 1, 0, null, pipes);

      person.age = 15;
      renderToHtml(Template, person, 1, 0, null, pipes);
      expect(log).toEqual(['pipeWithOnDestroy - ngOnDestroy']);

      log = [];
      person.age = 30;
      renderToHtml(Template, person, 1, 0, null, pipes);
      expect(log).toEqual([]);

      log = [];
      person.age = 10;
      renderToHtml(Template, person, 1, 0, null, pipes);
      expect(log).toEqual(['pipeWithOnDestroy - ngOnDestroy']);
    });
  });

});

@Pipe({name: 'countingPipe'})
class CountingPipe implements PipeTransform {
  state: number = 0;

  transform(value: any) { return `${value} state:${this.state++}`; }

  static ngPipeDef = definePipe({
    name: 'countingPipe',
    type: CountingPipe,
    factory: function CountingPipe_Factory() { return new CountingPipe(); },
  });
}

@Pipe({name: 'countingImpurePipe', pure: false})
class CountingImpurePipe implements PipeTransform {
  state: number = 0;

  transform(value: any) { return `${value} state:${this.state++}`; }

  static ngPipeDef = definePipe({
    name: 'countingImpurePipe',
    type: CountingImpurePipe,
    factory: function CountingImpurePipe_Factory() { return new CountingImpurePipe(); },
    pure: false,
  });
}

@Pipe({name: 'multiArgPipe'})
class MultiArgPipe implements PipeTransform {
  transform(value: any, arg1: any, arg2: any, arg3 = 'default') {
    return `${value} ${arg1} ${arg2} ${arg3}`;
  }

  static ngPipeDef = definePipe({
    name: 'multiArgPipe',
    type: MultiArgPipe,
    factory: function MultiArgPipe_Factory() { return new MultiArgPipe(); },
  });
}

class Person {
  // TODO(issue/24571): remove '!'.
  age !: number;
  // TODO(issue/24571): remove '!'.
  name !: string | null;
  address: Address|null = null;
  // TODO(issue/24571): remove '!'.
  phones !: number[];

  init(name: string|null, address: Address|null = null) {
    this.name = name;
    this.address = address;
  }

  sayHi(m: any): string { return `Hi, ${m}`; }

  passThrough(val: any): any { return val; }

  toString(): string {
    const address = this.address == null ? '' : ' address=' + this.address.toString();

    return 'name=' + this.name + address;
  }
}

class Address {
  cityGetterCalls: number = 0;
  zipCodeGetterCalls: number = 0;

  constructor(public _city: string, public _zipcode: any = null) {}

  get city() {
    this.cityGetterCalls++;
    return this._city;
  }

  get zipcode() {
    this.zipCodeGetterCalls++;
    return this._zipcode;
  }

  set city(v) { this._city = v; }

  set zipcode(v) { this._zipcode = v; }

  toString(): string { return this.city || '-'; }
}
