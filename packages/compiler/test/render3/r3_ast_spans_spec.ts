/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseSourceSpan} from '../../src/parse_util';
import * as t from '../../src/render3/r3_ast';
import {parseR3 as parse} from './view/util';


class R3AstSourceSpans implements t.Visitor<void> {
  result: any[] = [];

  visitElement(element: t.Element) {
    this.result.push([
      'Element', humanizeSpan(element.sourceSpan), humanizeSpan(element.startSourceSpan),
      humanizeSpan(element.endSourceSpan)
    ]);
    this.visitAll([
      element.attributes,
      element.inputs,
      element.outputs,
      element.references,
      element.children,
    ]);
  }

  visitTemplate(template: t.Template) {
    this.result.push([
      'Template', humanizeSpan(template.sourceSpan), humanizeSpan(template.startSourceSpan),
      humanizeSpan(template.endSourceSpan)
    ]);
    this.visitAll([
      template.attributes,
      template.inputs,
      template.outputs,
      template.templateAttrs,
      template.references,
      template.variables,
      template.children,
    ]);
  }

  visitContent(content: t.Content) {
    this.result.push(['Content', humanizeSpan(content.sourceSpan)]);
    t.visitAll(this, content.attributes);
  }

  visitVariable(variable: t.Variable) {
    this.result.push(
        ['Variable', humanizeSpan(variable.sourceSpan), humanizeSpan(variable.valueSpan)]);
  }

  visitReference(reference: t.Reference) {
    this.result.push(
        ['Reference', humanizeSpan(reference.sourceSpan), humanizeSpan(reference.valueSpan)]);
  }

  visitTextAttribute(attribute: t.TextAttribute) {
    this.result.push(
        ['TextAttribute', humanizeSpan(attribute.sourceSpan), humanizeSpan(attribute.valueSpan)]);
  }

  visitBoundAttribute(attribute: t.BoundAttribute) {
    this.result.push(
        ['BoundAttribute', humanizeSpan(attribute.sourceSpan), humanizeSpan(attribute.valueSpan)]);
  }

  visitBoundEvent(event: t.BoundEvent) {
    this.result.push(
        ['BoundEvent', humanizeSpan(event.sourceSpan), humanizeSpan(event.handlerSpan)]);
  }

  visitText(text: t.Text) { this.result.push(['Text', humanizeSpan(text.sourceSpan)]); }

  visitBoundText(text: t.BoundText) {
    this.result.push(['BoundText', humanizeSpan(text.sourceSpan)]);
  }

  visitIcu(icu: t.Icu) { return null; }

  private visitAll(nodes: t.Node[][]) { nodes.forEach(node => t.visitAll(this, node)); }
}

function humanizeSpan(span: ParseSourceSpan | null | undefined): string {
  if (span === null || span === undefined) {
    return `<empty>`;
  }
  return `${span.start.offset}:${span.end.offset}`;
}

function expectFromHtml(html: string) {
  const res = parse(html);
  return expectFromR3Nodes(res.nodes);
}

function expectFromR3Nodes(nodes: t.Node[]) {
  const humanizer = new R3AstSourceSpans();
  t.visitAll(humanizer, nodes);
  return expect(humanizer.result);
}

