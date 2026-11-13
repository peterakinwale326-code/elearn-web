function question(stem, answer, distractors) {
  const options = [
    String(answer),
    ...distractors.map(String).filter((option) => option !== String(answer)),
  ].filter((option, index, all) => all.indexOf(option) === index).slice(0, 4);
  return options.length === 4 ? { question: stem, options, answer: 0 } : null;
}

function choose(topic, cases, variant) {
  for (const [pattern, entries] of cases) {
    if (pattern.test(topic)) {
      const [stem, answer, distractors] = entries[variant % entries.length];
      return question(stem, answer, distractors);
    }
  }
  return null;
}

const agriculture = [
  [/national development/i, [
    ["Which activity adds value to harvested cassava before it reaches consumers?", "Processing it into garri", ["Leaving it unharvested", "Burning the field", "Storing it while wet"]],
    ["How can agriculture support employment beyond the farm?", "By creating work in transport, processing and marketing.", ["By removing the need for food markets.", "By preventing people from trading.", "By replacing every other industry."]],
  ]],
  [/branches of agriculture/i, [
    ["Which branch focuses on field-crop production and soil management?", "Agronomy", ["Veterinary medicine", "Fishery science", "Agricultural engineering only"]],
    ["Which professional is most directly concerned with diagnosing livestock disease?", "A veterinarian", ["A crop breeder", "A produce wholesaler", "A soil surveyor"]],
  ]],
  [/farm planning/i, [
    ["Before choosing where to plant a crop, which farm-planning information is most useful?", "Soil, water, climate and available resources", ["The colour of nearby buildings only", "The farmer's preferred tool brand", "The number of roads in another town"]],
    ["Why should a farm plan include a budget and production schedule?", "To match planned activities with available money, labour and time.", ["To make the farm independent of weather.", "To avoid estimating input needs.", "To remove the need to keep records."]],
  ]],
  [/soil formation/i, [
    ["Which process contributes to the formation of soil from parent rock?", "Weathering breaks rock into smaller particles.", ["Harvesting combines grains.", "Evaporation turns clay into metal.", "Pollination forms a soil profile."]],
    ["Which combination influences how soil develops over time?", "Parent material, climate, organisms, relief and time", ["Seed size and market price only", "Farm tools and packaging only", "Crop colour and harvest date only"]],
  ]],
  [/soil propert/i, [
    ["A soil sample feels gritty and drains quickly. Which texture is most likely?", "Sandy soil", ["Clay soil", "Peat only", "Silt-free bedrock"]],
    ["Why is loam often suitable for many crops?", "It has a useful balance of sand, silt and clay.", ["It contains no air spaces.", "It always has a pH of exactly 7.", "It cannot hold nutrients or water."]],
  ]],
  [/soil sampling|soil testing/i, [
    ["How should a farmer collect a representative composite soil sample from a field?", "Take small samples from several locations and mix them.", ["Take one handful beside the farm gate only.", "Collect only surface litter.", "Choose only the darkest patch."]],
    ["Why should separate fields be sampled separately?", "Their soil conditions and management histories may differ.", ["A soil test can only measure colour.", "Mixing fields always improves fertility.", "The samples would otherwise contain no minerals."]],
  ]],
  [/soil fertility/i, [
    ["Which practice can improve soil organic matter while returning nutrients?", "Applying well-decomposed compost", ["Removing all crop residues and burning them", "Leaving the soil bare throughout the year", "Applying pesticide as a fertilizer"]],
    ["Why should fertilizer use be guided by soil needs and crop requirements?", "It helps supply appropriate nutrients and reduces waste or damage.", ["Every crop requires the same amount.", "Fertilizer replaces water and sunlight.", "More fertilizer always guarantees a larger harvest."]],
  ]],
  [/farm tool/i, [
    ["Which hand tool is most suitable for loosening soil and making planting ridges?", "A hoe", ["A watering can", "A weighing scale", "A pruning saw"]],
    ["Why should a farm tool be cleaned and stored after use?", "To reduce wear, rust and the risk of injury.", ["To make its handle damp.", "To remove its working edge.", "To contaminate the next crop."]],
  ]],
  [/farm safety/i, [
    ["Before spraying an approved crop-protection chemical, what should the operator do?", "Read the label and wear the specified protective equipment.", ["Mix it with food in an unlabelled bottle.", "Spray against the wind without protection.", "Pour leftover chemical into a stream."]],
    ["How should sharp tools be carried between work areas?", "With the sharp edge directed away from people.", ["Loose in a pocket with the edge exposed.", "By swinging them beside other workers.", "With the blade hidden under harvested food."]],
  ]],
  [/crop classification/i, [
    ["A crop completes its life cycle within one growing season. How is it classified by life span?", "An annual crop", ["A biennial crop", "A perennial crop", "A plantation tree"]],
    ["Which crop is commonly classified as a tuber crop?", "Yam", ["Cowpea", "Groundnut", "Maize"]],
  ]],
  [/seed selection/i, [
    ["Which seed lot is best for planting?", "Mature, viable seeds free from visible damage and disease", ["Shrivelled seeds mixed with stones", "Seeds with insect holes and mould", "Immature seeds collected before development"]],
    ["Why is a germination test useful before sowing?", "It estimates how many seeds are likely to sprout.", ["It measures the future market price.", "It replaces land preparation.", "It identifies the crop's selling location."]],
  ]],
  [/planting method/i, [
    ["When is transplanting seedlings into a field most appropriate?", "When seedlings are strong enough and field conditions are suitable.", ["Before seeds have germinated.", "After the crop has been harvested.", "When the field is flooded and unprepared."]],
    ["What is direct sowing?", "Placing seeds directly in the field where they will grow.", ["Moving mature plants into storage.", "Applying fertilizer after harvest.", "Separating grain from chaff."]],
  ]],
  [/crop maintenance/i, [
    ["Why should weeds be removed early in crop growth?", "They compete with crops for light, water, nutrients and space.", ["They increase every crop's yield.", "They prevent all soil erosion.", "They provide the crop with its seed."]],
    ["Which practice helps conserve moisture around growing crops?", "Applying suitable mulch to the soil surface", ["Removing all ground cover in dry weather", "Flooding the field every day", "Compacting the root zone"]],
  ]],
  [/weed control|weed/i, [
    ["Which approach is an example of integrated weed management?", "Combining timely cultivation, mulching and suitable crop rotation", ["Using one herbicide repeatedly without checking its label", "Allowing weeds to seed before control", "Removing the crop instead of the weeds"]],
    ["Why should a farmer identify a weed before choosing a control method?", "Different weeds may require different control measures.", ["All weeds respond identically to every treatment.", "Identification determines the crop's selling price.", "Weed names replace field inspection."]],
  ]],
  [/pest|disease/i, [
    ["Which observation is stronger evidence of insect pest damage than a nutrient deficiency?", "Chewed leaf edges with insects or their feeding signs", ["Uniform slow growth across the field only", "A soil test showing low nitrogen", "A shortage of rainfall throughout the season"]],
    ["What is a sensible first step when an unfamiliar crop disease appears?", "Inspect affected plants and seek a reliable diagnosis before treatment.", ["Apply several chemicals at random.", "Save infected seed for the next planting.", "Move diseased plants into a healthy field."]],
  ]],
  [/harvest|storage/i, [
    ["Why should maize be dried adequately before long-term storage?", "To reduce mould growth and deterioration.", ["To increase its moisture content.", "To encourage insects to reproduce.", "To make the grain germinate in storage."]],
    ["When should a crop generally be harvested for food use?", "At the maturity stage suitable for its intended use.", ["Before it has developed edible parts.", "Only after it has rotted in the field.", "At the same date as every other crop."]],
  ]],
  [/livestock classification/i, [
    ["Which animal is a ruminant?", "A goat", ["A chicken", "A pig", "A rabbit"]],
    ["What feature distinguishes poultry from cattle in livestock classification?", "Poultry are domesticated birds.", ["Poultry are all aquatic mammals.", "Cattle are fish.", "Poultry have no digestive system."]],
  ]],
  [/animal housing/i, [
    ["Which feature is important in a healthy poultry house?", "Good ventilation, drainage and adequate space", ["A permanently wet floor", "No access to clean water", "Overcrowding without airflow"]],
    ["Why should animal housing be cleaned regularly?", "To reduce waste build-up and lower disease risk.", ["To prevent animals from resting.", "To eliminate the need for feed.", "To make the floor slippery."]],
  ]],
  [/animal nutrition/i, [
    ["What is a balanced animal ration?", "Feed that supplies required nutrients in suitable amounts.", ["Only one nutrient given in excess.", "A mixture containing no water.", "Any feed regardless of the animal's needs."]],
    ["Why does a growing animal need protein in its diet?", "Protein supports growth and tissue repair.", ["Protein replaces all minerals.", "Protein prevents the need for water.", "Protein is used only to colour the coat."]],
  ]],
  [/poultry/i, [
    ["Which poultry birds are commonly kept primarily for egg production?", "Layers", ["Broilers", "Draft cattle", "Fingerlings"]],
    ["Why should poultry drinkers provide clean water?", "Water is essential for health and normal production.", ["Water replaces all feed.", "Dirty water prevents infection.", "Birds do not need water in warm weather."]],
  ]],
  [/fish farm|fish production/i, [
    ["Why should dissolved oxygen and water quality be monitored in a fish pond?", "Poor water conditions can stress or kill fish.", ["Fish grow only in polluted water.", "Water quality has no effect on fish.", "Oxygen is needed only by pond plants."]],
    ["What is a fingerling in fish farming?", "A young fish that has developed beyond the fry stage", ["A fish egg before fertilisation", "A mature breeding pond", "A device for measuring rainfall"]],
  ]],
  [/goat|sheep/i, [
    ["Which feature helps distinguish goats from sheep in many common breeds?", "Goats commonly browse shrubs while sheep more often graze grasses.", ["Goats are poultry.", "Sheep have no digestive system.", "Both animals are fish."]],
    ["Why should small ruminants have dry shelter and clean water?", "To support health and reduce exposure-related stress.", ["To stop them from feeding.", "To make parasites spread faster.", "To replace veterinary care."]],
  ]],
  [/farm records/i, [
    ["Which record helps a farmer compare production costs with sales income?", "An income-and-expenditure record", ["A weather forecast only", "A seed label without quantities", "A map with no farm data"]],
    ["Why should farm records be entered accurately and promptly?", "They support planning and reliable decisions.", ["They guarantee that prices never change.", "They remove the need to inspect crops.", "They replace all farm operations."]],
  ]],
  [/marketing farm product/i, [
    ["Why should produce be graded before sale?", "Buyers can compare quality and prices more fairly.", ["Grading increases the crop's moisture.", "It hides damaged produce.", "It prevents weighing the harvest."]],
    ["How can suitable packaging help a farmer market fresh produce?", "It can protect produce during handling and transport.", ["It makes spoilage impossible.", "It replaces refrigeration in every case.", "It removes the need to identify the product."]],
  ]],
  [/extension/i, [
    ["What is an agricultural extension officer's main role?", "Sharing practical information and advice with farmers.", ["Buying every farmer's land.", "Replacing all farm labour.", "Setting weather conditions."]],
    ["Why might a demonstration plot be used in extension work?", "Farmers can observe a recommended practice in action.", ["It prevents farmers from asking questions.", "It guarantees every crop will have the same yield.", "It replaces local field conditions."]],
  ]],
  [/sustainable agriculture/i, [
    ["Which practice supports long-term soil health?", "Rotating crops and maintaining organic matter", ["Growing one crop continuously without replenishing nutrients", "Leaving bare soil exposed to erosion", "Applying chemicals without measuring need"]],
    ["Why should water use be managed carefully on a farm?", "It helps conserve supplies and reduces waterlogging or waste.", ["Water conservation prevents plant growth.", "All crops need unlimited irrigation.", "Water management affects only storage buildings."]],
  ]],
  [/farm enterprise|enterprise project/i, [
    ["Before starting a poultry enterprise, which calculation is most useful?", "Expected costs, likely sales and break-even output", ["The colour of the feed containers only", "The number of nearby classrooms", "A guess about profit with no cost data"]],
    ["What does a simple farm business plan help an owner do?", "Set goals, estimate resources and organise production and sales.", ["Avoid recording expenses.", "Guarantee that no risk exists.", "Remove the need to know customers."]],
  ]],
];

