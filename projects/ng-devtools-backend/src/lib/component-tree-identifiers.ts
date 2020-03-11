import { ComponentTreeObserver } from './observer/observer';

let observer: ComponentTreeObserver;

export const observeDOM = () => {
  if (observer) {
    console.error('Cannot initialize the DOM observer more than once');
    return;
  }
  observer = new ComponentTreeObserver({});
  observer.initialize();
};

export const getDirectiveId = (dir: any) => {
  if (!observer) {
    console.warn('Observer not yet instantiated');
    return -1;
  }
  return observer.getDirectiveId(dir);
};

export const getDirectiveForest = () => {
  if (!observer) {
    console.warn('Observer not yet instantiated');
    return [];
  }
  return observer.getDirectiveForest();
};

export const getDirectivePosition = (dir: any) => {
  if (!observer) {
    console.warn('Observer not yet instantiated');
    return null;
  }
  return observer.getDirectivePosition(dir);
};
