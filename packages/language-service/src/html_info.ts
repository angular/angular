/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Information about the HTML DOM elements

// This section defines the HTML elements and attribute surface of HTML 4
// which is derived from https://www.w3.org/TR/html4/strict.dtd
type attrType = string|string[];
type hash<T> = {
  [name: string]: T
};

const values: attrType[] = [
  'ID',
  'CDATA',
  'NAME',
  ['ltr', 'rtl'],
  ['rect', 'circle', 'poly', 'default'],
  'NUMBER',
  ['nohref'],
  ['ismap'],
  ['declare'],
  ['DATA', 'REF', 'OBJECT'],
  ['GET', 'POST'],
  'IDREF',
  ['TEXT', 'PASSWORD', 'CHECKBOX', 'RADIO', 'SUBMIT', 'RESET', 'FILE', 'HIDDEN', 'IMAGE', 'BUTTON'],
  ['checked'],
  ['disabled'],
  ['readonly'],
  ['multiple'],
  ['selected'],
  ['button', 'submit', 'reset'],
  ['void', 'above', 'below', 'hsides', 'lhs', 'rhs', 'vsides', 'box', 'border'],
  ['none', 'groups', 'rows', 'cols', 'all'],
  ['left', 'center', 'right', 'justify', 'char'],
  ['top', 'middle', 'bottom', 'baseline'],
  'IDREFS',
  ['row', 'col', 'rowgroup', 'colgroup'],
  ['defer']
];

const groups: hash<number>[] = [
  {id: 0},
  {
    onclick: 1,
    ondblclick: 1,
    onmousedown: 1,
    onmouseup: 1,
    onmouseover: 1,
    onmousemove: 1,
    onmouseout: 1,
    onkeypress: 1,
    onkeydown: 1,
    onkeyup: 1
  },
  {lang: 2, dir: 3},
  {onload: 1, onunload: 1},
  {name: 1},
  {href: 1},
  {type: 1},
  {alt: 1},
  {tabindex: 5},
  {media: 1},
  {nohref: 6},
  {usemap: 1},
  {src: 1},
  {onfocus: 1, onblur: 1},
  {charset: 1},
  {declare: 8, classid: 1, codebase: 1, data: 1, codetype: 1, archive: 1, standby: 1},
  {title: 1},
  {value: 1},
  {cite: 1},
  {datetime: 1},
  {accept: 1},
  {shape: 4, coords: 1},
  { for: 11
  },
  {action: 1, method: 10, enctype: 1, onsubmit: 1, onreset: 1, 'accept-charset': 1},
  {valuetype: 9},
  {longdesc: 1},
  {width: 1},
  {disabled: 14},
  {readonly: 15, onselect: 1},
  {accesskey: 1},
  {size: 5, multiple: 16},
  {onchange: 1},
  {label: 1},
  {selected: 17},
  {type: 12, checked: 13, size: 1, maxlength: 5},
  {rows: 5, cols: 5},
  {type: 18},
  {height: 1},
  {summary: 1, border: 1, frame: 19, rules: 20, cellspacing: 1, cellpadding: 1, datapagesize: 1},
  {align: 21, char: 1, charoff: 1, valign: 22},
  {span: 5},
  {abbr: 1, axis: 1, headers: 23, scope: 24, rowspan: 5, colspan: 5},
  {profile: 1},
  {'http-equiv': 2, name: 2, content: 1, scheme: 1},
  {class: 1, style: 1},
  {hreflang: 2, rel: 1, rev: 1},
  {ismap: 7},
  {
    defer: 25, event: 1, for: 1
  }
];

