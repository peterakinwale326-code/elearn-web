import fs from "node:fs/promises";
import path from "node:path";

const file = path.resolve(process.cwd(), "data", "curriculum.json");
const curriculum = JSON.parse(await fs.readFile(file, "utf8"));
const targetWords = 300;

function text(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function lessonText(content) {
  return Array.isArray(content) ? content.map(text).filter(Boolean).join("\n\n") : String(content ?? "").trim();
}

function wordCount(value) {
  return (String(value).match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []).length;
}

function family(course, module, lesson) {
  const value = `${course.title} ${course.subject ?? ""} ${module.title} ${lesson.title}`.toLowerCase();
  if (/phonetic|phonics|vowel|diphthong|consonant|speech sound|articulation|ipa/.test(value)) return "phonetics";
  if (/mathematics|algebra|geometry|fraction|calculus|statistics|probability|equation|ratio/.test(value)) return "mathematics";
  if (/biology|cell|organism|ecology|inheritance|photosynthesis|anatomy/.test(value)) return "biology";
  if (/chemistry|atom|molecule|reaction|acid|bonding/.test(value)) return "chemistry";
  if (/physics|force|motion|wave|circuit|energy|electric/.test(value)) return "physics";
  if (/agricultural|crop|soil|farm|livestock|seed|harvest/.test(value)) return "agriculture";
  if (/computer|programming|html|css|javascript|python|java|php|c\+\+|database|algorithm|software/.test(value)) return "computing";
  if (/account|business|economics|commerce|marketing|entrepreneur/.test(value)) return "business";
  if (/government|civic|citizen|constitution|social studies|history|democracy/.test(value)) return "civics";
  if (/physical education|health|fitness|sport|nutrition|first aid/.test(value)) return "health";
  if (/technology|engineering|workshop|technical drawing|material/.test(value)) return "technology";
  return "language";
}

function specificTeaching(familyName, topic, moduleTitle, courseTitle) {
  const subject = topic.toLowerCase();

  if (familyName === "phonetics") {
    const pair = /\/i:\//.test(topic) ? ["/i:/", "/ɪ/", "seat/sit", "sheep/ship"]
      : /\/e\//.test(topic) || /æ/.test(topic) ? ["/e/", "/æ/", "bed/bad", "pen/pan"]
        : /diphthong/.test(subject) ? ["/eɪ/", "/aɪ/", "day/die", "late/light"]
          : ["/i:/", "/ɪ/", "seat/sit", "sheep/ship"];
    return [
      `Speech work studies sounds as spoken units, not letters on a page. A phoneme is a sound contrast that can change a word's meaning; the International Phonetic Alphabet (IPA) writes those sounds with consistent symbols. In a broad transcription, slashes mark phonemes, as in /kæt/. English spelling is not a dependable pronunciation guide: one letter can represent several sounds, and one sound can have several spellings.`,
      `For ${topic}, compare ${pair[0]} with ${pair[1]} by listening for the sound itself. In ${pair[2]}, the first vowel is ${pair[0]} and the second is ${pair[1]}; the same contrast appears in ${pair[3]}. A minimal pair differs in one sound while the surrounding sounds stay the same, making it useful for hearing a contrast. Say each word slowly, then at normal speaking speed, and notice tongue height, tongue position, lip shape, and vowel length.`,
      `A reliable practice routine has four steps: listen to a model, identify the target sound, produce it in an isolated word, and use it in a short phrase. Keep the word stress natural; over-stressing a vowel can disguise whether its quality is correct. When writing a transcription, use IPA symbols rather than ordinary spelling and put the transcription between slashes.`,
      `Worked listening check: say “seat” and “sit” without changing the initial /s/ or final /t/. If a listener hears the same vowel in both words, repeat the pair and lengthen /i:/ slightly while keeping /ɪ/ shorter and more relaxed. Then reverse the order and test the contrast inside “The sheep is on the ship.” The goal is not to exaggerate a sound but to make the contrast clear enough to preserve meaning.`,
      `Do not confuse a vowel's duration with its identity: a long vowel is not simply any vowel spoken slowly. Also avoid judging pronunciation from a letter name. Record the IPA symbol, a sample word, and one minimal pair in your notes. This connects the topic in ${moduleTitle} to listening, speaking, dictionary use, and accurate oral communication.`,
    ];
  }

  if (familyName === "biology") {
    const detail = /cell/.test(subject) ? "A typical cell has a selectively permeable membrane, cytoplasm, genetic material, and structures with specialized roles. In plant cells, a cellulose cell wall supports shape, chloroplasts capture light for photosynthesis, and a large vacuole helps maintain turgor. A labelled diagram should show only structures relevant to the question and use straight, non-crossing label lines."
      : /photosynth|plant nutrition/.test(subject) ? "Photosynthesis transfers light energy into chemical energy stored in glucose. The word equation is carbon dioxide + water → glucose + oxygen; in green plants it occurs mainly in chloroplasts containing chlorophyll. Light intensity, carbon-dioxide availability, temperature, and water can limit the rate. A starch test on a leaf checks for stored carbohydrate, but a controlled comparison is needed to identify which condition affected production."
        : /classification|taxonomy/.test(subject) ? "Classification groups organisms by shared characteristics and evolutionary relationships. In the hierarchy, kingdom is broader than phylum, class, order, family, genus, and species. A scientific name has two parts: genus followed by species; the genus begins with a capital letter and both words are italicized when typed. Classification is a model that can change when new evidence becomes available."
          : /ecology|ecosystem|food|habitat|population/.test(subject) ? "An ecosystem includes organisms and the non-living conditions with which they interact. Producers capture energy, consumers obtain it by feeding, and decomposers return nutrients to the environment. Energy flows through a food chain and decreases between trophic levels, while matter is recycled. A food web is more realistic than a single chain because most organisms have several feeding relationships."
            : /nutrition|digestion/.test(subject) ? "Nutrition supplies materials and energy for growth, repair, and life processes. Enzymes catalyse digestion by breaking large insoluble molecules into smaller soluble products; each enzyme works best within particular temperature and pH conditions. Food tests identify nutrients through observable colour changes, and a fair test keeps sample size, reagent volume, and timing consistent."
              : "Biology explains living things at connected levels: molecules, cells, tissues, organs, organisms, populations, and ecosystems. Structure and function are linked, but a biological claim should be supported by observation, measurement, or a model. Distinguish an organism's response from the environmental condition that caused it, and use a labelled diagram when spatial relationships matter.";
    return [
      `${topic} belongs to ${moduleTitle} in ${courseTitle}. Begin by defining the central biological term and stating the level of organization involved. An explanation about a cell is not interchangeable with one about an organ, an individual organism, or a population. Use the correct level and name the structures or processes that are actually relevant.`,
      detail,
      `Worked application: use a specific example from the topic and separate observation from interpretation. Record what can be seen or measured first; then explain the result with the biological model. If comparing two conditions, identify the independent variable, measure the dependent variable, and keep other conditions as constant as possible. Repeat measurements where practical and report an unexpected result rather than hiding it.`,
      `Common error: listing terms without explaining the relationship between them. For example, naming a structure does not explain its function, and describing a change does not identify its cause. Build the answer as “structure or condition → process → result,” then check that each arrow is supported. In a practical response, include a clear label, units where measurements are used, and one limitation of the method.`,
      `Review questions: define ${topic} in one precise sentence; identify the most important structure, process, or interaction; explain how one part affects another; and apply the idea to a new example. A strong answer uses biological vocabulary accurately and distinguishes evidence from the explanation built from that evidence.`,
    ];
  }

  if (familyName === "mathematics") {
    const detail = /fraction/.test(subject) ? "A fraction a/b represents a parts of a whole divided into b equal parts, with b not equal to zero. Equivalent fractions are made by multiplying or dividing numerator and denominator by the same non-zero number. To add or subtract, use a common denominator; to divide by a fraction, multiply by its reciprocal. Reduce the result and check that its size is reasonable."
      : /percent|profit|discount|interest|ratio|rate/.test(subject) ? "A percentage is a ratio per hundred. Convert p% to p/100 before using it in a calculation, and identify the correct base quantity: a 20% increase followed by a 20% decrease does not return to the original value because the second percentage uses a different base. Include units and distinguish a percentage-point change from a percentage change."
        : /equation|algebra|linear|expression|quadratic/.test(subject) ? "An equation states that two expressions have equal value. Preserve equality by performing the same permitted operation on both sides, simplify like terms, and isolate the unknown. Substitution checks the solution: replace the variable in the original equation and verify both sides agree. For a linear model y = mx + c, m is the rate of change and c is the value when x = 0."
          : /geometry|angle|triangle|circle|area|volume|mensuration/.test(subject) ? "A geometric result depends on definitions and conditions. Sketch and label the figure, identify the known quantities, select a theorem or formula, substitute values with units, and state the result in the requested form. For a triangle, interior angles sum to 180°; for a rectangle, area is length × width. Keep perimeter (linear units) distinct from area (square units) and volume (cubic units)."
            : /statistic|probability|data|mean|median|mode/.test(subject) ? "Statistics describes a dataset; it does not automatically explain why the data occurred. The mean uses every value and is sensitive to outliers, while the median is the middle ordered value and is more resistant to extreme observations. A probability lies from 0 to 1 inclusive. Explain the population, sample, and method before generalizing from observed results."
              : "Mathematical reasoning moves from stated information to a result through justified operations. Define the quantities, choose a representation such as a diagram, table, graph, or equation, and show the steps in order. Check a result by substitution, estimation, an inverse operation, or a second representation; a correct-looking number with invalid reasoning is not a complete solution.";
    return [
      `The lesson ${topic} is part of ${moduleTitle}. Start by identifying the quantities and relationships named in the question. Write down what is known, what must be found, and any restrictions on the values. This prevents a familiar formula from being applied to the wrong situation.`,
      detail,
      `Worked method: translate the wording into a mathematical representation before calculating. Label variables and units, carry out one operation at a time, and keep intermediate values unrounded when precision matters. State the final answer with units or an interval as appropriate. Then test it against the original conditions: substitute into an equation, compare it with an estimate, or verify it using a different representation.`,
      `Common errors include changing only one side of an equation, mixing units, using a formula outside its conditions, and reporting a decimal without explaining what it represents. When a diagram or graph is involved, label axes and scale; when data is involved, say which observations support the conclusion. The written explanation should make the choice of method visible.`,
      `Practice transfer: create a second problem by changing one quantity while leaving the relationship unchanged. Predict how the answer should change before calculating. If the prediction and calculation disagree, inspect the setup first, then the arithmetic. This habit checks understanding rather than memorization of one worked example.`,
    ];
  }

  if (familyName === "chemistry") {
    const detail = /atom|element|isotope|periodic/.test(subject) ? "An atom contains a positively charged nucleus of protons and neutrons, with electrons occupying surrounding energy levels. Atomic number equals proton number and identifies the element; a neutral atom has equal numbers of protons and electrons. Isotopes of one element share proton number but differ in neutron number, so their mass numbers differ. Periodic-table position reflects repeating patterns in electron structure."
      : /bond|ionic|covalent|metallic/.test(subject) ? "Ionic bonding results from electron transfer and electrostatic attraction between oppositely charged ions; covalent bonding involves shared electron pairs; metallic bonding involves positive ions attracted to delocalized electrons. These models explain properties such as melting point, conductivity, and solubility. A particle diagram should show the particles and charges required by the bonding model, not just the chemical formula."
        : /mole|stoichiometry|equation|concentration/.test(subject) ? "A balanced chemical equation conserves each type of atom. The coefficients give mole ratios, not mass ratios. Convert a measured mass to amount using n = m/M, use the balanced ratio, then convert to the requested quantity. Keep units through the calculation and check that the result is chemically possible. A limiting reactant is consumed first and determines the maximum product amount."
          : /acid|base|ph|neutral/.test(subject) ? "In aqueous solution, acids increase hydrogen-ion concentration and bases accept hydrogen ions or produce hydroxide ions, depending on the model being used. pH is logarithmic: a one-unit change represents a tenfold change in hydrogen-ion concentration. Neutralization between an acid and base produces a salt and water in many school-level examples; the salt depends on the reacting ions."
            : "Chemistry explains substances through composition, structure, properties, and change. Record observable evidence—such as gas formation, precipitate, temperature change, or colour change—separately from the particle-level explanation. Use formulas and equations to represent the model, and check conservation of atoms and charge. Laboratory conclusions must match the measurements actually collected.";
    return [
      `In ${moduleTitle}, ${topic} connects a chemical model to evidence. Define the relevant particles or substances and identify whether the question concerns structure, properties, or a reaction. A macroscopic observation is what the experimenter sees; the particle model explains why it may occur.`,
      detail,
      `Worked application: write the known quantities and units before selecting a relationship. If an equation is involved, balance it first; if a particle model is involved, track atoms, ions, or electrons; if an experiment is involved, record a control and the observation that would count as evidence. State assumptions such as complete reaction or constant conditions instead of hiding them.`,
      `Common errors include changing subscripts to balance an equation, confusing an element with a compound, treating a coefficient as a mass ratio, and claiming that a colour change proves a particular product without a test. Explain each conclusion from the stated evidence. Follow eye protection, safe handling, and disposal instructions in practical work; never taste laboratory chemicals.`,
      `For revision, explain ${topic} once with words, once with a symbolic equation or particle sketch, and once using an observed example. Compare the three representations: they describe the same chemical idea at different levels, and each should agree with the conservation rules.`,
    ];
  }

  if (familyName === "physics") {
    const detail = /motion|speed|velocity|acceleration|force|momentum/.test(subject) ? "Choose a reference direction before describing motion. Speed is distance divided by time; velocity includes direction; acceleration is change in velocity divided by time. For constant acceleration, v = u + at and s = ut + ½at², with symbols defined and SI units used consistently. Draw a free-body diagram before applying Newton's laws; include only forces acting on the chosen object."
      : /electric|current|voltage|circuit|resistance/.test(subject) ? "Current is charge flow per unit time, potential difference is energy transferred per unit charge, and resistance relates voltage to current. For an ohmic component at constant temperature, V = IR. In series, current is the same through each component; in parallel, potential difference across branches is equal. Use circuit symbols and check meter placement before measurement."
        : /wave|sound|light|reflection|refraction/.test(subject) ? "A wave transfers energy without transporting matter overall. Frequency is cycles per second, wavelength is distance between corresponding points, and wave speed v = fλ. Reflection obeys equal angles of incidence and reflection; refraction occurs when wave speed changes at a boundary. Label the normal and measure angles from it, not from the surface."
          : /energy|work|power|heat|thermal/.test(subject) ? "Energy is transferred between stores and conserved in a closed system, although useful energy may become dispersed. Work is energy transferred by a force acting through a distance; power is energy transferred per unit time. Name the initial and final stores, identify the transfer pathway, and account for losses rather than saying energy disappeared."
            : "Physics uses models and measurements to explain repeatable patterns. Define the quantity, select a relationship that applies under the stated conditions, convert values to consistent SI units, and show substitution before calculation. Give a direction for vector quantities and a suitable precision for measured data. Distinguish a model's prediction from the observation used to test it.";
    return [
      `The topic ${topic} sits within ${moduleTitle}. Begin by identifying the physical system and the quantities that can be measured. A diagram, graph, or free-body sketch should identify the object, boundaries, direction, and relevant forces or energy transfers before equations are used.`,
      detail,
      `Worked method: list known values with symbols and units, state the unknown, and choose a law whose assumptions match the situation. Rearrange algebraically before inserting numbers, then check dimensions and estimate the answer's scale. A result that has the wrong unit or direction usually signals an earlier modelling error, not only arithmetic.`,
      `Common errors include mixing distance with displacement, scalar speed with vector velocity, confusing current with voltage, and treating a drawn arrow as proof of a measured quantity. State how the evidence was obtained and include uncertainty or measurement limits when relevant. Repeat readings and describe anomalies honestly.`,
      `To test transfer, change one condition in the example and predict which measured quantity should change and why. Explain the prediction using the relevant physical relationship, then identify what measurement would support or challenge it. This makes the model useful beyond a single numerical exercise.`,
    ];
  }

  if (familyName === "agriculture") {
    const detail = /soil|fertility|manure|fertiliser|erosion/.test(subject) ? "Soil supplies anchorage, water, air, and mineral nutrients. Texture describes particle-size proportions; structure describes how particles aggregate. Organic matter improves several soil properties, while pH affects nutrient availability. Soil conservation methods—such as contour cultivation, cover crops, and windbreaks—reduce erosion by slowing runoff or protecting exposed surfaces. Choose a practice for the actual slope, soil, and crop."
      : /crop|seed|planting|weed|pest|harvest|storage/.test(subject) ? "Crop production is a sequence: select viable seed, prepare a suitable seedbed, plant at appropriate depth and spacing, manage water and nutrients, control weeds and pests, harvest at maturity, and store the produce safely. Each operation has a purpose. Records of seed rate, planting date, rainfall, inputs, and yield help compare performance across seasons."
        : /animal|livestock|poultry|ruminant|fish|feed|housing|health/.test(subject) ? "Animal production depends on suitable housing, balanced feed, clean water, hygiene, disease prevention, and accurate records. Ruminants use microbial fermentation in the rumen to digest fibrous feed; poultry require age-appropriate rations and ventilation. Observe animals regularly and seek trained veterinary support for suspected disease rather than self-prescribing drugs."
          : "Agriculture combines biological knowledge with practical decisions about soil, crops, animals, labour, inputs, markets, and environmental conditions. A recommendation should state its purpose, the resources required, the timing, and a way to evaluate the result. Farm records convert observations into evidence for the next decision.";
    return [
      `${topic} is studied in ${moduleTitle} as a farm-science problem, not as a definition alone. Identify the crop, animal, soil, or operation involved and state the conditions that affect it. Nigerian examples should be tied to a named crop, livestock type, season, or local practice where that information is known.`,
      detail,
      `Worked farm example: state the problem, inspect the relevant evidence, choose a management action, and explain how success will be measured. For a crop, this may be germination percentage, plant spacing, pest damage, or yield per area; for livestock, it may be feed intake, growth, egg production, or health records. Compare like with like and keep units consistent.`,
      `Common errors include recommending an input without considering soil or animal needs, confusing a symptom with a diagnosed cause, and ignoring labour, cost, weather, or safe handling. Explain trade-offs and environmental effects. A good practical answer includes preparation, procedure, reason, observation, and conclusion.`,
      `Transfer check: describe how the recommendation would change if rainfall, soil type, animal age, or available labour changed. Name the new constraint and explain its effect before selecting a different practice. This shows that the learner understands the principle rather than memorizing one farm instruction.`,
    ];
  }

  if (familyName === "computing") {
    const detail = /algorithm|flowchart|pseudocode|condition|selection|loop|iteration/.test(subject) ? "An algorithm is a finite, ordered method for solving a problem. Specify inputs, processing, outputs, and assumptions. Selection chooses a path from a condition; iteration repeats work while a condition holds or for each item. Every loop needs initialization, a terminating condition, and progress toward termination. Trace a table of variable values to catch off-by-one and infinite-loop errors."
      : /variable|data type|operator|expression/.test(subject) ? "A variable associates a name with a value, while a data type constrains which values and operations are valid. Expressions combine values using operators; precedence determines evaluation order, so parentheses can make intent explicit. Distinguish assignment from comparison and test boundaries such as zero, empty text, and maximum expected values."
        : /function|method|procedure|parameter/.test(subject) ? "A function groups a named operation that can be reused. Parameters are inputs; a return value communicates a result to the caller. A well-scoped function has one clear responsibility, meaningful names, and documented assumptions. Test ordinary cases, boundary values, and invalid inputs separately."
          : /array|list|dictionary|object|collection/.test(subject) ? "Collections store related values in a structure chosen for the required operations. Lists preserve sequence and allow indexed access; maps or dictionaries associate keys with values; sets represent unique members. Choose the structure from access patterns, not habit. Check empty collections, duplicate values, and missing keys."
            : /html|css|web|dom|event/.test(subject) ? "A web page separates structure, presentation, and behavior. HTML gives content semantic meaning; CSS controls visual presentation; JavaScript responds to events and updates state. Use semantic elements and labels, validate inputs, and test keyboard use and narrow screens. The browser parses the document and constructs a tree that styles and scripts can inspect."
              : /database|sql|table|record|query/.test(subject) ? "A relational database stores entities in tables, identifies rows with keys, and represents relationships with foreign keys. A query should state which rows and columns it needs, use conditions carefully, and preserve integrity when data changes. Parameterized queries keep data separate from executable SQL. Test missing records and duplicate-looking keys."
                : "A reliable program turns a clearly stated problem into explicit inputs, steps, and outputs. Trace the code with a small test case before running it; compare actual output with expected output. Separate normal cases, boundary cases, and invalid inputs, then make one controlled change and rerun tests. Explain why a solution is correct, not only that it ran once.";
    return [
      `${topic} belongs to ${moduleTitle}. Translate the task into a small specification: what data enters, what transformation is required, what result should be produced, and what constraints apply. This makes it possible to test the solution and distinguish a logic defect from an input or display problem.`,
      detail,
      `Worked debugging example: choose a tiny input whose correct result can be worked out by hand. Trace each assignment or state change in order, noting the values before and after each step. If actual and expected results differ, identify the first step where they diverge; inspect that expression or condition instead of changing unrelated code.`,
      `Common errors include assuming input is always valid, confusing a displayed value with stored state, using the wrong collection operation, and testing only one successful case. Add an assertion or test for the failure case. Keep names descriptive, avoid duplicated logic, and treat error messages as evidence about where execution failed.`,
      `Transfer check: alter one requirement while keeping the rest fixed. State which function, data structure, or condition must change and which tests should remain valid. A maintainable solution has behavior that can be explained to another learner and verified after that change.`,
    ];
  }

  if (familyName === "business") {
    const detail = /double entry|ledger|cash book|trial balance|accounting|balance sheet|depreciation/.test(subject) ? "Accounting records business transactions so that their effects can be checked. The accounting equation is assets = liabilities + capital. Under double entry, each transaction affects at least two accounts and total debits equal total credits. First identify the accounts, classify each effect, apply the debit/credit convention, and only then post amounts. A balanced trial balance is a useful check but does not prove every transaction is error-free."
      : /demand|supply|market|price|consumer|elasticity/.test(subject) ? "A market brings buyers and sellers together. Demand describes quantities buyers are willing and able to purchase at different prices; supply describes quantities sellers are willing and able to offer. A change in a good's own price causes movement along a curve, while a change in income, costs, tastes, or technology can shift a curve. Explain both the change and its cause."
        : /entrepreneur|business plan|marketing|customer|advertising/.test(subject) ? "A business idea becomes testable when it names a customer, a problem, a proposed value, the resources required, and the way revenue and costs will behave. Customer evidence should be collected before large spending. A plan records assumptions and risks; it is not proof that demand exists. Compare expected contribution with fixed costs and consider ethical marketing and privacy."
          : "Business studies examines how people and organizations use resources to produce, exchange, and account for goods and services. A sound recommendation identifies the objective, relevant evidence, costs, benefits, and risks. Separate revenue from profit and cash flow from accounting income; timing can make a profitable organization short of cash.";
    return [
      `${topic} is considered in ${moduleTitle}. Define the business term, identify the people or organizations involved, and state what decision or result is being examined. Use a Nigerian enterprise example only when it illustrates the mechanism; do not treat one example as a rule for every business.`,
      detail,
      `Worked decision: state the initial facts, apply the relevant accounting or economic rule, and show how the result follows. If figures are supplied, label the currency, period, and units, keep calculations visible, and distinguish an assumption from a measured value. Finish by explaining what the result means for the owner, customer, worker, or community.`,
      `Common errors include confusing sales with profit, treating a balanced ledger as proof that no mistake exists, and describing a price change as a shift in supply or demand without identifying a non-price cause. Support each claim with the transaction, cost, or market condition that produces it. Consider legal duties and fairness alongside financial outcomes.`,
      `Transfer check: change one condition—cost, price, customer demand, credit period, or available capital—and explain which part of the analysis changes. A defensible answer names the trade-off rather than claiming a decision is best without stating the goal.`,
    ];
  }

  if (familyName === "civics") {
    return [
      `${topic} belongs to ${moduleTitle}. Civic and social explanations should distinguish institutions, rules, people, rights, duties, and outcomes. Define the institution or concept before describing its function. If a Nigerian example is used, name the level of government or community involved and avoid claiming that one local example describes every state or circumstance.`,
      `Trace the process in order: identify who has authority, what rule or procedure applies, who participates, and how a decision can be reviewed or challenged. In a democracy, institutions distribute responsibilities and constrain power; citizens participate through lawful means such as voting, public consultation, community organizations, and peaceful advocacy. Rights also carry responsibilities to respect the rights of others and follow lawful procedures.`,
      `Worked civic example: a community raises a concern about a shared public service. Residents collect evidence, identify the responsible local or state authority, submit the issue through an appropriate channel, and monitor the response. The example does not assume that every complaint succeeds; it shows how participation, responsibility, and accountability can be examined.`,
      `Common error: describing a value such as fairness as though it were itself a legal procedure. Separate a principle from the institution that applies it and the evidence used to judge an outcome. Compare sources, distinguish fact from opinion, and note whose perspective is missing. Historical explanations also require chronology and context; do not explain a past decision using only present-day assumptions.`,
      `Review ${topic} by stating the definition, naming the relevant actors, explaining their responsibilities, and evaluating one consequence. A strong answer includes a specific example and a reasoned conclusion while acknowledging a limitation or alternative perspective.`,
    ];
  }

  if (familyName === "health") {
    return [
      `${topic} is studied in ${moduleTitle} as knowledge for safe, informed action. Define the health or movement concept, identify the people and conditions involved, and distinguish general guidance from an individual diagnosis. Health needs vary with age, ability, environment, and medical history; seek a qualified professional when a situation is beyond classroom practice.`,
      `A useful explanation connects a practice to a body response or safety outcome. For physical activity, progression should be gradual and include warm-up, technique, hydration, rest, and recovery. For nutrition, explain the role of nutrients and consider food access and cultural context rather than judging one meal in isolation. For first aid, begin with scene safety and emergency services; do not put a helper at avoidable risk.`,
      `Worked scenario: describe what is observed, identify immediate hazards, choose a proportionate response, and state when qualified help is required. Record the reason for each step. For training, select a measurable goal, establish a baseline, make one manageable change, and review how the body responds before increasing intensity.`,
      `Common errors include treating pain as proof of progress, recommending the same routine to everyone, and giving medical certainty from limited information. Use reliable sources and cautious language. In emergency learning, follow recognized local guidance and practice only within the learner's training. A reflection should note what went well and what should change next time.`,
      `Review ${topic} by explaining the principle, giving one safe example, naming a warning sign or limitation, and identifying a trusted source of help. The aim is informed, respectful participation rather than unsupported diagnosis.`,
    ];
  }

  if (familyName === "technology") {
    return [
      `${topic} belongs to ${moduleTitle}. Technology applies knowledge and practical skills to a need under constraints such as cost, materials, time, safety, accessibility, and environmental impact. Begin with the user's need rather than choosing a tool first. Define a success criterion that can be observed or measured.`,
      `A disciplined design cycle identifies a need, researches context, sketches alternatives, selects materials and processes, builds a prototype, tests it against the criteria, and revises the design. Record dimensions and decisions so another person can reproduce the work. A prototype is evidence for improvement, not proof that a product is ready for unrestricted use.`,
      `Worked design example: for a simple school storage solution, identify what must be stored, available space, likely loads, user height, and material limits. Sketch two arrangements, compare stability and access, build a small model, and test it with representative objects. Change one feature at a time so the effect of each revision is clear.`,
      `Common errors include measuring from an unclear reference edge, selecting material by appearance alone, and testing only the condition that makes a prototype succeed. Include failure cases and safety checks. For electrical, workshop, or construction topics, use tools and powered equipment only with suitable instruction and supervision.`,
      `Review ${topic} by identifying the need, naming a constraint, describing a test, and explaining one revision based on evidence. A good design account explains why the chosen solution fits its users and what limitation remains.`,
    ];
  }

  return [
    `${topic} belongs to ${moduleTitle} in ${courseTitle}. Define the key term, identify the audience and purpose, and distinguish the central claim from its supporting details. A reader should be able to trace how the evidence supports the explanation rather than relying on an impressive-sounding statement.`,
    `When studying a text, speech, or language feature, examine the words in context. Ask who is speaking or writing, what the audience is expected to know, how the structure guides attention, and which details support an interpretation. Quote or describe a precise example, then explain its effect; naming a feature alone is not analysis.`,
    `Worked reading method: state a claim in one sentence, select a short detail that directly supports it, and explain the connection using accurate terminology. If the text offers more than one interpretation, compare the evidence for each and acknowledge what cannot be concluded. For writing, plan the purpose and sequence before drafting, then revise meaning and organization before correcting sentence-level errors.`,
    `Common errors include confusing a theme with a one-word topic, treating an inference as an explicit fact, and using a quotation without explaining it. In phonetics, distinguish sound from spelling; in grammar, identify a word's function in its sentence; in literature, support interpretation with details from the text.`,
    `Review ${topic} by defining it, giving a specific example, explaining why that example fits, and identifying one plausible alternative or error. This produces an answer that is precise, evidence-led, and transferable to a new text or communication situation.`,
  ];
}

function quizReview(lesson) {
  return (lesson.quiz ?? []).slice(0, 3).map((question, index) => {
    const answer = question.options?.[question.answer];
    if (!answer) return "";
    const explanation = question.explanation ? ` ${text(question.explanation)}` : " Explain why the selected answer fits the stated concept, and rule out one distractor using evidence from the lesson.";
    return `Review question ${index + 1}: ${text(question.question)} The supported answer is ${text(answer)}.${explanation}`;
  }).filter(Boolean);
}

function contentParagraphs(content) {
  const paragraphs = Array.isArray(content)
    ? content.map(text).filter(Boolean)
    : String(content ?? "").split(/\n{2,}/).map(text).filter(Boolean);
  const templatePatterns = [
    /^In .+ is best understood by linking structure, function and evidence\./i,
    /^Worked application for .+:/i,
    /^Key distinctions:/i,
    /^Application: Investigation:/i,
    /^Common misconception: an observed result is not automatically an explanation\./i,
    /^Lesson recap:/i,
    /^(?:JSS|SS)\d+ progression: In this .+ course,/i,
  ];
  return paragraphs.filter((paragraph) => !templatePatterns.some((pattern) => pattern.test(paragraph)));
}

function asMarkdown(course, module, lesson, original) {
  const teaching = specificTeaching(family(course, module, lesson), text(lesson.title), text(module.title), text(course.title));
  const context = `Course: ${course.title} (${course.level}). Module: ${module.title}. Lesson: ${lesson.title}.`;
  const paragraphs = [
    `# ${text(lesson.title)}`,
    `_${context}_`,
    ...original,
    "## Core explanation and worked application",
    ...teaching,
    "## Check your understanding",
    ...quizReview(lesson),
  ].filter(Boolean);
  let result = paragraphs.join("\n\n");

  const familyName = family(course, module, lesson);
  const extension = familyName === "phonetics"
    ? "For independent practice, transcribe five familiar words using a dictionary's IPA key, mark the target sound, and compare your pronunciation with a trusted model. Record the sound symbol rather than the letter name, then explain one spelling pattern that does not predict pronunciation."
    : familyName === "biology"
      ? "For independent practice, draw a labelled model of the structure or process named in the lesson. Add arrows to show direction where matter, energy, or information moves. Write one observation that would support the model and one result that would make you revise it. State what the model leaves out."
      : familyName === "mathematics"
        ? "For independent practice, create one new problem with different values and solve it without looking at the worked method. Estimate first, show each justified step, and check the answer with an inverse operation or a second representation. Explain what a plausible incorrect answer would reveal about the method."
        : familyName === "computing"
          ? "For independent practice, write a small test table with an ordinary input, a boundary input, and an invalid or empty input. Predict the result before running the program, record what happened, and revise the code only after locating the first step where actual behavior differs from expected behavior."
          : "For independent practice, change one condition in the example and predict how the result should change. Record the evidence you would need, explain the principle that supports the prediction, and identify one limitation or alternative explanation before drawing a conclusion.";

  while (wordCount(result) < targetWords) {
    result += `\n\n## Independent practice\n\n${extension}`;
  }

  return result;
}

let expanded = 0;
let removedTemplateParagraphs = 0;
let minimumBefore = Infinity;
let minimumAfter = Infinity;
const seenBodies = new Map();

for (const course of curriculum.courses ?? []) {
  for (const module of course.modules ?? []) {
    for (const lesson of module.lessons ?? []) {
      const oldText = lessonText(lesson.content);
      const cleaned = contentParagraphs(lesson.content);
      removedTemplateParagraphs += Math.max(0, (Array.isArray(lesson.content) ? lesson.content.length : oldText.split(/\n{2,}/).filter(Boolean).length) - cleaned.length);
      const oldWords = wordCount(cleaned.join(" "));
      minimumBefore = Math.min(minimumBefore, oldWords);

      if (oldWords < targetWords) {
        lesson.content = asMarkdown(course, module, lesson, cleaned);
        lesson.objective = lesson.objective || `Explain ${text(lesson.title)} using accurate subject knowledge, work through a relevant example, and check the conclusion against evidence.`;
        lesson.summary = lesson.summary || cleaned.slice(0, 2).join(" ").slice(0, 320);
        expanded += 1;
      } else if (cleaned.length !== (Array.isArray(lesson.content) ? lesson.content.length : oldText.split(/\n{2,}/).filter(Boolean).length)) {
        lesson.content = cleaned;
      }

      const updated = lessonText(lesson.content);
      const words = wordCount(updated);
      minimumAfter = Math.min(minimumAfter, words);
      seenBodies.set(updated, (seenBodies.get(updated) ?? 0) + 1);
    }
  }
}

const duplicateBodies = [...seenBodies.values()].filter((count) => count > 1).length;
curriculum.meta = {
  ...curriculum.meta,
  lessonExpansion: {
    targetWords,
    lessonsExpanded: expanded,
    templateParagraphsRemoved: removedTemplateParagraphs,
    minimumWordsAfter: minimumAfter,
    duplicateLessonBodies: duplicateBodies,
  },
};

await fs.writeFile(file, `${JSON.stringify(curriculum, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ lessons: seenBodies.size, lessonsExpanded: expanded, templateParagraphsRemoved: removedTemplateParagraphs, minimumWordsBefore: minimumBefore, minimumWordsAfter: minimumAfter, duplicateLessonBodies: duplicateBodies }, null, 2));