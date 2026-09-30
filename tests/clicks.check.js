// Run from repo root: node tests/clicks.check.js
// Static audit of employee.html: every onclick/onchange/oninput handler must call functions that exist,
// and every go()/navTo()/goBack()/speakScreen() target must be a real screen id.
const fs=require('fs');
const html=fs.readFileSync('employee.html','utf8');
const scripts=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>fs.existsSync(f));
const js=scripts.map(f=>fs.readFileSync(f,'utf8')).join('\n')+[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
const all=html+'\n'+js;

const defined=new Set([
  ...[...js.matchAll(/function\s+([A-Za-z_$][\w$]*)/g)].map(m=>m[1]),
  ...[...js.matchAll(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:function|\(|[A-Za-z_$][\w$]*\s*=>)/g)].map(m=>m[1]),
  ...[...js.matchAll(/window\.([A-Za-z_$][\w$]*)\s*=/g)].map(m=>m[1]),
]);
const builtins=new Set(['if','return','document','setTimeout','event','this','alert','confirm','window','parseInt','parseFloat','String','Number','Math','console','location','history','navigator','toast','S','typeof','new','Date','JSON','Object','Array','encodeURIComponent','function']);
const ids=new Set([...all.matchAll(/id=["']([\w-]+)["']/g)].map(m=>m[1]));

const problems=[];
// 1. inline handlers in HTML + handlers built in JS strings
const handlers=[...all.matchAll(/on(?:click|change|input)=\\?["']([^"]*?)\\?["']/g)].map(m=>m[1]);
for(const h of handlers){
  const code=h.replace(/'[^']*'/g,"''");
  for(const m of code.matchAll(/(?<![.\w$])([A-Za-z_$][\w$]*)\s*\(/g)){
    const fn=m[1];
    if(!defined.has(fn)&&!builtins.has(fn)) problems.push('undefined function '+fn+'()  in: '+h.slice(0,90));
  }
}
// 2. navigation targets anywhere
for(const m of all.matchAll(/(?:\bgo|navTo|goBack|speakScreen)\(\s*\\?['"](s-[\w-]+)\\?['"]/g)){
  if(!ids.has(m[1])) problems.push('missing screen #'+m[1]);
}
// 3. getElementById targets in JS
for(const m of js.matchAll(/getElementById\(\s*['"]([\w-]+)['"]\s*\)/g)){
  if(!ids.has(m[1])) problems.push('missing element #'+m[1]);
}
const uniq=[...new Set(problems)];
console.log(uniq.length?uniq.join('\n'):'ok — no broken handlers or targets');
process.exitCode=uniq.length?1:0;
