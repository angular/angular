// Type definitions for Hammer.js 2.0.4
// Project: http://hammerjs.github.io/
// Definitions by: Philip Bulley <https://github.com/milkisevil/>, Han Lin Yap <https://github.com/codler>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// <reference path="../touch-events/touch-events.d.ts" />

declare var Hammer:HammerStatic;

declare module "Hammer" {
    export = Hammer;
}

interface HammerStatic
{
  new( element:HTMLElement, options?:any ): HammerManager;

  defaults:HammerDefaults;

  VERSION: number;

  INPUT_START:  number;
  INPUT_MOVE:   number;
  INPUT_END:    number;
  INPUT_CANCEL: number;

  STATE_POSSIBLE:   number;
  STATE_BEGAN:      number;
  STATE_CHANGED:    number;
  STATE_ENDED:      number;
  STATE_RECOGNIZED: number;
  STATE_CANCELLED:  number;
  STATE_FAILED:     number;

  DIRECTION_NONE:       number;
  DIRECTION_LEFT:       number;
  DIRECTION_RIGHT:      number;
  DIRECTION_UP:         number;
  DIRECTION_DOWN:       number;
  DIRECTION_HORIZONTAL: number;
  DIRECTION_VERTICAL:   number;
  DIRECTION_ALL:        number;

  Manager:     HammerManager;
  Input:       HammerInput;
  TouchAction: TouchAction;

  TouchInput:        TouchInput;
  MouseInput:        MouseInput;
  PointerEventInput: PointerEventInput;
  TouchMouseInput:   TouchMouseInput;
  SingleTouchInput:  SingleTouchInput;

  Recognizer:     RecognizerStatic;
  AttrRecognizer: AttrRecognizerStatic;
  Tap:            TapRecognizerStatic;
  Pan:            PanRecognizerStatic;
  Swipe:          SwipeRecognizerStatic;
  Pinch:          PinchRecognizerStatic;
  Rotate:         RotateRecognizerStatic;
  Press:          PressRecognizerStatic;

  on( target:EventTarget, types:string, handler:Function ):void;
  off( target:EventTarget, types:string, handler:Function ):void;
  each( obj:any, iterator:Function, context:any ):     void;
  merge( dest:any, src:any ):    any;
  extend( dest:any, src:any, merge:boolean ):   any;
  inherit( child:Function, base:Function, properties:any ):any;
  bindFn( fn:Function, context:any ):Function;
  prefixed( obj:any, property:string ):string;
}

interface HammerDefaults
{
  domEvents:boolean;
  enable:boolean;
  preset:any[];
  touchAction:string;
  cssProps:CssProps;

  inputClass():void;
  inputTarget():void;
}

interface CssProps
{
  contentZooming:string;
  tapHighlightColor:string;
  touchCallout:string;
  touchSelect:string;
  userDrag:string;
  userSelect:string;
}

interface HammerOptions extends HammerDefaults
{

}

interface HammerManager
{
  new( element:HTMLElement, options?:any ):HammerManager;

  add( recogniser:Recognizer ):Recognizer;
  add( recogniser:Recognizer ):HammerManager;
  add( recogniser:Recognizer[] ):Recognizer;
  add( recogniser:Recognizer[] ):HammerManager;
  destroy():void;
  emit( event:string, data:any ):void;
  get( recogniser:Recognizer ):Recognizer;
  get( recogniser:string ):Recognizer;
  off( events:string, handler:( event:HammerInput ) => void ):void;
  on( events:string, handler:( event:HammerInput ) => void ):void;
  recognize( inputData:any ):void;
  remove( recogniser:Recognizer ):HammerManager;
  remove( recogniser:string ):HammerManager;
  set( options:HammerOptions ):HammerManager;
  stop( force:boolean ):void;
}

declare class HammerInput
{
  constructor( manager:HammerManager, callback:Function );

  destroy():void;
  handler():void;
  init():void;

  /** Name of the event. Like panstart. */
  type:string;

  /** Movement of the X axis. */
  deltaX:number;

  /** Movement of the Y axis. */
  deltaY:number;

  /** Total time in ms since the first input. */
  deltaTime:number;

  /** Distance moved. */
  distance:number;

  /** Angle moved. */
  angle:number;

  /** Velocity on the X axis, in px/ms. */
  velocityX:number;

  /** Velocity on the Y axis, in px/ms */
  velocityY:number;

