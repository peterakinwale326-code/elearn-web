import fs from "node:fs/promises";
import path from "node:path";

const file = path.resolve(process.cwd(), "data", "curriculum.json");
const applyChanges = process.argv.includes("--apply");
const courseIds = new Set(["jss1-basic-science-and-technology", "jss2-basic-science-and-technology", "jss3-basic-science-and-technology"]);

const additions = {
  "Science and observation": `A scientific observation records what can be detected with the senses or an instrument, while an inference explains what the observation may mean. If a plant bends toward a window, the direction of growth is observed; a response to light is an explanation that can be tested. Ask a focused question, make a prediction and decide what evidence would count against it. Repeat observations where possible and keep the method consistent. A useful science report separates measurements from interpretation and states limits, such as a small sample or changing room conditions.`,
  "Laboratory safety": `Safety begins with identifying hazards before an activity starts. Wear the protective equipment directed by the teacher, tie back loose clothing, keep food away from chemicals and report spills or breakages immediately. Read labels and never mix unknown substances. When heating, use the correct holder and point containers away from people. Dispose of materials as instructed, then wash hands and return equipment safely. A rule is meaningful when learners understand the hazard it controls; if an instruction is unclear, stop and ask before continuing.`,
  Measurement: `Measurement compares a quantity with an agreed unit. Choose an instrument suited to the scale: a ruler for length, a balance for mass and a measuring cylinder for liquid volume. Read a scale at eye level, record the unit and use only the precision supported by its markings. Repeat readings to notice variation, but do not discard an unusual value without checking the method. Convert units before calculations; for example, 100 centimetres equal one metre. State whether a value was measured directly or calculated from other measurements.`,
  "Cells and living things": `Cells are the basic units of living organisms. Many cells have a membrane, cytoplasm and genetic material; plant cells also have a cell wall and may contain chloroplasts. A microscope can show structure, but a drawing should include only what is visible at the stated magnification. Living organisms carry out coordinated life processes, including nutrition, respiration, growth, sensitivity and reproduction. A non-living object can show one feature, such as movement, without being alive. Use several observations together when classifying a specimen and distinguish living material from something that was once alive.`,
  Classification: `Classification groups organisms using shared characteristics so they can be identified and compared. A key uses paired choices based on observable features; follow each choice in order and avoid guessing from habitat alone. Scientific names provide a consistent naming system across languages. Classification can change when new evidence becomes available, so it is a model rather than a permanent ranking of organisms. Record the feature that supports each decision and note when a specimen does not fit the key. Similar appearance does not always mean organisms are closely related.`,
  Nutrition: `A balanced diet provides energy and materials for growth, repair and normal body functions. Carbohydrates and fats can supply energy, proteins provide amino acids, and vitamins and minerals have particular roles. Fibre supports movement through the gut, while water is needed for transport and chemical reactions. Needs vary with age, activity and health. Food labels help compare products when serving sizes are considered, but no single food provides everything. Discuss nutrition without shaming food choices, since affordability, culture and availability influence what people can eat.`,
  "Human body systems": `Body systems work together rather than acting independently. The digestive system breaks food into absorbable molecules, the circulatory system transports materials, and the respiratory system exchanges oxygen and carbon dioxide. The skeletal and muscular systems support movement, while the nervous system coordinates responses. A flow diagram can trace oxygen from the lungs to a working muscle and carbon dioxide back to the lungs. Identify each organ's role and show how the systems connect. This helps explain why a change in one system can affect the body's overall function.`,
  Reproduction: `Reproduction produces new organisms and passes hereditary information to offspring. In flowering plants, pollen carries male reproductive cells to a stigma; fertilisation occurs later when nuclei fuse in an ovule. In humans, specialised reproductive cells join during fertilisation. These processes have different structures and should not be confused. Use labelled diagrams and accurate vocabulary, and discuss human development respectfully without asking classmates to share private experiences. Reproduction supports continuation of a species, while variation among offspring can arise through the combination of genetic material.`,
  "Matter and particles": `Matter has mass and occupies space. The particle model explains differences among solids, liquids and gases: particles in solids vibrate around fixed positions, particles in liquids move past one another, and gas particles move freely with larger spaces between them. Heating changes particle motion and may cause a change of state. The particles themselves do not disappear when a substance melts or evaporates. Use a simple diagram to show spacing and movement, and remember that particle drawings are models rather than pictures of particles at their true scale.`,
  "Elements and compounds": `An element contains one type of atom; a compound contains atoms of different elements chemically joined in a fixed ratio. A mixture contains substances together without chemical bonding, so its composition can vary. Symbols and formulae communicate composition compactly: H2O represents water with two hydrogen atoms for each oxygen atom. Separate a formula's subscripts from coefficients, which count how many particles are present. Use these distinctions to classify materials and predict whether physical separation or a chemical process is needed.`,
  "Mixtures and separation": `A mixture can often be separated using differences in physical properties. Filtration separates an insoluble solid from a liquid; evaporation can recover a dissolved solid; distillation can collect a solvent or separate liquids with different boiling points. Chromatography separates dissolved substances according to how they travel through a material. Choose a method based on the mixture and the component to be recovered. Label samples, use suitable apparatus and explain which property makes the method work. A clear liquid may still contain dissolved substances and is not necessarily pure.`,
  "Physical and chemical changes": `In a physical change, a substance changes form or state but remains the same substance; melting ice still consists of water molecules. In a chemical change, atoms rearrange to form different substances, such as magnesium reacting with oxygen. Colour change, gas formation or a temperature change may be evidence, but context matters: bubbles from boiling are not proof of a reaction. Describe what was observed, then explain which evidence supports the classification. Mass is conserved in a closed system because atoms are rearranged rather than created or destroyed.`,
  "Force and motion": `A force is a push or pull that can change motion or shape. Forces are measured in newtons and have direction. Balanced forces produce no change in velocity, while an unbalanced resultant force causes acceleration. Friction opposes relative motion between surfaces, and gravity attracts objects toward Earth. Draw arrows on a simple force diagram and label each interaction acting on the chosen object. Do not confuse speed, which has magnitude only, with velocity, which includes direction. Describe motion relative to a stated reference point.`,
  "Work, energy and power": `Energy can be transferred between stores, including chemical, kinetic, thermal and gravitational stores. Work is done when a force causes displacement in its direction; lifting a book transfers energy to its gravitational store. Power describes the rate of energy transfer. A machine may change the size or direction of a force but cannot create energy; some input is transferred to less useful forms such as heating. Identify the system and trace the transfer pathway before describing efficiency. This helps explain why a device needs energy even when it makes a task easier.`,
  "Heat transfer": `Thermal energy can transfer by conduction, convection and radiation. Conduction is especially effective in many solids as particles and free electrons transfer energy; convection occurs when warmer, less dense fluid moves and cooler fluid replaces it; radiation can travel through a vacuum. Insulating materials slow some transfer pathways, while shiny surfaces reflect more thermal radiation than dark surfaces. Identify the material and direction of energy flow when explaining an example. Temperature measures how hot a body is; heat is energy moving because of a temperature difference.`,
  Electricity: `Electric current is the rate of flow of charge in a circuit. A complete conducting path is needed for current, and a cell provides a potential difference that transfers energy to components. In a series circuit, the same current passes through each component; adding components can change the total resistance and current. Draw standard symbols clearly and place an ammeter in series. A circuit diagram represents connections, not necessarily the physical shape of the wires. Follow teacher instructions and never experiment with mains electricity.`,
  Magnetism: `A magnet produces a field in the region where magnetic materials or other magnets experience a force. Like poles repel and unlike poles attract. Field lines are drawn from north to south outside a bar magnet and are closer together where the field is stronger. Iron filings or a compass can help reveal a pattern, but handle magnets carefully and keep them away from devices that may be affected. A magnetic field model explains forces at a distance without requiring the magnets to touch.`,
  "Light and sound": `Light and sound transfer energy in different ways. Light is an electromagnetic wave and can travel through a vacuum; sound is a mechanical wave and needs a medium. Reflection changes a wave's direction at a surface, while sound pitch relates to frequency and loudness relates to amplitude. Shadows form when an opaque object blocks light travelling from a source. Use ray or wave diagrams with labelled directions. Distinguish the motion of particles in a sound wave from the direction the wave carries energy.`,
  "Weather and climate": `Weather describes short-term atmospheric conditions such as temperature, wind, cloud and rainfall. Climate describes patterns averaged over many years. A daily observation cannot establish a climate trend; long records and consistent measurement are needed. A weather station may record temperature in shade, rainfall in a gauge and wind direction with an appropriate instrument. Compare locations and dates carefully, and state the time scale. Climate influences water, farming and ecosystems, while human activities can affect atmospheric composition and local conditions.`,
  "Water cycle": `The water cycle moves water among the atmosphere, land, oceans and living things. Evaporation and transpiration transfer water vapour to the air; condensation forms droplets or clouds; precipitation returns water to Earth's surface. Runoff, infiltration and groundwater movement affect where water is stored. The cycle is continuous, but local availability changes with season, land use and demand. Label a diagram with process names and arrows, then explain how vegetation or paved surfaces can change runoff and infiltration.`,
  Soil: `Soil contains mineral particles, organic matter, water, air and living organisms. Texture depends on the proportions of sand, silt and clay; these affect drainage and nutrient retention. A soil sample should be taken from a defined place and depth, avoiding unusual spots unless they are the focus of study. Compare samples using the same method and record moisture conditions. Soil supports plant growth and habitats, but erosion can remove fertile topsoil. Vegetation cover and careful land use can reduce erosion, although the best method depends on the slope and local conditions.`,
  Ecosystems: `An ecosystem includes organisms interacting with one another and with non-living factors such as light, water and soil. A habitat is the place an organism lives; a population is one species in an area; a community includes different populations. Producers capture energy, and consumers obtain it by feeding. A change in one population can affect others through food relationships or competition. Use a food web to trace possible effects and state assumptions, since ecosystems contain many linked pathways rather than one simple chain.`,
  Pollution: `Pollution occurs when harmful substances or energy enter the environment at levels that cause damage. Air, water and land pollution can affect organisms and human health through different exposure routes. Identify the source, pathway and affected system before proposing a control. A sample from one place or day may not represent a larger area, so record location, date and method. Prevention may involve cleaner production, waste treatment or public rules. Avoid blaming individuals when infrastructure, business practices and regulation also influence pollution.`,
  Conservation: `Conservation protects species, habitats and the ecological processes they depend on. Actions include restoring habitats, reducing pollution, managing harvesting and creating protected areas. Evaluate an action using a measurable indicator, such as species counts or vegetation cover, and compare it with a baseline. A proposal should consider local communities, costs and unintended effects. One observation cannot prove a population has recovered, and a protected boundary alone does not guarantee effective management. Use evidence over time and explain remaining uncertainty.`,
  "Simple machines": `Simple machines change the direction or size of an applied force. A lever turns around a pivot, a pulley can redirect a pull, and an inclined plane spreads a lift over a longer distance. Machines do not create energy; friction and deformation transfer some energy to less useful forms. Compare input and output forces and distances, and identify where the effort is applied. A tool may reduce the force needed while increasing the distance over which it acts.`,
  "Technology and society": `Technology applies knowledge and design to meet human needs, but every design has constraints and consequences. A water filter may improve access to clean water only if replacement materials and maintenance are available. Evaluate a technology by asking who can use it, how safe and reliable it is, what resources it needs and what waste it creates. A prototype should be tested against clear criteria and revised from evidence. Technology can support communities, but it does not solve a problem automatically or equally for every user.`,
  "Integrated investigation": `An integrated investigation combines a clear question, safe method, accurate measurement and evidence-based conclusion. Identify the variable to change, the outcome to measure and relevant conditions to control. Repeat trials where practical, record units and keep unexpected results visible. Use a table or graph that matches the data, then state what the evidence supports and what it cannot establish. For example, a test of soil and plant growth should use comparable seeds and light conditions. Suggest a specific improvement and explain how it would reduce uncertainty.`,
};

