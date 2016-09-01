/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CUSTOM_ELEMENTS_SCHEMA, Injectable, NO_ERRORS_SCHEMA, SchemaMetadata, SecurityContext} from '@angular/core';

import {SECURITY_SCHEMA} from './dom_security_schema';
import {ElementSchemaRegistry} from './element_schema_registry';

const BOOLEAN = 'boolean';
const NUMBER = 'number';
const STRING = 'string';
const OBJECT = 'object';

/**
 * This array represents the DOM schema. It encodes inheritance, properties, and events.
 *
 * ## Overview
 *
 * Each line represents one kind of element. The `element_inheritance` and properties are joined
 * using `element_inheritance|properties` syntax.
 *
 * ## Element Inheritance
 *
 * The `element_inheritance` can be further subdivided as `element1,element2,...^parentElement`.
 * Here the individual elements are separated by `,` (commas). Every element in the list
 * has identical properties.
 *
 * An `element` may inherit additional properties from `parentElement` If no `^parentElement` is
 * specified then `""` (blank) element is assumed.
 *
 * NOTE: The blank element inherits from root `*` element, the super element of all elements.
 *
 * NOTE an element prefix such as `:svg:` has no special meaning to the schema.
 *
 * ## Properties
 *
 * Each element has a set of properties separated by `,` (commas). Each property can be prefixed
 * by a special character designating its type:
 *
 * - (no prefix): property is a string.
 * - `*`: property represents an event.
 * - `!`: property is a boolean.
 * - `#`: property is a number.
 * - `%`: property is an object.
 *
 * ## Query
 *
 * The class creates an internal squas representation which allows to easily answer the query of
 * if a given property exist on a given element.
 *
 * NOTE: We don't yet support querying for types or events.
 * NOTE: This schema is auto extracted from `schema_extractor.ts` located in the test folder,
 *       see dom_element_schema_registry_spec.ts
 */

// =================================================================================================
// =================================================================================================
// =========== S T O P   -  S T O P   -  S T O P   -  S T O P   -  S T O P   -  S T O P  ===========
// =================================================================================================
// =================================================================================================
//
//                       DO NOT EDIT THIS DOM SCHEMA WITHOUT A SECURITY REVIEW!
//
// Newly added properties must be security reviewed and assigned an appropriate SecurityContext in
// dom_security_schema.ts. Reach out to mprobst & rjamet for details.
//
// =================================================================================================