  /** Highest velocityX/Y value. */
  velocity:number;

  /** Direction moved. Matches the DIRECTION constants. */
  direction:number;

  /** Direction moved from it's starting point. Matches the DIRECTION constants. */
  offsetDirection:string;

  /** Scaling that has been done when multi-touch. 1 on a single touch. */
  scale:number;

  /** Rotation that has been done when multi-touch. 0 on a single touch. */
  rotation:number;

  /** Center position for multi-touch, or just the single pointer. */
  center:HammerPoint;

  /** Source event object, type TouchEvent, MouseEvent or PointerEvent. */
  srcEvent:TouchEvent | MouseEvent | PointerEvent;

  /** Target that received the event. */
  target:HTMLElement;

  /** Primary pointer type, could be touch, mouse, pen or kinect. */
  pointerType:string;

  /** Event type, matches the INPUT constants. */
  eventType:string;

  /** true when the first input. */
  isFirst:boolean;

  /** true when the final (last) input. */
  isFinal:boolean;

  /** Array with all pointers, including the ended pointers (touchend, mouseup). */
  pointers:any[];

  /** Array with all new/moved/lost pointers. */
  changedPointers:any[];

  /** Reference to the srcEvent.preventDefault() method. Only for experts! */
  preventDefault:Function;
}

declare class MouseInput extends HammerInput
{
  constructor( manager:HammerManager, callback:Function );
}

declare class PointerEventInput extends HammerInput
{
  constructor( manager:HammerManager, callback:Function );
}

declare class SingleTouchInput extends HammerInput
{
  constructor( manager:HammerManager, callback:Function );
}

declare class TouchInput extends HammerInput
{
  constructor( manager:HammerManager, callback:Function );
}

declare class TouchMouseInput extends HammerInput
{
  constructor( manager:HammerManager, callback:Function );
}

interface RecognizerStatic
{
  new( options?:any ):Recognizer;
}

interface Recognizer
{
  defaults:any;

  canEmit():boolean;
  canRecognizeWith( otherRecognizer:Recognizer ):boolean;
  dropRecognizeWith( otherRecognizer:Recognizer ):Recognizer;
  dropRecognizeWith( otherRecognizer:string ):Recognizer;
  dropRequireFailure( otherRecognizer:Recognizer ):Recognizer;
  dropRequireFailure( otherRecognizer:string ):Recognizer;
  emit( input:HammerInput ):void;
  getTouchAction():any[];
  hasRequireFailures():boolean;
  process( inputData:HammerInput ):string;
  recognize( inputData:HammerInput ):void;
  recognizeWith( otherRecognizer:Recognizer ):Recognizer;
  recognizeWith( otherRecognizer:string ):Recognizer;
  requireFailure( otherRecognizer:Recognizer ):Recognizer;
  requireFailure( otherRecognizer:string ):Recognizer;
  reset():void;
  set( options?:any ):Recognizer;
  tryEmit( input:HammerInput ):void;
}

interface AttrRecognizerStatic
{
  attrTest( input:HammerInput ):boolean;
  process( input:HammerInput ):any;
}

interface AttrRecognizer extends Recognizer
{
  new( options?:any ):AttrRecognizer;
}

interface PanRecognizerStatic
{
  new( options?:any ):PanRecognizer;
}

interface PanRecognizer extends AttrRecognizer
{
}

interface PinchRecognizerStatic
{
  new( options?:any ):PinchRecognizer;
}

interface PinchRecognizer extends AttrRecognizer
{
}

interface PressRecognizerStatic
{
  new( options?:any ):PressRecognizer;
}

interface PressRecognizer extends AttrRecognizer
{
}

interface RotateRecognizerStatic
{
  new( options?:any ):RotateRecognizer;
}

interface RotateRecognizer extends AttrRecognizer
{
}

interface SwipeRecognizerStatic
{
  new( options?:any ):SwipeRecognizer;
}

interface SwipeRecognizer
{
}

interface TapRecognizerStatic
{
  new( options?:any ):TapRecognizer;
}

interface TapRecognizer extends AttrRecognizer
{
}

declare class TouchAction
{
  constructor( manager:HammerManager, value:string );

  compute():string;
  preventDefaults( input:HammerInput ):void;
  preventSrc( srcEvent:any ):void;
  set( value:string ):void;
  update():void;
}

interface HammerPoint
{
  x: number;
  y: number;
}
