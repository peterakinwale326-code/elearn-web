import fs from "node:fs/promises";
import path from "node:path";
const file=path.resolve(process.cwd(),"data","curriculum.json");
const c=JSON.parse(await fs.readFile(file,"utf8"));
const bad=["specific concept studied","school-based situation can demonstrate","should be treated as a specific idea","recall the definition, rule, process, structure or principle","depending on the subject"];
const lessons=[];const seen=new Map();
for(const course of c.courses||[])for(const module of course.modules||[])for(const lesson of module.lessons||[]){lessons.push({course:course.title,module:module.title,lesson});const body=String(lesson.content||"").trim();seen.set(body,(seen.get(body)||0)+1);}
const failures=[];
if((c.courses||[]).length!==75) failures.push("Expected 75 courses, found "+(c.courses||[]).length);
for(const x of lessons){const body=String(x.lesson.content||"").toLowerCase();if(!x.lesson.title||body.length<1200)failures.push(x.course+" / "+x.lesson.title+": note is too short");if(bad.some(s=>body.includes(s)))failures.push(x.course+" / "+x.lesson.title+": generic filler detected");if(!/## (core explanation|detailed explanation)/i.test(x.lesson.content||""))failures.push(x.course+" / "+x.lesson.title+": missing core explanation");if(!/## (worked example|practical activity)/i.test(x.lesson.content||""))failures.push(x.course+" / "+x.lesson.title+": missing application/example");if(!/## common mistakes/i.test(x.lesson.content||""))failures.push(x.course+" / "+x.lesson.title+": missing common mistakes");if(!/## (quick check|practice questions)/i.test(x.lesson.content||""))failures.push(x.course+" / "+x.lesson.title+": missing revision questions");}
for(const [body,count] of seen)if(count>1&&body.length>500)failures.push("Duplicate lesson body used "+count+" times");
console.log("Courses:",c.courses?.length||0,"Lessons:",lessons.length,"Failures:",failures.length);
if(failures.length){for(const f of failures.slice(0,100))console.log("❌",f);process.exit(1);}
console.log("✅ Curriculum quality checks passed.");