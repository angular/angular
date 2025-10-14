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
const n = val;

if (n === 0)
    return 0;
if (n === 1)
    return 1;
if (n % 100 === 2 || (n % 100 === 22 || (n % 100 === 42 || (n % 100 === 62 || n % 100 === 82))) || (n % 1000 === 0 && (n % 100000 === Math.floor(n % 100000) && (n % 100000 >= 1000 && n % 100000 <= 20000 || (n % 100000 === 40000 || (n % 100000 === 60000 || n % 100000 === 80000)))) || !(n === 0) && n % 1000000 === 100000))
    return 2;
if (n % 100 === 3 || (n % 100 === 23 || (n % 100 === 43 || (n % 100 === 63 || n % 100 === 83))))
    return 3;
if (!(n === 1) && (n % 100 === 1 || (n % 100 === 21 || (n % 100 === 41 || (n % 100 === 61 || n % 100 === 81)))))
    return 4;
return 5;
}

export default ["kw",[["a.m.","p.m."]],u,[["S","M","T","W","T","F","S"],["Sul","Lun","Mth","Mhr","Yow","Gwe","Sad"],["dy Sul","dy Lun","dy Meurth","dy Merher","dy Yow","dy Gwener","dy Sadorn"],["Sul","Lun","Mth","Mhr","Yow","Gwe","Sad"]],u,[["1","2","3","4","5","6","7","8","9","10","11","12"],["Gen","Hwe","Meu","Ebr","Me","Met","Gor","Est","Gwn","Hed","Du","Kev"],["mis Genver","mis Hwevrer","mis Meurth","mis Ebrel","mis Me","mis Metheven","mis Gortheren","mis Est","mis Gwynngala","mis Hedra","mis Du","mis Kevardhu"]],u,[["RC","AD"]],1,[6,0],["y-MM-dd","y MMM d","y MMMM d","y MMMM d, EEEE"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,u,u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"GBP","£","GBP",{"JPY":["JP¥","¥"],"USD":["US$","$"]},"ltr", plural];
