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
  const res = observer.getDirectiveId(dir);
  return res;
};

export const getDirectivePosition = (dir: any) => {
  return observer.getDirectivePosition(dir);
};
