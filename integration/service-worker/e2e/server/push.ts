declare interface WebPushParams {
  TTL?: number;
  vapidDetails: {
    subject: string;
    publicKey: string;
    privateKey: string;
  };
}

declare interface WebPush {
  sendNotification(subscription: any, message: any, options: WebPushParams): Promise<any>;
}

let push: WebPush = require('web-push');

export function sendPush(subscription: any, payload?: Object): Promise<any> {
  return push.sendNotification(subscription, JSON.stringify(payload), {
    vapidDetails: {
      subject: 'mailto:test@angular.io',
      publicKey: 'BLRl_fG1TCTc1D2JwzOpdZjaRcJucXtG8TAd5g9vuYjl6KUUDxgoRjQPCgjZfY-_Rusd_qtjNvanHXeFvOFlxH4',
      privateKey: 't3JtFOflouvPUxFKeSSmZdjuVidnD_0dNGFM1v-N4PI',
    },
  });
}