const physicsIntro = [
  [/physics and measurement/i, [
    ["Why should a measured physical quantity be written with its unit?", "The unit gives the measurement's meaning and makes values comparable.", ["It changes the measured value.", "It replaces the instrument.", "It identifies the object's colour."]],
    ["Which SI unit is used for force?", "Newton", ["Joule", "Watt", "Metre"]],
  ]],
];

const basicScience = [
  [/science and observation/i, [
    ["Why should a scientific observation be recorded with units and conditions?", "So another person can understand and compare the result accurately.", ["To make the observation a personal opinion.", "To remove the need for repeated measurements.", "To change the result after the experiment."]],
    ["Which practice improves the reliability of an investigation?", "Repeat measurements and record the results carefully.", ["Change several variables at once.", "Record only the result that supports a prediction.", "Estimate every value without measuring."]],
  ]],
  [/laboratory safety/i, [
    ["A learner spills a chemical during a practical. What should the learner do first?", "Warn others and tell the teacher, following the laboratory spill procedure.", ["Touch it to identify it.", "Hide the spill under paper.", "Mix it with another chemical."]],
    ["Why should safety goggles be worn during a practical involving splashes?", "They protect the eyes from chemical or material splashes.", ["They measure liquid volume.", "They identify every chemical.", "They prevent all breakages."]],
  ]],
  [/measurement/i, [
    ["Which SI unit is used to measure the mass of a small laboratory sample?", "The gram or kilogram", ["The litre", "The second", "The degree Celsius"]],
    ["Why should a measuring instrument be read at eye level?", "To reduce parallax error.", ["To change the measured quantity.", "To make the scale longer.", "To avoid recording units."]],
  ]],
  [/cell|living things/i, [
    ["Which cell structure controls what enters and leaves the cell?", "The cell membrane", ["The cell wall only", "The vacuole", "The chloroplast"]],
    ["Which structure contains genetic material and helps control cell activities?", "The nucleus", ["The cell membrane", "The cytoplasm only", "The large vacuole"]],
  ]],
  [/classification/i, [
    ["Why do scientists classify organisms?", "To group them by shared features and make identification easier.", ["To make every organism identical.", "To remove the need to observe organisms.", "To arrange species by market price."]],
    ["Which feature is useful when distinguishing a fish from a mammal?", "Presence of gills and fins in most fish", ["Both groups have feathers.", "Mammals always lay eggs in water.", "Fish produce milk for their young."]],
  ]],
  [/nutrition|food/i, [
    ["Which nutrient is the body's main immediate source of energy?", "Carbohydrate", ["Vitamin C", "Water", "Mineral salts"]],
    ["Why is a varied diet important?", "Different foods supply different nutrients needed by the body.", ["Every food contains all nutrients in equal amounts.", "A varied diet removes the need for water.", "Only one food group supports health."]],
  ]],
  [/human body|digest|breath|respiration|excretion/i, [
    ["Where does most absorption of digested nutrients occur?", "The small intestine", ["The oesophagus", "The trachea", "The large intestine"]],
    ["Which gas is taken into the lungs for aerobic respiration?", "Oxygen", ["Nitrogen only", "Carbon dioxide", "Hydrogen"]],
  ]],
  [/reproduction/i, [
    ["What is fertilisation in sexual reproduction?", "The fusion of male and female gametes.", ["The splitting of a mature organism in two.", "The production of food by leaves.", "The removal of waste from cells."]],
    ["Which plant structure receives pollen during pollination?", "The stigma", ["The root cap", "The anther only", "The sepal base"]],
  ]],
  [/matter|particle|state/i, [
    ["How are particles arranged in a solid?", "Close together in fixed positions, vibrating in place", ["Far apart with no attraction", "Only at the surface of the container", "In a pattern that flows freely past one another"]],
    ["What happens to liquid water particles as water evaporates?", "Some gain enough energy to escape from the liquid surface.", ["They become new chemical elements.", "They stop moving completely.", "They turn into soil particles."]],
  ]],
  [/physical and chemical change/i, [
    ["Which observation is evidence of a chemical change?", "A new substance forms, such as gas bubbles during a reaction.", ["Ice melts into liquid water.", "Water evaporates from a dish.", "Sugar dissolves without reacting."]],
    ["Which is a physical change?", "Melting ice", ["Rusting iron", "Burning paper", "Cooking an egg"]],
  ]],
  [/element|compound/i, [
    ["Which statement describes a compound?", "It contains two or more elements chemically combined in fixed proportions.", ["It is a physical mixture that can be separated by hand.", "It contains only one type of atom.", "It is always a gas."]],
    ["Which is an element?", "Oxygen", ["Water", "Sodium chloride", "Carbon dioxide"]],
  ]],
  [/mixture|separation/i, [
    ["Which method separates insoluble sand from water?", "Filtration", ["Distillation of the dry sand", "Magnetisation of water", "Chromatography of the container"]],
    ["How can salt be recovered from salt solution?", "Evaporate the water and crystallise the salt.", ["Filter the dissolved salt through ordinary paper.", "Use a magnet to attract the salt.", "Add more water until it disappears."]],
  ]],
  [/force|motion/i, [
    ["A force can change an object's:", "Speed, direction or shape", ["Chemical identity in every case", "Mass without any interaction", "Temperature only"]],
    ["A car's speed increases from rest. What is happening to its motion?", "It is accelerating.", ["It is stationary.", "It is moving at constant speed.", "It has no forces acting on it."]],
  ]],
  [/work, energy|energy|power/i, [
    ["In science, work is done when a force:", "Moves an object through a distance in the force's direction.", ["Is applied to a wall that does not move.", "Is described without acting on anything.", "Changes colour only."]],
    ["What is the SI unit of power?", "Watt", ["Joule", "Newton", "Metre"]],
  ]],
  [/heat|temperature/i, [
    ["In which direction does heat flow naturally?", "From a higher-temperature body to a lower-temperature body", ["From colder to hotter without energy input", "Only from solids to gases", "In no direction"]],
    ["Which instrument measures temperature?", "A thermometer", ["A barometer", "A balance", "A stopwatch"]],
  ]],
  [/electricity|circuit/i, [
    ["What is the function of a switch in a simple circuit?", "To open or close the conducting path", ["To create electrical energy from nothing.", "To measure mass.", "To insulate every wire permanently."]],
    ["Which material is a good conductor of electricity?", "Copper", ["Rubber", "Dry wood", "Glass"]],
  ]],
  [/magnet/i, [
    ["Which poles of two magnets attract one another?", "Unlike poles", ["Like poles", "Two north poles only", "Two south poles only"]],
    ["What happens when a bar magnet is broken into two pieces?", "Each piece has a north and a south pole.", ["One piece has only north and the other only south.", "Both pieces lose all magnetic properties.", "The pieces become electric cells."]],
  ]],
  [/light|sound|wave/i, [
    ["Which medium can sound not travel through?", "A vacuum", ["Air", "Water", "Steel"]],
    ["How does light usually travel in a uniform transparent medium?", "In straight lines", ["Only in circles", "Only through opaque objects", "Without transferring energy"]],
  ]],
  [/weather|climate/i, [
    ["What is the difference between weather and climate?", "Weather is short-term atmospheric condition; climate is the long-term pattern.", ["Climate changes every minute while weather never changes.", "They are identical terms.", "Weather describes soil while climate describes rocks."]],
    ["Which instrument measures rainfall?", "A rain gauge", ["A thermometer", "A compass", "A measuring cylinder for mass"]],
  ]],
  [/water cycle/i, [
    ["What process changes liquid water into water vapour in the water cycle?", "Evaporation", ["Condensation", "Precipitation", "Collection"]],
    ["What forms when water vapour cools and condenses in the atmosphere?", "Cloud droplets", ["Dry soil", "Molten rock", "Salt crystals only"]],
  ]],
  [/ecosystem|food chain/i, [
    ["In a food chain, what is the role of a green plant?", "Producer", ["Primary consumer", "Decomposer only", "Top predator"]],
    ["What do decomposers do in an ecosystem?", "Break down dead material and return nutrients to the environment.", ["Make sunlight.", "Prevent all nutrient cycling.", "Consume only living plants."]],
  ]],
  [/^soil$/i, [
    ["Which soil layer usually contains the most organic matter and supports many plant roots?", "Topsoil", ["Bedrock", "The lowest parent-rock layer", "A layer of fresh concrete"]],
    ["Why should soil erosion be controlled on farmland?", "It removes fertile topsoil and can reduce productivity.", ["It increases the depth of every soil profile.", "It produces nutrients from nothing.", "It prevents water from moving."]],
  ]],
  [/pollution|conservation/i, [
    ["Which action helps reduce plastic pollution in a community?", "Reuse and correctly recycle suitable plastic items.", ["Burn plastic beside homes.", "Dump waste into a stream.", "Use more single-use packaging."]],
    ["Why are forests conserved?", "They support habitats, soil protection and the water cycle.", ["They prevent all rainfall.", "They have no effect on living things.", "They are useful only after being cleared."]],
  ]],
  [/simple machine/i, [
    ["Which simple machine is a ramp?", "An inclined plane", ["A pulley", "A wheel and axle", "A screw thread only"]],
    ["What is the main purpose of a simple machine?", "To make work easier by changing force size or direction.", ["To create energy from nothing.", "To remove the need for force.", "To prevent all movement."]],
  ]],
];

