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
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length, f = parseInt(val.toString().replace(/^[^.]*\.?/, ''), 10) || 0;

if (v === 0 && (i % 10 === 1 && !(i % 100 === 11)) || f % 10 === 1 && !(f % 100 === 11))
    return 1;
if (v === 0 && (i % 10 === Math.floor(i % 10) && (i % 10 >= 2 && i % 10 <= 4) && !(i % 100 >= 12 && i % 100 <= 14)) || f % 10 === Math.floor(f % 10) && (f % 10 >= 2 && f % 10 <= 4) && !(f % 100 >= 12 && f % 100 <= 14))
    return 3;
return 5;
}

export default ["sr-Cyrl-ME",[["AM","PM"],["прије подне","по подне"]],[["a","p"],["прије подне","по подне"]],[["н","п","у","с","ч","п","с"],["нед","пон","уто","сре","чет","пет","суб"],["недјеља","понедељак","уторак","сриједа","четвртак","петак","субота"],["не","по","ут","ср","че","пе","су"]],u,[["ј","ф","м","а","м","ј","ј","а","с","о","н","д"],["јан","феб","март","апр","мај","јун","јул","авг","септ","окт","нов","дец"],["јануар","фебруар","март","април","мај","јун","јул","август","септембар","октобар","новембар","децембар"]],u,[["п.н.е.","н.е."],["п. н. е.","н. е."],["прије нове ере","нове ере"]],1,[6,0],["d.M.yy.","d. M. y.","d. MMMM y.","EEEE, d. MMMM y."],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,u,u],[",",".",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","#,##0.00 ¤","#E0"],"EUR","€","Евро",{"AUD":[u,"$"],"BAM":["КМ","KM"],"BYN":[u,"р."],"GEL":[u,"ლ"],"KRW":[u,"₩"],"NZD":[u,"$"],"PHP":[u,"₱"],"TWD":["NT$"],"USD":["US$","$"],"VND":[u,"₫"]},"ltr", plural];
