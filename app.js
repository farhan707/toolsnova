/* ═══════════════════════════════════════════════════════
   app.js — ToolsNova shared logic
   Domain: https://toolsnova.net/
   ═══════════════════════════════════════════════════════ */

/* ── Toast ── */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg || 'Copied ✓';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}

/* ── Copy helper ── */
function copyEl(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const text = el.tagName === 'TEXTAREA' ? el.value : (el.innerText || el.textContent);
  if (!text.trim()) return;
  navigator.clipboard.writeText(text).then(() => showToast('Copied ✓'));
}

/* ── Status badge ── */
function setStatus(id, cls, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'status-badge' + (cls ? ' ' + cls : '');
  el.textContent = msg;
}

/* ════════════════════════════════════
   JSON FORMATTER
   ════════════════════════════════════ */
function syntaxHL(json) {
  json = json.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}\[\],:])/g,
    m => {
      let c = 'jn';
      if (/^"/.test(m))             c = /:$/.test(m) ? 'jk' : 'js';
      else if (/true|false/.test(m)) c = 'jb';
      else if (/null/.test(m))       c = 'jz';
      else if (/[{}\[\],:]/.test(m)) c = 'jp';
      return `<span class="${c}">${m}</span>`;
    }
  );
}
function sortObj(o) {
  if (Array.isArray(o)) return o.map(sortObj);
  if (o !== null && typeof o === 'object')
    return Object.keys(o).sort().reduce((a,k) => { a[k]=sortObj(o[k]); return a; }, {});
  return o;
}
function jsonFormat(mode) {
  const inp = document.getElementById('json-input');
  if (!inp) return;
  const raw = inp.value.trim();
  if (!raw) { jsonClear(); return; }
  try {
    const obj = JSON.parse(raw);
    const out = document.getElementById('json-output');
    if (mode === 'minify') {
      out.textContent = JSON.stringify(obj);
    } else {
      const pretty = JSON.stringify(mode === 'sort' ? sortObj(obj) : obj, null, 2);
      out.innerHTML = syntaxHL(pretty);
    }
    out.className = 'output-box success';
    inp.classList.remove('has-error');
    const labels = { format:'✓ valid JSON', minify:'✓ minified', sort:'✓ keys sorted' };
    setStatus('json-status','ok', labels[mode||'format']||'✓ valid');
  } catch(e) {
    const out = document.getElementById('json-output');
    if (out) { out.textContent = e.message; out.className = 'output-box error'; }
    inp.classList.add('has-error');
    setStatus('json-status','err','✗ ' + e.message.split('\n')[0].slice(0,40));
  }
}
function jsonLive() {
  const inp = document.getElementById('json-input');
  if (!inp) return;
  const raw = inp.value.trim();
  if (!raw) { jsonClear(); return; }
  try {
    JSON.parse(raw);
    inp.classList.remove('has-error');
    setStatus('json-status','ok','✓ valid');
    jsonFormat('format');
  } catch(e) {
    inp.classList.add('has-error');
    setStatus('json-status','err','✗ ' + e.message.split('\n')[0].slice(0,38));
    const out = document.getElementById('json-output');
    if (out) { out.textContent = e.message; out.className = 'output-box error'; }
  }
}
function jsonClear() {
  const inp = document.getElementById('json-input');
  const out = document.getElementById('json-output');
  if (inp) { inp.value=''; inp.classList.remove('has-error'); }
  if (out) { out.innerHTML=''; out.className='output-box'; }
  setStatus('json-status','','awaiting input');
}

/* ════════════════════════════════════
   BASE64
   ════════════════════════════════════ */
let b64Mode = 'encode';
function b64SetMode(mode) {
  b64Mode = mode;
  const be = document.getElementById('btn-encode');
  const bd = document.getElementById('btn-decode');
  if (be) be.className = 'toggle-btn'+(mode==='encode'?' active':'');
  if (bd) bd.className = 'toggle-btn'+(mode==='decode'?' active':'');
  const il = document.getElementById('b64-in-label');
  const ol = document.getElementById('b64-out-label');
  const ta = document.getElementById('b64-input');
  if (il) il.textContent = mode==='encode' ? 'Plain text input' : 'Base64 input';
  if (ol) ol.textContent = mode==='encode' ? 'Base64 output' : 'Decoded text';
  if (ta) ta.placeholder = mode==='encode' ? 'Type or paste text to encode…' : 'Paste Base64 string to decode…';
  b64Run();
}
function b64Run() {
  const inp = document.getElementById('b64-input');
  const out = document.getElementById('b64-output');
  if (!inp||!out) return;
  const raw = inp.value;
  if (!raw) { out.textContent=''; out.className='output-box'; setStatus('b64-status','','awaiting input'); return; }
  try {
    if (b64Mode==='encode') {
      out.textContent = btoa(unescape(encodeURIComponent(raw)));
      out.className = 'output-box success';
      setStatus('b64-status','ok','✓ encoded');
    } else {
      out.textContent = decodeURIComponent(escape(atob(raw.trim())));
      out.className = 'output-box success';
      setStatus('b64-status','ok','✓ decoded');
    }
  } catch(_) {
    out.textContent = 'Invalid Base64 — check your input';
    out.className = 'output-box error';
    setStatus('b64-status','err','✗ invalid Base64');
  }
}
function b64Swap() {
  const inp = document.getElementById('b64-input');
  const out = document.getElementById('b64-output');
  if (!inp||!out) return;
  inp.value = out.innerText||out.textContent;
  b64SetMode(b64Mode==='encode'?'decode':'encode');
}
function b64Clear() {
  const inp = document.getElementById('b64-input');
  const out = document.getElementById('b64-output');
  if (inp) inp.value='';
  if (out) { out.textContent=''; out.className='output-box'; }
  setStatus('b64-status','','awaiting input');
}

/* ════════════════════════════════════
   WORD COUNTER
   ════════════════════════════════════ */
const STOP = new Set(['the','a','an','and','or','but','in','on','at','to','for',
  'of','with','is','was','are','were','be','been','being','have','has','had',
  'do','does','did','will','would','could','should','may','might','shall','can',
  'that','this','it','i','you','he','she','we','they','my','your','his','her',
  'our','their','its','not','no','so','if','as','by','from','up','out','about']);
function wcUpdate() {
  const ta = document.getElementById('wc-text');
  if (!ta) return;
  const text = ta.value;
  const words = text.trim() ? text.trim().split(/\s+/).filter(w=>w.length>0) : [];
  const sents = text.trim() ? text.split(/[.!?]+/).filter(s=>s.trim()).length : 0;
  const paras = text.trim() ? text.split(/\n{2,}/).filter(p=>p.trim()).length||1 : 0;
  const mins  = Math.max(1, Math.round(words.length/238));
  const set = (id,v) => { const e=document.getElementById(id); if(e) e.textContent=v; };
  set('wc-words',  words.length.toLocaleString());
  set('wc-chars',  text.length.toLocaleString());
  set('wc-nospace',text.replace(/\s/g,'').length.toLocaleString());
  set('wc-sent',   sents.toLocaleString());
  set('wc-para',   paras.toLocaleString());
  set('wc-read',   mins<60 ? mins+' min' : Math.floor(mins/60)+'h '+mins%60+'m');
  const fsec = document.getElementById('freq-section');
  const flist = document.getElementById('freq-list');
  if (!fsec||!flist) return;
  if (words.length>3) {
    fsec.style.display='block';
    const freq={};
    words.forEach(w => { const c=w.toLowerCase().replace(/[^a-z0-9]/g,''); if(c.length>2&&!STOP.has(c)) freq[c]=(freq[c]||0)+1; });
    const sorted=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,10);
    const max=sorted[0]?.[1]||1;
    flist.innerHTML=sorted.map(([w,c])=>`<div class="freq-item"><span class="freq-word">${w}</span><div class="freq-bar-wrap"><div class="freq-bar" style="width:${Math.round(c/max*100)}%"></div></div><span class="freq-count">${c}</span></div>`).join('');
  } else { fsec.style.display='none'; }
}
function wcClear() { const ta=document.getElementById('wc-text'); if(ta) ta.value=''; wcUpdate(); }

/* ════════════════════════════════════
   CASE CONVERTER
   ════════════════════════════════════ */
const caseConverters = {
  upper:    s => s.toUpperCase(),
  lower:    s => s.toLowerCase(),
  title:    s => s.replace(/\w\S*/g, w => w[0].toUpperCase()+w.slice(1).toLowerCase()),
  sentence: s => s.charAt(0).toUpperCase()+s.slice(1).toLowerCase(),
  camel:    s => s.replace(/[\s_-]+(.)/g,(_,c)=>c.toUpperCase()).replace(/^./,c=>c.toLowerCase()),
  pascal:   s => s.replace(/[\s_-]+(.)/g,(_,c)=>c.toUpperCase()).replace(/^./,c=>c.toUpperCase()),
  snake:    s => s.trim().replace(/[\s-]+/g,'_').replace(/([a-z])([A-Z])/g,'$1_$2').toLowerCase(),
  kebab:    s => s.trim().replace(/[\s_]+/g,'-').replace(/([a-z])([A-Z])/g,'$1-$2').toLowerCase(),
};
function caseConvert(type) {
  const inp = document.getElementById('case-input');
  const out = document.getElementById('case-output');
  if (!inp||!out) return;
  const raw = inp.value;
  if (!raw.trim()) { out.textContent=''; out.className='output-box'; return; }
  const fn = caseConverters[type];
  out.textContent = fn ? fn(raw) : raw;
  out.className = 'output-box success';
  setStatus('case-status','ok','✓ '+type);
}
function caseClear() {
  const inp=document.getElementById('case-input');
  const out=document.getElementById('case-output');
  if (inp) inp.value='';
  if (out) { out.textContent=''; out.className='output-box'; }
  setStatus('case-status','ok','select a case');
}

/* ════════════════════════════════════
   PASSWORD GENERATOR
   ════════════════════════════════════ */
function pwdGenerate() {
  const len   = parseInt(document.getElementById('pwd-length')?.value||20);
  const upper = document.getElementById('pwd-upper')?.checked ?? true;
  const lower = document.getElementById('pwd-lower')?.checked ?? true;
  const nums  = document.getElementById('pwd-numbers')?.checked ?? true;
  const syms  = document.getElementById('pwd-symbols')?.checked ?? true;
  const noamb = document.getElementById('pwd-noambig')?.checked ?? false;
  const AMBIG = 'O0Il1';
  let chars = '';
  if (upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lower) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (nums)  chars += '0123456789';
  if (syms)  chars += '!@#$%^&*()-_=+[]{}|;:,.<>?';
  if (noamb) chars = chars.split('').filter(c=>!AMBIG.includes(c)).join('');
  const out = document.getElementById('pwd-output');
  if (!chars) { if(out) out.textContent='Select at least one character type'; return; }
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  const pwd = Array.from(arr, v=>chars[v%chars.length]).join('');
  if (out) out.textContent = pwd;
  pwdStrength(pwd);
}
function pwdStrength(pwd) {
  const bar   = document.getElementById('pwd-strength-bar');
  const label = document.getElementById('pwd-strength-label');
  if (!bar||!label) return;
  let score = 0;
  if (pwd.length>=8)  score++;
  if (pwd.length>=12) score++;
  if (pwd.length>=16) score++;
  if (pwd.length>=20) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const levels = [
    {pct:10,color:'#ff6b6b',text:'very weak'},
    {pct:25,color:'#ff9f6b',text:'weak'},
    {pct:45,color:'#ffca6b',text:'fair'},
    {pct:65,color:'#a8e6a3',text:'good'},
    {pct:80,color:'#7fff6f',text:'strong'},
    {pct:100,color:'#7fff6f',text:'very strong'},
  ];
  const lvl = levels[Math.min(score, levels.length-1)];
  bar.style.width   = lvl.pct+'%';
  bar.style.background = lvl.color;
  label.textContent = lvl.text;
  label.style.color = lvl.color;
}
function pwdLenUpdate() {
  const v = document.getElementById('pwd-length')?.value;
  const d = document.getElementById('pwd-len-display');
  if (d) d.textContent = v;
  pwdGenerate();
}
function pwdCopy() { 
  const out = document.getElementById('pwd-output');
  if (!out||!out.textContent.trim()) return;
  navigator.clipboard.writeText(out.textContent).then(()=>showToast('Password copied ✓'));
}

/* ════════════════════════════════════
   TIMESTAMP CONVERTER
   ════════════════════════════════════ */
