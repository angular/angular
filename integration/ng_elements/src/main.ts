import {platformBrowser} from '@angular/platform-browser';
import {AppModuleNgFactory} from './app.ngfactory';

platformBrowser().bootstrapModuleFactory(AppModuleNgFactory, {ngZone: 'noop'});

const input = document.querySelector('input')!;
const helloWorld = document.querySelector('hello-world-el')!;
const helloWorldShadow = document.querySelector('hello-world-shadow-el')!;

input.addEventListener('input', () => {
  helloWorld.setAttribute('name', input.value);
  helloWorldShadow.setAttribute('name', input.value);
});
