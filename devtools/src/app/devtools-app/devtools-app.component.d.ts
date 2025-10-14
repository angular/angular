/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ElementRef } from '@angular/core';
import { IFrameMessageBus } from '../../iframe-message-bus';
export declare class AppDevToolsComponent {
    messageBus: IFrameMessageBus | null;
    readonly iframe: import("@angular/core").Signal<ElementRef<any> | undefined>;
}