function tsNow() {
  const inp = document.getElementById('ts-unix');
  if (inp) inp.value = Math.floor(Date.now()/1000);
  tsFromUnix();
}
function tsFromUnix() {
  const raw  = document.getElementById('ts-unix')?.value.trim();
  const out  = document.getElementById('ts-human');
  const diff = document.getElementById('ts-diff');
  if (!out) return;
  if (!raw) { out.textContent=''; out.className='output-box'; return; }
  const ms = raw.length>11 ? parseInt(raw) : parseInt(raw)*1000;
  if (isNaN(ms)) { out.textContent='Invalid timestamp'; out.className='output-box error'; return; }
  const d  = new Date(ms);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  out.className = 'output-box success';
  out.textContent =
    `UTC:       ${d.toUTCString()}\n`+
    `ISO 8601:  ${d.toISOString()}\n`+
    `Local (${tz}):\n           ${d.toLocaleString('en-US',{dateStyle:'full',timeStyle:'long'})}\n`+
    `Unix ms:   ${ms}\n`+
    `Unix sec:  ${Math.floor(ms/1000)}`;
  if (diff) {
    const secs = Math.floor((Date.now()-ms)/1000);
    const abs = Math.abs(secs);
    const future = secs<0;
    let rel;
    if      (abs<60)    rel = abs+'s';
    else if (abs<3600)  rel = Math.floor(abs/60)+'m '+abs%60+'s';
    else if (abs<86400) rel = Math.floor(abs/3600)+'h '+Math.floor((abs%3600)/60)+'m';
    else                rel = Math.floor(abs/86400)+'d '+Math.floor((abs%86400)/3600)+'h';
    diff.textContent = (future?'in ':'')+rel+(future?'':' ago');
  }
}
function tsFromHuman() {
  const raw = document.getElementById('ts-human-inp')?.value.trim();
  const out = document.getElementById('ts-unix-out');
  if (!out) return;
  if (!raw) { out.textContent=''; out.className='output-box'; return; }
  const d = new Date(raw);
  if (isNaN(d.getTime())) { out.textContent='Cannot parse date — try: 2024-01-15 or Jan 15 2024 12:00:00 UTC'; out.className='output-box error'; return; }
  out.className = 'output-box success';
  out.textContent =
    `Unix (sec):  ${Math.floor(d.getTime()/1000)}\n`+
    `Unix (ms):   ${d.getTime()}\n`+
    `ISO 8601:    ${d.toISOString()}`;
}
function tsClear() {
  ['ts-unix','ts-human-inp'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  ['ts-human','ts-unix-out'].forEach(id=>{const e=document.getElementById(id);if(e){e.textContent='';e.className='output-box';}});
  const d=document.getElementById('ts-diff');if(d)d.textContent='';
}

/* ════════════════════════════════════
   LOREM IPSUM GENERATOR
   ════════════════════════════════════ */
const LOREM_WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum pellentesque habitant morbi tristique senectus et netus malesuada fames ac turpis egestas vestibulum tortor quam feugiat vitae ultricies eget tempor ante maecenas mollis diam praesent commodo cursus magna scelerisque nisl cras mattis purus fermentum'.split(' ');
function _lWord() { return LOREM_WORDS[Math.floor(Math.random()*LOREM_WORDS.length)]; }
function _lSentence(n) {
  const wc = n||(6+Math.floor(Math.random()*14));
  return Array.from({length:wc},(_,i)=>i===0?_lWord().replace(/^./,c=>c.toUpperCase()):_lWord()).join(' ')+'.';
}
function _lPara(n) {
  const sc = n||(3+Math.floor(Math.random()*4));
  return Array.from({length:sc},()=>_lSentence()).join(' ');
}
function loremGenerate() {
  const type  = document.getElementById('lorem-type')?.value||'paragraphs';
  const count = parseInt(document.getElementById('lorem-count')?.value||3);
  const start = document.getElementById('lorem-start')?.checked??true;
  const out   = document.getElementById('lorem-output');
  if (!out) return;
  let result='';
  if (type==='words') {
    const words = Array.from({length:count},(_,i)=>i===0&&start?'Lorem':_lWord());
    result = words.join(' ')+'.';
  } else if (type==='sentences') {
    result = Array.from({length:count},(_,i)=>(i===0&&start)?'Lorem ipsum dolor sit amet.':_lSentence()).join(' ');
  } else {
    result = Array.from({length:count},(_,i)=>(i===0&&start)?'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '+_lPara():_lPara()).join('\n\n');
  }
  out.textContent = result;
  out.className = 'output-box success';
  const wc = document.getElementById('lorem-wc');
  if (wc) wc.textContent = result.trim().split(/\s+/).length+' words';
}
function loremCountUpdate() {
  const v=document.getElementById('lorem-count')?.value;
  const d=document.getElementById('lorem-count-display');
  if(d) d.textContent=v;
  loremGenerate();
}

/* ════════════════════════════════════
   URL ENCODER / DECODER
   ════════════════════════════════════ */
let urlMode = 'encode';
function urlSetMode(mode) {
  urlMode = mode;
  const be=document.getElementById('url-btn-encode');
  const bd=document.getElementById('url-btn-decode');
  if(be) be.className='toggle-btn'+(mode==='encode'?' active':'');
  if(bd) bd.className='toggle-btn'+(mode==='decode'?' active':'');
  const il=document.getElementById('url-in-label');
  const ol=document.getElementById('url-out-label');
  const ta=document.getElementById('url-input');
  if(il) il.textContent=mode==='encode'?'Plain URL / text input':'URL-encoded input';
  if(ol) ol.textContent=mode==='encode'?'URL-encoded output':'Decoded output';
  if(ta) ta.placeholder=mode==='encode'?'https://example.com/search?q=hello world&lang=en':'Paste URL-encoded string to decode…';
  urlRun();
}
function urlRun() {
  const inp=document.getElementById('url-input');
  const out=document.getElementById('url-output');
  if(!inp||!out) return;
  const raw=inp.value;
  if(!raw.trim()){out.textContent='';out.className='output-box';setStatus('url-status','','awaiting input');return;}
  try {
    if(urlMode==='encode'){
      out.textContent=raw.replace(/[^A-Za-z0-9\-_.~:/?#[\]@!$&'()*+,;=%]/g,c=>encodeURIComponent(c));
      out.className='output-box success';setStatus('url-status','ok','✓ encoded');
    } else {
      out.textContent=decodeURIComponent(raw);
      out.className='output-box success';setStatus('url-status','ok','✓ decoded');
    }
  } catch(_){
    out.textContent='Invalid URL-encoded string';
    out.className='output-box error';setStatus('url-status','err','✗ decode error');
  }
}
function urlSwap() {
  const inp=document.getElementById('url-input');
  const out=document.getElementById('url-output');
  if(!inp||!out) return;
  inp.value=out.innerText||out.textContent;
  urlSetMode(urlMode==='encode'?'decode':'encode');
}
function urlClear() {
  const inp=document.getElementById('url-input');
  const out=document.getElementById('url-output');
  if(inp) inp.value='';
  if(out){out.textContent='';out.className='output-box';}
  setStatus('url-status','','awaiting input');
}

/* ════════════════════════════════════
   UUID GENERATOR
   ════════════════════════════════════ */
function uuidGenerate(n) {
  const count = n || parseInt(document.getElementById('uuid-count')?.value||1);
  const fmt   = document.getElementById('uuid-fmt')?.value||'v4';
  const out   = document.getElementById('uuid-output');
  if (!out) return;
  const uuids = Array.from({length:count}, () => {
    if (fmt==='v4') {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const arr=new Uint8Array(1); crypto.getRandomValues(arr);
        const r=arr[0]%16, v=c==='x'?r:(r&0x3|0x8);
        return v.toString(16);
      });
    } else if (fmt==='no-dash') {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy-]/g, c => {
        if(c==='-') return '';
        const arr=new Uint8Array(1); crypto.getRandomValues(arr);
        const r=arr[0]%16, v=c==='x'?r:(r&0x3|0x8);
        return v.toString(16);
      });
    } else if (fmt==='upper') {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const arr=new Uint8Array(1); crypto.getRandomValues(arr);
        const r=arr[0]%16, v=c==='x'?r:(r&0x3|0x8);
        return v.toString(16).toUpperCase();
      });
    }
  });
  out.textContent = uuids.join('\n');
  out.className = 'output-box success';
  const wc = document.getElementById('uuid-count-display');
  if (wc) wc.textContent = count+' UUID'+(count>1?'s':'');
}
function uuidCountUpdate() {
  const v=document.getElementById('uuid-count')?.value;
  const d=document.getElementById('uuid-count-display');
  if(d) d.textContent=v+' UUID'+(v>1?'s':'');
}

/* ════════════════════════════════════
   HASH GENERATOR
   ════════════════════════════════════ */
async function hashGenerate() {
  const inp = document.getElementById('hash-input');
  if (!inp) return;
  const text = inp.value;
  if (!text) { ['md5-out','sha1-out','sha256-out','sha512-out'].forEach(id=>{const e=document.getElementById(id);if(e){e.textContent='';e.className='output-box';}}); return; }
  const encoder = new TextEncoder();
  const data    = encoder.encode(text);
  const algos   = [['SHA-1','sha1-out'],['SHA-256','sha256-out'],['SHA-512','sha512-out']];
  for (const [algo,id] of algos) {
    const buf    = await crypto.subtle.digest(algo, data);
    const hex    = Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
    const el     = document.getElementById(id);
    if (el) { el.textContent=hex; el.className='output-box success'; }
  }
  // MD5 polyfill (simple implementation)
  const md5el = document.getElementById('md5-out');
  if (md5el) { md5el.textContent = simpleMD5(text); md5el.className='output-box success'; }
}
function simpleMD5(str) {
  // Lightweight MD5 for display purposes
  function safeAdd(x,y){const lsw=(x&0xffff)+(y&0xffff);return((x>>16)+(y>>16)+(lsw>>16))<<16|lsw&0xffff;}
  function bitRotateLeft(num,cnt){return num<<cnt|num>>>32-cnt;}
  function md5cmn(q,a,b,x,s,t){return safeAdd(bitRotateLeft(safeAdd(safeAdd(a,q),safeAdd(x,t)),s),b);}
  function md5ff(a,b,c,d,x,s,t){return md5cmn(b&c|~b&d,a,b,x,s,t);}
  function md5gg(a,b,c,d,x,s,t){return md5cmn(b&d|c&~d,a,b,x,s,t);}
  function md5hh(a,b,c,d,x,s,t){return md5cmn(b^c^d,a,b,x,s,t);}
  function md5ii(a,b,c,d,x,s,t){return md5cmn(c^(b|~d),a,b,x,s,t);}
  const m=[];let i,s8=unescape(encodeURIComponent(str));
  const len8=s8.length,l=[];
  for(i=0;i<len8;i+=4)l[i>>2]=s8.charCodeAt(i)|(s8.charCodeAt(i+1)<<8)|(s8.charCodeAt(i+2)<<16)|(s8.charCodeAt(i+3)<<24);
  l[len8>>2]|=0x80<<(len8%4*8);l[(((len8+64)>>>9)<<4)+14]=len8*8;
  let a=1732584193,b=-271733879,c=-1732584194,d=271733878;
  for(i=0;i<l.length;i+=16){
    const [oa,ob,oc,od]=[a,b,c,d];
    a=md5ff(a,b,c,d,l[i],7,-680876936);d=md5ff(d,a,b,c,l[i+1],12,-389564586);c=md5ff(c,d,a,b,l[i+2],17,606105819);b=md5ff(b,c,d,a,l[i+3],22,-1044525330);
    a=md5ff(a,b,c,d,l[i+4],7,-176418897);d=md5ff(d,a,b,c,l[i+5],12,1200080426);c=md5ff(c,d,a,b,l[i+6],17,-1473231341);b=md5ff(b,c,d,a,l[i+7],22,-45705983);
    a=md5ff(a,b,c,d,l[i+8],7,1770035416);d=md5ff(d,a,b,c,l[i+9],12,-1958414417);c=md5ff(c,d,a,b,l[i+10],17,-42063);b=md5ff(b,c,d,a,l[i+11],22,-1990404162);
    a=md5ff(a,b,c,d,l[i+12],7,1804603682);d=md5ff(d,a,b,c,l[i+13],12,-40341101);c=md5ff(c,d,a,b,l[i+14],17,-1502002290);b=md5ff(b,c,d,a,l[i+15],22,1236535329);
    a=md5gg(a,b,c,d,l[i+1],5,-165796510);d=md5gg(d,a,b,c,l[i+6],9,-1069501632);c=md5gg(c,d,a,b,l[i+11],14,643717713);b=md5gg(b,c,d,a,l[i],20,-373897302);
    a=md5gg(a,b,c,d,l[i+5],5,-701558691);d=md5gg(d,a,b,c,l[i+10],9,38016083);c=md5gg(c,d,a,b,l[i+15],14,-660478335);b=md5gg(b,c,d,a,l[i+4],20,-405537848);
    a=md5gg(a,b,c,d,l[i+9],5,568446438);d=md5gg(d,a,b,c,l[i+14],9,-1019803690);c=md5gg(c,d,a,b,l[i+3],14,-187363961);b=md5gg(b,c,d,a,l[i+8],20,1163531501);
    a=md5gg(a,b,c,d,l[i+13],5,-1444681467);d=md5gg(d,a,b,c,l[i+2],9,-51403784);c=md5gg(c,d,a,b,l[i+7],14,1735328473);b=md5gg(b,c,d,a,l[i+12],20,-1926607734);
    a=md5hh(a,b,c,d,l[i+5],4,-378558);d=md5hh(d,a,b,c,l[i+8],11,-2022574463);c=md5hh(c,d,a,b,l[i+11],16,1839030562);b=md5hh(b,c,d,a,l[i+14],23,-35309556);
    a=md5hh(a,b,c,d,l[i+1],4,-1530992060);d=md5hh(d,a,b,c,l[i+4],11,1272893353);c=md5hh(c,d,a,b,l[i+7],16,-155497632);b=md5hh(b,c,d,a,l[i+10],23,-1094730640);
    a=md5hh(a,b,c,d,l[i+13],4,681279174);d=md5hh(d,a,b,c,l[i],11,-358537222);c=md5hh(c,d,a,b,l[i+3],16,-722521979);b=md5hh(b,c,d,a,l[i+6],23,76029189);
    a=md5hh(a,b,c,d,l[i+9],4,-640364487);d=md5hh(d,a,b,c,l[i+12],11,-421815835);c=md5hh(c,d,a,b,l[i+15],16,530742520);b=md5hh(b,c,d,a,l[i+2],23,-995338651);
    a=md5ii(a,b,c,d,l[i],6,-198630844);d=md5ii(d,a,b,c,l[i+7],10,1126891415);c=md5ii(c,d,a,b,l[i+14],15,-1416354905);b=md5ii(b,c,d,a,l[i+5],21,-57434055);
    a=md5ii(a,b,c,d,l[i+12],6,1700485571);d=md5ii(d,a,b,c,l[i+3],10,-1894986606);c=md5ii(c,d,a,b,l[i+10],15,-1051523);b=md5ii(b,c,d,a,l[i+1],21,-2054922799);
    a=md5ii(a,b,c,d,l[i+8],6,1873313359);d=md5ii(d,a,b,c,l[i+15],10,-30611744);c=md5ii(c,d,a,b,l[i+6],15,-1560198380);b=md5ii(b,c,d,a,l[i+13],21,1309151649);
    a=md5ii(a,b,c,d,l[i+4],6,-145523070);d=md5ii(d,a,b,c,l[i+11],10,-1120210379);c=md5ii(c,d,a,b,l[i+2],15,718787259);b=md5ii(b,c,d,a,l[i+9],21,-343485551);
    a=safeAdd(a,oa);b=safeAdd(b,ob);c=safeAdd(c,oc);d=safeAdd(d,od);
  }
  return [a,b,c,d].map(n=>(n<0?n+0x100000000:n).toString(16).padStart(8,'0')).join('').replace(/(..)/g,(_,p)=>p).split('').reverse().join('').replace(/(....)/g,m=>m.split('').reverse().join(''));
}
function hashClear() {
  const inp=document.getElementById('hash-input');
  if(inp) inp.value='';
  ['md5-out','sha1-out','sha256-out','sha512-out'].forEach(id=>{const e=document.getElementById(id);if(e){e.textContent='';e.className='output-box';}});
}

/* ════════════════════════════════════
   CALCULATORS (Age, BMI, Percentage)
   ════════════════════════════════════ */
function calcAge() {
  const dob = document.getElementById('age-dob')?.value;
  const out = document.getElementById('age-output');
  if (!out) return;
  if (!dob) { out.textContent=''; out.className='output-box'; return; }
  const birth = new Date(dob);
  const today = new Date();
  if (isNaN(birth) || birth>today) { out.textContent='Please enter a valid past date.'; out.className='output-box error'; return; }
  let years=today.getFullYear()-birth.getFullYear();
  let months=today.getMonth()-birth.getMonth();
  let days=today.getDate()-birth.getDate();
  if(days<0){months--;days+=new Date(today.getFullYear(),today.getMonth(),0).getDate();}
  if(months<0){years--;months+=12;}
  const totalDays=Math.floor((today-birth)/86400000);
  const next=new Date(today.getFullYear(),birth.getMonth(),birth.getDate());
  if(next<today) next.setFullYear(today.getFullYear()+1);
  const daysToNext=Math.round((next-today)/86400000);
  out.className='output-box success';
  out.textContent=`Age:          ${years} years, ${months} months, ${days} days\nTotal days:   ${totalDays.toLocaleString()}\nNext birthday: in ${daysToNext} day${daysToNext!==1?'s':''}`;
}

function calcBMI() {
  const unit   = document.getElementById('bmi-unit')?.value||'metric';
  const out    = document.getElementById('bmi-output');
  if (!out) return;
  let weight, height;
  if (unit==='metric') {
    weight = parseFloat(document.getElementById('bmi-weight')?.value);
    height = parseFloat(document.getElementById('bmi-height')?.value)/100;
  } else {
    const lbs = parseFloat(document.getElementById('bmi-weight')?.value);
    const ft  = parseFloat(document.getElementById('bmi-ft')?.value||0);
    const inc = parseFloat(document.getElementById('bmi-in')?.value||0);
    weight = lbs*0.453592;
    height = (ft*12+inc)*0.0254;
  }
  if (!weight||!height||height<=0||weight<=0) { out.textContent='Enter valid weight and height.'; out.className='output-box error'; return; }
  const bmi = weight/(height*height);
  let cat='', tip='';
  if      (bmi<18.5) { cat='Underweight'; tip='Consider speaking with a healthcare provider about healthy weight goals.'; }
  else if (bmi<25)   { cat='Normal weight'; tip='Great! Maintain your healthy weight through balanced diet and exercise.'; }
  else if (bmi<30)   { cat='Overweight'; tip='Consider increasing physical activity and reviewing dietary habits.'; }
  else               { cat='Obese'; tip='Consult a healthcare provider for personalised guidance.'; }
  out.className='output-box success';
  out.textContent=`BMI:      ${bmi.toFixed(1)}\nCategory: ${cat}\n\nNote: ${tip}\n\nBMI Scale:\n< 18.5   Underweight\n18.5–24.9 Normal\n25–29.9  Overweight\n≥ 30     Obese`;
}
function bmiUnitSwitch() {
  const unit=document.getElementById('bmi-unit')?.value;
  const metric=document.getElementById('bmi-metric-fields');
  const imperial=document.getElementById('bmi-imperial-fields');
  if(metric)  metric.style.display=unit==='metric'?'flex':'none';
  if(imperial)imperial.style.display=unit==='imperial'?'flex':'none';
}

