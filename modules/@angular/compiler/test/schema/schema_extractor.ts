import {isString, isPresent} from '../../src/facade/lang';

const SVG_PREFIX = ':svg:';

var document = typeof global['document'] == 'object' ? global['document'] : null;

export function extractSchema(fn: (descriptors: string[]) => void): string[] {
  var SVGGraphicsElement = global['SVGGraphicsElement'];
  var SVGAnimationElement = global['SVGAnimationElement'];
  var SVGGeometryElement = global['SVGGeometryElement'];
  var SVGComponentTransferFunctionElement = global['SVGComponentTransferFunctionElement'];
  var SVGGradientElement = global['SVGGradientElement'];
  var SVGTextContentElement = global['SVGTextContentElement'];
  var SVGTextPositioningElement = global['SVGTextPositioningElement'];
  if (!document || !SVGGraphicsElement) return null;
  var descriptors: string[] = [];
  var visited: {[name: string]: boolean} = {};
  var element = document.createElement('video');
  var svgAnimation = document.createElementNS('http://www.w3.org/2000/svg', 'set');
  var svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  var svgFeFuncA = document.createElementNS('http://www.w3.org/2000/svg', 'feFuncA');
  var svgGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  var svgText = document.createElementNS('http://www.w3.org/2000/svg', 'text');

  extractProperties(Element, element, visited, descriptors, '*', '');
  extractProperties(HTMLElement, element, visited, descriptors, '', '*');
  extractProperties(HTMLMediaElement, element, visited, descriptors, 'media', '');
  extractProperties(SVGElement, svgText, visited, descriptors, SVG_PREFIX, '*');
  extractProperties(SVGGraphicsElement, svgText, visited, descriptors, SVG_PREFIX + 'graphics',
                    SVG_PREFIX);
  extractProperties(SVGAnimationElement, svgAnimation, visited, descriptors,
                    SVG_PREFIX + 'animation', SVG_PREFIX);
  extractProperties(SVGGeometryElement, svgPath, visited, descriptors, SVG_PREFIX + 'geometry',
                    SVG_PREFIX);
  extractProperties(SVGComponentTransferFunctionElement, svgFeFuncA, visited, descriptors,
                    SVG_PREFIX + 'componentTransferFunction', SVG_PREFIX);
  extractProperties(SVGGradientElement, svgGradient, visited, descriptors, SVG_PREFIX + 'gradient',
                    SVG_PREFIX);
  extractProperties(SVGTextContentElement, svgText, visited, descriptors,
                    SVG_PREFIX + 'textContent', SVG_PREFIX + 'graphics');
  extractProperties(SVGTextPositioningElement, svgText, visited, descriptors,
                    SVG_PREFIX + 'textPositioning', SVG_PREFIX + 'textContent');
  var keys = Object.getOwnPropertyNames(window).filter(
      k => k.endsWith('Element') && (k.startsWith('HTML') || k.startsWith('SVG')));
  keys.sort();
  keys.forEach(name => extractRecursiveProperties(visited, descriptors, window[name]));
  fn(descriptors);
}

function extractRecursiveProperties(visited: {[name: string]: boolean}, descriptors: string[],
                                    type: Function): string {
  var name = extractName(type);
  if (visited[name]) return name;  // already been here
  var superName = '';
  if (name != '*') {
    superName =
        extractRecursiveProperties(visited, descriptors, type.prototype.__proto__.constructor);
  }

  var instance: HTMLElement = null;
  name.split(',').forEach(tagName => {
    instance = isSVG(type) ?
                   document.createElementNS('http://www.w3.org/2000/svg',
                                            tagName.replace(SVG_PREFIX, '')) :
                   document.createElement(tagName);
    var htmlType = type;
    if (tagName == 'cite') htmlType = HTMLElement;
    if (!(instance instanceof htmlType)) {
      throw new Error(`Tag <${tagName}> is not an instance of ${htmlType['name']}`);
    }
  });
  extractProperties(type, instance, visited, descriptors, name, superName);
  return name;
}

function extractProperties(type: Function, instance: any, visited: {[name: string]: boolean},
                           descriptors: string[], name: string, superName: string) {
  if (!type) return;
  visited[name] = true;
  var props = <string[]>[];
  var prototype = type.prototype;
  var keys = Object.getOwnPropertyNames(prototype);
  keys.sort();
  keys.forEach((n) => {
    if (n.startsWith('on')) {
      props.push('*' + n.substr(2));
    } else {
      var typeCh = typeMap[typeof instance[n]];
      var descriptor = Object.getOwnPropertyDescriptor(prototype, n);
      var isSetter = descriptor && isPresent(descriptor.set);
      if (isString(typeCh) && !n.startsWith('webkit') && isSetter) {
        props.push(typeCh + n);
      }
    }
  });
  descriptors.push(name + (superName ? '^' + superName : '') + '|' + props.join(','));
}

function extractName(type: Function): string {
  var name = type['name'];
  if (name == 'Element') return '*';
  if (name == 'HTMLImageElement') return 'img';
  if (name == 'HTMLAnchorElement') return 'a';
  if (name == 'HTMLDListElement') return 'dl';
  if (name == 'HTMLDirectoryElement') return 'dir';
  if (name == 'HTMLHeadingElement') return 'h1,h2,h3,h4,h5,h6';
  if (name == 'HTMLModElement') return 'ins,del';
  if (name == 'HTMLOListElement') return 'ol';
  if (name == 'HTMLParagraphElement') return 'p';
  if (name == 'HTMLQuoteElement') return 'q,blockquote,cite';
  if (name == 'HTMLTableCaptionElement') return 'caption';
  if (name == 'HTMLTableCellElement') return 'th,td';
  if (name == 'HTMLTableColElement') return 'col,colgroup';
  if (name == 'HTMLTableRowElement') return 'tr';
  if (name == 'HTMLTableSectionElement') return 'tfoot,thead,tbody';
  if (name == 'HTMLUListElement') return 'ul';
  if (name == 'SVGGraphicsElement') return SVG_PREFIX + 'graphics';
  if (name == 'SVGMPathElement') return SVG_PREFIX + 'mpath';
  if (name == 'SVGSVGElement') return SVG_PREFIX + 'svg';
  if (name == 'SVGTSpanElement') return SVG_PREFIX + 'tspan';
  var isSVG = name.startsWith('SVG');
  if (name.startsWith('HTML') || isSVG) {
    name = name.replace('HTML', '').replace('SVG', '').replace('Element', '');
    if (isSVG && name.startsWith('FE')) {
      name = 'fe' + name.substring(2);
    } else if (name) {
      name = name.charAt(0).toLowerCase() + name.substring(1);
    }
    return isSVG ? SVG_PREFIX + name : name.toLowerCase();
  } else {
    return null;
  }
}

function isSVG(type: Function): boolean {
  return type['name'].startsWith('SVG');
}

const typeMap =
    <{[type: string]: string}>{'string': '', 'number': '#', 'boolean': '!', 'object': '%'};