const computerStudies = [
  [/computer as a machine|parts of a computer|system unit/i, [
    ["Which component executes instructions and performs calculations?", "The CPU", ["The monitor", "The keyboard", "The loudspeaker"]],
    ["Which component temporarily holds data and instructions currently in use?", "RAM", ["A printer", "A keyboard", "A permanent paper file"]],
  ]],
  [/input device/i, [
    ["Which device is used to enter typed text into a computer?", "A keyboard", ["A monitor", "A speaker", "A projector"]],
    ["Which input device is commonly used to capture a paper photograph?", "A scanner", ["A printer", "A speaker", "A plotter"]],
  ]],
  [/output device/i, [
    ["Which device displays visual output from a computer?", "A monitor", ["A mouse", "A microphone", "A keyboard"]],
    ["Which device produces a paper copy of a document?", "A printer", ["A scanner", "A joystick", "A webcam"]],
  ]],
  [/storage device|persistent/i, [
    ["Which device stores files persistently when a computer is switched off?", "An SSD or hard drive", ["RAM", "A CPU register only", "A display pixel"]],
    ["Which storage device is portable and commonly connects through USB?", "A USB flash drive", ["A processor core", "A monitor stand", "A keyboard switch"]],
  ]],
  [/data and information/i, [
    ["What is information?", "Data processed and organised to have meaning.", ["Unprocessed symbols with no context only.", "A device that prints a document.", "A type of computer cable."]],
    ["A list of raw test scores becomes information when it is:", "Organised and interpreted, for example by calculating the class average.", ["Deleted before being read.", "Changed into unrelated symbols.", "Stored without labels or context."]],
  ]],
  [/number system/i, [
    ["Which digits are used in the binary number system?", "0 and 1", ["0 through 7", "0 through 9", "1 through 16"]],
    ["What is the decimal value of binary 101?", "5", ["3", "4", "6"]],
  ]],
  [/software|operating system/i, [
    ["What is a main role of an operating system?", "Manage hardware resources and provide services to applications.", ["Print without a printer.", "Replace the computer's processor.", "Store electricity in the monitor."]],
    ["Which is application software?", "A word processor", ["A CPU", "A RAM module", "A network cable"]],
  ]],
  [/file|folder/i, [
    ["Why are folders used on a computer?", "To organise files into named groups.", ["To increase the monitor's resolution.", "To run the CPU faster automatically.", "To replace a storage device."]],
    ["Which filename is clearest for a term report?", "biology-term2-results.xlsx", ["newfile-final-final2", "untitled", "123"]],
  ]],
  [/word processing|formatting document/i, [
    ["Which feature changes the appearance of selected text without changing its wording?", "Font formatting", ["Spell-checking only", "File deletion", "A network connection"]],
    ["Why should a document use headings consistently?", "They make its structure easier to scan and navigate.", ["They prevent the document from being saved.", "They replace the document's content.", "They make every paragraph a title."]],
  ]],
  [/spreadsheet|formula|chart/i, [
    ["Which spreadsheet formula adds the values in cells B2 through B6?", "=SUM(B2:B6)", ["=ADD(B2-B6)", "=TOTAL(B2;B6)", "=B2/B6"]],
    ["What is a spreadsheet chart useful for?", "Showing patterns or comparisons in data visually.", ["Replacing every data value permanently.", "Checking a computer's battery voltage.", "Creating a password automatically."]],
  ]],
  [/presentation software/i, [
    ["Which practice makes a presentation slide easier to read?", "Use concise text with clear contrast and a consistent layout.", ["Put a full essay in tiny text on one slide.", "Use low-contrast text on a matching background.", "Change fonts randomly on every line."]],
    ["What is the purpose of speaker notes?", "To help the presenter remember supporting points.", ["To replace every slide.", "To display confidential passwords to the audience.", "To change the projector's resolution."]],
  ]],
  [/network|internet|web/i, [
    ["What does a computer network allow connected devices to do?", "Communicate and share resources.", ["Operate without any communication.", "Replace all software.", "Convert every file into a website."]],
    ["What does a web browser use a URL for?", "To locate a resource on the web.", ["To measure processor temperature.", "To format a spreadsheet cell.", "To encrypt a keyboard."]],
  ]],
  [/search|information literacy/i, [
    ["How can a learner judge whether an online source is trustworthy?", "Check its author, evidence, date and agreement with reliable sources.", ["Accept the first result without reading it.", "Trust a claim only because it is popular.", "Ignore who published it."]],
    ["Which search query is most likely to find focused information about soil pH?", "soil pH effects on nutrient availability", ["soil everything", "science", "information"]],
  ]],
  [/email|online communication/i, [
    ["What should a clear email subject line do?", "Summarise the message's purpose.", ["Contain the entire email.", "Reveal a password.", "Remain blank in every case."]],
    ["Before sending an attachment, what should the sender check?", "That it is the intended file and contains no accidental private material.", ["That it has an unrelated filename.", "That the recipient cannot open it.", "That the message has no subject."]],
  ]],
  [/cyber safety|digital citizenship|privacy|ethic/i, [
    ["Which action helps protect an online account?", "Use a unique strong password and enable multi-factor authentication when available.", ["Reuse the same password publicly.", "Share login codes with strangers.", "Disable all security updates."]],
    ["What should a learner do before sharing another person's photo online?", "Get permission and consider the person's privacy.", ["Post it immediately without asking.", "Add private information to the caption.", "Send it to unknown accounts."]],
    ["A message asks for a one-time sign-in code and claims the account will be closed. What is the safest response?", "Do not share the code; verify the message through the service's official channel.", ["Reply with the code to prevent closure.", "Post the code in a class group.", "Forward the message to all contacts."]],
    ["Why should a learner sign out after using a shared computer?", "It helps prevent the next user from accessing the learner's account.", ["It deletes every file on the computer.", "It makes the account public.", "It replaces the need for a password."]],
    ["A website requests a learner's home address for an unrelated quiz. What should the learner do?", "Avoid providing unnecessary personal information and ask a trusted adult.", ["Enter a neighbour's address instead.", "Post the address publicly.", "Use the same address as the password."]],
    ["Which habit improves account security when one password is exposed?", "Use different passwords for different services and change the affected one.", ["Reuse that password everywhere.", "Send it to friends for safekeeping.", "Disable account alerts."]],
  ]],
  [/virus|malware/i, [
    ["What is a safe response to a suspicious email attachment?", "Do not open it; verify the sender and report or delete it.", ["Open it to see what happens.", "Disable antivirus first.", "Forward it to every contact."]],
    ["What does antivirus software help detect or remove?", "Some malicious software", ["All hardware faults", "Every incorrect calculation", "Physical damage to a screen"]],
  ]],
  [/algorithm|flowchart|programming concept/i, [
    ["What is an algorithm?", "A finite, ordered set of steps for solving a problem.", ["A computer's storage chip.", "A random collection of unrelated commands.", "A type of monitor cable."]],
    ["In a flowchart, which shape commonly represents a decision?", "A diamond", ["An oval", "A parallelogram", "A cylinder"]],
  ]],
];

const biology = [
  [/biology and living things|laboratory technique|practical biology/i, [
    ["Why should a biological drawing use clear single lines and labels?", "To communicate observed structures accurately.", ["To make the specimen larger than it is.", "To replace observation with decoration.", "To hide the magnification used."]],
    ["When recording an experiment, why should the method and results be kept separate from guesses?", "It distinguishes observed evidence from interpretation.", ["It makes the results impossible to repeat.", "It changes the specimen.", "It removes the need to identify variables."]],
  ]],
  [/cell structure/i, [
    ["Which organelle is the main site of aerobic respiration in a eukaryotic cell?", "Mitochondrion", ["Ribosome", "Cell wall", "Chloroplast"]],
    ["What is the function of a plant cell wall?", "It supports and strengthens the cell.", ["It controls every chemical reaction.", "It stores genetic information only.", "It releases digestive enzymes into the blood."]],
  ]],
  [/cell division/i, [
    ["What is the main outcome of mitosis in a typical body cell?", "Two genetically similar daughter cells", ["Four genetically different gametes", "One cell with no nucleus", "A cell with half the chromosome number"]],
    ["Why is meiosis important in sexual reproduction?", "It produces gametes with half the usual chromosome number.", ["It doubles the chromosome number in every generation.", "It produces identical body cells only.", "It prevents genetic variation."]],
  ]],
  [/tissue|organ/i, [
    ["What is a tissue?", "A group of similar cells working together on a function.", ["A group of unrelated ecosystems.", "A single organelle.", "A complete organism's habitat."]],
    ["How is an organ different from a tissue?", "An organ contains different tissues working together.", ["An organ is always one cell.", "A tissue contains several organ systems.", "An organ has no specialised function."]],
  ]],
  [/classification/i, [
    ["What is the purpose of a scientific classification system?", "To organise organisms by shared characteristics and relationships.", ["To assign organisms random names.", "To classify only animals by size.", "To prove that all organisms are identical."]],
    ["Which group contains organisms with cells that lack a membrane-bound nucleus?", "Prokaryotes", ["Mammals", "Flowering plants", "Fungi"]],
  ]],
  [/photosynthesis|nutrition in plants/i, [
    ["Which raw materials are used in photosynthesis?", "Carbon dioxide and water", ["Oxygen and glucose", "Nitrogen and protein", "Starch and minerals only"]],
    ["What is the role of chlorophyll in photosynthesis?", "It absorbs light energy.", ["It absorbs mineral salts from soil.", "It transports sugar through phloem.", "It releases nitrogen from roots."]],
  ]],
  [/nutrition in animals/i, [
    ["Why is a balanced diet important?", "It supplies nutrients needed for energy, growth and health.", ["It contains only carbohydrates.", "It removes the need for water.", "It prevents all disease."]],
    ["Which nutrient is mainly needed for growth and tissue repair?", "Protein", ["Vitamin C", "Water", "Fibre only"]],
  ]],
  [/digestion/i, [
    ["Which enzyme in saliva begins the digestion of starch?", "Amylase", ["Pepsin", "Lipase", "Trypsin"]],
    ["Where does most absorption of digested nutrients occur?", "The small intestine", ["The oesophagus", "The stomach only", "The trachea"]],
  ]],
  [/transport in plants/i, [
    ["Which plant tissue carries water and mineral ions from roots?", "Xylem", ["Phloem", "Epidermis only", "Palisade mesophyll"]],
    ["What does phloem transport in a plant?", "Sugars and other organic substances", ["Water only from roots", "Oxygen into the soil", "Mineral particles from leaves"]],
  ]],
  [/transport in animals/i, [
    ["Which blood cells transport most oxygen around the body?", "Red blood cells", ["Platelets", "White blood cells", "Plasma proteins only"]],
    ["What is the main function of the heart?", "Pump blood through the circulatory system.", ["Filter air in the lungs.", "Digest starch.", "Produce bile."]],
  ]],
  [/respiration/i, [
    ["Which process releases usable energy from glucose inside living cells?", "Cellular respiration", ["Photosynthesis", "Transpiration", "Diffusion only"]],
    ["Which products are formed in aerobic respiration?", "Carbon dioxide and water", ["Glucose and oxygen", "Starch and nitrogen", "Protein and chlorophyll"]],
  ]],
  [/excretion/i, [
    ["Which organ removes urea from the blood to form urine?", "The kidney", ["The heart", "The pancreas", "The stomach"]],
    ["Why is excretion necessary?", "It removes metabolic waste that could harm the body.", ["It removes all useful nutrients.", "It creates food from waste.", "It stops cells from respiring."]],
  ]],
  [/support and movement/i, [
    ["What is one function of the human skeleton?", "Support and protection of body structures", ["Production of digestive enzymes only", "Absorption of oxygen from air", "Transport of urine to the bladder"]],
    ["How do muscles move a bone at a joint?", "They contract and pull on the bone through tendons.", ["They push bones apart without attachment.", "They dissolve the joint.", "They replace the skeleton."]],
  ]],
  [/coordination|sense organ/i, [
    ["Which part of a neuron receives signals from other cells?", "Dendrites", ["The myelin sheath only", "The axon terminal only", "The nucleus of a muscle"]],
    ["What is the function of a receptor in a sense organ?", "Detect a stimulus and initiate a response signal.", ["Digest food.", "Transport oxygen in blood.", "Produce gametes."]],
  ]],
  [/reproduction in plants/i, [
    ["Which flower part produces pollen?", "The anther", ["The stigma", "The ovary", "The sepal"]],
    ["What is pollination?", "Transfer of pollen from anther to stigma.", ["Fusion of a seed with a root.", "Movement of water through xylem.", "Release of carbon dioxide from a leaf."]],
  ]],
  [/reproduction in humans/i, [
    ["Where does fertilisation usually occur in the human female reproductive system?", "The oviduct (fallopian tube)", ["The uterus lining", "The cervix", "The urinary bladder"]],
    ["Which hormone is primarily associated with male secondary sexual characteristics?", "Testosterone", ["Insulin", "Thyroxine", "Oestrogen only"]],
  ]],
  [/growth and development/i, [
    ["What is growth in a multicellular organism?", "A permanent increase in size or dry mass.", ["A temporary change in posture.", "A change in habitat only.", "The loss of all cells."]],
    ["Which conditions are important for seed germination?", "Water, oxygen and a suitable temperature", ["Bright light in every species", "Fertiliser and soil in every case", "Carbon dioxide alone"]],
  ]],
  [/genetics/i, [
    ["What is a gene?", "A DNA sequence that contributes to a functional product or trait.", ["A whole organ system.", "A type of red blood cell.", "A temporary environmental change only"]],
    ["If an organism has two different alleles for a gene, it is:", "Heterozygous", ["Homozygous", "Asexual", "Haploid in every cell"]],
  ]],
  [/variation/i, [
    ["Which is an example of continuous variation in humans?", "Height", ["ABO blood group", "Attached or free earlobes only", "Tongue-rolling category only"]],
    ["How can environmental factors contribute to variation?", "They can influence how inherited characteristics develop.", ["They change every individual's genes identically.", "They remove all inherited traits.", "They prevent organisms from growing."]],
  ]],
  [/ecology|food chain|population|conservation/i, [
    ["What is a population in ecology?", "Members of one species living in an area at the same time.", ["All habitats on Earth.", "A group of different ecosystems.", "Only the non-living parts of a habitat."]],
    ["What is likely to happen if a predator is removed from a food web?", "Some prey populations may increase, affecting other organisms.", ["Every producer immediately disappears.", "The food web becomes unchanged in all cases.", "All species become predators."]],
  ]],
  [/microorganism|disease/i, [
    ["Which microorganism causes malaria?", "Plasmodium", ["A bacterium that causes tuberculosis", "A yeast used in bread", "A harmless alga"]],
    ["How do vaccines help protect against some infectious diseases?", "They stimulate immune memory against a pathogen or its antigens.", ["They kill every pathogen on contact.", "They replace the body's immune system.", "They work only after a person is infected."]],
  ]],
];

