import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, "data", "curriculum.json");
const outputDirectory = path.join(root, "public", "media", "lesson-diagrams");
const curriculum = JSON.parse(await fs.readFile(sourcePath, "utf8"));
const manifest = [];

function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function hashKey(key) {
  let firstHash = 0x811c9dc5;
  let secondHash = 0x9e3779b9;
  for (let index = 0; index < key.length; index += 1) {
    const code = key.charCodeAt(index);
    firstHash = Math.imul(firstHash ^ code, 0x01000193);
    secondHash = Math.imul(secondHash ^ code, 0x85ebca6b);
  }
  return `${(firstHash >>> 0).toString(16).padStart(8, "0")}${(secondHash >>> 0).toString(16).padStart(8, "0")}`;
}

function linesFor(value, maxLength = 34, maxLines = 2) {
  const words = String(value ?? "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxLength && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    } else {
      line = next;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length && words.join(" ").length > lines.join(" ").length) {
    lines[lines.length - 1] = `${lines.at(-1).slice(0, maxLength - 1)}…`;
  }
  return lines;
}

function topicFamily(course, module, lesson) {
  const text = `${course.title} ${course.subject ?? ""} ${module.title} ${lesson.title}`.toLowerCase();
  if (/phonetic|phonics|vowel|diphthong|consonant|speech sound|articulation|ipa/.test(text)) return "phonetics";
  if (/mathematics|algebra|geometry|fraction|calculus|statistics|probability|equation|number sense/.test(text)) return "mathematics";
  if (/biology|cell|organism|ecology|inheritance|photosynthesis|anatomy/.test(text)) return "biology";
  if (/chemistry|atom|molecule|reaction|acid|bonding/.test(text)) return "chemistry";
  if (/physics|force|motion|wave|circuit|energy|electric/.test(text)) return "physics";
  if (/agricultural|crop|soil|farm|livestock|seed|harvest/.test(text)) return "agriculture";
  if (/computer|programming|html|css|javascript|python|java|php|c\+\+|c#|database|algorithm|software/.test(text)) return "computing";
  if (/account|business|economics|commerce|marketing|entrepreneur/.test(text)) return "business";
  if (/government|civic|citizen|constitution|social studies|history|democracy/.test(text)) return "civics";
  if (/physical education|health|fitness|sport|nutrition|first aid/.test(text)) return "health";
  if (/technology|engineering|workshop|technical drawing|material/.test(text)) return "technology";
  if (/english|literature|grammar|reading|writing|composition|language/.test(text)) return "language";
  return "general";
}

function diagramFor(family, lesson, module, seed) {
  const accent = ["#176b4a", "#bd6b32", "#33728c", "#80613c"][seed % 4];
  const title = escapeXml(lesson.title);
  const moduleLabel = escapeXml(module.title);

  if (family === "phonetics") {
    const sounds = [...new Set(`${lesson.title} ${Array.isArray(lesson.content) ? lesson.content.join(" ") : lesson.content ?? ""}`.match(/\/[^/\n]{1,8}\//g) ?? [])].slice(0, 4);
    const symbols = sounds.length ? sounds : ["/i:/", "/ɪ/", "/æ/", "/ə/"];
    const soundCards = symbols.map((symbol, index) => {
      const x = 112 + (index % 4) * 185;
      const y = 205 + Math.floor(index / 4) * 62;
      return `<g><rect x="${x}" y="${y}" width="150" height="48" rx="12" fill="#fff" stroke="#c9ddd1"/><text x="${x + 75}" y="${y + 32}" text-anchor="middle" font-size="25" font-weight="700" fill="#173d30">${escapeXml(symbol)}</text></g>`;
    }).join("");
    return `<text x="88" y="159" font-size="13" font-weight="700" fill="#5d7569">VOWEL CONTRAST · LISTEN · IDENTIFY</text><path d="M130 298H830M150 295L178 280L205 258L231 225L259 190" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round"/><path d="M760 190L788 225L815 258L842 280L870 295" fill="none" stroke="#cf9861" stroke-width="5" stroke-linecap="round"/><text x="116" y="326" font-size="12" fill="#52675d">FRONT · HIGH TONGUE</text><text x="672" y="326" font-size="12" fill="#52675d">BACK · LOW TONGUE</text>${soundCards}`;
  }

  if (family === "mathematics") {
    return `<rect x="92" y="170" width="430" height="158" rx="14" fill="#fff" stroke="#d5e1da"/><path d="M130 295H480M166 315V187M210 300L260 270L310 255L360 220L410 204" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round"/><g stroke="#e4ebe6" stroke-width="1"><path d="M210 187V315M260 187V315M310 187V315M360 187V315M410 187V315M130 220H480M130 260H480"/></g><rect x="565" y="194" width="275" height="92" rx="18" fill="#e9f4ee"/><text x="595" y="229" font-size="14" font-weight="700" fill="#315846">MODEL · SOLVE · CHECK</text><text x="595" y="261" font-size="20" font-weight="700" fill="#173d30">${escapeXml(lesson.title.slice(0, 23))}</text><circle cx="260" cy="270" r="7" fill="#bd6b32"/><circle cx="360" cy="220" r="7" fill="#bd6b32"/>`;
  }

  if (family === "biology") {
    return `<circle cx="280" cy="248" r="110" fill="#e3f1e6" stroke="${accent}" stroke-width="5"/><circle cx="282" cy="248" r="43" fill="#aacbb1" stroke="#567d62" stroke-width="3"/><circle cx="267" cy="236" r="10" fill="#385f48"/><ellipse cx="215" cy="215" rx="19" ry="10" fill="#fff" stroke="#91b69a" stroke-width="3"/><ellipse cx="350" cy="285" rx="24" ry="12" fill="#fff" stroke="#91b69a" stroke-width="3"/><path d="M391 202H524M325 250H524M368 290H524" stroke="#779783" stroke-width="2"/><text x="540" y="207" font-size="15" font-weight="700" fill="#244636">CELL MEMBRANE</text><text x="540" y="255" font-size="15" font-weight="700" fill="#244636">NUCLEUS · DNA</text><text x="540" y="297" font-size="15" font-weight="700" fill="#244636">ORGANELLES</text><text x="160" y="354" font-size="12" fill="#52675d">STRUCTURE RELATES TO FUNCTION</text>`;
  }

  if (family === "chemistry") {
    return `<circle cx="280" cy="250" r="32" fill="#f4d99a" stroke="#b47838" stroke-width="3"/><circle cx="155" cy="195" r="18" fill="#9bbfd1"/><circle cx="417" cy="194" r="18" fill="#d29b8d"/><circle cx="407" cy="312" r="18" fill="#9bbfd1"/><path d="M175 204L250 238M310 239L400 201M309 265L392 304" stroke="#58786d" stroke-width="8" stroke-linecap="round"/><rect x="525" y="190" width="300" height="122" rx="20" fill="#fff" stroke="#d5e1da"/><text x="555" y="225" font-size="13" font-weight="700" fill="#5d7569">PARTICLES · BONDS · CHANGE</text><text x="555" y="267" font-size="20" font-weight="700" fill="#173d30">${escapeXml(lesson.title.slice(0, 24))}</text><text x="555" y="292" font-size="13" fill="#52675d">Observe evidence, then model it.</text>`;
  }

  if (family === "physics") {
    return `<rect x="90" y="178" width="510" height="154" rx="16" fill="#fff" stroke="#d5e1da"/><path d="M112 255C150 190 190 190 228 255S306 320 344 255S422 190 460 255S538 320 578 255" fill="none" stroke="${accent}" stroke-width="5"/><path d="M660 288V210M630 240H805" stroke="#536f63" stroke-width="3"/><path d="M655 215L660 204L665 215M800 235L811 240L800 245" fill="#536f63"/><path d="M660 277L720 235L770 250" fill="none" stroke="#bd6b32" stroke-width="5"/><text x="675" y="310" font-size="12" fill="#52675d">MEASURE · MODEL · TEST</text><text x="112" y="205" font-size="12" font-weight="700" fill="#52675d">${escapeXml(lesson.title.slice(0, 31))}</text>`;
  }

  if (family === "agriculture") {
    return `<path d="M270 302V217M270 250C211 239 191 211 194 182C228 185 260 204 270 229M272 235C297 193 330 177 365 181C358 216 327 238 272 249" fill="#96bb84" stroke="#47734c" stroke-width="5" stroke-linejoin="round"/><path d="M270 302C251 319 247 331 246 345M270 302C288 318 292 331 294 345M270 302C270 320 270 332 270 348" fill="none" stroke="#9a754a" stroke-width="4"/><circle cx="269" cy="170" r="24" fill="#f4d68d"/><path d="M92 350H835" stroke="#c6b08c" stroke-width="5"/><rect x="490" y="191" width="335" height="119" rx="16" fill="#fff" stroke="#d5e1da"/><text x="520" y="226" font-size="13" font-weight="700" fill="#5d7569">SOIL · WATER · LIGHT</text><text x="520" y="267" font-size="20" font-weight="700" fill="#173d30">${escapeXml(lesson.title.slice(0, 24))}</text><text x="520" y="292" font-size="13" fill="#52675d">Trace inputs to crop growth.</text>`;
  }

  if (family === "computing") {
    return `<rect x="95" y="175" width="430" height="174" rx="14" fill="#17352d"/><circle cx="119" cy="197" r="5" fill="#e19b5d"/><circle cx="138" cy="197" r="5" fill="#d7d9a2"/><circle cx="157" cy="197" r="5" fill="#8ab89b"/><text x="125" y="238" font-family="monospace" font-size="17" fill="#a7d8bc">INPUT → PROCESS → OUTPUT</text><text x="125" y="273" font-family="monospace" font-size="15" fill="#fff">${escapeXml(lesson.title.slice(0, 32))}</text><text x="125" y="310" font-family="monospace" font-size="14" fill="#a7d8bc">test edge cases;</text><path d="M583 260H665M665 260V206M665 260V315M665 206H735M665 315H735" fill="none" stroke="${accent}" stroke-width="5"/><rect x="720" y="183" width="140" height="48" rx="10" fill="#e4f1e8"/><rect x="720" y="292" width="140" height="48" rx="10" fill="#e4f1e8"/><text x="790" y="213" text-anchor="middle" font-size="13" fill="#244636">VALID INPUT</text><text x="790" y="322" text-anchor="middle" font-size="13" fill="#244636">EXPECTED OUTPUT</text>`;
  }

  if (family === "business") {
    return `<path d="M110 330H530M135 330V286M225 330V256M315 330V220M405 330V185" fill="#b4d0bb" stroke="#527b5e" stroke-width="3"/><path d="M143 272L239 241L331 224L421 187" fill="none" stroke="${accent}" stroke-width="5"/><circle cx="143" cy="272" r="7" fill="#bd6b32"/><circle cx="239" cy="241" r="7" fill="#bd6b32"/><circle cx="331" cy="224" r="7" fill="#bd6b32"/><circle cx="421" cy="187" r="7" fill="#bd6b32"/><rect x="590" y="190" width="250" height="118" rx="18" fill="#fff" stroke="#d5e1da"/><text x="620" y="226" font-size="13" font-weight="700" fill="#5d7569">RECORD · COMPARE · DECIDE</text><text x="620" y="269" font-size="19" font-weight="700" fill="#173d30">${escapeXml(lesson.title.slice(0, 23))}</text><text x="620" y="292" font-size="12" fill="#52675d">Use evidence for each choice.</text>`;
  }

  if (family === "civics") {
    return `<path d="M125 232H805M180 232V294M465 232V294M750 232V294" stroke="#779783" stroke-width="4"/><rect x="110" y="177" width="140" height="55" rx="12" fill="#e6f0e8"/><rect x="395" y="177" width="140" height="55" rx="12" fill="#f7eadb"/><rect x="680" y="177" width="140" height="55" rx="12" fill="#e2eef2"/><text x="180" y="210" text-anchor="middle" font-size="14" font-weight="700" fill="#244636">RULES</text><text x="465" y="210" text-anchor="middle" font-size="14" font-weight="700" fill="#76522f">PEOPLE</text><text x="750" y="210" text-anchor="middle" font-size="14" font-weight="700" fill="#31596a">INSTITUTIONS</text><rect x="220" y="294" width="490" height="42" rx="12" fill="#fff" stroke="#d5e1da"/><text x="465" y="321" text-anchor="middle" font-size="15" font-weight="700" fill="#173d30">${escapeXml(lesson.title.slice(0, 32))}</text>`;
  }

  if (family === "health") {
    return `<circle cx="300" cy="244" r="83" fill="#f8e6df" stroke="#c98167" stroke-width="4"/><path d="M300 287C262 257 240 238 254 216C268 196 292 207 300 223C309 205 337 199 349 219C364 243 336 267 300 287Z" fill="#c76650"/><path d="M385 212C460 182 498 208 535 233M385 272C455 303 502 277 535 252" fill="none" stroke="#6b9d82" stroke-width="5"/><rect x="580" y="189" width="245" height="112" rx="17" fill="#fff" stroke="#d5e1da"/><text x="607" y="222" font-size="13" font-weight="700" fill="#5d7569">PRACTISE SAFELY</text><text x="607" y="262" font-size="19" font-weight="700" fill="#173d30">${escapeXml(lesson.title.slice(0, 23))}</text><text x="607" y="285" font-size="12" fill="#52675d">Notice · respond · review</text>`;
  }

  if (family === "technology") {
    return `<rect x="130" y="190" width="165" height="92" rx="14" fill="#e5eff0" stroke="#5e8591" stroke-width="3"/><rect x="378" y="190" width="165" height="92" rx="14" fill="#e8f1e6" stroke="#668a68" stroke-width="3"/><path d="M295 236H375" stroke="${accent}" stroke-width="5"/><path d="M365 226L380 236L365 246" fill="none" stroke="${accent}" stroke-width="5"/><text x="212" y="230" text-anchor="middle" font-size="14" font-weight="700" fill="#31596a">DESIGN</text><text x="212" y="254" text-anchor="middle" font-size="12" fill="#52675d">need + constraints</text><text x="460" y="230" text-anchor="middle" font-size="14" font-weight="700" fill="#315846">TEST</text><text x="460" y="254" text-anchor="middle" font-size="12" fill="#52675d">measure + refine</text><text x="640" y="230" font-size="18" font-weight="700" fill="#173d30">${escapeXml(lesson.title.slice(0, 20))}</text><text x="640" y="258" font-size="13" fill="#52675d">Build with purpose.</text>`;
  }

  return `<rect x="112" y="184" width="735" height="146" rx="20" fill="#fff" stroke="#d5e1da"/><circle cx="190" cy="257" r="42" fill="#e4f1e8"/><path d="M170 257L185 272L213 239" fill="none" stroke="${accent}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><text x="265" y="231" font-size="14" font-weight="700" fill="#5d7569">OBSERVE · EXPLAIN · APPLY</text><text x="265" y="274" font-size="21" font-weight="700" fill="#173d30">${escapeXml(lesson.title.slice(0, 32))}</text><text x="265" y="305" font-size="13" fill="#52675d">Connect the module idea to an example.</text>`;
}

function makeSvg(course, module, lesson, key) {
  const titleLines = linesFor(lesson.title);
  const heading = titleLines.map((line, index) =>
    `<text x="86" y="${72 + index * 34}" font-family="Georgia,serif" font-size="${index ? 21 : 28}" font-weight="700" fill="#173d30">${escapeXml(line)}</text>`,
  ).join("");
  const family = topicFamily(course, module, lesson);
  const seed = Number.parseInt(hashKey(key).slice(-2), 16);
  const diagram = diagramFor(family, lesson, module, seed);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 380" role="img" aria-labelledby="title desc"><title id="title">${escapeXml(lesson.title)} diagram</title><desc id="desc">${escapeXml(module.title)} illustration for ${escapeXml(course.title)}.</desc><rect width="960" height="380" fill="#f2f6f2"/><path d="M0 0H960V17H0Z" fill="#176b4a"/><circle cx="874" cy="68" r="84" fill="#e3eee5"/><text x="86" y="43" font-family="Arial,sans-serif" font-size="11" font-weight="700" letter-spacing="1.5" fill="#638173">${escapeXml(course.title)} · ${escapeXml(course.level ?? "")}</text>${heading}<text x="86" y="136" font-family="Arial,sans-serif" font-size="12" font-weight="700" fill="#7a8e83">${escapeXml(module.title)}</text>${diagram}<text x="86" y="364" font-family="Arial,sans-serif" font-size="10" font-weight="700" fill="#789083">FIELDNOTE · TOPIC DIAGRAM</text></svg>`;
}

await fs.mkdir(outputDirectory, { recursive: true });

for (const course of curriculum.courses ?? []) {
  for (const module of course.modules ?? []) {
    for (const lesson of module.lessons ?? []) {
      const level = String(course.level ?? "");
      const key = `${course.title}|${level}|${module.title}|${lesson.title}`.normalize("NFKC");
      const fileName = `${hashKey(key)}.svg`;
      const diagramPath = path.join(outputDirectory, fileName);
      try {
        await fs.access(diagramPath);
      } catch {
        await fs.writeFile(diagramPath, makeSvg(course, module, lesson, key), "utf8");
      }
      manifest.push(`/media/lesson-diagrams/${fileName}`);
    }
  }
}

const mediaRoot = path.join(root, "public", "media");
const staticManifestPath = path.join(mediaRoot, "images-manifest.json");
let staticAssets = [];
try {
  staticAssets = JSON.parse(await fs.readFile(staticManifestPath, "utf8"));
} catch {
  staticAssets = [];
}
const allAssets = [...new Set(staticAssets.filter((asset) => !asset.startsWith("/media/lesson-diagrams/")))];
await fs.writeFile(staticManifestPath, `${JSON.stringify(allAssets, null, 2)}\n`, "utf8");
await fs.writeFile(path.join(mediaRoot, "lesson-diagrams-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(JSON.stringify({ courses: curriculum.courses?.length ?? 0, lessonDiagrams: manifest.length, distinctFiles: new Set(manifest).size }, null, 2));