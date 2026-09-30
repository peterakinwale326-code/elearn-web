const subjects = {
  Science: {
    source: "NASA STEM learning resources",
    url: "https://www.nasa.gov/learning-resources/",
    principle: "Separate the question, the evidence, and the explanation; a scientific model is useful when it predicts an observable result.",
    tracks: [
      ["Biology: Cells, Genes, and Inheritance", "Beginner", ["Cell theory, microscopy, and biological scale", "Membranes, diffusion, osmosis, and active transport", "DNA, genes, protein synthesis, and cell specialization", "Mitosis, meiosis, and inheritance patterns", "Variation, natural selection, and population change"]],
      ["Ecology and Conservation", "Intermediate", ["Energy transfer through food webs", "Population growth, limiting factors, and carrying capacity", "Competition, symbiosis, and community structure", "Biodiversity, habitat change, and ecosystem services", "Conservation decisions using evidence and trade-offs"]],
      ["Chemistry: Atoms and Periodic Patterns", "Beginner", ["Atomic structure, isotopes, and ions", "Periodic trends and valence electrons", "Ionic, covalent, and metallic bonding", "Molecular shape, polarity, and intermolecular forces", "States of matter and particle-level explanations"]],
      ["Chemistry: Reactions and Quantitative Models", "Intermediate", ["Reaction evidence and symbolic equations", "Conservation of atoms and equation balancing", "Moles, molar mass, and particle counting", "Limiting reactants, yield, and reaction efficiency", "Acids, bases, and equilibrium in aqueous systems"]],
      ["Physics: Motion, Forces, and Momentum", "Beginner", ["Position, displacement, speed, and velocity", "Motion graphs and constant acceleration", "Newton's laws and free-body diagrams", "Friction, circular motion, and gravitational interaction", "Momentum, impulse, and collision models"]],
      ["Physics: Waves, Circuits, and Energy", "Intermediate", ["Energy stores, transfers, and conservation", "Wave properties, superposition, and sound", "Electric charge, current, voltage, and resistance", "Series and parallel circuits with measured quantities", "Electromagnetic waves and information transfer"]],
      ["Earth and Space Systems", "Advanced", ["Earth materials, plate motion, and geologic time", "Atmosphere, oceans, weather, and climate patterns", "Moon phases, seasons, and orbital geometry", "Stars, spectra, stellar life cycles, and distance", "Earth observation and evidence from space missions"]],
    ],
  },
  Mathematics: {
    source: "OpenStax mathematics subject collection",
    url: "https://openstax.org/subjects/math",
    principle: "A sound mathematical argument preserves the stated quantities, shows why each operation is valid, and checks the result in another representation.",
    tracks: [
      ["Number Sense, Ratios, and Proportional Reasoning", "Beginner", ["Integers, absolute value, and rational number order", "Fraction operations and equivalent representations", "Ratios, rates, unit analysis, and scale factors", "Percent change, discounts, tax, and compound growth", "Estimation, precision, and reasonableness checks"]],
      ["Algebra I: Linear Models", "Beginner", ["Variables, expressions, and equivalent forms", "One-variable equations and inequality intervals", "Slope, intercepts, and linear graphs", "Systems of equations and intersection meaning", "Linear models from tables, stories, and data"]],
      ["Geometry: Proof and Construction", "Intermediate", ["Definitions, constructions, and logical statements", "Angle relationships and parallel-line reasoning", "Triangle congruence and proof structure", "Similarity, scale, and indirect measurement", "Circles, arcs, area, and geometric justification"]],
      ["Algebra II: Functions and Polynomials", "Intermediate", ["Function notation, domain, range, and inverses", "Polynomial operations and factor structure", "Quadratic models, roots, and completing the square", "Exponential and logarithmic relationships", "Sequences, recursive rules, and long-term behavior"]],
      ["Statistics and Probability", "Intermediate", ["Sampling plans, bias, and study design", "Distributions, center, spread, and outliers", "Probability rules and conditional events", "Confidence intervals and interpreting uncertainty", "Correlation, regression, and responsible conclusions"]],
      ["Trigonometry: Triangles and Periodic Models", "Advanced", ["Radians, unit-circle coordinates, and reference angles", "Sine, cosine, tangent, and graph transformations", "Trigonometric identities and equivalent expressions", "Right-triangle models, bearings, and measurement", "Periodic signals, phase, and real-world cycles"]],
      ["Calculus: Change and Accumulation", "Advanced", ["Limits, continuity, and local behavior", "Derivative definition and rate-of-change meaning", "Derivative rules and function analysis", "Definite integrals, area, and accumulation", "Differential models and the fundamental theorem"]],
    ],
  },
  English: {
    source: "Purdue Online Writing Lab",
    url: "https://owl.purdue.edu/owl/general_writing/index.html",
    principle: "Strong communication makes a clear claim for a real audience, supports it with relevant evidence, and revises wording so the reasoning is easy to follow.",
    tracks: [
      ["Reading Craft and Comprehension", "Beginner", ["Previewing structure and setting a reading purpose", "Main ideas, supporting details, and summaries", "Inference, evidence, and textual clues", "Vocabulary from context, roots, and word families", "Comparing accounts and evaluating comprehension"]],
      ["Argumentative Writing and Rhetoric", "Intermediate", ["Claims, reasons, evidence, and warrants", "Audience, purpose, and rhetorical situation", "Counterarguments, concessions, and rebuttals", "Paragraph architecture and transitions", "Revision for logic, tone, and persuasive force"]],
      ["Research, Sources, and Citation", "Advanced", ["Research questions and search-term planning", "Source credibility, expertise, and purpose", "Notes, paraphrase, quotation, and synthesis", "Citation systems and attribution choices", "Research arguments and evidence traceability"]],
      ["Grammar and Sentence Craft", "Beginner", ["Parts of speech and sentence functions", "Independent clauses and sentence boundaries", "Verb tense, agreement, and consistent reference", "Punctuation, coordination, and subordination", "Editing for clarity, concision, and emphasis"]],
      ["Literature: Character, Theme, and Form", "Intermediate", ["Narrator, point of view, and reliability", "Character motivation, conflict, and change", "Setting, structure, pacing, and plot", "Theme as a claim supported by patterns", "Genre, context, and interpretive disagreement"]],
      ["Poetry: Sound, Image, and Meaning", "Intermediate", ["Line, stanza, rhythm, and poetic form", "Sound devices, stress, and reading aloud", "Figurative language and image patterns", "Speaker, tone, and shifts in a poem", "Close reading and evidence-based interpretation"]],
      ["Public Speaking and Communication", "Advanced", ["Audience analysis and a focused purpose", "Speech structure, signposting, and timing", "Evidence, examples, and spoken citation", "Vocal delivery, gesture, and visual support", "Handling questions and reflective improvement"]],
    ],
  },
  History: {
    source: "Library of Congress classroom materials",
    url: "https://www.loc.gov/programs/teachers/classroom-materials/",
    principle: "Historical explanations are built by placing sources in context, checking who created them and why, and comparing evidence across perspectives.",
    tracks: [
      ["Ancient Worlds and Early Civilizations", "Beginner", ["Archaeology, chronology, and evidence limits", "River-valley societies and urban organization", "Law, labor, belief, and political authority", "Mediterranean exchange and classical institutions", "Continuity, collapse, and historical comparison"]],
      ["World History: Trade and Exchange", "Intermediate", ["Silk Roads, Indian Ocean, and trans-Saharan networks", "Religious exchange, translation, and cultural contact", "Empires, migration, and shifting boundaries", "Oceanic navigation and early global connections", "Commodities, labor systems, and unequal exchange"]],
      ["United States History: Foundations to Reconstruction", "Intermediate", ["Indigenous societies and colonial encounters", "Revolution, constitutional debate, and citizenship", "Expansion, removal, and contested sovereignty", "Slavery, abolition, and sectional conflict", "Civil War, emancipation, and Reconstruction choices"]],
      ["United States History: Industry to Civil Rights", "Advanced", ["Industrialization, labor, and urban growth", "Immigration, reform, and competing visions of progress", "War, economic crisis, and federal power", "Civil rights strategies and movement coalitions", "Postwar change, policy, and historical memory"]],
      ["Civics: Institutions and Participation", "Intermediate", ["Constitutional principles and separated powers", "Federalism, state authority, and local decisions", "Courts, precedent, and rights claims", "Elections, representation, and public opinion", "Civic action, policy evidence, and accountability"]],
      ["Modern Global History", "Advanced", ["Industrial economies and imperial competition", "World wars, revolution, and civilian experience", "Decolonization and new national movements", "Cold War alignments and regional conflicts", "Globalization, institutions, and contemporary debates"]],
      ["Historical Methods and Primary Sources", "Advanced", ["Provenance, authorship, and source purpose", "Close reading of documents and visual evidence", "Chronology, causation, and contextual explanation", "Corroboration, contradiction, and missing voices", "Writing a sourced historical interpretation"]],
    ],
  },
  Technology: {
    source: "NIST Cybersecurity Framework 2.0",
    url: "https://www.nist.gov/cyberframework",
    principle: "Useful technology starts with a defined need and constraints, then gets tested for reliability, accessibility, security, and impact on people.",
    tracks: [
      ["Digital Citizenship and Media Literacy", "Beginner", ["Digital identity, privacy, and personal boundaries", "Search strategies and source evaluation", "Image context, manipulation, and reverse checking", "Recommendation systems and information bubbles", "Civic participation and respectful online conduct"]],
      ["Cybersecurity Fundamentals", "Intermediate", ["Assets, threats, vulnerabilities, and risk", "Passwords, multifactor authentication, and recovery", "Phishing signals and safe verification habits", "Device updates, backups, and access control", "Incident response, reporting, and resilience"]],
      ["Web Design and Accessible Interfaces", "Beginner", ["User goals, page hierarchy, and navigation", "Semantic structure and meaningful headings", "Color, contrast, and readable typography", "Forms, labels, keyboard access, and feedback", "Responsive layouts and usability testing"]],
      ["Data Literacy and Spreadsheets", "Intermediate", ["Tables, data types, and cleaning decisions", "Formulas, references, and error checking", "Sorting, filtering, and grouping records", "Charts, scale choices, and misleading displays", "Summaries that respect uncertainty and context"]],
      ["AI Systems and Responsible Use", "Advanced", ["Training data, features, and model outputs", "Classification, prediction, and performance metrics", "Bias, privacy, and representation risks", "Human review, transparency, and accountability", "Testing AI claims and documenting limitations"]],
      ["Networks and Cloud Essentials", "Intermediate", ["Packets, addresses, and network layers", "Routers, switches, and local network design", "DNS, HTTP, and the path of a web request", "Cloud services, regions, and shared responsibility", "Availability, latency, and secure configuration"]],
      ["Engineering Design and Prototyping", "Advanced", ["Needs statements, constraints, and success measures", "Research, sketches, and competing concepts", "Materials, mechanisms, and prototype choices", "Testing, failure analysis, and iteration", "Communicating trade-offs and design decisions"]],
    ],
  },
  Business: {
    source: "U.S. Small Business Administration business guide",
    url: "https://www.sba.gov/business-guide",
    principle: "A defensible business decision identifies the customer, compares costs and benefits, names uncertainty, and measures results against a clear goal.",
    tracks: [
      ["Personal Finance Foundations", "Beginner", ["Income, expenses, and cash-flow planning", "Needs, wants, and values-based budgets", "Interest, credit costs, and repayment schedules", "Saving goals, emergency funds, and compounding", "Consumer protection, fraud signals, and financial choices"]],
      ["Entrepreneurship and Customer Discovery", "Intermediate", ["Problems, customer interviews, and evidence", "Value propositions and business-model assumptions", "Startup costs, pricing, and break-even reasoning", "Small experiments and minimum viable offers", "Business plans, risk, and responsible growth"]],
      ["Marketing and Consumer Research", "Intermediate", ["Segments, target audiences, and positioning", "Research questions, sampling, and survey limits", "Brand promise, proof, and customer trust", "Channels, campaigns, and conversion measures", "Ethical persuasion, privacy, and inclusive design"]],
      ["Accounting and Financial Statements", "Advanced", ["Transactions, accounts, and double-entry logic", "Income statements and profitability measures", "Balance sheets, assets, liabilities, and equity", "Cash-flow statements and timing differences", "Budgets, variance analysis, and financial controls"]],
      ["Operations and Project Management", "Intermediate", ["Work breakdowns, scope, and deliverables", "Schedules, dependencies, and critical paths", "Capacity, bottlenecks, and process flow", "Quality measures, feedback, and corrective action", "Risk registers, communication, and project closeout"]],
      ["Economics and Decision Making", "Advanced", ["Scarcity, opportunity cost, and incentives", "Supply, demand, and equilibrium shifts", "Elasticity, substitution, and price decisions", "Competition, market structure, and firm behavior", "Externalities, public goods, and policy trade-offs"]],
      ["Leadership, Ethics, and Organizations", "Advanced", ["Roles, authority, and organizational structure", "Motivation, feedback, and team coordination", "Ethical frameworks and stakeholder analysis", "Negotiation, conflict, and fair process", "Governance, accountability, and organizational change"]],
    ],
  },
  Art: {
    source: "Smithsonian Learning Lab",
    url: "https://learninglab.si.edu/",
    principle: "An artwork communicates through deliberate choices; observation, historical context, audience, and revision all shape a defensible interpretation.",
    tracks: [
      ["Drawing: Observation and Form", "Beginner", ["Contour, proportion, and negative space", "Value scales, light direction, and form", "Gesture, movement, and expressive line", "Perspective, overlap, and spatial depth", "Composition studies and reflective revision"]],
      ["Color, Painting, and Composition", "Intermediate", ["Hue, value, saturation, and color relationships", "Pigments, surfaces, and material experiments", "Edges, layers, and brushwork decisions", "Focal points, balance, and visual movement", "Series planning, critique, and revision"]],
      ["Visual Design and Typography", "Beginner", ["Shape, contrast, hierarchy, and visual grouping", "Type anatomy, readability, and pairing", "Grids, alignment, spacing, and proportion", "Color systems and accessible contrast", "Design briefs, prototypes, and audience testing"]],
      ["Art History: Objects and Visual Cultures", "Advanced", ["Looking closely at materials, makers, and use", "Patronage, institutions, and cultural context", "Style, influence, and historical comparison", "Representation, identity, and contested interpretation", "Exhibition narratives and ethical display"]],
      ["Photography and Image Storytelling", "Intermediate", ["Exposure, aperture, shutter, and ISO", "Focus, depth of field, and lens choices", "Framing, light, and visual emphasis", "Sequencing, captions, and documentary ethics", "Editing workflows and image provenance"]],
      ["Digital Illustration and Motion", "Advanced", ["Raster, vector, resolution, and file formats", "Shape language, layers, and reusable assets", "Timing, keyframes, and motion principles", "Color management, export, and platform constraints", "Portfolio sequencing and critique for iteration"]],
      ["Studio Practice and Critique", "Intermediate", ["Observation logs, prompts, and creative research", "Material selection and safe studio routines", "Iteration, constraint, and productive experiments", "Peer critique, description, and revision plans", "Portfolio documentation and artist statements"]],
    ],
  },
  Languages: {
    source: "British Council learning resources",
    url: "https://www.britishcouncil.org/school-resources",
    principle: "Language learning connects meaning, form, sound, and audience; learners make progress by understanding messages and using language in purposeful situations.",
    tracks: [
      ["Spanish: Everyday Communication", "Beginner", ["Greetings, names, and classroom expressions", "Numbers, dates, and personal information", "Present-tense patterns for daily routines", "Food, directions, and practical requests", "Listening strategies and short conversations"]],
      ["French: Foundations and Culture", "Beginner", ["Sound-letter patterns and pronunciation", "Articles, gender, and common noun groups", "Present-tense verbs and useful questions", "Descriptions, preferences, and daily life", "Cultural context in greetings and routines"]],
      ["German: Grammar and Conversation", "Beginner", ["Vowel sounds, spelling, and introductions", "Noun gender, articles, and plural patterns", "Present-tense verbs and word order", "Cases in common phrases and directions", "Planning a conversation with repair strategies"]],
      ["Mandarin: Tones, Characters, and Context", "Beginner", ["Tone awareness, syllables, and listening", "Pinyin, initials, finals, and sound contrasts", "Character components and stroke order", "Measure words, time, and simple questions", "Context, politeness, and short exchanges"]],
      ["Japanese: Scripts and Conversation", "Beginner", ["Hiragana recognition and sound patterns", "Katakana, loanwords, and transcription", "Particles, basic word order, and topic marking", "Kanji components and context clues", "Polite forms and everyday conversation repair"]],
      ["Arabic: Script, Sound, and Conversation", "Beginner", ["Right-to-left script and letter forms", "Short vowels, consonants, and sound practice", "Root patterns and high-frequency vocabulary", "Greetings, identity, and common questions", "Formal and colloquial context awareness"]],
      ["Language Learning: Translation and Fluency", "Advanced", ["Meaning, register, and translation purpose", "False friends, idioms, and cultural references", "Grammar contrasts and sentence restructuring", "Listening fluency, note-taking, and inference", "Revision, peer review, and language portfolios"]],
    ],
  },
  Geography: {
    source: "U.S. Geological Survey education resources",
    url: "https://www.usgs.gov/education",
    principle: "Geographic explanations connect location and scale to physical processes, human decisions, and patterns visible in maps or other spatial evidence.",
    tracks: [
      ["Earth Systems and Landforms", "Beginner", ["Earth spheres and interacting system boundaries", "Rock cycle, minerals, and surface materials", "Plate tectonics, hazards, and landscape change", "Rivers, coasts, erosion, and deposition", "Reading landforms from maps and field evidence"]],
      ["Climate, Weather, and Water", "Intermediate", ["Atmosphere, energy balance, and circulation", "Weather maps, fronts, and forecast uncertainty", "Climate zones, long records, and variability", "Watersheds, groundwater, and water budgets", "Climate risk, adaptation, and community choices"]],
      ["Cartography and GIS Basics", "Beginner", ["Scale, direction, symbols, and map purpose", "Coordinates, projections, and distortion", "Layers, attributes, and spatial data types", "Spatial queries, buffers, and overlay reasoning", "Map design, uncertainty, and ethical communication"]],
      ["Human Geography and Migration", "Intermediate", ["Population distribution, density, and change", "Migration drivers, routes, and lived experience", "Language, religion, identity, and place", "Agriculture, industry, and global connection", "Inequality, borders, and spatial justice"]],
      ["Cities, Infrastructure, and Planning", "Advanced", ["Urban form, land use, and neighborhood scale", "Transport networks, access, and commute patterns", "Housing, services, and environmental exposure", "Planning choices, participation, and trade-offs", "Resilience, public space, and future scenarios"]],
      ["Natural Resources and Sustainability", "Advanced", ["Resource distribution and competing claims", "Energy systems, demand, and transition options", "Land use, biodiversity, and ecosystem services", "Water, minerals, and supply-chain impacts", "Sustainability indicators and policy choices"]],
      ["Regional Geography and Field Methods", "Intermediate", ["Regional comparison and defining boundaries", "Field observations, sampling, and location notes", "Remote sensing, scale, and changing landscapes", "Place identity, local knowledge, and interviews", "Evidence synthesis and regional case studies"]],
    ],
  },
  "Computer Science": {
    source: "Harvard CS50x course materials",
    url: "https://cs50.harvard.edu/x/",
    principle: "A reliable computing solution makes its inputs, state, and expected outputs explicit, then uses tests to reveal edge cases and guide improvement.",
    tracks: [
      ["Python Programming and Data", "Beginner", ["Values, types, expressions, and input", "Conditionals, loops, and control flow", "Functions, scope, and decomposition", "Lists, dictionaries, and data transformations", "Files, exceptions, and small program design"]],
      ["JavaScript and Web Programming", "Beginner", ["Values, variables, and browser execution", "Functions, events, and interactive state", "Arrays, objects, and collection methods", "DOM structure, forms, and validation", "Asynchronous requests and interface feedback"]],
      ["Algorithms and Problem Solving", "Intermediate", ["Problem statements, constraints, and invariants", "Search, sorting, and comparison counts", "Recursion, base cases, and call structure", "Data structures and operation trade-offs", "Correctness arguments and complexity growth"]],
      ["Databases and SQL", "Intermediate", ["Tables, records, keys, and entity modeling", "SELECT, filtering, ordering, and aggregation", "Joins, foreign keys, and relational structure", "Insert, update, transactions, and integrity", "Indexes, query plans, and data stewardship"]],
      ["Software Engineering and Testing", "Advanced", ["Requirements, interfaces, and acceptance criteria", "Version control, branches, and review", "Unit tests, integration tests, and edge cases", "Debugging, logs, and reproducible failures", "Deployment, monitoring, and maintainable change"]],
      ["Data Science and Visualization", "Advanced", ["Questions, datasets, and data provenance", "Cleaning, missingness, and transformation choices", "Descriptive statistics and uncertainty", "Visual encoding, comparison, and chart critique", "Reproducible analysis and evidence-based reporting"]],
      ["Artificial Intelligence and Machine Learning", "Advanced", ["Features, labels, and training examples", "Training, validation, and test separation", "Classification, regression, and model fit", "Performance metrics, errors, and fairness", "Deployment limits, monitoring, and human oversight"]],
    ],
  },
  Health: {
    source: "MedlinePlus health topics",
    url: "https://medlineplus.gov/healthtopics.html",
    principle: "Health learning distinguishes reliable evidence from assumptions, considers individual and community context, and recognizes when a qualified professional is needed.",
    tracks: [
      ["Human Anatomy and Body Systems", "Beginner", ["Cells, tissues, organs, and levels of organization", "Skeletal and muscular support and movement", "Heart, blood vessels, and circulation", "Lungs, digestion, and exchange with the environment", "Nervous, endocrine, immune, and homeostatic control"]],
      ["Nutrition and Food Literacy", "Beginner", ["Macronutrients, micronutrients, and energy", "Food labels, serving sizes, and comparison", "Hydration, digestion, and nutrient absorption", "Food patterns, culture, access, and wellbeing", "Evaluating nutrition claims and marketing"]],
      ["Fitness, Movement, and Recovery", "Intermediate", ["Fitness components and personal baselines", "Safe movement, technique, and progression", "Cardiorespiratory training and effort", "Strength, mobility, rest, and recovery", "Goal setting, tracking, and injury warning signs"]],
      ["Mental Health and Self-Care Literacy", "Intermediate", ["Stress responses, coping, and support networks", "Sleep routines, attention, and daily functioning", "Emotional vocabulary and self-observation", "Mental health myths, stigma, and help-seeking", "Boundaries, crisis signs, and trusted support"]],
      ["Public Health and Prevention", "Advanced", ["Prevention levels and population health", "Infection pathways and protective measures", "Risk factors, screening, and health communication", "Environmental and social determinants of health", "Outbreak data, uncertainty, and community response"]],
      ["First Aid and Emergency Readiness", "Intermediate", ["Scene safety, consent, and emergency activation", "Bleeding, burns, and injury response priorities", "Recognizing breathing and circulation emergencies", "Preparedness kits, plans, and local resources", "Clear handoff information for responders"]],
      ["Health Information and Research Literacy", "Advanced", ["Clinical questions and evidence sources", "Study design, comparison groups, and limitations", "Absolute risk, relative risk, and uncertainty", "Medical claims, conflicts, and source quality", "Questions for a clinician and shared decisions"]],
    ],
  },
  Music: {
    source: "Open Music Theory",
    url: "https://openmusictheory.github.io/",
    principle: "Musical understanding develops by listening for patterns in time, pitch, harmony, and texture, then connecting those choices to sound, style, and intention.",
    tracks: [
      ["Music Theory: Rhythm and Pitch", "Beginner", ["Pulse, meter, subdivision, and rhythmic notation", "Pitch names, staff reading, and interval size", "Major and minor scales and key signatures", "Melody contour, phrase, and cadence", "Listening maps and accurate musical description"]],
      ["Harmony and Chord Progressions", "Intermediate", ["Triads, inversions, and chord quality", "Diatonic functions and harmonic motion", "Cadences, phrase endings, and expectation", "Seventh chords, voice leading, and tension", "Roman numerals and progression analysis"]],
      ["Ear Training and Active Listening", "Beginner", ["Recognizing pulse, meter, and rhythmic layers", "Comparing intervals and melodic direction", "Identifying timbre, register, and articulation", "Hearing texture, balance, and formal sections", "Listening notes and evidence-based comparison"]],
      ["Songwriting and Composition", "Intermediate", ["Motifs, repetition, and musical development", "Verse, chorus, bridge, and song architecture", "Melody setting, range, and singability", "Harmony, groove, and arrangement decisions", "Drafting, feedback, and revision of a composition"]],
      ["Instrument Practice and Performance", "Beginner", ["Posture, setup, and instrument care", "Technique routines and deliberate practice", "Reading parts and coordinating ensemble cues", "Interpretation, phrasing, and performance choices", "Reflection, stage readiness, and performance feedback"]],
      ["Music Production and Recording", "Advanced", ["Signal flow, microphones, and room awareness", "Recording levels, clipping, and clean takes", "Editing, arrangement, and session organization", "Equalization, dynamics, and spatial effects", "Mix review, export formats, and listening checks"]],
      ["Music History and Cultural Context", "Advanced", ["Sources, listening evidence, and historical framing", "Music, patronage, and changing institutions", "Tradition, transmission, and cultural exchange", "Technology, media, and popular music industries", "Ethical listening, attribution, and contextual interpretation"]],
    ],
  },
};

