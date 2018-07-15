import {platformBrowser} from '@angular/platform-browser';
import {AppModuleNgFactory} from './app.ngfactory';

platformBrowser().bootstrapModuleFactory(AppModuleNgFactory, {ngZone: 'noop'});

const helloWorldEl = document.querySelector('hello-world-el');
const input = document.querySelector('input[type=text]');
if(input){
    input.addEventListener('input', e => {
    const newText = (e.target as any).value;
    helloWorldEl.setAttribute('name', newText);
  });
}