const chemistry = [
  [/laboratory practice|matter and measurement/i, [
    ["Why should a chemical container's label be checked before use?", "To confirm its identity, hazards and safe handling instructions.", ["To identify the colour of the laboratory walls.", "To replace protective equipment.", "To estimate its market price."]],
    ["Which SI unit is appropriate for measuring the mass of a solid sample?", "Gram or kilogram", ["Litre", "Second", "Celsius degree"]],
  ]],
  [/atomic structure/i, [
    ["Which subatomic particle has a negative charge?", "Electron", ["Proton", "Neutron", "Nucleon with no charge"]],
    ["Where are protons and neutrons found in an atom?", "In the nucleus", ["In the outer electron cloud only", "Outside the atom", "In chemical bonds only"]],
  ]],
  [/periodic table|element/i, [
    ["Elements in the same main-group column often have similar chemical properties because they have:", "The same number of outer-shell electrons.", ["The same number of neutrons.", "Identical atomic masses.", "The same number of electron shells in every period."]],
    ["What does an element's atomic number show?", "The number of protons in its atoms.", ["The total number of compounds it forms.", "Its number of neutrons only.", "Its mass in grams."]],
  ]],
  [/formula|valency|equation/i, [
    ["What does the subscript 2 in H₂O indicate?", "Two hydrogen atoms in each water molecule", ["Two oxygen atoms", "Two water molecules", "Two hydrogen molecules outside the compound"]],
    ["Why must a chemical equation be balanced?", "Atoms are conserved in a chemical reaction.", ["Products must always weigh less.", "The number of molecules never changes.", "It changes the elements into different atoms."]],
  ]],
  [/bond/i, [
    ["What happens in ionic bonding?", "Electrons are transferred and oppositely charged ions attract.", ["Neutrons are shared between nuclei.", "Atoms lose all protons.", "Molecules are joined by gravity."]],
    ["What is shared in a covalent bond?", "One or more pairs of electrons", ["Protons between atoms", "Entire atomic nuclei", "Neutrons only"]],
  ]],
  [/mole concept/i, [
    ["Approximately how many particles are in one mole of a substance?", "6.02 × 10²³", ["6.02 × 10²", "3.00 × 10⁸", "9.81"]],
    ["How many moles are present in 18 g of water? (Mᵣ = 18)", "1 mol", ["18 mol", "0.5 mol", "324 mol"]],
  ]],
  [/gas law/i, [
    ["At constant temperature, what happens to a gas's pressure if its volume is reduced?", "The pressure increases.", ["The pressure decreases to zero.", "The pressure stays constant in all cases.", "The gas changes into a solid immediately."]],
    ["Which quantity must remain constant when applying Boyle's law to a fixed gas sample?", "Temperature", ["Pressure", "Volume", "Mass of the container"]],
  ]],
  [/solution|solubility/i, [
    ["In a salt solution, what is the solvent?", "Water", ["Salt", "The beaker", "The filter paper"]],
    ["What happens to most solid solutes' solubility in water as temperature rises?", "It often increases, though the exact change depends on the solute.", ["It always becomes zero.", "It is identical for every substance.", "The solute becomes a gas in every case."]],
  ]],
  [/separation/i, [
    ["Which method can separate ethanol from water by using different boiling points?", "Fractional distillation", ["Filtration", "Magnetic separation", "Sieving"]],
    ["How can an insoluble solid be separated from a liquid?", "Filtration", ["Crystallisation of the dry filter paper", "Using a magnet on every solid", "Decanting a gas"]],
  ]],
  [/acid|base|salt/i, [
    ["What colour does blue litmus turn in an acidic solution?", "Red", ["Green", "Blue", "White"]],
    ["What is commonly produced when an acid reacts with a base?", "Salt and water", ["Only oxygen", "A metal and hydrogen in every case", "A hydrocarbon"]],
  ]],
  [/oxidation|reduction/i, [
    ["In terms of electrons, oxidation is:", "Loss of electrons", ["Gain of electrons", "Gain of neutrons", "Loss of protons only"]],
    ["In a redox reaction, reduction involves:", "Gain of electrons", ["Loss of electrons", "Gain of oxygen in every case", "Loss of the nucleus"]],
  ]],
  [/rate.*reaction/i, [
    ["Why does increasing temperature often increase reaction rate?", "Particles move faster and more collisions have enough energy to react.", ["Reactant particles stop moving.", "The number of atoms disappears.", "The products become reactants automatically."]],
    ["What effect can a suitable catalyst have on a reaction?", "Increase its rate without being used up overall.", ["Stop all particle collisions.", "Change the products into elements.", "Increase the mass of the reactants."]],
  ]],
  [/equilibrium/i, [
    ["At dynamic equilibrium in a closed system, what is true?", "Forward and reverse reaction rates are equal.", ["Both reactions have stopped.", "Only products remain.", "The forward reaction rate is zero."]],
    ["What happens if a system at equilibrium is heated and the forward reaction is endothermic?", "The equilibrium shifts toward the endothermic direction.", ["It must shift toward the exothermic direction.", "The reaction stops permanently.", "The catalyst is consumed."]],
  ]],
  [/hydrocarbon|organic/i, [
    ["Which elements are present in every hydrocarbon?", "Carbon and hydrogen", ["Carbon and oxygen only", "Hydrogen and nitrogen only", "Sodium and chlorine"]],
    ["What is the general formula for an open-chain alkane?", "CₙH₂ₙ₊₂", ["CₙHₙ", "CₙH₂ₙ", "CₙH₂ₙ₋₂"]],
  ]],
  [/polymer/i, [
    ["What is a polymer?", "A large molecule made from many repeating smaller units.", ["A single atom of a metal.", "A mixture that always separates by filtration.", "A type of laboratory balance."]],
    ["Which material is a common synthetic polymer?", "Polyethene", ["Sodium chloride", "Copper", "Water"]],
  ]],
  [/metal.*extraction/i, [
    ["Why is carbon used to extract some metals from their ores?", "It can remove oxygen from less reactive metal oxides.", ["It adds protons to every ore.", "It dissolves all metals in water.", "It converts metals into gases at room temperature."]],
    ["Which method is commonly required to extract very reactive metals such as aluminium?", "Electrolysis", ["Hand sorting only", "Filtration", "Simple decantation"]],
  ]],
  [/electrochemistry/i, [
    ["At which electrode does oxidation occur in an electrolytic cell?", "The anode", ["The cathode", "The salt bridge only", "The external switch"]],
    ["What is the role of an electrolyte?", "It contains mobile ions that carry charge.", ["It blocks all ion movement.", "It acts only as an insulator.", "It supplies neutrons to the circuit."]],
  ]],
  [/environmental chemistry|water and air/i, [
    ["Which gas is a major contributor to the enhanced greenhouse effect when its atmospheric concentration rises?", "Carbon dioxide", ["Argon", "Helium", "Neon"]],
    ["Why is untreated sewage harmful when discharged into a river?", "It can introduce pathogens and reduce dissolved oxygen.", ["It sterilises the river permanently.", "It removes all nutrients.", "It turns water into a metal."]],
  ]],
];

