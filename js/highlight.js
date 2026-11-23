/* Infinity Memory — realce de sintaxe leve (offline) */
const Highlight = (() => {
  const kw = (s) => new Set(s.split(/\s+/).filter(Boolean));
  const C_LIKE_COMMENTS = { line: '//', block: ['/*', '*/'] };
  const LANGS = {
    javascript: { name: 'JavaScript', ...C_LIKE_COMMENTS, kw: kw('const let var function return if else for while do switch case break continue new class extends super this import export from default async await try catch finally throw typeof instanceof in of yield delete void static get set null undefined true false NaN Infinity') },
    typescript: { name: 'TypeScript', ...C_LIKE_COMMENTS, kw: kw('const let var function return if else for while do switch case break continue new class extends super this import export from default async await try catch finally throw typeof instanceof in of yield delete void static get set null undefined true false interface type enum implements private public protected readonly abstract as any string number boolean never unknown keyof namespace declare') },
    python: { name: 'Python', line: '#', kw: kw('def return if elif else for while break continue pass class import from as try except finally raise with lambda yield global nonlocal assert del in is not and or None True False async await self print len range') },
    java: { name: 'Java', ...C_LIKE_COMMENTS, kw: kw('public private protected class interface enum extends implements static final void int long double float boolean char byte short new return if else for while do switch case break continue try catch finally throw throws this super import package null true false abstract synchronized var record String') },
    kotlin: { name: 'Kotlin', ...C_LIKE_COMMENTS, kw: kw('fun val var class object interface data sealed open override private public internal protected return if else when for while do break continue try catch finally throw import package null true false is as in this super companion suspend lateinit by') },
    c: { name: 'C / C++', ...C_LIKE_COMMENTS, kw: kw('int char float double long short unsigned signed void struct union enum typedef const static extern return if else for while do switch case break continue sizeof include define class public private protected virtual template typename namespace using new delete true false nullptr auto bool std cout cin endl') },
    csharp: { name: 'C#', ...C_LIKE_COMMENTS, kw: kw('public private protected internal class struct interface enum static void int long double float bool string char var new return if else for foreach in while do switch case break continue try catch finally throw using namespace this base null true false async await override virtual readonly const') },
    go: { name: 'Go', ...C_LIKE_COMMENTS, kw: kw('package import func return if else for range switch case break continue go defer chan map struct interface type var const nil true false make new select fallthrough string int error') },
    rust: { name: 'Rust', ...C_LIKE_COMMENTS, kw: kw('fn let mut const static struct enum impl trait pub use mod crate self Self return if else match for while loop break continue as ref move async await where true false Some None Ok Err String Vec') },
    php: { name: 'PHP', line: '//', block: ['/*', '*/'], kw: kw('function return if else elseif foreach for while do switch case break continue class public private protected static new echo print array null true false use namespace try catch throw extends implements this') },
    sql: { name: 'SQL', line: '--', block: ['/*', '*/'], ci: true, kw: kw('select from where and or not insert into values update set delete create table drop alter add primary key foreign references join left right inner outer on group by order asc desc having limit offset as distinct count sum avg min max null is in like between union all exists case when then else end index view') },
    html: { name: 'HTML', html: true },
    css: { name: 'CSS', block: ['/*', '*/'], css: true, kw: kw('important') },
    bash: { name: 'Bash', line: '#', kw: kw('if then else elif fi for in do done while case esac function return export echo cd ls grep sudo exit local read') },
    json: { name: 'JSON', kw: kw('true false null') },
    text: { name: 'Texto puro' },
  };

  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const span = (cls, s) => `<span class="tk-${cls}">${esc(s)}</span>`;

  function highlightHTML(code) {
    let out = '';
    const re = /(<!--[\s\S]*?-->)|(<\/?)([a-zA-Z][\w-]*)|([a-zA-Z-:@]+)(=)("[^"]*"|'[^']*')|(\/?>)/g;
    let last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      if (m[1]) out += span('com', m[1]);
      else if (m[2]) out += span('punc', m[2]) + span('kw', m[3]);
      else if (m[4]) out += span('attr', m[4]) + span('punc', m[5]) + span('str', m[6]);
      else if (m[7]) out += span('punc', m[7]);
      last = re.lastIndex;
    }
    return out + esc(code.slice(last));
  }

  function highlight(code, lang) {
    const L = LANGS[lang] || LANGS.text;
    if (!L.kw && !L.html && !L.line && !L.block) return esc(code);
    if (L.html) return highlightHTML(code);
    const parts = [];
    if (L.block) parts.push(`${reEsc(L.block[0])}[\\s\\S]*?(?:${reEsc(L.block[1])}|$)`);
    if (L.line) parts.push(`${reEsc(L.line)}[^\\n]*`);
    const commentRe = parts.length ? `(${parts.join('|')})` : '(\\b\\B)';
    const re = new RegExp(`${commentRe}|("(?:\\\\.|[^"\\\\\\n])*"|'(?:\\\\.|[^'\\\\\\n])*'|\`(?:\\\\.|[^\`\\\\])*\`)|(\\b\\d+(?:\\.\\d+)?\\b)|(${L.css ? '[#.]?[a-zA-Z_-][\\w-]*' : '[A-Za-z_$][\\w$]*'})`, 'g');
    let out = '', last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      if (m[1]) out += span('com', m[1]);
      else if (m[2]) out += span('str', m[2]);
      else if (m[3]) out += span('num', m[3]);
      else if (m[4]) {
        const w = m[4];
        const after = code.slice(re.lastIndex).match(/^\s*(\(|:)/);
        if (L.css) out += after && after[1] === ':' ? span('attr', w) : /^[#.]/.test(w) || /^[a-z]/.test(w) ? span('fn', w) : esc(w);
        else if (L.kw && L.kw.has(L.ci ? w.toLowerCase() : w)) out += span('kw', w);
        else if (after && after[1] === '(') out += span('fn', w);
        else if (/^[A-Z][a-zA-Z0-9]*$/.test(w) && w.length > 1) out += span('type', w);
        else out += esc(w);
      }
      last = re.lastIndex;
      if (m[0].length === 0) re.lastIndex++;
    }
    return out + esc(code.slice(last));
  }
  function reEsc(s) { return s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'); }

  return { highlight, LANGS };
})();