describe('R3 AST source spans', () => {
  describe('nodes without binding', () => {
    it('is correct for text nodes', () => {
      expectFromHtml('a').toEqual([
        ['Text', '0:1'],
      ]);
    });

    it('is correct for elements with attributes', () => {
      expectFromHtml('<div a="b"></div>').toEqual([
        ['Element', '0:17', '0:11', '11:17'],
        ['TextAttribute', '5:10', '8:9'],
      ]);
    });

    it('is correct for elements with attributes without value', () => {
      expectFromHtml('<div a></div>').toEqual([
        ['Element', '0:13', '0:7', '7:13'],
        ['TextAttribute', '5:6', '<empty>'],
      ]);
    });
  });

  describe('bound text nodes', () => {
    it('is correct for bound text nodes', () => {
      expectFromHtml('{{a}}').toEqual([
        ['BoundText', '0:5'],
      ]);
    });
  });

  describe('bound attributes', () => {
    it('is correct for bound properties', () => {
      expectFromHtml('<div [someProp]="v"></div>').toEqual([
        ['Element', '0:26', '0:20', '20:26'],
        ['BoundAttribute', '5:19', '17:18'],
      ]);
    });

    it('is correct for bound properties without value', () => {
      expectFromHtml('<div [someProp]></div>').toEqual([
        ['Element', '0:22', '0:16', '16:22'],
        ['BoundAttribute', '5:15', '<empty>'],
      ]);
    });

    it('is correct for bound properties via bind- ', () => {
      expectFromHtml('<div bind-prop="v"></div>').toEqual([
        ['Element', '0:25', '0:19', '19:25'],
        ['BoundAttribute', '5:18', '16:17'],
      ]);
    });

    it('is correct for bound properties via {{...}}', () => {
      expectFromHtml('<div prop="{{v}}"></div>').toEqual([
        ['Element', '0:24', '0:18', '18:24'],
        ['BoundAttribute', '5:17', '11:16'],
      ]);
    });
  });

  describe('templates', () => {
    it('is correct for * directives', () => {
      expectFromHtml('<div *ngIf></div>').toEqual([
        ['Template', '0:11', '0:11', '11:17'],
        ['TextAttribute', '5:10', '<empty>'],
        ['Element', '0:17', '0:11', '11:17'],
      ]);
    });

    it('is correct for <ng-template>', () => {
      expectFromHtml('<ng-template></ng-template>').toEqual([
        ['Template', '0:13', '0:13', '13:27'],
      ]);
    });

    it('is correct for reference via #...', () => {
      expectFromHtml('<ng-template #a></ng-template>').toEqual([
        ['Template', '0:16', '0:16', '16:30'],
        ['Reference', '13:15', '<empty>'],
      ]);
    });

    it('is correct for reference with name', () => {
      expectFromHtml('<ng-template #a="b"></ng-template>').toEqual([
        ['Template', '0:20', '0:20', '20:34'],
        ['Reference', '13:19', '17:18'],
      ]);
    });

    it('is correct for reference via ref-...', () => {
      expectFromHtml('<ng-template ref-a></ng-template>').toEqual([
        ['Template', '0:19', '0:19', '19:33'],
        ['Reference', '13:18', '<empty>'],
      ]);
    });

    it('is correct for variables via let-...', () => {
      expectFromHtml('<ng-template let-a="b"></ng-template>').toEqual([
        ['Template', '0:23', '0:23', '23:37'],
        ['Variable', '13:22', '20:21'],
      ]);
    });

    it('is correct for attributes', () => {
      expectFromHtml('<ng-template k1="v1"></ng-template>').toEqual([
        ['Template', '0:21', '0:21', '21:35'],
        ['TextAttribute', '13:20', '17:19'],
      ]);
    });

    it('is correct for bound attributes', () => {
      expectFromHtml('<ng-template [k1]="v1"></ng-template>').toEqual([
        ['Template', '0:23', '0:23', '23:37'],
        ['BoundAttribute', '13:22', '19:21'],
      ]);
    });
  });

  // TODO(joost): improve spans of nodes extracted from macrosyntax
  describe('inline templates', () => {
    it('is correct for attribute and bound attributes', () => {
      expectFromHtml('<div *ngFor="item of items"></div>').toEqual([
        ['Template', '0:28', '0:28', '28:34'],
        ['BoundAttribute', '5:27', '<empty>'],
        ['BoundAttribute', '5:27', '<empty>'],
        ['Element', '0:34', '0:28', '28:34'],
      ]);
    });

    it('is correct for variables via let ...', () => {
      expectFromHtml('<div *ngIf="let a=b"></div>').toEqual([
        ['Template', '0:21', '0:21', '21:27'],
        ['TextAttribute', '5:20', '<empty>'],
        ['Variable', '5:20', '<empty>'],
        ['Element', '0:27', '0:21', '21:27'],
      ]);
    });

    it('is correct for variables via as ...', () => {
      expectFromHtml('<div *ngIf="expr as local"></div>').toEqual([
        ['Template', '0:27', '0:27', '27:33'],
        ['BoundAttribute', '5:26', '<empty>'],
        ['Variable', '5:26', '<empty>'],
        ['Element', '0:33', '0:27', '27:33'],
      ]);
    });
  });

  describe('events', () => {
    it('is correct for event names case sensitive', () => {
      expectFromHtml('<div (someEvent)="v"></div>').toEqual([
        ['Element', '0:27', '0:21', '21:27'],
        ['BoundEvent', '5:20', '18:19'],
      ]);
    });

    it('is correct for bound events via on-', () => {
      expectFromHtml('<div on-event="v"></div>').toEqual([
        ['Element', '0:24', '0:18', '18:24'],
        ['BoundEvent', '5:17', '15:16'],
      ]);
    });

    it('is correct for bound events and properties via [(...)]', () => {
      expectFromHtml('<div [(prop)]="v"></div>').toEqual([
        ['Element', '0:24', '0:18', '18:24'],
        ['BoundAttribute', '5:17', '15:16'],
        ['BoundEvent', '5:17', '15:16'],
      ]);
    });

    it('is correct for bound events and properties via bindon-', () => {
      expectFromHtml('<div bindon-prop="v"></div>').toEqual([
        ['Element', '0:27', '0:21', '21:27'],
        ['BoundAttribute', '5:20', '18:19'],
        ['BoundEvent', '5:20', '18:19'],
      ]);
    });
  });

  describe('references', () => {
    it('is correct for references via #...', () => {
      expectFromHtml('<div #a></div>').toEqual([
        ['Element', '0:14', '0:8', '8:14'],
        ['Reference', '5:7', '<empty>'],
      ]);
    });

    it('is correct for references with name', () => {
      expectFromHtml('<div #a="b"></div>').toEqual([
        ['Element', '0:18', '0:12', '12:18'],
        ['Reference', '5:11', '9:10'],
      ]);
    });

    it('is correct for references via ref-', () => {
      expectFromHtml('<div ref-a></div>').toEqual([
        ['Element', '0:17', '0:11', '11:17'],
        ['Reference', '5:10', '<empty>'],
      ]);
    });
  });
});