const physics = [
  [/machine/i, [
    ["A machine raises a 400 N load using 100 N of effort. What is its mechanical advantage?", "4", ["300", "40", "0.25"]],
    ["Why is the efficiency of a real machine usually below 100%?", "Some input energy is dissipated, for example by friction.", ["Energy is created by the machine.", "The load has no weight.", "The effort is always zero."]],
  ]],
  [/scalar|vector/i, [
    ["Which quantity is a vector?", "Displacement", ["Mass", "Time", "Temperature"]],
    ["What additional information does a vector have beyond magnitude?", "Direction", ["Colour", "Chemical formula", "Density only"]],
  ]],
  [/motion|distance.?time graph|velocity.?time graph/i, [
    ["What does the gradient of a distance-time graph represent?", "Speed", ["Mass", "Force", "Energy"]],
    ["What does the gradient of a velocity-time graph represent?", "Acceleration", ["Distance", "Pressure", "Power"]],
    ["A runner covers 150 m in 30 s at a steady rate. What is the gradient of the distance-time graph?", "5 m/s", ["180 m/s", "120 m/s", "0.2 m/s"]],
    ["A horizontal section on a distance-time graph indicates that the object is:", "Stationary during that interval", ["Accelerating uniformly", "Moving at increasing speed", "Changing direction every second"]],
  ]],
  [/newton|force|momentum/i, [
    ["A 2 kg object accelerates at 3 m/s². What resultant force acts on it?", "6 N", ["1.5 N", "5 N", "9 N"]],
    ["What is the momentum of a 4 kg object moving at 5 m/s?", "20 kg m/s", ["9 kg m/s", "1.25 kg m/s", "20 N"]],
  ]],
  [/work and energy|energy|power/i, [
    ["A 10 N force moves a box 3 m in its direction. How much work is done?", "30 J", ["13 J", "7 J", "3.3 J"]],
    ["A machine transfers 200 J in 4 s. What is its power?", "50 W", ["800 W", "204 W", "0.02 W"]],
  ]],
  [/pressure/i, [
    ["A force of 20 N acts over an area of 4 m². What pressure is produced?", "5 Pa", ["80 Pa", "24 Pa", "0.2 Pa"]],
    ["Why does a sharp knife cut more easily than a blunt one with the same force?", "Its smaller contact area produces greater pressure.", ["It produces no pressure.", "It has a greater contact area.", "It reduces the applied force to zero."]],
  ]],
  [/heat|temperature|thermal expansion|gas law/i, [
    ["Why does a metal rail expand when its temperature rises?", "Its particles vibrate more and their average separation increases.", ["Its atoms gain new protons.", "The metal loses all its mass.", "Its particles stop moving."]],
    ["Which process transfers heat through a metal rod from its hot end?", "Conduction", ["Convection only", "Evaporation", "Reflection"]],
    ["Why are small gaps left between sections of a railway track?", "The gaps allow the rails to expand in hot weather without buckling.", ["They prevent the rails from conducting electricity.", "They make the rails lose mass.", "They stop trains from applying force."]],
    ["In a sealed container at constant volume, what generally happens to a gas's pressure when its temperature rises?", "The pressure increases.", ["The pressure becomes zero.", "The gas changes into a solid immediately.", "The pressure remains unrelated to temperature."]],
  ]],
  [/wave|sound/i, [
    ["What is the relationship between wave speed, frequency and wavelength?", "Speed = frequency × wavelength", ["Speed = frequency ÷ wavelength", "Speed = wavelength ÷ frequency", "Speed = mass × acceleration"]],
    ["Why can sound not travel through a vacuum?", "It requires particles to transmit vibrations.", ["It travels only through liquids.", "It is a form of electric current.", "It has no energy."]],
  ]],
  [/light|reflection|refraction/i, [
    ["When light passes from air into glass at an angle, why does it refract?", "Its speed changes as it enters the new medium.", ["Its frequency always becomes zero.", "The glass creates new light rays.", "The light changes into sound."]],
    ["What is the law of reflection?", "The angle of incidence equals the angle of reflection.", ["The angle of incidence is always 90°.", "The reflected ray travels through the mirror.", "The angles are measured from the mirror surface only."]],
  ]],
  [/electric charge|current|circuit/i, [
    ["A 12 V supply drives a 3 A current. What is the circuit resistance?", "4 Ω", ["36 Ω", "15 Ω", "0.25 Ω"]],
    ["In a series circuit, what happens to current through each component?", "The same current flows through each component.", ["It is different at every point.", "It is zero at the battery.", "It flows only through the first component."]],
    ["A 6 Ω resistor is connected to a 12 V supply. What current flows through it?", "2 A", ["72 A", "18 A", "0.5 A"]],
    ["Two 2 Ω resistors are connected in series. What is their total resistance?", "4 Ω", ["1 Ω", "2 Ω", "0 Ω"]],
  ]],
  [/magnet|electromagnetic induction/i, [
    ["How can an induced current be produced in a coil?", "Change the magnetic field through the coil.", ["Keep the magnetic field unchanged forever.", "Remove every conductor from the circuit.", "Heat the coil without changing its magnetic flux."]],
    ["What happens to the poles of an electromagnet when the current direction is reversed?", "The north and south poles swap.", ["The magnet becomes permanently non-magnetic.", "Both poles become north.", "The coil turns into a resistor only."]],
  ]],
  [/radioactivity|atomic physics/i, [
    ["What is an alpha particle?", "A helium nucleus containing two protons and two neutrons", ["A fast electron", "An electromagnetic wave", "A single neutron"]],
    ["Why is radioactive material stored behind suitable shielding?", "To reduce exposure to ionising radiation.", ["To increase its activity.", "To make it emit visible light.", "To turn it into a stable element immediately."]],
  ]],
];

const economics = [
  [/meaning and scope of economics|basic economic problem/i, [
    ["What is the central economic problem?", "Scarce resources must be allocated among competing wants.", ["Every want can be satisfied without choices.", "Resources are unlimited in every society.", "Prices never affect decisions."]],
    ["Why do households and firms make economic choices?", "They have limited resources and must select among alternatives.", ["They have unlimited income.", "They never face opportunity costs.", "They do not need goods or services."]],
  ]],
  [/opportunity cost|basic economic problem/i, [
    ["A student spends an evening studying instead of working a paid shift. What is the opportunity cost?", "The income from the shift given up", ["The cost of every textbook ever bought", "The student's exam score", "The price of electricity in the whole town"]],
    ["Why does scarcity require people to make choices?", "Resources are limited relative to wants.", ["All resources are unlimited.", "Wants never change.", "Choices have no consequences."]],
  ]],
  [/factor.*production|division of labour/i, [
    ["Which factor of production receives rent as its reward?", "Land", ["Labour", "Capital", "Entrepreneurship"]],
    ["What is one likely benefit of division of labour in a factory?", "Workers can gain skill and save time by specialising.", ["Every worker must perform every task.", "Production must stop between each operation.", "Specialisation removes the need for coordination."]],
  ]],
  [/production|productivity/i, [
    ["What does productivity measure?", "Output produced per unit of input.", ["Total population in a country.", "The price of one product only.", "The number of firms in a town."]],
    ["Which change is most likely to raise labour productivity?", "Training workers to use suitable equipment efficiently.", ["Reducing all workers' access to tools.", "Increasing downtime without changing output.", "Discarding every production record."]],
  ]],
  [/demand|supply|price determination/i, [
    ["If demand rises while supply stays unchanged, what usually happens to the equilibrium price?", "It rises.", ["It always falls to zero.", "It cannot change.", "It becomes equal to production cost in every case."]],
    ["What does the law of supply generally state, all else equal?", "A higher price encourages producers to offer more for sale.", ["A higher price always reduces quantity supplied.", "Price has no relation to supply.", "Supply depends only on consumers' income."]],
  ]],
  [/elasticity/i, [
    ["What does price elasticity of demand measure?", "How responsive quantity demanded is to a price change.", ["How much a product weighs.", "The number of firms in a market.", "The length of a production process."]],
    ["Demand is relatively inelastic when a price change causes:", "A proportionally smaller change in quantity demanded.", ["An infinite change in quantity demanded.", "No consumer to buy the good.", "A proportional change in supply only."]],
  ]],
  [/market structure|consumer behaviour/i, [
    ["Which feature is most associated with perfect competition?", "Many buyers and sellers with similar products", ["One seller controlling the entire market", "A single buyer setting all prices", "Products that cannot be compared"]],
    ["Why might consumers buy less of a product when its price rises?", "Their budget can purchase fewer units and substitutes may be attractive.", ["Their income always doubles.", "The product becomes free.", "Price has no effect on choices."]],
  ]],
  [/money|banking/i, [
    ["Which function of money makes it useful for comparing the prices of goods?", "A unit of account", ["A factor of production", "A type of tax", "A transport service"]],
    ["What is a central role of a commercial bank?", "Accept deposits and provide financial services such as lending.", ["Set every price in the economy.", "Print all national currency.", "Guarantee profits for every business."]],
  ]],
  [/inflation/i, [
    ["What does inflation mean?", "A sustained rise in the general price level.", ["A fall in every individual price.", "An increase in one product's quality only.", "A rise in output with no price change."]],
    ["How does high inflation affect the purchasing power of money?", "A unit of money buys fewer goods and services.", ["It always buys more goods.", "It has no effect on purchasing power.", "It converts money into capital automatically."]],
  ]],
  [/unemployment/i, [
    ["Who is counted as unemployed in the usual labour-force definition?", "A person without work who is available and actively seeking work.", ["Every child in school.", "Anyone who chooses not to work and is not seeking a job.", "Every retired person."]],
    ["Which policy could help reduce structural unemployment?", "Provide training that matches workers to changing job requirements.", ["Prevent all workers from learning new skills.", "Close training centres.", "Remove information about vacancies."]],
  ]],
  [/national income|economic growth/i, [
    ["What does real GDP growth indicate?", "An increase in the inflation-adjusted value of domestic output.", ["A rise in one company's sales only.", "A change in the currency's colour.", "A fall in all employment."]],
    ["Why is national income per person sometimes used?", "It relates total income to population size.", ["It shows exactly how income is distributed.", "It measures only government tax.", "It excludes all production."]],
  ]],
  [/population|labour/i, [
    ["What is the labour force?", "People employed or actively seeking employment.", ["All people, including infants and retirees.", "Only people who own businesses.", "Only people working in agriculture."]],
    ["Why can rapid population growth put pressure on public services?", "More people may need schools, healthcare, housing and infrastructure.", ["It automatically builds more facilities.", "It removes demand for water.", "It guarantees higher wages for everyone."]],
  ]],
  [/public finance|taxation/i, [
    ["Why does a government collect taxes?", "To raise revenue for public services and expenditure.", ["To eliminate all private businesses.", "To guarantee a surplus in every household.", "To replace money with barter."]],
    ["Which tax is typically charged directly on an individual's income?", "Personal income tax", ["Value-added tax on a purchase", "Import duty only", "Excise duty on a product"]],
  ]],
  [/international trade|balance of payments/i, [
    ["What is an export?", "A good or service sold to another country.", ["A good bought from another country.", "A domestic sale within one town only.", "A tax paid by a household."]],
    ["A country's balance of trade compares its:", "Value of goods exports with value of goods imports.", ["Population with its land area.", "Tax revenue with school enrolment.", "Wages with household savings only."]],
  ]],
  [/agriculture and industry/i, [
    ["How can agriculture supply raw materials to industry?", "Cocoa can be processed by factories into products such as cocoa powder.", ["A factory can produce rainfall for a farm.", "Agriculture prevents factories from using inputs.", "Industry replaces the need to grow crops."]],
    ["Why can agricultural processing benefit an economy?", "It can add value and create work beyond primary production.", ["It makes storage and transport unnecessary.", "It removes all market risks.", "It prevents farmers from selling produce."]],
  ]],
  [/economic development|nigerian economy|economic policy/i, [
    ["Which measure gives broader evidence of development than GDP growth alone?", "A measure that includes health, education and living standards.", ["The price of one imported product.", "The number of banknotes printed.", "The output of one firm only."]],
    ["Why might government support infrastructure investment?", "Reliable transport and power can reduce costs and improve access to markets.", ["Infrastructure always reduces production.", "Roads remove the need for trade.", "Electricity affects only household decoration."]],
  ]],
];

