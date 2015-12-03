import { Type } from "angular2/src/facade/lang";
import { Provider } from "angular2/src/core/di";
import { Promise } from 'angular2/src/facade/async';
import { ComponentRef } from "angular2/src/core/linker/dynamic_component_loader";
export * from "angular2/src/web_workers/shared/message_bus";
/**
 * Bootstrapping a Webworker Application
 *
 * You instantiate the application side by calling bootstrapWebworker from your webworker index
 * script.
 * You can call bootstrapWebworker() exactly as you would call bootstrap() in a regular Angular
 * application
 * See the bootstrap() docs for more details.
 */
export declare function bootstrapWebWorker(appComponentType: Type, componentInjectableProviders?: Array<Type | Provider | any[]>): Promise<ComponentRef>;