const learningModes = [
  {
    title: "Guiding question",
    objective: "Frame a precise question and name the evidence that could answer it",
    activity: "Write a question, list what is already known, and separate observations from assumptions.",
    check: "Which part of the topic would you need to define before drawing a conclusion?",
  },
  {
    title: "Concept model",
    objective: "Represent the parts of the topic and explain how they relate",
    activity: "Create a labeled model, then explain one connection in your own words.",
    check: "Which relationship in the model is essential to explaining the outcome?",
  },
  {
    title: "Worked example",
    objective: "Trace a complete example and justify each decision",
    activity: "Annotate the starting conditions, intermediate steps, and final result; check each step against the goal.",
    check: "Which step provides the strongest check that the reasoning is valid?",
  },
  {
    title: "Case investigation",
    objective: "Apply the topic to a case while accounting for context and constraints",
    activity: "Compare the case evidence with the model, note what does not fit, and revise the explanation.",
    check: "What additional evidence would help distinguish two competing explanations?",
  },
  {
    title: "Practice studio",
    objective: "Use the topic to produce a solution, interpretation, or design",
    activity: "Complete a short task, record the choices you made, and test the result against the stated criteria.",
    check: "Which criterion should guide your next revision?",
  },
  {
    title: "Misconception audit",
    objective: "Find and repair a common error in reasoning about the topic",
    activity: "Inspect a plausible but flawed explanation, identify the unsupported step, and rewrite it with evidence.",
    check: "Which correction addresses the cause of the error rather than only its wording?",
  },
  {
    title: "Transfer challenge",
    objective: "Carry the topic into a new context and explain what changes",
    activity: "Solve a new scenario, state which parts of the model still apply, and explain what must be adapted.",
    check: "Which principle remains useful when the context changes?",
  },
];