const followUps = {
  "Science and observation": `Keep a dated record and use the same description rules each time. If two explanations fit the observation, design a comparison that could distinguish them instead of choosing the more familiar explanation.`,
  "Laboratory safety": `Before leaving, check that heat sources are off, containers are labelled and the work area is clear. Report an accident or near miss promptly so the class can prevent a repeat.`,
  Measurement: `Estimate one digit beyond the smallest marked division only when the instrument scale permits it. Repeat readings and report a sensible average rather than false precision.`,
  "Cells and living things": `A microscope's magnification does not add detail that the lens cannot resolve. Compare the scale bar or field of view when estimating the size of a cell.`,
  Classification: `A good key avoids vague words such as “large” unless a comparison is defined. Use features that remain visible and can be checked by another learner.`,
  Nutrition: `A meal's nutritional value depends on the whole pattern over time. Health advice should come from qualified sources and account for allergies or medical needs.`,
  "Human body systems": `During exercise, several systems respond together: breathing and heart rate can increase to deliver oxygen and remove carbon dioxide. Explain the link rather than listing changes separately.`,
  Reproduction: `In flowering plants, pollen transfer and fertilisation are separate events; in humans, fertilisation and implantation are also distinct. Correct sequence prevents common misconceptions.`,
  "Matter and particles": `Heating usually increases particle motion, while cooling reduces it. During a phase change, energy changes particle arrangement even when the thermometer reading stays steady.`,
  "Elements and compounds": `A compound's composition is fixed, but a mixture's proportions can vary. This difference helps decide whether a material can be separated physically.`,
  "Mixtures and separation": `Choose the collection point before starting: decide whether the goal is the liquid, a dissolved solid or a separated colour. This determines the suitable apparatus.`,
  "Physical and chemical changes": `Reversibility can be a clue, but it is not a complete test. Use evidence about the substances before and after the change to support the classification.`,
  "Force and motion": `When several forces act, draw them on one object and combine directions to find the resultant. A stationary object may still have forces acting on it.`,
  "Work, energy and power": `For a useful calculation, show the relationship, substitute values with units and check that the final unit matches the quantity being asked for.`,
  "Heat transfer": `A thermos slows energy transfer through its walls and opening, but no container stops transfer completely. Compare designs by the pathways they reduce.`,
  Electricity: `A switch opens or closes a circuit path; it does not supply energy. Check the cell orientation and connections when a bulb fails to light.`,
  Magnetism: `A compass needle aligns with the local magnetic field. Move it around a magnet and mark direction at several points to build a more reliable field map.`,
  "Light and sound": `A shadow's size changes with the positions of the source, object and screen. For sound, a vibrating source must transfer energy through air or another medium.`,
  "Weather and climate": `Weather data should include the time and place of observation. Comparing measurements gathered with different instruments can create apparent differences that are not real.`,
  "Water cycle": `Water can infiltrate soil and later reach streams as groundwater. Paving a surface can reduce infiltration and increase rapid runoff after rainfall.`,
  Soil: `A simple jar test can separate particle layers over time, but the result is an estimate. A laboratory test is needed for precise nutrient or pH advice.`,
  Ecosystems: `A food web shows feeding relationships, but it does not predict every population change by itself. Consider other food sources, competition and environmental conditions.`,
  Pollution: `A fair comparison uses samples collected in the same way. Follow safety guidance and never touch or taste unknown water, soil or waste.`,
  Conservation: `Monitoring should use the same locations, timing and counting method. Share results with the people responsible for the habitat and revise actions if indicators do not improve.`,
  "Simple machines": `The effort force, load force and their distances can be compared to explain the machine's advantage. Friction means real machines are never perfectly efficient.`,
  "Technology and society": `Ask potential users to test a prototype and record where they struggle. Their feedback may reveal access or maintenance needs missing from the original design.`,
  "Integrated investigation": `A conclusion should not claim more than the investigation measured. Describe uncertainty and propose a next test that would check the explanation more directly.`,
  "Parts of a Flowering Plant": `Use a real specimen when available and label the structures you can observe. Explain how leaves, roots and stems support the whole plant.`,
  "Air and Water": `A safe test can compare evaporation or filtration, but these processes do not remove every possible contaminant. Treat unknown samples as unsafe.`,
  "Communication Technology": `Use a trusted channel for emergencies and verify important instructions by a second reliable source. Protect passwords and private conversations.`,
  "Materials and Their Properties": `Compare materials under the same test conditions and return reusable samples to storage. Dispose of damaged or unknown materials as instructed.`,
  "Personal Hygiene and First Aid": `Wash hands after giving assistance and report the incident to the teacher. First aid continues only within the helper's training.`,
  "Common Diseases and Prevention": `Prevention can also include ventilation, vaccination and staying home when ill, according to health guidance. No single action prevents every disease.`,
  "Drug Use and Abuse": `If a friend is at immediate risk, get adult and medical help quickly. Do not promise secrecy when someone's safety is at stake.`,
};

