import fs from "node:fs/promises";
import path from "node:path";

const file = path.resolve(process.cwd(), "data", "curriculum.json");
const curriculum = JSON.parse(await fs.readFile(file, "utf8"));
const generatedSection = /^## Subject explanation and examples\b[\s\S]*$/m;
const courseMetadata = /^_Course:.*_$/gm;
const repeatedParagraphThreshold = 0.8;

const biologyLessons = {
  "biology and living things": [
    "Biology is the study of living organisms and the processes that keep them alive. Living things show nutrition, respiration, movement, growth, sensitivity, excretion and reproduction. These features are considered together: a flame may grow and spread, but it does not carry out the coordinated processes of an organism.",
    "A green plant makes food by photosynthesis, respires, responds to light and water, and produces seeds. A microscope can reveal cells in a leaf, while observation over several days shows growth. Use several characteristics rather than one visible feature when deciding whether something is living.",
  ],
  "laboratory techniques": [
    "Biological observations are useful only when the method is safe and repeatable. Label specimens, use clean equipment, record measurements with units and draw what is actually visible rather than what you expect to see. A light microscope magnifies a specimen; total magnification is the eyepiece magnification multiplied by the objective magnification.",
    "To focus a prepared slide, begin with the lowest-power objective, secure the slide, centre the specimen and bring it into focus with the coarse adjustment before using the fine adjustment. Record the magnification and make a clear, large biological drawing with straight label lines. Never point a microscope toward the Sun.",
  ],
  "tissues and organs": [
    "In a multicellular organism, cells with similar structures and roles form a tissue; different tissues combine to make an organ, and organs work together in an organ system. This organization allows tasks to be shared. A muscle cell, for instance, is adapted to contract, while a nerve cell carries signals.",
    "In a leaf, palisade cells contain many chloroplasts and are positioned to receive light; xylem vessels bring water, and guard cells regulate the stomata. A labelled leaf cross-section links each tissue to its function instead of treating the organ as a collection of unrelated names.",
  ],
  "classification": [
    "Classification groups organisms by shared characteristics so they can be identified and compared. Biologists use increasingly specific groups; in the traditional school hierarchy these include kingdom, phylum, class, order, family, genus and species. A scientific name has two parts: the genus name begins with a capital letter and the species name with a lower-case letter.",
    "When comparing two organisms, record observable features such as body covering, number of limbs, leaf arrangement or reproductive structures, then use a key to follow the matching choices. Classification is a model based on evidence; new evidence can lead scientists to revise how groups are arranged.",
  ],
  "nutrition in plants": [
    "Photosynthesis is the process by which green plants use light energy to make glucose from carbon dioxide and water. Chlorophyll in chloroplasts absorbs light; oxygen is released. The word equation is carbon dioxide + water → glucose + oxygen. Glucose may be used in respiration or converted to starch for storage.",
    "To test a leaf for starch, first remove its green colour in hot ethanol using a water bath, rinse it, then add iodine solution. A blue-black colour indicates starch. In an investigation of light, cover part of a destarched leaf and expose the plant to light; compare the covered and uncovered areas while keeping other conditions as similar as possible.",
  ],
  "nutrition in animals": [
    "Animals obtain organic nutrients by feeding. A balanced diet supplies carbohydrates and fats for energy, proteins for growth and tissue repair, vitamins and minerals for body processes, fibre for healthy movement of food through the gut, and water for transport and chemical reactions. Requirements vary with age, activity and health.",
    "A food label can be used to compare serving size and nutrient content, but a single food is not a complete diet. For example, beans provide protein and fibre, while a meal that also includes a staple food and vegetables supplies a wider range of nutrients. Deficiency diseases arise when particular nutrients are lacking over time.",
  ],
  "digestion": [
    "Digestion breaks large, insoluble food molecules into smaller, soluble molecules that can be absorbed. Teeth carry out mechanical digestion; enzymes carry out chemical digestion. Salivary amylase begins starch digestion in the mouth. In the small intestine, enzymes complete digestion and the products pass through the villi into the blood.",
    "Follow a piece of bread through the digestive tract: chewing increases its surface area, amylase begins breaking starch into smaller sugars, and further digestion in the small intestine produces glucose. The stomach churns food and its acidic conditions support protein digestion. Peristalsis moves food along the gut; it is not the same as digestion.",
  ],
  "transport in plants": [
    "Plants transport water and dissolved mineral ions from roots to leaves mainly through xylem vessels. Phloem carries dissolved products of photosynthesis, especially sucrose, from sources such as leaves to regions where they are used or stored. Water loss from leaf stomata creates a transpiration stream that helps draw water upward.",
    "A celery stalk placed in coloured water provides a simple demonstration: after several hours, coloured pathways can be seen in the stem and leaf veins. The dye travels with water through xylem. Keep the stalk and water volume consistent when comparing conditions, and distinguish this observation from the movement of sugars in phloem.",
  ],
  "transport in animals": [
    "The human circulatory system transports oxygen, nutrients, hormones and waste products. The heart pumps blood through vessels. Arteries carry blood away from the heart, veins return blood to it, and capillaries have thin walls that allow exchange with tissues. Red blood cells carry oxygen using haemoglobin; plasma transports dissolved substances.",
    "In a double circulation, blood passes through the heart twice during one complete journey: between heart and lungs, then between heart and the rest of the body. The right side sends blood to the lungs for gas exchange; the left side sends oxygenated blood to the body. Valves help prevent backward flow.",
  ],
  "respiration": [
    "Cellular respiration releases usable energy from glucose inside cells. In aerobic respiration, oxygen is used and carbon dioxide and water are produced: glucose + oxygen → carbon dioxide + water + energy. Respiration occurs continuously in living cells; breathing is the movement of air into and out of the lungs and supplies oxygen for gas exchange. In the alveoli, oxygen diffuses into capillary blood and carbon dioxide diffuses from the blood into the air.",
    "During vigorous exercise, muscle cells need energy rapidly. If oxygen supply cannot meet demand, some energy is released by anaerobic respiration, which in human muscles produces lactic acid. Compare breathing rate before and after exercise, allow recovery, and explain the change as the body increases oxygen delivery and removes carbon dioxide.",
  ],
  "excretion": [
    "Excretion removes metabolic waste made by the body; it is different from egestion, which removes undigested food from the gut. The kidneys filter blood and regulate water and salt levels. Useful substances and appropriate amounts of water are reabsorbed, while urea and excess substances leave the body in urine.",
    "The lungs excrete carbon dioxide produced by respiration, and the skin loses water and salts in sweat. A simple flow diagram can trace urea from protein breakdown in the liver, through the blood to the kidneys, and out in urine. The diagram should identify the organ that makes the waste and the organ that removes it.",
  ],
  "support and movement": [
    "The skeleton supports the body, protects some organs and provides attachment points for muscles. A joint is where bones meet. At a hinge joint, such as the elbow, movement is mainly in one plane; at a ball-and-socket joint, such as the shoulder, movement is possible in several directions. Ligaments connect bone to bone.",
    "Skeletal muscles move bones by contracting and pulling; they do not push. At the elbow, the biceps and triceps act as an antagonistic pair: when the biceps contracts to bend the arm, the triceps relaxes. Draw the joint, label the bones and muscles, and use arrows to show the direction of the pull.",
  ],
  "coordination": [
    "Coordination allows an organism to detect a change and produce a suitable response. In the nervous system, receptors detect stimuli, sensory neurones carry impulses to the central nervous system, and motor neurones carry signals to effectors such as muscles. Hormones are chemical messengers carried in the blood and often act more slowly than nerve impulses.",
    "Touching a hot surface can trigger a reflex pathway through the spinal cord, reducing the delay before the hand is withdrawn. The response is rapid and protective; the brain also receives information about the stimulus. In a diagram, show the receptor, sensory neurone, relay neurone, motor neurone and effector in the correct order.",
  ],
  "sense organs": [
    "Sense organs contain receptor cells that detect particular stimuli and convert them into electrical signals for the nervous system. The eye detects light, the ear responds to sound and balance, and receptors in the skin respond to pressure, temperature and pain. The brain interprets these signals; receptors themselves do not decide what an object is.",
    "In the eye, the cornea and lens focus light onto the retina. The iris changes pupil size to regulate light entering the eye, while the optic nerve carries signals from the retina to the brain. Compare how pupil size changes in bright and dim conditions, and identify the stimulus and response in each case.",
  ],
  "reproduction in plants": [
    "A flower contains reproductive structures. The anther produces pollen grains; the stigma receives pollen; the ovary contains ovules. Pollination is the transfer of pollen from anther to stigma. After compatible pollen reaches the stigma, a pollen tube can grow toward an ovule; fertilisation occurs when the male nucleus joins the female nucleus.",
    "In many flowering plants, petals and nectar attract animal pollinators, while exposed anthers and feathery stigmas are common adaptations for wind pollination. After fertilisation, the ovule develops into a seed and the ovary into a fruit. Trace these stages in order, distinguishing pollination from fertilisation.",
  ],
  "reproduction in humans": [
    "Human reproduction involves the production of sex cells. The testes produce sperm; the ovaries release ova and produce hormones. Fertilisation is the joining of a sperm cell and an ovum, usually in the oviduct, to form a zygote. The zygote divides and develops as it moves toward implantation in the uterus.",
    "During puberty, hormones bring about changes that prepare the body for adult reproductive function. These changes occur at different times for different people. A diagram should label the main organs accurately and trace the path of sperm or the movement of an ovum without confusing fertilisation with implantation.",
  ],
  "growth and development": [
    "Growth is a lasting increase in size or mass, usually involving an increase in cell number, cell size or both. Development is the series of changes through which an organism becomes more specialized and mature. In plants, a seed germinates when conditions such as water, oxygen and suitable temperature allow the embryo to resume growth.",
    "A bean seed provides a clear sequence: the seed coat absorbs water, the radicle emerges first and forms the root, and the shoot grows upward. Measure seedlings over several days and record the same feature each time. Keep a comparison group if testing one condition, such as light, and avoid changing several variables at once.",
  ],
  "variation": [
    "Variation describes differences among individuals of the same species. Some differences are influenced strongly by genes, some by the environment, and many by both. Blood group is inherited; a person's language depends on the environment in which they grow up; adult height is influenced by genes as well as nutrition and health.",
    "Measure a feature such as hand span in a class and display the results in a frequency table. Some features vary continuously across a range, while others fall into distinct categories. A class sample cannot establish the cause of a difference, so describe the pattern first and avoid treating correlation as proof of inheritance.",
  ],
  "ecology": [
    "Ecology examines relationships among organisms and between organisms and their physical environment. An ecosystem includes living components, such as plants and animals, and non-living factors, such as light, water, soil and temperature. A habitat is the place where an organism lives; a population is all members of one species in an area.",
    "A quadrat can estimate the abundance of plants in a field. Place it at several randomly selected points, count the chosen species each time, and calculate a mean per quadrat. Use the same quadrat size and sampling method at every site; otherwise differences may reflect the method rather than the habitat.",
  ],
  "food chains and webs": [
    "A food chain shows one feeding pathway. It begins with a producer, usually a green plant or alga, followed by consumers. Arrows point from the food to the organism that eats it, showing the direction in which matter and energy move. A food web links several chains because most organisms have more than one feeding relationship.",
    "In a grassland chain, grass may be eaten by a grasshopper, which may be eaten by a lizard. If the lizard population falls, grasshopper numbers may rise and grass may decline, although other feeding relationships can change the outcome. Use a web rather than a single chain when explaining how a change affects an ecosystem.",
  ],
  "population and conservation": [
    "A population changes as individuals are born, die, arrive or leave. Food, water, shelter, disease, predation and competition can affect its size. Conservation protects species, habitats and the ecological processes they depend on. It can include protected areas, habitat restoration, sustainable harvesting and enforcement against illegal wildlife trade.",
    "If a forest is cleared, species may lose food and nesting sites, while soil erosion and water conditions also change. A conservation plan should identify the threatened habitat, the human pressures involved and a way to monitor results, such as vegetation cover or sightings of a target species. Local communities are important partners in lasting conservation.",
  ],
  "microorganisms and disease": [
    "Microorganisms include bacteria, fungi, protozoa and viruses. Some are useful in food production and decomposition; others cause disease. A pathogen can spread through air, contaminated water or food, body fluids, or a vector such as a mosquito. The route of transmission determines which preventive measures are effective.",
    "Cholera can spread through water contaminated with faeces, so safe water, sanitation and handwashing interrupt transmission. Malaria is transmitted by infected mosquitoes, so reducing bites and mosquito breeding sites addresses a different route. Antibiotics act against bacteria, not viruses, and should be used only as directed by a qualified health professional.",
  ],
  "practical biology investigation": [
    "A sound investigation begins with a question that can be tested. State a prediction, identify the independent variable to change, the dependent variable to measure and the factors to keep constant. Use suitable equipment, repeat measurements where possible, record results with units and describe any limitations honestly.",
    "To investigate how light affects seedling growth, use seedlings of the same species and age, vary light exposure, and keep water, soil and temperature as similar as possible. Measure a defined feature at regular intervals. A table should include units; a graph should label both axes and show the pattern without claiming that the results prove more than the method supports.",
  ],
};