function calcPct() {
  const mode = document.getElementById('pct-mode')?.value||'pct-of';
  const a    = parseFloat(document.getElementById('pct-a')?.value);
  const b    = parseFloat(document.getElementById('pct-b')?.value);
  const out  = document.getElementById('pct-output');
  if (!out) return;
  if (isNaN(a)||isNaN(b)) { out.textContent='Enter both values.'; out.className='output-box error'; return; }
  let result='', label='';
  if      (mode==='pct-of')    { result=(a/100*b).toFixed(4); label=`${a}% of ${b} = ${parseFloat(result)}`; }
  else if (mode==='what-pct')  { result=(a/b*100).toFixed(4); label=`${a} is ${parseFloat(result)}% of ${b}`; }
  else if (mode==='pct-change'){ result=((b-a)/Math.abs(a)*100).toFixed(4); label=`Change from ${a} to ${b} = ${parseFloat(result)}%`; }
  else if (mode==='add-pct')   { result=(a*(1+b/100)).toFixed(4); label=`${a} + ${b}% = ${parseFloat(result)}`; }
  else if (mode==='sub-pct')   { result=(a*(1-b/100)).toFixed(4); label=`${a} − ${b}% = ${parseFloat(result)}`; }
  out.className='output-box success';
  out.textContent=label;
}

/* ════════════════════════════════════
   FINANCE — EMI CALCULATOR
   ════════════════════════════════════ */
function calcEMI() {
  const P = parseFloat(document.getElementById('emi-principal')?.value);
  const r = parseFloat(document.getElementById('emi-rate')?.value)/100/12;
  const n = parseFloat(document.getElementById('emi-tenure')?.value);
  const tenureType = document.getElementById('emi-tenure-type')?.value||'months';
  const out = document.getElementById('emi-output');
  if (!out) return;
  const months = tenureType==='years' ? n*12 : n;
  if (!P||!r||!months||P<=0||r<=0||months<=0) { out.textContent='Enter valid loan details.'; out.className='output-box error'; return; }
  const emi = P*r*Math.pow(1+r,months)/(Math.pow(1+r,months)-1);
  const totalAmt = emi*months;
  const totalInt = totalAmt-P;
  out.className='output-box success';
  out.textContent=
    `Monthly EMI:       ${formatCur(emi)}\nTotal Amount:      ${formatCur(totalAmt)}\nTotal Interest:    ${formatCur(totalInt)}\nPrincipal:         ${formatCur(P)}\n\nInterest %:        ${(totalInt/P*100).toFixed(2)}% of principal`;
  renderAmortChart('emi-chart', P, totalInt);
}

/* ════════════════════════════════════
   FINANCE — SIP CALCULATOR
   ════════════════════════════════════ */
function calcSIP() {
  const P   = parseFloat(document.getElementById('sip-amount')?.value);
  const r   = parseFloat(document.getElementById('sip-rate')?.value)/100/12;
  const n   = parseFloat(document.getElementById('sip-tenure')?.value)*12;
  const out = document.getElementById('sip-output');
  if (!out) return;
  if (!P||!r||!n||P<=0||n<=0) { out.textContent='Enter valid SIP details.'; out.className='output-box error'; return; }
  const fv        = P*(Math.pow(1+r,n)-1)/r*(1+r);
  const invested  = P*n;
  const returns   = fv-invested;
  out.className='output-box success';
  out.textContent=
    `Future Value:      ${formatCur(fv)}\nTotal Invested:    ${formatCur(invested)}\nTotal Returns:     ${formatCur(returns)}\nReturn %:          ${(returns/invested*100).toFixed(2)}%\n\nMonthly SIP:       ${formatCur(P)}\nTenure:            ${n/12} years (${n} months)`;
  renderAmortChart('sip-chart', invested, returns);
}

/* ════════════════════════════════════
   FINANCE — COMPOUND INTEREST
   ════════════════════════════════════ */
function calcCI() {
  const P  = parseFloat(document.getElementById('ci-principal')?.value);
  const r  = parseFloat(document.getElementById('ci-rate')?.value)/100;
  const t  = parseFloat(document.getElementById('ci-time')?.value);
  const n  = parseInt(document.getElementById('ci-freq')?.value||12);
  const out= document.getElementById('ci-output');
  if (!out) return;
  if (!P||!r||!t||P<=0||t<=0) { out.textContent='Enter valid values.'; out.className='output-box error'; return; }
  const A  = P*Math.pow(1+r/n, n*t);
  const ci = A-P;
  out.className='output-box success';
  out.textContent=
    `Final Amount:      ${formatCur(A)}\nCompound Interest: ${formatCur(ci)}\nPrincipal:         ${formatCur(P)}\nRate of Return:    ${(ci/P*100).toFixed(2)}%`;
  renderAmortChart('ci-chart', P, ci);
}

/* ════════════════════════════════════
   TRADING CALCULATORS
   ════════════════════════════════════ */
function calcLotSize() {
  const balance    = parseFloat(document.getElementById('ls-balance')?.value);
  const riskPct    = parseFloat(document.getElementById('ls-risk')?.value);
  const entry      = parseFloat(document.getElementById('ls-entry')?.value);
  const sl         = parseFloat(document.getElementById('ls-sl')?.value);
  const pipVal     = parseFloat(document.getElementById('ls-pipval')?.value||10);
  const out        = document.getElementById('ls-output');
  if (!out) return;
  if (!balance||!riskPct||!entry||!sl) { out.textContent='Enter all fields.'; out.className='output-box error'; return; }
  const riskAmt   = balance*riskPct/100;
  const slPips    = Math.abs(entry-sl);
  const lots      = riskAmt/(slPips*pipVal);
  const units     = lots*100000;
  out.className='output-box success';
  out.textContent=
    `Risk Amount:    $${riskAmt.toFixed(2)}\nStop Loss Pips: ${slPips.toFixed(1)} pips\nLot Size:       ${lots.toFixed(4)} lots\nUnits:          ${Math.round(units).toLocaleString()}\n\nMax Loss:       $${riskAmt.toFixed(2)} (${riskPct}% of balance)`;
}

function calcRR() {
  const entry  = parseFloat(document.getElementById('rr-entry')?.value);
  const sl     = parseFloat(document.getElementById('rr-sl')?.value);
  const tp     = parseFloat(document.getElementById('rr-tp')?.value);
  const size   = parseFloat(document.getElementById('rr-size')?.value||1);
  const out    = document.getElementById('rr-output');
  if (!out) return;
  if (!entry||!sl||!tp) { out.textContent='Enter entry, stop loss, and take profit.'; out.className='output-box error'; return; }
  const risk   = Math.abs(entry-sl)*size;
  const reward = Math.abs(tp-entry)*size;
  const rr     = reward/risk;
  const minWin = 1/(1+rr)*100;
  out.className='output-box success';
  out.textContent=
    `Risk:           $${risk.toFixed(2)}\nReward:         $${reward.toFixed(2)}\nR:R Ratio:      1 : ${rr.toFixed(2)}\n\nBreakeven Win%: ${minWin.toFixed(1)}% (to be profitable)\n\nEntry:    ${entry}\nStop:     ${sl} (${Math.abs(entry-sl).toFixed(4)} away)\nTarget:   ${tp} (${Math.abs(tp-entry).toFixed(4)} away)`;
}

function calcDrawdown() {
  const balance  = parseFloat(document.getElementById('dd-balance')?.value);
  const drawdown = parseFloat(document.getElementById('dd-pct')?.value);
  const out      = document.getElementById('dd-output');
  if (!out) return;
  if (!balance||!drawdown) { out.textContent='Enter balance and drawdown %.'; out.className='output-box error'; return; }
  const loss      = balance*drawdown/100;
  const remaining = balance-loss;
  const recovery  = loss/remaining*100;
  out.className='output-box success';
  out.textContent=
    `Starting Balance: $${balance.toLocaleString()}\nDrawdown:         ${drawdown}% = $${loss.toFixed(2)}\nRemaining:        $${remaining.toFixed(2)}\n\nRecovery Needed:  ${recovery.toFixed(2)}% gain to break even\n\nRule of thumb: A 50% drawdown requires 100% gain to recover.`;
}

function calcMargin() {
  const price  = parseFloat(document.getElementById('mg-price')?.value);
  const lots   = parseFloat(document.getElementById('mg-lots')?.value);
  const lev    = parseFloat(document.getElementById('mg-leverage')?.value||100);
  const contr  = parseFloat(document.getElementById('mg-contract')?.value||100000);
  const out    = document.getElementById('mg-output');
  if (!out) return;
  if (!price||!lots||!lev) { out.textContent='Enter all fields.'; out.className='output-box error'; return; }
  const notional = lots*contr*price;
  const margin   = notional/lev;
  out.className='output-box success';
  out.textContent=
    `Required Margin:  $${margin.toFixed(2)}\nNotional Value:   $${notional.toFixed(2)}\nLeverage:         1:${lev}\n\nLots:     ${lots}\nPrice:    ${price}\nContract: ${contr.toLocaleString()} units`;
}

function calcGoldPos() {
  const balance  = parseFloat(document.getElementById('gp-balance')?.value);
  const riskPct  = parseFloat(document.getElementById('gp-risk')?.value);
  const entry    = parseFloat(document.getElementById('gp-entry')?.value);
  const sl       = parseFloat(document.getElementById('gp-sl')?.value);
  const out      = document.getElementById('gp-output');
  if (!out) return;
  if (!balance||!riskPct||!entry||!sl) { out.textContent='Enter all fields.'; out.className='output-box error'; return; }
  const riskAmt  = balance*riskPct/100;
  const slDist   = Math.abs(entry-sl);
  // Gold: 1 lot = 100 troy oz; pip value ≈ $1 per 0.01 move per oz = $100 per lot per $1 move
  const lotSize  = riskAmt/(slDist*100);
  const oz       = lotSize*100;
  out.className='output-box success';
  out.textContent=
    `Risk Amount:    $${riskAmt.toFixed(2)}\nSL Distance:    $${slDist.toFixed(2)} per oz\nPosition Size:  ${lotSize.toFixed(4)} lots\nOunces:         ${oz.toFixed(2)} oz\n\nEntry:          $${entry}\nStop Loss:      $${sl}\nMax Loss:       $${riskAmt.toFixed(2)}`;
}

/* ── Shared helpers ── */
function formatCur(n) {
  return n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
}
function renderAmortChart(id, principal, interest) {
  const el = document.getElementById(id);
  if (!el) return;
  const total = principal+interest;
  const pPct  = (principal/total*100).toFixed(1);
  const iPct  = (interest/total*100).toFixed(1);
  el.innerHTML=`
    <div style="margin-top:8px">
      <div style="font-size:.62rem;color:var(--text3);letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px">Principal vs Interest</div>
      <div style="height:8px;border-radius:4px;overflow:hidden;display:flex;gap:2px">
        <div style="width:${pPct}%;background:#7fff6f;border-radius:4px 0 0 4px"></div>
        <div style="width:${iPct}%;background:#ff6b6b;border-radius:0 4px 4px 0"></div>
      </div>
      <div style="display:flex;gap:16px;margin-top:6px;font-size:.7rem;color:var(--text3)">
        <span><span style="color:#7fff6f">■</span> Principal ${pPct}%</span>
        <span><span style="color:#ff6b6b">■</span> Interest ${iPct}%</span>
      </div>
    </div>`;
}

/* ── Global keyboard shortcuts ── */
document.addEventListener('keydown', e => {
  if ((e.ctrlKey||e.metaKey)&&e.key==='Enter') {
    if (document.getElementById('json-input'))  jsonFormat('format');
    if (document.getElementById('b64-input'))   b64Run();
    if (document.getElementById('url-input'))   urlRun();
    if (document.getElementById('hash-input'))  hashGenerate();
  }
});

/* ── Percentage label update ── */
function updatePctLabels() {
  const mode = document.getElementById('pct-mode')?.value||'pct-of';
  const al = document.getElementById('pct-a-label');
  const bl = document.getElementById('pct-b-label');
  const labels = {
    'pct-of':    ['X (percentage)','Y (number)'],
    'what-pct':  ['X (value)','Y (total)'],
    'pct-change':['X (from)','Y (to)'],
    'add-pct':   ['Y (base number)','X (% to add)'],
    'sub-pct':   ['Y (base number)','X (% to subtract)'],
  };
  const [a,b] = labels[mode]||['A','B'];
  if(al) al.textContent=a;
  if(bl) bl.textContent=b;
  // swap inputs for add/sub modes
  if(mode==='add-pct'||mode==='sub-pct'){
    const ia=document.getElementById('pct-a');
    const ib=document.getElementById('pct-b');
    if(ia) ia.placeholder='200';
    if(ib) ib.placeholder='10';
  }
  calcPct();
}

/* ════════════════════════════════════
   MOBILE NAV TOGGLE
   ════════════════════════════════════ */
function navToggle() {
  const nav = document.querySelector('.site-nav');
  if (nav) nav.classList.toggle('open');
}
// Close nav on outside click
document.addEventListener('click', e => {
  const nav = document.querySelector('.site-nav');
  const btn = document.querySelector('.nav-toggle');
  if (nav && btn && !nav.contains(e.target) && !btn.contains(e.target)) {
    nav.classList.remove('open');
  }
});

/* ════════════════════════════════════
   FAQ ACCORDION
   ════════════════════════════════════ */