const jss1Aliases = {
  "Living and Non-Living Things": "Cells and living things",
  "The Cell": "Cells and living things",
  "Classification of Living Things": "Classification",
  "Food and Nutrition": "Nutrition",
  "The Digestive System": "Human body systems",
  "Breathing and Respiration": "Human body systems",
  "Ecosystems and Food Chains": "Ecosystems",
  "Environmental Pollution and Conservation": "Pollution",
  "Matter and Its States": "Matter and particles",
  "Changes of State and Types of Change": "Physical and chemical changes",
  "Elements, Compounds and Mixtures": "Elements and compounds",
  "Separation of Mixtures": "Mixtures and separation",
  "Forms and Sources of Energy": "Work, energy and power",
  "Heat and Temperature": "Heat transfer",
  "Forces and Motion": "Force and motion",
  "Simple Machines": "Simple machines",
  "Meaning and Importance of Technology": "Technology and society",
  "Tools and Workshop Safety": "Laboratory safety",
  "Introduction to Electricity": "Electricity",
  Magnetism: "Magnetism",
};

const jss1Additions = {
  "Parts of a Flowering Plant": `A flowering plant has roots, stems, leaves and reproductive structures. Roots anchor the plant and absorb water and mineral ions; the stem supports leaves and transports materials; leaves capture light for photosynthesis. A flower contains structures that support pollination and seed formation. Use a labelled specimen drawing to connect each visible part with its function. Plants vary, so compare two specimens and note differences rather than assuming every leaf or flower has the same shape.`,
  "Air and Water": `Air is a mixture of gases, mainly nitrogen and oxygen, with smaller amounts of other gases and variable water vapour. Water can dissolve gases and minerals, so clear water is not necessarily pure or safe to drink. The atmosphere supplies oxygen for respiration and carbon dioxide for photosynthesis, while water moves through the environment in the water cycle. Use safe, teacher-approved tests to compare samples and record their source. Never taste unknown water or use appearance alone to decide whether it is safe.`,
  "Communication Technology": `Communication technology transfers information between people or devices. A telephone converts sound into signals that travel through a wired or wireless network; a radio broadcasts information to receivers, and internet services can carry text, audio and images. Access depends on electricity, equipment, network coverage and cost. Consider both benefits, such as rapid communication during emergencies, and risks, such as false information or loss of privacy. Check the source before sharing a message and protect personal details when using connected devices.`,
  "Materials and Their Properties": `Materials are selected for properties such as strength, flexibility, hardness, conductivity and resistance to water or heat. A metal may conduct electricity well, while rubber can insulate a wire. Test one property at a time using safe samples and a consistent method. The intended use matters: a material suitable for a cooking pot may not be suitable for an electrical handle. Reuse and disposal also affect environmental impact. Record observations rather than assuming a material's properties from its colour or name.`,
  "Personal Hygiene and First Aid": `Personal hygiene includes handwashing with soap, clean clothing, safe food handling and care of shared spaces. These practices can reduce the spread of some infections, but access to clean water and supplies matters. First aid is immediate help while qualified assistance is arranged. Check that the area is safe, tell a responsible adult and follow training; do not move someone with a suspected serious injury unless there is immediate danger. Do not give food or drink to an unconscious person.`,
  "Common Diseases and Prevention": `Diseases have different causes and routes of transmission. Some infections spread through contaminated water, some through droplets and others through vectors such as mosquitoes. Prevention should match the route: sanitation and safe water can reduce waterborne transmission, while reducing mosquito exposure addresses a vector. Vaccination and treatment guidance should come from qualified health services. A symptom alone does not identify a disease, and learners should not diagnose classmates. Encourage respectful support for anyone who is unwell and seek adult or professional help when needed.`,
  "Drug Use and Abuse": `Medicines can help when used for the right person and purpose under reliable instructions, but taking an unknown substance or sharing prescription medicine can be dangerous. Alcohol, tobacco and other drugs can affect judgement, coordination and health. Refuse pressure to try an unknown substance, move to a safer place and tell a trusted adult. If someone may have taken a harmful substance, seek urgent medical help rather than waiting for symptoms. Health discussions should use accurate information and avoid shaming people who need support.`,
};

