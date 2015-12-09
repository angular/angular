/**
 * rxSubscriber symbol is a symbol for retreiving an "Rx safe" Observer from an object
 * "Rx safety" can be defined as an object that has all of the traits of an Rx Subscriber,
 * including the ability to add and remove subscriptions to the subscription chain and
 * guarantees involving event triggering (can't "next" after unsubscription, etc).
 */
export declare const rxSubscriber: any;