function faqToggle(el) {
  const item = el.closest('.faq-item');
  if (!item) return;
  const isOpen = item.classList.contains('open');
  // close all in this section
  item.closest('.faq-section')?.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

/* ════════════════════════════════════
   REGEX TESTER
   ════════════════════════════════════ */
function regexRun() {
  const patternEl = document.getElementById('rx-pattern');
  const flagsEl   = document.getElementById('rx-flags');
  const inputEl   = document.getElementById('rx-input');
  const outEl     = document.getElementById('rx-output');
  const infoEl    = document.getElementById('rx-info');
  if (!patternEl||!inputEl||!outEl) return;

  const pat  = patternEl.value;
  const flags= flagsEl ? flagsEl.value : 'g';
  const text = inputEl.value;

  if (!pat) {
    outEl.innerHTML = text ? escHtml(text) : '';
    if (infoEl) infoEl.textContent = '';
    setStatus('rx-status','','awaiting pattern');
    return;
  }
  try {
    const re = new RegExp(pat, flags.includes('g') ? flags : flags+'g');
    let matchCount = 0, lastIndex = 0, html = '';
    const matches = [...text.matchAll(re)];
    matchCount = matches.length;
    if (matchCount === 0) {
      outEl.innerHTML = escHtml(text);
      setStatus('rx-status','err','0 matches');
      if (infoEl) infoEl.textContent = 'No matches found';
      return;
    }
    let cursor = 0;
    for (const m of matches) {
      html += escHtml(text.slice(cursor, m.index));
      html += `<mark style="background:rgba(127,255,111,0.25);color:inherit;border-radius:2px;outline:1px solid rgba(127,255,111,0.5)">${escHtml(m[0])}</mark>`;
      cursor = m.index + m[0].length;
    }
    html += escHtml(text.slice(cursor));
    outEl.innerHTML = html;
    setStatus('rx-status','ok',`✓ ${matchCount} match${matchCount!==1?'es':''}`);
    if (infoEl) {
      const groups = matches[0].groups ? Object.keys(matches[0].groups) : [];
      infoEl.textContent = groups.length ? `Groups: ${groups.join(', ')}` : `${matchCount} match${matchCount!==1?'es':''}`;
    }
  } catch(e) {
    outEl.innerHTML = escHtml(text);
    setStatus('rx-status','err','✗ '+e.message.slice(0,40));
    if (infoEl) infoEl.textContent = e.message;
  }
}
function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function regexClear() {
  ['rx-pattern','rx-input'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const out=document.getElementById('rx-output');
  if(out) out.innerHTML='';
  const info=document.getElementById('rx-info');
  if(info) info.textContent='';
  setStatus('rx-status','','awaiting pattern');
}
function rxInsert(val) {
  const inp = document.getElementById('rx-pattern');
  if (!inp) return;
  const s = inp.selectionStart, e = inp.selectionEnd;
  inp.value = inp.value.slice(0,s)+val+inp.value.slice(e);
  inp.selectionStart = inp.selectionEnd = s+val.length;
  inp.focus();
  regexRun();
}

/* ════════════════════════════════════
   DIFF CHECKER
   ════════════════════════════════════ */
function diffCheck() {
  const a   = document.getElementById('diff-a')?.value||'';
  const b   = document.getElementById('diff-b')?.value||'';
  const out = document.getElementById('diff-output');
  const st  = document.getElementById('diff-status');
  if (!out) return;
  if (!a&&!b) { out.innerHTML=''; setStatus('diff-status','','paste text in both panels'); return; }

  const aLines = a.split('\n');
  const bLines = b.split('\n');
  const lcs = buildLCS(aLines, bLines);
  const diff = buildDiff(aLines, bLines, lcs);

  let adds=0, dels=0, same=0;
  let html = '';
  for (const [type, line] of diff) {
    if (type==='add')  { adds++; html+=`<div class="diff-line diff-add"><span class="diff-gutter">+</span><span>${escHtml(line)}</span></div>`; }
    else if (type==='del') { dels++; html+=`<div class="diff-line diff-del"><span class="diff-gutter">−</span><span>${escHtml(line)}</span></div>`; }
    else { same++; html+=`<div class="diff-line diff-same"><span class="diff-gutter"> </span><span>${escHtml(line)}</span></div>`; }
  }
  out.innerHTML = html || '<div style="padding:1rem;color:var(--text3);font-size:.8rem">Files are identical</div>';
  if (adds===0&&dels===0) {
    setStatus('diff-status','ok','✓ identical');
  } else {
    setStatus('diff-status', dels>0||adds>0 ? 'err' : 'ok',
      `+${adds} −${dels} ~${same}`);
  }
}

function buildLCS(a, b) {
  const m=a.length, n=b.length;
  const dp=Array.from({length:m+1},()=>new Array(n+1).fill(0));
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++)
    dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1]+1 : Math.max(dp[i-1][j],dp[i][j-1]);
  return dp;
}
function buildDiff(a, b, dp) {
  const result=[]; let i=a.length, j=b.length;
  while(i>0||j>0) {
    if(i>0&&j>0&&a[i-1]===b[j-1]) { result.unshift(['same',a[i-1]]); i--;j--; }
    else if(j>0&&(i===0||dp[i][j-1]>=dp[i-1][j])) { result.unshift(['add',b[j-1]]); j--; }
    else { result.unshift(['del',a[i-1]]); i--; }
  }
  return result;
}
function diffClear() {
  ['diff-a','diff-b'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const out=document.getElementById('diff-output');
  if(out) out.innerHTML='';
  setStatus('diff-status','','paste text in both panels');
}
function diffSwap() {
  const a=document.getElementById('diff-a');
  const b=document.getElementById('diff-b');
  if(!a||!b) return;
  [a.value,b.value]=[b.value,a.value];
  diffCheck();
}

/* ════════════════════════════════════
   COLOR PICKER
   ════════════════════════════════════ */
function colorUpdate(src) {
  try {
    let r,g,b,h,s,l;
    if (src==='hex') {
      const hex = document.getElementById('cp-hex')?.value.replace('#','');
      if (!/^[0-9a-fA-F]{6}$/.test(hex)) return;
      r=parseInt(hex.slice(0,2),16); g=parseInt(hex.slice(2,4),16); b=parseInt(hex.slice(4,6),16);
    } else if (src==='rgb') {
      r=parseInt(document.getElementById('cp-r')?.value)||0;
      g=parseInt(document.getElementById('cp-g')?.value)||0;
      b=parseInt(document.getElementById('cp-b')?.value)||0;
    } else if (src==='picker') {
      const hex=document.getElementById('cp-picker')?.value.replace('#','');
      r=parseInt(hex.slice(0,2),16); g=parseInt(hex.slice(2,4),16); b=parseInt(hex.slice(4,6),16);
    } else if (src==='hsl') {
      h=parseFloat(document.getElementById('cp-h')?.value)||0;
      s=parseFloat(document.getElementById('cp-s')?.value)||0;
      l=parseFloat(document.getElementById('cp-l')?.value)||0;
      [r,g,b]=hslToRgb(h,s,l);
    }
    r=Math.max(0,Math.min(255,r)); g=Math.max(0,Math.min(255,g)); b=Math.max(0,Math.min(255,b));
    const hex=('#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join(''));
    ;[h,s,l]=rgbToHsl(r,g,b);
    const hsl=`hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
    const rgb=`rgb(${r}, ${g}, ${b})`;
    // Update all fields
    const set=(id,v)=>{const e=document.getElementById(id);if(e&&document.activeElement!==e)e.value=v;};
    if(src!=='hex')    set('cp-hex', hex);
    if(src!=='rgb')  { set('cp-r',r); set('cp-g',g); set('cp-b',b); }
    if(src!=='hsl')  { set('cp-h',Math.round(h)); set('cp-s',Math.round(s)); set('cp-l',Math.round(l)); }
    if(src!=='picker') set('cp-picker', hex);
    // Swatch
    const sw=document.getElementById('cp-swatch');
    if(sw) { sw.style.background=hex; sw.style.borderColor=l<50?'rgba(255,255,255,.2)':'rgba(0,0,0,.15)'; }
    // Text outputs
    const setOut=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    setOut('cp-out-hex', hex.toUpperCase());
    setOut('cp-out-rgb', rgb);
    setOut('cp-out-hsl', hsl);
    setOut('cp-out-css', `color: ${hex};`);
    // Contrast
    const lum=(v)=>{v/=255; return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);};
    const rel=0.2126*lum(r)+0.7152*lum(g)+0.0722*lum(b);
    const contrast=(n,d)=>((Math.max(n,d)+0.05)/(Math.min(n,d)+0.05)).toFixed(2);
    const wcEl=document.getElementById('cp-contrast');
    if(wcEl) {
      const cW=contrast(rel,1), cB=contrast(rel,0);
      wcEl.textContent=`White: ${cW}:1  Black: ${cB}:1  AA: ${cW>=4.5||cB>=4.5?'✓ pass':'✗ fail'}`;
    }
    setStatus('cp-status','ok','✓ valid color');
  } catch(_) {}
}
function rgbToHsl(r,g,b) {
  r/=255; g/=255; b/=255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b);
  let h,s, l=(max+min)/2;
  if(max===min){h=s=0;}
  else{
    const d=max-min; s=l>0.5?d/(2-max-min):d/(max+min);
    switch(max){ case r:h=((g-b)/d+(g<b?6:0))/6;break; case g:h=((b-r)/d+2)/6;break; default:h=((r-g)/d+4)/6; }
  }
  return [h*360,s*100,l*100];
}
function hslToRgb(h,s,l) {
  s/=100; l/=100;
  const k=n=>(n+h/30)%12, a=s*Math.min(l,1-l);
  const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
  return [Math.round(f(0)*255),Math.round(f(8)*255),Math.round(f(4)*255)];
}
function colorCopyFormat(id) {
  const el=document.getElementById(id);
  if(el) navigator.clipboard.writeText(el.textContent).then(()=>showToast('Copied ✓'));
}

/* ════════════════════════════════════
   NUMBER TO WORDS
   ════════════════════════════════════ */
const NTW_ONES=['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const NTW_TENS=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
const NTW_SCALES=['','thousand','million','billion','trillion','quadrillion'];
function ntwChunk(n) {
  let s='';
  if(n>=100){s+=NTW_ONES[Math.floor(n/100)]+' hundred '; n%=100;}
  if(n>=20){s+=NTW_TENS[Math.floor(n/10)]+' '; n%=10;}
  if(n>0) s+=NTW_ONES[n]+' ';
  return s;
}
function numberToWords(num) {
  if(num===0) return 'zero';
  if(num<0) return 'negative '+numberToWords(-num);
  let result='', scale=0;
  while(num>0){
    const chunk=num%1000;
    if(chunk!==0) result=ntwChunk(chunk)+(NTW_SCALES[scale]?NTW_SCALES[scale]+' ':'')+result;
    num=Math.floor(num/1000); scale++;
  }
  return result.trim().replace(/\s+/g,' ');
}
function ntwRun() {
  const inp=document.getElementById('ntw-input');
  const out=document.getElementById('ntw-output');
  if(!inp||!out) return;
  const raw=inp.value.trim();
  if(!raw){out.textContent='';out.className='output-box';setStatus('ntw-status','','enter a number');return;}
  const parts=raw.split('.');
  const intPart=parseInt(parts[0].replace(/,/g,''));
  if(isNaN(intPart)||intPart>999999999999999){
    out.textContent='Please enter a whole number up to 999,999,999,999,999';
    out.className='output-box error';
    setStatus('ntw-status','err','✗ out of range');
    return;
  }
  let words=numberToWords(Math.abs(intPart));
  if(intPart<0) words='negative '+words;
  let result=words.charAt(0).toUpperCase()+words.slice(1);
  // Handle decimal part
  if(parts[1]!==undefined) {
    const dec=parts[1].replace(/0+$/,'');
    if(dec.length>0) {
      const decWords=dec.split('').map(d=>NTW_ONES[parseInt(d)]||'zero').join(' ');
      result+=` and ${decWords} ${dec.length===1?'tenth':dec.length===2?'hundredth':'thousandth'}${dec!=='1'?'s':''}`;
    }
  }
  out.textContent=result;
  out.className='output-box success';
  setStatus('ntw-status','ok','✓ converted');
}
function ntwClear(){
  const i=document.getElementById('ntw-input');
  const o=document.getElementById('ntw-output');
  if(i)i.value='';
  if(o){o.textContent='';o.className='output-box';}
  setStatus('ntw-status','','enter a number');
}

/* ════════════════════════════════════
   TEXT REPEATER
   ════════════════════════════════════ */
function textRepeat() {
  const text  = document.getElementById('tr-text')?.value||'';
  const times = parseInt(document.getElementById('tr-times')?.value)||1;
  const sep   = document.getElementById('tr-sep')?.value??'\n';
  const out   = document.getElementById('tr-output');
  if(!out) return;
  if(!text.trim()){out.textContent='';out.className='output-box';setStatus('tr-status','','enter text to repeat');return;}
  const actualSep = sep.replace(/\\n/g,'\n').replace(/\\t/g,'\t');
  const result = Array(Math.max(1,Math.min(times,10000))).fill(text).join(actualSep);
  out.textContent=result;
  out.className='output-box success';
  const wc=result.length.toLocaleString();
  setStatus('tr-status','ok',`✓ ${times}× — ${wc} chars`);
}
function trTimesUpdate(){
  const v=document.getElementById('tr-times')?.value;
  const d=document.getElementById('tr-times-display');
  if(d) d.textContent=parseInt(v).toLocaleString()+'×';
  textRepeat();
}
function trClear(){
  const t=document.getElementById('tr-text');
  const o=document.getElementById('tr-output');
  if(t)t.value='';
  if(o){o.textContent='';o.className='output-box';}
  setStatus('tr-status','','enter text to repeat');
}

/* ════════════════════════════════════
   RANDOM NUMBER GENERATOR
   ════════════════════════════════════ */
function rngGenerate(count) {
  const min    = parseInt(document.getElementById('rng-min')?.value??1);
  const max    = parseInt(document.getElementById('rng-max')?.value??100);
  const n      = parseInt(count||document.getElementById('rng-count')?.value||1);
  const unique = document.getElementById('rng-unique')?.checked??false;
  const sort   = document.getElementById('rng-sort')?.checked??false;
  const out    = document.getElementById('rng-output');
  if(!out) return;
  if(isNaN(min)||isNaN(max)||min>max){
    out.textContent='Min must be less than or equal to max';
    out.className='output-box error';
    setStatus('rng-status','err','✗ invalid range');
    return;
  }
  const range=max-min+1;
  if(unique&&n>range){
    out.textContent=`Cannot generate ${n} unique numbers in range ${min}–${max} (only ${range} possible)`;
    out.className='output-box error';
    setStatus('rng-status','err','✗ range too small');
    return;
  }
  const arr=new Uint32Array(n*3);
  crypto.getRandomValues(arr);
  let results=[];
  if(unique) {
    const pool=Array.from({length:range},(_,i)=>min+i);
    // Fisher-Yates
    for(let i=pool.length-1;i>0;i--){
      const j=arr[i]%(i+1);
      [pool[i],pool[j]]=[pool[j],pool[i]];
    }
    results=pool.slice(0,n);
  } else {
    for(let i=0;i<n;i++) results.push(min+arr[i]%range);
  }
  if(sort) results.sort((a,b)=>a-b);
  out.textContent = n===1 ? String(results[0]) : results.join(n<=20?'\n':',  ');
  out.className='output-box success';
  setStatus('rng-status','ok',`✓ ${n} number${n!==1?'s':''} · range ${min}–${max}`);
  // History
  const hist=document.getElementById('rng-history');
  if(hist&&n===1){
    const tag=document.createElement('span');
    tag.className='rng-tag';
    tag.textContent=results[0];
    tag.title='Click to copy';
    tag.onclick=()=>navigator.clipboard.writeText(String(results[0])).then(()=>showToast('Copied ✓'));
    hist.prepend(tag);
    while(hist.children.length>20) hist.removeChild(hist.lastChild);
  }
}
function rngRoll(sides){
  const out=document.getElementById('rng-output');
  const arr=new Uint32Array(1);
  crypto.getRandomValues(arr);
  const r=(arr[0]%sides)+1;
  if(out){out.textContent=String(r);out.className='output-box success';}
  setStatus('rng-status','ok',`✓ d${sides} → ${r}`);
}
function rngClear(){
  const out=document.getElementById('rng-output');
  const hist=document.getElementById('rng-history');
  if(out){out.textContent='';out.className='output-box';}
  if(hist) hist.innerHTML='';
  setStatus('rng-status','','set range and generate');
}

/* ════════════════════════════════════
   GST CALCULATOR
   ════════════════════════════════════ */
function gstCalc() {
  const amount  = parseFloat(document.getElementById('gst-amount')?.value);
  const rate    = parseFloat(document.getElementById('gst-rate')?.value);
  const mode    = document.getElementById('gst-mode')?.value || 'add';
  const out     = document.getElementById('gst-output');
  if (!out) return;
  if (isNaN(amount) || isNaN(rate) || amount <= 0 || rate < 0) {
    out.textContent = 'Please enter a valid amount and GST rate.';
    out.className = 'output-box error'; return;
  }
  let original, gstAmt, total;
  if (mode === 'add') {
    original = amount;
    gstAmt   = amount * rate / 100;
    total    = amount + gstAmt;
  } else {
    total    = amount;
    original = amount / (1 + rate / 100);
    gstAmt   = total - original;
  }
  out.className = 'output-box success';
  out.textContent =
    `${mode === 'add' ? 'Original Amount' : 'Pre-GST Amount'}:  ${formatCur(original)}\n` +
    `GST @ ${rate}%:          ${formatCur(gstAmt)}\n` +
    `${'─'.repeat(32)}\n` +
    `${mode === 'add' ? 'Total (with GST)' : 'GST-inclusive Price'}:  ${formatCur(total)}\n\n` +
    `CGST (${rate/2}%):          ${formatCur(gstAmt/2)}\n` +
    `SGST (${rate/2}%):          ${formatCur(gstAmt/2)}`;
  renderAmortChart('gst-chart', original, gstAmt);
}
function gstSetRate(r) {
  const el = document.getElementById('gst-rate');
  if (el) { el.value = r; gstCalc(); }
  document.querySelectorAll('.gst-slab').forEach(b => {
    b.classList.toggle('active', b.dataset.rate == r);
  });
}
function gstClear() {
  const a = document.getElementById('gst-amount');
  const o = document.getElementById('gst-output');
  const c = document.getElementById('gst-chart');
  if (a) a.value = '';
  if (o) { o.textContent = ''; o.className = 'output-box'; }
  if (c) c.innerHTML = '';
}

/* ════════════════════════════════════
   SALARY CALCULATOR
   ════════════════════════════════════ */
function salaryCalc() {
  const amount   = parseFloat(document.getElementById('sal-amount')?.value);
  const fromUnit = document.getElementById('sal-from')?.value || 'annual';
  const out      = document.getElementById('sal-output');
  if (!out) return;
  if (isNaN(amount) || amount <= 0) {
    out.textContent = 'Please enter a valid salary amount.';
    out.className = 'output-box error'; return;
  }
  // Convert to annual first
  const toAnnual = { annual:1, monthly:12, weekly:52, daily:260, hourly:2080 };
  const annual  = amount * toAnnual[fromUnit];
  const monthly = annual / 12;
  const weekly  = annual / 52;
  const daily   = annual / 260;
  const hourly  = annual / 2080;
  // Simple tax estimate (generic brackets)
  const taxRate = annual <= 12500 ? 0 : annual <= 50000 ? 0.20 : annual <= 150000 ? 0.40 : 0.45;
  const taxAmt  = annual * taxRate;
  const takeHome = annual - taxAmt;
  out.className = 'output-box success';
  out.textContent =
    `── Salary Breakdown ──────────────\n` +
    `Hourly:          ${formatCur(hourly)}\n` +
    `Daily:           ${formatCur(daily)}\n` +
    `Weekly:          ${formatCur(weekly)}\n` +
    `Monthly:         ${formatCur(monthly)}\n` +
    `Annual:          ${formatCur(annual)}\n\n` +
    `── Estimated Tax (generic) ───────\n` +
    `Tax rate:        ${(taxRate*100).toFixed(0)}%\n` +
    `Est. tax/year:   ${formatCur(taxAmt)}\n` +
    `Est. take-home:  ${formatCur(takeHome)}/yr\n` +
    `                 ${formatCur(takeHome/12)}/mo\n\n` +
    `Note: Tax estimate is illustrative only.\nConsult a tax advisor for accurate figures.`;
  renderAmortChart('sal-chart', takeHome, taxAmt);
}
function salaryClear() {
  const a = document.getElementById('sal-amount');
  const o = document.getElementById('sal-output');
  if (a) a.value = '';
  if (o) { o.textContent = ''; o.className = 'output-box'; }
}

/* ════════════════════════════════════
   VAT CALCULATOR
   ════════════════════════════════════ */
function vatCalc() {
  const amount = parseFloat(document.getElementById('vat-amount')?.value);
  const rate   = parseFloat(document.getElementById('vat-rate')?.value);
  const mode   = document.getElementById('vat-mode')?.value || 'add';
  const out    = document.getElementById('vat-output');
  if (!out) return;
  if (isNaN(amount) || isNaN(rate) || amount <= 0 || rate < 0) {
    out.textContent = 'Please enter a valid amount and VAT rate.';
    out.className = 'output-box error'; return;
  }
  let original, vatAmt, total;
  if (mode === 'add') {
    original = amount;
    vatAmt   = amount * rate / 100;
    total    = amount + vatAmt;
  } else {
    total    = amount;
    original = amount / (1 + rate / 100);
    vatAmt   = total - original;
  }
  out.className = 'output-box success';
  out.textContent =
    `${mode === 'add' ? 'Net Amount (ex-VAT)' : 'Net Amount (ex-VAT)'}:  ${formatCur(original)}\n` +
    `VAT @ ${rate}%:              ${formatCur(vatAmt)}\n` +
    `${'─'.repeat(34)}\n` +
    `Gross Amount (inc-VAT):  ${formatCur(total)}`;
  renderAmortChart('vat-chart', original, vatAmt);
}
function vatClear() {
  ['vat-amount'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const o=document.getElementById('vat-output');
  const c=document.getElementById('vat-chart');
  if(o){o.textContent='';o.className='output-box';}
  if(c) c.innerHTML='';
}

/* ════════════════════════════════════
   DISCOUNT CALCULATOR
   ════════════════════════════════════ */
function discountCalc() {
  const price    = parseFloat(document.getElementById('disc-price')?.value);
  const discount = parseFloat(document.getElementById('disc-pct')?.value);
  const out      = document.getElementById('disc-output');
  if (!out) return;
  if (isNaN(price) || isNaN(discount) || price <= 0 || discount < 0 || discount > 100) {
    out.textContent = 'Please enter a valid price and discount percentage.';
    out.className = 'output-box error'; return;
  }
  const saving   = price * discount / 100;
  const finalPr  = price - saving;
  // Also show what % off would give round numbers
  out.className = 'output-box success';
  out.textContent =
    `Original Price:   ${formatCur(price)}\n` +
    `Discount:         ${discount}% = ${formatCur(saving)}\n` +
    `${'─'.repeat(30)}\n` +
    `Final Price:      ${formatCur(finalPr)}\n` +
    `You Save:         ${formatCur(saving)}\n\n` +
    `── Other discounts on ${formatCur(price)} ──\n` +
    [5,10,15,20,25,30,40,50].map(d => {
      const s = price*d/100;
      return `${String(d).padStart(3)}% off → ${formatCur(price-s)} (save ${formatCur(s)})`;
    }).join('\n');
  renderAmortChart('disc-chart', finalPr, saving);
}
function discountClear() {
  ['disc-price','disc-pct'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const o=document.getElementById('disc-output');
  const c=document.getElementById('disc-chart');
  if(o){o.textContent='';o.className='output-box';}
  if(c) c.innerHTML='';
}

/* ════════════════════════════════════
   TIP CALCULATOR
   ════════════════════════════════════ */
function tipCalc() {
  const bill    = parseFloat(document.getElementById('tip-bill')?.value);
  const tipPct  = parseFloat(document.getElementById('tip-pct')?.value);
  const people  = parseInt(document.getElementById('tip-people')?.value) || 1;
  const out     = document.getElementById('tip-output');
  if (!out) return;
  if (isNaN(bill) || isNaN(tipPct) || bill <= 0 || tipPct < 0) {
    out.textContent = 'Please enter a valid bill amount and tip %.';
    out.className = 'output-box error'; return;
  }
  const tipAmt   = bill * tipPct / 100;
  const total    = bill + tipAmt;
  const perPerson = total / Math.max(1, people);
  const tipPer   = tipAmt / Math.max(1, people);
  out.className = 'output-box success';
  out.textContent =
    `Bill Amount:      ${formatCur(bill)}\n` +
    `Tip (${tipPct}%):       ${formatCur(tipAmt)}\n` +
    `${'─'.repeat(28)}\n` +
    `Total:            ${formatCur(total)}\n\n` +
    (people > 1 ?
    `── Split ${people} ways ─────────────\n` +
    `Per Person:       ${formatCur(perPerson)}\n` +
    `  (bill share):   ${formatCur(bill/people)}\n` +
    `  (tip share):    ${formatCur(tipPer)}\n\n` : '') +
    `── Common tip amounts ───────────\n` +
    [10,15,18,20,25].map(t => {
      const ta=bill*t/100;
      return `${String(t).padStart(3)}% → tip ${formatCur(ta)} · total ${formatCur(bill+ta)}${people>1?' · '+formatCur((bill+ta)/people)+'/person':''}`;
    }).join('\n');
}
function tipSetPct(p) {
  const el = document.getElementById('tip-pct');
  if (el) { el.value = p; tipCalc(); }
  document.querySelectorAll('.tip-btn').forEach(b => b.classList.toggle('active', b.dataset.tip == p));
}
function tipClear() {
  ['tip-bill','tip-pct','tip-people'].forEach(id=>{const e=document.getElementById(id);if(e)e.value=id==='tip-people'?'1':'';});
  const o=document.getElementById('tip-output');
  if(o){o.textContent='';o.className='output-box';}
}

/* ════════════════════════════════════
   CURRENCY CONVERTER
   ════════════════════════════════════ */
const CURRENCY_RATES = {
  USD:1, EUR:0.92, GBP:0.79, PKR:278, INR:83.5, AED:3.67,
  SAR:3.75, CAD:1.36, AUD:1.53, JPY:149.5, CNY:7.24,
  CHF:0.90, SGD:1.34, MYR:4.72, BDT:110, LKR:305,
  KWD:0.31, QAR:3.64, BHD:0.38, OMR:0.385, EGP:30.9,
  TRY:32.1, ZAR:18.6, MXN:17.1, BRL:4.97, KRW:1325,
  THB:35.1, NGN:1550, GHS:12.5, KES:130
};
const CURRENCY_NAMES = {
  USD:'US Dollar', EUR:'Euro', GBP:'British Pound', PKR:'Pakistani Rupee',
  INR:'Indian Rupee', AED:'UAE Dirham', SAR:'Saudi Riyal', CAD:'Canadian Dollar',
  AUD:'Australian Dollar', JPY:'Japanese Yen', CNY:'Chinese Yuan',
  CHF:'Swiss Franc', SGD:'Singapore Dollar', MYR:'Malaysian Ringgit',
  BDT:'Bangladeshi Taka', LKR:'Sri Lankan Rupee', KWD:'Kuwaiti Dinar',
  QAR:'Qatari Riyal', BHD:'Bahraini Dinar', OMR:'Omani Rial',
  EGP:'Egyptian Pound', TRY:'Turkish Lira', ZAR:'South African Rand',
  MXN:'Mexican Peso', BRL:'Brazilian Real', KRW:'South Korean Won',
  THB:'Thai Baht', NGN:'Nigerian Naira', GHS:'Ghanaian Cedi', KES:'Kenyan Shilling'
};
function currencyConvert() {
  const amount = parseFloat(document.getElementById('cx-amount')?.value);
  const from   = document.getElementById('cx-from')?.value || 'USD';
  const to     = document.getElementById('cx-to')?.value   || 'PKR';
  const out    = document.getElementById('cx-output');
  const note   = document.getElementById('cx-note');
  if (!out) return;
  if (isNaN(amount) || amount < 0) {
    out.textContent = 'Please enter a valid amount.';
    out.className = 'output-box error'; return;
  }
  const rateFrom = CURRENCY_RATES[from] || 1;
  const rateTo   = CURRENCY_RATES[to]   || 1;
  const result   = (amount / rateFrom) * rateTo;
  const rateDisp = (rateTo / rateFrom);
  out.className = 'output-box success';
  out.textContent =
    `${amount.toLocaleString()} ${from} = ${result.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:4})} ${to}\n\n` +
    `Rate: 1 ${from} = ${rateDisp.toLocaleString('en-US',{minimumFractionDigits:4,maximumFractionDigits:6})} ${to}\n` +
    `Rate: 1 ${to} = ${(1/rateDisp).toLocaleString('en-US',{minimumFractionDigits:6,maximumFractionDigits:8})} ${from}\n\n` +
    `── Quick reference (${from} → ${to}) ──\n` +
    [1,5,10,50,100,500,1000].map(v => {
      const r = (v/rateFrom)*rateTo;
      return `${String(v).padStart(5)} ${from} = ${r.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})} ${to}`;
    }).join('\n');
  if (note) note.textContent = '⚠ Rates are indicative and updated periodically. Use a bank or broker for live rates.';
  setStatus('cx-status','ok',`✓ ${from} → ${to}`);
}
function currencySwap() {
  const f = document.getElementById('cx-from');
  const t = document.getElementById('cx-to');
  if (!f||!t) return;
  [f.value, t.value] = [t.value, f.value];
  currencyConvert();
}
function currencyClear() {
  const a=document.getElementById('cx-amount');
  const o=document.getElementById('cx-output');
  if(a) a.value='';
  if(o){o.textContent='';o.className='output-box';}
  setStatus('cx-status','','enter amount to convert');
}

/* ════════════════════════════════════
   BATCH 3 — UNIT CONVERTERS
   Shared helper
   ════════════════════════════════════ */
function ucConvert(units, fromId, toId, inputId, outputId, precision) {
  const val  = parseFloat(document.getElementById(inputId)?.value);
  const from = document.getElementById(fromId)?.value;
  const to   = document.getElementById(toId)?.value;
  const out  = document.getElementById(outputId);
  if (!out) return;
  if (isNaN(val)) { out.textContent = ''; out.className = 'output-box'; return; }

  // Convert to base unit then to target
  const toBase   = units[from]?.toBase   || (v => v);
  const fromBase = units[to]?.fromBase   || (v => v);
  const result   = fromBase(toBase(val));
  const prec     = precision || 6;

  // Build full reference table
  const fmt = n => {
    if (Math.abs(n) === 0) return '0';
    if (Math.abs(n) >= 1e9 || (Math.abs(n) < 0.0001 && n !== 0)) return n.toExponential(4);
    return parseFloat(n.toPrecision(prec)).toLocaleString('en-US', {maximumFractionDigits: prec});
  };

  const mainLine = `${val.toLocaleString()} ${from} = ${fmt(result)} ${to}`;
  const table = Object.keys(units)
    .filter(u => u !== from)
    .map(u => {
      const r = units[u].fromBase(toBase(val));
      return `  ${(u + ':').padEnd(18)} ${fmt(r)}`;
    }).join('\n');

  out.textContent = mainLine + '\n\n── All units ──────────────────\n' + table;
  out.className = 'output-box success';
  setStatus(outputId.replace('output','status'), 'ok', `✓ ${from} → ${to}`);
}

/* ════════════════════════════════════
   TEMPERATURE CONVERTER
   ════════════════════════════════════ */
function tempConvert() {
  const val  = parseFloat(document.getElementById('temp-input')?.value);
  const from = document.getElementById('temp-from')?.value || 'C';
  const out  = document.getElementById('temp-output');
  if (!out) return;
  if (isNaN(val)) { out.textContent = ''; out.className = 'output-box'; return; }

  // Convert to Celsius first
  let celsius;
  if (from === 'C') celsius = val;
  else if (from === 'F') celsius = (val - 32) * 5/9;
  else if (from === 'K') celsius = val - 273.15;
  else if (from === 'R') celsius = (val - 491.67) * 5/9;

  const results = {
    'Celsius (°C)':    celsius,
    'Fahrenheit (°F)': celsius * 9/5 + 32,
    'Kelvin (K)':      celsius + 273.15,
    'Rankine (°R)':    (celsius + 273.15) * 9/5,
  };

  const fmt = n => parseFloat(n.toFixed(4)).toLocaleString('en-US', {maximumFractionDigits:4});

  const lines = Object.entries(results)
    .map(([unit, v]) => `  ${(unit+':').padEnd(20)} ${fmt(v)}`)
    .join('\n');

  out.textContent = `── Temperature Conversion ──────────\n${lines}\n\n── Reference points ────────────────\n  Water freezes:      0°C = 32°F = 273.15K\n  Water boils:        100°C = 212°F = 373.15K\n  Body temperature:   37°C = 98.6°F = 310.15K\n  Absolute zero:      -273.15°C = -459.67°F = 0K`;
  out.className = 'output-box success';
}
function tempClear() {
  const i=document.getElementById('temp-input');
  const o=document.getElementById('temp-output');
  if(i) i.value='';
  if(o){o.textContent='';o.className='output-box';}
}

/* ════════════════════════════════════
   LENGTH CONVERTER
   ════════════════════════════════════ */
const LENGTH_UNITS = {
  'm':   { toBase: v=>v,          fromBase: v=>v,            name:'Metres' },
  'km':  { toBase: v=>v*1000,     fromBase: v=>v/1000,       name:'Kilometres' },
  'cm':  { toBase: v=>v/100,      fromBase: v=>v*100,        name:'Centimetres' },
  'mm':  { toBase: v=>v/1000,     fromBase: v=>v*1000,       name:'Millimetres' },
  'mi':  { toBase: v=>v*1609.344, fromBase: v=>v/1609.344,   name:'Miles' },
  'yd':  { toBase: v=>v*0.9144,   fromBase: v=>v/0.9144,     name:'Yards' },
  'ft':  { toBase: v=>v*0.3048,   fromBase: v=>v/0.3048,     name:'Feet' },
  'in':  { toBase: v=>v*0.0254,   fromBase: v=>v/0.0254,     name:'Inches' },
  'nmi': { toBase: v=>v*1852,     fromBase: v=>v/1852,       name:'Nautical Miles' },
  'μm':  { toBase: v=>v/1e6,      fromBase: v=>v*1e6,        name:'Micrometres' },
  'nm':  { toBase: v=>v/1e9,      fromBase: v=>v*1e9,        name:'Nanometres' },
};
function lengthConvert() { ucConvert(LENGTH_UNITS,'len-from','len-to','len-input','len-output'); }
function lengthClear() { clearUC('len-input','len-output'); }

/* ════════════════════════════════════
   WEIGHT CONVERTER
   ════════════════════════════════════ */
const WEIGHT_UNITS = {
  'kg':  { toBase: v=>v,           fromBase: v=>v,           name:'Kilograms' },
  'g':   { toBase: v=>v/1000,      fromBase: v=>v*1000,      name:'Grams' },
  'mg':  { toBase: v=>v/1e6,       fromBase: v=>v*1e6,       name:'Milligrams' },
  'lb':  { toBase: v=>v*0.453592,  fromBase: v=>v/0.453592,  name:'Pounds' },
  'oz':  { toBase: v=>v*0.0283495, fromBase: v=>v/0.0283495, name:'Ounces' },
  'st':  { toBase: v=>v*6.35029,   fromBase: v=>v/6.35029,   name:'Stones' },
  't':   { toBase: v=>v*1000,      fromBase: v=>v/1000,      name:'Metric Tonnes' },
  'ton': { toBase: v=>v*907.185,   fromBase: v=>v/907.185,   name:'US Tons' },
  'μg':  { toBase: v=>v/1e9,       fromBase: v=>v*1e9,       name:'Micrograms' },
};
function weightConvert() { ucConvert(WEIGHT_UNITS,'wt-from','wt-to','wt-input','wt-output'); }
function weightClear() { clearUC('wt-input','wt-output'); }

/* ════════════════════════════════════
   SPEED CONVERTER
   ════════════════════════════════════ */
const SPEED_UNITS = {
  'km/h':  { toBase: v=>v/3.6,        fromBase: v=>v*3.6,        name:'Kilometres/hour' },
  'mph':   { toBase: v=>v*0.44704,     fromBase: v=>v/0.44704,    name:'Miles/hour' },
  'm/s':   { toBase: v=>v,             fromBase: v=>v,            name:'Metres/second' },
  'kn':    { toBase: v=>v*0.514444,    fromBase: v=>v/0.514444,   name:'Knots' },
  'ft/s':  { toBase: v=>v*0.3048,      fromBase: v=>v/0.3048,     name:'Feet/second' },
  'Mach':  { toBase: v=>v*343,         fromBase: v=>v/343,        name:'Mach (sea level)' },
  'c':     { toBase: v=>v*299792458,   fromBase: v=>v/299792458,  name:'Speed of light' },
};
function speedConvert() { ucConvert(SPEED_UNITS,'sp-from','sp-to','sp-input','sp-output'); }
function speedClear() { clearUC('sp-input','sp-output'); }

/* ════════════════════════════════════
   DATA SIZE CONVERTER
   ════════════════════════════════════ */
const DATA_UNITS = {
  'bit':  { toBase: v=>v,             fromBase: v=>v,             name:'Bits' },
  'B':    { toBase: v=>v*8,           fromBase: v=>v/8,           name:'Bytes' },
  'KB':   { toBase: v=>v*8*1024,      fromBase: v=>v/(8*1024),    name:'Kilobytes' },
  'MB':   { toBase: v=>v*8*1024**2,   fromBase: v=>v/(8*1024**2), name:'Megabytes' },
  'GB':   { toBase: v=>v*8*1024**3,   fromBase: v=>v/(8*1024**3), name:'Gigabytes' },
  'TB':   { toBase: v=>v*8*1024**4,   fromBase: v=>v/(8*1024**4), name:'Terabytes' },
  'PB':   { toBase: v=>v*8*1024**5,   fromBase: v=>v/(8*1024**5), name:'Petabytes' },
  'Kbit': { toBase: v=>v*1000,        fromBase: v=>v/1000,        name:'Kilobits' },
  'Mbit': { toBase: v=>v*1e6,         fromBase: v=>v/1e6,         name:'Megabits' },
  'Gbit': { toBase: v=>v*1e9,         fromBase: v=>v/1e9,         name:'Gigabits' },
};
function dataConvert() { ucConvert(DATA_UNITS,'dt-from','dt-to','dt-input','dt-output'); }
function dataClear() { clearUC('dt-input','dt-output'); }

/* ════════════════════════════════════
   TIME ZONE CONVERTER
   ════════════════════════════════════ */
const TIMEZONES = {
  'UTC':   { offset: 0,     name: 'UTC — Coordinated Universal Time' },
  'PKT':   { offset: 5,     name: 'PKT — Pakistan Standard Time' },
  'IST':   { offset: 5.5,   name: 'IST — India Standard Time' },
  'EST':   { offset: -5,    name: 'EST — Eastern Standard Time (US)' },
  'EDT':   { offset: -4,    name: 'EDT — Eastern Daylight Time (US)' },
  'CST':   { offset: -6,    name: 'CST — Central Standard Time (US)' },
  'CDT':   { offset: -5,    name: 'CDT — Central Daylight Time (US)' },
  'MST':   { offset: -7,    name: 'MST — Mountain Standard Time' },
  'PST':   { offset: -8,    name: 'PST — Pacific Standard Time (US)' },
  'PDT':   { offset: -7,    name: 'PDT — Pacific Daylight Time (US)' },
  'GMT':   { offset: 0,     name: 'GMT — Greenwich Mean Time' },
  'BST':   { offset: 1,     name: 'BST — British Summer Time' },
  'CET':   { offset: 1,     name: 'CET — Central European Time' },
  'CEST':  { offset: 2,     name: 'CEST — Central European Summer Time' },
  'EET':   { offset: 2,     name: 'EET — Eastern European Time' },
  'MSK':   { offset: 3,     name: 'MSK — Moscow Standard Time' },
  'GST':   { offset: 4,     name: 'GST — Gulf Standard Time (UAE/Oman)' },
  'AST':   { offset: 3,     name: 'AST — Arabia Standard Time (KSA)' },
  'BDT':   { offset: 6,     name: 'BDT — Bangladesh Standard Time' },
  'ICT':   { offset: 7,     name: 'ICT — Indochina Time' },
  'CST8':  { offset: 8,     name: 'CST — China Standard Time' },
  'SGT':   { offset: 8,     name: 'SGT — Singapore Time' },
  'JST':   { offset: 9,     name: 'JST — Japan Standard Time' },
  'AEST':  { offset: 10,    name: 'AEST — Australian Eastern Standard' },
  'AEDT':  { offset: 11,    name: 'AEDT — Australian Eastern Daylight' },
  'NZST':  { offset: 12,    name: 'NZST — New Zealand Standard Time' },
};
function tzConvert() {
  const timeStr = document.getElementById('tz-input')?.value.trim();
  const from    = document.getElementById('tz-from')?.value || 'UTC';
  const to      = document.getElementById('tz-to')?.value   || 'PKT';
  const out     = document.getElementById('tz-output');
  if (!out) return;
  if (!timeStr) { out.textContent = ''; out.className = 'output-box'; return; }

  // Parse time — accept HH:MM, H:MM AM/PM, or full datetime
  let hours = 0, mins = 0;
  const ampm = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/);
  if (ampm) {
    hours = parseInt(ampm[1]);
    mins  = parseInt(ampm[2]);
    if (ampm[3]) {
      const ap = ampm[3].toUpperCase();
      if (ap === 'PM' && hours !== 12) hours += 12;
      if (ap === 'AM' && hours === 12) hours = 0;
    }
  } else {
    out.textContent = 'Enter time as HH:MM or H:MM AM/PM (e.g. 14:30 or 2:30 PM)';
    out.className = 'output-box error'; return;
  }

  const fromOffset = TIMEZONES[from]?.offset ?? 0;
  const toOffset   = TIMEZONES[to]?.offset   ?? 0;
  const diffHours  = toOffset - fromOffset;

  let newHours = hours + Math.floor(diffHours);
  let newMins  = mins  + Math.round((diffHours % 1) * 60);
  if (newMins >= 60) { newHours++; newMins -= 60; }
  if (newMins < 0)   { newHours--; newMins += 60; }
  const dayOffset = Math.floor(newHours / 24);
  newHours = ((newHours % 24) + 24) % 24;

  const fmt24 = (h, m) => `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  const fmt12 = (h, m) => {
    const ap = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2,'0')} ${ap}`;
  };
  const dayLabel = dayOffset === 0 ? '' : dayOffset > 0 ? ` (+${dayOffset} day)` : ` (${dayOffset} day)`;

  out.textContent =
    `Input:    ${fmt24(hours,mins)} (${fmt12(hours,mins)}) ${from}\n` +
    `Output:   ${fmt24(newHours,newMins)} (${fmt12(newHours,newMins)}) ${to}${dayLabel}\n\n` +
    `Offset difference: ${diffHours >= 0 ? '+' : ''}${diffHours} hours\n\n` +
    `── All zones for ${fmt24(hours,mins)} ${from} ─────────────\n` +
    Object.entries(TIMEZONES).map(([code, tz]) => {
      const diff = tz.offset - fromOffset;
      let h = hours + Math.floor(diff);
      let m = mins  + Math.round((diff % 1) * 60);
      if (m >= 60) { h++; m -= 60; }
      if (m < 0)   { h--; m += 60; }
      const day = Math.floor(h/24);
      h = ((h%24)+24)%24;
      const dayStr = day === 0 ? '' : day > 0 ? ` +${day}d` : ` ${day}d`;
      return `  ${(code+':').padEnd(8)} ${fmt24(h,m)} (${fmt12(h,m)})${dayStr}`;
    }).join('\n');

  out.className = 'output-box success';
}
function tzNow() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  const inp = document.getElementById('tz-input');
  if (inp) { inp.value = `${h}:${m}`; tzConvert(); }
}
function tzClear() {
  const i=document.getElementById('tz-input');
  const o=document.getElementById('tz-output');
  if(i) i.value='';
  if(o){o.textContent='';o.className='output-box';}
}

/* Shared clear helper */
function clearUC(inputId, outputId) {
  const i=document.getElementById(inputId);
  const o=document.getElementById(outputId);
  if(i) i.value='';
  if(o){o.textContent='';o.className='output-box';}
}

/* ════════════════════════════════════
   BATCH 4 — ADVANCED TRADING TOOLS
   ════════════════════════════════════ */

/* ── PIP VALUE CALCULATOR ── */
const PIP_PAIRS = {
  'EUR/USD':{ pipPos:4, quote:'USD' }, 'GBP/USD':{ pipPos:4, quote:'USD' },
  'AUD/USD':{ pipPos:4, quote:'USD' }, 'NZD/USD':{ pipPos:4, quote:'USD' },
  'USD/JPY':{ pipPos:2, quote:'JPY' }, 'USD/CHF':{ pipPos:4, quote:'CHF' },
  'USD/CAD':{ pipPos:4, quote:'CAD' }, 'EUR/JPY':{ pipPos:2, quote:'JPY' },
  'GBP/JPY':{ pipPos:2, quote:'JPY' }, 'EUR/GBP':{ pipPos:4, quote:'GBP' },
  'EUR/CHF':{ pipPos:4, quote:'CHF' }, 'GBP/CHF':{ pipPos:4, quote:'CHF' },
  'AUD/JPY':{ pipPos:2, quote:'JPY' }, 'CAD/JPY':{ pipPos:2, quote:'JPY' },
  'USD/SGD':{ pipPos:4, quote:'SGD' }, 'USD/HKD':{ pipPos:4, quote:'HKD' },
  'USD/MXN':{ pipPos:4, quote:'MXN' }, 'USD/ZAR':{ pipPos:4, quote:'ZAR' },
  'USD/PKR':{ pipPos:2, quote:'PKR' }, 'USD/INR':{ pipPos:2, quote:'INR' },
  'XAU/USD':{ pipPos:2, quote:'USD', contract:100 }, // Gold
  'XAG/USD':{ pipPos:3, quote:'USD', contract:5000 }, // Silver
  'BTC/USD':{ pipPos:0, quote:'USD', contract:1 },
};
// Account currency → USD approximate rates
const ACCT_RATES = {
  USD:1, EUR:1.09, GBP:1.27, PKR:0.0036, INR:0.012,
  AED:0.27, SAR:0.267, JPY:0.0067, CHF:1.11, CAD:0.74,
  AUD:0.65, SGD:0.74, HKD:0.13,
};

function pipValueCalc() {
  const pair    = document.getElementById('pv-pair')?.value || 'EUR/USD';
  const lots    = parseFloat(document.getElementById('pv-lots')?.value) || 1;
  const acct    = document.getElementById('pv-acct')?.value || 'USD';
  const price   = parseFloat(document.getElementById('pv-price')?.value) || 0;
  const out     = document.getElementById('pv-output');
  if (!out) return;

  const pairData = PIP_PAIRS[pair] || { pipPos:4, quote:'USD' };
  const pipSize  = Math.pow(10, -pairData.pipPos);
  const contract = pairData.contract || 100000;
  const lotUnits = lots * contract;

  // Pip value in quote currency
  let pipValueQuote = pipSize * lotUnits;

  // Convert to account currency
  const quoteToUSD = ACCT_RATES[pairData.quote] || 1;
  const acctToUSD  = ACCT_RATES[acct] || 1;
  let pipValueAcct = pipValueQuote * quoteToUSD / acctToUSD;

  // If price provided and quote is not USD-equivalent, use price
  if (price > 0 && pairData.quote !== 'USD' && pair !== 'XAU/USD') {
    pipValueAcct = (pipSize * lotUnits) / price / acctToUSD;
  }

  const fmt = n => n.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:4});

  out.className = 'output-box success';
  out.textContent =
    `Pair:              ${pair}\n` +
    `Lot Size:          ${lots} lot${lots!==1?'s':''} (${lotUnits.toLocaleString()} units)\n` +
    `Pip Size:          ${pipSize}\n` +
    `─────────────────────────────────\n` +
    `Pip Value:         ${fmt(pipValueAcct)} ${acct} per pip\n` +
    `10 pips:           ${fmt(pipValueAcct*10)} ${acct}\n` +
    `50 pips:           ${fmt(pipValueAcct*50)} ${acct}\n` +
    `100 pips:          ${fmt(pipValueAcct*100)} ${acct}\n\n` +
    `── Per lot size ──────────────────\n` +
    [0.01,0.05,0.1,0.25,0.5,1,2,5].map(l =>
      `  ${String(l+' lot').padEnd(9)} → ${fmt(pipValueAcct/lots*l)} ${acct}/pip`
    ).join('\n');
  setStatus('pv-status','ok',`✓ ${fmt(pipValueAcct)} ${acct}/pip`);
}
function pvClear() {
  ['pv-lots','pv-price'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const o=document.getElementById('pv-output');
  if(o){o.textContent='';o.className='output-box';}
  setStatus('pv-status','','select pair and enter lots');
}

/* ── FOREX PROFIT CALCULATOR ── */
function forexProfitCalc() {
  const pair   = document.getElementById('fp-pair')?.value || 'EUR/USD';
  const lots   = parseFloat(document.getElementById('fp-lots')?.value);
  const entry  = parseFloat(document.getElementById('fp-entry')?.value);
  const exit   = parseFloat(document.getElementById('fp-exit')?.value);
  const dir    = document.getElementById('fp-dir')?.value || 'buy';
  const acct   = document.getElementById('fp-acct')?.value || 'USD';
  const out    = document.getElementById('fp-output');
  if (!out) return;
  if (isNaN(lots)||isNaN(entry)||isNaN(exit)||lots<=0) {
    out.textContent='Enter all fields.'; out.className='output-box error'; return;
  }

  const pairData = PIP_PAIRS[pair] || { pipPos:4, quote:'USD' };
  const pipSize  = Math.pow(10, -pairData.pipPos);
  const contract = pairData.contract || 100000;
  const priceDiff = dir==='buy' ? exit-entry : entry-exit;
  const pips      = priceDiff / pipSize;
  const pipVal    = pipSize * lots * contract;
  const quoteUSD  = ACCT_RATES[pairData.quote] || 1;
  const acctUSD   = ACCT_RATES[acct] || 1;
  const profitUSD = priceDiff * lots * contract * quoteUSD;
  const profitAcct= profitUSD / acctUSD;
  const isProfit  = profitAcct >= 0;

  out.className = isProfit ? 'output-box success' : 'output-box error';
  out.textContent =
    `Direction:         ${dir.toUpperCase()}\n` +
    `Pair:              ${pair}\n` +
    `Entry:             ${entry}\n` +
    `Exit:              ${exit}\n` +
    `Lots:              ${lots}\n` +
    `─────────────────────────────────\n` +
    `Pips ${isProfit?'gained':'lost'}:       ${Math.abs(pips).toFixed(1)} pips\n` +
    `${isProfit?'PROFIT':'LOSS'}:             ${isProfit?'+':''}${formatCur(profitAcct)} ${acct}\n\n` +
    `── Scenarios ─────────────────────\n` +
    [-100,-50,-20,-10,10,20,50,100].map(p => {
      const pl = p * pipSize * lots * contract * quoteUSD / acctUSD;
      return `  ${String(p+'p').padEnd(6)} → ${pl>=0?'+':''}${formatCur(pl)} ${acct}`;
    }).join('\n');
  setStatus('fp-status', isProfit?'ok':'err',
    `${isProfit?'Profit':'Loss'}: ${isProfit?'+':''}${formatCur(profitAcct)} ${acct}`);
}
function fpClear() {
  ['fp-lots','fp-entry','fp-exit'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const o=document.getElementById('fp-output');
  if(o){o.textContent='';o.className='output-box';}
  setStatus('fp-status','','enter trade details');
}

/* ── PIVOT POINT CALCULATOR ── */
function pivotCalc() {
  const high   = parseFloat(document.getElementById('pp-high')?.value);
  const low    = parseFloat(document.getElementById('pp-low')?.value);
  const close  = parseFloat(document.getElementById('pp-close')?.value);
  const method = document.getElementById('pp-method')?.value || 'standard';
  const out    = document.getElementById('pp-output');
  if (!out) return;
  if (isNaN(high)||isNaN(low)||isNaN(close)||high<=0) {
    out.textContent='Enter High, Low, and Close prices.'; out.className='output-box error'; return;
  }

  const P = (high+low+close)/3;
  let levels = {};

  if (method==='standard') {
    const R1=2*P-low, S1=2*P-high;
    const R2=P+(high-low), S2=P-(high-low);
    const R3=high+2*(P-low), S3=low-2*(high-P);
    levels = { R3,R2,R1, PP:P, S1,S2,S3 };
  } else if (method==='fibonacci') {
    const range=high-low;
    levels = {
      R3: P+range*1.000, R2: P+range*0.618, R1: P+range*0.382,
      PP: P,
      S1: P-range*0.382, S2: P-range*0.618, S3: P-range*1.000,
    };
  } else if (method==='camarilla') {
    const range=high-low;
    levels = {
      R4: close+range*1.1/2, R3: close+range*1.1/4, R2: close+range*1.1/6, R1: close+range*1.1/12,
      PP: P,
      S1: close-range*1.1/12, S2: close-range*1.1/6, S3: close-range*1.1/4, S4: close-range*1.1/2,
    };
  } else if (method==='woodie') {
    const Pw=(high+low+2*close)/4;
    levels = {
      R2: Pw+high-low, R1: 2*Pw-low,
      PP: Pw,
      S1: 2*Pw-high, S2: Pw-high+low,
    };
  }

  const fmt = n => parseFloat(n.toFixed(5));
  const lines = Object.entries(levels).map(([k,v]) => {
    const bar = k==='PP' ? '━' : k.startsWith('R') ? '▲' : '▼';
    return `  ${bar} ${k.padEnd(4)} ${fmt(v)}`;
  });

  out.className = 'output-box success';
  out.textContent =
    `Method: ${method.charAt(0).toUpperCase()+method.slice(1)}\n` +
    `High: ${high}  Low: ${low}  Close: ${close}\n` +
    `─────────────────────────────────\n` +
    lines.join('\n') + '\n\n' +
    `▲ = Resistance  ▼ = Support  ━ = Pivot`;
  setStatus('pp-status','ok','✓ levels calculated');
}
function ppClear() {
  ['pp-high','pp-low','pp-close'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const o=document.getElementById('pp-output');
  if(o){o.textContent='';o.className='output-box';}
  setStatus('pp-status','','enter high, low, close');
}

/* ── FIBONACCI CALCULATOR ── */
function fibCalc() {
  const high   = parseFloat(document.getElementById('fib-high')?.value);
  const low    = parseFloat(document.getElementById('fib-low')?.value);
  const trend  = document.getElementById('fib-trend')?.value || 'uptrend';
  const out    = document.getElementById('fib-output');
  if (!out) return;
  if (isNaN(high)||isNaN(low)||high<=0||low<=0) {
    out.textContent='Enter High and Low prices.'; out.className='output-box error'; return;
  }
  if (high<=low) {
    out.textContent='High must be greater than Low.'; out.className='output-box error'; return;
  }

  const range = high-low;
  const RET_LEVELS = [0,0.236,0.382,0.5,0.618,0.786,1.0];
  const EXT_LEVELS = [1.272,1.414,1.618,2.0,2.618];
  const fmt = n => parseFloat(n.toFixed(5));

  let retLines, extLines;
  if (trend==='uptrend') {
    retLines = RET_LEVELS.map(l => `  ${(l*100).toFixed(1).padEnd(7)}% → ${fmt(high-range*l)}`);
    extLines = EXT_LEVELS.map(l => `  ${(l*100).toFixed(1).padEnd(7)}% → ${fmt(low+range*l)}`);
  } else {
    retLines = RET_LEVELS.map(l => `  ${(l*100).toFixed(1).padEnd(7)}% → ${fmt(low+range*l)}`);
    extLines = EXT_LEVELS.map(l => `  ${(l*100).toFixed(1).padEnd(7)}% → ${fmt(high-range*l)}`);
  }

  out.className = 'output-box success';
  out.textContent =
    `Trend:   ${trend==='uptrend'?'↑ Uptrend (High→Low retracement)':'↓ Downtrend (Low→High retracement)'}\n` +
    `High:    ${high}\n` +
    `Low:     ${low}\n` +
    `Range:   ${fmt(range)}\n` +
    `─────────────────────────────────\n` +
    `── Retracement Levels ───────────\n` +
    retLines.join('\n') + '\n\n' +
    `── Extension Levels ─────────────\n` +
    extLines.join('\n') + '\n\n' +
    `Key levels: 38.2%, 50%, 61.8% (golden ratio)`;
  setStatus('fib-status','ok','✓ Fib levels calculated');
}
function fibClear() {
  ['fib-high','fib-low'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const o=document.getElementById('fib-output');
  if(o){o.textContent='';o.className='output-box';}
  setStatus('fib-status','','enter high and low prices');
}

/* ── COMPOUND TRADING CALCULATOR ── */
function compoundTradeCalc() {
  const balance  = parseFloat(document.getElementById('ct-balance')?.value);
  const monthly  = parseFloat(document.getElementById('ct-monthly')?.value);
  const months   = parseInt(document.getElementById('ct-months')?.value) || 12;
  const withdraw = parseFloat(document.getElementById('ct-withdraw')?.value) || 0;
  const out      = document.getElementById('ct-output');
  if (!out) return;
  if (isNaN(balance)||isNaN(monthly)||balance<=0) {
    out.textContent='Enter starting balance and monthly return %.'; out.className='output-box error'; return;
  }

  let bal = balance;
  let totalWithdrawn = 0;
  const rows = [];
  const rate = monthly/100;

  for (let m=1; m<=Math.min(months,120); m++) {
    const profit = bal*rate;
    const wd = Math.min(withdraw, profit);
    bal = bal+profit-wd;
    totalWithdrawn += wd;
    if (m<=12 || m%6===0 || m===months) {
      rows.push(`  Mo ${String(m).padStart(3)}: $${formatCur(bal).padStart(12)} ${wd>0?`(withdrew $${formatCur(wd)})`:'(compounding)'}`);
    }
  }

  const totalProfit = bal+totalWithdrawn-balance;
  out.className = 'output-box success';
  out.textContent =
    `Start:             $${formatCur(balance)}\n` +
    `Monthly return:    ${monthly}%\n` +
    `Period:            ${months} months\n` +
    `Monthly withdraw:  $${formatCur(withdraw)}\n` +
    `─────────────────────────────────\n` +
    rows.join('\n') + '\n\n' +
    `─────────────────────────────────\n` +
    `Final Balance:     $${formatCur(bal)}\n` +
    `Total Withdrawn:   $${formatCur(totalWithdrawn)}\n` +
    `Total Profit:      $${formatCur(totalProfit)}\n` +
    `Return on Capital: ${((totalProfit/balance)*100).toFixed(1)}%`;
  setStatus('ct-status','ok',`✓ Final: $${formatCur(bal)}`);
}
function ctClear() {
  ['ct-balance','ct-monthly','ct-months','ct-withdraw'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const o=document.getElementById('ct-output');
  if(o){o.textContent='';o.className='output-box';}
  setStatus('ct-status','','enter account details');
}

/* ── RISK OF RUIN CALCULATOR ── */
function rorCalc() {
  const winRate = parseFloat(document.getElementById('ror-winrate')?.value)/100;
  const rr      = parseFloat(document.getElementById('ror-rr')?.value);
  const riskPct = parseFloat(document.getElementById('ror-risk')?.value)/100;
  const out     = document.getElementById('ror-output');
  if (!out) return;
  if (isNaN(winRate)||isNaN(rr)||isNaN(riskPct)||winRate<=0||winRate>=1) {
    out.textContent='Enter valid win rate (1–99%), R:R ratio, and risk %.'; out.className='output-box error'; return;
  }

  const lossRate  = 1-winRate;
  const avgWin    = riskPct*rr;
  const avgLoss   = riskPct;
  const expectancy= (winRate*avgWin) - (lossRate*avgLoss);

  // Risk of Ruin formula (simplified)
  // RoR = ((1-edge)/(1+edge))^(capital/risk)
  const edge = (winRate*rr - lossRate) / (winRate*rr + lossRate);
  let ror;
  if (edge <= 0) {
    ror = 100;
  } else {
    const ratio = (1-edge)/(1+edge);
    ror = Math.pow(ratio, 1/riskPct)*100;
    ror = Math.min(100, Math.max(0, ror));
  }

  // Consecutive losses to blow account
  const consec = Math.ceil(Math.log(0.01)/Math.log(1-riskPct));

  const expClass = expectancy>0 ? 'POSITIVE ✓' : 'NEGATIVE ✗';

  out.className = expectancy>0 ? 'output-box success' : 'output-box error';
  out.textContent =
    `Win Rate:          ${(winRate*100).toFixed(1)}%\n` +
    `Risk:Reward:       1 : ${rr}\n` +
    `Risk per trade:    ${(riskPct*100).toFixed(1)}%\n` +
    `─────────────────────────────────\n` +
    `Expectancy:        ${expectancy>=0?'+':''}${(expectancy*100).toFixed(3)}% per trade\n` +
    `Expectancy:        ${expClass}\n` +
    `Edge:              ${(edge*100).toFixed(2)}%\n` +
    `Risk of Ruin:      ${ror.toFixed(2)}%\n\n` +
    `Consecutive losses\nto blow account:   ${consec} trades\n\n` +
    `── Verdict ───────────────────────\n` +
    (expectancy>0
      ? `Strategy is PROFITABLE over time.\nRisk of ruin: ${ror<5?'LOW ✓':ror<20?'MODERATE ⚠':'HIGH ✗'}`
      : `Strategy is NOT profitable.\nReduce risk, improve win rate, or increase R:R.`);
  setStatus('ror-status', expectancy>0?'ok':'err',
    `Expectancy: ${expectancy>=0?'+':''}${(expectancy*100).toFixed(3)}%`);
}
function rorClear() {
  ['ror-winrate','ror-rr','ror-risk'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const o=document.getElementById('ror-output');
  if(o){o.textContent='';o.className='output-box';}
  setStatus('ror-status','','enter strategy parameters');
}

/* ── LEVERAGE CALCULATOR ── */
function leverageCalc() {
  const balance  = parseFloat(document.getElementById('lev-balance')?.value);
  const leverage = parseFloat(document.getElementById('lev-leverage')?.value);
  const lots     = parseFloat(document.getElementById('lev-lots')?.value);
  const price    = parseFloat(document.getElementById('lev-price')?.value) || 1;
  const out      = document.getElementById('lev-output');
  if (!out) return;
  if (isNaN(balance)||isNaN(leverage)||isNaN(lots)||balance<=0||leverage<=0) {
    out.textContent='Enter balance, leverage, and lot size.'; out.className='output-box error'; return;
  }

  const contract  = 100000;
  const notional  = lots*contract*price;
  const margin    = notional/leverage;
  const freeMargin= balance-margin;
  const marginPct = (margin/balance)*100;
  const maxLots   = (balance*leverage)/(contract*price);

  out.className = 'output-box success';
  out.textContent =
    `Account Balance:   $${formatCur(balance)}\n` +
    `Leverage:          1 : ${leverage}\n` +
    `Position:          ${lots} lots @ ${price}\n` +
    `─────────────────────────────────\n` +
    `Notional Value:    $${formatCur(notional)}\n` +
    `Required Margin:   $${formatCur(margin)}\n` +
    `Free Margin:       $${formatCur(freeMargin)}\n` +
    `Margin Used:       ${marginPct.toFixed(2)}%\n` +
    `Max Lots Possible: ${maxLots.toFixed(3)} lots\n\n` +
    `── Leverage comparison ───────────\n` +
    [10,20,50,100,200,500].map(l => {
      const m = notional/l;
      return `  1:${String(l).padEnd(4)} → margin $${formatCur(m)} (${(m/balance*100).toFixed(1)}% of balance)`;
    }).join('\n');
  setStatus('lev-status','ok',`✓ Margin: $${formatCur(margin)}`);
}
function levClear() {
  ['lev-balance','lev-leverage','lev-lots','lev-price'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const o=document.getElementById('lev-output');
  if(o){o.textContent='';o.className='output-box';}
  setStatus('lev-status','','enter account details');
}

/* ── STOP LOSS & TAKE PROFIT CALCULATOR ── */
function slTpCalc() {
  const entry   = parseFloat(document.getElementById('sl-entry')?.value);
  const riskAmt = parseFloat(document.getElementById('sl-risk')?.value);
  const rr      = parseFloat(document.getElementById('sl-rr')?.value) || 2;
  const lots    = parseFloat(document.getElementById('sl-lots')?.value) || 1;
  const pair    = document.getElementById('sl-pair')?.value || 'EUR/USD';
  const dir     = document.getElementById('sl-dir')?.value || 'buy';
  const out     = document.getElementById('sl-output');
  if (!out) return;
  if (isNaN(entry)||isNaN(riskAmt)||entry<=0||riskAmt<=0) {
    out.textContent='Enter entry price and risk amount.'; out.className='output-box error'; return;
  }

  const pairData = PIP_PAIRS[pair] || { pipPos:4, quote:'USD' };
  const pipSize  = Math.pow(10, -pairData.pipPos);
  const contract = pairData.contract || 100000;
  const quoteUSD = ACCT_RATES[pairData.quote] || 1;

  // SL pips from risk amount
  const pipValueUSD = pipSize * lots * contract * quoteUSD;
  const slPips = riskAmt / pipValueUSD;
  const tpPips = slPips * rr;

  const slPrice = dir==='buy' ? entry-slPips*pipSize : entry+slPips*pipSize;
  const tpPrice = dir==='buy' ? entry+tpPips*pipSize : entry-tpPips*pipSize;
  const tpProfit = riskAmt * rr;

  const fmt5 = n => parseFloat(n.toFixed(pairData.pipPos));

  out.className = 'output-box success';
  out.textContent =
    `Direction:         ${dir.toUpperCase()}\n` +
    `Pair:              ${pair}\n` +
    `Entry:             ${entry}\n` +
    `Lots:              ${lots}\n` +
    `Risk Amount:       $${formatCur(riskAmt)}\n` +
    `R:R Ratio:         1 : ${rr}\n` +
    `─────────────────────────────────\n` +
    `Stop Loss:         ${fmt5(slPrice)}  (${slPips.toFixed(1)} pips)\n` +
    `Take Profit:       ${fmt5(tpPrice)}  (${tpPips.toFixed(1)} pips)\n` +
    `─────────────────────────────────\n` +
    `Max Loss:          -$${formatCur(riskAmt)}\n` +
    `Target Profit:     +$${formatCur(tpProfit)}\n\n` +
    `── Multiple TP levels ────────────\n` +
    [1,1.5,2,2.5,3,4,5].map(r => {
      const tp = dir==='buy' ? entry+slPips*r*pipSize : entry-slPips*r*pipSize;
      return `  1:${String(r).padEnd(4)} TP ${fmt5(tp).toString().padEnd(10)} +$${formatCur(riskAmt*r)}`;
    }).join('\n');
  setStatus('sl-status','ok',`SL: ${fmt5(slPrice)} · TP: ${fmt5(tpPrice)}`);
}
function slClear() {
  ['sl-entry','sl-risk','sl-rr','sl-lots'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const o=document.getElementById('sl-output');
  if(o){o.textContent='';o.className='output-box';}
  setStatus('sl-status','','enter trade details');
}

/* ════════════════════════════════════
   BATCH 5 — QR CODE GENERATOR
   Uses qrcodejs library loaded in HTML
   ════════════════════════════════════ */
function qrGenerate() {
  const text    = document.getElementById('qr-text')?.value?.trim();
  const size    = parseInt(document.getElementById('qr-size')?.value) || 256;
  const fgColor = document.getElementById('qr-fg')?.value || '#000000';
  const bgColor = document.getElementById('qr-bg')?.value || '#ffffff';
  const out     = document.getElementById('qr-output');
  const status  = document.getElementById('qr-status');
  if (!out) return;
  if (!text) {
    out.innerHTML = '';
    setStatus('qr-status', '', 'enter text or URL');
    return;
  }
  out.innerHTML = '';
  try {
    new QRCode(out, {
      text: text,
      width: size,
      height: size,
      colorDark: fgColor,
      colorLight: bgColor,
      correctLevel: QRCode.CorrectLevel.H,
    });
    setStatus('qr-status', 'ok', `✓ QR code ready — ${text.length} chars`);
    // Show download buttons
    const dlRow = document.getElementById('qr-download-row');
    if (dlRow) dlRow.style.display = 'flex';
  } catch(e) {
    out.innerHTML = '<span style="color:var(--red);font-size:.8rem">Error: ' + e.message + '</span>';
    setStatus('qr-status', 'err', '✗ ' + e.message);
  }
}

function qrDownloadPNG() {
  const canvas = document.querySelector('#qr-output canvas');
  if (!canvas) { showToast('Generate a QR code first'); return; }
  const a = document.createElement('a');
  a.download = 'qrcode-toolsnova.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
}

function qrDownloadSVG() {
  const canvas = document.querySelector('#qr-output canvas');
  if (!canvas) { showToast('Generate a QR code first'); return; }
  const size = canvas.width;
  const ctx  = canvas.getContext('2d');
  const img  = ctx.getImageData(0, 0, size, size);
  const cell = 1;
  let rects  = '';
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      if (img.data[i] < 128) {
        rects += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
      }
    }
  }
  const fg = document.getElementById('qr-fg')?.value || '#000000';
  const bg = document.getElementById('qr-bg')?.value || '#ffffff';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="${bg}"/><g fill="${fg}">${rects}</g></svg>`;
  const a = document.createElement('a');
  a.download = 'qrcode-toolsnova.svg';
  a.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  a.click();
}

