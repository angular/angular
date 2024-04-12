// TODO: Add unit tests for this file.
import { Observable } from 'rxjs';
// #docregion

// Create an Observable that will start listening to browser geolocation updates
// when a consumer subscribes.
const locations = new Observable((observer) => {
  let watchId: number;

  // The geolocation API (if it exists) provides values to publish
  if ('geolocation' in navigator) {
    watchId = navigator.geolocation.watchPosition(
      (position: GeolocationPosition) => observer.next(position),
      (error: GeolocationPositionError) => observer.error(error)
    );
  } else {
    observer.error('Geolocation not available');
  }

  // When the consumer unsubscribes, stop listening to geolocation changes.
  return {
    unsubscribe() {
      navigator.geolocation.clearWatch(watchId);
    }
  };
});

// Call subscribe() to start listening for geolocation updates.
const locationsSubscription = locations.subscribe({
  next(position) {
    console.log('Current Position: ', position);
  },
  error(msg) {
    console.log('Error Getting Location: ', msg);
  }
});

// Stop listening for location after 10 seconds
setTimeout(() => {
  locationsSubscription.unsubscribe();
}, 10000);
// #enddocregion