const supplementalNotes = {
  Measurement: `For repeated measurements, keep the same starting point and observer where possible. Record the raw values before calculating a mean so the spread remains visible.`,
  Classification: `If a feature is hidden or damaged, record that limitation and use another reliable characteristic. Do not force a specimen into a category without evidence.`,
  Nutrition: `For a class comparison, use fictional meal examples and avoid collecting private health details. Explain the nutrient role instead of judging a person's food.`,
  Reproduction: `A labelled sequence can distinguish pollination, fertilisation and seed development. Each term names a different event, so order is important.`,
  "Elements and compounds": `A chemical change can form a compound, but simply mixing two elements does not guarantee a reaction. Evidence is needed to show a new substance formed.`,
  "Heat transfer": `A metal spoon warms by conduction from hot liquid, while moving warm air transfers energy by convection. Identify the material and moving fluid.`,
  Electricity: `In a parallel circuit, each branch has a complete path across the source. A break in one branch does not always stop current elsewhere.`,
  Magnetism: `A magnetic material can be attracted to a magnet without itself being a permanent magnet. Test whether it retains magnetism after the field is removed.`,
  "Weather and climate": `Use a series of observations for a climate comparison and note missing days. A short gap can distort averages if unusual weather occurred.`,
  "Water cycle": `Plants return water vapour through transpiration, and this process links vegetation to the atmosphere. It is not the same as evaporation from open water.`,
  Ecosystems: `A change to habitat can affect food, shelter and breeding sites at once. Explain which factor is most relevant to the organism being studied.`,
  Pollution: `Different pollutants require different controls: a filter may capture particles, while dissolved chemicals may need treatment. Identify the substance before proposing a method.`,
  Conservation: `A local action should include a responsible person, schedule and follow-up measure. Without these, it is difficult to know whether the activity helped.`,
  "Simple machines": `A lever's position of the pivot changes the effort needed. Draw the load, effort and pivot before deciding which arrangement gives mechanical advantage.`,
  "Integrated investigation": `Keep a notebook of changes to the method. If equipment or conditions change, explain whether the affected measurements can still be compared fairly.`,
};

