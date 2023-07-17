/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, SchemaMetadata, SecurityContext} from '../core';
import {isNgContainer, isNgContent} from '../ml_parser/tags';
import {dashCaseToCamelCase} from '../util';

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
 * NOTE: The blank element inherits from root `[Element]` element, the super element of all
 * elements.
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

const SCHEMA: string[] = [
  '[Element]|textContent,%ariaAtomic,%ariaAutoComplete,%ariaBusy,%ariaChecked,%ariaColCount,%ariaColIndex,%ariaColSpan,%ariaCurrent,%ariaDescription,%ariaDisabled,%ariaExpanded,%ariaHasPopup,%ariaHidden,%ariaKeyShortcuts,%ariaLabel,%ariaLevel,%ariaLive,%ariaModal,%ariaMultiLine,%ariaMultiSelectable,%ariaOrientation,%ariaPlaceholder,%ariaPosInSet,%ariaPressed,%ariaReadOnly,%ariaRelevant,%ariaRequired,%ariaRoleDescription,%ariaRowCount,%ariaRowIndex,%ariaRowSpan,%ariaSelected,%ariaSetSize,%ariaSort,%ariaValueMax,%ariaValueMin,%ariaValueNow,%ariaValueText,%classList,className,elementTiming,id,innerHTML,*beforecopy,*beforecut,*beforepaste,*fullscreenchange,*fullscreenerror,*search,*webkitfullscreenchange,*webkitfullscreenerror,outerHTML,%part,#scrollLeft,#scrollTop,slot' +
      /* added manually to avoid breaking changes */
      ',*message,*mozfullscreenchange,*mozfullscreenerror,*mozpointerlockchange,*mozpointerlockerror,*webglcontextcreationerror,*webglcontextlost,*webglcontextrestored',
  '[HTMLElement]^[Element]|accessKey,autocapitalize,!autofocus,contentEditable,dir,!draggable,enterKeyHint,!hidden,innerText,inputMode,lang,nonce,*abort,*animationend,*animationiteration,*animationstart,*auxclick,*beforexrselect,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*copy,*cuechange,*cut,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*formdata,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*paste,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerrawupdate,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*securitypolicyviolation,*seeked,*seeking,*select,*selectionchange,*selectstart,*slotchange,*stalled,*submit,*suspend,*timeupdate,*toggle,*transitioncancel,*transitionend,*transitionrun,*transitionstart,*volumechange,*waiting,*webkitanimationend,*webkitanimationiteration,*webkitanimationstart,*webkittransitionend,*wheel,outerText,!spellcheck,%style,#tabIndex,title,!translate,virtualKeyboardPolicy',
  'abbr,address,article,aside,b,bdi,bdo,cite,content,code,dd,dfn,dt,em,figcaption,figure,footer,header,hgroup,i,kbd,main,mark,nav,noscript,rb,rp,rt,rtc,ruby,s,samp,section,small,strong,sub,sup,u,var,wbr^[HTMLElement]|accessKey,autocapitalize,!autofocus,contentEditable,dir,!draggable,enterKeyHint,!hidden,innerText,inputMode,lang,nonce,*abort,*animationend,*animationiteration,*animationstart,*auxclick,*beforexrselect,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*copy,*cuechange,*cut,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*formdata,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*paste,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerrawupdate,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*securitypolicyviolation,*seeked,*seeking,*select,*selectionchange,*selectstart,*slotchange,*stalled,*submit,*suspend,*timeupdate,*toggle,*transitioncancel,*transitionend,*transitionrun,*transitionstart,*volumechange,*waiting,*webkitanimationend,*webkitanimationiteration,*webkitanimationstart,*webkittransitionend,*wheel,outerText,!spellcheck,%style,#tabIndex,title,!translate,virtualKeyboardPolicy',
  'media^[HTMLElement]|!autoplay,!controls,%controlsList,%crossOrigin,#currentTime,!defaultMuted,#defaultPlaybackRate,!disableRemotePlayback,!loop,!muted,*encrypted,*waitingforkey,#playbackRate,preload,!preservesPitch,src,%srcObject,#volume',
  ':svg:^[HTMLElement]|!autofocus,nonce,*abort,*animationend,*animationiteration,*animationstart,*auxclick,*beforexrselect,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*copy,*cuechange,*cut,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*formdata,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*paste,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerrawupdate,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*securitypolicyviolation,*seeked,*seeking,*select,*selectionchange,*selectstart,*slotchange,*stalled,*submit,*suspend,*timeupdate,*toggle,*transitioncancel,*transitionend,*transitionrun,*transitionstart,*volumechange,*waiting,*webkitanimationend,*webkitanimationiteration,*webkitanimationstart,*webkittransitionend,*wheel,%style,#tabIndex',
  ':svg:graphics^:svg:|',
  ':svg:animation^:svg:|*begin,*end,*repeat',
  ':svg:geometry^:svg:|',
  ':svg:componentTransferFunction^:svg:|',
  ':svg:gradient^:svg:|',
  ':svg:textContent^:svg:graphics|',
  ':svg:textPositioning^:svg:textContent|',
  'a^[HTMLElement]|charset,coords,download,hash,host,hostname,href,hreflang,name,password,pathname,ping,port,protocol,referrerPolicy,rel,%relList,rev,search,shape,target,text,type,username',
  'area^[HTMLElement]|alt,coords,download,hash,host,hostname,href,!noHref,password,pathname,ping,port,protocol,referrerPolicy,rel,%relList,search,shape,target,username',
  'audio^media|',
  'br^[HTMLElement]|clear',
  'base^[HTMLElement]|href,target',
  'body^[HTMLElement]|aLink,background,bgColor,link,*afterprint,*beforeprint,*beforeunload,*blur,*error,*focus,*hashchange,*languagechange,*load,*message,*messageerror,*offline,*online,*pagehide,*pageshow,*popstate,*rejectionhandled,*resize,*scroll,*storage,*unhandledrejection,*unload,text,vLink',
  'button^[HTMLElement]|!disabled,formAction,formEnctype,formMethod,!formNoValidate,formTarget,name,type,value',
  'canvas^[HTMLElement]|#height,#width',
  'content^[HTMLElement]|select',
  'dl^[HTMLElement]|!compact',
  'data^[HTMLElement]|value',
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
  'frameset^[HTMLElement]|cols,*afterprint,*beforeprint,*beforeunload,*blur,*error,*focus,*hashchange,*languagechange,*load,*message,*messageerror,*offline,*online,*pagehide,*pageshow,*popstate,*rejectionhandled,*resize,*scroll,*storage,*unhandledrejection,*unload,rows',
  'hr^[HTMLElement]|align,color,!noShade,size,width',
  'head^[HTMLElement]|',
  'h1,h2,h3,h4,h5,h6^[HTMLElement]|align',
  'html^[HTMLElement]|version',
  'iframe^[HTMLElement]|align,allow,!allowFullscreen,!allowPaymentRequest,csp,frameBorder,height,loading,longDesc,marginHeight,marginWidth,name,referrerPolicy,%sandbox,scrolling,src,srcdoc,width',
  'img^[HTMLElement]|align,alt,border,%crossOrigin,decoding,#height,#hspace,!isMap,loading,longDesc,lowsrc,name,referrerPolicy,sizes,src,srcset,useMap,#vspace,#width',
  'input^[HTMLElement]|accept,align,alt,autocomplete,!checked,!defaultChecked,defaultValue,dirName,!disabled,%files,formAction,formEnctype,formMethod,!formNoValidate,formTarget,#height,!incremental,!indeterminate,max,#maxLength,min,#minLength,!multiple,name,pattern,placeholder,!readOnly,!required,selectionDirection,#selectionEnd,#selectionStart,#size,src,step,type,useMap,value,%valueAsDate,#valueAsNumber,#width',
  'li^[HTMLElement]|type,#value',
  'label^[HTMLElement]|htmlFor',
  'legend^[HTMLElement]|align',
  'link^[HTMLElement]|as,charset,%crossOrigin,!disabled,href,hreflang,imageSizes,imageSrcset,integrity,media,referrerPolicy,rel,%relList,rev,%sizes,target,type',
  'map^[HTMLElement]|name',
  'marquee^[HTMLElement]|behavior,bgColor,direction,height,#hspace,#loop,#scrollAmount,#scrollDelay,!trueSpeed,#vspace,width',
  'menu^[HTMLElement]|!compact',
  'meta^[HTMLElement]|content,httpEquiv,media,name,scheme',
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
  'script^[HTMLElement]|!async,charset,%crossOrigin,!defer,event,htmlFor,integrity,!noModule,%referrerPolicy,src,text,type',
  'select^[HTMLElement]|autocomplete,!disabled,#length,!multiple,name,!required,#selectedIndex,#size,value',
  'slot^[HTMLElement]|name',
  'source^[HTMLElement]|#height,media,sizes,src,srcset,type,#width',
  'span^[HTMLElement]|',
  'style^[HTMLElement]|!disabled,media,type',
  'caption^[HTMLElement]|align',
  'th,td^[HTMLElement]|abbr,align,axis,bgColor,ch,chOff,#colSpan,headers,height,!noWrap,#rowSpan,scope,vAlign,width',
  'col,colgroup^[HTMLElement]|align,ch,chOff,#span,vAlign,width',
  'table^[HTMLElement]|align,bgColor,border,%caption,cellPadding,cellSpacing,frame,rules,summary,%tFoot,%tHead,width',
  'tr^[HTMLElement]|align,bgColor,ch,chOff,vAlign',
  'tfoot,thead,tbody^[HTMLElement]|align,ch,chOff,vAlign',
  'template^[HTMLElement]|',
  'textarea^[HTMLElement]|autocomplete,#cols,defaultValue,dirName,!disabled,#maxLength,#minLength,name,placeholder,!readOnly,!required,#rows,selectionDirection,#selectionEnd,#selectionStart,value,wrap',
  'time^[HTMLElement]|dateTime',
  'title^[HTMLElement]|text',
  'track^[HTMLElement]|!default,kind,label,src,srclang',
  'ul^[HTMLElement]|!compact,type',
  'unknown^[HTMLElement]|',
  'video^media|!disablePictureInPicture,#height,*enterpictureinpicture,*leavepictureinpicture,!playsInline,poster,#width',
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
  ':svg:image^:svg:graphics|decoding',
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

const _ATTR_TO_PROP = new Map(Object.entries({
  'class': 'className',
  'for': 'htmlFor',
  'formaction': 'formAction',
  'innerHtml': 'innerHTML',
  'readonly': 'readOnly',
  'tabindex': 'tabIndex',
}));

// Invert _ATTR_TO_PROP.
const _PROP_TO_ATTR =
    Array.from(_ATTR_TO_PROP).reduce((inverted, [propertyName, attributeName]) => {
      inverted.set(propertyName, attributeName);
      return inverted;
    }, new Map<string, string>());

export class DomElementSchemaRegistry extends ElementSchemaRegistry {
  private _schema = new Map<string, Map<string, string>>();
  // We don't allow binding to events for security reasons. Allowing event bindings would almost
  // certainly introduce bad XSS vulnerabilities. Instead, we store events in a separate schema.
  private _eventSchema = new Map<string, Set<string>>;

  constructor() {
    super();
    SCHEMA.forEach(encodedType => {
      const type = new Map<string, string>();
      const events: Set<string> = new Set();
      const [strType, strProperties] = encodedType.split('|');
      const properties = strProperties.split(',');
      const [typeNames, superName] = strType.split('^');
      typeNames.split(',').forEach(tag => {
        this._schema.set(tag.toLowerCase(), type);
        this._eventSchema.set(tag.toLowerCase(), events);
      });
      const superType = superName && this._schema.get(superName.toLowerCase());
      if (superType) {
        for (const [prop, value] of superType) {
          type.set(prop, value);
        }
        for (const superEvent of this._eventSchema.get(superName.toLowerCase())!) {
          events.add(superEvent);
        }
      }
      properties.forEach((property: string) => {
        if (property.length > 0) {
          switch (property[0]) {
            case '*':
              events.add(property.substring(1));
              break;
            case '!':
              type.set(property.substring(1), BOOLEAN);
              break;
            case '#':
              type.set(property.substring(1), NUMBER);
              break;
            case '%':
              type.set(property.substring(1), OBJECT);
              break;
            default:
              type.set(property, STRING);
          }
        }
      });
    });
  }

  override hasProperty(tagName: string, propName: string, schemaMetas: SchemaMetadata[]): boolean {
    if (schemaMetas.some((schema) => schema.name === NO_ERRORS_SCHEMA.name)) {
      return true;
    }

    if (tagName.indexOf('-') > -1) {
      if (isNgContainer(tagName) || isNgContent(tagName)) {
        return false;
      }

      if (schemaMetas.some((schema) => schema.name === CUSTOM_ELEMENTS_SCHEMA.name)) {
        // Can't tell now as we don't know which properties a custom element will get
        // once it is instantiated
        return true;
      }
    }

    const elementProperties =
        this._schema.get(tagName.toLowerCase()) || this._schema.get('unknown')!;
    return elementProperties.has(propName);
  }

  override hasElement(tagName: string, schemaMetas: SchemaMetadata[]): boolean {
    if (schemaMetas.some((schema) => schema.name === NO_ERRORS_SCHEMA.name)) {
      return true;
    }

    if (tagName.indexOf('-') > -1) {
      if (isNgContainer(tagName) || isNgContent(tagName)) {
        return true;
      }

      if (schemaMetas.some((schema) => schema.name === CUSTOM_ELEMENTS_SCHEMA.name)) {
        // Allow any custom elements
        return true;
      }
    }

    return this._schema.has(tagName.toLowerCase());
  }

  /**
   * securityContext returns the security context for the given property on the given DOM tag.
   *
   * Tag and property name are statically known and cannot change at runtime, i.e. it is not
   * possible to bind a value into a changing attribute or tag name.
   *
   * The filtering is based on a list of allowed tags|attributes. All attributes in the schema
   * above are assumed to have the 'NONE' security context, i.e. that they are safe inert
   * string values. Only specific well known attack vectors are assigned their appropriate context.
   */
  override securityContext(tagName: string, propName: string, isAttribute: boolean):
      SecurityContext {
    if (isAttribute) {
      // NB: For security purposes, use the mapped property name, not the attribute name.
      propName = this.getMappedPropName(propName);
    }

    // Make sure comparisons are case insensitive, so that case differences between attribute and
    // property names do not have a security impact.
    tagName = tagName.toLowerCase();
    propName = propName.toLowerCase();
    let ctx = SECURITY_SCHEMA()[tagName + '|' + propName];
    if (ctx) {
      return ctx;
    }
    ctx = SECURITY_SCHEMA()['*|' + propName];
    return ctx ? ctx : SecurityContext.NONE;
  }

  override getMappedPropName(propName: string): string {
    return _ATTR_TO_PROP.get(propName) ?? propName;
  }

  override getDefaultComponentElementName(): string {
    return 'ng-component';
  }

  override validateProperty(name: string): {error: boolean, msg?: string} {
    if (name.toLowerCase().startsWith('on')) {
      const msg = `Binding to event property '${name}' is disallowed for security reasons, ` +
          `please use (${name.slice(2)})=...` +
          `\nIf '${name}' is a directive input, make sure the directive is imported by the` +
          ` current module.`;
      return {error: true, msg: msg};
    } else {
      return {error: false};
    }
  }

  override validateAttribute(name: string): {error: boolean, msg?: string} {
    if (name.toLowerCase().startsWith('on')) {
      const msg = `Binding to event attribute '${name}' is disallowed for security reasons, ` +
          `please use (${name.slice(2)})=...`;
      return {error: true, msg: msg};
    } else {
      return {error: false};
    }
  }

  override allKnownElementNames(): string[] {
    return Array.from(this._schema.keys());
  }

  allKnownAttributesOfElement(tagName: string): string[] {
    const elementProperties =
        this._schema.get(tagName.toLowerCase()) || this._schema.get('unknown')!;
    // Convert properties to attributes.
    return Array.from(elementProperties.keys()).map(prop => _PROP_TO_ATTR.get(prop) ?? prop);
  }

  allKnownEventsOfElement(tagName: string): string[] {
    return Array.from(this._eventSchema.get(tagName.toLowerCase()) ?? []);
  }

  override normalizeAnimationStyleProperty(propName: string): string {
    return dashCaseToCamelCase(propName);
  }

  override normalizeAnimationStyleValue(
      camelCaseProp: string, userProvidedProp: string,
      val: string|number): {error: string, value: string} {
    let unit: string = '';
    const strVal = val.toString().trim();
    let errorMsg: string = null!;

    if (_isPixelDimensionStyle(camelCaseProp) && val !== 0 && val !== '0') {
      if (typeof val === 'number') {
        unit = 'px';
      } else {
        const valAndSuffixMatch = val.match(/^[+-]?[\d\.]+([a-z]*)$/);
        if (valAndSuffixMatch && valAndSuffixMatch[1].length == 0) {
          errorMsg = `Please provide a CSS unit value for ${userProvidedProp}:${val}`;
        }
      }
    }
    return {error: errorMsg, value: strVal + unit};
  }
}

function _isPixelDimensionStyle(prop: string): boolean {
  switch (prop) {
    case 'width':
    case 'height':
    case 'minWidth':
    case 'minHeight':
    case 'maxWidth':
    case 'maxHeight':
    case 'left':
    case 'top':
    case 'bottom':
    case 'right':
    case 'fontSize':
    case 'outlineWidth':
    case 'outlineOffset':
    case 'paddingTop':
    case 'paddingLeft':
    case 'paddingBottom':
    case 'paddingRight':
    case 'marginTop':
    case 'marginLeft':
    case 'marginBottom':
    case 'marginRight':
    case 'borderRadius':
    case 'borderWidth':
    case 'borderTopWidth':
    case 'borderLeftWidth':
    case 'borderRightWidth':
    case 'borderBottomWidth':
    case 'textIndent':
      return true;

    default:
      return false;
  }
}
