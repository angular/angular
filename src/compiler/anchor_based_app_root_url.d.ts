import { AppRootUrl } from "angular2/src/compiler/app_root_url";
/**
 * Extension of {@link AppRootUrl} that uses a DOM anchor tag to set the root url to
 * the current page's url.
 */
export declare class AnchorBasedAppRootUrl extends AppRootUrl {
    constructor();
}