const promptFrames = [
  ["Which concept most directly answers this guiding question about {topic}?", "What evidence would best distinguish {topic} from a surface-level guess?", "Which conclusion stays within the limits of the available evidence about {topic}?"],
  ["Which model best represents the relationship described in {topic}?", "What should be labeled before explaining a change involving {topic}?", "Which connection in {topic} explains the observed result?"],
  ["Which step is necessary for a sound worked example of {topic}?", "How can a learner check the result of a {topic} example?", "Which assumption should be made explicit when solving a {topic} problem?"],
  ["Which evidence would most strengthen a case study about {topic}?", "What context is essential when interpreting a case involving {topic}?", "Which new observation would help test an explanation of {topic}?"],
  ["Which criterion best evaluates a practice task involving {topic}?", "What revision would improve an attempt to apply {topic}?", "Which result shows that a {topic} solution meets its goal?"],
  ["Which change repairs the reasoning error in this {topic} explanation?", "What evidence reveals the misconception in a claim about {topic}?", "Which revision corrects the underlying model of {topic}?"],
  ["Which principle from {topic} transfers to the new situation?", "What needs to be adapted when applying {topic} in a different context?", "Which explanation connects {topic} to the changed conditions?"],
];

function makeQuestion(topic, relatedTopics, mode, modeIndex, questionIndex, courseTitle, sourcePrinciple) {
  const related = relatedTopics.filter((item) => item !== topic);
  const nearbyTopic = related[(questionIndex + modeIndex) % related.length];
  const otherTopic = related[(questionIndex + modeIndex + 1) % related.length];
  const correctAnswers = [
    `Use ${topic} to ${mode.objective.toLowerCase()}, keeping the case conditions visible.`,
    `Choose evidence that can test a prediction about ${topic}, not merely repeat the claim.`,
    `Explain the result through ${topic}, then state one limit or uncertainty.`,
  ];
  const distractorSets = [
    [
      `Replace ${topic} with ${nearbyTopic} without checking whether it fits the case.`,
      "Treat one observation as a complete explanation.",
      "List relevant terms but leave their relationships unstated.",
    ],
    [
      `Use ${nearbyTopic} as evidence even though it cannot test the prediction.`,
      "Select only results that agree with the first guess.",
      "Change several conditions at once and attribute the result to one of them.",
    ],
    [
      `Use ${otherTopic} to explain a result it does not address.`,
      "Treat a single example as a universal rule.",
      "Hide uncertainty instead of identifying what the evidence cannot show.",
    ],
  ];
  const answerPosition = (courseTitle.length + modeIndex + questionIndex) % 4;
  const options = [...distractorSets[questionIndex]];
  options.splice(answerPosition, 0, correctAnswers[questionIndex]);

  return {
    prompt: promptFrames[modeIndex][questionIndex].replaceAll("{topic}", topic.toLowerCase()),
    explanation: `${correctAnswers[questionIndex]} ${sourcePrinciple}`,
    options: options.map((text, index) => ({ text, isCorrect: index === answerPosition })),
  };
}

