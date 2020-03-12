import { DirectiveForestObserver } from './observer/observer';

let observer: DirectiveForestObserver;

export const observeDOM = () => {
  if (observer) {
    console.error('Cannot initialize the DOM observer more than once');
    return;
  }
  observer = new DirectiveForestObserver({});
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

export const indexDirectiveForest = () => {
  observer.indexForest();
};

export const getDirectivePosition = (dir: any) => {
  if (!observer) {
    console.warn('Observer not yet instantiated');
    return null;
  }
  return observer.getDirectivePosition(dir);
};
