import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { svg } from 'app/shared/security';
import { CustomIconRegistry, SVG_ICONS } from './custom-icon-registry';

// These are the hardcoded inline svg sources to be used by the `<mat-icon>` component.
/* eslint-disable max-len */
export const svgIconProviders = [
  {
    provide: SVG_ICONS,
    useValue: {
      name: 'close',
      svgSource: svg`<svg focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  <path d="M0 0h24v24H0z" fill="none" />
</svg>`,
    },
    multi: true,
  },
  {
    provide: SVG_ICONS,
    useValue: {
      name: 'insert_comment',
      svgSource: svg`<svg focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
  <path d="M0 0h24v24H0z" fill="none" />
</svg>`,
    },
    multi: true,
  },
  {
    provide: SVG_ICONS,
    useValue: {
      name: 'keyboard_arrow_right',
      svgSource: svg`<svg focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z" />
</svg>`,
    },
    multi: true,
  },
  {
    provide: SVG_ICONS,
    useValue: {
      name: 'menu',
      svgSource: svg`<svg focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
</svg>`,
    },
    multi: true,
  },

  // Namespace: logos
  {
    provide: SVG_ICONS,
    useValue: {
      namespace: 'logos',
      name: 'github',
      svgSource:
          svg`<svg focusable="false" viewBox="0 0 51.8 50.4" xmlns="http://www.w3.org/2000/svg">
  <path d="M25.9,0.2C11.8,0.2,0.3,11.7,0.3,25.8c0,11.3,7.3,20.9,17.5,24.3c1.3,0.2,1.7-0.6,1.7-1.2c0-0.6,0-2.6,0-4.8
           c-7.1,1.5-8.6-3-8.6-3c-1.2-3-2.8-3.7-2.8-3.7c-2.3-1.6,0.2-1.6,0.2-1.6c2.6,0.2,3.9,2.6,3.9,2.6c2.3,3.9,6,2.8,7.5,2.1
           c0.2-1.7,0.9-2.8,1.6-3.4c-5.7-0.6-11.7-2.8-11.7-12.7c0-2.8,1-5.1,2.6-6.9c-0.3-0.7-1.1-3.3,0.3-6.8c0,0,2.1-0.7,7,2.6
           c2-0.6,4.2-0.9,6.4-0.9c2.2,0,4.4,0.3,6.4,0.9c4.9-3.3,7-2.6,7-2.6c1.4,3.5,0.5,6.1,0.3,6.8c1.6,1.8,2.6,4.1,2.6,6.9
           c0,9.8-6,12-11.7,12.6c0.9,0.8,1.7,2.4,1.7,4.7c0,3.4,0,6.2,0,7c0,0.7,0.5,1.5,1.8,1.2c10.2-3.4,17.5-13,17.5-24.3
           C51.5,11.7,40.1,0.2,25.9,0.2z" />
</svg>`,
    },
    multi: true,
  },
  {
    provide: SVG_ICONS,
    useValue: {
      namespace: 'logos',
      name: 'twitter',
      svgSource: svg`<svg focusable="false" viewBox="0 0 50 59" xmlns="http://www.w3.org/2000/svg">
  <path d="M50,9.3c-1.8,0.8-3.8,1.4-5.9,1.6c2.1-1.3,3.7-3.3,4.5-5.7c-2,1.2-4.2,2-6.5,2.5c-1.9-2-4.5-3.2-7.5-3.2
           c-5.7,0-10.3,4.6-10.3,10.3c0,0.8,0.1,1.6,0.3,2.3C16.1,16.7,8.5,12.6,3.5,6.4c-0.9,1.5-1.4,3.3-1.4,5.2c0,3.6,1.8,6.7,4.6,8.5
           C5,20,3.4,19.6,2,18.8c0,0,0,0.1,0,0.1c0,5,3.5,9.1,8.2,10.1c-0.9,0.2-1.8,0.4-2.7,0.4c-0.7,0-1.3-0.1-1.9-0.2
           c1.3,4.1,5.1,7,9.6,7.1c-3.5,2.8-7.9,4.4-12.7,4.4c-0.8,0-1.6,0-2.4-0.1c4.5,2.9,9.9,4.6,15.7,4.6c18.9,0,29.2-15.6,29.2-29.2
           c0-0.4,0-0.9,0-1.3C46.9,13.2,48.6,11.4,50,9.3z" />
</svg>`,
    },
    multi: true,
  },
  {
    provide: SVG_ICONS,
    useValue: {
      namespace: 'logos',
      name: 'youtube',
      svgSource: svg`<svg focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77
           C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42
           c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z" />
</svg>`,
    },
    multi: true,
  },
];
/* eslint-enable max-len */

@NgModule({
  imports: [
    HttpClientModule,
    MatIconModule,
  ],
  exports: [
    MatIconModule,
  ],
  providers: [
    { provide: MatIconRegistry, useClass: CustomIconRegistry },
    svgIconProviders,
  ],
})
export class IconsModule {}