const SCHEMA: string[] = ([
  '*|textContent,%classList,className,id,innerHTML,*beforecopy,*beforecut,*beforepaste,*copy,*cut,*paste,*search,*selectstart,*webkitfullscreenchange,*webkitfullscreenerror,*wheel,outerHTML,#scrollLeft,#scrollTop',
  'abbr,address,article,aside,b,bdi,bdo,cite,code,dd,dfn,dt,em,figcaption,figure,footer,header,i,kbd,main,mark,nav,noscript,rb,rp,rt,rtc,ruby,s,samp,section,small,strong,sub,sup,u,var,wbr^*|accessKey,contentEditable,dir,!draggable,!hidden,innerText,lang,*abort,*beforecopy,*beforecut,*beforepaste,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*copy,*cuechange,*cut,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*message,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*mozfullscreenchange,*mozfullscreenerror,*mozpointerlockchange,*mozpointerlockerror,*paste,*pause,*play,*playing,*progress,*ratechange,*reset,*resize,*scroll,*search,*seeked,*seeking,*select,*selectstart,*show,*stalled,*submit,*suspend,*timeupdate,*toggle,*volumechange,*waiting,*webglcontextcreationerror,*webglcontextlost,*webglcontextrestored,*webkitfullscreenchange,*webkitfullscreenerror,*wheel,outerText,!spellcheck,%style,#tabIndex,title,!translate',
  'media^abbr|!autoplay,!controls,%crossOrigin,#currentTime,!defaultMuted,#defaultPlaybackRate,!disableRemotePlayback,!loop,!muted,*encrypted,#playbackRate,preload,src,%srcObject,#volume',
  ':svg:^abbr|*abort,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*cuechange,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*pause,*play,*playing,*progress,*ratechange,*reset,*resize,*scroll,*seeked,*seeking,*select,*show,*stalled,*submit,*suspend,*timeupdate,*toggle,*volumechange,*waiting,%style,#tabIndex',
  ':svg:graphics^:svg:|',
  ':svg:animation^:svg:|*begin,*end,*repeat',
  ':svg:geometry^:svg:|',
  ':svg:componentTransferFunction^:svg:|',
  ':svg:gradient^:svg:|',
  ':svg:textContent^:svg:graphics|',
  ':svg:textPositioning^:svg:textContent|',
  'abbr^*|accessKey,contentEditable,dir,!draggable,!hidden,innerText,lang,*abort,*beforecopy,*beforecut,*beforepaste,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*copy,*cuechange,*cut,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*message,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*mozfullscreenchange,*mozfullscreenerror,*mozpointerlockchange,*mozpointerlockerror,*paste,*pause,*play,*playing,*progress,*ratechange,*reset,*resize,*scroll,*search,*seeked,*seeking,*select,*selectstart,*show,*stalled,*submit,*suspend,*timeupdate,*toggle,*volumechange,*waiting,*webglcontextcreationerror,*webglcontextlost,*webglcontextrestored,*webkitfullscreenchange,*webkitfullscreenerror,*wheel,outerText,!spellcheck,%style,#tabIndex,title,!translate',
  'a^abbr|charset,coords,download,hash,host,hostname,href,hreflang,name,password,pathname,ping,port,protocol,referrerPolicy,rel,rev,search,shape,target,text,type,username',
  'area^abbr|alt,coords,hash,host,hostname,href,!noHref,password,pathname,ping,port,protocol,referrerPolicy,search,shape,target,username',
  'audio^media|',
  'br^abbr|clear',
  'base^abbr|href,target',
  'body^abbr|aLink,background,bgColor,link,*beforeunload,*blur,*error,*focus,*hashchange,*languagechange,*load,*message,*offline,*online,*pagehide,*pageshow,*popstate,*rejectionhandled,*resize,*scroll,*storage,*unhandledrejection,*unload,text,vLink',
  'button^abbr|!autofocus,!disabled,formAction,formEnctype,formMethod,!formNoValidate,formTarget,name,type,value',
  'canvas^abbr|#height,#width',
  'content^abbr|select',
  'dl^abbr|!compact',
  'datalist^abbr|',
  'details^abbr|!open',
  'dialog^abbr|!open,returnValue',
  'dir^abbr|!compact',
  'div^abbr|align',
  'embed^abbr|align,height,name,src,type,width',
  'fieldset^abbr|!disabled,name',
  'font^abbr|color,face,size',
  'form^abbr|acceptCharset,action,autocomplete,encoding,enctype,method,name,!noValidate,target',
  'frame^abbr|frameBorder,longDesc,marginHeight,marginWidth,name,!noResize,scrolling,src',
  'frameset^abbr|cols,*beforeunload,*blur,*error,*focus,*hashchange,*languagechange,*load,*message,*offline,*online,*pagehide,*pageshow,*popstate,*rejectionhandled,*resize,*scroll,*storage,*unhandledrejection,*unload,rows',
  'hr^abbr|align,color,!noShade,size,width',
  'head^abbr|',
  'h1,h2,h3,h4,h5,h6^abbr|align',
  'html^abbr|version',
  'iframe^abbr|align,!allowFullscreen,frameBorder,height,longDesc,marginHeight,marginWidth,name,referrerPolicy,%sandbox,scrolling,src,srcdoc,width',
  'img^abbr|align,alt,border,%crossOrigin,#height,#hspace,!isMap,longDesc,lowsrc,name,referrerPolicy,sizes,src,srcset,useMap,#vspace,#width',
  'input^abbr|accept,align,alt,autocapitalize,autocomplete,!autofocus,!checked,!defaultChecked,defaultValue,dirName,!disabled,%files,formAction,formEnctype,formMethod,!formNoValidate,formTarget,#height,!incremental,!indeterminate,max,#maxLength,min,#minLength,!multiple,name,pattern,placeholder,!readOnly,!required,selectionDirection,#selectionEnd,#selectionStart,#size,src,step,type,useMap,value,%valueAsDate,#valueAsNumber,#width',
  'keygen^abbr|!autofocus,challenge,!disabled,keytype,name',
  'li^abbr|type,#value',
  'label^abbr|htmlFor',
  'legend^abbr|align',
  'link^abbr|as,charset,%crossOrigin,!disabled,href,hreflang,integrity,media,rel,%relList,rev,%sizes,target,type',
  'map^abbr|name',
  'marquee^abbr|behavior,bgColor,direction,height,#hspace,#loop,#scrollAmount,#scrollDelay,!trueSpeed,#vspace,width',
  'menu^abbr|!compact',
  'meta^abbr|content,httpEquiv,name,scheme',
  'meter^abbr|#high,#low,#max,#min,#optimum,#value',
  'ins,del^abbr|cite,dateTime',
  'ol^abbr|!compact,!reversed,#start,type',
  'object^abbr|align,archive,border,code,codeBase,codeType,data,!declare,height,#hspace,name,standby,type,useMap,#vspace,width',
  'optgroup^abbr|!disabled,label',
  'option^abbr|!defaultSelected,!disabled,label,!selected,text,value',
  'output^abbr|defaultValue,%htmlFor,name,value',
  'p^abbr|align',
  'param^abbr|name,type,value,valueType',
  'picture^abbr|',
  'pre^abbr|#width',
  'progress^abbr|#max,#value',
  'q,blockquote,cite^abbr|',
  'script^abbr|!async,charset,%crossOrigin,!defer,event,htmlFor,integrity,src,text,type',
  'select^abbr|!autofocus,!disabled,#length,!multiple,name,!required,#selectedIndex,#size,value',
  'shadow^abbr|',
  'source^abbr|media,sizes,src,srcset,type',
  'span^abbr|',
  'style^abbr|!disabled,media,type',
  'caption^abbr|align',
  'th,td^abbr|abbr,align,axis,bgColor,ch,chOff,#colSpan,headers,height,!noWrap,#rowSpan,scope,vAlign,width',
  'col,colgroup^abbr|align,ch,chOff,#span,vAlign,width',
  'table^abbr|align,bgColor,border,%caption,cellPadding,cellSpacing,frame,rules,summary,%tFoot,%tHead,width',
  'tr^abbr|align,bgColor,ch,chOff,vAlign',
  'tfoot,thead,tbody^abbr|align,ch,chOff,vAlign',
  'template^abbr|',
  'textarea^abbr|autocapitalize,!autofocus,#cols,defaultValue,dirName,!disabled,#maxLength,#minLength,name,placeholder,!readOnly,!required,#rows,selectionDirection,#selectionEnd,#selectionStart,value,wrap',
  'title^abbr|text',
  'track^abbr|!default,kind,label,src,srclang',
  'ul^abbr|!compact,type',
  'unknown^abbr|',
  'video^media|#height,poster,#width',
  ':svg:a^:svg:graphics|',
  ':svg:animate^:svg:animation|',
  ':svg:animateMotion^:svg:animation|',
  ':svg:animateTransform^:svg:animation|',
  ':svg:circle^:svg:geometry|',
  ':svg:clipPath^:svg:graphics|',
  ':svg:cursor^:svg:|',
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
  // TODO: should be auto-generated https://github.com/angular/angular/issues/11219
  'time^abbr|datetime' 
]);

