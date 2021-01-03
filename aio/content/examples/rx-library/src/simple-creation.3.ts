// #docplaster
/*
  Because of how the code is merged together using the doc regions,
  we need to indent the imports with the function below.
*/
/* tslint:disable:align */
// #docregion event
  import { fromEvent } from 'rxjs';

// #enddocregion event

export function docRegionEvent(console, document) {
  // #docregion event
  const el = document.getElementById('my-element');

  // Create an Observable that will publish mouse movements
  const mouseMoves = fromEvent(el, 'mousemove');

  // Subscribe to start listening for mouse-move events
  const subscription = mouseMoves.subscribe((evt: MouseEvent) => {
    // Log coords of mouse movements
    console.log(`Coords: ${evt.clientX} X ${evt.clientY}`);

    // When the mouse is over the upper-left of the screen,
    // unsubscribe to stop listening for mouse movements
    if (evt.clientX < 40 && evt.clientY < 40) {
      subscription.unsubscribe();
    }
  });

  // #enddocregion event
}