const elements: {[name: string]: number[]} = {
  TT: [0, 1, 2, 16, 44],
  I: [0, 1, 2, 16, 44],
  B: [0, 1, 2, 16, 44],
  BIG: [0, 1, 2, 16, 44],
  SMALL: [0, 1, 2, 16, 44],
  EM: [0, 1, 2, 16, 44],
  STRONG: [0, 1, 2, 16, 44],
  DFN: [0, 1, 2, 16, 44],
  CODE: [0, 1, 2, 16, 44],
  SAMP: [0, 1, 2, 16, 44],
  KBD: [0, 1, 2, 16, 44],
  VAR: [0, 1, 2, 16, 44],
  CITE: [0, 1, 2, 16, 44],
  ABBR: [0, 1, 2, 16, 44],
  ACRONYM: [0, 1, 2, 16, 44],
  SUB: [0, 1, 2, 16, 44],
  SUP: [0, 1, 2, 16, 44],
  SPAN: [0, 1, 2, 16, 44],
  BDO: [0, 2, 16, 44],
  BR: [0, 16, 44],
  BODY: [0, 1, 2, 3, 16, 44],
  ADDRESS: [0, 1, 2, 16, 44],
  DIV: [0, 1, 2, 16, 44],
  A: [0, 1, 2, 4, 5, 6, 8, 13, 14, 16, 21, 29, 44, 45],
  MAP: [0, 1, 2, 4, 16, 44],
  AREA: [0, 1, 2, 5, 7, 8, 10, 13, 16, 21, 29, 44],
  LINK: [0, 1, 2, 5, 6, 9, 14, 16, 44, 45],
  IMG: [0, 1, 2, 4, 7, 11, 12, 16, 25, 26, 37, 44, 46],
  OBJECT: [0, 1, 2, 4, 6, 8, 11, 15, 16, 26, 37, 44],
  PARAM: [0, 4, 6, 17, 24],
  HR: [0, 1, 2, 16, 44],
  P: [0, 1, 2, 16, 44],
  H1: [0, 1, 2, 16, 44],
  H2: [0, 1, 2, 16, 44],
  H3: [0, 1, 2, 16, 44],
  H4: [0, 1, 2, 16, 44],
  H5: [0, 1, 2, 16, 44],
  H6: [0, 1, 2, 16, 44],
  PRE: [0, 1, 2, 16, 44],
  Q: [0, 1, 2, 16, 18, 44],
  BLOCKQUOTE: [0, 1, 2, 16, 18, 44],
  INS: [0, 1, 2, 16, 18, 19, 44],
  DEL: [0, 1, 2, 16, 18, 19, 44],
  DL: [0, 1, 2, 16, 44],
  DT: [0, 1, 2, 16, 44],
  DD: [0, 1, 2, 16, 44],
  OL: [0, 1, 2, 16, 44],
  UL: [0, 1, 2, 16, 44],
  LI: [0, 1, 2, 16, 44],
  FORM: [0, 1, 2, 4, 16, 20, 23, 44],
  LABEL: [0, 1, 2, 13, 16, 22, 29, 44],
  INPUT: [0, 1, 2, 4, 7, 8, 11, 12, 13, 16, 17, 20, 27, 28, 29, 31, 34, 44, 46],
  SELECT: [0, 1, 2, 4, 8, 13, 16, 27, 30, 31, 44],
  OPTGROUP: [0, 1, 2, 16, 27, 32, 44],
  OPTION: [0, 1, 2, 16, 17, 27, 32, 33, 44],
  TEXTAREA: [0, 1, 2, 4, 8, 13, 16, 27, 28, 29, 31, 35, 44],
  FIELDSET: [0, 1, 2, 16, 44],
  LEGEND: [0, 1, 2, 16, 29, 44],
  BUTTON: [0, 1, 2, 4, 8, 13, 16, 17, 27, 29, 36, 44],
  TABLE: [0, 1, 2, 16, 26, 38, 44],
  CAPTION: [0, 1, 2, 16, 44],
  COLGROUP: [0, 1, 2, 16, 26, 39, 40, 44],
  COL: [0, 1, 2, 16, 26, 39, 40, 44],
  THEAD: [0, 1, 2, 16, 39, 44],
  TBODY: [0, 1, 2, 16, 39, 44],
  TFOOT: [0, 1, 2, 16, 39, 44],
  TR: [0, 1, 2, 16, 39, 44],
  TH: [0, 1, 2, 16, 39, 41, 44],
  TD: [0, 1, 2, 16, 39, 41, 44],
  HEAD: [2, 42],
  TITLE: [2],
  BASE: [5],
  META: [2, 43],
  STYLE: [2, 6, 9, 16],
  SCRIPT: [6, 12, 14, 47],
  NOSCRIPT: [0, 1, 2, 16, 44],
  HTML: [2]
};

