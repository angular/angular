/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// THIS CODE IS GENERATED - DO NOT MODIFY.
const u = undefined;

function plural(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (v === 0 && i % 10 === 1)
    return 1;
if (v === 0 && i % 10 === 2)
    return 2;
if (v === 0 && (i % 100 === 0 || (i % 100 === 20 || (i % 100 === 40 || (i % 100 === 60 || i % 100 === 80)))))
    return 3;
if (!(v === 0))
    return 4;
return 5;
}

export default ["gv",[["a.m.","p.m."]],u,[["S","M","T","W","T","F","S"],["Jed","Jel","Jem","Jerc","Jerd","Jeh","Jes"],["Jedoonee","Jelhein","Jemayrt","Jercean","Jerdein","Jeheiney","Jesarn"],["Jed","Jel","Jem","Jerc","Jerd","Jeh","Jes"]],u,[["1","2","3","4","5","6","7","8","9","10","11","12"],["J-guer","T-arree","Mayrnt","Avrril","Boaldyn","M-souree","J-souree","Luanistyn","M-fouyir","J-fouyir","M-Houney","M-Nollick"],["Jerrey-geuree","Toshiaght-arree","Mayrnt","Averil","Boaldyn","Mean-souree","Jerrey-souree","Luanistyn","Mean-fouyir","Jerrey-fouyir","Mee Houney","Mee ny Nollick"]],u,[["RC","AD"]],1,[6,0],["y-MM-dd","y MMM d","y MMMM d","y MMMM d, EEEE"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,u,u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"GBP","£","GBP",{"JPY":["JP¥","¥"],"USD":["US$","$"]},"ltr", plural];