const curriculum = JSON.parse(await fs.readFile(file, "utf8"));
const failures = [];
let courses = 0;
let lessons = 0;
let minimumWords = Number.POSITIVE_INFINITY;

for (const course of curriculum.courses ?? []) {
  if (!courseIds.has(course.id)) continue;
  courses += 1;
  for (const module of course.modules ?? []) {
    for (const lesson of module.lessons ?? []) {
      const alias = jss1Aliases[lesson.title];
      const addition = additions[lesson.title] ?? jss1Additions[lesson.title] ?? additions[alias];
      if (!addition) {
        failures.push(`${course.id}/${lesson.id}: missing authored topic ${lesson.title}`);
        continue;
      }

      let content = String(lesson.content ?? "").trim();
      if (!content.includes(addition)) content = `${content}\n\n${addition}`;
      const followUp = followUps[lesson.title] ?? followUps[alias];
      if (!followUp) {
        failures.push(`${course.id}/${lesson.id}: missing follow-up ${lesson.title}`);
        continue;
      }
      if (!content.includes(followUp)) content = `${content}\n\n${followUp}`;
      const supplemental = supplementalNotes[lesson.title] ?? supplementalNotes[alias];
      if (supplemental && !content.includes(supplemental)) content = `${content}\n\n${supplemental}`;
      lesson.content = content;
      lesson.contentVersion = "textbook-basic-science-depth-1";
      lesson.summary = content.replace(/^#\s+.+\n+/, "").replace(/\s+/g, " ").trim().slice(0, 320);
      const words = (content.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []).length;
      minimumWords = Math.min(minimumWords, words);
      if (words < 200) failures.push(`${course.id}/${lesson.id}: ${words} words`);
      lessons += 1;
    }
  }
}

if (courses !== 3 || lessons !== 81 || failures.length) {
  throw new Error(JSON.stringify({ courses, lessons, expectedCourses: 3, expectedLessons: 81, minimumWords, failures: failures.slice(0, 40) }));
}

if (applyChanges) await fs.writeFile(file, `${JSON.stringify(curriculum, null, 2)}\n`, "utf8");

console.log(JSON.stringify({ mode: applyChanges ? "apply" : "dry-run", courses, lessons, topics: Object.keys(additions).length, jss1Topics: Object.keys(jss1Aliases).length + Object.keys(jss1Additions).length, minimumWords }, null, 2));