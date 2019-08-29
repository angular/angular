import {platformBrowser} from '@angular/platform-browser';
import {AppModuleNgFactory} from './app.ngfactory';

platformBrowser().bootstrapModuleFactory(AppModuleNgFactory, {ngZone: 'noop'});

const input = document.querySelector('input');
const helloWorld = document.querySelector('hello-world-el');
if(input && helloWorld){
  input.addEventListener('input', () => helloWorld.setAttribute('name', input.value));
}
