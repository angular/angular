// Public API for Application
import {Provider} from './di';
import {Type, isPresent} from 'angular2/src/core/facade/lang';
import {Promise} from 'angular2/src/core/facade/async';
import {compilerProviders} from 'angular2/src/core/compiler/compiler';
import {commonBootstrap} from './application_common';
import {ComponentRef} from './linker/dynamic_component_loader';

export {APP_COMPONENT, APP_ID} from './application_tokens';
export {platform} from './application_common';
export {
  PlatformRef,
  ApplicationRef,
  applicationCommonProviders,
  createNgZone,
  platformCommon,
  platformProviders
} from './application_ref';

/// See [commonBootstrap] for detailed documentation.
/**
 * @cheatsheetSection
 *          Bootstrapping
 *          `import {bootstrap} from 'angular2/angular2';`
 * @cheatsheetItem
 *          <input [value]="firstName">
 *          Binds property value to the result of expression firstName.
 *          [value]
 * @cheatsheetItem
 *          <div [attr.role]="myAriaRole">
 *          Binds attribute role to the result of expression myAriaRole.
 *          [attr.role]
 * @cheatsheetItem
 *          <div [class.extra-sparkle]="isDelightful">
 *          Binds the presence of the css class extra-sparkle on the element to the truthiness of the expression isDelightful.
 *          [class.extra-sparkle]
 * @cheatsheetItem
 *          <div [style.width.px]="mySize">
 *          Binds style property width to the result of expression mySize in pixels. Units are optional.
 *          [style.width.px]
 * @cheatsheetItem
 *          <button (click)="readRainbow($event)">
 *          Calls method readRainbow when a click event is triggered on this button element (or its children) and passes in the event object.
 *          (click)
 * @cheatsheetItem
 *          <div title="Hello {{ponyName}}">
 *          Binds a property to an interpolated string, e.g. "Hello Seabiscuit". Equivalent to: <div [title]="'Hello' + ponyName">
 *          {{ponyName}}
 * @cheatsheetItem
 *          <p>Hello {{ponyName}}</p>
 *          Binds text content to an interpolated string, e.g. "Hello Seabiscuit".
 *          {{ponyName}}
 * @cheatsheetItem
 *          <my-cmp [(title)]="name">
 *          Sets up two-way data binding. Equivalent to:\n<my-cmp [title]="name" (title-change)="name=$event">
 *          [(title)]
 * @cheatsheetItem
 *          <video #movieplayer ...>\n<button (click)="movieplayer.play()" >
 *          Creates a local variable movieplayer that provides access to the video element instance in data- and event-binding expressions in the current template.
 *           #movieplayer
 *           (click)
 * @cheatsheetItem
 *          <p *my-unless="myExpression">...</p>
 *          The * symbol means that the current element will be turned into an embedded template. Equivalent to:\n<template [my-unless]="myExpression"><p>...</p></template>
 *          *my-unless
 * @cheatsheetItem
 *          <p>Card No.: {{cardNumber myCreditCardNumberFormatter}}</p>
 *          Transforms the current value of expression cardNumber via pipe called creditCardNumberFormatter.
 *          {{cardNumber myCreditCardNumberFormatter}}
 * @cheatsheetItem
 *          <p>Employer: {{employer?.companyName}}</p>
 *          The Elvis operator (?) means that the employer field is optional and if undefined, the rest of the expression should be ignored.
 *          {{employer?.companyName}}
 *
 */
export function bootstrap(
    appComponentType: /*Type*/ any,
    appProviders: Array<Type | Provider | any[]> = null): Promise<ComponentRef> {
  var providers = [compilerProviders()];
  if (isPresent(appProviders)) {
    providers.push(appProviders);
  }
  return commonBootstrap(appComponentType, providers);
}