const accounting = [
  [/meaning and purpose of accounting|users of accounting information|accounting concepts/i, [
    ["Why does a business prepare accounting records?", "To provide organised financial information for decisions and accountability.", ["To replace every business transaction.", "To guarantee a profit.", "To conceal the business's financial position."]],
    ["Which user is most likely to examine a company's accounts before deciding whether to lend?", "A bank or other lender", ["A delivery driver with no financial interest", "A rival's customer", "A weather forecaster"]],
    ["A manager compares this month's expenses with the approved budget. Which use of accounting information is demonstrated?", "Monitoring performance and supporting control.", ["Designing a product label.", "Selecting a transport route without cost data.", "Replacing all source documents."]],
  ]],
  [/accounting equation/i, [
    ["Which accounting equation must remain in balance?", "Assets = liabilities + owner's equity", ["Assets = expenses − income", "Liabilities = sales + drawings", "Capital = assets + liabilities"]],
    ["A business has assets of ₦90,000 and liabilities of ₦25,000. What is owner's equity?", "₦65,000", ["₦115,000", "₦25,000", "₦90,000"]],
  ]],
  [/double.?entry|ledger account/i, [
    ["Under double-entry bookkeeping, every transaction affects:", "At least two accounts with equal total debits and credits.", ["Only the cash account.", "One account with no corresponding entry.", "The trial balance but no ledger account."]],
    ["A business buys equipment for cash. Which accounts are affected?", "Equipment and cash", ["Sales and rent only", "Capital and drawings only", "Debtors and creditors only"]],
  ]],
  [/source document|original entr|cash book|petty cash/i, [
    ["Which document is evidence that a cash sale has been paid for?", "A receipt", ["A purchase order only", "A staff timetable", "A delivery route map"]],
    ["What is the imprest system used for in petty cash?", "Restoring the petty-cash float to an agreed amount after expenses.", ["Valuing closing inventory.", "Calculating depreciation on a building.", "Preparing a bank statement."]],
  ]],
  [/trial balance/i, [
    ["What does a trial balance compare?", "The total debit balances with the total credit balances.", ["Sales with the number of customers.", "Assets with the bank's interest rate.", "Inventory quantities with employee hours."]],
    ["If a trial balance agrees, what does that prove?", "The total debits equal total credits, but some errors may still remain.", ["Every transaction is correct.", "No transaction was omitted.", "The accounts contain no errors of any kind."]],
  ]],
  [/error|correction/i, [
    ["Which error may not cause a trial balance to disagree?", "A transaction omitted completely from the books.", ["A debit posted as a credit only.", "An unequal debit and credit entry.", "A one-sided posting error."]],
    ["What is a suspense account used for temporarily?", "To hold an unexplained difference while errors are investigated.", ["To record every cash sale permanently.", "To replace the ledger.", "To value all fixed assets."]],
  ]],
  [/bank reconciliation/i, [
    ["Why might a cash-book balance differ from a bank-statement balance?", "Outstanding cheques or deposits in transit.", ["The bank statement records no transactions.", "Cash books never contain entries.", "Both records are guaranteed to update at the same time."]],
    ["A bank service charge appears on the statement but not the cash book. What should the business do?", "Record the charge in the cash book.", ["Delete the bank statement.", "Add the charge to sales.", "Ignore it permanently."]],
  ]],
  [/depreciation/i, [
    ["What does depreciation allocate?", "The cost of a long-term asset over its useful life.", ["Cash sales to customers.", "A bank loan to inventory.", "The owner's drawings to revenue."]],
    ["A machine costs ₦50,000, has a residual value of ₦5,000 and a 5-year life. What is annual straight-line depreciation?", "₦9,000", ["₦10,000", "₦45,000", "₦5,000"]],
  ]],
  [/accrual|prepayment/i, [
    ["An unpaid electricity bill for the current period is:", "An accrued expense", ["A prepaid expense", "A capital receipt", "A sales return"]],
    ["Insurance paid in advance for the next period is:", "A prepayment", ["An accrued income", "A bad debt", "A liability for sales tax"]],
  ]],
  [/inventory valuation|stock/i, [
    ["Why is closing inventory valued at the end of an accounting period?", "To determine the cost of goods sold and the closing asset value.", ["To calculate the owner's age.", "To replace the sales ledger.", "To remove all purchases from the accounts."]],
    ["Under the lower-of-cost-and-net-realisable-value rule, inventory is reported at:", "The lower of its cost and net realisable value.", ["Always its selling price.", "Always its replacement cost.", "The higher of cost and estimated profit."]],
  ]],
  [/final accounts|trading account|profit and loss|balance sheet/i, [
    ["Which statement reports a business's assets and liabilities at a particular date?", "The statement of financial position", ["The cash book", "The sales day book", "The petty-cash voucher"]],
    ["Gross profit is calculated as:", "Revenue from sales minus cost of goods sold.", ["Assets minus liabilities.", "Cash receipts minus drawings.", "Capital plus expenses."]],
  ]],
  [/manufacturing account/i, [
    ["What does a manufacturing account calculate?", "The cost of goods manufactured during an accounting period.", ["The number of customers who visited.", "The bank's interest rate.", "The owner's personal income tax only."]],
    ["Which cost is a direct material in a furniture factory?", "Timber used to make the tables", ["The accountant's office rent", "The factory's advertising cost", "The owner's private travel cost"]],
  ]],
  [/partnership account/i, [
    ["How are partnership profits normally shared?", "According to the partners' agreement.", ["Always equally by law in every case.", "According to each partner's age.", "Only by the number of employees."]],
    ["What does a partner's drawings account record?", "Cash or goods withdrawn by that partner for personal use.", ["Sales to customers on credit.", "Depreciation on factory machinery.", "Unpaid electricity expenses only."]],
  ]],
  [/company account/i, [
    ["What is a shareholder in a company?", "A person or organisation that owns shares in the company.", ["A customer who bought one product.", "A creditor who never provided finance.", "A government tax form."]],
    ["Which document sets out key rules for a company's internal governance?", "The company's articles of association", ["A petty-cash voucher", "A delivery note", "A bank paying-in slip"]],
  ]],
  [/cash.flow information/i, [
    ["What does a cash-flow statement report?", "Cash inflows and outflows over a period.", ["Profit earned in every future year.", "The quantity of inventory in each store.", "The company's share price only."]],
    ["A profitable business can still face a cash shortage because:", "Profit and cash flow are different, and customers may not yet have paid.", ["Profit is always held as physical cash.", "Credit sales are paid before they occur.", "Cash balances do not change."]],
  ]],
  [/ratio/i, [
    ["What does the current ratio compare?", "Current assets with current liabilities.", ["Sales with fixed assets.", "Gross profit with non-current liabilities.", "Cash with the number of employees."]],
    ["A business has current assets of ₦60,000 and current liabilities of ₦30,000. What is its current ratio?", "2:1", ["1:2", "30,000:1", "3:1"]],
  ]],
];

const physicalEducation = [
  [/physical education and health/i, [
    ["How can regular physical activity benefit health?", "It can improve fitness and support physical and mental well-being.", ["It guarantees that illness never occurs.", "It removes the need for rest.", "It prevents all injuries."]],
    ["Why should exercise be matched to a learner's age and fitness level?", "Suitable intensity helps make activity safer and more effective.", ["All learners have identical capacities.", "Maximum intensity is always safest.", "Fitness level has no effect on exercise."]],
  ]],
  [/fitness assessment|training principles/i, [
    ["Why should a fitness test use the same procedure each time?", "To make results more consistent and comparable.", ["To guarantee every athlete gets the same score.", "To remove the need for warm-up.", "To change the test's purpose."]],
    ["Which training principle requires exercise demands to increase gradually?", "Progression", ["Reversibility", "Specificity only", "Rest without exercise"]],
  ]],
  [/athletics|sprint technique|middle.distance/i, [
    ["Which start is normally used for a sprint race?", "A crouch start using starting blocks when available", ["A seated start facing away", "A standing jump into the lane", "A rolling start from outside the track"]],
    ["In a relay race, what must a team do successfully to transfer the baton?", "Pass it within the exchange zone.", ["Throw it ahead of the next runner.", "Stop outside the track.", "Carry two batons at once."]],
  ]],
  [/long jump|high jump|shot put/i, [
    ["In the long jump, where should an athlete take off?", "From behind the take-off line", ["From beyond the landing pit", "From outside the runway", "After landing in the pit"]],
    ["How is the shot put legally propelled?", "Pushed from the shoulder with one hand.", ["Thrown like a baseball overarm.", "Kicked from the ground.", "Rolled along the runway."]],
  ]],
  [/football tactic|basketball tactic|volleyball tactic|handball/i, [
    ["Why does a team use width when attacking in football?", "To stretch the defence and create space.", ["To place every player in one small area.", "To prevent passing options.", "To move the goalposts."]],
    ["In volleyball, how many team contacts are normally allowed to return the ball over the net, excluding a block?", "Three", ["One", "Two", "Five"]],
  ]],
  [/gymnastic|rhythmic activit/i, [
    ["Why is a clear landing area needed during a gymnastics skill?", "To reduce collision and landing injury risk.", ["To increase distraction.", "To prevent the performer from seeing the apparatus.", "To replace supervision."]],
    ["What is an important feature of rhythmic movement?", "Movement coordinated with a beat or musical pattern.", ["Random movement with no timing.", "A stationary posture throughout.", "Movement that ignores balance."]],
  ]],
  [/swimming|water safety/i, [
    ["What should a learner do before entering unfamiliar water?", "Check the depth and conditions and follow qualified supervision.", ["Dive in head-first immediately.", "Swim alone beyond the marked area.", "Ignore warning signs."]],
    ["Why should a swimmer avoid running on a wet pool deck?", "The surface may be slippery and cause a fall.", ["It makes the pool deeper.", "It improves water quality.", "It prevents the need for supervision."]],
  ]],
  [/first aid|sports injur/i, [
    ["An athlete has a suspected serious fracture. What is the safest immediate response?", "Keep the person still and get qualified medical help.", ["Force the limb straight.", "Ask the athlete to continue playing.", "Massage the injured area firmly."]],
    ["Why should a sprain be assessed before return to play?", "Continuing too soon can worsen the injury.", ["Assessment makes all injuries disappear.", "Pain is never a warning sign.", "Rest always reduces performance permanently."]],
  ]],
  [/nutrition for athlete/i, [
    ["Why should an athlete drink fluids during prolonged exercise in hot weather?", "To replace fluid lost through sweating and reduce dehydration risk.", ["To replace all food energy.", "To prevent the body from cooling.", "To guarantee a win."]],
    ["Which meal choice best supports recovery after training?", "A balanced meal with carbohydrate, protein and fluids", ["Only sweets and no water", "No food for the rest of the day", "A large amount of caffeine only"]],
  ]],
  [/drug.*sport/i, [
    ["Why are performance-enhancing drugs prohibited in sport?", "They can harm health and create unfair advantages.", ["They always improve sportsmanship.", "They remove the need for training.", "They are required for every event."]],
    ["What should an athlete do before using a medication that may be restricted?", "Check with a qualified medical professional and the relevant sport authority.", ["Take an unknown dose from a teammate.", "Hide it from the coach and officials.", "Assume every medicine is permitted."]],
  ]],
  [/psychology|leadership|teamwork/i, [
    ["How can a team captain support good teamwork?", "Communicate clearly and encourage each player to perform their role.", ["Blame teammates after every mistake.", "Ignore agreed tactics.", "Prevent teammates from sharing information."]],
    ["What can a pre-performance routine help an athlete do?", "Focus attention and manage nerves.", ["Guarantee victory.", "Replace physical preparation.", "Avoid following the rules."]],
  ]],
  [/rules and officials|sports organization/i, [
    ["What is the main role of an official in a match?", "Apply the rules fairly and manage play.", ["Choose the winning team before the match.", "Coach one side during play.", "Change the score without evidence."]],
    ["Why should players learn the rules of their sport?", "They can participate safely and understand fair play.", ["Rules remove the need for skill.", "Rules guarantee that no injury occurs.", "Rules apply only to spectators."]],
  ]],
  [/recreation|leisure|training programme|sports project/i, [
    ["What should a safe training programme include?", "Suitable goals, gradual progression, recovery and safety checks.", ["Maximum effort every day without rest.", "The same exercise for every person regardless of ability.", "No warm-up or monitoring."]],
    ["Why is recreational activity valuable?", "It can support health, enjoyment and social participation.", ["It always replaces formal medical care.", "It has no physical or social benefits.", "It must be competitive to be useful."]],
  ]],
];

