declare var by: {
  css: (...args: any[])=> any;
};
declare var element: (...args: any[]) => any;
declare var $: cssSelectorHelper;
declare interface cssSelectorHelper {
  (...args: any[]): any;
}

declare var protractor: any;
declare namespace protractor {
  interface IBrowser {
    wait(...args: any[]): any;
    get(...args: any[]): any;
    getCurrentUrl(...args: any[]): any;
    navigate(...args: any[]): any;
    switchTo(...args: any[]): any;
    executeScript(...args: any[]): any;
    manage(...args: any[]): any;
  }
}

declare var browser: any;
