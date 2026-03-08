(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))n(t);new MutationObserver(t=>{for(const i of t)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function r(t){const i={};return t.integrity&&(i.integrity=t.integrity),t.referrerPolicy&&(i.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?i.credentials="include":t.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(t){if(t.ep)return;t.ep=!0;const i=r(t);fetch(t.href,i)}})();function Y(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var S=Y();function ve(s){S=s}var I={exec:()=>null};function d(s,e=""){let r=typeof s=="string"?s:s.source,n={replace:(t,i)=>{let a=typeof i=="string"?i:i.source;return a=a.replace(x.caret,"$1"),r=r.replace(t,a),n},getRegex:()=>new RegExp(r,e)};return n}var Ee=(()=>{try{return!!new RegExp("(?<=1)(?<!1)")}catch{return!1}})(),x={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceTabs:/^\t+/,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] /,listReplaceTask:/^\[[ xX]\] +/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,unescapeTest:/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:s=>new RegExp(`^( {0,3}${s})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:s=>new RegExp(`^ {0,${Math.min(3,s-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),hrRegex:s=>new RegExp(`^ {0,${Math.min(3,s-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),fencesBeginRegex:s=>new RegExp(`^ {0,${Math.min(3,s-1)}}(?:\`\`\`|~~~)`),headingBeginRegex:s=>new RegExp(`^ {0,${Math.min(3,s-1)}}#`),htmlBeginRegex:s=>new RegExp(`^ {0,${Math.min(3,s-1)}}<(?:[a-z].*>|!--)`,"i")},qe=/^(?:[ \t]*(?:\n|$))+/,Me=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,Ne=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,B=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,Oe=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,ee=/(?:[*+-]|\d{1,9}[.)])/,ye=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,$e=d(ye).replace(/bull/g,ee).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),De=d(ye).replace(/bull/g,ee).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),te=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,He=/^[^\n]+/,se=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/,Ze=d(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",se).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),je=d(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,ee).getRegex(),Z="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",re=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,Ke=d("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))","i").replace("comment",re).replace("tag",Z).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),Re=d(te).replace("hr",B).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Z).getRegex(),Qe=d(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",Re).getRegex(),ne={blockquote:Qe,code:Me,def:Ze,fences:Ne,heading:Oe,hr:B,html:Ke,lheading:$e,list:je,newline:qe,paragraph:Re,table:I,text:He},ge=d("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",B).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}	)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Z).getRegex(),Fe={...ne,lheading:De,table:ge,paragraph:d(te).replace("hr",B).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",ge).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Z).getRegex()},Ge={...ne,html:d(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",re).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:I,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:d(te).replace("hr",B).replace("heading",` *#{1,6} *[^
]`).replace("lheading",$e).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},Je=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,Ue=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,Se=/^( {2,}|\\)\n(?!\s*$)/,We=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,j=/[\p{P}\p{S}]/u,ae=/[\s\p{P}\p{S}]/u,Te=/[^\s\p{P}\p{S}]/u,Xe=d(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,ae).getRegex(),_e=/(?!~)[\p{P}\p{S}]/u,Ve=/(?!~)[\s\p{P}\p{S}]/u,Ye=/(?:[^\s\p{P}\p{S}]|~)/u,et=d(/link|precode-code|html/,"g").replace("link",/\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-",Ee?"(?<!`)()":"(^^|[^`])").replace("code",/(?<b>`+)[^`]+\k<b>(?!`)/).replace("html",/<(?! )[^<>]*?>/).getRegex(),Ce=/^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/,tt=d(Ce,"u").replace(/punct/g,j).getRegex(),st=d(Ce,"u").replace(/punct/g,_e).getRegex(),Ae="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",rt=d(Ae,"gu").replace(/notPunctSpace/g,Te).replace(/punctSpace/g,ae).replace(/punct/g,j).getRegex(),nt=d(Ae,"gu").replace(/notPunctSpace/g,Ye).replace(/punctSpace/g,Ve).replace(/punct/g,_e).getRegex(),at=d("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,Te).replace(/punctSpace/g,ae).replace(/punct/g,j).getRegex(),it=d(/\\(punct)/,"gu").replace(/punct/g,j).getRegex(),lt=d(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),ot=d(re).replace("(?:-->|$)","-->").getRegex(),ct=d("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",ot).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),O=/(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+[^`]*?`+(?!`)|[^\[\]\\`])*?/,pt=d(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label",O).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),Le=d(/^!?\[(label)\]\[(ref)\]/).replace("label",O).replace("ref",se).getRegex(),ze=d(/^!?\[(ref)\](?:\[\])?/).replace("ref",se).getRegex(),ht=d("reflink|nolink(?!\\()","g").replace("reflink",Le).replace("nolink",ze).getRegex(),ke=/[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,ie={_backpedal:I,anyPunctuation:it,autolink:lt,blockSkip:et,br:Se,code:Ue,del:I,emStrongLDelim:tt,emStrongRDelimAst:rt,emStrongRDelimUnd:at,escape:Je,link:pt,nolink:ze,punctuation:Xe,reflink:Le,reflinkSearch:ht,tag:ct,text:We,url:I},ut={...ie,link:d(/^!?\[(label)\]\((.*?)\)/).replace("label",O).getRegex(),reflink:d(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",O).getRegex()},G={...ie,emStrongRDelimAst:nt,emStrongLDelim:st,url:d(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol",ke).replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,text:d(/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol",ke).getRegex()},dt={...G,br:d(Se).replace("{2,}","*").getRegex(),text:d(G.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},q={normal:ne,gfm:Fe,pedantic:Ge},A={normal:ie,gfm:G,breaks:dt,pedantic:ut},gt={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},fe=s=>gt[s];function $(s,e){if(e){if(x.escapeTest.test(s))return s.replace(x.escapeReplace,fe)}else if(x.escapeTestNoEncode.test(s))return s.replace(x.escapeReplaceNoEncode,fe);return s}function me(s){try{s=encodeURI(s).replace(x.percentDecode,"%")}catch{return null}return s}function be(s,e){let r=s.replace(x.findPipe,(i,a,o)=>{let l=!1,h=a;for(;--h>=0&&o[h]==="\\";)l=!l;return l?"|":" |"}),n=r.split(x.splitPipe),t=0;if(n[0].trim()||n.shift(),n.length>0&&!n.at(-1)?.trim()&&n.pop(),e)if(n.length>e)n.splice(e);else for(;n.length<e;)n.push("");for(;t<n.length;t++)n[t]=n[t].trim().replace(x.slashPipe,"|");return n}function L(s,e,r){let n=s.length;if(n===0)return"";let t=0;for(;t<n&&s.charAt(n-t-1)===e;)t++;return s.slice(0,n-t)}function kt(s,e){if(s.indexOf(e[1])===-1)return-1;let r=0;for(let n=0;n<s.length;n++)if(s[n]==="\\")n++;else if(s[n]===e[0])r++;else if(s[n]===e[1]&&(r--,r<0))return n;return r>0?-2:-1}function xe(s,e,r,n,t){let i=e.href,a=e.title||null,o=s[1].replace(t.other.outputLinkReplace,"$1");n.state.inLink=!0;let l={type:s[0].charAt(0)==="!"?"image":"link",raw:r,href:i,title:a,text:o,tokens:n.inlineTokens(o)};return n.state.inLink=!1,l}function ft(s,e,r){let n=s.match(r.other.indentCodeCompensation);if(n===null)return e;let t=n[1];return e.split(`
`).map(i=>{let a=i.match(r.other.beginningSpace);if(a===null)return i;let[o]=a;return o.length>=t.length?i.slice(t.length):i}).join(`
`)}var D=class{options;rules;lexer;constructor(s){this.options=s||S}space(s){let e=this.rules.block.newline.exec(s);if(e&&e[0].length>0)return{type:"space",raw:e[0]}}code(s){let e=this.rules.block.code.exec(s);if(e){let r=e[0].replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:e[0],codeBlockStyle:"indented",text:this.options.pedantic?r:L(r,`
`)}}}fences(s){let e=this.rules.block.fences.exec(s);if(e){let r=e[0],n=ft(r,e[3]||"",this.rules);return{type:"code",raw:r,lang:e[2]?e[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):e[2],text:n}}}heading(s){let e=this.rules.block.heading.exec(s);if(e){let r=e[2].trim();if(this.rules.other.endingHash.test(r)){let n=L(r,"#");(this.options.pedantic||!n||this.rules.other.endingSpaceChar.test(n))&&(r=n.trim())}return{type:"heading",raw:e[0],depth:e[1].length,text:r,tokens:this.lexer.inline(r)}}}hr(s){let e=this.rules.block.hr.exec(s);if(e)return{type:"hr",raw:L(e[0],`
`)}}blockquote(s){let e=this.rules.block.blockquote.exec(s);if(e){let r=L(e[0],`
`).split(`
`),n="",t="",i=[];for(;r.length>0;){let a=!1,o=[],l;for(l=0;l<r.length;l++)if(this.rules.other.blockquoteStart.test(r[l]))o.push(r[l]),a=!0;else if(!a)o.push(r[l]);else break;r=r.slice(l);let h=o.join(`
`),c=h.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,"");n=n?`${n}
${h}`:h,t=t?`${t}
${c}`:c;let f=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(c,i,!0),this.lexer.state.top=f,r.length===0)break;let g=i.at(-1);if(g?.type==="code")break;if(g?.type==="blockquote"){let b=g,m=b.raw+`
`+r.join(`
`),w=this.blockquote(m);i[i.length-1]=w,n=n.substring(0,n.length-b.raw.length)+w.raw,t=t.substring(0,t.length-b.text.length)+w.text;break}else if(g?.type==="list"){let b=g,m=b.raw+`
`+r.join(`
`),w=this.list(m);i[i.length-1]=w,n=n.substring(0,n.length-g.raw.length)+w.raw,t=t.substring(0,t.length-b.raw.length)+w.raw,r=m.substring(i.at(-1).raw.length).split(`
`);continue}}return{type:"blockquote",raw:n,tokens:i,text:t}}}list(s){let e=this.rules.block.list.exec(s);if(e){let r=e[1].trim(),n=r.length>1,t={type:"list",raw:"",ordered:n,start:n?+r.slice(0,-1):"",loose:!1,items:[]};r=n?`\\d{1,9}\\${r.slice(-1)}`:`\\${r}`,this.options.pedantic&&(r=n?r:"[*+-]");let i=this.rules.other.listItemRegex(r),a=!1;for(;s;){let l=!1,h="",c="";if(!(e=i.exec(s))||this.rules.block.hr.test(s))break;h=e[0],s=s.substring(h.length);let f=e[2].split(`
`,1)[0].replace(this.rules.other.listReplaceTabs,K=>" ".repeat(3*K.length)),g=s.split(`
`,1)[0],b=!f.trim(),m=0;if(this.options.pedantic?(m=2,c=f.trimStart()):b?m=e[1].length+1:(m=e[2].search(this.rules.other.nonSpaceChar),m=m>4?1:m,c=f.slice(m),m+=e[1].length),b&&this.rules.other.blankLine.test(g)&&(h+=g+`
`,s=s.substring(g.length+1),l=!0),!l){let K=this.rules.other.nextBulletRegex(m),he=this.rules.other.hrRegex(m),ue=this.rules.other.fencesBeginRegex(m),de=this.rules.other.headingBeginRegex(m),Pe=this.rules.other.htmlBeginRegex(m);for(;s;){let Q=s.split(`
`,1)[0],C;if(g=Q,this.options.pedantic?(g=g.replace(this.rules.other.listReplaceNesting,"  "),C=g):C=g.replace(this.rules.other.tabCharGlobal,"    "),ue.test(g)||de.test(g)||Pe.test(g)||K.test(g)||he.test(g))break;if(C.search(this.rules.other.nonSpaceChar)>=m||!g.trim())c+=`
`+C.slice(m);else{if(b||f.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||ue.test(f)||de.test(f)||he.test(f))break;c+=`
`+g}!b&&!g.trim()&&(b=!0),h+=Q+`
`,s=s.substring(Q.length+1),f=C.slice(m)}}t.loose||(a?t.loose=!0:this.rules.other.doubleBlankLine.test(h)&&(a=!0));let w=null,pe;this.options.gfm&&(w=this.rules.other.listIsTask.exec(c),w&&(pe=w[0]!=="[ ] ",c=c.replace(this.rules.other.listReplaceTask,""))),t.items.push({type:"list_item",raw:h,task:!!w,checked:pe,loose:!1,text:c,tokens:[]}),t.raw+=h}let o=t.items.at(-1);if(o)o.raw=o.raw.trimEnd(),o.text=o.text.trimEnd();else return;t.raw=t.raw.trimEnd();for(let l=0;l<t.items.length;l++)if(this.lexer.state.top=!1,t.items[l].tokens=this.lexer.blockTokens(t.items[l].text,[]),!t.loose){let h=t.items[l].tokens.filter(f=>f.type==="space"),c=h.length>0&&h.some(f=>this.rules.other.anyLine.test(f.raw));t.loose=c}if(t.loose)for(let l=0;l<t.items.length;l++)t.items[l].loose=!0;return t}}html(s){let e=this.rules.block.html.exec(s);if(e)return{type:"html",block:!0,raw:e[0],pre:e[1]==="pre"||e[1]==="script"||e[1]==="style",text:e[0]}}def(s){let e=this.rules.block.def.exec(s);if(e){let r=e[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal," "),n=e[2]?e[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",t=e[3]?e[3].substring(1,e[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):e[3];return{type:"def",tag:r,raw:e[0],href:n,title:t}}}table(s){let e=this.rules.block.table.exec(s);if(!e||!this.rules.other.tableDelimiter.test(e[2]))return;let r=be(e[1]),n=e[2].replace(this.rules.other.tableAlignChars,"").split("|"),t=e[3]?.trim()?e[3].replace(this.rules.other.tableRowBlankLine,"").split(`
`):[],i={type:"table",raw:e[0],header:[],align:[],rows:[]};if(r.length===n.length){for(let a of n)this.rules.other.tableAlignRight.test(a)?i.align.push("right"):this.rules.other.tableAlignCenter.test(a)?i.align.push("center"):this.rules.other.tableAlignLeft.test(a)?i.align.push("left"):i.align.push(null);for(let a=0;a<r.length;a++)i.header.push({text:r[a],tokens:this.lexer.inline(r[a]),header:!0,align:i.align[a]});for(let a of t)i.rows.push(be(a,i.header.length).map((o,l)=>({text:o,tokens:this.lexer.inline(o),header:!1,align:i.align[l]})));return i}}lheading(s){let e=this.rules.block.lheading.exec(s);if(e)return{type:"heading",raw:e[0],depth:e[2].charAt(0)==="="?1:2,text:e[1],tokens:this.lexer.inline(e[1])}}paragraph(s){let e=this.rules.block.paragraph.exec(s);if(e){let r=e[1].charAt(e[1].length-1)===`
`?e[1].slice(0,-1):e[1];return{type:"paragraph",raw:e[0],text:r,tokens:this.lexer.inline(r)}}}text(s){let e=this.rules.block.text.exec(s);if(e)return{type:"text",raw:e[0],text:e[0],tokens:this.lexer.inline(e[0])}}escape(s){let e=this.rules.inline.escape.exec(s);if(e)return{type:"escape",raw:e[0],text:e[1]}}tag(s){let e=this.rules.inline.tag.exec(s);if(e)return!this.lexer.state.inLink&&this.rules.other.startATag.test(e[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(e[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(e[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(e[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:e[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:e[0]}}link(s){let e=this.rules.inline.link.exec(s);if(e){let r=e[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(r)){if(!this.rules.other.endAngleBracket.test(r))return;let i=L(r.slice(0,-1),"\\");if((r.length-i.length)%2===0)return}else{let i=kt(e[2],"()");if(i===-2)return;if(i>-1){let a=(e[0].indexOf("!")===0?5:4)+e[1].length+i;e[2]=e[2].substring(0,i),e[0]=e[0].substring(0,a).trim(),e[3]=""}}let n=e[2],t="";if(this.options.pedantic){let i=this.rules.other.pedanticHrefTitle.exec(n);i&&(n=i[1],t=i[3])}else t=e[3]?e[3].slice(1,-1):"";return n=n.trim(),this.rules.other.startAngleBracket.test(n)&&(this.options.pedantic&&!this.rules.other.endAngleBracket.test(r)?n=n.slice(1):n=n.slice(1,-1)),xe(e,{href:n&&n.replace(this.rules.inline.anyPunctuation,"$1"),title:t&&t.replace(this.rules.inline.anyPunctuation,"$1")},e[0],this.lexer,this.rules)}}reflink(s,e){let r;if((r=this.rules.inline.reflink.exec(s))||(r=this.rules.inline.nolink.exec(s))){let n=(r[2]||r[1]).replace(this.rules.other.multipleSpaceGlobal," "),t=e[n.toLowerCase()];if(!t){let i=r[0].charAt(0);return{type:"text",raw:i,text:i}}return xe(r,t,r[0],this.lexer,this.rules)}}emStrong(s,e,r=""){let n=this.rules.inline.emStrongLDelim.exec(s);if(!(!n||n[3]&&r.match(this.rules.other.unicodeAlphaNumeric))&&(!(n[1]||n[2])||!r||this.rules.inline.punctuation.exec(r))){let t=[...n[0]].length-1,i,a,o=t,l=0,h=n[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(h.lastIndex=0,e=e.slice(-1*s.length+t);(n=h.exec(e))!=null;){if(i=n[1]||n[2]||n[3]||n[4]||n[5]||n[6],!i)continue;if(a=[...i].length,n[3]||n[4]){o+=a;continue}else if((n[5]||n[6])&&t%3&&!((t+a)%3)){l+=a;continue}if(o-=a,o>0)continue;a=Math.min(a,a+o+l);let c=[...n[0]][0].length,f=s.slice(0,t+n.index+c+a);if(Math.min(t,a)%2){let b=f.slice(1,-1);return{type:"em",raw:f,text:b,tokens:this.lexer.inlineTokens(b)}}let g=f.slice(2,-2);return{type:"strong",raw:f,text:g,tokens:this.lexer.inlineTokens(g)}}}}codespan(s){let e=this.rules.inline.code.exec(s);if(e){let r=e[2].replace(this.rules.other.newLineCharGlobal," "),n=this.rules.other.nonSpaceChar.test(r),t=this.rules.other.startingSpaceChar.test(r)&&this.rules.other.endingSpaceChar.test(r);return n&&t&&(r=r.substring(1,r.length-1)),{type:"codespan",raw:e[0],text:r}}}br(s){let e=this.rules.inline.br.exec(s);if(e)return{type:"br",raw:e[0]}}del(s){let e=this.rules.inline.del.exec(s);if(e)return{type:"del",raw:e[0],text:e[2],tokens:this.lexer.inlineTokens(e[2])}}autolink(s){let e=this.rules.inline.autolink.exec(s);if(e){let r,n;return e[2]==="@"?(r=e[1],n="mailto:"+r):(r=e[1],n=r),{type:"link",raw:e[0],text:r,href:n,tokens:[{type:"text",raw:r,text:r}]}}}url(s){let e;if(e=this.rules.inline.url.exec(s)){let r,n;if(e[2]==="@")r=e[0],n="mailto:"+r;else{let t;do t=e[0],e[0]=this.rules.inline._backpedal.exec(e[0])?.[0]??"";while(t!==e[0]);r=e[0],e[1]==="www."?n="http://"+e[0]:n=e[0]}return{type:"link",raw:e[0],text:r,href:n,tokens:[{type:"text",raw:r,text:r}]}}}inlineText(s){let e=this.rules.inline.text.exec(s);if(e){let r=this.lexer.state.inRawBlock;return{type:"text",raw:e[0],text:e[0],escaped:r}}}},v=class J{tokens;options;state;tokenizer;inlineQueue;constructor(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||S,this.options.tokenizer=this.options.tokenizer||new D,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let r={other:x,block:q.normal,inline:A.normal};this.options.pedantic?(r.block=q.pedantic,r.inline=A.pedantic):this.options.gfm&&(r.block=q.gfm,this.options.breaks?r.inline=A.breaks:r.inline=A.gfm),this.tokenizer.rules=r}static get rules(){return{block:q,inline:A}}static lex(e,r){return new J(r).lex(e)}static lexInline(e,r){return new J(r).inlineTokens(e)}lex(e){e=e.replace(x.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let r=0;r<this.inlineQueue.length;r++){let n=this.inlineQueue[r];this.inlineTokens(n.src,n.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,r=[],n=!1){for(this.options.pedantic&&(e=e.replace(x.tabCharGlobal,"    ").replace(x.spaceLine,""));e;){let t;if(this.options.extensions?.block?.some(a=>(t=a.call({lexer:this},e,r))?(e=e.substring(t.raw.length),r.push(t),!0):!1))continue;if(t=this.tokenizer.space(e)){e=e.substring(t.raw.length);let a=r.at(-1);t.raw.length===1&&a!==void 0?a.raw+=`
`:r.push(t);continue}if(t=this.tokenizer.code(e)){e=e.substring(t.raw.length);let a=r.at(-1);a?.type==="paragraph"||a?.type==="text"?(a.raw+=(a.raw.endsWith(`
`)?"":`
`)+t.raw,a.text+=`
`+t.text,this.inlineQueue.at(-1).src=a.text):r.push(t);continue}if(t=this.tokenizer.fences(e)){e=e.substring(t.raw.length),r.push(t);continue}if(t=this.tokenizer.heading(e)){e=e.substring(t.raw.length),r.push(t);continue}if(t=this.tokenizer.hr(e)){e=e.substring(t.raw.length),r.push(t);continue}if(t=this.tokenizer.blockquote(e)){e=e.substring(t.raw.length),r.push(t);continue}if(t=this.tokenizer.list(e)){e=e.substring(t.raw.length),r.push(t);continue}if(t=this.tokenizer.html(e)){e=e.substring(t.raw.length),r.push(t);continue}if(t=this.tokenizer.def(e)){e=e.substring(t.raw.length);let a=r.at(-1);a?.type==="paragraph"||a?.type==="text"?(a.raw+=(a.raw.endsWith(`
`)?"":`
`)+t.raw,a.text+=`
`+t.raw,this.inlineQueue.at(-1).src=a.text):this.tokens.links[t.tag]||(this.tokens.links[t.tag]={href:t.href,title:t.title},r.push(t));continue}if(t=this.tokenizer.table(e)){e=e.substring(t.raw.length),r.push(t);continue}if(t=this.tokenizer.lheading(e)){e=e.substring(t.raw.length),r.push(t);continue}let i=e;if(this.options.extensions?.startBlock){let a=1/0,o=e.slice(1),l;this.options.extensions.startBlock.forEach(h=>{l=h.call({lexer:this},o),typeof l=="number"&&l>=0&&(a=Math.min(a,l))}),a<1/0&&a>=0&&(i=e.substring(0,a+1))}if(this.state.top&&(t=this.tokenizer.paragraph(i))){let a=r.at(-1);n&&a?.type==="paragraph"?(a.raw+=(a.raw.endsWith(`
`)?"":`
`)+t.raw,a.text+=`
`+t.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=a.text):r.push(t),n=i.length!==e.length,e=e.substring(t.raw.length);continue}if(t=this.tokenizer.text(e)){e=e.substring(t.raw.length);let a=r.at(-1);a?.type==="text"?(a.raw+=(a.raw.endsWith(`
`)?"":`
`)+t.raw,a.text+=`
`+t.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=a.text):r.push(t);continue}if(e){let a="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(a);break}else throw new Error(a)}}return this.state.top=!0,r}inline(e,r=[]){return this.inlineQueue.push({src:e,tokens:r}),r}inlineTokens(e,r=[]){let n=e,t=null;if(this.tokens.links){let l=Object.keys(this.tokens.links);if(l.length>0)for(;(t=this.tokenizer.rules.inline.reflinkSearch.exec(n))!=null;)l.includes(t[0].slice(t[0].lastIndexOf("[")+1,-1))&&(n=n.slice(0,t.index)+"["+"a".repeat(t[0].length-2)+"]"+n.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(t=this.tokenizer.rules.inline.anyPunctuation.exec(n))!=null;)n=n.slice(0,t.index)+"++"+n.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);let i;for(;(t=this.tokenizer.rules.inline.blockSkip.exec(n))!=null;)i=t[2]?t[2].length:0,n=n.slice(0,t.index+i)+"["+"a".repeat(t[0].length-i-2)+"]"+n.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);n=this.options.hooks?.emStrongMask?.call({lexer:this},n)??n;let a=!1,o="";for(;e;){a||(o=""),a=!1;let l;if(this.options.extensions?.inline?.some(c=>(l=c.call({lexer:this},e,r))?(e=e.substring(l.raw.length),r.push(l),!0):!1))continue;if(l=this.tokenizer.escape(e)){e=e.substring(l.raw.length),r.push(l);continue}if(l=this.tokenizer.tag(e)){e=e.substring(l.raw.length),r.push(l);continue}if(l=this.tokenizer.link(e)){e=e.substring(l.raw.length),r.push(l);continue}if(l=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(l.raw.length);let c=r.at(-1);l.type==="text"&&c?.type==="text"?(c.raw+=l.raw,c.text+=l.text):r.push(l);continue}if(l=this.tokenizer.emStrong(e,n,o)){e=e.substring(l.raw.length),r.push(l);continue}if(l=this.tokenizer.codespan(e)){e=e.substring(l.raw.length),r.push(l);continue}if(l=this.tokenizer.br(e)){e=e.substring(l.raw.length),r.push(l);continue}if(l=this.tokenizer.del(e)){e=e.substring(l.raw.length),r.push(l);continue}if(l=this.tokenizer.autolink(e)){e=e.substring(l.raw.length),r.push(l);continue}if(!this.state.inLink&&(l=this.tokenizer.url(e))){e=e.substring(l.raw.length),r.push(l);continue}let h=e;if(this.options.extensions?.startInline){let c=1/0,f=e.slice(1),g;this.options.extensions.startInline.forEach(b=>{g=b.call({lexer:this},f),typeof g=="number"&&g>=0&&(c=Math.min(c,g))}),c<1/0&&c>=0&&(h=e.substring(0,c+1))}if(l=this.tokenizer.inlineText(h)){e=e.substring(l.raw.length),l.raw.slice(-1)!=="_"&&(o=l.raw.slice(-1)),a=!0;let c=r.at(-1);c?.type==="text"?(c.raw+=l.raw,c.text+=l.text):r.push(l);continue}if(e){let c="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(c);break}else throw new Error(c)}}return r}},H=class{options;parser;constructor(s){this.options=s||S}space(s){return""}code({text:s,lang:e,escaped:r}){let n=(e||"").match(x.notSpaceStart)?.[0],t=s.replace(x.endingNewline,"")+`
`;return n?'<pre><code class="language-'+$(n)+'">'+(r?t:$(t,!0))+`</code></pre>
`:"<pre><code>"+(r?t:$(t,!0))+`</code></pre>
`}blockquote({tokens:s}){return`<blockquote>
${this.parser.parse(s)}</blockquote>
`}html({text:s}){return s}def(s){return""}heading({tokens:s,depth:e}){return`<h${e}>${this.parser.parseInline(s)}</h${e}>
`}hr(s){return`<hr>
`}list(s){let e=s.ordered,r=s.start,n="";for(let a=0;a<s.items.length;a++){let o=s.items[a];n+=this.listitem(o)}let t=e?"ol":"ul",i=e&&r!==1?' start="'+r+'"':"";return"<"+t+i+`>
`+n+"</"+t+`>
`}listitem(s){let e="";if(s.task){let r=this.checkbox({checked:!!s.checked});s.loose?s.tokens[0]?.type==="paragraph"?(s.tokens[0].text=r+" "+s.tokens[0].text,s.tokens[0].tokens&&s.tokens[0].tokens.length>0&&s.tokens[0].tokens[0].type==="text"&&(s.tokens[0].tokens[0].text=r+" "+$(s.tokens[0].tokens[0].text),s.tokens[0].tokens[0].escaped=!0)):s.tokens.unshift({type:"text",raw:r+" ",text:r+" ",escaped:!0}):e+=r+" "}return e+=this.parser.parse(s.tokens,!!s.loose),`<li>${e}</li>
`}checkbox({checked:s}){return"<input "+(s?'checked="" ':"")+'disabled="" type="checkbox">'}paragraph({tokens:s}){return`<p>${this.parser.parseInline(s)}</p>
`}table(s){let e="",r="";for(let t=0;t<s.header.length;t++)r+=this.tablecell(s.header[t]);e+=this.tablerow({text:r});let n="";for(let t=0;t<s.rows.length;t++){let i=s.rows[t];r="";for(let a=0;a<i.length;a++)r+=this.tablecell(i[a]);n+=this.tablerow({text:r})}return n&&(n=`<tbody>${n}</tbody>`),`<table>
<thead>
`+e+`</thead>
`+n+`</table>
`}tablerow({text:s}){return`<tr>
${s}</tr>
`}tablecell(s){let e=this.parser.parseInline(s.tokens),r=s.header?"th":"td";return(s.align?`<${r} align="${s.align}">`:`<${r}>`)+e+`</${r}>
`}strong({tokens:s}){return`<strong>${this.parser.parseInline(s)}</strong>`}em({tokens:s}){return`<em>${this.parser.parseInline(s)}</em>`}codespan({text:s}){return`<code>${$(s,!0)}</code>`}br(s){return"<br>"}del({tokens:s}){return`<del>${this.parser.parseInline(s)}</del>`}link({href:s,title:e,tokens:r}){let n=this.parser.parseInline(r),t=me(s);if(t===null)return n;s=t;let i='<a href="'+s+'"';return e&&(i+=' title="'+$(e)+'"'),i+=">"+n+"</a>",i}image({href:s,title:e,text:r,tokens:n}){n&&(r=this.parser.parseInline(n,this.parser.textRenderer));let t=me(s);if(t===null)return $(r);s=t;let i=`<img src="${s}" alt="${r}"`;return e&&(i+=` title="${$(e)}"`),i+=">",i}text(s){return"tokens"in s&&s.tokens?this.parser.parseInline(s.tokens):"escaped"in s&&s.escaped?s.text:$(s.text)}},le=class{strong({text:e}){return e}em({text:e}){return e}codespan({text:e}){return e}del({text:e}){return e}html({text:e}){return e}text({text:e}){return e}link({text:e}){return""+e}image({text:e}){return""+e}br(){return""}},y=class U{options;renderer;textRenderer;constructor(e){this.options=e||S,this.options.renderer=this.options.renderer||new H,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new le}static parse(e,r){return new U(r).parse(e)}static parseInline(e,r){return new U(r).parseInline(e)}parse(e,r=!0){let n="";for(let t=0;t<e.length;t++){let i=e[t];if(this.options.extensions?.renderers?.[i.type]){let o=i,l=this.options.extensions.renderers[o.type].call({parser:this},o);if(l!==!1||!["space","hr","heading","code","table","blockquote","list","html","def","paragraph","text"].includes(o.type)){n+=l||"";continue}}let a=i;switch(a.type){case"space":{n+=this.renderer.space(a);continue}case"hr":{n+=this.renderer.hr(a);continue}case"heading":{n+=this.renderer.heading(a);continue}case"code":{n+=this.renderer.code(a);continue}case"table":{n+=this.renderer.table(a);continue}case"blockquote":{n+=this.renderer.blockquote(a);continue}case"list":{n+=this.renderer.list(a);continue}case"html":{n+=this.renderer.html(a);continue}case"def":{n+=this.renderer.def(a);continue}case"paragraph":{n+=this.renderer.paragraph(a);continue}case"text":{let o=a,l=this.renderer.text(o);for(;t+1<e.length&&e[t+1].type==="text";)o=e[++t],l+=`
`+this.renderer.text(o);r?n+=this.renderer.paragraph({type:"paragraph",raw:l,text:l,tokens:[{type:"text",raw:l,text:l,escaped:!0}]}):n+=l;continue}default:{let o='Token with "'+a.type+'" type was not found.';if(this.options.silent)return console.error(o),"";throw new Error(o)}}}return n}parseInline(e,r=this.renderer){let n="";for(let t=0;t<e.length;t++){let i=e[t];if(this.options.extensions?.renderers?.[i.type]){let o=this.options.extensions.renderers[i.type].call({parser:this},i);if(o!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(i.type)){n+=o||"";continue}}let a=i;switch(a.type){case"escape":{n+=r.text(a);break}case"html":{n+=r.html(a);break}case"link":{n+=r.link(a);break}case"image":{n+=r.image(a);break}case"strong":{n+=r.strong(a);break}case"em":{n+=r.em(a);break}case"codespan":{n+=r.codespan(a);break}case"br":{n+=r.br(a);break}case"del":{n+=r.del(a);break}case"text":{n+=r.text(a);break}default:{let o='Token with "'+a.type+'" type was not found.';if(this.options.silent)return console.error(o),"";throw new Error(o)}}}return n}},z=class{options;block;constructor(s){this.options=s||S}static passThroughHooks=new Set(["preprocess","postprocess","processAllTokens","emStrongMask"]);static passThroughHooksRespectAsync=new Set(["preprocess","postprocess","processAllTokens"]);preprocess(s){return s}postprocess(s){return s}processAllTokens(s){return s}emStrongMask(s){return s}provideLexer(){return this.block?v.lex:v.lexInline}provideParser(){return this.block?y.parse:y.parseInline}},mt=class{defaults=Y();options=this.setOptions;parse=this.parseMarkdown(!0);parseInline=this.parseMarkdown(!1);Parser=y;Renderer=H;TextRenderer=le;Lexer=v;Tokenizer=D;Hooks=z;constructor(...s){this.use(...s)}walkTokens(s,e){let r=[];for(let n of s)switch(r=r.concat(e.call(this,n)),n.type){case"table":{let t=n;for(let i of t.header)r=r.concat(this.walkTokens(i.tokens,e));for(let i of t.rows)for(let a of i)r=r.concat(this.walkTokens(a.tokens,e));break}case"list":{let t=n;r=r.concat(this.walkTokens(t.items,e));break}default:{let t=n;this.defaults.extensions?.childTokens?.[t.type]?this.defaults.extensions.childTokens[t.type].forEach(i=>{let a=t[i].flat(1/0);r=r.concat(this.walkTokens(a,e))}):t.tokens&&(r=r.concat(this.walkTokens(t.tokens,e)))}}return r}use(...s){let e=this.defaults.extensions||{renderers:{},childTokens:{}};return s.forEach(r=>{let n={...r};if(n.async=this.defaults.async||n.async||!1,r.extensions&&(r.extensions.forEach(t=>{if(!t.name)throw new Error("extension name required");if("renderer"in t){let i=e.renderers[t.name];i?e.renderers[t.name]=function(...a){let o=t.renderer.apply(this,a);return o===!1&&(o=i.apply(this,a)),o}:e.renderers[t.name]=t.renderer}if("tokenizer"in t){if(!t.level||t.level!=="block"&&t.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");let i=e[t.level];i?i.unshift(t.tokenizer):e[t.level]=[t.tokenizer],t.start&&(t.level==="block"?e.startBlock?e.startBlock.push(t.start):e.startBlock=[t.start]:t.level==="inline"&&(e.startInline?e.startInline.push(t.start):e.startInline=[t.start]))}"childTokens"in t&&t.childTokens&&(e.childTokens[t.name]=t.childTokens)}),n.extensions=e),r.renderer){let t=this.defaults.renderer||new H(this.defaults);for(let i in r.renderer){if(!(i in t))throw new Error(`renderer '${i}' does not exist`);if(["options","parser"].includes(i))continue;let a=i,o=r.renderer[a],l=t[a];t[a]=(...h)=>{let c=o.apply(t,h);return c===!1&&(c=l.apply(t,h)),c||""}}n.renderer=t}if(r.tokenizer){let t=this.defaults.tokenizer||new D(this.defaults);for(let i in r.tokenizer){if(!(i in t))throw new Error(`tokenizer '${i}' does not exist`);if(["options","rules","lexer"].includes(i))continue;let a=i,o=r.tokenizer[a],l=t[a];t[a]=(...h)=>{let c=o.apply(t,h);return c===!1&&(c=l.apply(t,h)),c}}n.tokenizer=t}if(r.hooks){let t=this.defaults.hooks||new z;for(let i in r.hooks){if(!(i in t))throw new Error(`hook '${i}' does not exist`);if(["options","block"].includes(i))continue;let a=i,o=r.hooks[a],l=t[a];z.passThroughHooks.has(i)?t[a]=h=>{if(this.defaults.async&&z.passThroughHooksRespectAsync.has(i))return(async()=>{let f=await o.call(t,h);return l.call(t,f)})();let c=o.call(t,h);return l.call(t,c)}:t[a]=(...h)=>{if(this.defaults.async)return(async()=>{let f=await o.apply(t,h);return f===!1&&(f=await l.apply(t,h)),f})();let c=o.apply(t,h);return c===!1&&(c=l.apply(t,h)),c}}n.hooks=t}if(r.walkTokens){let t=this.defaults.walkTokens,i=r.walkTokens;n.walkTokens=function(a){let o=[];return o.push(i.call(this,a)),t&&(o=o.concat(t.call(this,a))),o}}this.defaults={...this.defaults,...n}}),this}setOptions(s){return this.defaults={...this.defaults,...s},this}lexer(s,e){return v.lex(s,e??this.defaults)}parser(s,e){return y.parse(s,e??this.defaults)}parseMarkdown(s){return(e,r)=>{let n={...r},t={...this.defaults,...n},i=this.onError(!!t.silent,!!t.async);if(this.defaults.async===!0&&n.async===!1)return i(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof e>"u"||e===null)return i(new Error("marked(): input parameter is undefined or null"));if(typeof e!="string")return i(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(e)+", string expected"));if(t.hooks&&(t.hooks.options=t,t.hooks.block=s),t.async)return(async()=>{let a=t.hooks?await t.hooks.preprocess(e):e,o=await(t.hooks?await t.hooks.provideLexer():s?v.lex:v.lexInline)(a,t),l=t.hooks?await t.hooks.processAllTokens(o):o;t.walkTokens&&await Promise.all(this.walkTokens(l,t.walkTokens));let h=await(t.hooks?await t.hooks.provideParser():s?y.parse:y.parseInline)(l,t);return t.hooks?await t.hooks.postprocess(h):h})().catch(i);try{t.hooks&&(e=t.hooks.preprocess(e));let a=(t.hooks?t.hooks.provideLexer():s?v.lex:v.lexInline)(e,t);t.hooks&&(a=t.hooks.processAllTokens(a)),t.walkTokens&&this.walkTokens(a,t.walkTokens);let o=(t.hooks?t.hooks.provideParser():s?y.parse:y.parseInline)(a,t);return t.hooks&&(o=t.hooks.postprocess(o)),o}catch(a){return i(a)}}}onError(s,e){return r=>{if(r.message+=`
Please report this to https://github.com/markedjs/marked.`,s){let n="<p>An error occurred:</p><pre>"+$(r.message+"",!0)+"</pre>";return e?Promise.resolve(n):n}if(e)return Promise.reject(r);throw r}}},R=new mt;function k(s,e){return R.parse(s,e)}k.options=k.setOptions=function(s){return R.setOptions(s),k.defaults=R.defaults,ve(k.defaults),k};k.getDefaults=Y;k.defaults=S;k.use=function(...s){return R.use(...s),k.defaults=R.defaults,ve(k.defaults),k};k.walkTokens=function(s,e){return R.walkTokens(s,e)};k.parseInline=R.parseInline;k.Parser=y;k.parser=y.parse;k.Renderer=H;k.TextRenderer=le;k.Lexer=v;k.lexer=v.lex;k.Tokenizer=D;k.Hooks=z;k.parse=k;k.options;k.setOptions;k.use;k.walkTokens;k.parseInline;y.parse;v.lex;const bt=crypto.randomUUID(),u={apiBase:localStorage.getItem("agent-api-base")||"/api/v1",threadId:localStorage.getItem("agent-thread-id")||bt,messages:[],latestRetrievalMetrics:null,latestCompareReport:null,latestBenchmarkMetrics:null,activeTrace:[],statusTimer:null,requestStartedAt:null,activeQuestion:""};k.setOptions({gfm:!0,breaks:!0});const xt=document.querySelector("#app");xt.innerHTML=`
  <div class="shell">
    <aside class="rail">
      <div class="brand">
        <div class="brand-mark">IA</div>
        <div>
          <p class="eyebrow">Policy And Tender Agent</p>
          <h1>InsightAgent</h1>
        </div>
      </div>

      <div class="stack">
        <label class="field">
          <span>API Base</span>
          <input id="apiBase" value="${u.apiBase}" placeholder="/api/v1" />
        </label>
        <label class="field">
          <span>Thread ID</span>
          <div class="inline">
            <input id="threadId" value="${u.threadId}" />
            <button id="regenThread" class="ghost">重置</button>
          </div>
        </label>
        <label class="field">
          <span>User ID</span>
          <input id="userId" placeholder="例如：liushiji" />
        </label>
      </div>

      <div class="mini-metrics compact-metrics">
        <div class="mini-card">
          <span>Chat Mode</span>
          <strong>ReAct + Planner</strong>
        </div>
        <div class="mini-card">
          <span>Retrieval</span>
          <strong>Hybrid + Rerank</strong>
        </div>
        <div class="mini-card">
          <span>Ops</span>
          <strong>Eval + Benchmark</strong>
        </div>
      </div>

      <section class="panel compact-panel">
        <div class="panel-head tight">
          <div>
            <p class="eyebrow">Testing</p>
            <h3>测试环境重建</h3>
          </div>
        </div>
        <div class="compact-actions">
          <label class="check">
            <input id="forceDownload" type="checkbox" />
            <span>强制下载</span>
          </label>
          <label class="check">
            <input id="runRetrievalEvalAfterRebuild" type="checkbox" checked />
            <span>自动评估</span>
          </label>
        </div>
        <button id="rebuildEnv">重建环境</button>
        <pre id="rebuildResult" class="result-box compact-result"></pre>
      </section>

      <section class="panel compact-panel">
        <div class="panel-head tight">
          <div>
            <p class="eyebrow">Knowledge</p>
            <h3>知识库上传</h3>
          </div>
        </div>
        <div class="stack">
          <input id="knowledgeFile" type="file" />
          <button id="uploadKnowledge">上传并入库</button>
          <pre id="uploadResult" class="result-box compact-result"></pre>
        </div>
      </section>
    </aside>

    <main class="workspace">
      <header class="workspace-header">
        <div>
          <p class="eyebrow">Agent Console</p>
          <h2>InsightAgent</h2>
          <p class="hero-text">面向政策通知、招投标公告与本地知识资料分析的多模式 Agent 工作台。</p>
        </div>
        <div class="hero-metrics" id="summaryCards"></div>
      </header>

      <section class="panel chat-panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Chat</p>
            <h3>对话工作区</h3>
          </div>
          <div class="inline compact">
            <label class="field slim">
              <span>Task Mode</span>
              <select id="taskMode">
                <option value="">auto</option>
                <option value="qa">qa</option>
                <option value="compare">compare</option>
                <option value="extract">extract</option>
                <option value="report">report</option>
              </select>
            </label>
            <button id="clearChat" class="ghost">清空会话</button>
          </div>
        </div>

        <div class="workbench-grid">
          <section class="response-card primary-card message-column">
            <div class="message-head">
              <p class="eyebrow">Conversation</p>
              <strong>聊天记录</strong>
            </div>
            <div id="messageList" class="message-list"></div>
          </section>

          <section class="response-card primary-card">
            <div class="response-head">
              <p class="eyebrow">Answer</p>
              <strong>当前回答</strong>
            </div>
            <div id="answerPreview" class="answer-preview markdown-body">等待发送请求...</div>
          </section>

          <section class="response-card secondary-card">
            <div class="response-head">
              <p class="eyebrow">Trace</p>
              <strong>执行过程</strong>
            </div>
            <div id="traceList" class="trace-list">
              <div class="empty-chat">发送一条消息后，这里会显示路由、规划、检索等过程。</div>
            </div>
          </section>

          <section class="response-card secondary-card composer-card">
            <div class="response-head">
              <p class="eyebrow">Prompt</p>
              <strong>提问</strong>
            </div>
            <textarea id="query" placeholder="输入问题，例如：请比较上海浦东新区两份政策通知在支持对象和支持方向上的差异，并整理成要点。"></textarea>
            <label class="field slim grow">
              <span>Metadata Filters (JSON)</span>
              <input id="metadataFilters" placeholder='{"doc_category":"policy","region":"上海"}' />
            </label>
            <div class="live-status" id="agentStatus">等待发送请求...</div>
            <div class="composer-actions">
              <button id="sendChat">发送</button>
            </div>
          </section>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Evaluation</p>
            <h3>评估与 Benchmark</h3>
          </div>
          <div class="inline compact">
            <label class="field slim">
              <span>Top K</span>
              <input id="topK" type="number" min="1" max="20" value="3" />
            </label>
            <label class="field slim">
              <span>Candidate K</span>
              <input id="candidateK" type="number" min="1" max="100" value="12" />
            </label>
            <label class="field slim">
              <span>Strategy</span>
              <select id="strategy">
                <option value="hybrid_rerank">hybrid_rerank</option>
                <option value="dense_only">dense_only</option>
                <option value="dense_rerank">dense_rerank</option>
                <option value="hybrid_only">hybrid_only</option>
              </select>
            </label>
          </div>
        </div>

        <div class="inline wrap">
          <button id="runRetrievalEval">Retrieval Eval</button>
          <button id="runCompare" class="ghost">Baseline Compare</button>
          <button id="runGenerationEval" class="ghost">Generation Eval</button>
          <button id="runBenchmark" class="ghost">System Benchmark</button>
        </div>

        <div class="dashboard-grid">
          <section class="dashboard-card">
            <div class="chart-head">
              <div>
                <p class="eyebrow">Metrics</p>
                <h4>关键指标卡片</h4>
              </div>
            </div>
            <div id="metricCards" class="metric-grid"></div>
          </section>

          <section class="dashboard-card">
            <div class="chart-head">
              <div>
                <p class="eyebrow">Compare</p>
                <h4>Baseline 柱状图</h4>
              </div>
            </div>
            <div id="compareChart" class="chart-panel empty-state">运行 Baseline Compare 后显示</div>
          </section>

          <section class="dashboard-card span-2">
            <div class="chart-head">
              <div>
                <p class="eyebrow">Latency</p>
                <h4>Benchmark 图表</h4>
              </div>
            </div>
            <div id="benchmarkChart" class="chart-panel empty-state">运行 System Benchmark 后显示</div>
          </section>
        </div>

        <pre id="evalResult" class="result-box large"></pre>
      </section>
    </main>
  </div>
`;const p=s=>document.querySelector(s),we=p("#apiBase"),W=p("#threadId");function T(s,e=4){return s==null||Number.isNaN(Number(s))?"-":Number(s).toFixed(e)}function wt(s){const e=s.trim();return e?JSON.parse(e):null}function _(s,e){s.textContent=typeof e=="string"?e:JSON.stringify(e,null,2)}function F(s,e){u.messages.push({role:s,content:e,time:new Date().toLocaleTimeString("zh-CN",{hour12:!1})}),oe()}function oe(){const s=p("#messageList");if(!u.messages.length){s.innerHTML='<div class="empty-chat">发送一条消息后，聊天记录会显示在这里。</div>';return}s.innerHTML=u.messages.map(e=>`
        <article class="message-card ${e.role}">
          <header>
            <strong>${e.role==="user"?"User":"Agent"}</strong>
            <span>${e.time}</span>
          </header>
          <div class="message-body ${e.role==="agent"?"markdown-body":""}">${e.role==="agent"?k.parse(e.content||""):ce(e.content).replace(/\n/g,"<br/>")}</div>
        </article>
      `).join("")}function ce(s){return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}function vt(s){const e=s.trim();return e?/^(🧭|🛠️|✅|🔍|📎|💡|⚙️|🚦|📌|🔀|🧠|\[[^\]]+\])/.test(e):!1}function Ie(s){const e=s.split(`
`),r=[],n=[];for(const t of e){if(vt(t)){r.push(t.trim());continue}n.push(t)}return{trace:r,answer:n.join(`
`).trim()}}function X(s){const e=p("#traceList");if(!s.length){e.innerHTML='<div class="empty-chat">等待后端返回执行过程...</div>';return}e.innerHTML=s.map((r,n)=>`
        <div class="trace-item">
          <span class="trace-step">${n+1}</span>
          <div>${ce(r)}</div>
        </div>
      `).join("")}function M(s){const e=p("#answerPreview"),r=u.activeQuestion?`<section class="answer-question"><span>本轮问题</span><strong>${ce(u.activeQuestion)}</strong></section>`:"";if(!s){e.innerHTML=`
      ${r}
      <div class="empty-chat">正在等待模型生成正文...</div>
    `;return}e.innerHTML=`
    ${r}
    <section class="answer-body">${k.parse(s)}</section>
  `}function V(){u.statusTimer&&(clearInterval(u.statusTimer),u.statusTimer=null)}function yt(){V(),u.requestStartedAt=Date.now();const s=p("#agentStatus");s.textContent="Agent 正在接收请求...",u.statusTimer=setInterval(()=>{const e=Math.round((Date.now()-u.requestStartedAt)/1e3),r=u.activeTrace[u.activeTrace.length-1];r?s.textContent=`${r} · ${e}s`:s.textContent=`Agent 正在规划 / 检索 / 生成... · ${e}s`},400)}function $t(){const s=p("#summaryCards"),e=u.latestRetrievalMetrics,r=u.latestBenchmarkMetrics,n=[{label:"最近 Recall@K",value:e?T(e.avg_recall_at_k,4):"待运行",tone:"warm"},{label:"最近 MRR",value:e?T(e.mrr,4):"待运行",tone:"teal"},{label:"复杂任务时延",value:r?`${T(r.complex_request_latency_ms,2)} ms`:"待运行",tone:"dark"}];s.innerHTML=n.map(t=>`
        <div class="metric metric-${t.tone}">
          <span>${t.label}</span>
          <strong>${t.value}</strong>
        </div>
      `).join("")}function Rt(){const s=p("#metricCards"),e=u.latestRetrievalMetrics,r=u.latestBenchmarkMetrics,n=[["Precision@K",e?.avg_precision_at_k,4],["Recall@K",e?.avg_recall_at_k,4],["MRR",e?.mrr,4],["nDCG@K",e?.ndcg_at_k,4],["Avg Query Latency",e?`${T(e.avg_query_latency_ms,2)} ms`:null,null],["Complex Latency",r?`${T(r.complex_request_latency_ms,2)} ms`:null,null]];s.innerHTML=n.map(([t,i,a])=>{const o=typeof i=="string"?i:i==null?"待运行":T(i,a||4);return`
        <div class="stat-card">
          <span>${t}</span>
          <strong>${o}</strong>
        </div>
      `}).join("")}function N(s,e,r,n="",t=4){const i=r>0?Math.max(e/r*100,4):0,a=typeof e=="number"?`${e.toFixed(t)}${n}`:e;return`
    <div class="bar-row">
      <div class="bar-meta">
        <strong>${s}</strong>
        <span>${a}</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${i}%"></div>
      </div>
    </div>
  `}function St(){const s=p("#compareChart"),e=u.latestCompareReport;if(!e?.baselines?.length){s.className="chart-panel empty-state",s.textContent="运行 Baseline Compare 后显示";return}const r=Math.max(...e.baselines.map(i=>i.avg_recall_at_k),1),n=Math.max(...e.baselines.map(i=>i.mrr),1),t=Math.max(...e.baselines.map(i=>i.avg_query_latency_ms),1);s.className="chart-panel",s.innerHTML=e.baselines.map(i=>`
        <section class="compare-card">
          <h5>${i.strategy}</h5>
          ${N("Recall",i.avg_recall_at_k,r)}
          ${N("MRR",i.mrr,n)}
          ${N("Latency",i.avg_query_latency_ms,t," ms",2)}
        </section>
      `).join("")}function Tt(){const s=p("#benchmarkChart"),e=u.latestBenchmarkMetrics;if(!e){s.className="chart-panel empty-state",s.textContent="运行 System Benchmark 后显示";return}const r=[["Retrieval Avg",e.retrieval_avg_latency_ms],["Retrieval P95",e.retrieval_p95_latency_ms],["Simple Request",e.simple_request_latency_ms],["Complex Request",e.complex_request_latency_ms]],n=Math.max(...r.map(([,t])=>t),1);s.className="chart-panel benchmark-layout",s.innerHTML=r.map(([t,i])=>N(t,i,n," ms",2)).join("")}function P(){$t(),Rt(),St(),Tt()}async function _t(s,e){if(!s.body)throw new Error("stream body not available");const r=s.body.getReader(),n=new TextDecoder("utf-8");let t="";for(;;){const{done:i,value:a}=await r.read();if(i)break;t+=n.decode(a,{stream:!0}),e.textContent=t,e.scrollTop=e.scrollHeight;const o=Ie(t);u.activeTrace=o.trace,X(o.trace),M(o.answer)}return t}async function E(s,e={}){const r=await fetch(`${u.apiBase}${s}`,{headers:{"Content-Type":"application/json",...e.headers||{}},...e});if(!r.ok){const n=await r.text();throw new Error(n||`request failed: ${r.status}`)}return r.json()}we.addEventListener("change",()=>{u.apiBase=we.value.trim()||"/api/v1",localStorage.setItem("agent-api-base",u.apiBase)});W.addEventListener("change",()=>{u.threadId=W.value.trim(),localStorage.setItem("agent-thread-id",u.threadId)});p("#regenThread").addEventListener("click",()=>{u.threadId=crypto.randomUUID(),W.value=u.threadId,localStorage.setItem("agent-thread-id",u.threadId)});p("#clearChat").addEventListener("click",()=>{u.messages=[],u.activeQuestion="",p("#answerPreview").innerHTML='<div class="empty-chat">会话已清空。</div>',p("#traceList").innerHTML='<div class="empty-chat">会话已清空。</div>',p("#agentStatus").textContent="会话已清空。",oe()});async function Be(){const s=p("#query"),e=s.value.trim();if(!e){p("#agentStatus").textContent="请输入问题。";return}u.activeQuestion=e,u.activeTrace=[],X([]),M(""),yt(),F("user",e),s.value="";try{const r=wt(p("#metadataFilters").value),n=await fetch(`${u.apiBase}/chat/agent`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:e,thread_id:u.threadId,user_id:p("#userId").value.trim(),task_mode:p("#taskMode").value||null,metadata_filters:r})});if(!n.ok)throw new Error(await n.text());const t=document.createElement("pre"),i=await _t(n,t),a=Ie(i);X(a.trace),M(a.answer),p("#agentStatus").textContent="生成完成",F("agent",a.answer||i||"空响应"),V()}catch(r){V(),p("#agentStatus").textContent=`请求失败：${r.message}`,M(`请求失败：${r.message}`),F("agent",`请求失败：${r.message}`)}}p("#sendChat").addEventListener("click",Be);p("#query").addEventListener("keydown",s=>{s.key==="Enter"&&!s.shiftKey&&(s.preventDefault(),Be())});p("#uploadKnowledge").addEventListener("click",async()=>{const s=p("#knowledgeFile").files[0],e=p("#uploadResult");if(!s){e.textContent="请先选择文件。";return}try{const r=new FormData;r.append("file",s);const t=await(await fetch(`${u.apiBase}/knowledge/upload`,{method:"POST",body:r})).json();_(e,t)}catch(r){e.textContent=`上传失败：${r.message}`}});p("#rebuildEnv").addEventListener("click",async()=>{const s=p("#rebuildResult");s.textContent="正在重建测试环境...";try{const e=await E("/testing/rebuild",{method:"POST",body:JSON.stringify({force_download:p("#forceDownload").checked,run_retrieval_eval:p("#runRetrievalEvalAfterRebuild").checked})});_(s,e),e?.result?.retrieval_eval&&(u.latestRetrievalMetrics=e.result.retrieval_eval,P())}catch(e){s.textContent=`重建失败：${e.message}`}});p("#runRetrievalEval").addEventListener("click",async()=>{const s=p("#evalResult");s.textContent="正在运行 retrieval eval...";try{const e=await E("/eval/retrieval",{method:"POST",body:JSON.stringify({top_k:Number(p("#topK").value),candidate_k:Number(p("#candidateK").value),strategy:p("#strategy").value})});_(s,e),u.latestRetrievalMetrics=e.metrics,P()}catch(e){s.textContent=`retrieval eval 失败：${e.message}`}});p("#runCompare").addEventListener("click",async()=>{const s=p("#evalResult");s.textContent="正在运行 baseline compare...";try{const e=await E("/eval/retrieval/compare",{method:"POST",body:JSON.stringify({top_k:Number(p("#topK").value),candidate_k:Number(p("#candidateK").value),strategy:p("#strategy").value})});_(s,e),u.latestCompareReport=e.report;const r=e.report?.baselines?.find(n=>n.strategy===p("#strategy").value)||e.report?.baselines?.[e.report?.baselines?.length-1];r&&(u.latestRetrievalMetrics=r),P()}catch(e){s.textContent=`compare 失败：${e.message}`}});p("#runGenerationEval").addEventListener("click",async()=>{const s=p("#evalResult");s.textContent="正在运行 generation eval...";try{const e=await E("/eval/generation",{method:"POST",body:JSON.stringify({candidate_k:Number(p("#candidateK").value)})});_(s,e)}catch(e){s.textContent=`generation eval 失败：${e.message}`}});p("#runBenchmark").addEventListener("click",async()=>{const s=p("#evalResult");s.textContent="正在运行 system benchmark...";try{const e=await E("/eval/benchmark",{method:"POST",body:JSON.stringify({candidate_k:Number(p("#candidateK").value)})});_(s,e),u.latestBenchmarkMetrics=e.metrics,P()}catch(e){s.textContent=`benchmark 失败：${e.message}`}});oe();P();