function qrSetPreset(val) {
  const inp = document.getElementById('qr-text');
  if (inp) { inp.value = val; qrGenerate(); }
  document.querySelectorAll('.qr-preset').forEach(b =>
    b.classList.toggle('active', b.dataset.val === val)
  );
}

function qrClear() {
  const t = document.getElementById('qr-text');
  const o = document.getElementById('qr-output');
  const d = document.getElementById('qr-download-row');
  if (t) t.value = '';
  if (o) o.innerHTML = '';
  if (d) d.style.display = 'none';
  setStatus('qr-status', '', 'enter text or URL');
}

/* ════════════════════════════════════
   BATCH 5 — IMAGE COMPRESSOR
   Uses Canvas API — fully client-side
   ════════════════════════════════════ */
let imgOriginalFile = null;

function imgHandleDrop(e) {
  e.preventDefault();
  const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
  if (file) imgLoadFile(file);
}

function imgLoadFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    setStatus('img-status', 'err', '✗ Please select an image file');
    return;
  }
  imgOriginalFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.getElementById('img-preview-orig');
    if (img) {
      img.src = e.target.result;
      img.style.display = 'block';
    }
    const origSize = document.getElementById('img-orig-size');
    if (origSize) origSize.textContent = imgFmtSize(file.size);
    const origName = document.getElementById('img-orig-name');
    if (origName) origName.textContent = file.name;
    document.getElementById('img-drop-hint').style.display = 'none';
    document.getElementById('img-info-row').style.display = 'flex';
    imgCompress();
  };
  reader.readAsDataURL(file);
}