const literature = [
  [/literature and society/i, [
    ["How can a novel reflect the society in which it was written?", "Through its characters, conflicts, language and social conditions.", ["Only through the number of pages.", "By avoiding all human relationships.", "By listing unrelated dates without context."]],
    ["Which approach best explains a social issue in a literary text?", "Connect specific events or dialogue to the issue and the text's context.", ["State a modern opinion without textual evidence.", "Ignore the characters' actions.", "Retell the title only."]],
  ]],
  [/elements of prose/i, [
    ["Which element of prose refers to the sequence of events in a story?", "Plot", ["Setting", "Diction", "Stage direction"]],
    ["Which feature most clearly distinguishes prose from a poem arranged in verse?", "Prose is usually written in sentences and paragraphs.", ["Prose cannot contain characters.", "Prose must always rhyme.", "Prose has no setting."]],
  ]],
  [/genre/i, [
    ["Which feature most clearly identifies a play as drama?", "Its action is primarily presented through dialogue and performance.", ["It must contain only rhyming couplets.", "It is always a personal diary.", "It contains no characters."]],
    ["A long narrative poem about heroic deeds is usually classified as:", "An epic", ["A lyric", "A one-act farce", "A newspaper report"]],
  ]],
  [/plot|narrative technique/i, [
    ["What is foreshadowing?", "A hint that prepares the reader for a later event.", ["A full account of the ending at the beginning.", "A list of settings only.", "A character's costume description."]],
    ["Which part of plot presents the main conflict?", "The rising action", ["The title page", "The glossary", "The final punctuation"]],
  ]],
  [/characterization/i, [
    ["A character's words and actions reveal their values. This is an example of:", "Indirect characterization", ["Setting", "Rhyme", "Stage lighting"]],
    ["What is a protagonist?", "The central character in a work", ["The author of a review", "The location of a scene", "A type of metaphor"]],
  ]],
  [/setting/i, [
    ["What does setting describe in a literary work?", "The time and place in which events occur.", ["Only the narrator's opinion.", "The order of rhyme sounds.", "The list of chapter titles."]],
    ["How can setting influence a story?", "It can shape characters' choices and the events they face.", ["It always removes the conflict.", "It prevents a theme from developing.", "It replaces the plot."]],
  ]],
  [/point of view|narrator/i, [
    ["A narrator who refers to a character as “I” is using:", "First-person point of view", ["Third-person omniscient only", "Second-person plural", "Dramatic irony"]],
    ["What can a limited third-person narrator reveal?", "The thoughts and experiences of one character.", ["Every character's private thoughts at all times.", "Only the author's biography.", "No events or thoughts."]],
  ]],
  [/theme/i, [
    ["What is a theme in literature?", "A central idea or insight developed through the work.", ["A short summary of every event.", "The author's address.", "The list of characters only."]],
    ["How should a reader support an interpretation of theme?", "Use relevant events, character choices or language from the text.", ["Rely only on the cover image.", "Ignore the text.", "State an opinion with no evidence."]],
  ]],
  [/style|tone/i, [
    ["What is tone?", "The writer's or speaker's attitude conveyed through language.", ["The location of the story.", "The sequence of plot events.", "The number of characters."]],
    ["Which choice most directly affects a writer's style?", "Diction and sentence structure", ["The reader's seat in a theatre", "The book's page count alone", "The date a library opens"]],
  ]],
  [/poetry|poetic voice/i, [
    ["Who is the speaker in a poem?", "The voice that speaks in the poem, not necessarily the poet.", ["Always the author in person.", "The audience as a group.", "The publisher"]],
    ["What is a stanza?", "A grouped set of lines in a poem.", ["A stage direction", "A prose paragraph in a play", "A list of characters"]],
  ]],
  [/imagery|figures? of speech/i, [
    ["“The classroom was a beehive” is an example of:", "A metaphor", ["A simile", "An onomatopoeia", "A literal instruction"]],
    ["Which phrase is a simile?", "Her voice was like a soft bell.", ["Her voice rang.", "Her voice was music.", "The voice spoke clearly."]],
  ]],
  [/sound device|rhythm|metre/i, [
    ["Repeating initial consonant sounds, as in “wild winds whistle,” is:", "Alliteration", ["Assonance", "Personification", "Enjambment"]],
    ["What does metre describe in poetry?", "A regular pattern of stressed and unstressed syllables.", ["The poem's publication cost.", "The characters' ages.", "The number of paragraphs in a novel."]],
  ]],
  [/dramatic structure|dialogue|stagecraft|tragedy|comedy/i, [
    ["What is dramatic irony?", "The audience knows something important that a character does not.", ["A character speaks to no one.", "The stage has no scenery.", "A play contains no conflict."]],
    ["What is a soliloquy?", "A speech in which a character reveals thoughts, usually alone on stage.", ["A conversation between two audiences.", "A list of stage props.", "A narrator's chapter heading."]],
  ]],
  [/analysis|comparative|criticism|interpretation|literary response|exam practice|independent/i, [
    ["Which evidence best supports a literary interpretation?", "A precise quotation linked to the claim being made.", ["A plot detail unrelated to the claim.", "The cover design alone.", "A personal opinion with no reference to the text."]],
    ["When comparing two poems, what is the strongest approach?", "Compare a shared feature and explain how each poet develops it.", ["Retell each poem without comparing them.", "List the poets' names only.", "Choose one poem and ignore the other."]],
    ["A reader claims that a character becomes more confident. Which evidence best supports that claim?", "A later scene showing the character making a decision they avoided earlier.", ["The book's publication date.", "A description of an unrelated location.", "The number of pages in the chapter."]],
    ["A poet repeats an image of a locked door whenever a character feels trapped. Which interpretation is best supported?", "The repeated image reinforces the character's sense of limited freedom.", ["The poem is mainly about carpentry.", "The image proves the poem has no speaker.", "The repetition gives the poem a new setting each time."]],
    ["Two narrators describe the same disagreement differently. What should a reader examine?", "Each narrator's perspective and the details each chooses to include.", ["Only the title of the story.", "The number of paragraphs in each account.", "The publisher's address."]],
    ["A play's pauses grow longer before a character reveals a secret. What is the likely dramatic effect?", "The pauses build tension before the revelation.", ["They remove the conflict from the play.", "They identify the author's birthplace.", "They turn dialogue into stage scenery."]],
    ["A story ends with the same image used in its opening. What can this structural choice create?", "A sense of connection or change between the beginning and ending.", ["A proof that no events occurred.", "A list of characters without a plot.", "A replacement for the story's setting."]],
  ]],
];

