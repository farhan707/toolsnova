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
