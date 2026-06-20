/* ════════════════════════════════════════════
   THEME SYSTEM — Light / Dark
   ════════════════════════════════════════════ */
// Theme applied in <head> inline script to prevent flash.
// Just update the button icon once DOM is ready.
document.addEventListener('DOMContentLoaded', () => {
  // Read from html element — already set by inline <head> script, no localStorage needed
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  _updateToggleIcon(current);
});

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('tn-theme', next);
  _updateToggleIcon(next);
}

function _updateToggleIcon(theme) {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.textContent = theme === 'dark' ? '🌙' : '☀️';
  btn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  // Update fixed button colours for light/dark
  if (theme === 'light') {
    btn.style.background = '#ffffff';
    btn.style.color = '#111112';
    btn.style.border = '2px solid rgba(26,138,10,0.4)';
  } else {
    btn.style.background = '#141416';
    btn.style.color = '#f0f0f2';
    btn.style.border = '2px solid rgba(127,255,111,0.4)';
  }
}

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
  // Parse directly from YYYY-MM-DD to avoid timezone shift
  const [by,bm,bd] = dob.split('-').map(Number);
  const birth = new Date(by, bm-1, bd);
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

/* ════════════════════════════════════
   BATCH 6 — HEALTH & FITNESS TOOLS
   ════════════════════════════════════ */