const programming = [
  [/operator/i, [
    ["In a programming expression, what does the % operator return for positive integers?", "The remainder after division", ["The quotient rounded upward", "The larger operand", "The product of both operands"]],
    ["If 23 is divided by 5 using the remainder operator, what value is returned?", "3", ["4", "5", "18"]],
  ]],
  [/validation/i, [
    ["A registration form requires an age from 13 to 19. What should input validation do?", "Reject values outside the permitted range.", ["Accept every value without checking.", "Change every value to 13.", "Hide the age field after submission."]],
    ["Why should a program validate user input before using it?", "To check that the input is present and in an acceptable form.", ["To guarantee every user enters the same value.", "To remove all error handling.", "To make invalid data permanent."]],
  ]],
  [/json/i, [
    ["What is JSON commonly used for in an application?", "Representing structured data for exchange between systems.", ["Styling a page's layout.", "Compiling machine instructions.", "Encrypting a computer's hard drive by itself."]],
    ["In JSON, which value type must be enclosed in double quotes?", "A string", ["A number", "true", "null"]],
  ]],
  [/module|package/i, [
    ["Why divide a program into modules?", "To organise related code and reuse functionality.", ["To make every function global.", "To prevent code from being tested.", "To remove the program's entry point."]],
    ["What does an import statement generally do?", "Makes declarations from another module available to the current file.", ["Deletes the imported file.", "Runs every test automatically.", "Converts source code into a database."]],
  ]],
  [/security|secure coding/i, [
    ["Which practice helps prevent SQL injection in an application?", "Use parameterized queries for user-supplied values.", ["Build SQL by concatenating unchecked input.", "Store database passwords in public source code.", "Disable all input validation."]],
    ["Why should passwords be stored using a password-hashing function?", "A stolen database should not reveal users' plain-text passwords.", ["Hashes make passwords visible to every user.", "Hashing replaces the need for authentication.", "It allows the same password to be recovered directly."]],
  ]],
  [/file i.?o|file|stream/i, [
    ["Why should a program close a file after it has finished using it?", "To release the file handle and flush pending data.", ["To delete the file automatically.", "To prevent the file from ever being read again.", "To convert the file into a variable."]],
    ["What is a stream in file or network programming?", "A sequence of data read or written over time.", ["A fixed graphic displayed on screen.", "A type of conditional statement.", "A variable that can store only one Boolean value."]],
    ["Why might a program read a large file as a stream rather than loading it all at once?", "It can process data incrementally while using less memory.", ["It changes the file into a class.", "It guarantees every line is correct.", "It prevents the program from reading any bytes."]],
    ["A program reads a text file one line at a time. Which file-processing approach is it using?", "Sequential stream reading", ["A class constructor", "A database transaction only", "A CSS selector"]],
    ["What should a program check after writing important data to an output stream?", "That the write completed and any required flush or close succeeded.", ["That the file was renamed to a variable.", "That every error handler was removed.", "That the stream contains no bytes."]],
    ["Why might a network response be processed as chunks?", "The application can handle incoming data without waiting to store the entire response first.", ["Chunks make the network independent of a server.", "The response can no longer contain errors.", "It converts the response to a loop automatically."]],
  ]],
  [/exception|error handling/i, [
    ["What is the purpose of a try/catch block?", "Handle an exception so the program can respond to a failure.", ["Repeat a loop forever.", "Declare a class constructor.", "Convert a string to a number automatically."]],
    ["What should an exception handler avoid doing?", "Silently hiding an error while reporting success.", ["Recording useful error context.", "Providing a safe recovery path.", "Cleaning up resources when needed."]],
  ]],
  [/inheritance/i, [
    ["What does inheritance allow a subclass to do?", "Reuse or extend behaviour defined by a parent class.", ["Change the programming language.", "Avoid creating objects.", "Make every field public."]],
    ["Why might a subclass override a method?", "To provide behaviour specialised for that subclass.", ["To delete the parent class.", "To prevent the method from ever running.", "To turn the method into a package."]],
  ]],
  [/testing|unit test/i, [
    ["What does a unit test usually check?", "One small function or component in isolation.", ["The entire internet connection.", "The user's keyboard hardware only.", "Every possible input to the whole system."]],
    ["Why include an assertion in a test?", "To compare the actual result with the expected result.", ["To change the application database.", "To skip the test body.", "To hide a failing result."]],
  ]],
  [/data processing/i, [
    ["A program must keep only passing scores from a list. Which operation is most appropriate?", "Filter the list using the pass condition.", ["Sort the list alphabetically.", "Convert the list to a comment.", "Delete the condition and return every score."]],
    ["Why should duplicate records be checked during data processing?", "They can distort counts and summaries.", ["They always improve data accuracy.", "They replace missing values automatically.", "They prevent data from being sorted."]],
  ]],
  [/code style|formatting|readability/i, [
    ["Which practice most improves code readability?", "Use consistent formatting and meaningful names.", ["Use one-letter names for every value.", "Place the whole program on one line.", "Mix unrelated naming styles."]],
    ["Why should a function name describe its purpose?", "Readers can understand what the function does without tracing every line.", ["The compiler requires every name to be a sentence.", "It makes the function run faster in every language.", "It removes the need for tests."]],
  ]],
  [/constructor/i, [
    ["What is a constructor commonly used for?", "Initialising a new object's state.", ["Destroying the source file.", "Printing every variable to the screen.", "Repeating a loop until it ends."]],
    ["When is a class constructor normally called?", "When an instance of the class is created.", ["Whenever a comment is read.", "Only after the program exits.", "When a package is deleted."]],
  ]],
  [/encapsulation/i, [
    ["What is encapsulation?", "Keeping data and related operations together while controlling access.", ["Making every field globally accessible.", "Removing all methods from a class.", "Copying code into unrelated files."]],
    ["How can encapsulation protect an object's state?", "Expose controlled methods instead of allowing arbitrary direct changes.", ["Make every field public and mutable.", "Remove all checks from setters.", "Store state in a comment."]],
  ]],
  [/generic/i, [
    ["What do generics allow a programmer to do?", "Write reusable code that works with specified types.", ["Run a program without data.", "Make every value have an unknown type at runtime.", "Replace all functions with loops."]],
    ["Why use a generic collection such as List<T>?", "It can hold a chosen element type while retaining compile-time type checks.", ["It accepts only comments.", "It stores values without any type rules.", "It is always limited to one item."]],
  ]],
  [/parameter|argument/i, [
    ["What is a function parameter?", "A named input that receives a value when the function is called.", ["The value returned only after the program ends.", "A file containing the function's comments.", "A condition that stops a loop."]],
    ["In calculateTotal(price, quantity), what are price and quantity?", "Arguments supplied to the function call", ["Return values from the operating system", "Names of packages", "Exception types only"]],
  ]],
  [/async|await|promise/i, [
    ["What does await do inside an asynchronous function?", "Wait for a promise or future to settle before using its result.", ["Block every process on the computer permanently.", "Convert an error into a successful value.", "Start a new database automatically."]],
    ["What should asynchronous code do if a network request can fail?", "Handle the rejected promise or thrown error.", ["Assume the request always succeeds.", "Discard the response without checking.", "Retry forever without a limit."]],
  ]],
  [/enum/i, [
    ["Why use an enum for a value with a small fixed set of states?", "It names the permitted alternatives and helps prevent invalid values.", ["It stores an unlimited number of paragraphs.", "It replaces every object in a program.", "It makes all values interchangeable."]],
    ["Which is a suitable enum-like set for an order status?", "Pending, shipped, delivered", ["Monday, 12.5, blue", "An arbitrary string of any length", "A database password and username"]],
  ]],
  [/javascript interoperability|interop/i, [
    ["What does interoperability between Dart and JavaScript enable?", "Code in one environment to communicate with code in the other.", ["Dart code to run without a runtime in every browser.", "JavaScript to become a database table.", "Both languages to share identical syntax."]],
    ["When calling a JavaScript API from Dart, what should the program account for?", "Different types and asynchronous results at the boundary.", ["The API can never fail.", "All JavaScript values are Dart integers.", "The call automatically validates every input."]],
  ]],
];

export function authoredAssessmentQuestion(course, topic, variant = 0) {
  const title = course.title;
  if (course.level === "Programming") return choose(topic, programming, variant);
  if (title === "Agricultural Science") return choose(topic, agriculture, variant);
  if (title === "Basic Science and Technology") return choose(topic, basicScience, variant);
  if (title === "Computer Studies") return choose(topic, computerStudies, variant);
  if (title === "Biology") return choose(topic, biology, variant);
  if (title === "Chemistry") return choose(topic, chemistry, variant);
  if (title === "Physics") return choose(topic, [...physicsIntro, ...physics], variant);
  if (title === "Economics") return choose(topic, economics, variant);
  if (title === "Accounting") return choose(topic, accounting, variant);
  if (title === "Physical Education") {
    if (/football/i.test(topic)) {
      const questions = [
        ["Why does a team use width when attacking in football?", "Move players wider to stretch the defence.", ["Place every attacker beside the ball.", "Stop offering passing options.", "Move the goal away from the pitch."]],
        ["A football team is struggling to pass through a crowded centre. Which adjustment can create more attacking space?", "Move players wider to stretch the defence.", ["Place every attacker beside the ball.", "Stop offering passing options.", "Move the goal away from the pitch."]],
        ["A winger receives the ball near the touchline with a defender approaching. What is a useful attacking option?", "Look for a teammate making a run into space or deliver a controlled pass.", ["Kick the ball out without checking for a teammate.", "Stop play and move the goal.", "Turn toward the nearest opponent and hold the ball indefinitely."]],
        ["A team has won possession in its own half. What should the players do before attempting a counterattack?", "Look up, support the ball-carrier and use available space.", ["All run toward the ball-carrier.", "Ignore opponents and pass blindly.", "Leave the field to create space."]],
        ["Why should a defender communicate with teammates when marking attackers?", "Clear calls help coordinate coverage and reduce gaps.", ["Communication makes the ball stop moving.", "It replaces the need to watch play.", "It allows defenders to handle the ball."]],
        ["A player is about to pass to a closely marked teammate. What should the player check first?", "Whether a safer passing option is available.", ["Whether the referee has left the pitch.", "Whether the goal can be moved closer.", "Whether teammates can stop running."]],
        ["What is the purpose of changing the direction of attack in football?", "It can move the defence and open space on the other side.", ["It makes the pitch shorter.", "It prevents teammates from receiving the ball.", "It guarantees a goal from every pass."]],
        ["A defender approaches while the ball-carrier has an open teammate nearby. Which action keeps possession more safely?", "Pass accurately to the open teammate.", ["Kick the ball toward the nearest defender.", "Stop moving and hide the ball.", "Leave the ball on the ground and walk away."]],
      ];
      const [stem, answer, distractors] = questions[variant % questions.length];
      return question(stem, answer, distractors);
    }
    if (/basketball/i.test(topic)) {
      return question(
        "A basketball defender closes on the ball-handler. Which action can create a passing lane?",
        "A teammate moves to an open space away from the defender.",
        ["All teammates stand behind the ball-handler.", "The ball-handler stops looking for teammates.", "Players leave the court."],
      );
    }
    if (/volleyball/i.test(topic)) {
      return question(
        "In volleyball, how many team contacts are normally allowed to return the ball over the net, excluding a block?",
        "Three",
        ["One", "Two", "Five"],
      );
    }
    if (/handball/i.test(topic)) {
      return question(
        "In team handball, how many steps may a player normally take while holding the ball before passing, shooting or dribbling?",
        "Three",
        ["One", "Five", "Ten"],
      );
    }
    if (/sprint technique/i.test(topic)) {
      const questions = [
        ["Which start is normally used for a sprint race?", "A crouch start using starting blocks when available.", ["A standing start with both hands on the ground.", "A seated start facing away from the track.", "A rolling start from outside the lane."]],
        ["During the drive phase of a sprint start, what should the runner do?", "Accelerate with powerful forward-directed steps.", ["Stand upright before moving.", "Look behind after every step.", "Shorten every stride to a walk."]],
        ["Which starting position is normally used for a sprint race?", "A crouch start using starting blocks when available.", ["A seated start facing away from the track.", "A standing start with both hands on the ground.", "A rolling start from outside the lane."]],
        ["At the start signal, where should a sprinter direct the first few powerful steps?", "Forward along the lane.", ["Sideways across another runner's lane.", "Back toward the starting blocks.", "Toward the stands."]],
        ["Why should a sprinter stay in their assigned lane during a race?", "To compete fairly and avoid obstructing other runners.", ["To shorten the official distance.", "To avoid crossing the finish line.", "To make the track wider."]],
      ];
      const [stem, answer, distractors] = questions[variant % questions.length];
      return question(stem, answer, distractors);
    }
    return choose(topic, physicalEducation, variant);
  }
  if (title === "Literature in English") return choose(topic, literature, variant);
  return null;
}
