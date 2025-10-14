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

if (n === 1 || !(t === 0) && (i === 0 || i === 1))
    return 1;
return 5;
}

export default ["da-GL",[["a","p"],["AM","PM"]],[["AM","PM"]],[["S","M","T","O","T","F","L"],["søn.","man.","tir.","ons.","tor.","fre.","lør."],["søndag","mandag","tirsdag","onsdag","torsdag","fredag","lørdag"],["sø","ma","ti","on","to","fr","lø"]],[["S","M","T","O","T","F","L"],["søn","man","tir","ons","tor","fre","lør"],["søndag","mandag","tirsdag","onsdag","torsdag","fredag","lørdag"],["sø","ma","ti","on","to","fr","lø"]],[["J","F","M","A","M","J","J","A","S","O","N","D"],["jan.","feb.","mar.","apr.","maj","jun.","jul.","aug.","sep.","okt.","nov.","dec."],["januar","februar","marts","april","maj","juni","juli","august","september","oktober","november","december"]],u,[["fKr","eKr"],["f.Kr.","e.Kr."]],1,[6,0],["dd.MM.y","d. MMM y","d. MMMM y","EEEE 'den' d. MMMM y"],["HH.mm","HH.mm.ss","HH.mm.ss z","HH.mm.ss zzzz"],["{1} {0}",u,"{1} 'kl'. {0}",u],[",",".",";","%","+","-","E","×","‰","∞","NaN","."],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"DKK","kr.","dansk krone",{"AUD":["AU$","$"],"BYN":[u,"Br."],"DKK":["kr."],"ISK":[u,"kr."],"JPY":["JP¥","¥"],"NOK":[u,"kr."],"PHP":[u,"₱"],"RON":[u,"L"],"SEK":[u,"kr."],"THB":["฿"],"TWD":["NT$"],"USD":["US$","$"]},"ltr", plural];