const chemistryLessons = {
  "chemistry and laboratory practice": [
    "Chemistry studies the composition, properties and changes of matter. A useful investigation separates an observation from an explanation: a colour change is observed, while a reaction between particles is a proposed explanation. Record measurements with units, label apparatus clearly and repeat readings when possible.",
    "Use a balance to measure mass and a measuring cylinder to measure liquid volume. Wear eye protection, keep chemicals away from food, and never taste a substance or smell it directly. When heating, point the mouth of a test tube away from people and use a holder.",
    "In a notebook, record the question, apparatus, method, results and conclusion. If a result differs from the others, repeat the measurement and report the difference rather than silently changing the value.",
  ],
  "matter and measurement": [
    "Matter has mass and occupies space. Density describes how much mass is contained in a given volume: density = mass / volume. Use compatible units, such as g/cm3 or kg/m3, and measure the volume of an irregular solid by water displacement.",
    "A metal sample has a mass of 54 g and a volume of 20 cm3. Its density is 54 / 20 = 2.7 g/cm3. The result is a physical property that can help identify a pure substance, but temperature and measurement uncertainty should be considered.",
    "Measure an object twice using an appropriate instrument. Record the unit beside every value and explain how a small error in either mass or volume would affect the calculated density.",
  ],
  "atomic structure": [
    "An atom has a small, positively charged nucleus containing protons and neutrons, with electrons occupying regions around it. The atomic number is the number of protons; the mass number is the total number of protons and neutrons. A neutral atom has equal numbers of protons and electrons.",
    "Atoms of the same element can have different numbers of neutrons. These forms are isotopes: carbon-12 and carbon-14 each have six protons, but contain six and eight neutrons respectively. Their chemical behaviour is similar because they have the same electron arrangement.",
    "For an atom written as 23/11 Na, state its proton number, neutron number and electron number. Explain why changing the number of protons would make it a different element.",
  ],
  "elements and periodic table": [
    "An element contains atoms with the same number of protons. The periodic table arranges elements by increasing atomic number. Elements in a group have related chemical properties because their atoms have similar outer-electron arrangements; a period corresponds to a row in the table.",
    "Sodium and potassium are both in Group 1 and each has one outer electron, so both commonly form ions with a charge of +1. Their reactions are similar, but not identical. Most metals lie to the left of the table and non-metals to the right, with a boundary region containing metalloids.",
    "Locate an element from its atomic number and identify its group and period. Use its position to predict whether it is a metal or non-metal and the charge of a simple ion it is likely to form.",
  ],
  "chemical formulae": [
    "A chemical formula uses element symbols and subscripts to show which atoms, or ions, are present and in what ratio. The subscript applies only to the symbol immediately before it: H2O contains two hydrogen atoms for each oxygen atom. A formula does not by itself show how atoms are arranged in space.",
    "Magnesium forms Mg2+ ions and chloride forms Cl- ions. A neutral compound needs two chloride ions for every magnesium ion, so its formula is MgCl2. The total positive and negative charge must balance; the final formula is written in the simplest whole-number ratio.",
    "Read Na2CO3 aloud in terms of its elements and atom counts. Then use ion charges to explain why aluminium oxide has the formula Al2O3 rather than AlO.",
  ],
  "valency and equations": [
    "Valency is a simple way to describe how atoms combine; ionic formulae are more accurately found by balancing the charges on the ions. A chemical equation represents a reaction, and it must have the same number of each type of atom on both sides because atoms are conserved.",
    "For sodium reacting with chlorine, the unbalanced equation is Na + Cl2 -> NaCl. Chlorine is diatomic, so place 2 before NaCl and then 2 before Na: 2Na + Cl2 -> 2NaCl. Changing a coefficient changes the number of particles; changing a subscript would change the substance.",
    "Balance Mg + O2 -> MgO by adjusting coefficients only. Count each element on both sides after every change, then explain why the balanced equation expresses conservation of matter.",
  ],
  "chemical bonding": [
    "Chemical bonds form through interactions involving valence electrons. In ionic bonding, electrons are transferred and oppositely charged ions attract; in covalent bonding, atoms share electron pairs. The type of bonding helps explain a substance's properties, but a structure and the conditions must also be considered.",
    "Sodium transfers one outer electron to chlorine, forming Na+ and Cl- ions in a repeating lattice. Water is different: each molecule has covalent O-H bonds formed by shared electrons. Solid sodium chloride has a high melting point, while water molecules are not joined to one another by the same kind of bond.",
    "Draw a dot-and-cross diagram for a simple ionic compound and a covalent molecule. Mark which electrons are transferred and which are shared, then connect the particle arrangement to one measured property.",
  ],
  "mole concept": [
    "The mole is a counting unit for particles. One mole contains approximately 6.02 x 10^23 specified particles. The amount of substance can be calculated from mass using n = m / M, where n is in moles, m is mass in grams and M is molar mass in g/mol.",
    "Water has a molar mass of 18 g/mol. A sample of 36 g therefore contains 36 / 18 = 2 mol of water molecules. The particles must be named: a mole of molecules is not the same count of atoms when each molecule contains several atoms.",
    "Calculate the amount of substance in 5.85 g of sodium chloride using its molar mass, 58.5 g/mol. Show the unit at each step and state what the answer counts.",
  ],
  "states of matter": [
    "The particle model explains the different properties of solids, liquids and gases. In a solid, particles are close together and vibrate about fixed positions; in a liquid, they remain close but move past one another; in a gas, they are far apart and move randomly.",
    "Heating gives particles more kinetic energy. During melting or boiling, energy is used to overcome attractions between particles, so the temperature can remain steady while the change of state occurs. The substance's particles remain the same chemical substance during a physical change.",
    "Sketch particle arrangements for ice, liquid water and water vapour. Label spacing and movement, then explain why a gas can be compressed more easily than a liquid.",
  ],
  "gas laws": [
    "Gas pressure is caused by particles colliding with the walls of their container. At constant temperature, Boyle's law states that pressure is inversely proportional to volume for a fixed amount of gas: P1V1 = P2V2. Always use matching pressure and volume units on both sides.",
    "A gas occupies 2.0 L at 100 kPa. If its volume is reduced to 1.0 L at constant temperature, its pressure becomes (100 x 2.0) / 1.0 = 200 kPa. The pressure rises because particles collide with the smaller container wall area more frequently.",
    "A syringe contains 30 cm3 of gas at 90 kPa. Find its pressure when compressed to 18 cm3 at constant temperature, then describe one assumption behind the calculation.",
  ],
  "solutions": [
    "A solution is a uniform mixture in which a solute is dispersed among particles of a solvent. In salt water, sodium chloride is the solute and water is the solvent. Dissolving does not destroy the solute; its particles spread through the liquid and can be recovered by removing the solvent.",
    "Concentration describes the amount of solute in a given volume of solution. If 10 g of salt is dissolved to make 0.50 dm3 of solution, the concentration is 10 / 0.50 = 20 g/dm3. Use the final solution volume, not just the volume of solvent added.",
    "Prepare a labelled diagram of salt dissolving in water at the particle level. Calculate the concentration of 12 g of sugar in 0.40 dm3 of solution and include the unit.",
  ],
  "solubility": [
    "Solubility is the maximum amount of a solute that dissolves in a stated amount of solvent at a specified temperature. An unsaturated solution can dissolve more solute; a saturated solution is at the limit under those conditions. Solubility is not the same as the speed at which a solid dissolves.",
    "For many solids, solubility in water increases with temperature, so a hot saturated solution may deposit crystals as it cools. Gas solubility often decreases as temperature rises. Pressure has a strong effect on gases dissolved in liquids, as seen when a carbonated drink releases bubbles after opening.",
    "Use a solubility graph to find how much solute dissolves at two temperatures. Predict what happens when the hotter saturated solution cools, and identify which conditions must be kept constant.",
  ],
  "separation techniques": [
    "Mixtures can be separated by using differences in particle size, boiling point, solubility or attraction to a surface. Filtration separates an insoluble solid from a liquid; distillation separates substances using differences in boiling point; chromatography separates dissolved substances according to how they travel with a solvent.",
    "To recover salt from a mixture of sand and salt, add water so the salt dissolves, filter out the sand, then evaporate some water and allow the solution to crystallise. Distillation would be used instead if the water also needed to be collected.",
    "Choose a sequence of methods for separating iron filings, sand and salt. At each step, name the property used and state which material is collected.",
  ],
  "acids and bases": [
    "Acids produce hydrogen ions in aqueous solution; bases neutralise acids, and soluble bases are called alkalis. Indicators show whether a solution is acidic, neutral or alkaline. The pH scale is logarithmic: a solution at pH 3 has ten times the hydrogen-ion concentration of one at pH 4.",
    "Hydrochloric acid reacts with sodium hydroxide to form sodium chloride and water: HCl + NaOH -> NaCl + H2O. This neutralisation reaction explains why an acid and an alkali can produce a neutral salt solution when the amounts are suitable.",
    "Use an indicator to compare three labelled solutions, record each colour and estimate its pH. Write a word equation for sulfuric acid reacting with potassium hydroxide.",
  ],
  "salts": [
    "A salt is an ionic compound formed when the hydrogen ion of an acid is replaced by a metal ion or ammonium ion. Salts contain positive and negative ions in ratios that give an overall neutral compound. Their names reflect the acid and the positive ion involved.",
    "Sulfuric acid forms sulfate salts; hydrochloric acid forms chloride salts. To prepare copper(II) sulfate from an insoluble base, warm dilute sulfuric acid, add excess copper(II) oxide, filter away the unreacted solid, then evaporate some water and cool the filtrate to form crystals.",
    "Write the name and formula of the salt made from nitric acid and calcium hydroxide. Outline how you would prepare a pure sample if the base were soluble rather than an excess insoluble solid.",
  ],
  "oxidation and reduction": [
    "Oxidation and reduction occur together in a redox reaction. In terms of electrons, oxidation is loss of electrons and reduction is gain; in many familiar reactions, oxidation also involves gain of oxygen and reduction involves loss of oxygen. Use the reaction context to identify which definition applies.",
    "When magnesium reacts with copper(II) oxide, magnesium gains oxygen to form magnesium oxide while copper(II) oxide loses oxygen to form copper. Magnesium is oxidised and copper(II) oxide is reduced. The two changes occur in the same reaction.",
    "For Zn + CuSO4 -> ZnSO4 + Cu, identify which species is oxidised and which is reduced. Support your answer by comparing electron transfer or oxidation states.",
  ],
  "rates of reaction": [
    "Reaction rate describes how quickly reactants are used or products form. The collision theory explains why: particles must collide with enough energy and with a suitable orientation. Increasing concentration, pressure for gases, temperature or solid surface area can increase the frequency of effective collisions; a catalyst provides an alternative pathway with lower activation energy.",
    "Magnesium reacts with dilute hydrochloric acid and produces hydrogen gas. The reaction rate can be compared by measuring the gas volume at equal time intervals. Smaller pieces of magnesium expose more surface area, so more collisions can occur at the solid surface each second.",
    "Plan a fair test of how acid concentration affects reaction rate. State what you will measure, which factors must remain constant and how repeating trials improves confidence in the result.",
  ],
  "energy changes": [
    "Chemical reactions transfer energy between the reacting system and its surroundings. An exothermic reaction releases energy, often raising the surroundings' temperature; an endothermic reaction takes in energy, often lowering it. A temperature change is evidence of energy transfer, not a measure of how fast the reaction occurs.",
    "When a fuel burns, energy stored in chemical bonds is transferred mainly as heat and light. In an energy profile, the products of an exothermic reaction are at lower chemical energy than the reactants. The activation energy is the energy needed to start the reaction.",
    "Record the temperature of a solution before and after a safe classroom reaction. Describe the direction of energy transfer and identify one source of heat loss that could affect the measurement.",
  ],
  "chemical equilibrium": [
    "Some reactions are reversible. In a closed system at dynamic equilibrium, the forward and reverse reactions continue at equal rates, so the concentrations of reactants and products remain constant. The concentrations are not necessarily equal, and equilibrium is not reached when the reaction has stopped.",
    "For a reversible reaction, changing concentration, pressure or temperature can shift the position of equilibrium. A catalyst speeds up both directions and helps equilibrium be reached sooner, but it does not change the equilibrium position. Temperature effects depend on whether the forward reaction is exothermic or endothermic.",
    "For N2 + 3H2 ⇌ 2NH3, predict the effect of increasing pressure on the equilibrium position. Explain your prediction by comparing the number of gas particles on each side.",
  ],
  "water and air": [
    "Air is a mixture of gases, mainly nitrogen and oxygen, with smaller amounts of argon, carbon dioxide and variable water vapour. Water is a compound whose molecules contain hydrogen and oxygen in a fixed ratio. Separating a mixture is a physical process; breaking water into its elements requires a chemical change.",
    "Water for drinking is treated to remove suspended particles and harmful microorganisms; the exact process depends on the water source. Dissolved salts can cause hardness, which forms deposits in pipes and reduces soap lather. Boiling removes temporary hardness but not all dissolved salts.",
    "Compare a sample of clean water with a muddy mixture. Identify a physical method for removing suspended soil and explain why it would not remove dissolved salt.",
  ],
  "organic chemistry": [
    "Organic chemistry studies carbon compounds, especially those containing carbon-hydrogen bonds. Carbon atoms can form four covalent bonds and join into chains, branches and rings. Molecules with the same molecular formula may have different structures; these are structural isomers and can have different properties.",
    "A functional group is an atom or group of atoms that gives a family of organic compounds characteristic reactions. For example, alcohols contain the -OH group, while carboxylic acids contain -COOH. The carbon chain can vary while the functional group remains the same.",
    "Draw two different structures with the formula C4H10 and identify how they differ. Then name the functional group in ethanol and state one property it helps explain.",
  ],
  "hydrocarbons": [
    "Hydrocarbons contain only carbon and hydrogen. Alkanes are saturated and have the general formula CnH2n+2; alkenes contain a carbon-carbon double bond and have the formula CnH2n for a chain with one double bond. Their different bonding leads to different reactions.",
    "Ethene, C2H4, reacts with bromine and decolourises bromine water because the double bond can open and add atoms. Ethane, C2H6, does not show the same rapid addition reaction. Complete combustion of either hydrocarbon produces carbon dioxide and water when oxygen is plentiful.",
    "Write the molecular formula for the first four alkanes and balance the complete combustion equation for methane. Explain what observation can distinguish an alkene from an alkane in a simple test.",
  ],
  "polymers": [
    "A polymer is a large molecule made from many repeating smaller units called monomers. In addition polymerisation, alkene monomers join as their double bonds open; no small molecule is eliminated. In condensation polymerisation, monomers with suitable functional groups join while a small molecule, often water, is released.",
    "Ethene molecules can join to form poly(ethene), whose repeating unit is -CH2-CH2-. The long chains make the material useful for packaging and containers. Different polymers have different properties, and discarded plastics can persist in the environment if they are not reused or managed responsibly.",
    "Draw the repeating unit formed from propene and show how it comes from the monomer. Name one useful property of the polymer and one environmental consideration when disposing of it.",
  ],
  "metals and extraction": [
    "Most metals occur in ores as compounds, so extraction depends on the metal's reactivity. A less reactive metal may be obtained by reducing its oxide with carbon; a very reactive metal, such as aluminium, is extracted by electrolysis because carbon cannot remove oxygen from its stable oxide economically.",
    "In a blast furnace, iron oxide is reduced mainly by carbon monoxide. The iron formed is molten and collects at the bottom, while limestone helps remove acidic impurities as slag. Extraction uses energy and affects the environment, so recycling metals can reduce demand for new ore.",
    "Use a reactivity series to decide whether carbon can extract zinc from zinc oxide. Write a word equation for the reduction and give one reason recycling the metal is useful.",
  ],
  "electrochemistry": [
    "Electrochemistry links chemical reactions with electrical energy. In electrolysis, an electric current drives a non-spontaneous change in an electrolyte. Positive ions move toward the negative cathode and gain electrons; negative ions move toward the positive anode and lose electrons.",
    "When molten lead(II) bromide is electrolysed, lead ions gain electrons at the cathode to form lead, while bromide ions lose electrons at the anode to form bromine. The electrolyte must contain mobile ions; solid ionic compounds do not conduct because their ions cannot move freely.",
    "Label the electrodes and ion movement in an electrolysis diagram. Write the half-equation for a metal ion gaining two electrons at the cathode and explain why molten lead(II) bromide conducts.",
  ],
  "environmental chemistry": [
    "Environmental chemistry examines how substances move through air, water and soil and how human activity changes those systems. Burning fossil fuels releases carbon dioxide; incomplete combustion can produce carbon monoxide; sulfur dioxide and nitrogen oxides contribute to acid deposition. The effect depends on concentration, exposure and local conditions.",
    "Fertiliser runoff can add nitrate and phosphate to surface water. Rapid algal growth may block light, and decomposition of dead algae can reduce dissolved oxygen, harming aquatic organisms. Preventing runoff and treating wastewater address causes rather than only removing visible algae.",
    "Choose one local environmental issue and trace the chemical substance, its source, its movement and its effect. Suggest a way to reduce the source and identify evidence that would show whether the measure worked.",
  ],
  "practical chemistry investigation": [
    "A practical investigation tests a focused question using a clear method. Identify the independent variable to change, the dependent variable to measure and the variables to keep constant. Use suitable apparatus, repeat trials, record observations honestly and include units and uncertainties where appropriate.",
    "To compare how temperature affects the dissolving rate of sugar, use equal masses of sugar and equal volumes of water, vary only the water temperature and stir each sample in the same way. Time until the crystals disappear, repeat the trials and compare the results. This measures rate of dissolving, not solubility.",
    "Write a results table for the investigation and state one limitation of using the time until crystals disappear. Explain how you could make the endpoint more objective.",
  ],
};

