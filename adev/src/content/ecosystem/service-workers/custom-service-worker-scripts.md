# Custom service worker scripts

While the Angular service worker provides excellent capabilities, you may need to add custom functionality such as handling push notifications, background sync, or other service worker events. You can create a custom service worker script that imports and extends the Angular service worker.

## Creating a custom service worker

To create a custom service worker that extends Angular's functionality:

1. Create a custom service worker file (e.g., `custom-sw.js`) in your `src` directory:

<docs-code language="javascript">

// Import the Angular service worker
importScripts('./ngsw-worker.js');

(function () {
  'use strict';

  // Add custom notification click handler
  self.addEventListener('notificationclick', (event) => {
    console.log('Custom notification click handler');
    console.log('Notification details:', event.notification);
    
    // Handle notification click - open URL if provided
    if (clients.openWindow && event.notification.data.url) {
      event.waitUntil(clients.openWindow(event.notification.data.url));
      console.log('Opening URL:', event.notification.data.url);
    }
  });

  // Add custom background sync handler
  self.addEventListener('sync', (event) => {
    console.log('Custom background sync handler');
    
    if (event.tag === 'background-sync') {
      event.waitUntil(doBackgroundSync());
    }
  });

  function doBackgroundSync() {
    // Implement your background sync logic here
    return fetch('https://example.com/api/sync')
      .then(response => response.json())
      .then(data => console.log('Background sync completed:', data))
      .catch(error => console.error('Background sync failed:', error));
  }
})();

</docs-code>

2. Update your `angular.json` file to use the custom service worker:

<docs-code language="json">

{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
            "options": {
              "assets": [
               { 
                "glob": "**/*",
                "input": "public"
                },
                "app/src/custom-sw.js"
              ]
            },
        }
      }
    }
  }
}

</docs-code>

3. Configure the service worker registration to use your custom script:

<docs-code language="typescript">

import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('custom-sw.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
};

</docs-code>

### Best practices for custom service workers

When extending the Angular service worker:

- **Always import the Angular service worker first** using `importScripts('./ngsw-worker.js')` to ensure you get all the caching and update functionality
- **Wrap your custom code in an IIFE** (Immediately Invoked Function Expression) to avoid polluting the global scope
- **Use `event.waitUntil()`** for asynchronous operations to ensure they complete before the service worker is terminated
- **Test thoroughly** in both development and production environments
- **Handle errors gracefully** to prevent your custom code from breaking the Angular service worker functionality

### Common use cases

Custom service workers are commonly used for:

- **Push notifications**: Handle incoming push messages and display notifications
- **Background sync**: Sync data when the network connection is restored  
- **Custom navigation**: Handle special routing or offline page scenarios