const defaultAttributes = [0, 1, 2, 4];

export function elementNames(): string[] {
  return Object.keys(elements).sort().map(v => v.toLowerCase());
}

function compose(indexes: number[]|undefined): hash<attrType> {
  const result: hash<attrType> = {};
  if (indexes) {
    for (let index of indexes) {
      const group = groups[index];
      for (let name in group)
        if (group.hasOwnProperty(name)) result[name] = values[group[name]];
    }
  }
  return result;
}

export function attributeNames(element: string): string[] {
  return Object.keys(compose(elements[element.toUpperCase()] || defaultAttributes)).sort();
}

export function attributeType(element: string, attribute: string): string|string[]|undefined {
  return compose(elements[element.toUpperCase()] || defaultAttributes)[attribute.toLowerCase()];
}

// This section is describes the DOM property surface of a DOM element and is derivgulp formated
// from
// from the SCHEMA strings from the security context information. SCHEMA is copied here because
// it would be an unnecessary risk to allow this array to be imported from the security context
// schema registry.
const SCHEMA: string[] = [
  '[Element]|textContent,%classList,className,id,innerHTML,*beforecopy,*beforecut,*beforepaste,*copy,*cut,*paste,*search,*selectstart,*webkitfullscreenchange,*webkitfullscreenerror,*wheel,outerHTML,#scrollLeft,#scrollTop,slot' +
      /* added manually to avoid breaking changes */
      ',*message,*mozfullscreenchange,*mozfullscreenerror,*mozpointerlockchange,*mozpointerlockerror,*webglcontextcreationerror,*webglcontextlost,*webglcontextrestored',
  '[HTMLElement]^[Element]|accessKey,contentEditable,dir,!draggable,!hidden,innerText,lang,*abort,*auxclick,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*cuechange,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*seeked,*seeking,*select,*show,*stalled,*submit,*suspend,*timeupdate,*toggle,*volumechange,*waiting,outerText,!spellcheck,%style,#tabIndex,title,!translate',
  'abbr,address,article,aside,b,bdi,bdo,cite,code,dd,dfn,dt,em,figcaption,figure,footer,header,i,kbd,main,mark,nav,noscript,rb,rp,rt,rtc,ruby,s,samp,section,small,strong,sub,sup,u,var,wbr^[HTMLElement]|accessKey,contentEditable,dir,!draggable,!hidden,innerText,lang,*abort,*auxclick,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*cuechange,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*seeked,*seeking,*select,*show,*stalled,*submit,*suspend,*timeupdate,*toggle,*volumechange,*waiting,outerText,!spellcheck,%style,#tabIndex,title,!translate',
  'media^[HTMLElement]|!autoplay,!controls,%controlsList,%crossOrigin,#currentTime,!defaultMuted,#defaultPlaybackRate,!disableRemotePlayback,!loop,!muted,*encrypted,*waitingforkey,#playbackRate,preload,src,%srcObject,#volume',
  ':svg:^[HTMLElement]|*abort,*auxclick,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*cuechange,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*seeked,*seeking,*select,*show,*stalled,*submit,*suspend,*timeupdate,*toggle,*volumechange,*waiting,%style,#tabIndex',
  ':svg:graphics^:svg:|',
  ':svg:animation^:svg:|*begin,*end,*repeat',
  ':svg:geometry^:svg:|',
  ':svg:componentTransferFunction^:svg:|',
  ':svg:gradient^:svg:|',
  ':svg:textContent^:svg:graphics|',
  ':svg:textPositioning^:svg:textContent|',
  'a^[HTMLElement]|charset,coords,download,hash,host,hostname,href,hreflang,name,password,pathname,ping,port,protocol,referrerPolicy,rel,rev,search,shape,target,text,type,username',
  'area^[HTMLElement]|alt,coords,download,hash,host,hostname,href,!noHref,password,pathname,ping,port,protocol,referrerPolicy,rel,search,shape,target,username',
  'audio^media|',
  'br^[HTMLElement]|clear',
  'base^[HTMLElement]|href,target',
  'body^[HTMLElement]|aLink,background,bgColor,link,*beforeunload,*blur,*error,*focus,*hashchange,*languagechange,*load,*message,*offline,*online,*pagehide,*pageshow,*popstate,*rejectionhandled,*resize,*scroll,*storage,*unhandledrejection,*unload,text,vLink',
  'button^[HTMLElement]|!autofocus,!disabled,formAction,formEnctype,formMethod,!formNoValidate,formTarget,name,type,value',
  'canvas^[HTMLElement]|#height,#width',
  'content^[HTMLElement]|select',
  'dl^[HTMLElement]|!compact',
  'datalist^[HTMLElement]|',
  'details^[HTMLElement]|!open',
  'dialog^[HTMLElement]|!open,returnValue',
  'dir^[HTMLElement]|!compact',
  'div^[HTMLElement]|align',
  'embed^[HTMLElement]|align,height,name,src,type,width',
  'fieldset^[HTMLElement]|!disabled,name',
  'font^[HTMLElement]|color,face,size',
  'form^[HTMLElement]|acceptCharset,action,autocomplete,encoding,enctype,method,name,!noValidate,target',
  'frame^[HTMLElement]|frameBorder,longDesc,marginHeight,marginWidth,name,!noResize,scrolling,src',
  'frameset^[HTMLElement]|cols,*beforeunload,*blur,*error,*focus,*hashchange,*languagechange,*load,*message,*offline,*online,*pagehide,*pageshow,*popstate,*rejectionhandled,*resize,*scroll,*storage,*unhandledrejection,*unload,rows',
  'hr^[HTMLElement]|align,color,!noShade,size,width',
  'head^[HTMLElement]|',
  'h1,h2,h3,h4,h5,h6^[HTMLElement]|align',
  'html^[HTMLElement]|version',
  'iframe^[HTMLElement]|align,!allowFullscreen,frameBorder,height,longDesc,marginHeight,marginWidth,name,referrerPolicy,%sandbox,scrolling,src,srcdoc,width',
  'img^[HTMLElement]|align,alt,border,%crossOrigin,#height,#hspace,!isMap,longDesc,lowsrc,name,referrerPolicy,sizes,src,srcset,useMap,#vspace,#width',
  'input^[HTMLElement]|accept,align,alt,autocapitalize,autocomplete,!autofocus,!checked,!defaultChecked,defaultValue,dirName,!disabled,%files,formAction,formEnctype,formMethod,!formNoValidate,formTarget,#height,!incremental,!indeterminate,max,#maxLength,min,#minLength,!multiple,name,pattern,placeholder,!readOnly,!required,selectionDirection,#selectionEnd,#selectionStart,#size,src,step,type,useMap,value,%valueAsDate,#valueAsNumber,#width',
  'li^[HTMLElement]|type,#value',
  'label^[HTMLElement]|htmlFor',
  'legend^[HTMLElement]|align',
  'link^[HTMLElement]|as,charset,%crossOrigin,!disabled,href,hreflang,integrity,media,referrerPolicy,rel,%relList,rev,%sizes,target,type',
  'map^[HTMLElement]|name',
  'marquee^[HTMLElement]|behavior,bgColor,direction,height,#hspace,#loop,#scrollAmount,#scrollDelay,!trueSpeed,#vspace,width',
  'menu^[HTMLElement]|!compact',
  'meta^[HTMLElement]|content,httpEquiv,name,scheme',
  'meter^[HTMLElement]|#high,#low,#max,#min,#optimum,#value',
  'ins,del^[HTMLElement]|cite,dateTime',
  'ol^[HTMLElement]|!compact,!reversed,#start,type',
  'object^[HTMLElement]|align,archive,border,code,codeBase,codeType,data,!declare,height,#hspace,name,standby,type,useMap,#vspace,width',
  'optgroup^[HTMLElement]|!disabled,label',
  'option^[HTMLElement]|!defaultSelected,!disabled,label,!selected,text,value',
  'output^[HTMLElement]|defaultValue,%htmlFor,name,value',
  'p^[HTMLElement]|align',
  'param^[HTMLElement]|name,type,value,valueType',
  'picture^[HTMLElement]|',
  'pre^[HTMLElement]|#width',
  'progress^[HTMLElement]|#max,#value',
  'q,blockquote,cite^[HTMLElement]|',
  'script^[HTMLElement]|!async,charset,%crossOrigin,!defer,event,htmlFor,integrity,src,text,type',
  'select^[HTMLElement]|autocomplete,!autofocus,!disabled,#length,!multiple,name,!required,#selectedIndex,#size,value',
  'shadow^[HTMLElement]|',
  'slot^[HTMLElement]|name',
  'source^[HTMLElement]|media,sizes,src,srcset,type',
  'span^[HTMLElement]|',
  'style^[HTMLElement]|!disabled,media,type',
  'caption^[HTMLElement]|align',
  'th,td^[HTMLElement]|abbr,align,axis,bgColor,ch,chOff,#colSpan,headers,height,!noWrap,#rowSpan,scope,vAlign,width',
  'col,colgroup^[HTMLElement]|align,ch,chOff,#span,vAlign,width',
  'table^[HTMLElement]|align,bgColor,border,%caption,cellPadding,cellSpacing,frame,rules,summary,%tFoot,%tHead,width',
  'tr^[HTMLElement]|align,bgColor,ch,chOff,vAlign',
  'tfoot,thead,tbody^[HTMLElement]|align,ch,chOff,vAlign',
  'template^[HTMLElement]|',
  'textarea^[HTMLElement]|autocapitalize,autocomplete,!autofocus,#cols,defaultValue,dirName,!disabled,#maxLength,#minLength,name,placeholder,!readOnly,!required,#rows,selectionDirection,#selectionEnd,#selectionStart,value,wrap',
  'title^[HTMLElement]|text',
  'track^[HTMLElement]|!default,kind,label,src,srclang',
  'ul^[HTMLElement]|!compact,type',
  'unknown^[HTMLElement]|',
  'video^media|#height,poster,#width',
  ':svg:a^:svg:graphics|',
  ':svg:animate^:svg:animation|',
  ':svg:animateMotion^:svg:animation|',
  ':svg:animateTransform^:svg:animation|',
  ':svg:circle^:svg:geometry|',
  ':svg:clipPath^:svg:graphics|',
  ':svg:defs^:svg:graphics|',
  ':svg:desc^:svg:|',
  ':svg:discard^:svg:|',
  ':svg:ellipse^:svg:geometry|',
  ':svg:feBlend^:svg:|',
  ':svg:feColorMatrix^:svg:|',
  ':svg:feComponentTransfer^:svg:|',
  ':svg:feComposite^:svg:|',
  ':svg:feConvolveMatrix^:svg:|',
  ':svg:feDiffuseLighting^:svg:|',
  ':svg:feDisplacementMap^:svg:|',
  ':svg:feDistantLight^:svg:|',
  ':svg:feDropShadow^:svg:|',
  ':svg:feFlood^:svg:|',
  ':svg:feFuncA^:svg:componentTransferFunction|',
  ':svg:feFuncB^:svg:componentTransferFunction|',
  ':svg:feFuncG^:svg:componentTransferFunction|',
  ':svg:feFuncR^:svg:componentTransferFunction|',
  ':svg:feGaussianBlur^:svg:|',
  ':svg:feImage^:svg:|',
  ':svg:feMerge^:svg:|',
  ':svg:feMergeNode^:svg:|',
  ':svg:feMorphology^:svg:|',
  ':svg:feOffset^:svg:|',
  ':svg:fePointLight^:svg:|',
  ':svg:feSpecularLighting^:svg:|',
  ':svg:feSpotLight^:svg:|',
  ':svg:feTile^:svg:|',
  ':svg:feTurbulence^:svg:|',
  ':svg:filter^:svg:|',
  ':svg:foreignObject^:svg:graphics|',
  ':svg:g^:svg:graphics|',
  ':svg:image^:svg:graphics|',
  ':svg:line^:svg:geometry|',
  ':svg:linearGradient^:svg:gradient|',
  ':svg:mpath^:svg:|',
  ':svg:marker^:svg:|',
  ':svg:mask^:svg:|',
  ':svg:metadata^:svg:|',
  ':svg:path^:svg:geometry|',
  ':svg:pattern^:svg:|',
  ':svg:polygon^:svg:geometry|',
  ':svg:polyline^:svg:geometry|',
  ':svg:radialGradient^:svg:gradient|',
  ':svg:rect^:svg:geometry|',
  ':svg:svg^:svg:graphics|#currentScale,#zoomAndPan',
  ':svg:script^:svg:|type',
  ':svg:set^:svg:animation|',
  ':svg:stop^:svg:|',
  ':svg:style^:svg:|!disabled,media,title,type',
  ':svg:switch^:svg:graphics|',
  ':svg:symbol^:svg:|',
  ':svg:tspan^:svg:textPositioning|',
  ':svg:text^:svg:textPositioning|',
  ':svg:textPath^:svg:textContent|',
  ':svg:title^:svg:|',
  ':svg:use^:svg:graphics|',
  ':svg:view^:svg:|#zoomAndPan',
  'data^[HTMLElement]|value',
  'keygen^[HTMLElement]|!autofocus,challenge,!disabled,form,keytype,name',
  'menuitem^[HTMLElement]|type,label,icon,!disabled,!checked,radiogroup,!default',
  'summary^[HTMLElement]|',
  'time^[HTMLElement]|dateTime',
  ':svg:cursor^:svg:|',
];