const _ATTR_TO_PROP: {[name: string]: string} = {
  'class': 'className',
  'formaction': 'formAction',
  'innerHtml': 'innerHTML',
  'readonly': 'readOnly',
  'tabindex': 'tabIndex'
};

@Injectable()
export class DomElementSchemaRegistry extends ElementSchemaRegistry {
  private _schema: {[element: string]: {[property: string]: string}} = {};

  constructor() {
    super();
    SCHEMA.forEach(encodedType => {
      const [strType, strProperties] = encodedType.split('|');
      const properties = strProperties.split(',');
      const [typeNames, superName] = strType.split('^');
      const type: {[property: string]: string} = {};
      typeNames.split(',').forEach(tag => this._schema[tag.toLowerCase()] = type);
      const superType = this._schema[superName];
      if (superType) {
        Object.keys(superType).forEach((prop: string) => { type[prop] = superType[prop]; });
      }
      properties.forEach((property: string) => {
        if (property.length > 0) {
          switch (property[0]) {
            case '*':
              // We don't yet support events.
              // If ever allowing to bind to events, GO THROUGH A SECURITY REVIEW, allowing events
              // will
              // almost certainly introduce bad XSS vulnerabilities.
              // type[property.substring(1)] = EVENT;
              break;
            case '!':
              type[property.substring(1)] = BOOLEAN;
              break;
            case '#':
              type[property.substring(1)] = NUMBER;
              break;
            case '%':
              type[property.substring(1)] = OBJECT;
              break;
            default:
              type[property] = STRING;
          }
        }
      });
    });
  }