const physicsLessons = {
  "physics and measurement": [
    "Physics builds models of the natural world from measurements. A physical quantity is written as a number and a unit; the SI base units include metre (m), kilogram (kg), second (s), ampere (A) and kelvin (K). Derived units combine base units: speed is measured in metres per second.",
    "Measure the length of a desk three times with a metre rule, keeping the rule aligned with the edge. Record each reading to the instrument's precision and calculate a mean. A consistent offset is a systematic error; small unpredictable differences are random errors. Repeating readings reduces the influence of random error but does not remove a systematic one.",
    "Before calculating, convert values to compatible units and check whether the result has the expected unit and size. For example, a classroom 8 m long should not produce a length of 800 km.",
  ],
  "scalars and vectors": [
    "A scalar has magnitude only; examples include mass, time, temperature and speed. A vector has both magnitude and direction; displacement, velocity, acceleration and force are vectors. Direction is part of the answer, not an optional description.",
    "Walk 3 m east and then 3 m west. The total distance is 6 m, but the final displacement is zero because the starting and finishing positions are the same. For vectors along one straight line, choose a positive direction and assign the opposite direction a negative sign before adding.",
    "Sketch a journey with a scale and arrows. Find both the total distance and the resultant displacement, and state clearly why the answers differ.",
  ],
  "motion": [
    "Distance is the total path travelled; displacement is the change in position in a specified direction. Average speed equals distance divided by time, while average velocity equals displacement divided by time. Acceleration is the rate of change of velocity: a = (v - u) / t.",
    "A cyclist increases speed from 4 m/s to 10 m/s in 3 s. The acceleration is (10 - 4) / 3 = 2 m/s2. This means velocity increases by 2 m/s each second, provided the acceleration is uniform; it does not mean the cyclist travels 2 m in a second.",
    "For a moving object, list its initial velocity, final velocity and elapsed time before selecting an equation. Check the direction convention and use SI units throughout.",
  ],
  "distance-time graphs": [
    "On a distance-time graph, time is plotted on the horizontal axis and distance on the vertical axis. The gradient represents speed: a steeper line means a greater speed. A horizontal section shows that the distance from the reference point is not changing.",
    "If a runner travels 60 m in 10 s at constant speed, the graph is a straight line with gradient 60/10 = 6 m/s. A curved graph indicates changing speed; estimate the speed at a particular instant by drawing a tangent and finding its gradient.",
    "Plot the following stages on a labelled graph: walk 20 m in 10 s, wait 5 s, then walk a further 15 m in 5 s. Identify each gradient and explain what the flat section represents.",
  ],
  "velocity-time graphs": [
    "A velocity-time graph shows how velocity changes with time. Its gradient is acceleration, and the signed area between the graph and the time axis is displacement. A line below the time axis represents motion in the negative direction under the chosen sign convention.",
    "A car accelerates uniformly from rest to 12 m/s in 4 s. The graph is a straight line; its gradient is 12/4 = 3 m/s2 and the triangular area gives displacement: 1/2 x 4 x 12 = 24 m.",
    "Draw a velocity-time graph for a trolley moving at 5 m/s for 3 s and then slowing uniformly to rest over 2 s. Calculate the total displacement from the areas under the graph.",
  ],
  "forces": [
    "A force is an interaction that can change an object's motion or shape. Forces are vectors and are measured in newtons (N). The resultant force is the vector sum of all forces on an object. Balanced forces have zero resultant and do not produce acceleration, though the object may continue moving at constant velocity.",
    "A book resting on a table has weight acting downward and a support force from the table acting upward. If the forces are equal, the resultant force is zero. Draw a free-body diagram showing only forces acting on the selected object, with arrows labelled by direction and name.",
    "For a box pulled horizontally, identify its weight, the normal contact force, the pull and friction. Predict how the motion changes if the pull becomes greater than friction, assuming the vertical forces remain balanced.",
  ],
  "newton’s laws": [
    "Newton's first law states that an object remains at rest or moves at constant velocity unless acted on by a resultant external force. Newton's second law relates resultant force, mass and acceleration: F = ma. Newton's third law says interacting bodies exert equal and opposite forces on one another; the pair acts on different bodies.",
    "A net force of 12 N acts on a 3 kg trolley. Its acceleration is a = F/m = 12/3 = 4 m/s2. If the trolley were twice as massive under the same net force, its acceleration would be half as large.",
    "When a swimmer pushes water backward, the water pushes the swimmer forward. Identify the two bodies and the force on each to show why the action-reaction forces do not cancel on a single object.",
  ],
  "momentum": [
    "Linear momentum is the product of mass and velocity: p = mv. Momentum is a vector, so its direction follows the velocity. In an isolated system, total momentum before an interaction equals total momentum after it, provided external forces are negligible during the interaction.",
    "A 0.20 kg ball moving east at 5 m/s has momentum 1.0 kg m/s east. If it collides with a stationary 0.30 kg cart and they move together, conservation gives 1.0 = (0.50)v, so their shared velocity is 2.0 m/s east.",
    "For a collision problem, define a positive direction, write the total initial momentum and total final momentum, and solve with signs included. Explain whether the system can reasonably be treated as isolated.",
  ],
  "work and energy": [
    "Work is done when a force transfers energy by moving an object through a displacement. For a force parallel to the motion, work done is W = Fd and is measured in joules. Kinetic energy is Ek = 1/2 mv2; gravitational potential energy near Earth's surface is Ep = mgh.",
    "A 20 N force moves a box 3 m in its direction, doing 60 J of work. If the same force acts while the box does not move, the force does no mechanical work on the box because displacement is zero, although energy may be transferred in other ways.",
    "A 2 kg object is lifted 1.5 m. Calculate the increase in gravitational potential energy using g = 9.8 m/s2, then describe one pathway by which the person's chemical energy is transferred.",
  ],
  "power": [
    "Power measures the rate of energy transfer or work done: P = W/t. Its SI unit is the watt (W), equal to one joule per second. Two people can do the same work but have different power if they take different times.",
    "A motor transfers 600 J in an interval of 5 s. Its average power is 600/5 = 120 W. For a load raised at constant speed, useful power can also be found from the rate of gain of gravitational potential energy.",
    "A student climbs stairs of vertical height 2 m in 4 s. Estimate the useful power using the student's mass and g = 9.8 m/s2. State which energy transfer your calculation represents and which losses it ignores.",
  ],
  "machines": [
    "A machine changes the size or direction of a force, or the distance over which it acts. Mechanical advantage is load divided by effort; velocity ratio is distance moved by effort divided by distance moved by load. Efficiency is (useful work output / work input) x 100%.",
    "A lever lifts a 300 N load with a 100 N effort, so its mechanical advantage is 3. If friction and other losses are present, the machine's efficiency is below 100%; it cannot produce more energy than it receives.",
    "For a pulley system, count the supporting rope sections to estimate ideal mechanical advantage, then compare the actual effort with the load. Explain why real performance differs from the ideal model.",
  ],
  "pressure": [
    "Pressure is force acting per unit area: P = F/A, measured in pascals (Pa). The same force creates greater pressure over a smaller area. In a fluid at rest, pressure increases with depth because of the weight of fluid above.",
    "A 600 N person stands on shoes with a total contact area of 0.03 m2. The average pressure is 600/0.03 = 20,000 Pa. Narrow heels produce more pressure because their contact area is smaller.",
    "Compare pressure at two depths in the same liquid using P = rho gh. State which quantities are held constant and explain why the deeper point has greater pressure.",
  ],
  "heat and temperature": [
    "Temperature describes how hot or cold a body is and is related to the average kinetic energy of its particles. Heat is energy transferred because of a temperature difference. Temperature is measured in degrees Celsius or kelvin; energy is measured in joules.",
    "When a metal spoon is placed in hot tea, energy transfers from the tea to the spoon by conduction. The spoon's temperature rises as energy spreads through the material. During a change of state, energy can be transferred without a temperature rise because it changes particle arrangement.",
    "Record the temperature of warm water as it cools at fixed time intervals. Describe the trend and distinguish the measured temperature from the energy transfer that causes it.",
  ],
  "thermal expansion": [
    "Most materials expand when heated because their particles vibrate more and their average separation increases. Expansion is generally greatest in gases and least in solids. A temperature change can also cause contraction as a material cools.",
    "Gaps are left between sections of railway track so the rails can expand in hot weather without buckling. A bimetallic strip bends when heated because its bonded metals expand by different amounts; thermostats use this effect to operate a switch.",
    "Describe a safe demonstration of thermal expansion using a ball-and-ring apparatus. Identify the variable changed, the observation made and why cooling reverses the result.",
  ],
  "gas laws": [
    "Gas particles move randomly and collide with the walls of their container; these collisions produce pressure. For a fixed amount of gas at constant temperature, Boyle's law states that pressure is inversely proportional to volume: P1V1 = P2V2.",
    "A gas occupies 3.0 L at 120 kPa. Compressed to 2.0 L at constant temperature, its pressure becomes 120 x 3.0 / 2.0 = 180 kPa. The smaller volume causes more frequent wall collisions.",
    "When solving a gas-law problem, write down the constant condition and convert both volumes and pressures into matching units before substitution.",
  ],
  "waves": [
    "A wave transfers energy from place to place without transporting matter overall. Transverse waves vibrate perpendicular to the direction of travel; longitudinal waves vibrate parallel to it. Wavelength is the distance between successive points in phase, and frequency is the number of cycles each second.",
    "Wave speed is v = f lambda. If a wave has frequency 5 Hz and wavelength 2 m, its speed is 10 m/s. When a wave enters a new medium, its frequency stays set by the source while its speed and wavelength may change.",
    "Sketch one transverse and one longitudinal wave, label amplitude and wavelength, then use v = f lambda to find the speed of a 4 Hz wave with wavelength 0.75 m.",
  ],
  "sound": [
    "Sound is a longitudinal mechanical wave produced by vibrations and transmitted through a medium. It cannot travel through a vacuum. Pitch depends on frequency; loudness is related to amplitude. The speed of sound depends on the medium and its conditions.",
    "An echo returns after sound reflects from a distant surface. If the echo takes 0.8 s to return and sound travels at 340 m/s, the round-trip distance is 340 x 0.8 = 272 m, so the reflecting surface is about 136 m away.",
    "Explain why the distance to the reflecting surface is half the total distance travelled by the sound. Distinguish pitch from loudness in your explanation.",
  ],
  "light": [
    "Light is an electromagnetic wave and can travel through a vacuum. In a uniform medium it travels in straight lines. Reflection changes the direction of light at a surface; refraction occurs when light changes speed as it crosses into a different medium.",
    "A pinhole camera forms an inverted image because rays from the top and bottom of the object cross at the small aperture. A sharper image is produced by a smaller hole, though less light enters.",
    "Draw two rays from the top and bottom of an object through a pinhole to locate the image. Label the image as real or virtual and state its orientation.",
  ],
  "reflection and refraction": [
    "The law of reflection states that the angle of incidence equals the angle of reflection; both angles are measured from the normal, a line perpendicular to the surface. During refraction, a ray bends because its speed changes at a boundary between media.",
    "A ray entering glass from air slows and bends toward the normal. On leaving glass for air it speeds up and bends away from the normal. If it enters along the normal, its speed changes but its direction does not.",
    "Draw a ray entering a rectangular glass block, with a normal at each boundary. Label the angles and explain why the emerging ray is parallel to the incident ray but displaced sideways.",
  ],
  "electric charge": [
    "Electric charge is a property of matter. Protons carry positive charge, electrons carry negative charge and neutrons are neutral. Like charges repel and unlike charges attract. Charge is measured in coulombs; in a closed system, total charge is conserved.",
    "Rubbing two different insulating materials can transfer electrons from one to the other, leaving one negatively charged and the other positively charged. The objects have opposite charges because electrons moved; charge was not created from nothing.",
    "Use a simple electroscope to compare the charge on two objects. Describe the observation that indicates like charges and explain how you would discharge the electroscope safely.",
  ],
  "current electricity": [
    "Electric current is the rate of flow of charge: I = Q/t. It is measured in amperes. Potential difference is the energy transferred per unit charge, while resistance describes how strongly a component opposes current. For an ohmic conductor at constant temperature, V = IR.",
    "A 6 ohm resistor connected to a 12 V supply carries a current of I = V/R = 12/6 = 2 A. A current meter is connected in series; a voltmeter is connected across the component.",
    "Draw a circuit to measure the current through a lamp and the potential difference across it. Identify the meter connections and explain why the circuit should be switched off before changing components.",
  ],
  "electrical circuits": [
    "A circuit must form a complete conducting path for current to flow. In a series circuit, the current is the same at each point and the supply potential difference is shared. In a parallel circuit, each branch has the same potential difference as the supply.",
    "Two 4 ohm resistors in series have a total resistance of 8 ohms. The same resistors in parallel have a total resistance of 2 ohms. Adding a parallel path reduces the equivalent resistance and increases the total current drawn from an ideal fixed-voltage supply.",
    "Draw one series and one parallel circuit using two lamps and a cell. Predict what happens to the remaining lamp when one lamp is removed from each circuit, then explain the difference.",
  ],
  "magnetism": [
    "A magnet has north and south poles; like poles repel and unlike poles attract. The magnetic field describes the direction and strength of the magnetic force at different positions. Field lines outside a bar magnet are conventionally drawn from north to south and never cross.",
    "Iron is attracted to a magnet and can be magnetised; copper is not attracted in the same way. A compass needle aligns with the local magnetic field, so plotting its direction at several points can map the field around a magnet.",
    "Use iron filings or a plotting compass to map the field of a bar magnet. Mark the poles, draw smooth field lines and explain where the field is strongest.",
  ],
  "electromagnetic induction": [
    "Electromagnetic induction is the production of an electromotive force when the magnetic flux through a conductor changes. Moving a magnet into a coil can induce a current; a stationary magnet and coil produce no sustained induced current.",
    "The induced effect becomes greater when the magnet moves faster, the coil has more turns or the magnetic field is stronger. Reversing the direction of motion reverses the induced current. Generators use relative motion between coils and magnetic fields to produce electrical energy.",
    "Connect a coil to a sensitive meter and move a bar magnet into and out of it. Record the direction of deflection for each motion and explain why the meter returns to zero when the magnet is held still.",
  ],
  "atomic physics": [
    "Atoms contain a nucleus of protons and neutrons surrounded by electrons. Nuclear reactions involve changes in the nucleus and can release far more energy per atom than ordinary chemical reactions, which rearrange outer electrons.",
    "In nuclear fission, a heavy nucleus splits into smaller nuclei and may release neutrons that sustain a chain reaction. In fusion, light nuclei combine at very high temperatures. Both processes convert a small amount of mass into energy.",
    "Compare fission and fusion by describing the nuclei involved, the conditions required and one practical challenge in controlling each process.",
  ],
  "radioactivity and applications": [
    "Radioactive decay is the spontaneous, random change of an unstable nucleus. Alpha radiation is strongly ionising but weakly penetrating; beta is more penetrating; gamma is highly penetrating and less ionising. Half-life is the time taken for half the undecayed nuclei in a sample to decay.",
    "A sample has an activity of 800 counts per minute and a half-life of 2 hours. After 2 hours its activity is about 400 counts per minute; after 4 hours it is about 200, ignoring background radiation.",
    "Compare alpha, beta and gamma radiation by their charge, penetration and a suitable shielding material. Explain why radioactive sources are handled with distance, shielding and minimal exposure time.",
  ],
  "practical physics investigation": [
    "A physics investigation begins with a testable question and a model that predicts a measurable relationship. Identify the independent variable, dependent variable and control variables. Select instruments with appropriate ranges, repeat readings and show data in a labelled table or graph.",
    "To investigate how the length of a pendulum affects its period, time several oscillations rather than one, divide the total time by the number of swings and repeat the measurement. Keep the bob and release angle consistent; graph period squared against length to test the expected relationship.",
    "Write a conclusion that refers to the measured pattern and the prediction. State one source of uncertainty and suggest a practical change that would improve the experiment.",
  ],
};

