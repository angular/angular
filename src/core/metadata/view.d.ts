import { Type } from 'angular2/src/facade/lang';
/**
 * Defines template and style encapsulation options available for Component's {@link View}.
 *
 * See {@link ViewMetadata#encapsulation}.
 */
export declare enum ViewEncapsulation {
    /**
     * Emulate `Native` scoping of styles by adding an attribute containing surrogate id to the Host
     * Element and pre-processing the style rules provided via
     * {@link ViewMetadata#styles} or {@link ViewMetadata#stylesUrls}, and adding the new Host Element
     * attribute to all selectors.
     *
     * This is the default option.
     */
    Emulated = 0,
    /**
     * Use the native encapsulation mechanism of the renderer.
     *
     * For the DOM this means using [Shadow DOM](https://w3c.github.io/webcomponents/spec/shadow/) and
     * creating a ShadowRoot for Component's Host Element.
     */
    Native = 1,
    /**
     * Don't provide any template or style encapsulation.
     */
    None = 2,
}
export declare var VIEW_ENCAPSULATION_VALUES: ViewEncapsulation[];
/**
 * Metadata properties available for configuring Views.
 *
 * Each Angular component requires a single `@Component` and at least one `@View` annotation. The
 * `@View` annotation specifies the HTML template to use, and lists the directives that are active
 * within the template.
 *
 * When a component is instantiated, the template is loaded into the component's shadow root, and
 * the expressions and statements in the template are evaluated against the component.
 *
 * For details on the `@Component` annotation, see {@link ComponentMetadata}.
 *
 * ### Example
 *
 * ```
 * @Component({
 *   selector: 'greet',
 *   template: 'Hello {{name}}!',
 *   directives: [GreetUser, Bold]
 * })
 * class Greet {
 *   name: string;
 *
 *   constructor() {
 *     this.name = 'World';
 *   }
 * }
 * ```
 */
export declare class ViewMetadata {
    /**
     * Specifies a template URL for an Angular component.
     *
     * NOTE: Only one of `templateUrl` or `template` can be defined per View.
     *
     * <!-- TODO: what's the url relative to? -->
     */
    templateUrl: string;
    /**
     * Specifies an inline template for an Angular component.
     *
     * NOTE: Only one of `templateUrl` or `template` can be defined per View.
     */
    template: string;
    /**
     * Specifies stylesheet URLs for an Angular component.
     *
     * <!-- TODO: what's the url relative to? -->
     */
    styleUrls: string[];
    /**
     * Specifies an inline stylesheet for an Angular component.
     */
    styles: string[];
    /**
     * Specifies a list of directives that can be used within a template.
     *
     * Directives must be listed explicitly to provide proper component encapsulation.
     *
     * ### Example
     *
     * ```javascript
     * @Component({
     *   selector: 'my-component',
     *   directives: [NgFor]
     *   template: '
     *   <ul>
     *     <li *ngFor="#item of items">{{item}}</li>
     *   </ul>'
     * })
     * class MyComponent {
     * }
     * ```
     */
    directives: Array<Type | any[]>;
    pipes: Array<Type | any[]>;
    /**
     * Specify how the template and the styles should be encapsulated.
     * The default is {@link ViewEncapsulation#Emulated `ViewEncapsulation.Emulated`} if the view
     * has styles,
     * otherwise {@link ViewEncapsulation#None `ViewEncapsulation.None`}.
     */
    encapsulation: ViewEncapsulation;
    constructor({templateUrl, template, directives, pipes, encapsulation, styles, styleUrls}?: {
        templateUrl?: string;
        template?: string;
        directives?: Array<Type | any[]>;
        pipes?: Array<Type | any[]>;
        encapsulation?: ViewEncapsulation;
        styles?: string[];
        styleUrls?: string[];
    });
}