function imgCompress() {
  if (!imgOriginalFile) return;
  const quality = (parseInt(document.getElementById('img-quality')?.value) || 80) / 100;
  const format  = document.getElementById('img-format')?.value || 'image/jpeg';
  const reader  = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (format === 'image/png') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const prev = document.getElementById('img-preview-comp');
        if (prev) { prev.src = url; prev.style.display = 'block'; }
        const saving = ((1 - blob.size / imgOriginalFile.size) * 100);
        const compSize = document.getElementById('img-comp-size');
        if (compSize) compSize.textContent = imgFmtSize(blob.size);
        const savEl = document.getElementById('img-saving');
        if (savEl) {
          savEl.textContent = saving > 0 ? `${saving.toFixed(1)}% smaller` : 'no change';
          savEl.style.color = saving > 0 ? 'var(--accent)' : 'var(--text3)';
        }
        const dlBtn = document.getElementById('img-dl-btn');
        if (dlBtn) {
          dlBtn.style.display = 'inline-block';
          dlBtn.onclick = () => {
            const a = document.createElement('a');
            const ext = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg';
            a.download = imgOriginalFile.name.replace(/\.[^.]+$/, '') + '-compressed.' + ext;
            a.href = url;
            a.click();
          };
        }
        setStatus('img-status', 'ok', `✓ ${imgFmtSize(blob.size)} · saved ${saving.toFixed(1)}%`);
        document.getElementById('img-result-row').style.display = 'flex';
      }, format, quality);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(imgOriginalFile);
}

function imgFmtSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/1024/1024).toFixed(2) + ' MB';
}

function imgQualityUpdate() {
  const v = document.getElementById('img-quality')?.value;
  const d = document.getElementById('img-quality-display');
  if (d) d.textContent = v + '%';
  imgCompress();
}

function imgReset() {
  imgOriginalFile = null;
  ['img-preview-orig','img-preview-comp'].forEach(id => {
    const e = document.getElementById(id);
    if (e) { e.src = ''; e.style.display = 'none'; }
  });
  document.getElementById('img-drop-hint').style.display = 'block';
  document.getElementById('img-info-row').style.display  = 'none';
  document.getElementById('img-result-row').style.display = 'none';
  const dl = document.getElementById('img-dl-btn');
  if (dl) dl.style.display = 'none';
  setStatus('img-status', '', 'drop an image or click to upload');
}

/* ════════════════════════════════════
   BATCH 5 — TYPING SPEED TEST
   ════════════════════════════════════ */
const TYPING_TEXTS = [
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump.",
  "Programming is the art of telling another human being what one wants the computer to do. Clean code always looks like it was written by someone who cares.",
  "The best way to predict the future is to invent it. Innovation distinguishes between a leader and a follower. Stay hungry, stay foolish.",
  "In the beginning was the Word, and the Word was with God. All the world is a stage and all the men and women merely players.",
  "To be or not to be, that is the question. Whether tis nobler in the mind to suffer the slings and arrows of outrageous fortune.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. The secret of getting ahead is getting started.",
  "A journey of a thousand miles begins with a single step. Life is what happens when you are busy making other plans. Keep it simple.",
  "The only way to do great work is to love what you do. If you have not found it yet, keep looking. Do not settle for less than your best.",
];