const EVENT = 'event';
const BOOLEAN = 'boolean';
const NUMBER = 'number';
const STRING = 'string';
const OBJECT = 'object';

export class SchemaInformation {
  schema = <{[element: string]: {[property: string]: string}}>{};

  constructor() {
    SCHEMA.forEach(encodedType => {
      const parts = encodedType.split('|');
      const properties = parts[1].split(',');
      const typeParts = (parts[0] + '^').split('^');
      const typeName = typeParts[0];
      const type = <{[property: string]: string}>{};
      typeName.split(',').forEach(tag => this.schema[tag.toLowerCase()] = type);
      const superName = typeParts[1];
      const superType = superName && this.schema[superName.toLowerCase()];
      if (superType) {
        for (const key in superType) {
          type[key] = superType[key];
        }
      }
      properties.forEach((property: string) => {
        if (property === '') {
        } else if (property.startsWith('*')) {
          type[property.substring(1)] = EVENT;
        } else if (property.startsWith('!')) {
          type[property.substring(1)] = BOOLEAN;
        } else if (property.startsWith('#')) {
          type[property.substring(1)] = NUMBER;
        } else if (property.startsWith('%')) {
          type[property.substring(1)] = OBJECT;
        } else {
          type[property] = STRING;
        }
      });
    });
  }

  allKnownElements(): string[] {
    return Object.keys(this.schema);
  }

  eventsOf(elementName: string): string[] {
    const elementType = this.schema[elementName.toLowerCase()] || {};
    return Object.keys(elementType).filter(property => elementType[property] === EVENT);
  }

  propertiesOf(elementName: string): string[] {
    const elementType = this.schema[elementName.toLowerCase()] || {};
    return Object.keys(elementType).filter(property => elementType[property] !== EVENT);
  }

  typeOf(elementName: string, property: string): string {
    return (this.schema[elementName.toLowerCase()] || {})[property];
  }

  private static _instance: SchemaInformation;

  static get instance(): SchemaInformation {
    let result = SchemaInformation._instance;
    if (!result) {
      result = SchemaInformation._instance = new SchemaInformation();
    }
    return result;
  }
}

export function eventNames(elementName: string): string[] {
  return SchemaInformation.instance.eventsOf(elementName);
}

export function propertyNames(elementName: string): string[] {
  return SchemaInformation.instance.propertiesOf(elementName);
}