const peLessons = {
  "physical education and health": [
    "Physical education develops movement skills, physical fitness, health knowledge and the ability to take part safely with others. Health includes physical, mental and social wellbeing, not merely the absence of illness. Regular activity supports the heart, muscles, bones, coordination and mood.",
    "Before vigorous activity, check that the space is clear, footwear is suitable and the task matches the participant's ability. Begin with a progressive warm-up and finish with a gradual cool-down. Stop if there is chest pain, faintness or unusual breathlessness and seek appropriate help.",
    "Plan a week that includes enjoyable movement, rest and everyday activity. Explain how you would adapt the plan for a classmate with a different level of fitness.",
  ],
  "fitness assessment": [
    "Fitness tests measure particular components such as endurance, strength, flexibility or speed; no single test measures overall fitness. A useful assessment uses a standard procedure, safe technique and comparable conditions, and records the result with units.",
    "A 20-metre shuttle run can estimate cardiorespiratory endurance, while a sit-and-reach test assesses a limited aspect of flexibility. Results should be interpreted cautiously: age, health, practice, motivation and test conditions affect performance.",
    "Choose a safe test for one fitness component, state what it measures and record a baseline. Repeat it under similar conditions later and compare the results without treating a score as a diagnosis.",
  ],
  "training principles": [
    "Training should apply progressive overload: the body adapts when demand is increased gradually beyond its usual level. Specificity means practice should match the fitness or skill goal; reversibility means gains can decline when training stops. Rest and recovery allow adaptation.",
    "The FITT framework describes frequency, intensity, time and type. A beginner aiming to improve endurance might start with brisk walking several times a week and increase duration gradually rather than suddenly attempting maximal effort.",
    "Set one measurable goal and use FITT to plan a suitable activity. Explain how you will monitor effort and which warning signs mean the session should stop.",
  ],
  "athletics fundamentals": [
    "Athletics includes running, jumping and throwing events. Each event has rules, a sequence of movements and safety requirements. Learning begins with a controlled approach to the technique, followed by practice at a suitable pace and feedback on one feature at a time.",
    "In a relay, the baton must be passed within the exchange zone. The incoming runner maintains speed while the outgoing runner accelerates and receives the baton using an agreed hand signal. A dropped baton or an exchange outside the zone may invalidate the performance.",
    "Observe a relay exchange and record the approach, signal, hand position and timing. Identify one change that could make the exchange safer and more reliable.",
  ],
  "sprint technique": [
    "A sprint is a short-distance race in which acceleration and maximum speed matter. The start places the runner in a stable position; the drive phase uses powerful forward pushes, followed by a more upright sprint with relaxed shoulders and quick, coordinated arm action.",
    "At the finish, continue running through the line rather than slowing just before it. In practice, focus on one cue such as driving the knees or keeping the hands relaxed. Maximal sprint drills require a clear track, appropriate warm-up and adequate rest.",
    "Time a short sprint over a marked distance after a warm-up. Record the time and one technical observation, then repeat after feedback while maintaining safe spacing between runners.",
  ],
  "middle-distance running": [
    "Middle-distance running combines speed and endurance. A runner must choose a pace that can be sustained, respond to other competitors and reserve effort for the finish. Breathing and stride should remain controlled rather than becoming tense early in the race.",
    "Training can combine easy runs to build aerobic capacity with shorter, faster intervals separated by recovery. The distance, pace and rest should match the athlete's experience; sudden increases in workload raise injury risk.",
    "Plan a short interval session for a beginner using a walk-jog pattern. Include warm-up, recovery and a simple way to monitor effort, and explain how the plan would change if the runner felt unwell.",
  ],
  "long jump": [
    "The long jump has four linked phases: approach, take-off, flight and landing. A controlled run-up builds horizontal speed; the athlete takes off from one foot at the board, maintains body control in flight and brings both feet forward for landing.",
    "The measured distance runs from the take-off line to the nearest mark made in the landing pit. Foul take-offs are not measured as valid jumps. Sand should be raked level and the landing area checked before each attempt.",
    "Practise the approach without jumping, then add a controlled take-off and safe landing. Ask a partner to note where the final steps change rhythm and adjust the run-up accordingly.",
  ],
  "high jump": [
    "The high jump asks an athlete to clear a crossbar after a curved or straight approach and one-foot take-off. The approach develops speed and positions the body for take-off; the athlete then uses a technique suited to their experience and lands on the mat.",
    "A safe landing area and stable equipment are essential. Beginners should use low heights and a simple scissor technique under supervision rather than attempting an advanced technique without preparation.",
    "Mark an approach path and rehearse the final steps without a bar. Identify the take-off foot, check the mat and raise the bar only when technique and landing are controlled.",
  ],
  "shot put": [
    "The shot put is pushed from the shoulder using one hand; it is not thrown like a ball. A legal put begins with the shot held near the neck and finishes with the athlete remaining inside the circle until the shot lands.",
    "A beginner can learn the movement from a stationary power position: feet balanced, hips and trunk rotated toward the throwing direction, then the arm extends to push the shot. Use only approved equipment and a sector with no people in front.",
    "Practise the push with a light training ball under supervision. Retrieve equipment only after the teacher signals that all throws have stopped.",
  ],
  "football tactics": [
    "Football tactics organise players to create scoring chances and prevent the opponent from advancing. In possession, a team can create width, offer passing options and move into space. When defending, players protect dangerous areas, communicate and apply pressure without reckless contact.",
    "A simple 4-4-2 describes four defenders, four midfielders and two forwards, but the shape changes as players move. The formation alone does not determine success; decisions depend on the ball, teammates, opponents and available space.",
    "In a small-sided game, pause after a turnover and ask which player should pressure the ball and which teammates should cover passing lanes. Resume play and compare the result.",
  ],
  "basketball tactics": [
    "Basketball tactics use movement, passing and spacing to create a high-quality shot. In attack, players can pass and cut toward the basket, set a legal screen or move to an open area. On defence, maintain a balanced stance and keep between the attacker and the basket.",
    "A fast break begins when a team gains possession and moves forward before the defence is organised. Players should spread into lanes and pass to an unmarked teammate rather than all chasing the ball. A rebound can start a transition in either direction.",
    "Play a 3-on-2 transition drill. Record whether the attackers used width and passed to the open player, then switch roles and practise defending without unsafe contact.",
  ],
  "volleyball tactics": [
    "Volleyball teams coordinate serve reception, setting and attack. A common pattern uses a forearm pass to control the serve, a set to place the ball and a controlled attack over the net. Communication helps prevent two players from colliding or leaving the ball unattended.",
    "Players rotate clockwise when their team wins the right to serve from the opponent. Rotation determines the service order, but players may move into tactical positions after the serve according to the rules being used.",
    "In groups of three, practise pass-set-send over a low net. Call the ball early, keep the contacts controlled and rotate roles so each player practises all three actions.",
  ],
  "handball": [
    "Handball is a team game in which players pass, dribble and shoot toward a goal while defenders try to intercept or block. Players must observe the steps and dribbling rules and should not enter the goal area as an attacker.",
    "A fast pass can move the ball faster than a player can run with it. Attackers create space by moving off the ball; defenders communicate and cover both the ball carrier and likely passing options. Physical contact must stay within the rules.",
    "Use a 4-on-3 passing drill and count how many passes reach an unmarked player. Change the defensive arrangement and discuss how the attackers can respond without pushing or holding.",
  ],
  "gymnastics": [
    "Gymnastics develops balance, flexibility, strength, coordination and control. A sequence should link movements smoothly and be appropriate to the learner's ability. Safe practice requires a suitable surface, clear space, correct equipment and supervision for skills involving inversion or height.",
    "A balance is held with a stable base of support and controlled body alignment. A forward roll requires a tucked head position and rounded back; learners should not place weight directly on the neck. Use progressive practice and mats under teacher guidance.",
    "Create a short sequence using a walk, a low balance and a controlled finish. Perform it on a clear mat and ask a partner to comment on control and safe transitions.",
  ],
  "rhythmic activities": [
    "Rhythmic activities combine movement with a repeated beat, pattern or musical phrase. Learners practise timing, coordination, posture and expressive movement. A count such as 1-2-3-4 helps a group begin together and remember a sequence.",
    "A simple eight-count pattern can alternate side steps and claps. Movements should match the beat and remain within the group's space; participants can adapt the pace or range of movement to suit ability.",
    "Create a four-movement sequence and repeat it twice to an even count. Give one clear cue to help the group stay together and adapt the pattern for a smaller space.",
  ],
  "swimming and water safety": [
    "Swimming is a physical skill and water safety is a separate set of precautions. Enter only a supervised area, follow pool rules, never swim alone and do not dive into shallow or unfamiliar water. A person in difficulty should be helped from a safe position where possible rather than approached by an untrained rescuer.",
    "Beginners practise breathing, floating and moving in shallow water under qualified supervision. A flotation aid is not a substitute for supervision. Open-water conditions can change quickly because of currents, depth, temperature and visibility.",
    "Identify the safe entry point, depth markers and emergency procedures at a swimming venue before activity begins. Explain who should be alerted if someone needs assistance.",
  ],
  "first aid in sport": [
    "First aid is immediate assistance given to an injured or suddenly ill person until appropriate care is available. The first priorities are to check that the scene is safe, assess responsiveness and breathing, summon emergency help and avoid causing further harm.",
    "For a suspected fracture, do not move or straighten the injured limb; keep the person still and get trained help. For a minor sprain, protect the area and seek an adult or qualified first aider. Do not give food, drink or medication to an unconscious person.",
    "Practise explaining how to call for help: give the location, describe what happened and follow the operator's instructions. First-aid skills should be taught and practised by qualified instructors.",
  ],
  "sports injuries": [
    "Sports injuries may be acute, such as a sprain after a sudden twist, or develop gradually through repeated overload. Pain, swelling, reduced movement or inability to bear weight are signs to stop activity and seek appropriate assessment rather than attempting to play through the injury.",
    "Risk can be reduced with progressive training, suitable equipment, safe surfaces, hydration and correct technique, but no routine can prevent every injury. Return to sport should be gradual and guided by symptoms and qualified advice.",
    "Review a training session for one possible injury risk. Suggest a practical change to equipment, workload or technique and explain how it reduces risk.",
  ],
  "nutrition for athletes": [
    "Food and fluids supply energy and materials needed for training, recovery and everyday health. Carbohydrate is an important fuel for moderate and vigorous activity; protein supports tissue repair; fats, vitamins, minerals and water also have essential roles. Needs vary with the person and activity.",
    "A balanced meal before activity can include a familiar carbohydrate-rich food, while regular drinking supports hydration. There is no single diet that suits every athlete, and supplements are not automatically safe or necessary. Young athletes should seek guidance from a qualified health professional rather than follow extreme diets.",
    "Plan an ordinary day of meals and water around a school sports session. Explain which choices provide energy and why familiar foods are preferable to an untested product before competition.",
  ],
  "drugs in sport": [
    "Some substances are prohibited in sport because they can endanger health, distort fair competition or violate sport rules. Doping includes using a prohibited substance or method to enhance performance. Medicines can contain restricted ingredients, so athletes must check with a qualified professional and follow the relevant anti-doping guidance.",
    "An athlete is responsible for what enters their body under many sport rules, even if a product is mistakenly taken. Avoid sharing medicines or supplements and do not use a product based on a teammate's advice.",
    "Discuss a fictional case in which an athlete is offered an unknown supplement. List the health, fairness and rule-related questions to check before making a decision.",
  ],
  "psychology of performance": [
    "Sport performance is influenced by attention, confidence, motivation, emotion and decisions as well as physical skill. A specific process goal, such as keeping the eyes on the ball during a catch, gives a learner something controllable to practise.",
    "A simple breathing routine and a consistent pre-performance cue can help some athletes manage nerves. These strategies are personal; they do not guarantee a result, and persistent distress should be discussed with a trusted adult or qualified professional.",
    "Choose one controllable goal for a skill practice. Record what you did, what helped your concentration and one change to try in the next session.",
  ],
  "leadership and teamwork": [
    "A team works effectively when members communicate, understand roles, make decisions and treat one another fairly. Leadership can be shared: one player may organise defence while another encourages teammates or explains a tactic.",
    "Useful communication is specific and timely, such as calling a teammate's name before a pass or giving a clear safety warning. Blame after an error rarely improves the next action; feedback should describe what happened and what to try.",
    "In a small group game, rotate the captain role. After play, each person names one action that helped cooperation and one way the group can improve its communication.",
  ],
  "rules and officials": [
    "Rules define how a sport is played, how scoring works and what conduct is permitted. Officials apply the rules consistently, manage play and protect participants. Learning the signals and responsibilities of officials helps players understand decisions and participate fairly.",
    "In football, a referee may stop play for an offence and restart it according to the rules; in athletics, officials check that events follow the specified procedures. Local school adaptations should be explained before play begins.",
    "Observe a short game and record one decision by an official. Name the rule involved and explain how respectful communication can resolve a question without disrupting play.",
  ],
  "sports organization": [
    "A sports programme needs clear aims, a schedule, suitable facilities, equipment, supervision and fair access. Organisers should identify risks before an event, assign responsibilities and plan how participants can report a problem.",
    "A school tournament might use a round-robin format so each team plays several matches. The organiser must allow rest time, record results consistently and ensure that the rules and tie-break method are known in advance.",
    "Plan a small class competition with a fixture list, officials, equipment checks and one safety procedure. Explain how you would make participation fair for different skill levels.",
  ],
  "recreation and leisure": [
    "Recreation is voluntary activity undertaken for enjoyment, social connection, skill development or wellbeing. Leisure activities can be active, such as walking or dancing, or quieter, such as reading. The suitable choice depends on interests, access, health and available time.",
    "A community walk can provide physical activity and social contact, but the route should be safe, accessible and appropriate to participants. Weather, traffic, hydration and supervision should be considered when planning group activities.",
    "Make a realistic list of recreational activities available locally and choose one that could be done safely with friends or family. Identify what equipment or permission is needed.",
  ],
  "training programme design": [
    "A training programme starts with a goal and a baseline measure. Use frequency, intensity, time and type to structure activity, progress gradually, include recovery and review results. The programme should be specific to the goal and safe for the participant's age, health and experience.",
    "For a beginner building endurance, three brisk walks each week may be more appropriate than daily maximal running. Duration can increase slowly if the person recovers well. Keep a simple log of activity and how hard it felt.",
    "Write a one-week plan for improving one fitness component. Include warm-up, activity, recovery days and a method to review progress; adapt it if pain or illness occurs.",
  ],
  "sports project": [
    "A sports project uses planning and evidence to improve participation, skill or safety. Define a manageable question, identify who is involved, gather information with permission, and report findings accurately. A project should not expose personal health information or pressure people to take part.",
    "A class could investigate which playground activity is most popular by asking an anonymous, optional question and counting responses. The result describes that class, not every learner in the school, and the project should explain this limitation.",
    "Draft a project question, a simple method and a way to present results. State one ethical precaution and one limitation before collecting any information.",
  ],
};

