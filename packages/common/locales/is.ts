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
const n = val, i = Math.floor(Math.abs(val)), t = parseInt(val.toString().replace(/^[^.]*\.?|0+$/g, ''), 10) || 0;

if (t === 0 && (i % 10 === 1 && !(i % 100 === 11)) || !(t === 0))
    return 1;
return 5;
}

export default ["is",[["f.","e."],["f.h.","e.h."]],[["f.h.","e.h."]],[["S","M","Þ","M","F","F","L"],["sun.","mán.","þri.","mið.","fim.","fös.","lau."],["sunnudagur","mánudagur","þriðjudagur","miðvikudagur","fimmtudagur","föstudagur","laugardagur"],["su.","má.","þr.","mi.","fi.","fö.","la."]],u,[["J","F","M","A","M","J","J","Á","S","O","N","D"],["jan.","feb.","mar.","apr.","maí","jún.","júl.","ágú.","sep.","okt.","nóv.","des."],["janúar","febrúar","mars","apríl","maí","júní","júlí","ágúst","september","október","nóvember","desember"]],u,[["f.k.","e.k."],["f.Kr.","e.Kr."],["fyrir Krist","eftir Krist"]],1,[6,0],["d.M.y","d. MMM y","d. MMMM y","EEEE, d. MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1}, {0}",u,"{1} 'kl'. {0}",u],[",",".",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","#,##0.00 ¤","#E0"],"ISK","ISK","íslensk króna",{"AUD":[u,"$"],"BRL":[u,"R$"],"CAD":[u,"$"],"EUR":[u,"€"],"GBP":[u,"£"],"INR":[u,"₹"],"JPY":["JP¥","¥"],"KRW":[u,"₩"],"MXN":[u,"$"],"NZD":[u,"$"],"PHP":[u,"₱"],"TWD":[u,"NT$"],"USD":[u,"$"],"VND":[u,"₫"]},"ltr", plural];
