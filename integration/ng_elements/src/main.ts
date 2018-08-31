import {platformBrowser} from '@angular/platform-browser';
import {AppModuleNgFactory} from './app.ngfactory';

platformBrowser().bootstrapModuleFactory(AppModuleNgFactory, {ngZone: 'noop'});

const helloWorld = document.querySelector('hello-world-el');
const input = document.querySelector('input[type=text]');
if(input && helloWorld){
    input.addEventListener('input', e => {
    const newText = (e.target as any).value;
    helloWorld.setAttribute('name', newText);
  });
}