function lessonText(content) {
  return Array.isArray(content)
    ? content.map((part) => String(part ?? "").trim()).filter(Boolean).join("\n\n")
    : String(content ?? "").trim();
}

function sourceParagraphs(content) {
  return lessonText(content)
    .replace(generatedSection, "")
    .replace(courseMetadata, "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function authoredChapter(title, sections, course) {
  const headings = ["## Explanation", "## Example and application", "## Check your understanding"];
  const body = sections.map((section, index) => `${headings[index]}\n\n${section}`).join("\n\n");
  const levelNote = course.level === "SS1"
    ? "Start by drawing or defining the quantities involved, then work through the example with units."
    : course.level === "SS2"
      ? "Explain why the stated relationship applies, and identify one condition that could change the result."
      : course.level === "SS3"
        ? "In an examination response, show the reasoning as well as the final result and check the units or evidence."
        : "Use the example to explain the idea in your own words, then identify one real situation where it matters.";

  return `# ${title}\n\n${body}\n\n${levelNote}`;
}

function updateTextbookMetadata(course, title, sections, lessonRecord) {
  lessonRecord.summary = sections[0].slice(0, 320);
  lessonRecord.activity = sections[2];
  const objectives = {
    Biology: `Explain ${title.toLowerCase()} using accurate biological terms, an example and relevant observations.`,
    Chemistry: `Explain ${title.toLowerCase()} using particle models, chemical language and evidence.`,
    Physics: `Analyze ${title.toLowerCase()} using an appropriate physical model, measurements and units.`,
    "Physical Education": `Demonstrate safe technique and explain how ${title.toLowerCase()} supports effective participation.`,
  };
  lessonRecord.objective = objectives[course.title] ?? `Explain ${title.toLowerCase()} using accurate subject knowledge and a relevant example.`;
}

function cleanLesson(content, title, course, repeatedParagraphs, lessonRecord) {
  if (course.title === "Chemistry" && lessonRecord.contentVersion !== "textbook-2") {
    const lesson = chemistryLessons[title.toLowerCase()];
    if (!lesson) throw new Error(`Missing Chemistry lesson for "${title}".`);
    lessonRecord.contentVersion = "textbook-2";
    updateTextbookMetadata(course, title, lesson, lessonRecord);
    return authoredChapter(title, lesson, course);
  }

  if (course.title === "Physics" && lessonRecord.contentVersion !== "textbook-physics-1") {
    const lesson = physicsLessons[title.toLowerCase()];
    if (!lesson) throw new Error(`Missing Physics lesson for "${title}".`);
    lessonRecord.contentVersion = "textbook-physics-1";
    updateTextbookMetadata(course, title, lesson, lessonRecord);
    return authoredChapter(title, lesson, course);
  }

  if (course.title === "Physical Education" && lessonRecord.contentVersion !== "textbook-pe-1") {
    const lesson = peLessons[title.toLowerCase()];
    if (!lesson) throw new Error(`Missing Physical Education lesson for "${title}".`);
    lessonRecord.contentVersion = "textbook-pe-1";
    updateTextbookMetadata(course, title, lesson, lessonRecord);
    return authoredChapter(title, lesson, course);
  }

  const paragraphs = sourceParagraphs(content)
    .filter((paragraph) => !repeatedParagraphs.has(paragraph));
  const source = paragraphs.join("\n\n").trim();
  const body = paragraphs.filter((paragraph) => !paragraph.startsWith("# ")).join("\n\n").trim();
  if (
    course.title === "Biology" &&
    (!body || (title.toLowerCase() === "respiration" && body.length < 240))
  ) {
    const lesson = biologyLessons[title.toLowerCase()];
    if (!lesson) throw new Error(`Missing authored biology lesson for "${title}".`);
    updateTextbookMetadata(course, title, lesson, lessonRecord);
    return authoredChapter(title, lesson, course);
  }

  if (!source) return `# ${title}`;
  if (/^#\s/.test(source)) return source;
  return `# ${title}\n\n${source}`;
}

let lessonsCleaned = 0;
let generatedSectionsRemoved = 0;
let minimumWords = Number.POSITIVE_INFINITY;
let maximumWords = 0;
let repeatedParagraphsRemoved = 0;

const courseLessons = new Map();
for (const course of curriculum.courses ?? []) {
  const lessons = (course.modules ?? []).flatMap((module) => module.lessons ?? []);
  const counts = new Map();
  for (const lesson of lessons) {
    for (const paragraph of sourceParagraphs(lesson.content)) {
      counts.set(paragraph, (counts.get(paragraph) ?? 0) + 1);
    }
  }

  const threshold = Math.max(4, Math.ceil(lessons.length * repeatedParagraphThreshold));
  courseLessons.set(
    course,
    new Set([...counts].filter(([, count]) => count >= threshold).map(([paragraph]) => paragraph)),
  );
}

for (const course of curriculum.courses ?? []) {
  const repeatedParagraphs = courseLessons.get(course) ?? new Set();
  for (const module of course.modules ?? []) {
    for (const lesson of module.lessons ?? []) {
      const original = lessonText(lesson.content);
      const source = sourceParagraphs(lesson.content);
      repeatedParagraphsRemoved += source.filter((paragraph) => repeatedParagraphs.has(paragraph)).length;
      const cleaned = cleanLesson(
        lesson.content,
        String(lesson.title ?? "Lesson"),
        course,
        repeatedParagraphs,
        lesson,
      );

      if (original.includes("## Subject explanation and examples")) {
        generatedSectionsRemoved += 1;
      }

      if (cleaned !== original) lessonsCleaned += 1;
      lesson.content = cleaned;

      const words = (cleaned.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []).length;
      minimumWords = Math.min(minimumWords, words);
      maximumWords = Math.max(maximumWords, words);
    }
  }
}

curriculum.meta = {
  ...curriculum.meta,
  lessonEditorialCleanup: {
    lessonsCleaned,
    generatedSectionsRemoved,
    repeatedParagraphsRemoved,
    minimumWords,
    maximumWords,
  },
};

await fs.writeFile(file, `${JSON.stringify(curriculum, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  lessonsCleaned,
  generatedSectionsRemoved,
  repeatedParagraphsRemoved,
  minimumWords,
  maximumWords,
}, null, 2));