  hasProperty(tagName: string, propName: string, schemaMetas: SchemaMetadata[]): boolean {
    if (schemaMetas.some((schema) => schema.name === NO_ERRORS_SCHEMA.name)) {
      return true;
    }

    if (tagName.indexOf('-') > -1) {
      if (tagName === 'ng-container' || tagName === 'ng-content') {
        return false;
      }

      if (schemaMetas.some((schema) => schema.name === CUSTOM_ELEMENTS_SCHEMA.name)) {
        // Can't tell now as we don't know which properties a custom element will get
        // once it is instantiated
        return true;
      }
    }

    const elementProperties = this._schema[tagName.toLowerCase()] || this._schema['unknown'];
    return !!elementProperties[propName];
  }

  hasElement(tagName: string, schemaMetas: SchemaMetadata[]): boolean {
    if (schemaMetas.some((schema) => schema.name === NO_ERRORS_SCHEMA.name)) {
      return true;
    }

    if (tagName.indexOf('-') > -1) {
      if (tagName === 'ng-container' || tagName === 'ng-content') {
        return true;
      }

      if (schemaMetas.some((schema) => schema.name === CUSTOM_ELEMENTS_SCHEMA.name)) {
        // Allow any custom elements
        return true;
      }
    }

    return !!this._schema[tagName.toLowerCase()];
  }

  /**
   * securityContext returns the security context for the given property on the given DOM tag.
   *
   * Tag and property name are statically known and cannot change at runtime, i.e. it is not
   * possible to bind a value into a changing attribute or tag name.
   *
   * The filtering is white list based. All attributes in the schema above are assumed to have the
   * 'NONE' security context, i.e. that they are safe inert string values. Only specific well known
   * attack vectors are assigned their appropriate context.
   */
  securityContext(tagName: string, propName: string): SecurityContext {
    // Make sure comparisons are case insensitive, so that case differences between attribute and
    // property names do not have a security impact.
    tagName = tagName.toLowerCase();
    propName = propName.toLowerCase();
    let ctx = SECURITY_SCHEMA[tagName + '|' + propName];
    if (ctx) {
      return ctx;
    }
    ctx = SECURITY_SCHEMA['*|' + propName];
    return ctx ? ctx : SecurityContext.NONE;
  }

  getMappedPropName(propName: string): string { return _ATTR_TO_PROP[propName] || propName; }

  getDefaultComponentElementName(): string { return 'ng-component'; }
}