/* ── CALORIE CALCULATOR ── */
function calorieCalc() {
  const age      = parseInt(document.getElementById('cal-age')?.value);
  const gender   = document.getElementById('cal-gender')?.value || 'male';
  const weightKg = parseFloat(document.getElementById('cal-weight')?.value);
  const heightCm = parseFloat(document.getElementById('cal-height')?.value);
  const activity = parseFloat(document.getElementById('cal-activity')?.value) || 1.2;
  const goal     = document.getElementById('cal-goal')?.value || 'maintain';
  const unit     = document.getElementById('cal-unit')?.value || 'metric';
  const out      = document.getElementById('cal-output');
  if (!out) return;

  if (isNaN(age)||isNaN(weightKg)||isNaN(heightCm)||age<=0||weightKg<=0||heightCm<=0) {
    out.textContent = 'Please enter valid age, weight, and height.';
    out.className = 'output-box error'; return;
  }

  // Convert if imperial
  let wKg = weightKg, hCm = heightCm;
  if (unit === 'imperial') {
    wKg = weightKg * 0.453592;  // lbs to kg
    hCm = heightCm * 2.54;       // inches to cm
  }

  // Mifflin-St Jeor formula (most accurate)
  let bmr;
  if (gender === 'male') {
    bmr = 10 * wKg + 6.25 * hCm - 5 * age + 5;
  } else {
    bmr = 10 * wKg + 6.25 * hCm - 5 * age - 161;
  }

  const tdee = Math.round(bmr * activity);
  const bmrR = Math.round(bmr);

  const goalCalories = {
    'lose2':   Math.round(tdee - 1000),
    'lose1':   Math.round(tdee - 500),
    'lose0.5': Math.round(tdee - 250),
    'maintain': tdee,
    'gain0.5': Math.round(tdee + 250),
    'gain1':   Math.round(tdee + 500),
  };

  const target = goalCalories[goal] || tdee;
  const protein = Math.round(wKg * 2.2); // g/day
  const fat      = Math.round(target * 0.25 / 9);
  const carbs    = Math.round((target - protein * 4 - fat * 9) / 4);

  const actLabels = {
    '1.2':'Sedentary (little/no exercise)',
    '1.375':'Light (1–3 days/week)',
    '1.55':'Moderate (3–5 days/week)',
    '1.725':'Active (6–7 days/week)',
    '1.9':'Very active (physical job + exercise)',
  };

  out.className = 'output-box success';
  out.textContent =
    `── Your Results ──────────────────────\n` +
    `BMR (at complete rest):   ${bmrR} kcal/day\n` +
    `TDEE (maintenance):       ${tdee} kcal/day\n` +
    `Activity:                 ${actLabels[String(activity)]||''}\n\n` +
    `── Target: ${goal.replace('lose','Lose ').replace('gain','Gain ').replace('maintain','Maintain weight').replace('0.5',' 0.5 kg/wk').replace('1 ','1 kg/wk').replace('2 ','2 kg/wk')} ──\n` +
    `Daily Calories:           ${target} kcal\n\n` +
    `── Suggested Macros ──────────────────\n` +
    `Protein:  ${protein}g   (${Math.round(protein*4)} kcal, ${Math.round(protein*4/target*100)}%)\n` +
    `Fat:      ${fat}g   (${Math.round(fat*9)} kcal, ${Math.round(fat*9/target*100)}%)\n` +
    `Carbs:    ${carbs}g   (${Math.round(carbs*4)} kcal, ${Math.round(carbs*4/target*100)}%)\n\n` +
    `── Calorie targets by goal ───────────\n` +
    Object.entries(goalCalories).map(([g,c]) =>
      `  ${g.padEnd(9)} → ${c} kcal/day`
    ).join('\n');

  setStatus('cal-status','ok',`✓ TDEE: ${tdee} kcal · Target: ${target} kcal`);
}
function calUnitSwitch() {
  const unit = document.getElementById('cal-unit')?.value;
  const wLabel = document.getElementById('cal-weight-label');
  const hLabel = document.getElementById('cal-height-label');
  const wPH    = document.getElementById('cal-weight');
  const hPH    = document.getElementById('cal-height');
  if (unit === 'imperial') {
    if (wLabel) wLabel.textContent = 'Weight (lbs)';
    if (hLabel) hLabel.textContent = 'Height (inches)';
    if (wPH)  wPH.placeholder = 'e.g. 154';
    if (hPH)  hPH.placeholder = 'e.g. 68';
  } else {
    if (wLabel) wLabel.textContent = 'Weight (kg)';
    if (hLabel) hLabel.textContent = 'Height (cm)';
    if (wPH)  wPH.placeholder = 'e.g. 70';
    if (hPH)  hPH.placeholder = 'e.g. 175';
  }
}
function calClear() {
  ['cal-age','cal-weight','cal-height'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const o=document.getElementById('cal-output');
  if(o){o.textContent='';o.className='output-box';}
  setStatus('cal-status','','fill in your details');
}

/* ── TDEE CALCULATOR ── */
function tdeeCalc() {
  // Reuse calorie calc logic but show full TDEE breakdown
  const age    = parseInt(document.getElementById('tdee-age')?.value);
  const gender = document.getElementById('tdee-gender')?.value || 'male';
  const wKg    = parseFloat(document.getElementById('tdee-weight')?.value);
  const hCm    = parseFloat(document.getElementById('tdee-height')?.value);
  const out    = document.getElementById('tdee-output');
  if (!out) return;
  if (isNaN(age)||isNaN(wKg)||isNaN(hCm)||age<=0) {
    out.textContent='Enter valid age, weight (kg), and height (cm).';
    out.className='output-box error'; return;
  }

  let bmr = gender==='male'
    ? 10*wKg + 6.25*hCm - 5*age + 5
    : 10*wKg + 6.25*hCm - 5*age - 161;
  bmr = Math.round(bmr);

  const levels = [
    ['Sedentary (desk job, no exercise)',        1.2,   'BMR × 1.2'],
    ['Lightly active (1–3 days/week)',           1.375, 'BMR × 1.375'],
    ['Moderately active (3–5 days/week)',        1.55,  'BMR × 1.55'],
    ['Very active (6–7 days/week)',              1.725, 'BMR × 1.725'],
    ['Extremely active (physical job + daily)',  1.9,   'BMR × 1.9'],
  ];

  out.className = 'output-box success';
  out.textContent =
    `BMR (Mifflin-St Jeor):  ${bmr} kcal\n` +
    `Gender: ${gender}  Age: ${age}  Weight: ${wKg}kg  Height: ${hCm}cm\n\n` +
    `── TDEE by activity level ────────────\n` +
    levels.map(([label, mult, formula]) =>
      `  ${Math.round(bmr*mult)} kcal  ${formula}\n  ${label}`
    ).join('\n\n') + '\n\n' +
    `── What to eat per goal ──────────────\n` +
    `  Lose weight fast:  ${Math.round(bmr*1.55-500)} kcal  (moderate activity −500)\n` +
    `  Lose slowly:       ${Math.round(bmr*1.55-250)} kcal  (moderate −250)\n` +
    `  Maintain:          ${Math.round(bmr*1.55)} kcal\n` +
    `  Gain muscle:       ${Math.round(bmr*1.55+300)} kcal  (moderate +300)`;
  setStatus('tdee-status','ok',`✓ BMR: ${bmr} kcal`);
}
function tdeeClear() {
  ['tdee-age','tdee-weight','tdee-height'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const o=document.getElementById('tdee-output');
  if(o){o.textContent='';o.className='output-box';}
  setStatus('tdee-status','','enter your stats');
}

/* ── MACRO CALCULATOR ── */
function macroCalc() {
  const calories = parseInt(document.getElementById('mac-calories')?.value);
  const goal     = document.getElementById('mac-goal')?.value || 'balanced';
  const wKg      = parseFloat(document.getElementById('mac-weight')?.value) || 0;
  const out      = document.getElementById('mac-output');
  if (!out) return;
  if (isNaN(calories)||calories<500) {
    out.textContent='Enter a valid daily calorie target (min 500).';
    out.className='output-box error'; return;
  }

  // Macro splits by goal
  const splits = {
    'lose':     { p:0.40, f:0.30, c:0.30, label:'Weight loss (high protein)' },
    'balanced': { p:0.30, f:0.25, c:0.45, label:'Balanced / maintenance' },
    'muscle':   { p:0.35, f:0.25, c:0.40, label:'Muscle building' },
    'keto':     { p:0.25, f:0.70, c:0.05, label:'Ketogenic (very low carb)' },
    'lowcarb':  { p:0.35, f:0.40, c:0.25, label:'Low carb' },
    'highcarb': { p:0.20, f:0.20, c:0.60, label:'High carb (endurance)' },
  };

  const s = splits[goal] || splits['balanced'];
  const pCal = Math.round(calories * s.p);
  const fCal = Math.round(calories * s.f);
  const cCal = calories - pCal - fCal;
  const pG = Math.round(pCal / 4);
  const fG = Math.round(fCal / 9);
  const cG = Math.round(cCal / 4);
  const minProtein = wKg > 0 ? Math.round(wKg * 1.8) : null;

  out.className = 'output-box success';
  out.textContent =
    `Goal: ${s.label}\n` +
    `Daily target: ${calories} kcal\n\n` +
    `── Macronutrients ────────────────────\n` +
    `Protein:  ${pG}g/day  (${pCal} kcal, ${Math.round(s.p*100)}%)\n` +
    `Fat:      ${fG}g/day  (${fCal} kcal, ${Math.round(s.f*100)}%)\n` +
    `Carbs:    ${cG}g/day  (${cCal} kcal, ${Math.round(s.c*100)}%)\n\n` +
    (minProtein ? `Min protein for muscle retention: ${minProtein}g/day\n(based on ${wKg}kg × 1.8g/kg)\n\n` : '') +
    `── Per meal (3 meals/day) ────────────\n` +
    `Protein:  ${Math.round(pG/3)}g\n` +
    `Fat:      ${Math.round(fG/3)}g\n` +
    `Carbs:    ${Math.round(cG/3)}g\n` +
    `Calories: ${Math.round(calories/3)} kcal\n\n` +
    `── All goal splits at ${calories} kcal ───\n` +
    Object.entries(splits).map(([k,v]) => {
      const p=Math.round(calories*v.p/4), f=Math.round(calories*v.f/9), c=Math.round(calories*v.c/4);
      return `  ${v.label.split(' (')[0].padEnd(22)} P:${p}g F:${f}g C:${c}g`;
    }).join('\n');
  setStatus('mac-status','ok',`✓ P:${pG}g F:${fG}g C:${cG}g`);
}
function macroClear() {
  ['mac-calories','mac-weight'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const o=document.getElementById('mac-output');
  if(o){o.textContent='';o.className='output-box';}
  setStatus('mac-status','','enter calories and goal');
}

/* ── IDEAL WEIGHT CALCULATOR ── */
function idealWeightCalc() {
  const hCm   = parseFloat(document.getElementById('iw-height')?.value);
  const gender= document.getElementById('iw-gender')?.value || 'male';
  const frame = document.getElementById('iw-frame')?.value  || 'medium';
  const out   = document.getElementById('iw-output');
  if (!out) return;
  if (isNaN(hCm)||hCm<100||hCm>250) {
    out.textContent='Enter a valid height in centimetres (100–250).';
    out.className='output-box error'; return;
  }

  const hIn = hCm / 2.54;
  const hFt = Math.floor(hIn / 12);
  const hInR = Math.round(hIn % 12);

  // Multiple formulas
  const hamwi  = gender==='male' ? 48 + 2.7*(hIn-60) : 45.5 + 2.2*(hIn-60);
  const devine = gender==='male' ? 50 + 2.3*(hIn-60) : 45.5 + 2.3*(hIn-60);
  const robinson = gender==='male' ? 52 + 1.9*(hIn-60) : 49 + 1.7*(hIn-60);
  const miller = gender==='male' ? 56.2 + 1.41*(hIn-60) : 53.1 + 1.36*(hIn-60);
  const avg = (hamwi+devine+robinson+miller)/4;

  // Frame adjustment
  const frameAdj = frame==='small' ? -0.1 : frame==='large' ? 0.1 : 0;
  const adjAvg = avg * (1 + frameAdj);

  // BMI-based healthy range (18.5–24.9)
  const hM = hCm / 100;
  const bmiLow  = Math.round(18.5 * hM * hM * 10) / 10;
  const bmiHigh = Math.round(24.9 * hM * hM * 10) / 10;

  const fmt = n => `${Math.round(n)} kg (${Math.round(n*2.205)} lbs)`;

  out.className = 'output-box success';
  out.textContent =
    `Height: ${hCm}cm (${hFt}ft ${hInR}in)  Gender: ${gender}  Frame: ${frame}\n\n` +
    `── Ideal weight by formula ───────────\n` +
    `Hamwi:      ${fmt(hamwi)}\n` +
    `Devine:     ${fmt(devine)}\n` +
    `Robinson:   ${fmt(robinson)}\n` +
    `Miller:     ${fmt(miller)}\n` +
    `─────────────────────────────────────\n` +
    `Average:    ${fmt(avg)}\n` +
    `With ${frame} frame: ${fmt(adjAvg)}\n\n` +
    `── Healthy BMI range (18.5–24.9) ────\n` +
    `Min weight: ${fmt(bmiLow)}\n` +
    `Max weight: ${fmt(bmiHigh)}\n\n` +
    `Note: Ideal weight is a guideline. Muscle mass,\nbone density, and body composition matter more than weight alone.`;
  setStatus('iw-status','ok',`✓ Ideal: ${Math.round(adjAvg)}–${Math.round(bmiHigh)} kg`);
}
function iwClear() {
  const h=document.getElementById('iw-height');
  const o=document.getElementById('iw-output');
  if(h)h.value='';
  if(o){o.textContent='';o.className='output-box';}
  setStatus('iw-status','','enter your height');
}

/* ── BODY FAT CALCULATOR ── */
function bodyFatCalc() {
  const gender = document.getElementById('bf-gender')?.value || 'male';
  const method = document.getElementById('bf-method')?.value || 'navy';
  const out    = document.getElementById('bf-output');
  if (!out) return;

  let bf = NaN;
  let details = '';

  if (method === 'navy') {
    const waist  = parseFloat(document.getElementById('bf-waist')?.value);
    const neck   = parseFloat(document.getElementById('bf-neck')?.value);
    const hip    = parseFloat(document.getElementById('bf-hip')?.value);
    const height = parseFloat(document.getElementById('bf-height-bf')?.value);
    if (isNaN(waist)||isNaN(neck)||isNaN(height)) {
      out.textContent='Enter waist, neck, and height measurements.';
      out.className='output-box error'; return;
    }
    if (gender==='male') {
      bf = 495/(1.0324 - 0.19077*Math.log10(waist-neck) + 0.15456*Math.log10(height)) - 450;
    } else {
      if (isNaN(hip)) { out.textContent='Enter hip measurement for female.'; out.className='output-box error'; return; }
      bf = 495/(1.29579 - 0.35004*Math.log10(waist+hip-neck) + 0.22100*Math.log10(height)) - 450;
    }
    details = `Method: US Navy\nMeasurements: Waist ${waist}cm, Neck ${neck}cm${gender==='female'?`, Hip ${hip}cm`:''}, Height ${height}cm`;
  } else if (method === 'bmi') {
    const bmi = parseFloat(document.getElementById('bf-bmi')?.value);
    const age = parseInt(document.getElementById('bf-age-bf')?.value);
    if (isNaN(bmi)||isNaN(age)) {
      out.textContent='Enter BMI and age.'; out.className='output-box error'; return;
    }
    // Deurenberg formula
    bf = 1.2*bmi + 0.23*age - 10.8*(gender==='male'?1:0) - 5.4;
    details = `Method: Deurenberg BMI formula\nBMI: ${bmi}, Age: ${age}`;
  }

  if (isNaN(bf)||bf<0||bf>70) {
    out.textContent='Could not calculate. Check measurements.';
    out.className='output-box error'; return;
  }
  bf = Math.round(bf * 10) / 10;

  // Classification
  const classify = (bf, g) => {
    if (g==='male') {
      if (bf<6)  return 'Essential fat (athletic minimum)';
      if (bf<14) return 'Athletic';
      if (bf<18) return 'Fitness';
      if (bf<25) return 'Average';
      return 'Obese';
    } else {
      if (bf<14) return 'Essential fat';
      if (bf<21) return 'Athletic';
      if (bf<25) return 'Fitness';
      if (bf<32) return 'Average';
      return 'Obese';
    }
  };

  const category = classify(bf, gender);

  out.className = 'output-box success';
  out.textContent =
    `${details}\n\n` +
    `── Result ────────────────────────────\n` +
    `Body Fat:   ${bf}%\n` +
    `Category:   ${category}\n\n` +
    `── ${gender==='male'?'Male':'Female'} body fat ranges ──────────────\n` +
    (gender==='male'
      ? `  Essential fat:   2–5%\n  Athletes:        6–13%\n  Fitness:         14–17%\n  Average:         18–24%\n  Obese:           25%+`
      : `  Essential fat:   10–13%\n  Athletes:        14–20%\n  Fitness:         21–24%\n  Average:         25–31%\n  Obese:           32%+`);
  setStatus('bf-status','ok',`✓ Body fat: ${bf}%  ${category}`);
}
function bfClear() {
  ['bf-waist','bf-neck','bf-hip','bf-height-bf','bf-bmi','bf-age-bf'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const o=document.getElementById('bf-output');
  if(o){o.textContent='';o.className='output-box';}
  setStatus('bf-status','','enter measurements');
}

/* ── WATER INTAKE CALCULATOR ── */
function waterCalc() {
  const wKg    = parseFloat(document.getElementById('wt-weight')?.value);
  const activity = document.getElementById('wt-activity')?.value || 'moderate';
  const climate  = document.getElementById('wt-climate')?.value  || 'temperate';
  const out    = document.getElementById('wt-output');
  if (!out) return;
  if (isNaN(wKg)||wKg<20||wKg>300) {
    out.textContent='Enter a valid weight (20–300 kg).';
    out.className='output-box error'; return;
  }

  // Base: 35ml per kg body weight
  let base = wKg * 35;

  // Activity adjustments
  const actAdj = { sedentary:0, light:350, moderate:700, active:1050, intense:1400 };
  base += actAdj[activity] || 0;

  // Climate adjustments
  const climAdj = { cold:0, temperate:0, warm:350, hot:700, very_hot:1050 };
  base += climAdj[climate] || 0;

  const liters  = (base / 1000).toFixed(1);
  const cups    = Math.round(base / 237);
  const glasses = Math.round(base / 250);
  const bottles = (base / 500).toFixed(1);

  out.className = 'output-box success';
  out.textContent =
    `Weight: ${wKg}kg  Activity: ${activity}  Climate: ${climate}\n\n` +
    `── Daily water intake target ─────────\n` +
    `${liters} litres per day\n` +
    `${Math.round(base)} ml per day\n\n` +
    `── In common containers ──────────────\n` +
    `  ${cups} standard cups    (237ml)\n` +
    `  ${glasses} drinking glasses  (250ml)\n` +
    `  ${bottles} standard bottles  (500ml)\n\n` +
    `── Hourly schedule (16 waking hours) ─\n` +
    `  ${Math.round(base/16)} ml per hour\n` +
    `  ${Math.round(base/8)} ml every 2 hours\n\n` +
    `── Tips ──────────────────────────────\n` +
    `  Drink 500ml on waking (before coffee)\n` +
    `  500ml before and after each workout\n` +
    `  Urine should be pale yellow — dark = dehydrated\n` +
    `  Coffee/tea count toward intake (contrary to myth)`;
  setStatus('wt-status','ok',`✓ ${liters}L/day · ${cups} cups`);
}
function waterClear() {
  const w=document.getElementById('wt-weight');
  const o=document.getElementById('wt-output');
  if(w)w.value='';
  if(o){o.textContent='';o.className='output-box';}
  setStatus('wt-status','','enter your weight');
}

/* ════════════════════════════════════
   BATCH 7 — STUDENT TOOLS
   ════════════════════════════════════ */

/* ── GPA CALCULATOR ── */
let gpaRows = [];
function gpaAddRow() {
  const id = Date.now();
  gpaRows.push({ id, course:'', credits:3, grade:'A' });
  gpaRender();
}
function gpaRemoveRow(id) {
  gpaRows = gpaRows.filter(r => r.id !== id);
  gpaRender();
  gpaCalc();
}
function gpaRender() {
  const tbl = document.getElementById('gpa-table');
  if (!tbl) return;
  const gradeOpts = ['A+','A','A-','B+','B','B-','C+','C','C-','D+','D','D-','F'];
  tbl.innerHTML = gpaRows.map(r => `
    <div style="display:grid;grid-template-columns:1fr 80px 100px 36px;gap:6px;margin-bottom:6px;align-items:center">
      <input type="text" value="${r.course}" placeholder="Course name (optional)"
        class="b2-input" style="font-size:.78rem"
        oninput="gpaRows.find(x=>x.id==${r.id}).course=this.value">
      <input type="number" value="${r.credits}" min="0.5" max="12" step="0.5"
        class="b2-input" style="font-size:.78rem;text-align:center"
        oninput="gpaRows.find(x=>x.id==${r.id}).credits=parseFloat(this.value)||0;gpaCalc()">
      <select class="mode-select" style="font-size:.78rem"
        onchange="gpaRows.find(x=>x.id==${r.id}).grade=this.value;gpaCalc()">
        ${gradeOpts.map(g=>`<option value="${g}"${g===r.grade?' selected':''}>${g}</option>`).join('')}
      </select>
      <button onclick="gpaRemoveRow(${r.id})" style="background:var(--surface2);border:1px solid var(--border);border-radius:5px;color:var(--red);cursor:pointer;font-size:.8rem;height:34px">✕</button>
    </div>`).join('');
}
const GPA_MAP = {'A+':4.3,'A':4.0,'A-':3.7,'B+':3.3,'B':3.0,'B-':2.7,'C+':2.3,'C':2.0,'C-':1.7,'D+':1.3,'D':1.0,'D-':0.7,'F':0};
function gpaCalc() {
  const out = document.getElementById('gpa-output');
  if (!out) return;
  const valid = gpaRows.filter(r => r.credits > 0);
  if (!valid.length) { out.textContent='Add courses to calculate GPA.'; out.className='output-box'; return; }
  let totalPts = 0, totalCreds = 0;
  valid.forEach(r => { const pts = (GPA_MAP[r.grade]||0)*r.credits; totalPts+=pts; totalCreds+=r.credits; });
  const gpa = totalPts / totalCreds;
  const letter = gpa>=3.7?'A':gpa>=3.3?'A-':gpa>=3.0?'B+':gpa>=2.7?'B':gpa>=2.3?'B-':gpa>=2.0?'C':gpa>=1.0?'D':'F';
  out.className = 'output-box success';
  out.textContent =
    `GPA:              ${gpa.toFixed(2)} / 4.0\n` +
    `Letter grade:     ${letter}\n` +
    `Total credits:    ${totalCreds}\n` +
    `Quality points:   ${totalPts.toFixed(2)}\n\n` +
    `── Course breakdown ──────────────────\n` +
    valid.map(r=>`  ${(r.course||'Course').padEnd(20)} ${r.grade.padEnd(4)} ${r.credits}cr → ${((GPA_MAP[r.grade]||0)*r.credits).toFixed(2)}pts`).join('\n') +
    '\n\n── GPA scale reference ─────────────\n' +
    '  4.0 = A   3.7 = A-  3.3 = B+\n  3.0 = B   2.7 = B-  2.3 = C+\n  2.0 = C   1.7 = C-  1.0 = D';
  setStatus('gpa-status','ok',`✓ GPA: ${gpa.toFixed(2)}`);
}
function gpaClear() {
  gpaRows = [];
  gpaRender();
  const o=document.getElementById('gpa-output');
  if(o){o.textContent='';o.className='output-box';}
  setStatus('gpa-status','','add courses to begin');
}

/* ── GRADE CALCULATOR ── */
function gradeCalc() {
  const rows  = document.querySelectorAll('.grade-row');
  const scale = document.getElementById('grade-scale')?.value || 'standard';
  const out   = document.getElementById('grade-output');
  if (!out) return;
  let totalWeighted = 0, totalWeight = 0, items = [];
  rows.forEach(row => {
    const score  = parseFloat(row.querySelector('.grade-score')?.value);
    const total  = parseFloat(row.querySelector('.grade-total')?.value) || 100;
    const weight = parseFloat(row.querySelector('.grade-weight')?.value) || 0;
    const name   = row.querySelector('.grade-name')?.value || 'Assignment';
    if (!isNaN(score) && weight > 0) {
      const pct = (score/total)*100;
      totalWeighted += pct * weight;
      totalWeight   += weight;
      items.push({ name, score, total, weight, pct });
    }
  });
  if (!items.length) { out.textContent='Add at least one graded item.'; out.className='output-box'; return; }
  const grade = totalWeight > 0 ? totalWeighted / totalWeight : 0;
  const toGPA = g => g>=90?4.0:g>=80?3.0:g>=70?2.0:g>=60?1.0:0;
  const toLetter = g => g>=97?'A+':g>=93?'A':g>=90?'A-':g>=87?'B+':g>=83?'B':g>=80?'B-':g>=77?'C+':g>=73?'C':g>=70?'C-':g>=67?'D+':g>=63?'D':g>=60?'D-':'F';
  out.className = 'output-box success';
  out.textContent =
    `Current grade:    ${grade.toFixed(2)}%  (${toLetter(grade)})  GPA: ${toGPA(grade).toFixed(1)}\n` +
    `Weight used:      ${totalWeight}%\n\n` +
    `── Assignment breakdown ──────────────\n` +
    items.map(i=>`  ${i.name.padEnd(18)} ${i.score}/${i.total} (${i.pct.toFixed(1)}%) × ${i.weight}% = ${(i.pct*i.weight/100).toFixed(2)}pts`).join('\n') +
    `\n\n── What you need on remaining ${(100-totalWeight).toFixed(0)}% ──\n` +
    [60,70,80,90,95].map(target => {
      const rem = 100-totalWeight;
      if (rem <= 0) return `  N/A (all weight assigned)`;
      const needed = (target*100 - totalWeighted) / rem;
      return `  To get ${target}%: need ${needed.toFixed(1)}% on remaining work`;
    }).join('\n');
  setStatus('grade-status','ok',`✓ ${grade.toFixed(1)}%  ${toLetter(grade)}`);
}
function gradeAddRow() {
  const cont = document.getElementById('grade-rows');
  if (!cont) return;
  const div = document.createElement('div');
  div.className = 'grade-row';
  div.style = 'display:grid;grid-template-columns:1fr 70px 70px 70px 36px;gap:6px;margin-bottom:6px;align-items:center';
  div.innerHTML = `
    <input class="b2-input grade-name" placeholder="Assignment" style="font-size:.78rem" oninput="gradeCalc()">
    <input class="b2-input grade-score" placeholder="Score" type="number" style="font-size:.78rem" oninput="gradeCalc()">
    <input class="b2-input grade-total" placeholder="Total" type="number" value="100" style="font-size:.78rem" oninput="gradeCalc()">
    <input class="b2-input grade-weight" placeholder="Weight%" type="number" style="font-size:.78rem" oninput="gradeCalc()">
    <button onclick="this.parentElement.remove();gradeCalc()" style="background:var(--surface2);border:1px solid var(--border);border-radius:5px;color:var(--red);cursor:pointer;font-size:.8rem;height:34px">✕</button>`;
  cont.appendChild(div);
  gradeCalc();
}
function gradeClear() {
  const cont = document.getElementById('grade-rows');
  const o = document.getElementById('grade-output');
  if(cont) cont.innerHTML='';
  if(o){o.textContent='';o.className='output-box';}
  setStatus('grade-status','','add assignments to begin');
}

/* ── FRACTION CALCULATOR ── */
function gcd(a,b){return b===0?a:gcd(b,a%b);}
function simplify(n,d){const g=gcd(Math.abs(n),Math.abs(d));return[n/g,d/g];}
function fracParse(str){
  str=str.trim();
  if(str.includes('/')){const[n,d]=str.split('/').map(Number);return isNaN(n)||isNaN(d)||d===0?null:[n,d];}
  const n=parseFloat(str);
  if(isNaN(n)) return null;
  // Convert decimal to fraction
  const str2=String(n);
  const dec=str2.includes('.')?str2.split('.')[1].length:0;
  const denom=Math.pow(10,dec);
  return simplify(Math.round(n*denom),denom);
}
function fracCalc() {
  const a = fracParse(document.getElementById('frac-a')?.value||'');
  const b = fracParse(document.getElementById('frac-b')?.value||'');
  const op = document.getElementById('frac-op')?.value||'+';
  const out = document.getElementById('frac-output');
  if (!out) return;
  if (!a||!b){out.textContent='Enter two fractions (e.g. 3/4 or 1.5).';out.className='output-box error';return;}
  const [an,ad]=[...a], [bn,bd]=[...b];
  let rn,rd;
  if(op==='+'){rn=an*bd+bn*ad;rd=ad*bd;}
  else if(op==='-'){rn=an*bd-bn*ad;rd=ad*bd;}
  else if(op==='×'){rn=an*bn;rd=ad*bd;}
  else{if(bn===0){out.textContent='Cannot divide by zero.';out.className='output-box error';return;}rn=an*bd;rd=ad*bn;}
  const [sn,sd]=simplify(rn,rd);
  const decimal=(sn/sd);
  const mixed = Math.abs(sn)>=Math.abs(sd) && sd!==1
    ? `${Math.trunc(sn/sd)} ${Math.abs(sn%sd)}/${Math.abs(sd)}`
    : '';
  out.className='output-box success';
  out.textContent=
    `${an}/${ad} ${op} ${bn}/${bd}\n\n`+
    `= ${rn}/${rd}\n`+
    `= ${sn}/${sd}  (simplified)\n`+
    (mixed?`= ${mixed}  (mixed number)\n`:'')+
    `= ${decimal.toFixed(6).replace(/\.?0+$/,'')}  (decimal)\n\n`+
    `── Step by step (${op}) ───────────────\n`+
    (op==='+'||op==='-'?
      `  Common denominator: ${ad*bd}\n`+
      `  ${an}/${ad} = ${an*bd}/${ad*bd}\n`+
      `  ${bn}/${bd} = ${bn*ad}/${ad*bd}\n`+
      `  ${an*bd} ${op} ${bn*ad} = ${rn}\n`+
      `  Result: ${rn}/${ad*bd} = ${sn}/${sd}`
    : op==='×'?
      `  Numerators: ${an} × ${bn} = ${rn}\n`+
      `  Denominators: ${ad} × ${bd} = ${rd}\n`+
      `  Result: ${rn}/${rd} = ${sn}/${sd}`
    :
      `  Reciprocal of ${bn}/${bd} = ${bd}/${bn}\n`+
      `  ${an}/${ad} × ${bd}/${bn} = ${rn}/${rd} = ${sn}/${sd}`
    );
  setStatus('frac-status','ok',`✓ ${sn}/${sd} = ${decimal.toFixed(4)}`);
}
function fracClear(){
  ['frac-a','frac-b'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const o=document.getElementById('frac-output');
  if(o){o.textContent='';o.className='output-box';}
  setStatus('frac-status','','enter two fractions');
}

/* ── SCIENTIFIC CALCULATOR ── */
let sciExpr = '';
function sciPress(val) {
  const disp = document.getElementById('sci-display');
  const expr = document.getElementById('sci-expr');
  if (val === 'C') { sciExpr=''; if(disp)disp.textContent='0'; if(expr)expr.textContent=''; return; }
  if (val === '⌫') { sciExpr=sciExpr.slice(0,-1); if(disp)disp.textContent=sciExpr||'0'; return; }
  if (val === '=') {
    try {
      if(expr) expr.textContent = sciExpr + ' =';
      let e = sciExpr
        .replace(/×/g,'*').replace(/÷/g,'/')
        .replace(/π/g,'Math.PI').replace(/e(?![0-9])/g,'Math.E')
        .replace(/sin\(/g,'Math.sin(').replace(/cos\(/g,'Math.cos(').replace(/tan\(/g,'Math.tan(')
        .replace(/asin\(/g,'Math.asin(').replace(/acos\(/g,'Math.acos(').replace(/atan\(/g,'Math.atan(')
        .replace(/log\(/g,'Math.log10(').replace(/ln\(/g,'Math.log(')
        .replace(/sqrt\(/g,'Math.sqrt(').replace(/cbrt\(/g,'Math.cbrt(')
        .replace(/abs\(/g,'Math.abs(').replace(/\^/g,'**')
        .replace(/(\d+)!/g,'(()=>{let f=1;for(let i=2;i<=$1;i++)f*=i;return f;})()');
      // eslint-disable-next-line no-eval
      const res = Function('"use strict";return ('+e+')')();
      if(disp) disp.textContent = Number.isFinite(res) ? parseFloat(res.toPrecision(12)).toString() : 'Error';
      sciExpr = Number.isFinite(res) ? parseFloat(res.toPrecision(12)).toString() : '';
    } catch(_) { if(disp)disp.textContent='Error'; sciExpr=''; }
    return;
  }
  sciExpr += val;
  if(disp) disp.textContent = sciExpr;
}
function sciToggleSign() {
  if(sciExpr.startsWith('-')) sciExpr=sciExpr.slice(1);
  else sciExpr='-'+sciExpr;
  const d=document.getElementById('sci-display');
  if(d)d.textContent=sciExpr||'0';
}

/* ── PERCENTAGE ERROR CALCULATOR ── */
function pctErrCalc() {
  const exp = parseFloat(document.getElementById('pe-experimental')?.value);
  const theo = parseFloat(document.getElementById('pe-theoretical')?.value);
  const out = document.getElementById('pe-output');
  if (!out) return;
  if (isNaN(exp)||isNaN(theo)) { out.textContent='Enter experimental and theoretical values.'; out.className='output-box error'; return; }
  if (theo===0) { out.textContent='Theoretical value cannot be zero.'; out.className='output-box error'; return; }
  const absErr = Math.abs(exp - theo);
  const relErr = absErr / Math.abs(theo);
  const pctErr = relErr * 100;
  const isHighErr = pctErr > 10;
  out.className = isHighErr ? 'output-box error' : 'output-box success';
  out.textContent =
    `Experimental:     ${exp}\n` +
    `Theoretical:      ${theo}\n\n` +
    `── Results ───────────────────────────\n` +
    `Absolute error:   ${absErr.toFixed(6).replace(/\.?0+$/,'')}\n` +
    `Relative error:   ${(relErr*100).toFixed(4)}%\n` +
    `Percentage error: ${pctErr.toFixed(4)}%\n` +
    `Accuracy:         ${(100-pctErr).toFixed(4)}%\n\n` +
    `── Formula ───────────────────────────\n` +
    `% Error = |Experimental − Theoretical|\n` +
    `          ─────────────────────────── × 100\n` +
    `                 |Theoretical|\n\n` +
    `        = |${exp} − ${theo}| / |${theo}| × 100\n` +
    `        = ${absErr.toFixed(6)} / ${Math.abs(theo)} × 100\n` +
    `        = ${pctErr.toFixed(4)}%\n\n` +
    `Verdict: ${pctErr<1?'Excellent (<1%)':pctErr<5?'Good (<5%)':pctErr<10?'Acceptable (<10%)':'High error (>10%) — check your method'}`;
  setStatus('pe-status', isHighErr?'err':'ok', `✓ Error: ${pctErr.toFixed(2)}%`);
}
function pctErrClear() {
  ['pe-experimental','pe-theoretical'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const o=document.getElementById('pe-output');
  if(o){o.textContent='';o.className='output-box';}
  setStatus('pe-status','','enter experimental and theoretical values');
}

/* ── ROMAN NUMERAL CONVERTER ── */
const ROMAN_VALS = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
function toRoman(n) {
  if (n<=0||n>3999) return null;
  let result='';
  for(const[val,sym] of ROMAN_VALS){while(n>=val){result+=sym;n-=val;}}
  return result;
}
function fromRoman(s) {
  const map={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
  s=s.toUpperCase();
  if(!/^[IVXLCDM]+$/.test(s)) return null;
  let total=0;
  for(let i=0;i<s.length;i++){
    const cur=map[s[i]],nxt=map[s[i+1]]||0;
    total+=cur<nxt?-cur:cur;
  }
  return total;
}
function romanConvert() {
  const inp = document.getElementById('rom-input')?.value?.trim();
  const mode = document.getElementById('rom-mode')?.value || 'toRoman';
  const out = document.getElementById('rom-output');
  if (!out) return;
  if (!inp) { out.textContent=''; out.className='output-box'; return; }
  if (mode === 'toRoman') {
    const n = parseInt(inp);
    if (isNaN(n)||n<=0||n>3999) { out.textContent='Enter a number between 1 and 3999.'; out.className='output-box error'; return; }
    const roman = toRoman(n);
    out.className='output-box success';
    out.textContent=
      `${n} = ${roman}\n\n`+
      `── Breakdown ──────────────────────\n`+
      ROMAN_VALS.filter(([v])=>n>=v||roman.includes(ROMAN_VALS.find(([vv])=>vv===v)?.[1]||'')).slice(0,8)
        .map(([v,s])=>{ const count=Math.floor(n/v); return count>0?`  ${s.padEnd(4)} = ${v.toString().padEnd(6)} × ${count} = ${v*count}`:''; })
        .filter(Boolean).join('\n')+
      `\n\n── Quick reference ─────────────────\n`+
      `  I=1  V=5  X=10  L=50  C=100  D=500  M=1000`;
  } else {
    const n = fromRoman(inp);
    if (n===null||n<=0) { out.textContent='Invalid Roman numeral. Use I, V, X, L, C, D, M only.'; out.className='output-box error'; return; }
    out.className='output-box success';
    out.textContent=
      `${inp.toUpperCase()} = ${n}\n\n`+
      `── Character values ───────────────\n`+
      inp.toUpperCase().split('').map((c,i,a)=>{
        const cur={I:1,V:5,X:10,L:50,C:100,D:500,M:1000}[c];
        const nxt={I:1,V:5,X:10,L:50,C:100,D:500,M:1000}[a[i+1]]||0;
        return `  ${c} = ${cur}${cur<nxt?' (subtracted)':''}`;
      }).join('\n');
  }
  setStatus('rom-status','ok',`✓ converted`);
}
function romanClear(){
  const i=document.getElementById('rom-input');
  const o=document.getElementById('rom-output');
  if(i)i.value='';
  if(o){o.textContent='';o.className='output-box';}
  setStatus('rom-status','','enter a number or Roman numeral');
}

/* ════════════════════════════════════
   BATCH 8 — FINANCE EXTENDED
   ════════════════════════════════════ */

/* ── MORTGAGE CALCULATOR ── */
function mortgageCalc() {
  const price    = parseFloat(document.getElementById('mtg-price')?.value);
  const downPct  = parseFloat(document.getElementById('mtg-down')?.value) || 20;
  const rate     = parseFloat(document.getElementById('mtg-rate')?.value);
  const years    = parseInt(document.getElementById('mtg-years')?.value) || 30;
  const tax      = parseFloat(document.getElementById('mtg-tax')?.value) || 0;
  const insurance= parseFloat(document.getElementById('mtg-ins')?.value) || 0;
  const out      = document.getElementById('mtg-output');
  if (!out) return;
  if (isNaN(price)||isNaN(rate)||price<=0||rate<=0) {
    out.textContent='Enter home price and annual interest rate.'; out.className='output-box error'; return;
  }
  const downAmt  = price * downPct / 100;
  const principal= price - downAmt;
  const r        = rate / 100 / 12;
  const n        = years * 12;
  const pmt      = principal * r * Math.pow(1+r,n) / (Math.pow(1+r,n)-1);
  const taxMo    = tax / 12;
  const insMo    = insurance / 12;
  const total    = pmt + taxMo + insMo;
  const totalPaid= pmt * n;
  const totalInt = totalPaid - principal;

  // Amortisation first and last 3 months
  let bal = principal;
  const rows = [];
  for (let mo=1; mo<=n; mo++) {
    const intPmt = bal * r;
    const prinPmt = pmt - intPmt;
    bal -= prinPmt;
    if (mo<=3 || mo>=n-2) rows.push([mo, intPmt, prinPmt, Math.max(0,bal)]);
    if (mo===3 && n>6) rows.push(null); // ellipsis
  }

  out.className = 'output-box success';
  out.textContent =
    `── Monthly Payment Breakdown ────────\n` +
    `Principal & Interest:  ${formatCur(pmt)}/mo\n` +
    (taxMo>0?`Property Tax:          ${formatCur(taxMo)}/mo\n`:'')+
    (insMo>0?`Home Insurance:        ${formatCur(insMo)}/mo\n`:'')+
    `${'─'.repeat(38)}\n` +
    `Total Monthly Payment: ${formatCur(total)}/mo\n\n` +
    `── Loan Summary ─────────────────────\n` +
    `Home Price:            ${formatCur(price)}\n` +
    `Down Payment:          ${formatCur(downAmt)} (${downPct}%)\n` +
    `Loan Amount:           ${formatCur(principal)}\n` +
    `Interest Rate:         ${rate}% (${(rate/12).toFixed(3)}%/mo)\n` +
    `Loan Term:             ${years} years (${n} payments)\n\n` +
    `── Total Cost ───────────────────────\n` +
    `Total of Payments:     ${formatCur(totalPaid)}\n` +
    `Total Interest:        ${formatCur(totalInt)}\n` +
    `Interest Ratio:        ${(totalInt/price*100).toFixed(1)}% of home price\n\n` +
    `── Amortisation (first & last months)\n` +
    `  Mo    Interest    Principal    Balance\n` +
    rows.map(r => r ? `  ${String(r[0]).padEnd(5)} ${formatCur(r[1]).padStart(10)}  ${formatCur(r[2]).padStart(10)}  ${formatCur(r[3]).padStart(12)}` : `  ...`).join('\n');
  setStatus('mtg-status','ok',`✓ Monthly: ${formatCur(total)} · Total interest: ${formatCur(totalInt)}`);
}
function mtgClear() {
  ['mtg-price','mtg-down','mtg-rate','mtg-years','mtg-tax','mtg-ins'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const o=document.getElementById('mtg-output');
  if(o){o.textContent='';o.className='output-box';}
  setStatus('mtg-status','','enter home price and rate');
}

/* ── AUTO LOAN CALCULATOR ── */
function autoLoanCalc() {
  const price    = parseFloat(document.getElementById('auto-price')?.value);
  const down     = parseFloat(document.getElementById('auto-down')?.value) || 0;
  const trade    = parseFloat(document.getElementById('auto-trade')?.value) || 0;
  const rate     = parseFloat(document.getElementById('auto-rate')?.value);
  const months   = parseInt(document.getElementById('auto-months')?.value) || 60;
  const tax      = parseFloat(document.getElementById('auto-tax')?.value) || 0;
  const out      = document.getElementById('auto-output');
  if (!out) return;
  if (isNaN(price)||isNaN(rate)||price<=0||rate<0) {
    out.textContent='Enter vehicle price and interest rate.'; out.className='output-box error'; return;
  }
  const taxAmt   = price * tax / 100;
  const principal= price + taxAmt - down - trade;
  if (principal <= 0) { out.textContent='Down payment + trade-in exceeds vehicle price.'; out.className='output-box error'; return; }
  const r   = rate / 100 / 12;
  let pmt;
  if (r === 0) { pmt = principal / months; }
  else { pmt = principal * r * Math.pow(1+r,months) / (Math.pow(1+r,months)-1); }
  const totalPaid = pmt * months;
  const totalInt  = totalPaid - principal;

  out.className = 'output-box success';
  out.textContent =
    `── Monthly Payment ──────────────────\n` +
    `${formatCur(pmt)}/month for ${months} months\n\n` +
    `── Loan Details ─────────────────────\n` +
    `Vehicle Price:         ${formatCur(price)}\n` +
    (taxAmt>0?`Sales Tax (${tax}%):      ${formatCur(taxAmt)}\n`:'')+
    (down>0?`Down Payment:          -${formatCur(down)}\n`:'')+
    (trade>0?`Trade-in Value:        -${formatCur(trade)}\n`:'')+
    `Loan Amount:           ${formatCur(principal)}\n` +
    `Interest Rate:         ${rate}% APR\n` +
    `Loan Term:             ${months} months\n\n` +
    `── Total Cost ───────────────────────\n` +
    `Total of Payments:     ${formatCur(totalPaid)}\n` +
    `Total Interest:        ${formatCur(totalInt)}\n` +
    `Total Vehicle Cost:    ${formatCur(price+taxAmt)}\n\n` +
    `── Compare loan terms ───────────────\n` +
    [24,36,48,60,72,84].map(mo => {
      const p = r===0 ? principal/mo : principal*r*Math.pow(1+r,mo)/(Math.pow(1+r,mo)-1);
      const ti = p*mo-principal;
      return `  ${mo} mo: ${formatCur(p)}/mo  (${formatCur(ti)} interest)`;
    }).join('\n');
  setStatus('auto-status','ok',`✓ ${formatCur(pmt)}/mo · ${formatCur(totalInt)} interest`);
}
function autoClear() {
  ['auto-price','auto-down','auto-trade','auto-rate','auto-months','auto-tax'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const o=document.getElementById('auto-output');
  if(o){o.textContent='';o.className='output-box';}
  setStatus('auto-status','','enter vehicle price and rate');
}

/* ── RETIREMENT CALCULATOR ── */
function retirementCalc() {
  const current  = parseFloat(document.getElementById('ret-current')?.value) || 0;
  const monthly  = parseFloat(document.getElementById('ret-monthly')?.value) || 0;
  const retAge   = parseInt(document.getElementById('ret-retage')?.value) || 65;
  const curAge   = parseInt(document.getElementById('ret-curage')?.value) || 30;
  const growth   = parseFloat(document.getElementById('ret-growth')?.value) || 7;
  const withdraw = parseFloat(document.getElementById('ret-withdraw')?.value) || 4;
  const out      = document.getElementById('ret-output');
  if (!out) return;
  if (curAge>=retAge) { out.textContent='Current age must be less than retirement age.'; out.className='output-box error'; return; }
  const years  = retAge - curAge;
  const r      = growth / 100 / 12;
  const n      = years * 12;
  // Future value of lump sum + future value of monthly contributions
  const fvLump = current * Math.pow(1+r, n);
  const fvPMT  = monthly * (Math.pow(1+r,n)-1) / r;
  const total  = fvLump + fvPMT;
  const totalContrib = current + monthly * n;
  const totalGrowth  = total - totalContrib;
  const annualIncome = total * withdraw / 100;
  const monthlyIncome= annualIncome / 12;

  out.className = 'output-box success';
  out.textContent =
    `── Retirement Projection ────────────\n` +
    `Years to retire:       ${years} years\n` +
    `Retirement savings:    ${formatCur(total)}\n\n` +
    `── Breakdown ────────────────────────\n` +
    `Current savings:       ${formatCur(current)}\n` +
    `Monthly contributions: ${formatCur(monthly)} × ${n} mo = ${formatCur(monthly*n)}\n` +
    `Total contributions:   ${formatCur(totalContrib)}\n` +
    `Investment growth:     ${formatCur(totalGrowth)}\n\n` +
    `── Retirement Income (${withdraw}% rule) ────\n` +
    `Annual withdrawal:     ${formatCur(annualIncome)}\n` +
    `Monthly income:        ${formatCur(monthlyIncome)}\n\n` +
    `── Milestone projections ────────────\n` +
    [10,20,30,40].filter(y=>y<years).map(y => {
      const n2=y*12;
      const t=current*Math.pow(1+r,n2)+monthly*(Math.pow(1+r,n2)-1)/r;
      return `  Age ${curAge+y}: ${formatCur(t)}`;
    }).join('\n') +
    `\n  Age ${retAge}: ${formatCur(total)} (retirement)`;
  setStatus('ret-status','ok',`✓ Retirement fund: ${formatCur(total)}`);
}
function retClear() {
  ['ret-current','ret-monthly','ret-retage','ret-curage','ret-growth','ret-withdraw'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const o=document.getElementById('ret-output');
  if(o){o.textContent='';o.className='output-box';}
  setStatus('ret-status','','enter your retirement details');
}

/* ── NET WORTH CALCULATOR ── */
let nwAssets=[], nwLiabilities=[];
function nwAddRow(type) {
  const id=Date.now();
  if(type==='asset') nwAssets.push({id,name:'',value:0});
  else nwLiabilities.push({id,name:'',value:0});
  nwRender(); nwCalc();
}
function nwRemoveRow(type,id) {
  if(type==='asset') nwAssets=nwAssets.filter(r=>r.id!==id);
  else nwLiabilities=nwLiabilities.filter(r=>r.id!==id);
  nwRender(); nwCalc();
}
function nwRender() {
  const aTable=document.getElementById('nw-assets-table');
  const lTable=document.getElementById('nw-liab-table');
  const rowHtml=(rows,type)=>rows.map(r=>`
    <div style="display:grid;grid-template-columns:1fr 130px 32px;gap:5px;margin-bottom:5px;align-items:center">
      <input class="b2-input" style="font-size:.78rem" value="${r.name}" placeholder="${type==='asset'?'e.g. Savings account':'e.g. Car loan'}"
        oninput="nw${type==='asset'?'Assets':'Liabilities'}.find(x=>x.id==${r.id}).name=this.value">
      <input class="b2-input" style="font-size:.78rem;text-align:right" type="number" value="${r.value||''}" placeholder="0"
        oninput="nw${type==='asset'?'Assets':'Liabilities'}.find(x=>x.id==${r.id}).value=parseFloat(this.value)||0;nwCalc()">
      <button onclick="nwRemoveRow('${type}',${r.id})" style="background:var(--surface2);border:1px solid var(--border);border-radius:5px;color:var(--red);cursor:pointer;font-size:.75rem;height:32px">✕</button>
    </div>`).join('');
  if(aTable) aTable.innerHTML=rowHtml(nwAssets,'asset');
  if(lTable) lTable.innerHTML=rowHtml(nwLiabilities,'liability');
}
function nwCalc() {
  const out=document.getElementById('nw-output');
  if(!out) return;
  const totalAssets=nwAssets.reduce((s,r)=>s+r.value,0);
  const totalLiab=nwLiabilities.reduce((s,r)=>s+r.value,0);
  const netWorth=totalAssets-totalLiab;
  const debtRatio=totalAssets>0?(totalLiab/totalAssets*100).toFixed(1):0;
  out.className=netWorth>=0?'output-box success':'output-box error';
  out.textContent=
    `── Assets ───────────────────────────\n`+
    (nwAssets.length?nwAssets.map(r=>`  ${(r.name||'Asset').padEnd(22)} ${formatCur(r.value)}`).join('\n')+'\n':'  (none added)\n')+
    `  ${'─'.repeat(36)}\n`+
    `  Total Assets:         ${formatCur(totalAssets)}\n\n`+
    `── Liabilities ──────────────────────\n`+
    (nwLiabilities.length?nwLiabilities.map(r=>`  ${(r.name||'Liability').padEnd(22)} ${formatCur(r.value)}`).join('\n')+'\n':'  (none added)\n')+
    `  ${'─'.repeat(36)}\n`+
    `  Total Liabilities:    ${formatCur(totalLiab)}\n\n`+
    `── Net Worth ────────────────────────\n`+
    `  Net Worth:            ${netWorth>=0?'':'-'}${formatCur(Math.abs(netWorth))}\n`+
    `  Debt-to-Asset Ratio:  ${debtRatio}%\n`+
    `  Financial Health:     ${netWorth>100000?'Strong':netWorth>0?'Positive':netWorth===0?'Break-even':'Negative (liabilities exceed assets)'}`;
  const total=document.getElementById('nw-total');
  if(total) total.textContent=`Net Worth: ${netWorth>=0?'':'-'}${formatCur(Math.abs(netWorth))}`;
  setStatus('nw-status',netWorth>=0?'ok':'err',`✓ Net Worth: ${netWorth>=0?'':'-'}${formatCur(Math.abs(netWorth))}`);
}
function nwClear(){nwAssets=[];nwLiabilities=[];nwRender();const o=document.getElementById('nw-output');if(o){o.textContent='';o.className='output-box';}setStatus('nw-status','','add assets and liabilities');}

/* ── INVOICE GENERATOR ── */
let invItems=[];
function invAddItem(){
  invItems.push({id:Date.now(),desc:'',qty:1,price:0});
  invRender(); invCalc();
}
function invRemoveItem(id){invItems=invItems.filter(r=>r.id!==id);invRender();invCalc();}
function invRender(){
  const t=document.getElementById('inv-items');
  if(!t)return;
  t.innerHTML=invItems.map(r=>`
    <div style="display:grid;grid-template-columns:1fr 70px 100px 32px;gap:5px;margin-bottom:5px;align-items:center">
      <input class="b2-input" style="font-size:.78rem" value="${r.desc}" placeholder="Item description"
        oninput="invItems.find(x=>x.id==${r.id}).desc=this.value;invCalc()">
      <input class="b2-input" style="font-size:.78rem;text-align:center" type="number" value="${r.qty}" min="0.1" step="0.1"
        oninput="invItems.find(x=>x.id==${r.id}).qty=parseFloat(this.value)||0;invCalc()">
      <input class="b2-input" style="font-size:.78rem;text-align:right" type="number" value="${r.price||''}" placeholder="0.00"
        oninput="invItems.find(x=>x.id==${r.id}).price=parseFloat(this.value)||0;invCalc()">
      <button onclick="invRemoveItem(${r.id})" style="background:var(--surface2);border:1px solid var(--border);border-radius:5px;color:var(--red);cursor:pointer;font-size:.75rem;height:32px">✕</button>
    </div>`).join('');
}
function invCalc(){
  const out=document.getElementById('inv-output');
  if(!out)return;
  const from   =document.getElementById('inv-from')?.value||'Your Business';
  const to     =document.getElementById('inv-to')?.value||'Client Name';
  const invNum =document.getElementById('inv-num')?.value||'INV-001';
  const date   =document.getElementById('inv-date')?.value||new Date().toISOString().slice(0,10);
  const due    =document.getElementById('inv-due')?.value||'';
  const taxRate=parseFloat(document.getElementById('inv-tax')?.value)||0;
  const curr   =document.getElementById('inv-curr')?.value||'$';
  const fmt    =n=>`${curr}${n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  const subtotal=invItems.reduce((s,r)=>s+r.qty*r.price,0);
  const taxAmt =subtotal*taxRate/100;
  const total  =subtotal+taxAmt;
  out.className='output-box success';
  out.textContent=
    `${'═'.repeat(48)}\n`+
    `  INVOICE\n`+
    `${'═'.repeat(48)}\n`+
    `From:    ${from}\n`+
    `To:      ${to}\n`+
    `Invoice: ${invNum}    Date: ${date}\n`+
    (due?`Due:     ${due}\n`:'')+
    `${'─'.repeat(48)}\n`+
    `  Description             Qty      Amount\n`+
    `${'─'.repeat(48)}\n`+
    (invItems.length?invItems.map(r=>{
      const amt=r.qty*r.price;
      return `  ${(r.desc||'Item').padEnd(22)} ${String(r.qty).padEnd(8)} ${fmt(amt).padStart(12)}`;
    }).join('\n'):'  (no items added)')+
    `\n${'─'.repeat(48)}\n`+
    `  ${'Subtotal:'.padEnd(38)} ${fmt(subtotal).padStart(8)}\n`+
    (taxRate>0?`  ${'Tax ('+taxRate+'%):'.padEnd(38)} ${fmt(taxAmt).padStart(8)}\n`:'')+
    `${'═'.repeat(48)}\n`+
    `  ${'TOTAL:'.padEnd(38)} ${fmt(total).padStart(8)}\n`+
    `${'═'.repeat(48)}`;
  setStatus('inv-status','ok',`✓ Total: ${fmt(total)}`);
}
function invClear(){invItems=[];invRender();const o=document.getElementById('inv-output');if(o){o.textContent='';o.className='output-box';}setStatus('inv-status','','fill in details and add items');}
function invCopy(){copyEl('inv-output');}

/* ── SALES TAX CALCULATOR ── */
function salesTaxCalc(){
  const price =parseFloat(document.getElementById('stx-price')?.value);
  const rate  =parseFloat(document.getElementById('stx-rate')?.value);
  const mode  =document.getElementById('stx-mode')?.value||'add';
  const out   =document.getElementById('stx-output');
  if(!out)return;
  if(isNaN(price)||isNaN(rate)||price<=0||rate<0){out.textContent='Enter valid price and tax rate.';out.className='output-box error';return;}
  let pre,tax,total;
  if(mode==='add'){pre=price;tax=price*rate/100;total=price+tax;}
  else{total=price;pre=price/(1+rate/100);tax=total-pre;}
  out.className='output-box success';
  out.textContent=
    `${mode==='add'?'Pre-tax Amount':'Pre-tax Amount'}:    ${formatCur(pre)}\n`+
    `Sales Tax (${rate}%):      ${formatCur(tax)}\n`+
    `${'─'.repeat(32)}\n`+
    `${mode==='add'?'Total (with tax)':'VAT-inclusive Price'}:    ${formatCur(total)}\n\n`+
    `── Compare tax rates ────────────────\n`+
    [0,5,6,7,8,8.5,9,10,13,15,20].map(r=>{
      const t=pre*(r/100);
      return `  ${String(r+'%').padEnd(7)} tax: ${formatCur(t).padStart(10)} → total ${formatCur(pre+t)}`;
    }).join('\n');
  setStatus('stx-status','ok',`✓ Tax: ${formatCur(tax)} · Total: ${formatCur(total)}`);
}
function stxClear(){['stx-price','stx-rate'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});const o=document.getElementById('stx-output');if(o){o.textContent='';o.className='output-box';}setStatus('stx-status','','enter price and tax rate');}

/* ════════════════════════════════════
   BATCH 9 — DEVELOPER EXTENDED
   ════════════════════════════════════ */

/* ── JWT DECODER ── */
function jwtDecode() {
  const token = document.getElementById('jwt-input')?.value?.trim();
  const out   = document.getElementById('jwt-output');
  if (!out) return;
  if (!token) { out.textContent = ''; out.className = 'output-box'; setStatus('jwt-status','','paste a JWT token'); return; }

  const parts = token.split('.');
  if (parts.length !== 3) {
    out.textContent = 'Invalid JWT — expected 3 parts separated by dots.';
    out.className = 'output-box error';
    setStatus('jwt-status','err','✗ not a valid JWT');
    return;
  }
  try {
    const b64url = s => {
      s = s.replace(/-/g,'+').replace(/_/g,'/');
      while (s.length % 4) s += '=';
      return JSON.parse(atob(s));
    };
    const header  = b64url(parts[0]);
    const payload = b64url(parts[1]);
    const sig     = parts[2];

    // Format timestamps
    const fmtTime = ts => ts ? new Date(ts*1000).toISOString().replace('T',' ').slice(0,19) + ' UTC' : 'N/A';
    const now = Math.floor(Date.now()/1000);
    const expired = payload.exp && payload.exp < now;
    const expInfo = payload.exp
      ? `${fmtTime(payload.exp)} ${expired ? '⚠ EXPIRED' : '✓ valid'}`
      : 'No expiry';

    out.className = expired ? 'output-box error' : 'output-box success';
    out.textContent =
      `── Header ────────────────────────────\n` +
      JSON.stringify(header, null, 2) + '\n\n' +
      `── Payload ───────────────────────────\n` +
      JSON.stringify(payload, null, 2) + '\n\n' +
      `── Signature ─────────────────────────\n` +
      sig.slice(0,32) + '...\n\n' +
      `── Token Info ────────────────────────\n` +
      `Algorithm:  ${header.alg || 'unknown'}\n` +
      `Type:       ${header.typ || 'JWT'}\n` +
      (payload.iss ? `Issuer:     ${payload.iss}\n` : '') +
      (payload.sub ? `Subject:    ${payload.sub}\n` : '') +
      (payload.aud ? `Audience:   ${Array.isArray(payload.aud)?payload.aud.join(', '):payload.aud}\n` : '') +
      `Issued at:  ${fmtTime(payload.iat)}\n` +
      `Expires:    ${expInfo}\n` +
      `Status:     ${expired ? '⚠ Token has expired' : '✓ Token appears valid (signature not verified)'}`;
    setStatus('jwt-status', expired?'err':'ok', `${header.alg} · ${expired?'expired':'valid'}`);
  } catch(e) {
    out.textContent = 'Failed to decode: ' + e.message;
    out.className = 'output-box error';
    setStatus('jwt-status','err','✗ decode failed');
  }
}
function jwtClear() {
  const i=document.getElementById('jwt-input');
  const o=document.getElementById('jwt-output');
  if(i)i.value='';
  if(o){o.textContent='';o.className='output-box';}
  setStatus('jwt-status','','paste a JWT token');
}

/* ── MARKDOWN EDITOR / PREVIEWER ── */
function mdRender() {
  const raw = document.getElementById('md-input')?.value || '';
  const out = document.getElementById('md-preview');
  if (!out) return;
  if (!raw.trim()) { out.innerHTML = '<p style="color:var(--text3);font-size:.8rem">Preview will appear here as you type…</p>'; return; }

  // Sanitise raw input first — escape HTML special chars, then apply markdown
  const src = raw
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');

  let html = src
    // Headings
    .replace(/^##### (.+)$/gm, '<h5>$1</h5>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // HR
    .replace(/^---+$/gm, '<hr>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, (m,lang,code)=>`<pre><code class="lang-${lang}">${code.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code></pre>`)
    // Inline code — escape HTML inside backticks to prevent XSS
    .replace(/`([^`]+)`/g, (_,c)=>`<code>${c.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code>`)
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Links and images — URLs sanitised to prevent open redirect and JS injection
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_,alt,src)=>{
      const safeSrc = src.match(/^https?:\/\//) ? src : '#';
      return `<img src="${safeSrc}" alt="${alt.replace(/</g,'&lt;').replace(/>/g,'&gt;')}" style="max-width:100%">`;
    })
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_,txt,href)=>{
      const safeHref = href.match(/^https?:\/\//) ? href : '#';
      return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${txt.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</a>`;
    })
    // Unordered lists
    .replace(/^[-*+] (.+)$/gm, '<li>$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p>')
    // Single newlines → br (inside paragraphs)
    .replace(/\n(?!<)/g, '<br>');

  // Wrap in p if not block element
  if (!html.startsWith('<')) html = '<p>' + html + '</p>';

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((<li>.*?<\/li>\s*)+)/g, '<ul>$1</ul>');

  out.innerHTML = html;
  const wc = src.trim().split(/\s+/).length;
  setStatus('md-status','ok',`✓ ${wc} words · ${src.length} chars`);
}
function mdClear() {
  const i=document.getElementById('md-input');
  const o=document.getElementById('md-preview');
  if(i)i.value='';
  if(o)o.innerHTML='<p style="color:var(--text3);font-size:.8rem">Preview will appear here as you type…</p>';
  setStatus('md-status','','start typing Markdown');
}
function mdCopyHtml() {
  const o=document.getElementById('md-preview');
  if(o) navigator.clipboard.writeText(o.innerHTML).then(()=>showToast('HTML copied ✓'));
}

/* ── JSON TO CSV CONVERTER ── */
function jsonToCsvConvert() {
  const src  = document.getElementById('jcsv-input')?.value?.trim();
  const mode = document.getElementById('jcsv-mode')?.value || 'json2csv';
  const out  = document.getElementById('jcsv-output');
  if (!out) return;
  if (!src) { out.textContent=''; out.className='output-box'; return; }

  try {
    if (mode === 'json2csv') {
      let data = JSON.parse(src);
      if (!Array.isArray(data)) {
        // Try to find an array in the object
        const arr = Object.values(data).find(v=>Array.isArray(v));
        if (arr) data = arr;
        else data = [data];
      }
      if (!data.length) { out.textContent='Empty array.'; out.className='output-box error'; return; }
      const keys = [...new Set(data.flatMap(r=>Object.keys(r)))];
      const escape = v => {
        if (v===null||v===undefined) return '';
        const s = String(v);
        if (s.includes(',')||s.includes('"')||s.includes('\n')) return '"'+s.replace(/"/g,'""')+'"';
        return s;
      };
      const csv = [keys.join(','), ...data.map(r=>keys.map(k=>escape(r[k])).join(','))].join('\n');
      out.textContent = csv;
      out.className = 'output-box success';
      setStatus('jcsv-status','ok',`✓ ${data.length} rows · ${keys.length} columns`);
    } else {
      // CSV to JSON
      const lines = src.split('\n').filter(l=>l.trim());
      if (lines.length < 2) { out.textContent='Need at least a header row and one data row.'; out.className='output-box error'; return; }
      const parseCsvLine = line => {
        const result=[]; let cur=''; let inQ=false;
        for(let i=0;i<line.length;i++){
          if(line[i]==='"'){if(inQ&&line[i+1]==='"'){cur+='"';i++;}else inQ=!inQ;}
          else if(line[i]===','&&!inQ){result.push(cur);cur='';}
          else cur+=line[i];
        }
        result.push(cur);
        return result;
      };
      const headers = parseCsvLine(lines[0]);
      const rows = lines.slice(1).map(l=>{
        const vals=parseCsvLine(l);
        const obj={};
        headers.forEach((h,i)=>obj[h]=vals[i]||'');
        return obj;
      });
      out.textContent = JSON.stringify(rows, null, 2);
      out.className = 'output-box success';
      setStatus('jcsv-status','ok',`✓ ${rows.length} rows · ${headers.length} columns`);
    }
  } catch(e) {
    out.textContent = 'Error: ' + e.message;
    out.className = 'output-box error';
    setStatus('jcsv-status','err','✗ ' + e.message.slice(0,40));
  }
}
function jcsvClear() {
  const i=document.getElementById('jcsv-input');
  const o=document.getElementById('jcsv-output');
  if(i)i.value='';
  if(o){o.textContent='';o.className='output-box';}
  setStatus('jcsv-status','','paste JSON or CSV');
}

/* ── HTML ENCODER / DECODER ── */
function htmlEncDec() {
  const src  = document.getElementById('html-input')?.value || '';
  const mode = document.getElementById('html-mode')?.value || 'encode';
  const out  = document.getElementById('html-output');
  if (!out) return;
  if (!src) { out.textContent=''; out.className='output-box'; return; }
  let result;
  if (mode === 'encode') {
    result = src
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;')
      .replace(/©/g,'&copy;').replace(/®/g,'&reg;').replace(/™/g,'&trade;')
      .replace(/€/g,'&euro;').replace(/£/g,'&pound;').replace(/¥/g,'&yen;')
      .replace(/—/g,'&mdash;').replace(/–/g,'&ndash;').replace(/…/g,'&hellip;');
  } else {
    result = src
      .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
      .replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&apos;/g,"'")
      .replace(/&copy;/g,'©').replace(/&reg;/g,'®').replace(/&trade;/g,'™')
      .replace(/&euro;/g,'€').replace(/&pound;/g,'£').replace(/&yen;/g,'¥')
      .replace(/&mdash;/g,'—').replace(/&ndash;/g,'–').replace(/&hellip;/g,'…')
      .replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(parseInt(n)))
      .replace(/&#x([0-9a-fA-F]+);/g,(_,h)=>String.fromCharCode(parseInt(h,16)));
  }
  out.textContent = result;
  out.className = 'output-box success';
  setStatus('html-status','ok',`✓ ${mode}d · ${result.length} chars`);
}
function htmlClear() {
  const i=document.getElementById('html-input');
  const o=document.getElementById('html-output');
  if(i)i.value='';
  if(o){o.textContent='';o.className='output-box';}
  setStatus('html-status','','paste text or HTML entities');
}
function htmlSwap() {
  const i=document.getElementById('html-input');
  const o=document.getElementById('html-output');
  const m=document.getElementById('html-mode');
  if(!i||!o||!m) return;
  i.value=o.textContent;
  m.value = m.value==='encode'?'decode':'encode';
  htmlEncDec();
}

/* ── HEX / BINARY CONVERTER ── */
function hexBinConvert() {
  const src  = document.getElementById('hb-input')?.value?.trim();
  const from = document.getElementById('hb-from')?.value || 'decimal';
  const out  = document.getElementById('hb-output');
  if (!out) return;
  if (!src) { out.textContent=''; out.className='output-box'; return; }

  try {
    let dec;
    if (from==='decimal')  dec = parseInt(src, 10);
    else if (from==='hex') dec = parseInt(src.replace(/^0x/i,''), 16);
    else if (from==='binary') dec = parseInt(src.replace(/\s/g,''), 2);
    else if (from==='octal') dec = parseInt(src, 8);

    if (isNaN(dec)||dec<0) { out.textContent='Invalid input for selected base.'; out.className='output-box error'; return; }

    const bin = dec.toString(2);
    const hex = dec.toString(16).toUpperCase();
    const oct = dec.toString(8);
    const binPadded = bin.padStart(Math.ceil(bin.length/4)*4,'0').replace(/(.{4})/g,'$1 ').trim();

    out.className = 'output-box success';
    out.textContent =
      `Input (${from}):   ${src}\n\n` +
      `── Conversions ───────────────────────\n` +
      `Decimal:    ${dec}\n` +
      `Hexadecimal:${hex.padStart(dec>255?4:2,'0')} (0x${hex})\n` +
      `Binary:     ${binPadded}\n` +
      `Octal:      ${oct}\n\n` +
      `── Byte analysis ─────────────────────\n` +
      `Bits needed: ${bin.length}\n` +
      `Bytes needed: ${Math.ceil(bin.length/8)}\n` +
      (dec<=127?`ASCII char: ${String.fromCharCode(dec)} (${dec<=31||dec===127?'control char':'printable'})\n`:'')+
      (dec<=65535?`Unicode: U+${hex.padStart(4,'0')}\n`:'');
    setStatus('hb-status','ok',`✓ Dec:${dec} Hex:0x${hex} Bin:${bin}`);
  } catch(e) {
    out.textContent = 'Error: ' + e.message;
    out.className = 'output-box error';
  }
}
function hbClear() {
  const i=document.getElementById('hb-input');
  const o=document.getElementById('hb-output');
  if(i)i.value='';
  if(o){o.textContent='';o.className='output-box';}
  setStatus('hb-status','','enter a number to convert');
}

/* ── CSS MINIFIER / FORMATTER ── */
function cssMinify() {
  const src  = document.getElementById('css-input')?.value || '';
  const mode = document.getElementById('css-mode')?.value || 'minify';
  const out  = document.getElementById('css-output');
  if (!out) return;
  if (!src.trim()) { out.textContent=''; out.className='output-box'; return; }

  if (mode === 'minify') {
    let result = src
      .replace(/\/\*[\s\S]*?\*\//g, '')       // remove comments
      .replace(/\s+/g, ' ')                    // collapse whitespace
      .replace(/\s*{\s*/g, '{')               // remove space around {
      .replace(/\s*}\s*/g, '}')               // remove space around }
      .replace(/\s*:\s*/g, ':')               // remove space around :
      .replace(/\s*;\s*/g, ';')               // remove space around ;
      .replace(/\s*,\s*/g, ',')               // remove space around ,
      .replace(/;}/g, '}')                    // remove last semicolon
      .trim();
    out.textContent = result;
    out.className = 'output-box success';
    const saved = ((1 - result.length/src.length)*100).toFixed(1);
    setStatus('css-status','ok',`✓ ${result.length} chars (${saved}% smaller)`);
  } else {
    // Format/prettify
    let result = src
      .replace(/\/\*[\s\S]*?\*\//g, m => m)  // preserve comments
      .replace(/\s+/g, ' ')
      .replace(/{\s*/g, ' {\n  ')
      .replace(/;\s*/g, ';\n  ')
      .replace(/\s*}\s*/g, '\n}\n')
      .replace(/,\s*/g, ',\n')
      .trim();
    out.textContent = result;
    out.className = 'output-box success';
    setStatus('css-status','ok',`✓ formatted · ${result.split('\n').length} lines`);
  }
}
function cssCopy() { copyEl('css-output'); }
function cssClear() {
  const i=document.getElementById('css-input');
  const o=document.getElementById('css-output');
  if(i)i.value='';
  if(o){o.textContent='';o.className='output-box';}
  setStatus('css-status','','paste CSS to minify or format');
}

/* ── CRON EXPRESSION BUILDER ── */
function cronBuild() {
  const min   = document.getElementById('cron-min')?.value?.trim()   || '*';
  const hour  = document.getElementById('cron-hour')?.value?.trim()  || '*';
  const dom   = document.getElementById('cron-dom')?.value?.trim()   || '*';
  const month = document.getElementById('cron-month')?.value?.trim() || '*';
  const dow   = document.getElementById('cron-dow')?.value?.trim()   || '*';
  const expr  = `${min} ${hour} ${dom} ${month} ${dow}`;
  const out   = document.getElementById('cron-output');
  const disp  = document.getElementById('cron-expr-display');
  if (disp) disp.textContent = expr;
  if (!out) return;

  // Parse and describe
  const describe = (val, unit, labels) => {
    if (val === '*') return `every ${unit}`;
    if (val.startsWith('*/')) return `every ${val.slice(2)} ${unit}s`;
    if (val.includes('-')) {
      const [a,b] = val.split('-');
      return `${unit}s ${labels?labels[a]||a:a} through ${labels?labels[b]||b:b}`;
    }
    if (val.includes(',')) {
      const parts = val.split(',');
      return `${unit}s ${parts.map(p=>labels?labels[p]||p:p).join(', ')}`;
    }
    return `${unit} ${labels?labels[val]||val:val}`;
  };

  const MONTHS = {1:'Jan',2:'Feb',3:'Mar',4:'Apr',5:'May',6:'Jun',7:'Jul',8:'Aug',9:'Sep',10:'Oct',11:'Nov',12:'Dec'};
  const DAYS   = {0:'Sun',1:'Mon',2:'Tue',3:'Wed',4:'Thu',5:'Fri',6:'Sat'};

  const desc =
    `Runs at ${describe(min,'minute')} of ${describe(hour,'hour')}, ` +
    `on ${describe(dom,'day')} of the month, ` +
    `in ${describe(month,'month',MONTHS)}, ` +
    `on ${describe(dow,'weekday',DAYS)}.`;

  // Next 5 runs (simplified — shows pattern description)
  const commonExamples = {
    '* * * * *':    'Every minute',
    '0 * * * *':    'Every hour at :00',
    '0 0 * * *':    'Every day at midnight',
    '0 9 * * *':    'Every day at 9:00 AM',
    '0 9 * * 1':    'Every Monday at 9:00 AM',
    '0 0 * * 0':    'Every Sunday at midnight',
    '0 0 1 * *':    'First day of every month at midnight',
    '0 0 1 1 *':    'Every year on Jan 1 at midnight',
    '*/5 * * * *':  'Every 5 minutes',
    '*/15 * * * *': 'Every 15 minutes',
    '*/30 * * * *': 'Every 30 minutes',
    '0 */2 * * *':  'Every 2 hours',
    '0 9-17 * * 1-5': 'Every hour 9AM–5PM, Monday–Friday',
    '0 0,12 * * *': 'At midnight and noon every day',
  };

  out.className = 'output-box success';
  out.textContent =
    `Expression:  ${expr}\n\n` +
    `Description: ${desc}\n\n` +
    `── Field reference ──────────────────\n` +
    `  Minute:     ${min.padEnd(12)} (0–59)\n` +
    `  Hour:       ${hour.padEnd(12)} (0–23)\n` +
    `  Day/Month:  ${dom.padEnd(12)} (1–31)\n` +
    `  Month:      ${month.padEnd(12)} (1–12 or JAN–DEC)\n` +
    `  Day/Week:   ${dow.padEnd(12)} (0–6, 0=Sunday)\n\n` +
    `── Special characters ───────────────\n` +
    `  *   = any value\n` +
    `  ,   = value list  (1,3,5)\n` +
    `  -   = range       (1-5)\n` +
    `  /   = step        (*/15 = every 15)\n\n` +
    `── Common patterns ──────────────────\n` +
    Object.entries(commonExamples).map(([k,v]) =>
      `  ${k.padEnd(20)} ${v}`
    ).join('\n');

  setStatus('cron-status', 'ok', `✓ ${expr}`);
}

function cronPreset(expr) {
  const parts = expr.split(' ');
  const ids = ['cron-min','cron-hour','cron-dom','cron-month','cron-dow'];
  ids.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.value = parts[i] || '*';
  });
  cronBuild();
}

function cronClear() {
  ['cron-min','cron-hour','cron-dom','cron-month','cron-dow'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '*';
  });
  const o = document.getElementById('cron-output');
  const d = document.getElementById('cron-expr-display');
  if (o) { o.textContent = ''; o.className = 'output-box'; }
  if (d) d.textContent = '* * * * *';
  setStatus('cron-status', '', 'build or select a preset');
}

/* ════════════════════════════════════
   BATCH 10 — NICHE CALCULATORS
   ════════════════════════════════════ */

/* ── SLEEP CALCULATOR ── */
function sleepCalc() {
  const mode   = document.getElementById('slp-mode')?.value || 'wake';
  const timeIn = document.getElementById('slp-time')?.value;
  const out    = document.getElementById('slp-output');
  if (!out) return;
  if (!timeIn) { out.textContent = 'Select a time.'; out.className='output-box'; return; }

  const [h, m] = timeIn.split(':').map(Number);
  const totalMins = h * 60 + m;
  // Sleep cycle = 90 minutes, fall asleep in ~14 mins
  const CYCLE = 90, DOZE = 14;

  const fmt = mins => {
    const d = new Date(2000,0,1, Math.floor(mins/60)%24, mins%60);
    return d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true});
  };

  let lines = [];
  if (mode === 'wake') {
    // Given wake time, when should I sleep?
    for (let cycles = 6; cycles >= 2; cycles--) {
      const bedtime = ((totalMins - DOZE - cycles * CYCLE) + 1440) % 1440;
      lines.push({ cycles, time: fmt(bedtime), quality: cycles >= 5 ? '✅ Ideal' : cycles === 4 ? '✅ Good' : cycles === 3 ? '⚠ Acceptable' : '❌ Too short' });
    }
    out.className = 'output-box success';
    out.textContent =
      `Wake up time: ${fmt(totalMins)}\n\n` +
      `── Recommended bedtimes ─────────────\n` +
      lines.map(l => `  ${l.time.padEnd(12)} ${l.cycles} cycles (${(l.cycles*1.5).toFixed(1)}h)  ${l.quality}`).join('\n') +
      `\n\n── Sleep cycle facts ────────────────\n` +
      `  1 sleep cycle = 90 minutes\n` +
      `  Optimal sleep = 5–6 cycles (7.5–9h)\n` +
      `  You take ~14 min to fall asleep\n` +
      `  REM sleep peaks in later cycles\n` +
      `  Wake between cycles = feel refreshed`;
  } else {
    // Given bedtime, when will I wake feeling refreshed?
    const sleepTime = totalMins + DOZE;
    for (let cycles = 3; cycles <= 7; cycles++) {
      const wake = (sleepTime + cycles * CYCLE) % 1440;
      lines.push({ cycles, time: fmt(wake), quality: cycles >= 5 ? '✅ Ideal' : cycles === 4 ? '✅ Good' : '⚠ Short' });
    }
    out.className = 'output-box success';
    out.textContent =
      `Bedtime: ${fmt(totalMins)}\n` +
      `You fall asleep around: ${fmt(sleepTime)}\n\n` +
      `── Best wake-up times ───────────────\n` +
      lines.map(l => `  ${l.time.padEnd(12)} ${l.cycles} cycles (${(l.cycles*1.5).toFixed(1)}h)  ${l.quality}`).join('\n') +
      `\n\n── Tips ─────────────────────────────\n` +
      `  Set alarm for a cycle boundary above\n` +
      `  Waking mid-cycle = groggy feeling\n` +
      `  Consistent schedule improves quality`;
  }
  setStatus('slp-status', 'ok', '✓ Sleep times calculated');
}

/* ── LOVE CALCULATOR ── */
function loveCalc() {
  const n1  = document.getElementById('love-name1')?.value?.trim();
  const n2  = document.getElementById('love-name2')?.value?.trim();
  const out = document.getElementById('love-output');
  if (!out) return;
  if (!n1 || !n2) { out.textContent='Enter both names.'; out.className='output-box'; return; }

  // Deterministic but fun hash — same names always give same result
  const hash = str => {
    let h = 0;
    for (let i=0; i<str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
    return Math.abs(h);
  };
  const combined = (n1+n2).toLowerCase().replace(/\s/g,'') + (n2+n1).toLowerCase().replace(/\s/g,'');
  const pct = 40 + (hash(combined) % 55); // range 40–94 (always looks plausible)

  const msg = pct >= 90 ? ['💞 Soulmates!', 'An extraordinary connection. The stars align perfectly for you two.']
    : pct >= 80 ? ['💕 Great match!', 'Strong compatibility. You bring out the best in each other.']
    : pct >= 70 ? ['💛 Good together', 'Solid connection with real potential. Communication is key.']
    : pct >= 60 ? ['🌸 Promising', 'There\'s something here worth exploring. Give it time.']
    : ['🤝 Friends first', 'Friendship is a wonderful foundation. See where it goes!'];

  const bar = '█'.repeat(Math.round(pct/5)) + '░'.repeat(20-Math.round(pct/5));

  out.className = 'output-box success';
  out.textContent =
    `${n1}  ❤️  ${n2}\n\n` +
    `${bar}  ${pct}%\n\n` +
    `${msg[0]}\n${msg[1]}\n\n` +
    `── Compatibility breakdown ───────────\n` +
    `  Communication: ${30 + hash(n1.toLowerCase()) % 65}%\n` +
    `  Trust:         ${35 + hash(n2.toLowerCase()) % 60}%\n` +
    `  Chemistry:     ${40 + hash(combined.slice(0,8)) % 55}%\n` +
    `  Long-term:     ${30 + hash(combined.slice(-8)) % 65}%\n\n` +
    `  ✨ Just for fun — love is what you make it!`;
  setStatus('love-status','ok',`✓ ${pct}% compatibility`);
}
function loveClear(){
  ['love-name1','love-name2'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const o=document.getElementById('love-output');
  if(o){o.textContent='';o.className='output-box';}
  setStatus('love-status','','enter two names');
}

/* ── LUCKY NUMBER GENERATOR ── */
function luckyNumberCalc() {
  const name = document.getElementById('lucky-name')?.value?.trim() || '';
  const dob  = document.getElementById('lucky-dob')?.value || '';
  const out  = document.getElementById('lucky-output');
  if (!out) return;

  // Numerology: reduce to single digit
  const reduce = n => { while(n>9 && n!==11 && n!==22 && n!==33) { n=[...String(n)].reduce((s,d)=>s+parseInt(d),0); } return n; };
  const letterVal = s => [...s.toLowerCase()].filter(c=>c>='a'&&c<='z').reduce((s,c)=>s+(c.charCodeAt(0)-96),0);

  let lines = [];
  let lifePath = null;

  if (dob) {
    const digits = dob.replace(/-/g,'');
    const sum = [...digits].reduce((s,d)=>s+parseInt(d),0);
    lifePath = reduce(sum);
    lines.push(`Life Path Number:   ${lifePath}`);
  }

  if (name) {
    const destiny = reduce(letterVal(name));
    const vowels = [...name.toLowerCase()].filter(c=>'aeiou'.includes(c));
    const soul   = reduce(vowels.reduce((s,c)=>s+(c.charCodeAt(0)-96),0)||1);
    const consonants = [...name.toLowerCase()].filter(c=>c>='a'&&c<='z'&&!'aeiou'.includes(c));
    const persona = reduce(consonants.reduce((s,c)=>s+(c.charCodeAt(0)-96),0)||1);
    lines.push(`Destiny Number:     ${destiny}  (full name)`);
    lines.push(`Soul Urge Number:   ${soul}  (vowels only)`);
    lines.push(`Personality Number: ${persona}  (consonants)`);
  }

  // Generate 5 lucky numbers based on inputs
  const seed = (name + dob).split('').reduce((s,c)=>s+c.charCodeAt(0),0) || 42;
  const luckies = [];
  let x = seed;
  while (luckies.length < 7) {
    x = (x * 1664525 + 1013904223) & 0xffffffff;
    const n = (Math.abs(x) % 49) + 1;
    if (!luckies.includes(n)) luckies.push(n);
  }

  const meanings = {1:'Leadership',2:'Harmony',3:'Creativity',4:'Stability',5:'Freedom',6:'Nurturing',7:'Wisdom',8:'Abundance',9:'Completion',11:'Intuition',22:'Master Builder',33:'Master Teacher'};

  out.className = 'output-box success';
  out.textContent =
    (lines.length ? `── Your numerology numbers ──────────\n${lines.map(l=>`  ${l}`).join('\n')}\n\n` : '') +
    (lifePath ? `  Life Path ${lifePath} meaning: ${meanings[lifePath]||'Spiritual'}\n\n` : '') +
    `── Lucky numbers ─────────────────────\n` +
    `  Personal:    ${luckies.slice(0,5).join('  ')}\n` +
    `  Lottery pick: ${luckies.slice(0,6).sort((a,b)=>a-b).join('  ')}\n\n` +
    `── Lucky days this week ─────────────\n` +
    ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
      .filter((_,i) => luckies[i%7] % 3 === 0 ? false : i % 3 !== 2)
      .slice(0,3).map(d=>`  ✨ ${d}`).join('\n') + '\n\n' +
    `  ✨ For entertainment only — make your own luck!`;
  setStatus('lucky-status','ok','✓ Lucky numbers generated');
}
function luckyClear(){
  ['lucky-name','lucky-dob'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const o=document.getElementById('lucky-output');
  if(o){o.textContent='';o.className='output-box';}
  setStatus('lucky-status','','enter your name or date of birth');
}

/* ── COIN FLIP & DICE ROLLER ── */
function coinFlip() {
  const count = parseInt(document.getElementById('coin-count')?.value) || 1;
  const out   = document.getElementById('coin-output');
  if (!out) return;
  const results = Array.from({length:Math.min(count,100)}, ()=> Math.random()<0.5 ? 'Heads' : 'Tails');
  const heads = results.filter(r=>r==='Heads').length;
  const tails = results.length - heads;
  const bar = r => '█'.repeat(Math.round(r/results.length*20)) + '░'.repeat(20-Math.round(r/results.length*20));
  out.className = 'output-box success';
  out.textContent =
    (count===1
      ? `Result: ${results[0] === 'Heads' ? '🪙 HEADS' : '🪙 TAILS'}`
      : `${count} flips:\n${results.join('  ')}\n\n` +
        `Heads: ${heads}/${results.length}  ${bar(heads)}  ${(heads/results.length*100).toFixed(1)}%\n` +
        `Tails: ${tails}/${results.length}  ${bar(tails)}  ${(tails/results.length*100).toFixed(1)}%`
    );
  setStatus('coin-status','ok', count===1 ? `✓ ${results[0]}` : `✓ H:${heads} T:${tails}`);
}

function diceRoll() {
  const sides = parseInt(document.getElementById('dice-sides')?.value) || 6;
  const count = parseInt(document.getElementById('dice-count')?.value) || 1;
  const out   = document.getElementById('dice-output');
  if (!out) return;
  const results = Array.from({length:Math.min(count,20)}, ()=>Math.floor(Math.random()*sides)+1);
  const sum = results.reduce((s,n)=>s+n,0);
  const avg = sum/results.length;
  out.className = 'output-box success';
  out.textContent =
    (count===1
      ? `🎲 Rolled: ${results[0]}  (d${sides})`
      : `${count}d${sides}:\n  ${results.join('  ')}\n\n  Sum: ${sum}  Average: ${avg.toFixed(1)}\n  Min: ${Math.min(...results)}  Max: ${Math.max(...results)}`
    );
  setStatus('dice-status','ok', count===1 ? `✓ Rolled ${results[0]}` : `✓ Sum: ${sum}`);
}

/* ── DAYS BETWEEN DATES ── */
function daysBetween() {
  const d1  = document.getElementById('dbd-date1')?.value;
  const d2  = document.getElementById('dbd-date2')?.value;
  const out = document.getElementById('dbd-output');
  if (!out) return;
  if (!d1||!d2) { out.textContent='Select both dates.'; out.className='output-box'; return; }

  const date1 = new Date(d1), date2 = new Date(d2);
  const diff  = Math.abs(date2-date1);
  const days  = Math.round(diff/86400000);
  const weeks = Math.floor(days/7);
  const months= Math.abs((date2.getFullYear()-date1.getFullYear())*12 + date2.getMonth()-date1.getMonth());
  const years = Math.abs(date2.getFullYear()-date1.getFullYear());
  const earlier = date1 <= date2 ? date1 : date2;
  const later   = date1 <= date2 ? date2 : date1;

  // Workdays (Mon–Fri)
  let workdays = 0;
  for (let d=new Date(earlier); d<later; d.setDate(d.getDate()+1)) {
    const wd = d.getDay();
    if (wd!==0 && wd!==6) workdays++;
  }
  const weekends = days - workdays;

  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const fmtDate = d => d.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  out.className = 'output-box success';
  out.textContent =
    `From: ${fmtDate(earlier)}\n` +
    `To:   ${fmtDate(later)}\n\n` +
    `── Duration ──────────────────────────\n` +
    `${days.toLocaleString()} days total\n` +
    `${weeks} weeks + ${days%7} days\n` +
    `~${months} months\n` +
    `~${years > 0 ? years+' year'+(years!==1?'s':'')+' and ':''}${months%12} month${months%12!==1?'s':''}\n\n` +
    `── Breakdown ─────────────────────────\n` +
    `  Weekdays:    ${workdays.toLocaleString()} days\n` +
    `  Weekends:    ${weekends.toLocaleString()} days\n` +
    `  Hours:       ${(days*24).toLocaleString()}\n` +
    `  Minutes:     ${(days*24*60).toLocaleString()}\n` +
    `  Seconds:     ${(days*24*3600).toLocaleString()}`;
  setStatus('dbd-status','ok',`✓ ${days.toLocaleString()} days`);
}
function dbdSetToday(id) {
  const el = document.getElementById(id);
  if (el) { el.value = new Date().toISOString().slice(0,10); daysBetween(); }
}

/* ── ZODIAC / HOROSCOPE CALCULATOR ── */
function zodiacCalc() {
  const dob = document.getElementById('zod-dob')?.value;
  const out = document.getElementById('zod-output');
  if (!out) return;
  if (!dob) { out.textContent='Select your date of birth.'; out.className='output-box'; return; }

  // Parse date parts directly from YYYY-MM-DD (HTML date input format)
  // Avoids timezone shifts that cause getDate() to return wrong day
  const parts = dob.split('-');
  const year  = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const day   = parseInt(parts[2]);

  const SIGNS = [
    {sign:'Capricorn', symbol:'♑', date:'Dec 22 – Jan 19', el:'Earth',  rule:'Saturn',  trait:'Ambitious, disciplined, patient'},
    {sign:'Aquarius',  symbol:'♒', date:'Jan 20 – Feb 18', el:'Air',    rule:'Uranus',  trait:'Innovative, independent, humanitarian'},
    {sign:'Pisces',    symbol:'♓', date:'Feb 19 – Mar 20', el:'Water',  rule:'Neptune', trait:'Compassionate, artistic, intuitive'},
    {sign:'Aries',     symbol:'♈', date:'Mar 21 – Apr 19', el:'Fire',   rule:'Mars',    trait:'Courageous, energetic, passionate'},
    {sign:'Taurus',    symbol:'♉', date:'Apr 20 – May 20', el:'Earth',  rule:'Venus',   trait:'Reliable, patient, determined'},
    {sign:'Gemini',    symbol:'♊', date:'May 21 – Jun 20', el:'Air',    rule:'Mercury', trait:'Adaptable, curious, expressive'},
    {sign:'Cancer',    symbol:'♋', date:'Jun 21 – Jul 22', el:'Water',  rule:'Moon',    trait:'Intuitive, emotional, protective'},
    {sign:'Leo',       symbol:'♌', date:'Jul 23 – Aug 22', el:'Fire',   rule:'Sun',     trait:'Creative, generous, confident'},
    {sign:'Virgo',     symbol:'♍', date:'Aug 23 – Sep 22', el:'Earth',  rule:'Mercury', trait:'Analytical, practical, diligent'},
    {sign:'Libra',     symbol:'♎', date:'Sep 23 – Oct 22', el:'Air',    rule:'Venus',   trait:'Diplomatic, fair, social'},
    {sign:'Scorpio',   symbol:'♏', date:'Oct 23 – Nov 21', el:'Water',  rule:'Pluto',   trait:'Passionate, resourceful, determined'},
    {sign:'Sagittarius',symbol:'♐',date:'Nov 22 – Dec 21', el:'Fire',   rule:'Jupiter', trait:'Adventurous, optimistic, philosophical'},
  ];

  const getSign = (m,d) => {
    const dates = [[1,20],[2,19],[3,21],[4,20],[5,21],[6,21],[7,23],[8,23],[9,23],[10,23],[11,22],[12,22]];
    for (let i=0;i<12;i++) { if(m===dates[i][0]&&d>=dates[i][1]) return SIGNS[(i+1)%12]; if(m===(dates[i][0]%12)+1&&d<dates[i][1]) return SIGNS[(i+1)%12]; }
    return SIGNS[0];
  };

  // Better sign lookup
  // Each entry = [month, day, sign that STARTS on this date]
  // If date is before this boundary, return the PREVIOUS sign
  const boundaries = [
    [1,20,'Aquarius'],[2,19,'Pisces'],[3,21,'Aries'],[4,20,'Taurus'],
    [5,21,'Gemini'],[6,21,'Cancer'],[7,23,'Leo'],[8,23,'Virgo'],
    [9,23,'Libra'],[10,23,'Scorpio'],[11,22,'Sagittarius'],[12,22,'Capricorn']
  ];
  // Signs in order — when date is before a boundary, use the previous sign
  const signOrder = ['Capricorn','Aquarius','Pisces','Aries','Taurus','Gemini',
                     'Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn'];
  let signName = 'Capricorn';
  for (let i = 0; i < boundaries.length; i++) {
    const [bm, bd] = boundaries[i];
    if (month < bm || (month === bm && day < bd)) {
      signName = signOrder[i]; break;
    }
    signName = boundaries[i][2];
  }
  const s = SIGNS.find(x=>x.sign===signName) || SIGNS[0];

  // Chinese zodiac
  const CHINESE = ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'];
  const chinese = CHINESE[(year-1900)%12];

  // Life path
  const digits = dob.replace(/-/g,'');
  let lp = [...digits].reduce((s,d)=>s+parseInt(d),0);
  while(lp>9&&lp!==11&&lp!==22) lp=[...String(lp)].reduce((s,d)=>s+parseInt(d),0);

  out.className = 'output-box success';
  out.textContent =
    `Date of Birth: ${new Date(year,month-1,day).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}\n\n` +
    `── Western Zodiac ────────────────────\n` +
    `  Sign:         ${s.symbol} ${s.sign}\n` +
    `  Dates:        ${s.date}\n` +
    `  Element:      ${s.el}\n` +
    `  Ruling planet:${s.rule}\n` +
    `  Traits:       ${s.trait}\n\n` +
    `── Chinese Zodiac ────────────────────\n` +
    `  Year ${year}: ${chinese}\n\n` +
    `── Numerology ───────────────────────\n` +
    `  Life Path:    ${lp}\n\n` +
    `── Compatible signs ──────────────────\n` +
    (s.el==='Fire'  ?'  Aries, Leo, Sagittarius (Fire)\n  Gemini, Libra, Aquarius (Air)':
     s.el==='Earth' ?'  Taurus, Virgo, Capricorn (Earth)\n  Cancer, Scorpio, Pisces (Water)':
     s.el==='Air'   ?'  Gemini, Libra, Aquarius (Air)\n  Aries, Leo, Sagittarius (Fire)':
                     '  Cancer, Scorpio, Pisces (Water)\n  Taurus, Virgo, Capricorn (Earth)');
  setStatus('zod-status','ok',`✓ ${s.symbol} ${s.sign}`);
}

/* ════════════════════════════════════
   BATCH 11 — FINAL 12 TOOLS TO 100
   ════════════════════════════════════ */

/* ── STOPWATCH & COUNTDOWN TIMER ── */
let swState = { running:false, startTime:0, elapsed:0, interval:null };
let cdState = { running:false, target:0, interval:null };

function swStart() {
  if (swState.running) return;
  swState.running = true;
  swState.startTime = Date.now() - swState.elapsed;
  swState.interval = setInterval(swTick, 10);
  document.getElementById('sw-start').style.display='none';
  document.getElementById('sw-pause').style.display='inline-block';
}
function swPause() {
  swState.running = false;
  swState.elapsed = Date.now() - swState.startTime;
  clearInterval(swState.interval);
  document.getElementById('sw-start').style.display='inline-block';
  document.getElementById('sw-pause').style.display='none';
}
function swReset() {
  clearInterval(swState.interval);
  swState = { running:false, startTime:0, elapsed:0, interval:null };
  const d = document.getElementById('sw-display');
  if (d) d.textContent = '00:00.000';
  document.getElementById('sw-start').style.display='inline-block';
  document.getElementById('sw-pause').style.display='none';
}
function swLap() {
  if (!swState.running && swState.elapsed === 0) return;
  const ms = swState.running ? Date.now() - swState.startTime : swState.elapsed;
  const laps = document.getElementById('sw-laps');
  if (!laps) return;
  const count = laps.children.length + 1;
  const div = document.createElement('div');
  div.style = 'font-family:var(--mono);font-size:.78rem;color:var(--text2);padding:.3rem 0;border-bottom:1px solid var(--border)';
  div.textContent = `Lap ${count}:  ${swFmt(ms)}`;
  laps.prepend(div);
}
function swTick() {
  const ms = Date.now() - swState.startTime;
  const d = document.getElementById('sw-display');
  if (d) d.textContent = swFmt(ms);
}
function swFmt(ms) {
  const h=Math.floor(ms/3600000), m=Math.floor((ms%3600000)/60000),
        s=Math.floor((ms%60000)/1000), cs=Math.floor((ms%1000));
  return h>0
    ? `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(3,'0')}`
    : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(3,'0')}`;
}

function cdStart() {
  const h=parseInt(document.getElementById('cd-hours')?.value)||0;
  const m=parseInt(document.getElementById('cd-mins')?.value)||0;
  const s=parseInt(document.getElementById('cd-secs')?.value)||0;
  const total = h*3600+m*60+s;
  if (total<=0) { showToast('Enter a time to count down'); return; }
  if (cdState.running) { clearInterval(cdState.interval); }
  cdState.target = Date.now() + total*1000;
  cdState.running = true;
  cdState.interval = setInterval(cdTick, 200);
  document.getElementById('cd-start-btn').style.display='none';
  document.getElementById('cd-stop-btn').style.display='inline-block';
}
function cdStop() {
  cdState.running = false;
  clearInterval(cdState.interval);
  document.getElementById('cd-start-btn').style.display='inline-block';
  document.getElementById('cd-stop-btn').style.display='none';
}
function cdTick() {
  const rem = Math.max(0, cdState.target - Date.now());
  const h=Math.floor(rem/3600000), m=Math.floor((rem%3600000)/60000), s=Math.floor((rem%60000)/1000);
  const d = document.getElementById('cd-display');
  if (d) d.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  if (rem === 0) {
    cdStop();
    try {
      const ctx = new (window.AudioContext||window.webkitAudioContext)();
      [880,1100,880].forEach((freq,i) => {
        const o=ctx.createOscillator(), g=ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value=freq; g.gain.setValueAtTime(0.3,ctx.currentTime+i*0.25);
        g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+i*0.25+0.2);
        o.start(ctx.currentTime+i*0.25); o.stop(ctx.currentTime+i*0.25+0.2);
      });
    } catch(_){}
    if (d) d.textContent = '⏰ Time\'s up!';
  }
}

/* ── RANDOM WORD GENERATOR ── */
const WORD_LISTS = {
  nouns:['apple','bridge','castle','dragon','empire','forest','garden','harbor','island','jungle','kingdom','lantern','mirror','needle','ocean','palace','river','shadow','throne','unicorn','valley','winter','zenith','anchor','beacon','crystal','diamond','echo','flame','glacier','horizon','ivory','jasmine','knight','lemon','marble','nebula','orbit','pearl','quartz','rainbow','silver','torch','umber','vapor','willow','xenon','yellow','zephyr'],
  adjectives:['ancient','brave','calm','dark','elegant','fierce','golden','hidden','icy','jolly','kind','lively','majestic','noble','opaque','proud','quiet','radiant','serene','tall','unique','vibrant','wise','young','zealous','bold','crisp','daring','ethereal','frosty','grand','harsh','infinite','joyful','keen','luminous','mighty','nimble','ornate','plush','rapid','swift','tender','vast'],
  verbs:['amaze','build','climb','dance','explore','fly','grow','help','inspire','jump','keep','learn','move','nurture','observe','paint','quest','run','soar','teach','unlock','venture','wander','excel','yearn'],
  mixed:['apple','brave','climb','dragon','elegant','fly','golden','harbor','inspire','jungle','keen','lively','mirror','noble','orbit','proud','quest','radiant','soar','throne','unlock','vibrant','wander','xenon','yellow','zenith','ancient','bridge','crystal','dance','empire','forest','glacier','hidden','ivory','jasmine','knight','luminous','mirror','nebula','ocean','pearl','quartz','river','shadow','torch','unicorn','valley','wise'],
};
function randomWordGen() {
  const type   = document.getElementById('rw-type')?.value || 'mixed';
  const count  = Math.min(parseInt(document.getElementById('rw-count')?.value)||5, 50);
  const out    = document.getElementById('rw-output');
  if (!out) return;
  const list = WORD_LISTS[type] || WORD_LISTS.mixed;
  const words = [];
  const used  = new Set();
  while (words.length < count) {
    const w = list[Math.floor(Math.random()*list.length)];
    if (!used.has(w)) { words.push(w); used.add(w); }
    if (used.size >= list.length) break;
  }
  out.className = 'output-box success';
  out.textContent = words.join('\n');
  setStatus('rw-status','ok',`✓ ${words.length} words generated`);
}
function rwCopy() { copyEl('rw-output'); }

/* ── TEXT TO SLUG CONVERTER ── */
function slugConvert() {
  const inp  = document.getElementById('slug-input')?.value || '';
  const sep  = document.getElementById('slug-sep')?.value || '-';
  const out  = document.getElementById('slug-output');
  if (!out) return;
  if (!inp.trim()) { out.textContent=''; return; }
  let slug = inp.trim().toLowerCase()
    .replace(/[àáâãäå]/g,'a').replace(/[èéêë]/g,'e').replace(/[ìíîï]/g,'i')
    .replace(/[òóôõö]/g,'o').replace(/[ùúûü]/g,'u').replace(/[ñ]/g,'n')
    .replace(/[ç]/g,'c').replace(/[^\w\s-]/g,'')
    .replace(/[\s_-]+/g, sep).replace(new RegExp(`^[${sep}]+|[${sep}]+$`,'g'),'');
  out.textContent = slug;
  setStatus('slug-status','ok',`✓ ${slug.length} chars`);
}

/* ── ASPECT RATIO CALCULATOR ── */
function aspectCalc() {
  const w   = parseFloat(document.getElementById('ar-width')?.value);
  const h   = parseFloat(document.getElementById('ar-height')?.value);
  const out = document.getElementById('ar-output');
  if (!out) return;
  if (isNaN(w)||isNaN(h)||w<=0||h<=0) { out.textContent='Enter width and height.'; out.className='output-box'; return; }
  const g = (a,b) => b===0?a:g(b,a%b);
  const d = g(Math.round(w),Math.round(h));
  const rw = Math.round(w)/d, rh = Math.round(h)/d;
  const decimal = (w/h).toFixed(4);
  const common = [[1,1],[4,3],[3,2],[16,9],[16,10],[21,9],[2,1],[9,16],[3,4]];
  const closest = common.reduce((best,r) => Math.abs(w/h-r[0]/r[1]) < Math.abs(w/h-best[0]/best[1]) ? r : best);

  out.className = 'output-box success';
  out.textContent =
    `Dimensions:    ${w} × ${h}\n` +
    `Aspect Ratio:  ${rw}:${rh}\n` +
    `Decimal:       ${decimal}:1\n` +
    `Closest common:${closest[0]}:${closest[1]}\n\n` +
    `── Scale to common widths ────────────\n` +
    [320,480,640,720,1024,1280,1920,2560,3840].map(nw => {
      const nh = Math.round(nw*(h/w));
      return `  ${String(nw+'px').padEnd(8)} → ${nh}px`;
    }).join('\n');
  setStatus('ar-status','ok',`✓ ${rw}:${rh}`);
}

/* ── FUEL COST CALCULATOR ── */
function fuelCalc() {
  const dist     = parseFloat(document.getElementById('fuel-dist')?.value);
  const effic    = parseFloat(document.getElementById('fuel-effic')?.value);
  const price    = parseFloat(document.getElementById('fuel-price')?.value);
  const distUnit = document.getElementById('fuel-dist-unit')?.value || 'km';
  const efficUnit= document.getElementById('fuel-effic-unit')?.value || 'L100km';
  const out      = document.getElementById('fuel-output');
  if (!out) return;
  if (isNaN(dist)||isNaN(effic)||isNaN(price)||dist<=0||effic<=0||price<=0) {
    out.textContent='Enter distance, fuel efficiency, and price per litre.'; out.className='output-box error'; return;
  }

  let distKm = distUnit==='km' ? dist : dist*1.60934;
  let liters;
  if (efficUnit==='L100km') liters = distKm * effic / 100;
  else if (efficUnit==='mpg') liters = distKm / (effic * 0.425144);
  else liters = distKm / effic; // km/L

  const cost = liters * price;
  const costPerKm = cost / distKm;

  out.className = 'output-box success';
  out.textContent =
    `Distance:          ${dist} ${distUnit} (${distKm.toFixed(1)} km)\n` +
    `Fuel efficiency:   ${effic} ${efficUnit}\n` +
    `Fuel price:        $${price}/L\n\n` +
    `── Trip cost ─────────────────────────\n` +
    `Fuel needed:       ${liters.toFixed(2)} litres\n` +
    `Total cost:        $${formatCur(cost)}\n` +
    `Cost per km:       $${costPerKm.toFixed(4)}/km\n` +
    `Cost per mile:     $${(costPerKm*1.60934).toFixed(4)}/mi\n\n` +
    `── Distance comparison ───────────────\n` +
    [50,100,200,500,1000].map(d => {
      const l = distUnit==='km' ? d*effic/100 : d*1.60934*effic/100;
      return `  ${String(d+'km').padEnd(8)} → ${l.toFixed(1)}L  $${formatCur(l*price)}`;
    }).join('\n');
  setStatus('fuel-status','ok',`✓ ${liters.toFixed(1)}L · $${formatCur(cost)}`);
}

/* ── PACE CALCULATOR ── */
function paceCalc() {
  const mode = document.getElementById('pace-mode')?.value || 'pace';
  const out  = document.getElementById('pace-output');
  if (!out) return;

  if (mode === 'pace') {
    const dist = parseFloat(document.getElementById('pace-dist')?.value);
    const h = parseInt(document.getElementById('pace-h')?.value)||0;
    const m = parseInt(document.getElementById('pace-m')?.value)||0;
    const s = parseInt(document.getElementById('pace-s')?.value)||0;
    if (isNaN(dist)||dist<=0||(h+m+s)===0) { out.textContent='Enter distance and finish time.'; out.className='output-box'; return; }
    const totalSec = h*3600+m*60+s;
    const paceSec  = totalSec/dist;
    const pm = Math.floor(paceSec/60), ps = Math.round(paceSec%60);
    const speedKph = dist/(totalSec/3600);
    const speedMph = speedKph*0.621371;
    out.className='output-box success';
    out.textContent=
      `Distance: ${dist} km  Time: ${h}h ${m}m ${s}s\n\n`+
      `Pace:        ${pm}:${String(ps).padStart(2,'0')} /km\n`+
      `Speed:       ${speedKph.toFixed(2)} km/h  (${speedMph.toFixed(2)} mph)\n\n`+
      `── Split times ───────────────────────\n`+
      [1,2,5,10,21.0975,42.195].map(d=>{
        const t=Math.round(paceSec*d);
        const hh=Math.floor(t/3600),mm=Math.floor((t%3600)/60),ss=t%60;
        return `  ${String(d+'km').padEnd(10)} ${hh>0?hh+'h ':''} ${mm}:${String(ss).padStart(2,'0')}`;
      }).join('\n');
  } else {
    const dist = parseFloat(document.getElementById('pace-dist')?.value);
    const pm = parseInt(document.getElementById('pace-pm')?.value)||0;
    const ps = parseInt(document.getElementById('pace-ps')?.value)||0;
    if (isNaN(dist)||dist<=0||(pm+ps)===0) { out.textContent='Enter distance and pace.'; out.className='output-box'; return; }
    const paceSec = pm*60+ps;
    const totalSec = paceSec*dist;
    const h=Math.floor(totalSec/3600),m=Math.floor((totalSec%3600)/60),s=Math.round(totalSec%60);
    out.className='output-box success';
    out.textContent=
      `Distance: ${dist} km  Pace: ${pm}:${String(ps).padStart(2,'0')} /km\n\n`+
      `Finish time: ${h>0?h+'h ':''} ${m}:${String(s).padStart(2,'0')}\n`+
      `Speed:       ${(3600/paceSec).toFixed(2)} km/h\n\n`+
      `── Common race finish times ──────────\n`+
      [5,10,21.0975,42.195].map(d=>{
        const t=Math.round(paceSec*d);
        const hh=Math.floor(t/3600),mm=Math.floor((t%3600)/60),ss=t%60;
        return `  ${String(d+'km').padEnd(10)} ${hh>0?hh+'h ':''} ${mm}:${String(ss).padStart(2,'0')}`;
      }).join('\n');
  }
  setStatus('pace-status','ok','✓ calculated');
}

/* ── COLOR CODE CONVERTER ── */
function colorCodeConvert() {
  const inp = document.getElementById('cc-input')?.value?.trim();
  const out = document.getElementById('cc-output');
  if (!out) return;
  if (!inp) { out.textContent=''; return; }

  let r,g,b,a=1;
  // Parse HEX
  const hex = inp.replace('#','');
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    r=parseInt(hex.slice(0,2),16); g=parseInt(hex.slice(2,4),16); b=parseInt(hex.slice(4,6),16);
  } else if (/^[0-9a-f]{3}$/i.test(hex)) {
    r=parseInt(hex[0]+hex[0],16); g=parseInt(hex[1]+hex[1],16); b=parseInt(hex[2]+hex[2],16);
  // Parse RGB
  } else if (/rgb/i.test(inp)) {
    const m=inp.match(/[\d.]+/g);
    if(m&&m.length>=3){r=parseInt(m[0]);g=parseInt(m[1]);b=parseInt(m[2]);if(m[4])a=parseFloat(m[3]);}
  // Parse HSL
  } else if (/hsl/i.test(inp)) {
    const m=inp.match(/[\d.]+/g);
    if(m&&m.length>=3){
      const H=parseFloat(m[0])/360,S=parseFloat(m[1])/100,L=parseFloat(m[2])/100;
      const q=L<0.5?L*(1+S):L+S-L*S,p=2*L-q;
      const hue2rgb=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;};
      r=Math.round(hue2rgb(p,q,H+1/3)*255);g=Math.round(hue2rgb(p,q,H)*255);b=Math.round(hue2rgb(p,q,H-1/3)*255);
    }
  } else { out.textContent='Invalid format. Try: #ff6600, rgb(255,102,0), hsl(24,100%,50%)'; out.className='output-box error'; return; }

  if(isNaN(r)||r<0||r>255){out.textContent='Invalid colour value.';out.className='output-box error';return;}

  const toHex=n=>n.toString(16).padStart(2,'0');
  const hexOut=`#${toHex(r)}${toHex(g)}${toHex(b)}`;
  // RGB to HSL
  const rn=r/255,gn=g/255,bn=b/255;
  const max=Math.max(rn,gn,bn),min=Math.min(rn,gn,bn),l=(max+min)/2;
  let h2=0,s2=0;
  if(max!==min){const d=max-min;s2=l>0.5?d/(2-max-min):d/(max+min);h2=max===rn?(gn-bn)/d+(gn<bn?6:0):max===gn?(bn-rn)/d+2:(rn-gn)/d+4;h2=Math.round(h2*60);}
  const hslOut=`hsl(${h2}, ${Math.round(s2*100)}%, ${Math.round(l*100)}%)`;
  const cmykK=1-Math.max(rn,gn,bn);
  const cmyk=cmykK===1?'cmyk(0, 0, 0, 100%)':`cmyk(${Math.round((1-rn-cmykK)/(1-cmykK)*100)}%, ${Math.round((1-gn-cmykK)/(1-cmykK)*100)}%, ${Math.round((1-bn-cmykK)/(1-cmykK)*100)}%, ${Math.round(cmykK*100)}%)`;

  const swatch = document.getElementById('cc-swatch');
  if(swatch) swatch.style.background=hexOut;
  out.className='output-box success';
  out.textContent=
    `HEX:    ${hexOut}\n`+
    `RGB:    rgb(${r}, ${g}, ${b})\n`+
    `RGBA:   rgba(${r}, ${g}, ${b}, ${a})\n`+
    `HSL:    ${hslOut}\n`+
    `CMYK:   ${cmyk}\n`+
    `Decimal:${r*65536+g*256+b}\n\n`+
    `── Tints (lighter) ──────────────────\n`+
    [0.9,0.75,0.5,0.25].map(t=>{
      const tr=Math.round(r+(255-r)*t),tg=Math.round(g+(255-g)*t),tb=Math.round(b+(255-b)*t);
      return `  #${toHex(tr)}${toHex(tg)}${toHex(tb)}  (${Math.round(t*100)}% white)`;
    }).join('\n')+'\n\n'+
    `── Shades (darker) ──────────────────\n`+
    [0.75,0.5,0.25,0.1].map(s=>{
      const sr=Math.round(r*s),sg=Math.round(g*s),sb=Math.round(b*s);
      return `  #${toHex(sr)}${toHex(sg)}${toHex(sb)}  (${Math.round((1-s)*100)}% black)`;
    }).join('\n');
  setStatus('cc-status','ok',`✓ ${hexOut}`);
}

/* ── NUMBER BASE CONVERTER ── */
function baseConvert() {
  const inp  = document.getElementById('base-input')?.value?.trim();
  const from = parseInt(document.getElementById('base-from')?.value) || 10;
  const out  = document.getElementById('base-output');
  if (!out) return;
  if (!inp) { out.textContent=''; return; }
  const n = parseInt(inp, from);
  if (isNaN(n)) { out.textContent=`Invalid number for base ${from}.`; out.className='output-box error'; return; }
  out.className='output-box success';
  out.textContent=
    `Input (base ${from}): ${inp}\n`+
    `Decimal value: ${n}\n\n`+
    `── All bases ─────────────────────────\n`+
    `Binary (2):      ${n.toString(2)}\n`+
    `Octal (8):       ${n.toString(8)}\n`+
    `Decimal (10):    ${n.toString(10)}\n`+
    `Hex (16):        ${n.toString(16).toUpperCase()}\n`+
    `Base 32:         ${n.toString(32).toUpperCase()}\n`+
    `Base 36:         ${n.toString(36).toUpperCase()}\n\n`+
    `── Binary breakdown ──────────────────\n`+
    `  ${n.toString(2).padStart(16,'0').match(/.{4}/g).join(' ')}`;
  setStatus('base-status','ok',`✓ Dec: ${n}  Hex: ${n.toString(16).toUpperCase()}`);
}

/* ── CHARACTER COUNTER ── */
function charCount() {
  const text = document.getElementById('char-input')?.value || '';
  const out  = document.getElementById('char-output');
  if (!out) return;
  const chars     = text.length;
  const noSpaces  = text.replace(/\s/g,'').length;
  const words     = text.trim()==='' ? 0 : text.trim().split(/\s+/).length;
  const sentences = (text.match(/[.!?]+/g)||[]).length;
  const paragraphs= text.trim()==='' ? 0 : text.trim().split(/\n\s*\n/).length;
  const lines     = text==='' ? 0 : text.split('\n').length;
  const digits    = (text.match(/\d/g)||[]).length;
  const letters   = (text.match(/[a-zA-Z]/g)||[]).length;
  const spaces    = chars - noSpaces;
  const readMin   = Math.ceil(words/200);
  const speakMin  = Math.ceil(words/130);

  // Twitter/Instagram/LinkedIn limits
  const limits = [[280,'Twitter/X'],[2200,'Instagram'],[3000,'LinkedIn post'],[700,'SMS (5 parts)'],[160,'SMS (1 part)']];

  out.className='output-box success';
  out.textContent=
    `Characters:        ${chars.toLocaleString()} (${noSpaces.toLocaleString()} without spaces)\n`+
    `Words:             ${words.toLocaleString()}\n`+
    `Sentences:         ${sentences.toLocaleString()}\n`+
    `Paragraphs:        ${paragraphs.toLocaleString()}\n`+
    `Lines:             ${lines.toLocaleString()}\n`+
    `Letters:           ${letters.toLocaleString()}\n`+
    `Digits:            ${digits.toLocaleString()}\n`+
    `Spaces:            ${spaces.toLocaleString()}\n\n`+
    `── Reading & speaking time ───────────\n`+
    `  Read time:  ~${readMin} min (200 wpm)\n`+
    `  Speak time: ~${speakMin} min (130 wpm)\n\n`+
    `── Platform limits ───────────────────\n`+
    limits.map(([lim,name])=>{
      const used=Math.min(chars,lim), pct=Math.round(chars/lim*100);
      const bar='█'.repeat(Math.min(20,Math.round(pct/5)))+'░'.repeat(Math.max(0,20-Math.min(20,Math.round(pct/5))));
      return `  ${name.padEnd(18)} ${chars}/${lim}  ${bar}  ${pct}%`;
    }).join('\n');
  setStatus('char-status','ok',`✓ ${chars} chars · ${words} words`);
}

/* ── PASSWORD STRENGTH CHECKER ── */
function passStrengthCheck() {
  const pass = document.getElementById('ps-input')?.value || '';
  const out  = document.getElementById('ps-output');
  if (!out) return;
  if (!pass) { out.textContent='Type a password to analyse.'; out.className='output-box'; return; }

  const checks = {
    len8:  pass.length >= 8,
    len12: pass.length >= 12,
    len16: pass.length >= 16,
    upper: /[A-Z]/.test(pass),
    lower: /[a-z]/.test(pass),
    digit: /\d/.test(pass),
    symbol:/[^a-zA-Z0-9]/.test(pass),
    noRepeat: !/(.)\1{2}/.test(pass),
    noCommon: !['password','123456','qwerty','abc123','letmein','welcome'].includes(pass.toLowerCase()),
  };

  let score = 0;
  if(checks.len8)    score+=15;
  if(checks.len12)   score+=15;
  if(checks.len16)   score+=10;
  if(checks.upper)   score+=10;
  if(checks.lower)   score+=10;
  if(checks.digit)   score+=10;
  if(checks.symbol)  score+=20;
  if(checks.noRepeat)score+=5;
  if(checks.noCommon)score+=5;
  score = Math.min(100, score);

  const label = score>=80?'Strong ✅':score>=60?'Good ✅':score>=40?'Fair ⚠':score>=20?'Weak ❌':'Very weak ❌';
  const bar = '█'.repeat(Math.round(score/5))+'░'.repeat(20-Math.round(score/5));

  // Entropy estimate
  let pool=0;
  if(/[a-z]/.test(pass)) pool+=26;
  if(/[A-Z]/.test(pass)) pool+=26;
  if(/\d/.test(pass))    pool+=10;
  if(/[^a-zA-Z0-9]/.test(pass)) pool+=32;
  const entropy = Math.round(pass.length * Math.log2(pool||1));

  // Crack time estimate
  const combinations = Math.pow(pool||1, pass.length);
  const rate = 1e10; // 10 billion guesses/sec (fast GPU)
  const secs = combinations / rate / 2; // average half
  const crackTime = secs<1?'instant':secs<60?`${Math.round(secs)}s`:secs<3600?`${Math.round(secs/60)}m`:secs<86400?`${Math.round(secs/3600)}h`:secs<31536000?`${Math.round(secs/86400)} days`:`${Math.round(secs/31536000).toLocaleString()} years`;

  out.className=score>=60?'output-box success':score>=40?'output-box':'output-box error';
  out.textContent=
    `Password: ${'*'.repeat(Math.min(pass.length,20))} (${pass.length} chars)\n\n`+
    `Strength:  ${bar}  ${score}/100\n`+
    `Rating:    ${label}\n`+
    `Entropy:   ${entropy} bits\n`+
    `Crack time: ${crackTime} (GPU brute force)\n\n`+
    `── Checks ────────────────────────────\n`+
    `  ${checks.len8?'✅':'❌'} At least 8 characters\n`+
    `  ${checks.len12?'✅':'❌'} At least 12 characters\n`+
    `  ${checks.len16?'✅':'❌'} At least 16 characters\n`+
    `  ${checks.upper?'✅':'❌'} Contains uppercase letters\n`+
    `  ${checks.lower?'✅':'❌'} Contains lowercase letters\n`+
    `  ${checks.digit?'✅':'❌'} Contains numbers\n`+
    `  ${checks.symbol?'✅':'❌'} Contains special characters\n`+
    `  ${checks.noRepeat?'✅':'❌'} No repeated characters (aaa)\n`+
    `  ${checks.noCommon?'✅':'❌'} Not a common password`;
  setStatus('ps-status',score>=60?'ok':'err',`${label} — ${score}/100`);
}

/* ── WORD FREQUENCY COUNTER ── */
function wordFreqCalc() {
  const text  = document.getElementById('wf-input')?.value || '';
  const limit = parseInt(document.getElementById('wf-limit')?.value) || 20;
  const stopwords_on = document.getElementById('wf-stopwords')?.checked !== false;
  const out   = document.getElementById('wf-output');
  if (!out) return;
  if (!text.trim()) { out.textContent='Paste text to analyse.'; out.className='output-box'; return; }

  const STOP = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','are','was','were','be','been','have','has','had','do','did','will','would','could','should','may','might','this','that','these','those','i','you','he','she','it','we','they','my','your','his','her','its','our','their','not','as','if','so','up','out','about','what','which','who','when','where','how','than','then','there','can','no','more','also','into','after','over','such','just','only','even','back','any','all','very','too','now','here','new','first','well','us']);

  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g,'').split(/\s+/).filter(w=>w.length>1&&(!stopwords_on||!STOP.has(w)));
  const freq  = {};
  words.forEach(w=>freq[w]=(freq[w]||0)+1);
  const sorted = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,limit);
  const maxCount = sorted[0]?.[1] || 1;
  const totalWords = words.length;

  out.className='output-box success';
  out.textContent=
    `Total words analysed: ${totalWords.toLocaleString()}\n`+
    `Unique words: ${Object.keys(freq).length.toLocaleString()}\n`+
    `Showing top ${sorted.length}\n\n`+
    `── Word frequency ────────────────────\n`+
    sorted.map(([w,c])=>{
      const pct=(c/totalWords*100).toFixed(1);
      const bar='█'.repeat(Math.round(c/maxCount*15))+'░'.repeat(15-Math.round(c/maxCount*15));
      return `  ${w.padEnd(18)} ${bar}  ${String(c).padStart(4)} (${pct}%)`;
    }).join('\n');
  setStatus('wf-status','ok',`✓ ${Object.keys(freq).length} unique words`);
}

/* ── SCREEN RESOLUTION CALCULATOR ── */
function screenResCalc() {
  const w    = parseFloat(document.getElementById('sr-width')?.value);
  const h    = parseFloat(document.getElementById('sr-height')?.value);
  const size = parseFloat(document.getElementById('sr-size')?.value);
  const out  = document.getElementById('sr-output');
  if (!out) return;
  if (isNaN(w)||isNaN(h)||w<=0||h<=0) { out.textContent='Enter width and height in pixels.'; out.className='output-box'; return; }

  const g = (a,b) => b===0?a:g(b,a%b);
  const d = g(Math.round(w),Math.round(h));
  const rw = Math.round(w)/d, rh = Math.round(h)/d;
  const totalPx = w*h;
  const megapx  = (totalPx/1e6).toFixed(2);

  let ppiLine = '';
  if (!isNaN(size) && size > 0) {
    const diag = Math.sqrt(w*w+h*h);
    const ppi  = Math.round(diag/size);
    const category = ppi>300?'Retina/Hi-DPI':ppi>200?'High DPI':ppi>150?'Standard HD':ppi>96?'Standard':ppi>72?'Low':'Very low';
    ppiLine = `PPI (pixels/inch): ${ppi}  (${category})\n`;
  }

  const common = [
    [1280,720,'720p HD'],    [1366,768,'Laptop HD'],
    [1920,1080,'1080p FHD'], [2560,1440,'1440p QHD'],
    [3840,2160,'4K UHD'],    [7680,4320,'8K UHD'],
    [1080,1920,'Portrait FHD'],[2160,3840,'Portrait 4K'],
  ];
  const matchLine = common.find(([cw,ch])=>cw===w&&ch===h);

  out.className='output-box success';
  out.textContent=
    `Resolution:    ${w} × ${h} pixels${matchLine?`  (${matchLine[2]})`:''}\n`+
    `Aspect Ratio:  ${rw}:${rh}\n`+
    `Total pixels:  ${totalPx.toLocaleString()} px  (${megapx} MP)\n`+
    ppiLine+
    `\n── Scale factors ─────────────────────\n`+
    [0.25,0.5,0.75,1,1.25,1.5,2].map(s=>`  ${(s*100).toFixed(0).padStart(4)}%  → ${Math.round(w*s)} × ${Math.round(h*s)}`).join('\n')+
    `\n\n── Common resolutions ────────────────\n`+
    common.map(([cw,ch,name])=>{
      const match = cw===w&&ch===h ? ' ← yours' : '';
      return `  ${name.padEnd(15)} ${cw} × ${ch}${match}`;
    }).join('\n');
  setStatus('sr-status','ok',`✓ ${w}×${h}  ${rw}:${rh}`);
}

/* ════════════════════════════════════
   BATCH 12 — 25 NEW TOOLS
   ════════════════════════════════════ */

/* ── 1. QUADRATIC EQUATION SOLVER ── */
function quadraticSolve() {
  const a = parseFloat(document.getElementById('quad-a')?.value);
  const b = parseFloat(document.getElementById('quad-b')?.value);
  const c = parseFloat(document.getElementById('quad-c')?.value);
  const out = document.getElementById('quad-output');
  if (!out) return;
  if (isNaN(a)||isNaN(b)||isNaN(c)||a===0) {
    out.textContent = a===0 ? 'Coefficient a cannot be 0 (not quadratic).' : 'Enter values for a, b, and c.';
    out.className = 'output-box error'; return;
  }
  const disc = b*b - 4*a*c;
  const fmt = n => parseFloat(n.toFixed(6)).toString();
  out.className = 'output-box success';
  if (disc > 0) {
    const x1 = (-b + Math.sqrt(disc))/(2*a);
    const x2 = (-b - Math.sqrt(disc))/(2*a);
    out.textContent =
      `Equation: ${a}x² + ${b}x + ${c} = 0\n\n`+
      `Discriminant: ${fmt(disc)} (> 0 → two real roots)\n\n`+
      `── Solutions ─────────────────────────\n`+
      `x₁ = ${fmt(x1)}\nx₂ = ${fmt(x2)}\n\n`+
      `── Steps ─────────────────────────────\n`+
      `Discriminant = b² - 4ac\n`+
      `             = ${b}² - 4(${a})(${c})\n`+
      `             = ${b*b} - ${4*a*c}\n`+
      `             = ${fmt(disc)}\n\n`+
      `x = (-b ± √discriminant) / 2a\n`+
      `x₁ = (${-b} + ${fmt(Math.sqrt(disc))}) / ${2*a} = ${fmt(x1)}\n`+
      `x₂ = (${-b} - ${fmt(Math.sqrt(disc))}) / ${2*a} = ${fmt(x2)}`;
  } else if (disc === 0) {
    const x = -b/(2*a);
    out.textContent =
      `Equation: ${a}x² + ${b}x + ${c} = 0\n\n`+
      `Discriminant: 0 (one repeated root)\n\n`+
      `x = -b / 2a = ${-b} / ${2*a} = ${fmt(x)}`;
  } else {
    const re = -b/(2*a);
    const im = Math.sqrt(-disc)/(2*a);
    out.textContent =
      `Equation: ${a}x² + ${b}x + ${c} = 0\n\n`+
      `Discriminant: ${fmt(disc)} (< 0 → complex roots)\n\n`+
      `── Complex Solutions ─────────────────\n`+
      `x₁ = ${fmt(re)} + ${fmt(im)}i\n`+
      `x₂ = ${fmt(re)} - ${fmt(im)}i`;
  }
  setStatus('quad-status','ok','✓ solved');
}

/* ── 2. TRIANGLE CALCULATOR ── */
function triangleCalc() {
  const mode = document.getElementById('tri-mode')?.value || 'sss';
  const out  = document.getElementById('tri-output');
  if (!out) return;
  const a = parseFloat(document.getElementById('tri-a')?.value) || 0;
  const b = parseFloat(document.getElementById('tri-b')?.value) || 0;
  const c = parseFloat(document.getElementById('tri-c')?.value) || 0;
  const A = parseFloat(document.getElementById('tri-A')?.value) * Math.PI/180 || 0;
  const B = parseFloat(document.getElementById('tri-B')?.value) * Math.PI/180 || 0;
  const fmt = n => parseFloat(n.toFixed(4)).toString();
  const deg = r => parseFloat((r*180/Math.PI).toFixed(4));
  try {
    let sa=a,sb=b,sc=c,sA=A,sB=B,sC;
    if (mode==='sss') {
      if(!sa||!sb||!sc) { out.textContent='Enter all 3 sides.'; out.className='output-box error'; return; }
      sA=Math.acos((sb*sb+sc*sc-sa*sa)/(2*sb*sc));
      sB=Math.acos((sa*sa+sc*sc-sb*sb)/(2*sa*sc));
      sC=Math.PI-sA-sB;
    } else if (mode==='sas') {
      if(!sa||!sb||!sB) { out.textContent='Enter two sides and included angle.'; out.className='output-box error'; return; }
      sc=Math.sqrt(sa*sa+sb*sb-2*sa*sb*Math.cos(sB));
      sA=Math.acos((sb*sb+sc*sc-sa*sa)/(2*sb*sc));
      sC=Math.PI-sA-sB;
    } else if (mode==='asa') {
      if(!sA||!sB||!sc) { out.textContent='Enter two angles and included side.'; out.className='output-box error'; return; }
      sC=Math.PI-sA-sB;
      sa=sc*Math.sin(sA)/Math.sin(sC);
      sb=sc*Math.sin(sB)/Math.sin(sC);
    }
    const perim = sa+sb+sc;
    const s = perim/2;
    const area = Math.sqrt(s*(s-sa)*(s-sb)*(s-sc));
    out.className='output-box success';
    out.textContent=
      `── Sides ─────────────────────────────\n`+
      `a = ${fmt(sa)}\nb = ${fmt(sb)}\nc = ${fmt(sc)}\n\n`+
      `── Angles ────────────────────────────\n`+
      `A = ${deg(sA)}°\nB = ${deg(sB)}°\nC = ${deg(Math.PI-sA-sB)}°\n\n`+
      `── Properties ────────────────────────\n`+
      `Perimeter: ${fmt(perim)}\nArea: ${fmt(area)}\n`+
      `Type: ${sa===sb&&sb===sc?'Equilateral':sa===sb||sb===sc||sa===sc?'Isosceles':'Scalene'}`;
    setStatus('tri-status','ok','✓ solved');
  } catch(e) { out.textContent='Invalid triangle values.'; out.className='output-box error'; }
}

/* ── 3. STANDARD DEVIATION CALCULATOR ── */
function stdDevCalc() {
  const raw = document.getElementById('std-input')?.value || '';
  const out = document.getElementById('std-output');
  if (!out) return;
  const nums = raw.split(/[\s,;]+/).map(Number).filter(n=>!isNaN(n)&&n!==null);
  if (nums.length < 2) { out.textContent='Enter at least 2 numbers separated by commas or spaces.'; out.className='output-box error'; return; }
  const n = nums.length;
  const mean = nums.reduce((s,x)=>s+x,0)/n;
  const variance = nums.reduce((s,x)=>s+(x-mean)**2,0)/(n-1); // sample
  const popVariance = nums.reduce((s,x)=>s+(x-mean)**2,0)/n;
  const std = Math.sqrt(variance);
  const popStd = Math.sqrt(popVariance);
  const sorted = [...nums].sort((a,b)=>a-b);
  const median = n%2===0?(sorted[n/2-1]+sorted[n/2])/2:sorted[Math.floor(n/2)];
  const fmt = x=>parseFloat(x.toFixed(6)).toString();
  out.className='output-box success';
  out.textContent=
    `Count:              ${n}\n`+
    `Sum:                ${fmt(nums.reduce((s,x)=>s+x,0))}\n`+
    `Mean (average):     ${fmt(mean)}\n`+
    `Median:             ${fmt(median)}\n`+
    `Min:                ${Math.min(...nums)}\n`+
    `Max:                ${Math.max(...nums)}\n`+
    `Range:              ${Math.max(...nums)-Math.min(...nums)}\n\n`+
    `── Spread ────────────────────────────\n`+
    `Sample Std Dev:     ${fmt(std)}\n`+
    `Population Std Dev: ${fmt(popStd)}\n`+
    `Sample Variance:    ${fmt(variance)}\n`+
    `Pop. Variance:      ${fmt(popVariance)}\n\n`+
    `── Data ──────────────────────────────\n`+
    `${sorted.join(', ')}`;
  setStatus('std-status','ok',`✓ Mean: ${fmt(mean)} · StdDev: ${fmt(std)}`);
}

/* ── 4. SIGNIFICANT FIGURES CALCULATOR ── */
function sigFigCalc() {
  const inp = document.getElementById('sf-input')?.value?.trim();
  const round = parseInt(document.getElementById('sf-round')?.value)||3;
  const out = document.getElementById('sf-output');
  if (!out) return;
  if (!inp) { out.textContent='Enter a number.'; out.className='output-box'; return; }
  const n = parseFloat(inp);
  if (isNaN(n)) { out.textContent='Invalid number.'; out.className='output-box error'; return; }
  // Count sig figs in input
  const countSigFigs = s => {
    s = s.replace(/^-/,'').replace(',','.');
    if (s.includes('.')) return s.replace('.','').replace(/^0+/,'').length;
    return s.replace(/0+$/,'').replace(/^0+/,'').length || 1;
  };
  const originalSF = countSigFigs(inp);
  // Round to N sig figs
  const rounded = parseFloat(n.toPrecision(round));
  out.className='output-box success';
  out.textContent=
    `Input:                  ${inp}\n`+
    `Significant figures:    ${originalSF}\n\n`+
    `── Rounded to sig figs ───────────────\n`+
    `${round} sig figs: ${rounded.toPrecision(round)}\n`+
    `1 sig fig:  ${n.toPrecision(1)}\n`+
    `2 sig figs: ${n.toPrecision(2)}\n`+
    `3 sig figs: ${n.toPrecision(3)}\n`+
    `4 sig figs: ${n.toPrecision(4)}\n`+
    `5 sig figs: ${n.toPrecision(5)}\n\n`+
    `── Rules for counting sig figs ───────\n`+
    `  All non-zero digits are significant\n`+
    `  Zeros between non-zeros are significant\n`+
    `  Trailing zeros after decimal point are significant\n`+
    `  Leading zeros are NOT significant`;
  setStatus('sf-status','ok',`✓ ${originalSF} sig figs in input`);
}

/* ── 5. CONCRETE CALCULATOR ── */
function concreteCalc() {
  const shape = document.getElementById('con-shape')?.value || 'slab';
  const unit  = document.getElementById('con-unit')?.value || 'ft';
  const out   = document.getElementById('con-output');
  if (!out) return;
  const l = parseFloat(document.getElementById('con-l')?.value);
  const w = parseFloat(document.getElementById('con-w')?.value);
  const h = parseFloat(document.getElementById('con-h')?.value);
  const d = parseFloat(document.getElementById('con-d')?.value)||0;
  if (isNaN(l)||isNaN(w)||isNaN(h)) { out.textContent='Enter all dimensions.'; out.className='output-box error'; return; }
  let volCubicFt;
  if (unit==='m') { volCubicFt = l*w*h*35.3147; }
  else { volCubicFt = l*w*h/12; } // ft + inches for h
  const volCubicYd = volCubicFt/27;
  const volCubicM  = volCubicFt*0.0283168;
  // Add 10% waste
  const bags60lb = Math.ceil(volCubicYd*45); // ~45 x 60lb bags per cu yd
  const bags80lb = Math.ceil(volCubicYd*34);
  out.className='output-box success';
  out.textContent=
    `Dimensions: ${l} × ${w} × ${h} ${unit==='ft'?'ft (h in inches)':unit}\n\n`+
    `── Volume ────────────────────────────\n`+
    `Cubic feet:  ${volCubicFt.toFixed(2)} ft³\n`+
    `Cubic yards: ${volCubicYd.toFixed(2)} yd³\n`+
    `Cubic metres:${volCubicM.toFixed(2)} m³\n\n`+
    `── Concrete bags needed ──────────────\n`+
    `60 lb bags:  ${bags60lb} bags (inc. 10% waste)\n`+
    `80 lb bags:  ${bags80lb} bags (inc. 10% waste)\n\n`+
    `── Ready-mix concrete ────────────────\n`+
    `Order:       ${(volCubicYd*1.1).toFixed(2)} yd³ (with 10% extra)`;
  setStatus('con-status','ok',`✓ ${volCubicYd.toFixed(2)} yd³`);
}

/* ── 6. PAINT CALCULATOR ── */
function paintCalc() {
  const rooms = document.querySelectorAll('.paint-room');
  const coats = parseInt(document.getElementById('paint-coats')?.value)||2;
  const coverage = parseFloat(document.getElementById('paint-coverage')?.value)||400; // sq ft per gallon
  const out = document.getElementById('paint-output');
  if (!out) return;
  let totalSqFt = 0;
  rooms.forEach(room => {
    const l = parseFloat(room.querySelector('.pr-l')?.value)||0;
    const w = parseFloat(room.querySelector('.pr-w')?.value)||0;
    const h = parseFloat(room.querySelector('.pr-h')?.value)||8;
    const doors = parseInt(room.querySelector('.pr-doors')?.value)||0;
    const windows = parseInt(room.querySelector('.pr-windows')?.value)||0;
    const wallArea = 2*(l+w)*h - doors*21 - windows*15;
    totalSqFt += Math.max(0,wallArea);
  });
  if (totalSqFt===0) { out.textContent='Add room dimensions.'; out.className='output-box'; return; }
  const totalWithCoats = totalSqFt * coats;
  const gallons = totalWithCoats/coverage;
  const quarts  = gallons*4;
  out.className='output-box success';
  out.textContent=
    `Wall area:      ${totalSqFt.toFixed(0)} sq ft\n`+
    `Coats:          ${coats}\n`+
    `Total to cover: ${totalWithCoats.toFixed(0)} sq ft\n`+
    `Coverage:       ${coverage} sq ft/gallon\n\n`+
    `── Paint needed ──────────────────────\n`+
    `Gallons: ${gallons.toFixed(2)} gal\n`+
    `Quarts:  ${quarts.toFixed(1)} qt\n\n`+
    `── Buy ───────────────────────────────\n`+
    `Round up: ${Math.ceil(gallons)} gallons\n`+
    `With 10% extra: ${Math.ceil(gallons*1.1)} gallons`;
  setStatus('paint-status','ok',`✓ ${Math.ceil(gallons)} gallons needed`);
}
function paintAddRoom() {
  const cont = document.getElementById('paint-rooms');
  if (!cont) return;
  const n = cont.children.length+1;
  const div = document.createElement('div');
  div.style='background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.75rem;margin-bottom:8px';
  div.className='paint-room';
  div.innerHTML=`<div style="font-size:.75rem;color:var(--accent);margin-bottom:6px">Room ${n}</div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px">
      <div><div class="pane-label" style="font-size:.65rem">Length (ft)</div><input class="b2-input pr-l" type="number" placeholder="12" oninput="paintCalc()"></div>
      <div><div class="pane-label" style="font-size:.65rem">Width (ft)</div><input class="b2-input pr-w" type="number" placeholder="10" oninput="paintCalc()"></div>
      <div><div class="pane-label" style="font-size:.65rem">Height (ft)</div><input class="b2-input pr-h" type="number" placeholder="8" oninput="paintCalc()"></div>
      <div><div class="pane-label" style="font-size:.65rem">Doors</div><input class="b2-input pr-doors" type="number" placeholder="1" oninput="paintCalc()"></div>
      <div><div class="pane-label" style="font-size:.65rem">Windows</div><input class="b2-input pr-windows" type="number" placeholder="1" oninput="paintCalc()"></div>
    </div>`;
  cont.appendChild(div);
  paintCalc();
}

/* ── 7. SQUARE FOOTAGE CALCULATOR ── */
function sqftCalc() {
  const shape = document.getElementById('sqft-shape')?.value||'rectangle';
  const out   = document.getElementById('sqft-output');
  if (!out) return;
  const l = parseFloat(document.getElementById('sqft-l')?.value)||0;
  const w = parseFloat(document.getElementById('sqft-w')?.value)||0;
  const unit = document.getElementById('sqft-unit')?.value||'ft';
  const toFt = {ft:1,in:1/12,m:3.28084,cm:0.0328084,yd:3};
  const conv = toFt[unit]||1;
  const lFt=l*conv, wFt=w*conv;
  let area=0;
  if(shape==='rectangle') area=lFt*wFt;
  else if(shape==='circle') area=Math.PI*(lFt/2)**2;
  else if(shape==='triangle') area=0.5*lFt*wFt;
  const pricePerSqFt = parseFloat(document.getElementById('sqft-price')?.value)||0;
  out.className='output-box success';
  out.textContent=
    `Shape: ${shape}\n`+
    `Dimensions: ${l} × ${w} ${unit}\n\n`+
    `── Area ──────────────────────────────\n`+
    `Square feet:   ${area.toFixed(2)} sq ft\n`+
    `Square metres: ${(area*0.092903).toFixed(2)} m²\n`+
    `Square yards:  ${(area/9).toFixed(2)} sq yd\n`+
    `Acres:         ${(area/43560).toFixed(6)}\n`+
    (pricePerSqFt>0?`\n── Cost ──────────────────────────────\n$${(area*pricePerSqFt).toFixed(2)} @ $${pricePerSqFt}/sq ft`:'');
  setStatus('sqft-status','ok',`✓ ${area.toFixed(2)} sq ft`);
}

/* ── 8. PREGNANCY DUE DATE CALCULATOR ── */
function pregnancyCalc() {
  const mode = document.getElementById('preg-mode')?.value||'lmp';
  const out  = document.getElementById('preg-output');
  if (!out) return;
  let lmp;
  if (mode==='lmp') {
    const d = document.getElementById('preg-lmp')?.value;
    if (!d) { out.textContent='Enter your last menstrual period date.'; out.className='output-box'; return; }
    const [y1,m1,d1]=d.split('-').map(Number); lmp=new Date(y1,m1-1,d1);
  } else {
    const d = document.getElementById('preg-conception')?.value;
    if (!d) { out.textContent='Enter conception date.'; out.className='output-box'; return; }
    const [y2,m2,d2]=d.split('-').map(Number); lmp=new Date(y2,m2-1,d2);
    lmp.setDate(lmp.getDate()-14);
  }
  const due = new Date(lmp); due.setDate(due.getDate()+280);
  const today = new Date();
  const daysPreg = Math.floor((today-lmp)/86400000);
  const weeksPreg = Math.floor(daysPreg/7);
  const daysMod   = daysPreg%7;
  const daysLeft  = Math.max(0,Math.floor((due-today)/86400000));
  const trimester = weeksPreg<13?1:weeksPreg<27?2:3;
  const fmtDate = d=>d.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  const milestones = [
    [13,'End of 1st trimester'],
    [20,'Anatomy scan (20 weeks)'],
    [24,'Viability milestone'],
    [28,'Start of 3rd trimester'],
    [37,'Full term'],
    [40,'Due date'],
  ];
  out.className='output-box success';
  out.textContent=
    `── Pregnancy dates ───────────────────\n`+
    `Last period:   ${fmtDate(lmp)}\n`+
    `Due date:      ${fmtDate(due)}\n\n`+
    `── Current status ────────────────────\n`+
    `${weeksPreg} weeks and ${daysMod} days pregnant\n`+
    `Trimester:     ${trimester} of 3\n`+
    `Days remaining: ${daysLeft} days\n\n`+
    `── Key milestones ────────────────────\n`+
    milestones.map(([w,label])=>{
      const d=new Date(lmp); d.setDate(d.getDate()+w*7);
      return `  ${label.padEnd(28)} ${d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`;
    }).join('\n');
  setStatus('preg-status','ok',`✓ ${weeksPreg}w ${daysMod}d pregnant`);
}

/* ── 9. OVULATION CALCULATOR ── */
function ovulationCalc() {
  const lmpStr = document.getElementById('ov-lmp')?.value;
  const cycle  = parseInt(document.getElementById('ov-cycle')?.value)||28;
  const out    = document.getElementById('ov-output');
  if (!out) return;
  if (!lmpStr) { out.textContent='Enter your last period date.'; out.className='output-box'; return; }
  const [oy,om,od]=lmpStr.split('-').map(Number); const lmp=new Date(oy,om-1,od);
  const ovulation = new Date(lmp); ovulation.setDate(lmp.getDate()+cycle-14);
  const fertStart = new Date(ovulation); fertStart.setDate(ovulation.getDate()-5);
  const fertEnd   = new Date(ovulation); fertEnd.setDate(ovulation.getDate()+1);
  const nextPeriod= new Date(lmp); nextPeriod.setDate(lmp.getDate()+cycle);
  const fmt=d=>d.toLocaleDateString('en-US',{weekday:'short',month:'long',day:'numeric'});
  out.className='output-box success';
  out.textContent=
    `Cycle length:       ${cycle} days\n\n`+
    `── This cycle ────────────────────────\n`+
    `Period started:     ${fmt(lmp)}\n`+
    `Fertile window:     ${fmt(fertStart)} → ${fmt(fertEnd)}\n`+
    `Peak ovulation:     ${fmt(ovulation)} ⭐\n`+
    `Next period (est):  ${fmt(nextPeriod)}\n\n`+
    `── Next 3 cycles ─────────────────────\n`+
    [1,2,3].map(i=>{
      const np=new Date(lmp); np.setDate(lmp.getDate()+cycle*i);
      const ov=new Date(np); ov.setDate(np.getDate()+cycle-14);
      return `  Cycle ${i+1}: Period ${fmt(np)} · Ovulation ${fmt(ov)}`;
    }).join('\n')+
    `\n\n  ⭐ = peak fertility day`;
  setStatus('ov-status','ok',`✓ Ovulation: ${fmt(ovulation)}`);
}

/* ── 10. ROI CALCULATOR ── */
function roiCalc() {
  const invest   = parseFloat(document.getElementById('roi-invest')?.value);
  const returns  = parseFloat(document.getElementById('roi-return')?.value);
  const years    = parseFloat(document.getElementById('roi-years')?.value)||1;
  const out      = document.getElementById('roi-output');
  if (!out) return;
  if (isNaN(invest)||isNaN(returns)||invest<=0) {
    out.textContent='Enter investment amount and net return.'; out.className='output-box error'; return;
  }
  const netProfit = returns - invest;
  const roi = (netProfit/invest)*100;
  const annualRoi = (Math.pow(returns/invest,1/years)-1)*100;
  const multiple  = returns/invest;
  out.className = roi>=0?'output-box success':'output-box error';
  out.textContent=
    `Investment:        ${formatCur(invest)}\n`+
    `Return:            ${formatCur(returns)}\n`+
    `Period:            ${years} year${years!==1?'s':''}\n\n`+
    `── Results ───────────────────────────\n`+
    `Net Profit/Loss:   ${netProfit>=0?'+':''}${formatCur(netProfit)}\n`+
    `ROI:               ${roi.toFixed(2)}%\n`+
    `Annualised ROI:    ${annualRoi.toFixed(2)}%/year\n`+
    `Return Multiple:   ${multiple.toFixed(2)}x\n\n`+
    `── Comparison ────────────────────────\n`+
    [0.5,1,2,3,5,10].map(yr=>{
      const ann=(Math.pow(returns/invest,1/yr)-1)*100;
      return `  ${yr} yr${yr!==1?'s':' '}: ${ann.toFixed(2)}% annualised ROI`;
    }).join('\n');
  setStatus('roi-status',roi>=0?'ok':'err',`✓ ROI: ${roi.toFixed(2)}%`);
}

/* ── 11. INFLATION CALCULATOR ── */
function inflationCalc() {
  const amount  = parseFloat(document.getElementById('inf-amount')?.value);
  const from    = parseInt(document.getElementById('inf-from')?.value);
  const to      = parseInt(document.getElementById('inf-to')?.value);
  const rate    = parseFloat(document.getElementById('inf-rate')?.value)||3.5;
  const out     = document.getElementById('inf-output');
  if (!out) return;
  if (isNaN(amount)||isNaN(from)||isNaN(to)||amount<=0) {
    out.textContent='Enter amount and years.'; out.className='output-box error'; return;
  }
  const years = to - from;
  const future = amount * Math.pow(1+rate/100, years);
  const loss   = future - amount;
  const purchPower = (amount/future*100);
  out.className='output-box success';
  out.textContent=
    `Amount in ${from}:    ${formatCur(amount)}\n`+
    `Average inflation:  ${rate}%/year\n`+
    `Years:              ${Math.abs(years)}\n\n`+
    `── Result ────────────────────────────\n`+
    `Value in ${to}:       ${formatCur(future)}\n`+
    `Inflation impact:   +${formatCur(loss)}\n`+
    `Purchasing power:   ${purchPower.toFixed(1)}% (lost ${(100-purchPower).toFixed(1)}%)\n\n`+
    `── Year by year ──────────────────────\n`+
    Array.from({length:Math.min(Math.abs(years),10)},(_,i)=>{
      const y=from+i+1;
      const v=amount*Math.pow(1+rate/100,i+1);
      return `  ${y}: ${formatCur(v)}`;
    }).join('\n');
  setStatus('inf-status','ok',`✓ ${formatCur(future)} in ${to}`);
}

/* ── 12. BREAK-EVEN CALCULATOR ── */
function breakEvenCalc() {
  const fixed   = parseFloat(document.getElementById('be-fixed')?.value);
  const varCost = parseFloat(document.getElementById('be-var')?.value);
  const price   = parseFloat(document.getElementById('be-price')?.value);
  const out     = document.getElementById('be-output');
  if (!out) return;
  if (isNaN(fixed)||isNaN(varCost)||isNaN(price)||price<=varCost) {
    out.textContent = price<=varCost ? 'Price must be greater than variable cost.' : 'Enter all values.';
    out.className='output-box error'; return;
  }
  const contrib  = price - varCost;
  const bepUnits = Math.ceil(fixed/contrib);
  const bepRev   = bepUnits * price;
  const margin   = (contrib/price*100);
  out.className='output-box success';
  out.textContent=
    `Fixed costs:         ${formatCur(fixed)}\n`+
    `Variable cost/unit:  ${formatCur(varCost)}\n`+
    `Selling price/unit:  ${formatCur(price)}\n\n`+
    `── Break-Even Point ──────────────────\n`+
    `Units to break even: ${bepUnits.toLocaleString()} units\n`+
    `Revenue at BEP:      ${formatCur(bepRev)}\n`+
    `Contribution margin: ${formatCur(contrib)}/unit (${margin.toFixed(1)}%)\n\n`+
    `── Profit at different volumes ───────\n`+
    [0.5,0.75,1,1.25,1.5,2].map(mult=>{
      const units=Math.round(bepUnits*mult);
      const profit=units*contrib-fixed;
      return `  ${units.toLocaleString().padStart(8)} units → ${profit>=0?'+':''}${formatCur(profit)}`;
    }).join('\n');
  setStatus('be-status','ok',`✓ BEP: ${bepUnits.toLocaleString()} units`);
}

/* ── 13. DIVIDEND CALCULATOR ── */
function dividendCalc() {
  const shares   = parseFloat(document.getElementById('div-shares')?.value);
  const divPerSh = parseFloat(document.getElementById('div-dps')?.value);
  const freq     = document.getElementById('div-freq')?.value||'annual';
  const price    = parseFloat(document.getElementById('div-price')?.value)||0;
  const growth   = parseFloat(document.getElementById('div-growth')?.value)||0;
  const out      = document.getElementById('div-output');
  if (!out) return;
  if (isNaN(shares)||isNaN(divPerSh)||shares<=0||divPerSh<=0) {
    out.textContent='Enter shares and dividend per share.'; out.className='output-box error'; return;
  }
  const freqMap={annual:1,semi:2,quarterly:4,monthly:12};
  const paymentsPerYear=freqMap[freq]||1;
  const annualDiv=shares*divPerSh*paymentsPerYear;
  const yieldPct=price>0?(annualDiv/(shares*price)*100):0;
  out.className='output-box success';
  out.textContent=
    `Shares:              ${shares.toLocaleString()}\n`+
    `Dividend per share:  ${formatCur(divPerSh)} (${freq})\n`+
    (price>0?`Share price:         ${formatCur(price)}\n`:'')+
    `\n── Income ─────────────────────────────\n`+
    `Per payment:         ${formatCur(shares*divPerSh)}\n`+
    `Annual dividend:     ${formatCur(annualDiv)}\n`+
    `Monthly income:      ${formatCur(annualDiv/12)}\n`+
    (price>0?`Dividend yield:      ${yieldPct.toFixed(2)}%\n`:'')+
    `\n── Growth projection ─────────────────\n`+
    [1,3,5,10].map(yr=>{
      const d=annualDiv*Math.pow(1+growth/100,yr);
      return `  Year ${yr}: ${formatCur(d)}/year`;
    }).join('\n');
  setStatus('div-status','ok',`✓ ${formatCur(annualDiv)}/year`);
}

/* ── 14. ELECTRICITY COST CALCULATOR ── */
function electricityCalc() {
  const rows = document.querySelectorAll('.elec-row');
  const rate = parseFloat(document.getElementById('elec-rate')?.value)||0.12;
  const out  = document.getElementById('elec-output');
  if (!out) return;
  let totalDailyKwh=0;
  const items=[];
  rows.forEach(row=>{
    const name  = row.querySelector('.er-name')?.value||'Device';
    const watts = parseFloat(row.querySelector('.er-watts')?.value)||0;
    const hours = parseFloat(row.querySelector('.er-hours')?.value)||0;
    const kwhDay= watts*hours/1000;
    totalDailyKwh+=kwhDay;
    if(watts>0) items.push({name,watts,hours,kwhDay});
  });
  if(!items.length){out.textContent='Add appliances to calculate.';out.className='output-box';return;}
  const monthly=totalDailyKwh*30;
  const yearly =totalDailyKwh*365;
  out.className='output-box success';
  out.textContent=
    `Rate: $${rate}/kWh\n\n`+
    `── Appliance breakdown ───────────────\n`+
    items.map(i=>`  ${i.name.padEnd(18)} ${i.watts}W × ${i.hours}h = ${i.kwhDay.toFixed(3)} kWh/day`).join('\n')+
    `\n\n── Total cost ────────────────────────\n`+
    `Daily:   ${totalDailyKwh.toFixed(3)} kWh = ${formatCur(totalDailyKwh*rate)}\n`+
    `Monthly: ${monthly.toFixed(1)} kWh = ${formatCur(monthly*rate)}\n`+
    `Yearly:  ${yearly.toFixed(0)} kWh = ${formatCur(yearly*rate)}`;
  setStatus('elec-status','ok',`✓ ${formatCur(monthly*rate)}/month`);
}
function elecAddRow() {
  const cont=document.getElementById('elec-rows');
  if(!cont)return;
  const div=document.createElement('div');
  div.className='elec-row';
  div.style='display:grid;grid-template-columns:1fr 80px 80px 32px;gap:6px;margin-bottom:6px;align-items:center';
  div.innerHTML=`
    <input class="b2-input er-name" placeholder="Appliance name" style="font-size:.78rem" oninput="electricityCalc()">
    <input class="b2-input er-watts" type="number" placeholder="Watts" style="font-size:.78rem" oninput="electricityCalc()">
    <input class="b2-input er-hours" type="number" placeholder="Hrs/day" style="font-size:.78rem" oninput="electricityCalc()">
    <button onclick="this.parentElement.remove();electricityCalc()" style="background:var(--surface2);border:1px solid var(--border);border-radius:5px;color:var(--red);cursor:pointer;font-size:.75rem;height:32px">✕</button>`;
  cont.appendChild(div);
  electricityCalc();
}

/* ── 15. HEIGHT CONVERTER ── */
function heightConvert() {
  const inp  = document.getElementById('ht-input')?.value?.trim();
  const from = document.getElementById('ht-from')?.value||'cm';
  const out  = document.getElementById('ht-output');
  if (!out) return;
  if (!inp) { out.textContent=''; return; }
  let cm;
  if (from==='cm') cm=parseFloat(inp);
  else if (from==='m') cm=parseFloat(inp)*100;
  else if (from==='in') cm=parseFloat(inp)*2.54;
  else if (from==='ft') {
    const parts=inp.replace("'",' ').replace('"','').split(/\s+/);
    cm=(parseFloat(parts[0])*12+(parseFloat(parts[1])||0))*2.54;
  } else if (from==='ftin') {
    const m=inp.match(/(\d+)\s*(?:ft|'|feet)\s*(\d+)?\s*(?:in|"|inches)?/i);
    if(m) cm=((parseFloat(m[1])||0)*12+(parseFloat(m[2])||0))*2.54;
  }
  if (!cm||isNaN(cm)||cm<=0) { out.textContent='Invalid input.'; out.className='output-box error'; return; }
  const m=cm/100, inches=cm/2.54, ft=Math.floor(inches/12), inRem=Math.round(inches%12);
  out.className='output-box success';
  out.textContent=
    `── All conversions ───────────────────\n`+
    `Centimetres: ${cm.toFixed(1)} cm\n`+
    `Metres:      ${m.toFixed(3)} m\n`+
    `Inches:      ${inches.toFixed(2)} in\n`+
    `Feet:        ${(inches/12).toFixed(4)} ft\n`+
    `Feet+Inches: ${ft}' ${inRem}"  (${ft}ft ${inRem}in)\n\n`+
    `── Common heights ────────────────────\n`+
    [[150,'4\'11"'],[155,'5\'1"'],[160,'5\'3"'],[165,'5\'5"'],
     [170,'5\'7"'],[175,'5\'9"'],[180,'5\'11"'],[185,'6\'1"'],[190,'6\'3"']]
    .map(([c,f])=>`  ${c}cm = ${f}`).join('\n');
  setStatus('ht-status','ok',`✓ ${ft}'${inRem}" = ${cm.toFixed(1)}cm`);
}

/* ── 16. CALORIE BURN CALCULATOR ── */
function calorieBurnCalc() {
  const weight = parseFloat(document.getElementById('cb-weight')?.value);
  const time   = parseFloat(document.getElementById('cb-time')?.value);
  const act    = document.getElementById('cb-activity')?.value||'walking';
  const unit   = document.getElementById('cb-unit')?.value||'kg';
  const out    = document.getElementById('cb-output');
  if (!out) return;
  if (isNaN(weight)||isNaN(time)||weight<=0||time<=0) {
    out.textContent='Enter weight and duration.'; out.className='output-box error'; return;
  }
  const wKg = unit==='lbs' ? weight*0.453592 : weight;
  // MET values
  const METS={
    'walking':3.5,'running':9.8,'cycling':7.5,'swimming':8,
    'yoga':3,'hiit':10,'weights':5,'basketball':8,'tennis':7.3,
    'dancing':5.5,'hiking':6,'rowing':8.5,'elliptical':6.5,'jump_rope':12
  };
  const met=METS[act]||4;
  const calories=met*wKg*time/60;
  out.className='output-box success';
  out.textContent=
    `Weight: ${weight} ${unit}\nDuration: ${time} min\n\n`+
    `── Calories burned ───────────────────\n`+
    `${Math.round(calories)} calories\n\n`+
    `── Compare activities (${time} min) ──────\n`+
    Object.entries(METS).map(([a,m])=>{
      const cal=Math.round(m*wKg*time/60);
      return `  ${a.replace('_',' ').padEnd(16)} ${cal} cal`;
    }).join('\n');
  setStatus('cb-status','ok',`✓ ${Math.round(calories)} calories burned`);
}

/* ── 17. TIP SPLIT CALCULATOR ── */
function tipSplitCalc() {
  const bill   = parseFloat(document.getElementById('ts-bill')?.value);
  const tip    = parseFloat(document.getElementById('ts-tip')?.value)||15;
  const people = parseInt(document.getElementById('ts-people')?.value)||1;
  const out    = document.getElementById('ts-output');
  if (!out) return;
  if (isNaN(bill)||bill<=0) { out.textContent='Enter bill amount.'; out.className='output-box error'; return; }
  const tipAmt   = bill*tip/100;
  const total    = bill+tipAmt;
  const perPerson= total/people;
  const tipPer   = tipAmt/people;
  out.className='output-box success';
  out.textContent=
    `Bill:          ${formatCur(bill)}\n`+
    `Tip (${tip}%):    ${formatCur(tipAmt)}\n`+
    `Total:         ${formatCur(total)}\n`+
    `People:        ${people}\n\n`+
    `── Per person ────────────────────────\n`+
    `Each pays:     ${formatCur(perPerson)}\n`+
    `Each tips:     ${formatCur(tipPer)}\n\n`+
    `── Quick tip reference ───────────────\n`+
    [10,15,18,20,25].map(t=>{
      const ta=bill*t/100;
      return `  ${t}% tip: ${formatCur(ta)} total → ${formatCur((bill+ta)/people)}/person`;
    }).join('\n');
  setStatus('ts-status','ok',`✓ ${formatCur(perPerson)}/person`);
}

/* ── 18. MEETING TIME ZONE PLANNER ── */
function meetingCalc() {
  const time = document.getElementById('meet-time')?.value;
  const date = document.getElementById('meet-date')?.value;
  const out  = document.getElementById('meet-output');
  if (!out) return;
  if (!time) { out.textContent='Enter a meeting time.'; out.className='output-box'; return; }
  const zones = [
    ['New York','America/New_York','🇺🇸'],
    ['London','Europe/London','🇬🇧'],
    ['Dubai','Asia/Dubai','🇦🇪'],
    ['Karachi/PKT','Asia/Karachi','🇵🇰'],
    ['Mumbai','Asia/Kolkata','🇮🇳'],
    ['Singapore','Asia/Singapore','🇸🇬'],
    ['Tokyo','Asia/Tokyo','🇯🇵'],
    ['Sydney','Australia/Sydney','🇦🇺'],
    ['Los Angeles','America/Los_Angeles','🇺🇸'],
    ['Toronto','America/Toronto','🇨🇦'],
    ['Berlin','Europe/Berlin','🇩🇪'],
    ['Paris','Europe/Paris','🇫🇷'],
  ];
  const base = date ? new Date(`${date}T${time}`) : new Date(`2000-01-01T${time}`);
  out.className='output-box success';
  out.textContent=
    `Meeting time: ${time}${date?' on '+date:''}\n\n`+
    `── Global times ──────────────────────\n`+
    zones.map(([city,tz,flag])=>{
      try {
        const t=base.toLocaleTimeString('en-US',{timeZone:tz,hour:'2-digit',minute:'2-digit',hour12:true});
        const d=date?base.toLocaleDateString('en-US',{timeZone:tz,weekday:'short',month:'short',day:'numeric'}):'';
        const hour=parseInt(base.toLocaleTimeString('en-US',{timeZone:tz,hour:'numeric',hour12:false}));
        const status=hour>=9&&hour<18?'✅ Work hours':hour>=7&&hour<22?'🟡 Ok':hour>=0&&hour<7?'🔴 Night':'🔴 Late';
        return `  ${flag} ${city.padEnd(16)} ${t}${d?' '+d:''} ${status}`;
      } catch(e){return '';}
    }).filter(Boolean).join('\n');
  setStatus('meet-status','ok','✓ times calculated');
}

/* ── 19. MATRIX CALCULATOR ── */
function matrixCalc() {
  const op  = document.getElementById('mat-op')?.value||'add';
  const out = document.getElementById('mat-output');
  if (!out) return;
  const parseMatrix = id => {
    const val = document.getElementById(id)?.value?.trim();
    if (!val) return null;
    return val.split('\n').map(row=>row.trim().split(/[\s,]+/).map(Number));
  };
  const A = parseMatrix('mat-a');
  const B = parseMatrix('mat-b');
  if (!A) { out.textContent='Enter matrix A (rows separated by newlines, values by spaces or commas).'; out.className='output-box'; return; }
  const fmtMatrix = m => m.map(r=>r.map(v=>String(parseFloat(v.toFixed(4))).padStart(8)).join(' ')).join('\n');
  try {
    let result;
    if (op==='add'||op==='sub') {
      if (!B) { out.textContent='Enter both matrices.'; out.className='output-box error'; return; }
      result = A.map((row,i)=>row.map((v,j)=>op==='add'?v+B[i][j]:v-B[i][j]));
    } else if (op==='mul') {
      if (!B) { out.textContent='Enter both matrices.'; out.className='output-box error'; return; }
      result = A.map((row,i)=>B[0].map((_,j)=>row.reduce((s,_,k)=>s+A[i][k]*B[k][j],0)));
    } else if (op==='transpose') {
      result = A[0].map((_,i)=>A.map(row=>row[i]));
    } else if (op==='det') {
      if (A.length!==A[0].length) { out.textContent='Determinant requires a square matrix.'; out.className='output-box error'; return; }
      const det = m => {
        if(m.length===1) return m[0][0];
        if(m.length===2) return m[0][0]*m[1][1]-m[0][1]*m[1][0];
        return m[0].reduce((s,v,j)=>s+(j%2===0?1:-1)*v*det(m.slice(1).map(r=>[...r.slice(0,j),...r.slice(j+1)])),0);
      };
      const d = det(A);
      out.className='output-box success';
      out.textContent=`Matrix A:\n${fmtMatrix(A)}\n\nDeterminant = ${parseFloat(d.toFixed(6))}`;
      setStatus('mat-status','ok',`✓ det = ${parseFloat(d.toFixed(4))}`);
      return;
    }
    out.className='output-box success';
    out.textContent=`Result:\n${fmtMatrix(result)}`;
    setStatus('mat-status','ok','✓ calculated');
  } catch(e) { out.textContent='Matrix dimensions incompatible for this operation.'; out.className='output-box error'; }
}

/* ── 20. ROOF PITCH CALCULATOR ── */
function roofPitchCalc() {
  const run  = parseFloat(document.getElementById('rp-run')?.value);
  const rise = parseFloat(document.getElementById('rp-rise')?.value);
  const out  = document.getElementById('rp-output');
  if (!out) return;
  if (isNaN(run)||isNaN(rise)||run<=0) { out.textContent='Enter run and rise.'; out.className='output-box error'; return; }
  const pitch   = rise/run;
  const angle   = Math.atan(pitch)*180/Math.PI;
  const slope   = Math.sqrt(run*run+rise*rise)/run;
  const pitchStr= `${rise}:12`;
  // Normalize to per 12
  const riseP12 = (rise/run*12).toFixed(2);
  out.className='output-box success';
  out.textContent=
    `Run: ${run}  Rise: ${rise}\n\n`+
    `── Roof Pitch ────────────────────────\n`+
    `Pitch:         ${riseP12}:12\n`+
    `Angle:         ${angle.toFixed(2)}°\n`+
    `Slope factor:  ${slope.toFixed(4)}\n`+
    `Multiplier:    ${slope.toFixed(4)}x (multiply flat area)\n\n`+
    `── Pitch classification ──────────────\n`+
    `${parseFloat(riseP12)<3?'Flat/low pitch':parseFloat(riseP12)<6?'Medium pitch':parseFloat(riseP12)<9?'Steep':parseFloat(riseP12)<12?'Very steep':'Extreme pitch'}\n\n`+
    `── Common pitches ────────────────────\n`+
    [2,3,4,5,6,7,8,9,10,12].map(r=>{
      const a=Math.atan(r/12)*180/Math.PI;
      const s=Math.sqrt(144+r*r)/12;
      return `  ${String(r+':12').padEnd(6)} ${a.toFixed(1)}° slope×${s.toFixed(3)}`;
    }).join('\n');
  setStatus('rp-status','ok',`✓ ${riseP12}:12 = ${angle.toFixed(1)}°`);
}

/* ── 21. FLOORING CALCULATOR ── */
function flooringCalc() {
  const l      = parseFloat(document.getElementById('fl-l')?.value);
  const w      = parseFloat(document.getElementById('fl-w')?.value);
  const waste  = parseFloat(document.getElementById('fl-waste')?.value)||10;
  const price  = parseFloat(document.getElementById('fl-price')?.value)||0;
  const boxSz  = parseFloat(document.getElementById('fl-box')?.value)||20;
  const out    = document.getElementById('fl-output');
  if (!out) return;
  if (isNaN(l)||isNaN(w)||l<=0||w<=0) { out.textContent='Enter room dimensions.'; out.className='output-box error'; return; }
  const sqFt    = l*w;
  const withWaste = sqFt*(1+waste/100);
  const boxes   = Math.ceil(withWaste/boxSz);
  const totalCost = price>0 ? withWaste*price : 0;
  out.className='output-box success';
  out.textContent=
    `Room: ${l} × ${w} ft\n`+
    `Waste allowance: ${waste}%\n\n`+
    `── Material needed ───────────────────\n`+
    `Room area:     ${sqFt.toFixed(2)} sq ft\n`+
    `With waste:    ${withWaste.toFixed(2)} sq ft\n`+
    `Sq metres:     ${(withWaste*0.0929).toFixed(2)} m²\n`+
    (boxSz>0?`Boxes needed:  ${boxes} boxes (${boxSz} sq ft/box)\n`:'')+
    (price>0?`\n── Cost ──────────────────────────────\n$${totalCost.toFixed(2)} @ $${price}/sq ft\n`:'');
  setStatus('fl-status','ok',`✓ ${withWaste.toFixed(0)} sq ft needed`);
}

/* ── 22. BLOOD PRESSURE CHECKER ── */
function bloodPressureCalc() {
  const sys = parseInt(document.getElementById('bp-sys')?.value);
  const dia = parseInt(document.getElementById('bp-dia')?.value);
  const out = document.getElementById('bp-output');
  if (!out) return;
  if (isNaN(sys)||isNaN(dia)||sys<=0||dia<=0) { out.textContent='Enter systolic and diastolic values.'; out.className='output-box error'; return; }
  const pulse = sys - dia;
  let category, color, advice;
  if (sys<90||dia<60) { category='Low Blood Pressure'; color='var(--accent)'; advice='Consult a doctor if you feel dizzy or faint.'; }
  else if (sys<120&&dia<80) { category='Normal'; color='var(--accent)'; advice='Excellent! Maintain healthy habits.'; }
  else if (sys<130&&dia<80) { category='Elevated'; color='#ffd060'; advice='Make lifestyle changes to prevent hypertension.'; }
  else if (sys<140||dia<90) { category='High — Stage 1'; color='#ff9070'; advice='Consult your doctor about treatment options.'; }
  else if (sys<180||dia<120) { category='High — Stage 2'; color='var(--red)'; advice='Seek medical attention. Lifestyle + medication needed.'; }
  else { category='Hypertensive Crisis'; color='var(--red)'; advice='Seek emergency medical care immediately!'; }

  out.className='output-box success';
  out.textContent=
    `Systolic:   ${sys} mmHg\nDiastolic:  ${dia} mmHg\nPulse pressure: ${pulse} mmHg\n\n`+
    `── Classification ────────────────────\n`+
    `Category: ${category}\n`+
    `Advice: ${advice}\n\n`+
    `── BP Categories (AHA guidelines) ───\n`+
    `  Normal:          <120 / <80\n`+
    `  Elevated:        120-129 / <80\n`+
    `  High Stage 1:    130-139 / 80-89\n`+
    `  High Stage 2:    ≥140 / ≥90\n`+
    `  Crisis:          >180 / >120`;
  setStatus('bp-status','ok',`${sys}/${dia} — ${category}`);
}

/* ── 23. VITAMIN D CALCULATOR ── */
function vitaminDCalc() {
  const skin    = document.getElementById('vd-skin')?.value||'medium';
  const lat     = document.getElementById('vd-lat')?.value||'temperate';
  const time    = parseInt(document.getElementById('vd-time')?.value)||0;
  const age     = parseInt(document.getElementById('vd-age')?.value)||30;
  const out     = document.getElementById('vd-output');
  if (!out) return;
  const skinMult = {fair:1.5,medium:1,dark:0.5,very_dark:0.3};
  const latMult  = {tropical:1.4,subtropical:1.1,temperate:0.8,northern:0.5};
  const sm = skinMult[skin]||1;
  const lm = latMult[lat]||1;
  const iuPerMin = 33*sm*lm; // rough IU per minute of midday sun
  const iuFromSun = time*iuPerMin;
  const ageSupp   = age>=70?800:age>=50?600:400;
  const totalRec  = age>=70?800:600;
  const sunMins   = Math.ceil(totalRec/iuPerMin);
  out.className='output-box success';
  out.textContent=
    `Skin tone:     ${skin}\nLatitude:      ${lat}\nAge:           ${age}\n\n`+
    `── Sun exposure ──────────────────────\n`+
    `${time} min sun ≈ ${Math.round(iuFromSun)} IU vitamin D\n`+
    `Recommended:   ${totalRec} IU/day (age ${age})\n`+
    `Sun needed:    ~${sunMins} min at midday (arms+legs exposed)\n\n`+
    `── Recommended daily intake ──────────\n`+
    `  0–12 months: 400 IU\n`+
    `  1–70 years:  600 IU\n`+
    `  70+ years:   800 IU\n`+
    `  Upper limit: 4,000 IU/day (adults)\n\n`+
    `── Sources ───────────────────────────\n`+
    `  Sunlight (15-30 min): 1,000-20,000 IU\n`+
    `  Fatty fish (85g):     450-570 IU\n`+
    `  Fortified milk (cup): 120 IU\n`+
    `  Egg yolk:             40 IU`;
  setStatus('vd-status','ok','✓ calculated');
}

/* ── 24. BLOOD TYPE COMPATIBILITY ── */
function bloodTypeCalc() {
  const type = document.getElementById('bt-type')?.value||'O+';
  const out  = document.getElementById('bt-output');
  if (!out) return;
  const compatibility = {
    'O-':  { donate:['O-','O+','A-','A+','B-','B+','AB-','AB+'], receive:['O-'] },
    'O+':  { donate:['O+','A+','B+','AB+'], receive:['O-','O+'] },
    'A-':  { donate:['A-','A+','AB-','AB+'], receive:['O-','A-'] },
    'A+':  { donate:['A+','AB+'], receive:['O-','O+','A-','A+'] },
    'B-':  { donate:['B-','B+','AB-','AB+'], receive:['O-','B-'] },
    'B+':  { donate:['B+','AB+'], receive:['O-','O+','B-','B+'] },
    'AB-': { donate:['AB-','AB+'], receive:['O-','A-','B-','AB-'] },
    'AB+': { donate:['AB+'], receive:['O-','O+','A-','A+','B-','B+','AB-','AB+'] },
  };
  const c = compatibility[type];
  out.className='output-box success';
  out.textContent=
    `Blood type: ${type}\n\n`+
    `── Can donate blood to ───────────────\n`+
    `  ${c.donate.join('  ')}\n\n`+
    `── Can receive blood from ────────────\n`+
    `  ${c.receive.join('  ')}\n\n`+
    `── Blood type facts ──────────────────\n`+
    `  O- = Universal donor (all types can receive)\n`+
    `  AB+ = Universal recipient (can receive all types)\n`+
    `  Most common: O+ (~38% of population)\n`+
    `  Rarest: AB- (~1% of population)`;
  setStatus('bt-status','ok',`✓ ${type} compatibility shown`);
}

/* ── 25. TIMEZONE MEETING PLANNER (already have timezone-converter) ──
   Use this as GRADE POINT AVERAGE UPGRADE / GPA to CGPA ── */
function cgpaCalc() {
  const gpa  = parseFloat(document.getElementById('cgpa-gpa')?.value);
  const scale= parseFloat(document.getElementById('cgpa-scale')?.value)||4.0;
  const out  = document.getElementById('cgpa-output');
  if (!out) return;
  if (isNaN(gpa)||gpa<0||gpa>scale) { out.textContent=`Enter GPA between 0 and ${scale}.`; out.className='output-box error'; return; }
  const pct = (gpa/scale*100).toFixed(2);
  const grade = gpa>=scale*0.9?'A+':gpa>=scale*0.8?'A':gpa>=scale*0.7?'B':gpa>=scale*0.6?'C':gpa>=scale*0.5?'D':'F';
  out.className='output-box success';
  out.textContent=
    `GPA: ${gpa} / ${scale}\n\n`+
    `── Conversions ───────────────────────\n`+
    `Percentage:    ${pct}%\n`+
    `Letter grade:  ${grade}\n`+
    `On 4.0 scale:  ${(gpa/scale*4).toFixed(2)}\n`+
    `On 5.0 scale:  ${(gpa/scale*5).toFixed(2)}\n`+
    `On 10.0 scale: ${(gpa/scale*10).toFixed(2)}\n\n`+
    `── Classification ────────────────────\n`+
    [[0.9,'Distinction / Summa Cum Laude'],[0.8,'Merit / Magna Cum Laude'],
     [0.7,'Cum Laude'],[0.6,'Pass'],[0,'Fail']]
    .map(([t,l])=>`  ${(t*scale).toFixed(1)}+ → ${l}`).join('\n')+
    `\n\n── Scale conversions ─────────────────\n`+
    [[4.0,'US'],[5.0,'India (some)'],[7.0,'India (some)'],[10.0,'India/Pakistan']]
    .map(([s,c])=>`  ${c} ${s}-scale: ${(gpa/scale*s).toFixed(2)}`).join('\n');
  setStatus('cgpa-status','ok',`✓ ${pct}% = ${grade}`);
}

/* ════════════════════════════════════
   PROP FIRM TOOLS + POSITION SCALING
   ════════════════════════════════════ */

/* ── 1. PROP FIRM CHALLENGE CALCULATOR ── */
function challengeCalc() {
  const balance  = parseFloat(document.getElementById('ch-balance')?.value);
  const target   = parseFloat(document.getElementById('ch-target')?.value) || 8;
  const maxDD    = parseFloat(document.getElementById('ch-maxdd')?.value) || 10;
  const dailyDD  = parseFloat(document.getElementById('ch-dailydd')?.value) || 5;
  const days     = parseInt(document.getElementById('ch-days')?.value) || 30;
  const fee      = parseFloat(document.getElementById('ch-fee')?.value) || 0;
  const split    = parseFloat(document.getElementById('ch-split')?.value) || 80;
  const out      = document.getElementById('ch-output');
  if (!out) return;
  if (isNaN(balance)||balance<=0) { out.textContent='Enter account balance.'; out.className='output-box error'; return; }

  const targetAmt  = balance * target / 100;
  const maxDDAmt   = balance * maxDD / 100;
  const dailyDDAmt = balance * dailyDD / 100;
  const minPerDay  = targetAmt / days;

  // ROI after passing (assuming 1 funded payout cycle)
  const fundedBalance = balance;
  const firstPayout   = fundedBalance * target / 100 * split / 100;
  const roiOnFee      = fee > 0 ? ((firstPayout - fee) / fee * 100) : 0;

  out.className = 'output-box success';
  out.textContent =
    `Account: $${balance.toLocaleString()}  |  Fee: ${fee>0?'$'+fee:'N/A'}\n\n`+
    `── Challenge Rules ───────────────────\n`+
    `Profit Target:     ${target}%  =  $${formatCur(targetAmt)}\n`+
    `Max Drawdown:      ${maxDD}%   =  $${formatCur(maxDDAmt)}\n`+
    `Daily Drawdown:    ${dailyDD}% =  $${formatCur(dailyDDAmt)}\n`+
    `Time Limit:        ${days} trading days\n\n`+
    `── What you need ─────────────────────\n`+
    `Min profit/day:    $${formatCur(minPerDay)} (${(target/days).toFixed(2)}%/day)\n`+
    `Trades to target:  Depends on your R:R and win rate\n`+
    `Max loss allowed:  $${formatCur(maxDDAmt)} total  /  $${formatCur(dailyDDAmt)} per day\n\n`+
    `── Funded payout projection ──────────\n`+
    `First payout (${split}% split): $${formatCur(firstPayout)}\n`+
    (fee>0?`ROI on challenge fee: ${roiOnFee.toFixed(1)}%\n`:'')+
    `Annual (12 payouts): $${formatCur(firstPayout*12)}\n\n`+
    `── Risk per trade to stay safe ───────\n`+
    [0.5,1,1.5,2].map(r=>{
      const riskAmt = balance*r/100;
      const tradesBefore = Math.floor(dailyDDAmt/riskAmt);
      return `  ${r}% risk ($${formatCur(riskAmt)}/trade) → max ${tradesBefore} losses/day`;
    }).join('\n');
  setStatus('ch-status','ok',`✓ Target: $${formatCur(targetAmt)} | Daily limit: $${formatCur(dailyDDAmt)}`);
}

/* ── 2. DAILY DRAWDOWN CALCULATOR ── */
function dailyDrawdownCalc() {
  const startBal  = parseFloat(document.getElementById('dd-start')?.value);
  const currentBal= parseFloat(document.getElementById('dd-current')?.value);
  const ddPct     = parseFloat(document.getElementById('dd-pct')?.value) || 5;
  const ddType    = document.getElementById('dd-type')?.value || 'balance';
  const out       = document.getElementById('dd-output');
  if (!out) return;
  if (isNaN(startBal)||isNaN(currentBal)||startBal<=0) {
    out.textContent='Enter starting and current balance.'; out.className='output-box error'; return;
  }

  // Daily drawdown limit calculated from start-of-day balance (most common) or initial balance
  const refBalance = ddType==='balance' ? currentBal : startBal;
  const ddLimit    = refBalance * ddPct / 100;
  const ddFloor    = refBalance - ddLimit;
  const currentDD  = startBal - currentBal;
  const currentDDPct = (currentDD/startBal*100);
  const remaining  = ddLimit - currentDD;
  const remainingPct = (remaining/startBal*100);
  const safe       = remaining > 0;

  // Lots they can still lose (approximate for XAUUSD)
  const pipsCanLose = Math.floor(remaining/10); // rough

  out.className = safe ? 'output-box success' : 'output-box error';
  out.textContent =
    `── Your daily status ─────────────────\n`+
    `Start of day balance: $${formatCur(startBal)}\n`+
    `Current balance:      $${formatCur(currentBal)}\n`+
    `P&L today:            ${currentDD>0?'-':'+'} $${formatCur(Math.abs(currentDD))} (${currentDDPct.toFixed(2)}%)\n\n`+
    `── Drawdown limit (${ddPct}% ${ddType==='balance'?'trailing':'fixed'}) ───────\n`+
    `DD limit amount:      $${formatCur(ddLimit)}\n`+
    `Account floor:        $${formatCur(ddFloor)}\n`+
    `Already used:         $${formatCur(Math.max(0,currentDD))} (${Math.max(0,currentDDPct).toFixed(2)}%)\n`+
    `Remaining today:      $${formatCur(Math.max(0,remaining))} (${Math.max(0,remainingPct).toFixed(2)}%)\n\n`+
    `── Status ────────────────────────────\n`+
    (safe
      ? `✅ SAFE — You have $${formatCur(remaining)} left today\n\n`+
        `── Risk recommendations ──────────────\n`+
        [0.5,1,1.5,2].map(r=>{
          const rAmt=startBal*r/100;
          const trades=Math.floor(remaining/rAmt);
          return `  ${r}% risk ($${formatCur(rAmt)}): ${trades} more losing trades before breach`;
        }).join('\n')
      : `🚨 BREACH — Daily drawdown exceeded!\nStop trading for today.`
    );
  setStatus('dd-status', safe?'ok':'err',
    safe ? `✅ $${formatCur(remaining)} remaining` : '🚨 Limit breached');
}

/* ── 3. CONSISTENCY CALCULATOR ── */
function consistencyCalc() {
  const total    = parseFloat(document.getElementById('con2-total')?.value);
  const bestDay  = parseFloat(document.getElementById('con2-best')?.value);
  const threshold= parseFloat(document.getElementById('con2-threshold')?.value) || 30;
  const out      = document.getElementById('con2-output');
  if (!out) return;
  if (isNaN(total)||isNaN(bestDay)||total<=0||bestDay<=0) {
    out.textContent='Enter total profit and best day profit.'; out.className='output-box error'; return;
  }
  if (bestDay > total) { out.textContent='Best day cannot exceed total profit.'; out.className='output-box error'; return; }

  const score    = (bestDay/total*100);
  const passes   = score <= threshold;
  const maxAllowed = total * threshold / 100;
  const excess   = bestDay - maxAllowed;

  // What they need to earn on other days to bring score under threshold
  const neededTotal = bestDay / (threshold/100);
  const neededMore  = neededTotal - total;

  out.className = passes ? 'output-box success' : 'output-box error';
  out.textContent =
    `Total Profit:         $${formatCur(total)}\n`+
    `Best Single Day:      $${formatCur(bestDay)}\n`+
    `Consistency Rule:     ≤${threshold}% of total from one day\n\n`+
    `── Your Score ────────────────────────\n`+
    `Consistency Score:    ${score.toFixed(1)}%\n`+
    `Max allowed (${threshold}%):   $${formatCur(maxAllowed)}\n`+
    `Status: ${passes ? '✅ CONSISTENT — You qualify for payout' : '❌ INCONSISTENT — Best day too high'}\n\n`+
    (!passes ? `── How to fix ────────────────────────\n`+
      `Excess on best day:  $${formatCur(excess)}\n`+
      `Earn $${formatCur(neededMore)} more on other days to qualify\n`+
      `Or: Reduce best day target to $${formatCur(maxAllowed)}\n\n` : '')+
    `── Simulate future days ──────────────\n`+
    [50,100,200,300,500].map(extra=>{
      const newTotal=total+extra;
      const newScore=(bestDay/newTotal*100);
      return `  +$${extra}/day more → score becomes ${newScore.toFixed(1)}% ${newScore<=threshold?'✅':'❌'}`;
    }).join('\n');
  setStatus('con2-status', passes?'ok':'err',
    `Score: ${score.toFixed(1)}% — ${passes?'CONSISTENT ✅':'INCONSISTENT ❌'}`);
}

/* ── 4. PROFIT TARGET TRACKER ── */
function profitTargetTracker() {
  const initial   = parseFloat(document.getElementById('pt-initial')?.value);
  const current   = parseFloat(document.getElementById('pt-current')?.value);
  const target    = parseFloat(document.getElementById('pt-target')?.value) || 8;
  const daysTotal = parseInt(document.getElementById('pt-days')?.value) || 30;
  const daysUsed  = parseInt(document.getElementById('pt-daysused')?.value) || 0;
  const out       = document.getElementById('pt-output');
  if (!out) return;
  if (isNaN(initial)||isNaN(current)||initial<=0) {
    out.textContent='Enter initial and current balance.'; out.className='output-box error'; return;
  }

  const targetAmt    = initial * target / 100;
  const targetBal    = initial + targetAmt;
  const currentProfit= current - initial;
  const remaining    = targetAmt - currentProfit;
  const progressPct  = Math.max(0,Math.min(100,(currentProfit/targetAmt)*100));
  const daysLeft     = daysTotal - daysUsed;
  const neededPerDay = daysLeft > 0 ? remaining/daysLeft : remaining;
  const onTrack      = daysLeft > 0 && (currentProfit/(daysUsed||1)) >= (targetAmt/daysTotal);

  const bar = '█'.repeat(Math.round(progressPct/5)) + '░'.repeat(20-Math.round(progressPct/5));

  out.className = progressPct >= 100 ? 'output-box success' : 'output-box';
  out.textContent =
    `Account:    $${formatCur(initial)}  →  Target: $${formatCur(targetBal)}\n\n`+
    `── Progress ──────────────────────────\n`+
    `${bar}  ${progressPct.toFixed(1)}%\n\n`+
    `Profit so far:  $${formatCur(currentProfit)} of $${formatCur(targetAmt)}\n`+
    `Still needed:   $${formatCur(Math.max(0,remaining))}\n\n`+
    `── Time ──────────────────────────────\n`+
    `Days used:  ${daysUsed} / ${daysTotal}\n`+
    `Days left:  ${daysLeft}\n`+
    `Need/day:   $${formatCur(Math.max(0,neededPerDay))} (${(Math.max(0,neededPerDay)/initial*100).toFixed(2)}%/day)\n`+
    `Pace:       ${onTrack ? '✅ On track' : currentProfit<=0 ? '⚠ No profit yet' : '⚠ Behind pace'}\n\n`+
    (progressPct>=100
      ? `🎉 TARGET REACHED! You can request evaluation phase 2 or payout.\n`
      : `── Daily profit needed ───────────────\n`+
        [3,5,7,10,14].filter(d=>d<=daysLeft).map(d=>{
          const ppd=remaining/d;
          return `  In ${d} days: $${formatCur(ppd)}/day (${(ppd/initial*100).toFixed(2)}%)`;
        }).join('\n'));
  setStatus('pt-status',
    progressPct>=100?'ok':onTrack?'ok':'err',
    `${progressPct.toFixed(1)}% complete — ${progressPct>=100?'TARGET HIT! 🎉':'$'+formatCur(Math.max(0,remaining))+' to go'}`);
}

/* ── 5. CHALLENGE PASS PROBABILITY ── */
function challengePassProb() {
  const winRate  = parseFloat(document.getElementById('cpp-winrate')?.value);
  const rr       = parseFloat(document.getElementById('cpp-rr')?.value);
  const trades   = parseInt(document.getElementById('cpp-trades')?.value) || 30;
  const target   = parseFloat(document.getElementById('cpp-target')?.value) || 8;
  const maxDD    = parseFloat(document.getElementById('cpp-maxdd')?.value) || 10;
  const riskPct  = parseFloat(document.getElementById('cpp-risk')?.value) || 1;
  const out      = document.getElementById('cpp-output');
  if (!out) return;
  if (isNaN(winRate)||isNaN(rr)||winRate<=0||winRate>=100||rr<=0) {
    out.textContent='Enter win rate (%), risk:reward ratio, and number of trades.'; out.className='output-box error'; return;
  }

  const wr = winRate/100;
  const lr = 1 - wr;
  // Expectancy per trade (in R)
  const expectancy = wr*rr - lr;
  // Expected profit in % after N trades
  const expectedProfit = expectancy * riskPct * trades;
  // Simple pass probability using normal approximation
  const stdDev = Math.sqrt(trades) * riskPct * Math.sqrt(wr*rr*rr + lr);
  const zScore = (target - expectedProfit) / stdDev;
  // Probability of reaching target before hitting max DD
  // Simplified: P(profit >= target) assuming normal distribution
  const passProbRaw = 1 - 0.5*(1+Math.sign(zScore)*Math.min(0.9999,
    1-Math.exp(-0.147*(zScore*zScore)+0.14*(Math.abs(zScore)))
  ));
  const passProb = Math.max(1,Math.min(99, passProbRaw*100));

  // Monte Carlo (1000 simple simulations)
  let passes = 0;
  const SIMS = 2000;
  for (let s=0; s<SIMS; s++) {
    let bal = 100, maxBal = 100, failed = false;
    for (let t=0; t<trades; t++) {
      if (Math.random() < wr) bal += riskPct*rr;
      else bal -= riskPct;
      if (bal > maxBal) maxBal = bal;
      if ((maxBal-bal) >= maxDD || bal < (100-maxDD)) { failed=true; break; }
    }
    if (!failed && (bal-100) >= target) passes++;
  }
  const mcProb = (passes/SIMS*100).toFixed(1);

  out.className = parseFloat(mcProb)>=50 ? 'output-box success' : 'output-box error';
  out.textContent =
    `Win Rate:   ${winRate}%\n`+
    `Risk:Reward: 1:${rr}\n`+
    `Risk/Trade:  ${riskPct}%\n`+
    `Trades:     ${trades}\n`+
    `Target:     ${target}%\n`+
    `Max DD:     ${maxDD}%\n\n`+
    `── Pass Probability ──────────────────\n`+
    `Monte Carlo (${SIMS} sims): ${mcProb}%\n\n`+
    `── Your edge ─────────────────────────\n`+
    `Expectancy:     ${expectancy.toFixed(3)}R per trade\n`+
    `Expected profit: ${expectedProfit.toFixed(2)}% after ${trades} trades\n`+
    `${expectancy>0?'✅ Positive edge':'❌ Negative edge — fix strategy first'}\n\n`+
    `── Improve your odds ─────────────────\n`+
    [[winRate+5,rr],[winRate,rr+0.2],[winRate+5,rr+0.2]].map(([wr2,rr2])=>{
      let p2=0;
      for(let s=0;s<1000;s++){
        let b=100,m=100,f=false;
        for(let t=0;t<trades;t++){
          if(Math.random()<wr2/100)b+=riskPct*rr2;
          else b-=riskPct;
          if(b>m)m=b;
          if((m-b)>=maxDD||b<(100-maxDD)){f=true;break;}
        }
        if(!f&&(b-100)>=target)p2++;
      }
      return `  WR${wr2.toFixed(0)}% / RR${rr2.toFixed(1)} → ${(p2/10).toFixed(0)}% pass rate`;
    }).join('\n');
  setStatus('cpp-status',
    parseFloat(mcProb)>=50?'ok':'err',
    `✓ Pass probability: ${mcProb}%`);
}

/* ── 6. FUNDED ACCOUNT ROI CALCULATOR ── */
function fundedROICalc() {
  const fee       = parseFloat(document.getElementById('fr-fee')?.value);
  const accountSz = parseFloat(document.getElementById('fr-account')?.value);
  const target    = parseFloat(document.getElementById('fr-target')?.value) || 8;
  const split     = parseFloat(document.getElementById('fr-split')?.value) || 80;
  const cycles    = parseInt(document.getElementById('fr-cycles')?.value) || 3;
  const scale     = document.getElementById('fr-scale')?.value || 'no';
  const out       = document.getElementById('fr-output');
  if (!out) return;
  if (isNaN(fee)||isNaN(accountSz)||fee<=0||accountSz<=0) {
    out.textContent='Enter challenge fee and account size.'; out.className='output-box error'; return;
  }

  const profitPerCycle = accountSz * target/100 * split/100;
  const totalEarned    = profitPerCycle * cycles;
  const netProfit      = totalEarned - fee;
  const roi            = (netProfit/fee*100);
  const breakEvenCycles= Math.ceil(fee/profitPerCycle);

  out.className = netProfit>=0 ? 'output-box success' : 'output-box error';
  out.textContent =
    `Challenge Fee:      $${formatCur(fee)}\n`+
    `Account Size:       $${formatCur(accountSz)}\n`+
    `Profit Target:      ${target}%\n`+
    `Profit Split:       ${split}%\n\n`+
    `── Per payout cycle ──────────────────\n`+
    `Gross profit:       $${formatCur(accountSz*target/100)}\n`+
    `Your share (${split}%):  $${formatCur(profitPerCycle)}\n`+
    `Break even after:   ${breakEvenCycles} payout${breakEvenCycles!==1?'s':''}\n\n`+
    `── ${cycles} payout cycles ─────────────────\n`+
    `Total earned:       $${formatCur(totalEarned)}\n`+
    `Net (after fee):    $${formatCur(netProfit)}\n`+
    `ROI on fee:         ${roi.toFixed(1)}%\n\n`+
    `── Payout timeline ───────────────────\n`+
    Array.from({length:Math.min(cycles,8)},(_,i)=>{
      const earned=(i+1)*profitPerCycle;
      const net=earned-fee;
      return `  Payout ${i+1}: $${formatCur(earned)} earned | Net: ${net>=0?'+':''}$${formatCur(net)}`;
    }).join('\n')+
    `\n\n── Compare account sizes ─────────────\n`+
    [5000,10000,25000,50000,100000,200000].map(sz=>{
      const p=sz*target/100*split/100;
      const r=(p*cycles-fee)/fee*100;
      return `  $${sz.toLocaleString().padEnd(9)} → $${formatCur(p)}/payout | ${cycles}x ROI: ${r.toFixed(0)}%`;
    }).join('\n');
  setStatus('fr-status',netProfit>=0?'ok':'err',
    `✓ ROI: ${roi.toFixed(1)}% | Net: $${formatCur(netProfit)}`);
}

/* ── 7. POSITION SCALING CALCULATOR ── */
function positionScalingCalc() {
  const balance  = parseFloat(document.getElementById('ps2-balance')?.value);
  const riskPct  = parseFloat(document.getElementById('ps2-risk')?.value) || 1;
  const sl       = parseFloat(document.getElementById('ps2-sl')?.value);
  const symbol   = document.getElementById('ps2-symbol')?.value || 'XAUUSD';
  const method   = document.getElementById('ps2-method')?.value || 'fixed';
  const winStreak= parseInt(document.getElementById('ps2-streak')?.value) || 0;
  const out      = document.getElementById('ps2-output');
  if (!out) return;
  if (isNaN(balance)||isNaN(sl)||balance<=0||sl<=0) {
    out.textContent='Enter balance and stop loss.'; out.className='output-box error'; return;
  }

  const riskAmt = balance * riskPct / 100;

  // Pip/point values per lot
  const pipValues = {
    'XAUUSD':10, 'EURUSD':10, 'GBPUSD':10, 'USDJPY':9.1,
    'USDCHF':10, 'AUDUSD':10, 'USDCAD':10, 'BTCUSD':1,
    'NAS100':1,  'SPX500':10, 'US30':1,
  };
  const pipVal = pipValues[symbol] || 10;
  const baseLots = riskAmt / (sl * pipVal);

  // Scaling methods
  let scaledLots = baseLots;
  let methodDesc = '';

  if (method === 'fixed') {
    scaledLots = baseLots;
    methodDesc = 'Fixed fractional — same risk % every trade';
  } else if (method === 'kelly') {
    // Simplified Kelly (need win rate and RR)
    scaledLots = baseLots * 0.5; // half-Kelly is safer
    methodDesc = 'Half-Kelly — conservative position scaling';
  } else if (method === 'martingale') {
    scaledLots = baseLots * Math.pow(2, winStreak);
    methodDesc = `Martingale (${winStreak} wins) — doubles each win ⚠ HIGH RISK`;
  } else if (method === 'antimartingale') {
    scaledLots = winStreak > 0 ? baseLots * (1 + winStreak*0.5) : baseLots;
    methodDesc = `Anti-martingale (${winStreak} wins) — scale up on winning streaks`;
  } else if (method === 'linear') {
    scaledLots = baseLots * (1 + winStreak * 0.25);
    methodDesc = `Linear scaling (+25% per win, ${winStreak} wins)`;
  }

  scaledLots = Math.max(0.01, Math.round(scaledLots * 100) / 100);
  const actualRisk = scaledLots * sl * pipVal;
  const actualRiskPct = actualRisk/balance*100;

  out.className = 'output-box success';
  out.textContent =
    `Balance: $${formatCur(balance)}  |  Symbol: ${symbol}\n`+
    `Risk: ${riskPct}% ($${formatCur(riskAmt)})  |  SL: ${sl} pips\n`+
    `Method: ${methodDesc}\n\n`+
    `── Position Size ─────────────────────\n`+
    `Lot size:       ${scaledLots} lots\n`+
    `Actual risk:    $${formatCur(actualRisk)} (${actualRiskPct.toFixed(2)}%)\n`+
    `Pip value:      $${pipVal}/pip per lot\n\n`+
    `── Scaling comparison ────────────────\n`+
    [0.5,1,1.5,2,3].map(r=>{
      const lots=Math.round(balance*r/100/(sl*pipVal)*100)/100;
      const risk=lots*sl*pipVal;
      return `  ${r}% risk → ${Math.max(0.01,lots)} lots ($${formatCur(risk)})`;
    }).join('\n')+
    `\n\n── Win/Loss scenarios ────────────────\n`+
    [1,2,3,-1,-2].map(mult=>{
      const tp = sl * 2; // assume 1:2 RR
      const pnl = mult > 0 ? scaledLots*tp*pipVal*mult : scaledLots*sl*pipVal*mult;
      return `  ${mult>0?mult+' win'+(mult>1?'s':''):Math.abs(mult)+' loss'+(Math.abs(mult)>1?'es':'')}: ${pnl>=0?'+':''}$${formatCur(pnl)}`;
    }).join('\n');
  setStatus('ps2-status','ok',`✓ ${scaledLots} lots | $${formatCur(actualRisk)} at risk`);
}

/* ════════════════════════════════════
   4 NEW PRO TRADER TOOLS
   ════════════════════════════════════ */

/* ── KELLY CRITERION CALCULATOR ── */
function kellyCalc() {
  const wr    = parseFloat(document.getElementById('kelly-wr')?.value);
  const rr    = parseFloat(document.getElementById('kelly-rr')?.value);
  const bal   = parseFloat(document.getElementById('kelly-bal')?.value) || 0;
  const out   = document.getElementById('kelly-output');
  if (!out) return;
  if (isNaN(wr)||isNaN(rr)||wr<=0||wr>=100||rr<=0) {
    out.textContent='Enter win rate (%) and risk:reward ratio.';
    out.className='output-box error'; return;
  }
  const w = wr/100, l = 1-w;
  const kelly    = w - (l/rr);           // Full Kelly %
  const halfKelly= kelly/2;
  const qtrKelly = kelly/4;
  const riskAmt  = bal>0 ? bal*halfKelly : null;

  if (kelly <= 0) {
    out.className='output-box error';
    out.textContent=
      `Kelly = ${(kelly*100).toFixed(2)}% — NEGATIVE EDGE\n\n`+
      `Your strategy has no mathematical edge.\n`+
      `Expected loss per trade: ${(kelly*100).toFixed(2)}%\n\n`+
      `Fix: Increase win rate OR increase R:R ratio\n`+
      `Break-even win rate at ${rr}:1 RR: ${(1/(1+rr)*100).toFixed(1)}%`;
    setStatus('kelly-status','err','❌ Negative edge — do not trade');
    return;
  }

  out.className='output-box success';
  out.textContent=
    `Win Rate:      ${wr}%\n`+
    `Risk:Reward:   1:${rr}\n`+
    `Expectancy:    ${((w*rr-l)*100).toFixed(3)}R per $1 risked\n\n`+
    `── Kelly Criterion ───────────────────\n`+
    `Full Kelly:    ${(kelly*100).toFixed(2)}% per trade\n`+
    `Half Kelly:    ${(halfKelly*100).toFixed(2)}% ← recommended\n`+
    `Quarter Kelly: ${(qtrKelly*100).toFixed(2)}% ← conservative\n\n`+
    (bal>0
      ? `── Dollar amounts ($${bal.toLocaleString()} balance) ──\n`+
        `Full Kelly:    $${formatCur(bal*kelly)}\n`+
        `Half Kelly:    $${formatCur(bal*halfKelly)} ← recommended\n`+
        `Quarter Kelly: $${formatCur(bal*qtrKelly)}\n\n`
      : '')+
    `── Why Half-Kelly? ───────────────────\n`+
    `Full Kelly maximises growth but creates huge\n`+
    `drawdowns. Half-Kelly gives 75% of the growth\n`+
    `with much lower variance — preferred by pros.\n\n`+
    `── Sensitivity ───────────────────────\n`+
    [45,50,55,60,65].map(wr2=>{
      const w2=wr2/100, l2=1-w2;
      const k=w2-(l2/rr);
      return `  WR ${wr2}%: Kelly=${k>0?(k*100).toFixed(1)+'%':'negative ❌'}`;
    }).join('\n');
  setStatus('kelly-status','ok',`✓ Half-Kelly: ${(halfKelly*100).toFixed(2)}%`);
}

/* ── WIN RATE & EXPECTANCY CALCULATOR ── */
function winRateCalc() {
  const wins   = parseFloat(document.getElementById('we-wins')?.value);
  const losses = parseFloat(document.getElementById('we-losses')?.value);
  const avgWin = parseFloat(document.getElementById('we-avgwin')?.value);
  const avgLoss= parseFloat(document.getElementById('we-avgloss')?.value);
  const trades = parseInt(document.getElementById('we-trades')?.value) || 100;
  const out    = document.getElementById('we-output');
  if (!out) return;
  if (isNaN(wins)||isNaN(losses)||isNaN(avgWin)||isNaN(avgLoss)) {
    out.textContent='Enter wins, losses, avg win and avg loss.';
    out.className='output-box error'; return;
  }
  const total   = wins+losses;
  const wr      = wins/total;
  const rr      = avgWin/avgLoss;
  const expect  = wr*avgWin - (1-wr)*avgLoss;
  const expectR = wr*rr - (1-wr);
  const profFactor = (wins*avgWin)/(losses*avgLoss);
  const projProfit = expect * trades;
  const breakEvenWR = 1/(1+rr);

  out.className = expect>=0 ? 'output-box success' : 'output-box error';
  out.textContent=
    `Wins: ${wins}  Losses: ${losses}  Total: ${total}\n`+
    `Avg Win: $${formatCur(avgWin)}  Avg Loss: $${formatCur(avgLoss)}\n\n`+
    `── Core Statistics ───────────────────\n`+
    `Win Rate:          ${(wr*100).toFixed(1)}%\n`+
    `Risk:Reward:       1:${rr.toFixed(2)}\n`+
    `Profit Factor:     ${profFactor.toFixed(2)}x\n`+
    `Expectancy/trade:  $${formatCur(expect)} (${expectR.toFixed(3)}R)\n`+
    `Break-even WR:     ${(breakEvenWR*100).toFixed(1)}% (at ${rr.toFixed(1)} RR)\n\n`+
    `── Projections ───────────────────────\n`+
    `Expected profit per ${trades} trades: $${formatCur(projProfit)}\n`+
    `${expect>=0?'✅ Positive edge':'❌ Negative edge — strategy needs improvement'}\n\n`+
    `── Profit factor guide ───────────────\n`+
    `  < 1.0  Losing strategy\n`+
    `  1.0-1.5 Marginal — needs improvement\n`+
    `  1.5-2.0 Good\n`+
    `  2.0-3.0 Strong\n`+
    `  > 3.0  Excellent (rare in live trading)\n\n`+
    `── Improve your edge ─────────────────\n`+
    [1,1.5,2,2.5,3].map(rr2=>{
      const bwr=1/(1+rr2);
      return `  RR 1:${rr2} → need ${(bwr*100).toFixed(1)}% WR to break even`;
    }).join('\n');
  setStatus('we-status',expect>=0?'ok':'err',
    `✓ WR: ${(wr*100).toFixed(1)}% | Expectancy: $${formatCur(expect)}/trade | PF: ${profFactor.toFixed(2)}`);
}

/* ── FOREX SWAP/ROLLOVER CALCULATOR ── */
// MODE 1: User enters their own broker swap rates (accurate)
// MODE 2: Use reference rates as estimates only
function forexSwapCalc() {
  const out = document.getElementById('swap-output');
  if (!out) return;

  const mode = document.getElementById('swap-mode')?.value || 'manual';

  if (mode === 'manual') {
    // ── MANUAL MODE: user enters broker swap rates ────────────────
    const longRate  = parseFloat(document.getElementById('swap-long-rate')?.value);
    const shortRate = parseFloat(document.getElementById('swap-short-rate')?.value);
    const pipVal    = parseFloat(document.getElementById('swap-pip-val')?.value) || 10;
    const lots      = parseFloat(document.getElementById('swap-lots')?.value);
    const days      = parseInt(document.getElementById('swap-days')?.value) || 1;
    const dir       = document.getElementById('swap-dir')?.value || 'long';
    const pair      = document.getElementById('swap-pair')?.value || 'EURUSD';

    if (isNaN(lots)||lots<=0) { out.textContent='Enter lot size.'; out.className='output-box error'; return; }
    if (isNaN(longRate)||isNaN(shortRate)) { out.textContent='Enter your broker swap rates from MT4/MT5.'; out.className='output-box error'; return; }

    const swapPips   = dir==='long' ? longRate : shortRate;
    const dailyCost  = swapPips * pipVal * lots;
    const wednCost   = dailyCost * 3;
    const weeklyCost = dailyCost * 5;
    const monthlyCost= dailyCost * 22;
    const annualCost = dailyCost * 252;
    const totalCost  = dailyCost * days;
    const isEarned   = dailyCost > 0;

    out.className = isEarned ? 'output-box success' : 'output-box error';
    out.textContent =
      `Pair: ${pair}  |  ${lots} lots  |  ${dir.toUpperCase()}\n`+
      `Pip value: $${pipVal}/pip per lot\n\n`+
      `── Your broker swap rates ────────────\n`+
      `Long swap:      ${longRate} pips = $${formatCur(Math.abs(longRate*pipVal*lots))}/night\n`+
      `Short swap:     ${shortRate} pips = $${formatCur(Math.abs(shortRate*pipVal*lots))}/night\n\n`+
      `── Active direction: ${dir.toUpperCase()} ─────────────────\n`+
      `Daily swap:     ${swapPips} pips = $${formatCur(Math.abs(dailyCost))} ${isEarned?'(EARNED)':'(COST)'}/night\n`+
      `Wednesday:      $${formatCur(Math.abs(wednCost))} (3× swap night)\n\n`+
      `── Your position (${days} day${days!==1?'s':''}) ─────────────────\n`+
      `Total swap:     $${formatCur(Math.abs(totalCost))} ${totalCost>0?'EARNED':'COST'}\n\n`+
      `── Period projections ────────────────\n`+
      `Per week:       $${formatCur(Math.abs(weeklyCost))} ${weeklyCost>0?'earned':'cost'}\n`+
      `Per month:      $${formatCur(Math.abs(monthlyCost))} ${monthlyCost>0?'earned':'cost'}\n`+
      `Per year:       $${formatCur(Math.abs(annualCost))} ${annualCost>0?'earned':'cost'}\n\n`+
      `── 📋 How to get these numbers ───────\n`+
      `MT4/MT5: Right-click pair in Market Watch\n`+
      `→ Specification → Swap Long / Swap Short\n`+
      `✅ These results use YOUR broker's exact rates.`;
    setStatus('swap-status', isEarned?'ok':'err',
      `$${formatCur(Math.abs(dailyCost))}/night ${isEarned?'earned':'cost'}`);

  } else {
    // ── ESTIMATE MODE: reference rates (approximate only) ─────────
    const pair   = document.getElementById('swap-pair')?.value || 'EURUSD';
    const lots   = parseFloat(document.getElementById('swap-lots')?.value);
    const days   = parseInt(document.getElementById('swap-days')?.value) || 1;
    const dir    = document.getElementById('swap-dir')?.value || 'long';

    if (isNaN(lots)||lots<=0) { out.textContent='Enter lot size.'; out.className='output-box error'; return; }

    // Reference swap rates — approximate industry averages
    // These WILL differ from your broker. Use manual mode for accuracy.
    const SWAPS = {
      'EURUSD': [-6.5,  1.2,  10],  'GBPUSD': [-4.8,  0.8,  10],
      'USDJPY': [ 1.8, -7.2,  9.1], 'USDCHF': [ 1.5, -6.8,  10],
      'AUDUSD': [-3.2, -0.5,  10],  'USDCAD': [ 0.8, -5.5,  10],
      'NZDUSD': [-2.8, -0.2,  10],  'EURGBP': [-2.5, -0.8,  10],
      'EURJPY': [-4.5, -2.1,  9.1], 'GBPJPY': [-3.8, -3.2,  9.1],
      'XAUUSD': [-4.2, -1.8,  10],  'XAGUSD': [-2.5, -0.8,  50],
      'BTCUSD': [-15,  -12,    1],  'US30':   [-3.5, -2.5,   1],
      'NAS100': [-4.2, -3.1,   1],  'SPX500': [-3.8, -2.8,  10],
    };

    const data = SWAPS[pair] || [-3, -1, 10];
    const [longSwap, shortSwap, pipVal] = data;
    const swapPips   = dir==='long' ? longSwap : shortSwap;
    const dailyCost  = swapPips * pipVal * lots;
    const wednCost   = dailyCost * 3;
    const weeklyCost = dailyCost * 5;
    const monthlyCost= dailyCost * 22;
    const annualCost = dailyCost * 252;
    const totalCost  = dailyCost * days;
    const isEarned   = dailyCost > 0;

    out.className = isEarned ? 'output-box success' : 'output-box error';
    out.textContent =
      `Pair: ${pair}  |  ${lots} lots  |  ${dir.toUpperCase()}\n\n`+
      `── Reference swap rates (ESTIMATES) ─\n`+
      `Long swap:      ${longSwap} pips = $${formatCur(Math.abs(longSwap*pipVal*lots))}/night\n`+
      `Short swap:     ${shortSwap} pips = $${formatCur(Math.abs(shortSwap*pipVal*lots))}/night\n\n`+
      `── Active direction: ${dir.toUpperCase()} ─────────────────\n`+
      `Daily swap:     ${swapPips} pips = $${formatCur(Math.abs(dailyCost))} ${isEarned?'(EARNED)':'(COST)'}/night\n`+
      `Wednesday:      $${formatCur(Math.abs(wednCost))} (3× swap night)\n\n`+
      `── Your position (${days} day${days!==1?'s':''}) ─────────────────\n`+
      `Total swap:     $${formatCur(Math.abs(totalCost))} ${totalCost>0?'EARNED':'COST'}\n\n`+
      `── Period projections ────────────────\n`+
      `Per week:       $${formatCur(Math.abs(weeklyCost))} ${weeklyCost>0?'earned':'cost'}\n`+
      `Per month:      $${formatCur(Math.abs(monthlyCost))} ${monthlyCost>0?'earned':'cost'}\n`+
      `Per year:       $${formatCur(Math.abs(annualCost))} ${annualCost>0?'earned':'cost'}\n\n`+
      `── ⚠️ ESTIMATES ONLY ─────────────────\n`+
      `Rates differ by broker, account type,\n`+
      `and change daily with interest rates.\n`+
      `For exact costs: use Manual mode above\n`+
      `(enter rates from MT4/MT5 Specification).`;
    setStatus('swap-status', isEarned?'ok':'err',
      `~$${formatCur(Math.abs(dailyCost))}/night (estimate)`);
  }
}

/* ── CURRENCY CORRELATION CALCULATOR ── */
function correlationCalc() {
  const pair1 = document.getElementById('corr-pair1')?.value || 'EURUSD';
  const pair2 = document.getElementById('corr-pair2')?.value || 'GBPUSD';
  const out   = document.getElementById('corr-output');
  if (!out) return;

  // Historical correlation matrix (approximate 3-month averages, 2025)
  // Values: -1 to +1
  const CORR = {
    'EURUSD': { 'EURUSD':1.00,'GBPUSD':0.89,'USDJPY':-0.82,'USDCHF':-0.93,'AUDUSD':0.73,'USDCAD':-0.71,'NZDUSD':0.68,'EURGBP':0.31,'EURJPY':0.52,'GBPJPY':0.48,'XAUUSD':0.65,'US30':-0.12,'NAS100':-0.08 },
    'GBPUSD': { 'EURUSD':0.89,'GBPUSD':1.00,'USDJPY':-0.76,'USDCHF':-0.85,'AUDUSD':0.71,'USDCAD':-0.68,'NZDUSD':0.65,'EURGBP':-0.22,'EURJPY':0.48,'GBPJPY':0.55,'XAUUSD':0.61,'US30':-0.10,'NAS100':-0.06 },
    'USDJPY': { 'EURUSD':-0.82,'GBPUSD':-0.76,'USDJPY':1.00,'USDCHF':0.78,'AUDUSD':-0.65,'USDCAD':0.62,'NZDUSD':-0.60,'EURGBP':-0.18,'EURJPY':0.42,'GBPJPY':0.52,'XAUUSD':-0.55,'US30':0.35,'NAS100':0.28 },
    'USDCHF': { 'EURUSD':-0.93,'GBPUSD':-0.85,'USDJPY':0.78,'USDCHF':1.00,'AUDUSD':-0.70,'USDCAD':0.68,'NZDUSD':-0.66,'EURGBP':-0.28,'EURJPY':-0.48,'GBPJPY':-0.44,'XAUUSD':-0.62,'US30':0.15,'NAS100':0.10 },
    'AUDUSD': { 'EURUSD':0.73,'GBPUSD':0.71,'USDJPY':-0.65,'USDCHF':-0.70,'AUDUSD':1.00,'USDCAD':-0.55,'NZDUSD':0.92,'EURGBP':0.18,'EURJPY':0.32,'GBPJPY':0.38,'XAUUSD':0.75,'US30':0.42,'NAS100':0.45 },
    'USDCAD': { 'EURUSD':-0.71,'GBPUSD':-0.68,'USDJPY':0.62,'USDCHF':0.68,'AUDUSD':-0.55,'USDCAD':1.00,'NZDUSD':-0.52,'EURGBP':-0.15,'EURJPY':-0.38,'GBPJPY':-0.35,'XAUUSD':-0.48,'US30':0.22,'NAS100':0.18 },
    'NZDUSD': { 'EURUSD':0.68,'GBPUSD':0.65,'USDJPY':-0.60,'USDCHF':-0.66,'AUDUSD':0.92,'USDCAD':-0.52,'NZDUSD':1.00,'EURGBP':0.15,'EURJPY':0.28,'GBPJPY':0.35,'XAUUSD':0.70,'US30':0.38,'NAS100':0.40 },
    'EURGBP': { 'EURUSD':0.31,'GBPUSD':-0.22,'USDJPY':-0.18,'USDCHF':-0.28,'AUDUSD':0.18,'USDCAD':-0.15,'NZDUSD':0.15,'EURGBP':1.00,'EURJPY':0.42,'GBPJPY':0.22,'XAUUSD':0.25,'US30':-0.05,'NAS100':-0.02 },
    'EURJPY': { 'EURUSD':0.52,'GBPUSD':0.48,'USDJPY':0.42,'USDCHF':-0.48,'AUDUSD':0.32,'USDCAD':-0.38,'NZDUSD':0.28,'EURGBP':0.42,'EURJPY':1.00,'GBPJPY':0.88,'XAUUSD':0.35,'US30':0.28,'NAS100':0.22 },
    'GBPJPY': { 'EURUSD':0.48,'GBPUSD':0.55,'USDJPY':0.52,'USDCHF':-0.44,'AUDUSD':0.38,'USDCAD':-0.35,'NZDUSD':0.35,'EURGBP':0.22,'EURJPY':0.88,'GBPJPY':1.00,'XAUUSD':0.32,'US30':0.30,'NAS100':0.25 },
    'XAUUSD': { 'EURUSD':0.65,'GBPUSD':0.61,'USDJPY':-0.55,'USDCHF':-0.62,'AUDUSD':0.75,'USDCAD':-0.48,'NZDUSD':0.70,'EURGBP':0.25,'EURJPY':0.35,'GBPJPY':0.32,'XAUUSD':1.00,'US30':0.18,'NAS100':0.22 },
    'US30':   { 'EURUSD':-0.12,'GBPUSD':-0.10,'USDJPY':0.35,'USDCHF':0.15,'AUDUSD':0.42,'USDCAD':0.22,'NZDUSD':0.38,'EURGBP':-0.05,'EURJPY':0.28,'GBPJPY':0.30,'XAUUSD':0.18,'US30':1.00,'NAS100':0.95 },
    'NAS100': { 'EURUSD':-0.08,'GBPUSD':-0.06,'USDJPY':0.28,'USDCHF':0.10,'AUDUSD':0.45,'USDCAD':0.18,'NZDUSD':0.40,'EURGBP':-0.02,'EURJPY':0.22,'GBPJPY':0.25,'XAUUSD':0.22,'US30':0.95,'NAS100':1.00 },
  };

  const corrVal = CORR[pair1]?.[pair2] ?? CORR[pair2]?.[pair1] ?? 0;
  const absCorr = Math.abs(corrVal);
  const direction = corrVal > 0 ? 'Positive' : 'Negative';
  const strength  = absCorr>=0.9?'Very Strong':absCorr>=0.7?'Strong':absCorr>=0.5?'Moderate':absCorr>=0.3?'Weak':'Very Weak / None';
  const risk = corrVal > 0.7 ? 'HIGH — Trading both = doubling your exposure'
             : corrVal < -0.7 ? 'HIGH — Trading same direction = they cancel out'
             : 'MODERATE — Some overlap in exposure';

  // Full correlation table for pair1
  const allPairs = Object.keys(CORR);

  out.className='output-box success';
  out.textContent=
    `${pair1}  ↔  ${pair2}\n\n`+
    `── Correlation ───────────────────────\n`+
    `Value:      ${corrVal.toFixed(2)}\n`+
    `Direction:  ${direction}\n`+
    `Strength:   ${strength}\n`+
    `Risk level: ${risk}\n\n`+
    `── What this means ───────────────────\n`+
    (corrVal>=0.7
      ? `These pairs move in the SAME direction.\nTrading both LONG doubles your USD exposure.\nAvoid holding both simultaneously for risk mgmt.`
      : corrVal<=-0.7
      ? `These pairs move in OPPOSITE directions.\nLong ${pair1} + Long ${pair2} mostly cancel out.\nThis can be used as a hedge or to reduce risk.`
      : `These pairs have MODERATE/LOW correlation.\nCan be traded simultaneously without major\noverlap in currency exposure.`)+
    `\n\n── ${pair1} correlation with all pairs ──\n`+
    Object.entries(CORR[pair1]||{})
      .filter(([p])=>p!==pair1)
      .sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]))
      .map(([p,c])=>{
        const bar='█'.repeat(Math.round(Math.abs(c)*10))+'░'.repeat(10-Math.round(Math.abs(c)*10));
        return `  ${p.padEnd(8)} ${c>=0?'+':''}${c.toFixed(2)} ${bar} ${c>=0.7?'⚠ high':c<=-0.7?'⚠ inverse':''}`;
      }).join('\n');
  setStatus('corr-status','ok',
    `✓ ${pair1}/${pair2}: ${corrVal.toFixed(2)} (${strength} ${direction})`);
}