export const courseCatalog = Object.entries(subjects).flatMap(([subject, data], subjectIndex) =>
  data.tracks.map(([title, level, modules], trackIndex) => {
    const courseIndex = subjectIndex * data.tracks.length + trackIndex;
    const lessons = modules.flatMap((topic, moduleIndex) =>
      learningModes.map((mode, modeIndex) => {
        const position = moduleIndex * learningModes.length + modeIndex + 1;
        const relatedTopics = modules.map((module) => module);
        const activityDetail = `${mode.activity} For ${title.toLowerCase()}, keep the work focused on ${topic.toLowerCase()}.`;

        return {
          position,
          title: `${topic}: ${mode.title}`,
          durationMinutes: 24 + ((courseIndex + position) % 3) * 4,
          objective: `${mode.objective} in ${topic.toLowerCase()}.`,
          content: `${mode.title} — ${topic}. ${activityDetail} ${data.principle}${position % learningModes.length === 1 ? `\n\nResearch reference: ${data.source} (${data.url})` : ""}`,
          quiz: {
            title: `${topic}: ${mode.title} check`,
            passingScore: 80,
            questions: Array.from({ length: 3 }, (_, questionIndex) => ({
              position: questionIndex + 1,
              ...makeQuestion(topic, relatedTopics, mode, modeIndex, questionIndex, title, data.principle),
            })),
          },
        };
      })
    );

    return {
      title,
      subject,
      level,
      durationMinutes: lessons.reduce((total, lesson) => total + lesson.durationMinutes, 0),
      description: `An original ${level.toLowerCase()} pathway in ${title.toLowerCase()}, moving from clear models to evidence-based application. Research reference: ${data.source}.`,
      lessons,
      exam: {
        title: `${title}: Course exam`,
        durationMinutes: 60,
        passingScore: 75,
        questions: modules.map((topic, index) => ({
          position: index + 1,
          ...makeQuestion(topic, modules, learningModes[6], 6, index % 3, title, data.principle),
        })),
      },
    };
  })
);