let typingState = {
  active: false, started: false, finished: false,
  startTime: 0, timerInterval: null,
  duration: 60, remaining: 60,
  currentText: '', typed: '',
  errors: 0, keystrokes: 0,
};

function typingInit(duration) {
  clearInterval(typingState.timerInterval);
  typingState = {
    active: false, started: false, finished: false,
    startTime: 0, timerInterval: null,
    duration: duration || typingState.duration,
    remaining: duration || typingState.duration,
    currentText: '', typed: '',
    errors: 0, keystrokes: 0,
  };
  // Pick random text
  typingState.currentText = TYPING_TEXTS[Math.floor(Math.random() * TYPING_TEXTS.length)];
  typingRender();
  const inp = document.getElementById('typing-input');
  if (inp) { inp.value = ''; inp.disabled = false; inp.placeholder = 'Start typing...'; }
  document.getElementById('typing-timer').textContent = typingState.duration + 's';
  document.getElementById('typing-wpm').textContent   = '0';
  document.getElementById('typing-acc').textContent   = '100%';
  document.getElementById('typing-errors').textContent = '0';
  const res = document.getElementById('typing-result');
  if (res) res.style.display = 'none';
  const restartBtn = document.getElementById('typing-restart-btn');
  if (restartBtn) restartBtn.style.display = 'none';
}

function typingRender() {
  const display = document.getElementById('typing-display');
  if (!display) return;
  const text   = typingState.currentText;
  const typed  = typingState.typed;
  let html = '';
  for (let i = 0; i < text.length; i++) {
    if (i < typed.length) {
      const correct = typed[i] === text[i];
      html += `<span class="tc-${correct?'ok':'err'}">${text[i] === ' ' ? '&nbsp;' : text[i]}</span>`;
    } else if (i === typed.length) {
      html += `<span class="tc-cursor">${text[i] === ' ' ? '&nbsp;' : text[i]}</span>`;
    } else {
      html += `<span class="tc-pending">${text[i] === ' ' ? '&nbsp;' : text[i]}</span>`;
    }
  }
  display.innerHTML = html;
}

function typingOnInput(e) {
  const inp  = document.getElementById('typing-input');
  if (!inp || typingState.finished) return;
  const val  = inp.value;

  if (!typingState.started) {
    typingState.started = true;
    typingState.active  = true;
    typingState.startTime = Date.now();
    typingState.timerInterval = setInterval(typingTick, 200);
  }

  typingState.typed = val;
  typingState.keystrokes++;

  let errors = 0;
  for (let i = 0; i < val.length; i++) {
    if (val[i] !== typingState.currentText[i]) errors++;
  }
  typingState.errors = errors;

  typingRender();

  const elapsed = (Date.now() - typingState.startTime) / 60000;
  const words   = val.trim().split(/\s+/).length;
  const wpm     = elapsed > 0 ? Math.round(words / elapsed) : 0;
  const acc     = val.length > 0 ? Math.round(((val.length - errors) / val.length) * 100) : 100;

  document.getElementById('typing-wpm').textContent    = wpm;
  document.getElementById('typing-acc').textContent    = acc + '%';
  document.getElementById('typing-errors').textContent = errors;

  // Check if finished
  if (val === typingState.currentText) {
    typingFinish();
  }
}

function typingTick() {
  const elapsed = Math.floor((Date.now() - typingState.startTime) / 1000);
  typingState.remaining = Math.max(0, typingState.duration - elapsed);
  document.getElementById('typing-timer').textContent = typingState.remaining + 's';
  if (typingState.remaining === 0) typingFinish();
}

function typingFinish() {
  if (typingState.finished) return;
  typingState.finished = true;
  clearInterval(typingState.timerInterval);

  const inp = document.getElementById('typing-input');
  if (inp) inp.disabled = true;

  const elapsed  = (Date.now() - typingState.startTime) / 60000;
  const typed    = typingState.typed;
  const words    = typed.trim().split(/\s+/).length;
  const wpm      = elapsed > 0 ? Math.round(words / elapsed) : 0;
  const errors   = typingState.errors;
  const acc      = typed.length > 0 ? Math.round(((typed.length - errors) / typed.length) * 100) : 100;

  let grade = wpm >= 80 ? 'Excellent' : wpm >= 60 ? 'Good' : wpm >= 40 ? 'Average' : 'Keep practising';

  const res = document.getElementById('typing-result');
  if (res) {
    res.innerHTML =
      `<div style="text-align:center;padding:1rem">` +
      `<div style="font-size:2.5rem;font-weight:700;color:var(--accent)">${wpm}</div>` +
      `<div style="font-size:.8rem;color:var(--text3);margin-bottom:.5rem">WPM</div>` +
      `<div style="font-size:1rem;color:var(--text2)">${grade}</div>` +
      `<div style="margin-top:.75rem;display:flex;gap:1rem;justify-content:center;font-size:.78rem;color:var(--text3)">` +
      `<span>Accuracy: <strong style="color:var(--text)">${acc}%</strong></span>` +
      `<span>Errors: <strong style="color:var(--red)">${errors}</strong></span>` +
      `<span>Time: <strong style="color:var(--text)">${Math.round(elapsed*60)}s</strong></span>` +
      `</div></div>`;
    res.style.display = 'block';
  }
  const rb = document.getElementById('typing-restart-btn');
  if (rb) rb.style.display = 'inline-block';
}

function typingSetDuration(d) {
  document.querySelectorAll('.typing-dur-btn').forEach(b =>
    b.classList.toggle('active', parseInt(b.dataset.dur) === d)
  );
  typingInit(d);
  document.getElementById('typing-input')?.focus();
}

/* ════════════════════════════════════
   BATCH 5 — POMODORO TIMER
   ════════════════════════════════════ */
let pomState = {
  mode: 'work', // work | short | long
  running: false,
  interval: null,
  seconds: 25 * 60,
  sessions: 0,
  config: { work: 25, short: 5, long: 15 },
};

function pomInit() {
  pomStop();
  pomState.seconds = pomState.config[pomState.mode] * 60;
  pomUpdateDisplay();
}

function pomStart() {
  if (pomState.running) return;
  pomState.running = true;
  const startBtn = document.getElementById('pom-start');
  const pauseBtn = document.getElementById('pom-pause');
  if (startBtn) startBtn.style.display = 'none';
  if (pauseBtn) pauseBtn.style.display = 'inline-block';
  pomState.interval = setInterval(pomTick, 1000);
}

function pomPause() {
  pomState.running = false;
  clearInterval(pomState.interval);
  const startBtn = document.getElementById('pom-start');
  const pauseBtn = document.getElementById('pom-pause');
  if (startBtn) startBtn.style.display = 'inline-block';
  if (pauseBtn) pauseBtn.style.display = 'none';
}

function pomStop() {
  pomState.running = false;
  clearInterval(pomState.interval);
  pomState.seconds = pomState.config[pomState.mode] * 60;
  pomUpdateDisplay();
  const startBtn = document.getElementById('pom-start');
  const pauseBtn = document.getElementById('pom-pause');
  if (startBtn) startBtn.style.display = 'inline-block';
  if (pauseBtn) pauseBtn.style.display = 'none';
}

function pomTick() {
  if (pomState.seconds <= 0) {
    clearInterval(pomState.interval);
    pomState.running = false;
    if (pomState.mode === 'work') pomState.sessions++;
    // Play sound
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start(); osc.stop(ctx.currentTime + 0.8);
    } catch(_) {}
    pomUpdateDisplay();
    const sessions = document.getElementById('pom-sessions');
    if (sessions) sessions.textContent = pomState.sessions;
    const startBtn = document.getElementById('pom-start');
    const pauseBtn = document.getElementById('pom-pause');
    if (startBtn) startBtn.style.display = 'inline-block';
    if (pauseBtn) pauseBtn.style.display = 'none';
    return;
  }
  pomState.seconds--;
  pomUpdateDisplay();
}

function pomUpdateDisplay() {
  const m = Math.floor(pomState.seconds / 60);
  const s = pomState.seconds % 60;
  const timeStr = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  const display = document.getElementById('pom-display');
  if (display) display.textContent = timeStr;
  // Update page title
  document.title = pomState.running ? `${timeStr} — ToolsNova Pomodoro` : 'Pomodoro Timer — ToolsNova';
  // Progress ring
  const total = pomState.config[pomState.mode] * 60;
  const pct   = (total - pomState.seconds) / total;
  const circle = document.getElementById('pom-ring');
  if (circle) {
    const r = 90;
    const circ = 2 * Math.PI * r;
    circle.style.strokeDasharray  = circ;
    circle.style.strokeDashoffset = circ * (1 - pct);
  }
}

function pomSetMode(mode) {
  pomStop();
  pomState.mode = mode;
  document.querySelectorAll('.pom-mode-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.mode === mode)
  );
  const label = document.getElementById('pom-mode-label');
  if (label) label.textContent = mode === 'work' ? 'Focus Time' : mode === 'short' ? 'Short Break' : 'Long Break';
  pomInit();
}

function pomUpdateConfig() {
  const w = parseInt(document.getElementById('pom-work-min')?.value)  || 25;
  const s = parseInt(document.getElementById('pom-short-min')?.value) || 5;
  const l = parseInt(document.getElementById('pom-long-min')?.value)  || 15;
  pomState.config = { work: w, short: s, long: l };
  pomStop();
  pomInit();
  showToast('Timer updated ✓');
}
