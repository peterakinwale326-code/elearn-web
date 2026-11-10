import fs from "node:fs/promises";
import path from "node:path";

const curriculumPath = path.resolve(process.cwd(), "data", "curriculum.json");
const applyChanges = process.argv.includes("--apply");
const fixedClosers = [
  "Start by drawing or defining the quantities involved, then work through the example with units.",
  "Explain why the stated relationship applies, and identify one condition that could change the result.",
  "In an examination response, show the reasoning as well as the final result and check the units or evidence.",
  "Use the example to explain the idea in your own words, then identify one real situation where it matters.",
];

const englishLessons = {
  JSS2: {
    content: `# Subject-verb agreement

Agreement means that a verb form matches its grammatical subject. In the simple present tense, most singular subjects take a verb ending in -s: The monitor checks the register. Plural subjects use the base form: The monitors check the register. The noun closest to the verb is not always the subject, so identify the subject before choosing the verb.

In “The box of exercise books is on the desk,” the subject is box; “of exercise books” only describes it. Indefinite pronouns such as each, everyone and somebody are treated as singular in standard school English: Everyone has a turn. In the past tense, most verbs do not change for number: She walked; they walked. The verb be is different: She was ready; they were ready.

When two separate subjects are joined by and, use a plural verb: Amina and Musa are reading. Read the whole sentence and check who or what performs the action before editing the verb.`,
    quiz: [
      { question: "Choose the verb that agrees: 'The list of names ___ on the table.'", options: ["are", "is", "were", "have"], answer: 1 },
      { question: "Which sentence has correct agreement?", options: ["Everyone have a copy.", "The pupils walks home.", "Each learner has a notebook.", "The box of pens are open."], answer: 2 },
    ],
  },
  JSS3: {
    content: `# Subject-verb agreement

Subject-verb agreement connects a verb to the grammatical subject, not simply to the nearest noun. A singular subject usually takes a singular present-tense verb: The captain of the players speaks. The plural noun players belongs to a prepositional phrase; captain controls the verb. Remove the phrase to check: The captain speaks.

Compound subjects joined by and usually take a plural verb: The teacher and the class are ready. When either...or or neither...nor joins subjects of different number, the verb commonly agrees with the nearer subject: Either the prefects or the teacher is speaking; either the teacher or the prefects are speaking. A writer can often revise the sentence to avoid an awkward result.

Words such as each, everybody and neither are singular in standard school usage. In questions, the subject may follow the verb: Where are the books? With does, the main verb stays in its base form: Does the learner understand? The auxiliary already marks the subject.`,
    quiz: [
      { question: "Choose the verb: 'Neither the players nor the coach ___ satisfied.'", options: ["are", "were", "is", "have"], answer: 2 },
      { question: "Which question uses agreement correctly?", options: ["Does the pupils understand?", "Do the pupil understands?", "Does the pupil understand?", "Do the pupil understands?"], answer: 2 },
    ],
  },
  SS1: {
    content: `# Subject-verb agreement

In formal English, a finite verb agrees with the head of its subject. In “The quality of the answers is improving,” quality is the head; answers is inside a prepositional phrase and does not determine the verb. Identify the whole subject, then locate its central noun or pronoun.

Subjects joined by and usually take a plural verb, but a single combined idea may be singular: Rice and beans is today's lunch. With either...or and neither...nor, proximity agreement is common, though restructuring may improve a sentence with mismatched subjects. Indefinite pronouns such as each, everyone and nobody take singular verbs. Collective nouns can be singular when the group acts as a unit; the intended meaning and the school's chosen style guide should be consistent.

In “There are several reasons,” reasons is the real subject even though it follows the verb. Amounts, titles and names of subjects are often singular when treated as one unit: Ten kilometres is a long distance; Economics is a school subject.`,
    quiz: [
      { question: "Choose the verb: 'The cause of the delays ___ still unknown.'", options: ["are", "were", "is", "have"], answer: 2 },
      { question: "Which sentence treats an amount as one unit?", options: ["Ten kilometres is a long walk.", "Ten kilometres are a long walk.", "Each kilometre have a marker.", "The kilometre of roads are long."], answer: 0 },
    ],
  },
  SS2: {
    content: `# Subject-verb agreement

Agreement follows the grammatical head of a subject, even when the subject contains long modifiers or a relative clause. In “The list of applicants who meet the requirements is available,” list controls the main verb is; applicants controls the verb meet inside the relative clause. Each clause has its own subject-verb relationship.

Indefinite pronouns such as each, either and neither are normally singular: Neither of the proposals is complete. With either...or and neither...nor, proximity agreement is widely used, but a sentence with contrasting numbers is often clearer when rewritten. In “There are several reasons,” the postponed subject reasons is plural. Collective nouns may take singular agreement when the group is treated as one unit, or plural agreement when members are emphasised; follow a consistent variety and style.

When editing, mark clause boundaries, identify each subject and then check its finite verb. This prevents a plural noun inside a phrase from pulling the main verb away from its subject.`,
    quiz: [
      { question: "In 'The report that the students prepared ___ on the table,' which verb completes the main clause?", options: ["are", "is", "were", "have"], answer: 1 },
      { question: "Which sentence has correct agreement in both clauses?", options: ["The list of pupils who arrive early are posted.", "The list of pupils who arrives early is posted.", "The list of pupils who arrive early is posted.", "The lists of pupils who arrives early is posted."], answer: 2 },
    ],
  },
  SS3: {
    content: `# Subject-verb agreement

In examination editing, trace agreement through the sentence rather than matching a verb to the nearest noun. In “The evidence collected by the investigators points to a different conclusion,” evidence is the subject; investigators is part of a modifying phrase. In a complex sentence, identify the subject and verb of each clause separately.

Compound subjects joined by and generally take a plural verb, while a single title, quantity or combined dish may be singular according to meaning. Each, everyone and neither are treated as singular in standard formal usage. With either...or and neither...nor, agreement with the nearer subject is common, but recasting a sentence can remove an awkward mismatch. Collective nouns require attention to whether the group is presented as one body or as individual members.

Questions and introductory there can invert the usual order: “Where are the documents?” and “There is one concern.” In editing, underline the subject, circle the finite verb and test whether the sentence's meaning supports that form.`,
    quiz: [
      { question: "Choose the correct form: 'The evidence from both witnesses ___ the claim.'", options: ["support", "supports", "have supported", "are supporting"], answer: 1 },
      { question: "Which sentence is correctly edited?", options: ["There is several reasons to wait.", "There are several reasons to wait.", "There has several reasons to wait.", "There was several reasons to wait."], answer: 1 },
    ],
  },
};

const physicalEducationExtensions = {
  "Physical education and health": `Physical education connects movement skill with knowledge about safety, health and participation. A learner can explain why a warm-up suits a planned activity, identify the space and equipment required, then reflect on how the session felt. Health is influenced by many factors, so a lesson should not treat fitness as proof of character or assume that every learner has the same body or access to facilities. Use respectful language and adapted activities where needed. A sound explanation links a movement choice to its purpose and acknowledges when professional health advice is required.`,
  "Fitness assessment": `A fitness assessment is meaningful only when the task, instructions and conditions are consistent. Record the measure, units, date and relevant conditions, and explain what the test can and cannot show. A timed run may reflect pacing and weather as well as endurance; one result is not a diagnosis or a complete profile. Compare a learner with their own earlier record rather than ranking classmates. Stop if discomfort or illness occurs, and use an accessible alternative when a standard test is unsuitable.`,
  "Training principles": `Overload means gradually asking the body to do more than its familiar workload; progression controls how quickly that change occurs. Specificity means practice should relate to the goal, while reversibility describes loss of adaptation when training stops. Recovery is part of training, not a reward after it. A learner preparing for a longer run can increase duration gradually and include rest days rather than suddenly doubling distance. Keep a record of effort and response, and revise the plan if fatigue or pain persists.`,
  "Athletics fundamentals": `Athletics combines track and field events, each with a defined start, route, technique and safety boundary. Before an event, inspect the surface, check equipment and explain where participants may stand or retrieve implements. Officials measure attempts using the event rules, not an informal estimate. Practice should develop coordination and control before speed or distance is increased. Discuss a result alongside its conditions and technique: a personal best is useful evidence of progress, but it does not explain by itself which part of performance changed.`,
  "Sprint technique": `Sprint performance develops through acceleration, upright running mechanics and a controlled finish. Start practice with short distances, clear lanes and enough recovery between efforts; repeated maximal sprints while fatigued can reduce technique and raise risk. Arm action should remain coordinated with the legs, and the runner should look ahead rather than turning toward spectators. Measure times over the same distance and use a consistent start signal. Compare results with the learner's own baseline and explain how practice conditions might affect the time.`,
  "Middle-distance running": `Middle-distance running requires a pace that can be sustained and adjusted to the event. Starting too quickly may cause a sharp drop later, while an excessively cautious pace can leave the runner unable to use available effort. Practise controlled intervals with recovery and learn to recognise breathing and fatigue signals. A coach or teacher should adapt workload to age, experience and conditions. Record distance, time and perceived effort together; time alone cannot show whether a training session was safe or appropriately paced.`,
  "Long jump": `Long jump combines a measured approach, controlled take-off, flight and landing. A learner should practise the run-up at a manageable speed, take off from the designated area and land in a prepared pit under supervision. Keep the runway clear, wait for the signal before retrieving anything and check the sand for hazards. Measure from the take-off line to the nearest mark made in the landing area. Improving distance may require consistent steps and safe technique, not simply running faster on every attempt.`,
  "High jump": `High jump practice begins with safe approach rhythm and take-off control using equipment and landing mats set up by a qualified teacher. Learners should progress in small stages and never attempt a technique beyond their instruction or readiness. Check that the mat is correctly positioned and that the landing area is clear before each attempt. A failed jump can still provide useful information about approach, take-off point or body position. Record the height and conditions, and stop if equipment shifts or the learner feels pain or dizziness.`,
  "Shot put": `Shot put is a pushing action: the implement rests near the neck and is driven from the shoulder rather than thrown like a ball. Practise with an age-appropriate implement and a clearly marked sector. Only one person throws at a time; others wait behind the line and retrieve the shot after the official signal. Measure from the first point of landing to the inner edge of the circle according to the rules. Technique, strength and balance all contribute, but safety procedures take priority over distance.`,
  "Football tactics": `A team tactic describes how players create or defend space, such as spreading out to provide passing options or shifting together to close a route. Practise a tactic in a small-sided game and observe whether players communicate and support the ball carrier. A successful pass depends on timing, accuracy and the receiver's position, not only force. Adjust the number of players and field size so everyone can take part. After play, use a specific moment to explain what worked and what might be changed.`,
  "Basketball tactics": `Basketball tactics involve creating open space, supporting a teammate and choosing when to pass, dribble or shoot. A simple give-and-go can move a defender and create a clear route to the basket. Defensively, players should maintain balance and avoid dangerous contact. Practise decisions at a controlled speed before using a full game, and adapt team size or court area to the group. Review a possession by asking what the players saw and which option was available; this links tactical choices to observable evidence.`,
  "Volleyball tactics": `A volleyball team tries to control the first contact, set a teammate and send the ball into a difficult space. Calling for the ball and moving into a ready position make that sequence more reliable. A tactical choice depends on the opponents' positions and the team's current control, not on a fixed rule to hit hard every time. Practise communication and spacing with a light ball or lower net when appropriate. Review a rally by tracing the contacts and identifying where an alternative decision might have helped.`,
  Handball: `Handball combines passing, movement, shooting and defending within a marked court and goal area. Players move the ball while respecting the steps, dribbling and contact rules taught for the activity. A pass should reach a teammate who has space and time to receive it; a defender should contest possession without unsafe contact. Use modified games to practise one decision at a time, such as finding an open player. Officials apply the agreed rules consistently, and all participants should know how play restarts after a violation.`,
  Gymnastics: `Gymnastics develops strength, balance, flexibility and controlled sequences. Begin with shapes and low-level balances on a clear surface before attempting more complex skills. Mats must be positioned correctly, and equipment-based movements require a qualified teacher and appropriate spotting. Learners should wait until the station is free and report damage immediately. A progression records what can be performed safely and what needs further practice. Assessment should focus on control, technique and improvement rather than pressuring a learner to attempt an unsafe skill.`,
  "Rhythmic activities": `Rhythmic activities coordinate movement with pulse, tempo and repeating patterns. Count beats, practise a simple sequence slowly and then combine steps with changes in level or direction. Keep enough space between participants and choose music and movement that are respectful of cultural context. A group can perform the same rhythm with different movements, so evaluation should consider timing and control rather than identical style. If a sequence becomes confusing, break it into short sections, rehearse transitions and reconnect the parts once each is secure.`,
  "Swimming and water safety": `Water safety begins with supervision, a suitable facility and clear knowledge of depth and conditions. Follow the lifeguard's instructions, never swim alone and do not enter water to rescue someone unless trained. Open water can contain currents and hidden hazards even when the surface looks calm. Walk near a pool, use appropriate flotation equipment only as directed and tell the instructor about relevant health concerns. If someone is in trouble, alert a lifeguard or emergency service immediately rather than attempting an unsafe rescue.`,
  "First aid in sport": `A first aider first checks for danger to themselves and others, then summons the teacher or emergency help. Do not move a person with a possible serious neck or back injury unless there is immediate danger. For a suspected fracture, support the injured area as found and wait for trained assistance; do not try to straighten it. Severe bleeding or breathing difficulty requires urgent help. First-aid actions should match the learner's training and local guidance, and should never delay contacting a qualified responder.`,
  "Sports injuries": `An injury may result from collision, overuse, poor equipment or an unsafe surface. Stop activity when pain, swelling, dizziness or loss of function occurs and tell the teacher; continuing can worsen harm. A learner should not diagnose the injury or return to play solely because a teammate expects it. Follow the school's response procedure and obtain professional assessment where indicated. After recovery, return gradually under suitable guidance. Reviewing the event can identify a hazard or training load that should change, without blaming the injured person.`,
  "Nutrition for athletes": `Food and fluids support activity, growth and recovery, but needs vary with age, health, duration and intensity. Learners should not use supplements or restrictive diets based on a class discussion; seek guidance from a qualified health professional and caregiver. Water access and rest matter during exercise, especially in hot conditions. A snack may help before a long session, but there is no single menu that suits everyone. Discuss practical, balanced choices without commenting on body shape or asking classmates to disclose private eating habits.`,
  "Drugs in sport": `Some substances are prohibited in organised sport because they can create health risks or an unfair advantage. Prescription medicine may be necessary for a health condition, so athletes should not stop or change treatment without medical advice. Check reliable sport rules and consult a qualified professional rather than relying on rumours or supplements advertised online. A fair competition depends on transparent rules, informed decisions and safe support. If a learner is pressured to use a substance, they should speak with a trusted adult or health professional.`,
  "Psychology of performance": `Performance can be affected by attention, confidence, stress, motivation and previous experience. A simple routine such as controlled breathing and a clear task cue may help a learner focus, but it does not guarantee a result. Reflect on what was within the learner's control and what depended on weather, opponents or equipment. Avoid describing nervousness as weakness; it is a common response that can be managed with practice and support. A helpful goal names a behaviour, such as completing a warm-up, rather than demanding a win.`,
  "Leadership and teamwork": `Teamwork depends on shared goals, communication, role clarity and respect. A leader can invite quieter members to contribute, explain a decision and check whether responsibilities are fair. Leadership may rotate so learners practise different roles, including organiser, encourager and observer. After a task, discuss one action that helped the group and one adjustment for next time. A leader's authority does not excuse unsafe conduct or exclusion. Good teamwork allows disagreement about a tactic while keeping the discussion focused on evidence and the group's agreed rules.`,
  "Rules and officials": `Rules define permitted actions, scoring and restarts, while officials observe play and apply those rules. Before a class game, explain the boundaries, key signals and any adaptations for safety or access. Participants should know how to ask a question respectfully and how a decision can be reviewed if the rules allow it. Consistency builds trust, but officials can still make mistakes; record the specific event and use the agreed process. A rule should be applied to the action, not selectively to a disliked player.`,
  "Sports organization": `Sports organisations coordinate competitions, facilities, coaching, safety requirements and membership. Their structure can range from a school team to a local association and a national governing body. Identify which organisation sets a particular rule before assuming that every sport follows the same procedure. Funding, volunteer time and access to facilities influence participation. A case study can trace how a local club registers players, schedules practice and reports safety concerns. Good organisation supports fair access and accountability, not merely the arrangement of fixtures.`,
  "Recreation and leisure": `Recreation is activity chosen for enjoyment, relaxation or social connection, and it can be active or quiet. Walking, dance, informal games and outdoor play are examples that need not require expensive equipment. Choose an activity that fits participants' interests, abilities, space and weather. Agree on boundaries and safe use of any equipment. Afterward, ask whether everyone had a meaningful way to participate and what would make the next session more enjoyable. Recreation can support wellbeing without turning every activity into a competition.`,
  "Training programme design": `A training programme starts with a specific goal and a safe baseline, then balances activity, intensity, frequency and recovery. Plan small increases and record sessions so progress can be reviewed. Include rest and vary activities to support the goal without repeating the same strain every day. A plan should adapt to illness, pain, school demands and access to facilities. Compare results using the same measure over time, and seek qualified advice when symptoms persist. The best plan is one that can be followed safely and revised using evidence.`,
  "Sports project": `A sports project should define a question, such as whether a new warm-up improves readiness for a class activity. Record the plan, participants' consent where needed, the measure used and any safety steps. Compare results under similar conditions and avoid claiming that a small class trial proves a general rule. Protect personal information and report setbacks honestly. The final reflection should state what the evidence supports, what remains uncertain and what change would improve a future trial.`,
};

const physicalEducationFollowUps = {
  "Fitness assessment": `Repeat the assessment only when the learner is rested and the testing instructions remain the same. A change in one score should be interpreted alongside technique and wellbeing.`,
  "Training principles": `For example, increase one training variable at a time and review the response before changing another. This makes the effect of progression easier to understand and control.`,
  "Rhythmic activities": `Use a steady count to check whether the sequence stays aligned with the beat. If timing slips, simplify the pattern before adding another movement.`,
  "Swimming and water safety": `Check supervision, weather and facility rules before every session; a familiar pool can still present hazards when staffing, visibility or water conditions change.`,
  "Sports organization": `Keep a clear record of who manages equipment, safeguarding and schedule changes. Participants should know which adult or organisation receives a concern.`,
  "Recreation and leisure": `Ask participants for feedback privately when needed, since someone may not feel comfortable disagreeing in a group. Use that information to adjust the next activity.`,
  "Sports project": `Present limitations alongside results, including the small group size or inconsistent conditions. This helps readers judge how far the finding can be applied.`,
};

const physicsExtensions = {
  "Physics and measurement": `Every measurement has a resolution and an uncertainty. Record the instrument, unit and number of significant figures justified by the scale; a ruler marked in millimetres cannot support a length quoted to a thousandth of a millimetre. Repeat readings to identify random variation, and check zero error for systematic bias. Convert units before comparing quantities, such as centimetres to metres or minutes to seconds. A clear result includes the measured value, unit, method and any important limitation. Measurement is evidence for a model, not an exact description free from instrument limits.`,
  "Scalars and vectors": `A scalar has magnitude only, while a vector has both magnitude and direction. Distance is a scalar; displacement is a vector from the starting point to the finish. Speed is scalar, whereas velocity includes direction. When adding vectors, use a diagram or resolve them into perpendicular components. A person walking 3 m east and then 4 m north travels 7 m in distance but has a displacement of 5 m northeast. State the reference direction and distinguish the path length from the straight-line change in position.`,
  Motion: `Motion describes how position changes with time relative to a chosen reference point. Average speed equals total distance divided by total time, while average velocity uses displacement. A moving vehicle may have a changing instantaneous speed even when its average speed is constant over a journey. Choose units that match the data and show the rearranged relationship before substituting values. A distance-time record can reveal pauses and changes in pace. Always define the direction of positive motion when direction matters, and check whether the question asks about the whole journey or one interval.`,
  "Distance-time graphs": `On a distance-time graph, the gradient represents speed when distance increases with time. A horizontal segment means distance stays constant, so the object is stationary. A steeper line indicates greater speed, while a curved line shows speed changing. Choose an even scale, label axes with units and plot the measured points before drawing a best-fit line. Do not interpret the vertical intercept without considering the starting distance. Compare two journeys by reading coordinates and calculating gradients over the same time interval, rather than judging only by the length of the drawn line.`,
  "Velocity-time graphs": `The gradient of a velocity-time graph represents acceleration, and the signed area between the graph and time axis represents displacement. A horizontal line shows constant velocity; a line sloping downward may indicate deceleration or acceleration in the negative direction, depending on sign convention. Break a complex graph into simple shapes to calculate area, and state units such as metres per second squared. A graph crossing the time axis indicates a direction change if velocity changes sign. Check whether the question asks for distance or displacement, because areas below the axis affect them differently.`,
  Forces: `A force is an interaction that can change an object's motion or shape. Forces are measured in newtons and represented with direction. A free-body diagram shows the forces acting on one selected object, such as weight downward and a support force upward on a resting book. Balanced forces produce no resultant force, though individual forces still act. If friction is ignored, state that assumption. Identify the system before drawing arrows; including forces that the object exerts on its surroundings can confuse the diagram. Use the resultant force to explain acceleration rather than naming a single force as the cause.`,
  "Newton’s laws": `Newton's first law describes inertia: velocity remains constant when the resultant external force is zero. The second law relates resultant force, mass and acceleration, commonly written F = ma for constant mass. The third law says interaction forces are equal in magnitude and opposite in direction, but they act on different objects and therefore do not cancel on one object's free-body diagram. For a trolley pushed with 6 N and opposed by 2 N, the resultant is 4 N forward. Identify the object and direction before applying the law.`,
  Momentum: `Momentum is the product of mass and velocity, so it is a vector quantity. In a closed system with negligible external resultant force, total momentum before an interaction equals total momentum after it. A collision may conserve momentum while kinetic energy changes into sound, heat or deformation. Use a consistent positive direction and include both objects in the system. Seat belts and padding increase stopping time, reducing average force for a given change in momentum. This explains a safety design through impulse, rather than suggesting that momentum disappears during a collision.`,
  "Work and energy": `Work is done when a force causes displacement in its direction; for a constant force parallel to motion, work equals force multiplied by distance. Energy is transferred between stores, not destroyed. A lifted object gains gravitational potential energy, while a moving object has kinetic energy. State the system boundary and identify useful and dissipated transfers. If a 10 N force moves a box 3 m in its direction, it transfers 30 J of work. If the force is perpendicular to motion, it does no work on the object in this simple model.`,
  Power: `Power is the rate of energy transfer or work done, measured in watts. Two devices may transfer the same energy but have different power if one takes less time. A 600 J task completed in 20 s has an average power of 30 W. For lifting, compare the gain in gravitational potential energy with the time taken, and distinguish input power from useful output power when energy is dissipated. More powerful equipment is not automatically more efficient. State the measured interval and check that energy, time and power units are consistent.`,
  Machines: `Machines change the size or direction of a force, or make a task more convenient; they do not create energy. Mechanical advantage compares output force with input force, while efficiency compares useful output energy with input energy. A pulley system may reduce the effort force but require pulling a longer distance. Friction and deformation account for energy transferred to less useful forms. Draw the input and output forces and distances, then compare their work. A simple machine can make a task easier in one respect while increasing effort in another.`,
  Pressure: `Pressure is force per unit area, measured in pascals. The same force creates greater pressure when applied over a smaller area; this explains why a sharp blade cuts more readily than a blunt one. In fluids at rest, pressure increases with depth because more fluid lies above the point. Compare values only when units and conditions match. For a contact pressure calculation, identify the perpendicular force and contact area rather than using total surface area. In liquids, density and gravitational field strength also affect pressure, so depth alone is not the full model.`,
  "Heat and temperature": `Temperature indicates how hot or cold a body is, while thermal energy depends on the material, mass and temperature change. Heat is energy transferred because of a temperature difference. A thermometer measures temperature, not the total thermal energy of an object. During heating, energy may raise temperature or change state; at a melting point, added energy can separate particles without raising temperature. Use particle explanations to connect observations with energy transfer, and identify whether energy enters or leaves the chosen system.`,
  "Thermal expansion": `Most materials expand when heated because their particles vibrate more and their average separation increases. Different materials expand by different amounts, which matters in bridges, railway tracks and liquid thermometers. Expansion gaps allow structures to change length without buckling, while a bimetallic strip bends because its bonded metals expand unequally. The particles themselves do not generally become larger. Explain the observation using particle motion and compare materials under the same temperature change. In practice, design must allow movement while maintaining structural support.`,
  "Gas laws": `Gas pressure results from particles colliding with container walls. At constant temperature, reducing a fixed gas's volume increases pressure because collisions occur more frequently; at constant volume, raising temperature increases pressure as particles collide more energetically. State which variables are held constant before selecting a gas-law relationship. Convert temperatures to kelvin for proportional calculations and use consistent units. A tyre pressure reading also depends on temperature, so measurements taken in different conditions may not be directly comparable. Explain the particle model alongside the equation to show why the relationship occurs.`,
  Waves: `A wave transfers energy without a net transfer of matter over a full cycle. Transverse waves oscillate perpendicular to the direction of travel; longitudinal waves oscillate parallel to it. Frequency counts cycles per second, wavelength is the distance between matching points, and wave speed equals frequency multiplied by wavelength. In a demonstration with a rope, individual points move while the disturbance travels along the rope. Label amplitude and wavelength carefully; amplitude is not the same as the distance between crests. Use units to check a calculated wave speed.`,
  Sound: `Sound is a mechanical wave that requires a medium; it cannot travel through a vacuum. Frequency affects pitch, while amplitude relates to loudness, though perceived loudness also depends on distance and hearing. A vibrating source causes nearby particles to oscillate and pass energy along the medium. An echo occurs when sound reflects from a surface; the delay can be used to estimate distance if sound speed and travel path are known. Distinguish the motion of particles from the wave's direction of travel. Protect hearing by avoiding prolonged exposure to intense sound.`,
  Light: `Light is an electromagnetic wave and can travel through a vacuum. In a uniform medium it travels in straight lines, which helps explain shadows and pinhole images. White light contains a range of wavelengths that can be separated by a prism because different wavelengths refract by different amounts. Brightness depends on how much light reaches a surface, not simply on the colour. Use a ray diagram with arrows to show direction and keep the normal line perpendicular to the surface. Explain observations using the model while noting that diagrams are simplified representations.`,
  "Reflection and refraction": `The law of reflection states that the angle of incidence equals the angle of reflection, with both angles measured from the normal. Refraction occurs when light changes speed as it passes between media, changing direction unless it enters along the normal. Draw the normal at the point of contact and label angles from it, not from the surface. A ray bends toward the normal when entering a slower medium and away when entering a faster medium. Use a diagram to trace the path through a block, then relate the result to apparent depth or lenses.`,
  "Electric charge": `Electric charge can be positive or negative, and like charges repel while unlike charges attract. Charging by friction transfers electrons; it does not create charge. In a closed system, total charge is conserved. A charged object can attract a neutral object by causing charge separation within it, so attraction does not prove that both objects carry opposite net charges. Use an electron-flow model carefully and distinguish it from conventional current direction. Static charge can discharge suddenly, so avoid experiments near flammable vapour or sensitive electronic equipment.`,
  "Current electricity": `Electric current is the rate of flow of charge, measured in amperes. In a series circuit, current is the same at each point; in parallel branches, current divides according to the branch conditions. Voltage is energy transferred per unit charge, not a substance that flows. Use an ammeter in series and a voltmeter across a component. Draw circuit symbols clearly and check that the source, switch and load form a complete path. A component's resistance can change with temperature, so state whether a relationship assumes constant physical conditions.`,
  "Electrical circuits": `Circuit behaviour depends on how components are connected. In series, the supply voltage is shared and a break stops current everywhere; in parallel, each branch has the same potential difference and a break in one branch may leave others working. Calculate total resistance using the appropriate connection rule and test predictions with a circuit or simulation. Add a switch where it controls the intended path and avoid short circuits that connect source terminals with little resistance. A diagram should match the physical arrangement sufficiently for another learner to build it safely.`,
  Magnetism: `A magnetic field describes the region where a magnetic material or moving charge experiences a force. Field lines show direction and relative strength; they do not physically exist as strings. Around a bar magnet, lines are conventionally drawn from north to south outside the magnet. Current in a wire also creates a magnetic field, and a coil strengthens it. Use a compass or iron filings safely to map patterns, then explain the result with a field model. Keep magnetic materials and strong magnets away from devices that may be affected.`,
  "Electromagnetic induction": `Electromagnetic induction occurs when magnetic flux through a conductor changes, producing an induced voltage. Moving a magnet through a coil can generate current; holding it still produces no continuing change. The induced effect opposes the change that creates it, consistent with conservation of energy. Faster motion, a stronger magnet or more coil turns can increase induced voltage under comparable conditions. A generator uses relative motion between a magnetic field and a conductor. Describe what changes and in which direction, and do not claim that a magnet simply supplies unlimited electrical energy.`,
  "Atomic physics": `Atoms contain a small, positively charged nucleus of protons and neutrons surrounded by electrons. The number of protons defines the element; isotopes have the same proton number but different neutron numbers. Evidence such as scattering experiments supports models of atomic structure, though models are revised as new observations become available. Use nuclide notation carefully and balance proton and nucleon numbers in nuclear equations. Atomic models are explanatory tools, not scale drawings; the nucleus is much smaller than the space occupied by the electron cloud.`,
  "Radioactivity and applications": `Radioactive decay is random for an individual nucleus but predictable across a large sample using half-life. Alpha, beta and gamma radiation differ in charge, ionising ability and penetration. A detector records events, but background radiation must be measured and considered. Applications include medical imaging, treatment and dating, each with benefits and risks. Minimise unnecessary exposure by limiting time, increasing distance and using appropriate shielding under trained supervision. Do not handle sources or make safety decisions without qualified guidance. A half-life calculation describes a population, not the exact decay time of one nucleus.`,
  "Practical physics investigation": `A practical report should describe apparatus, method, measured variables, units, repeats and uncertainty. Change one independent variable systematically and keep relevant conditions constant. Plot a graph with labelled axes and a suitable scale; use the gradient or pattern only when it answers the question. Repeat anomalous readings when possible but retain the original record and explain any exclusion. Compare the conclusion with the prediction and identify a specific improvement, such as a sensor with finer resolution or a longer measurement interval. Evidence should support the claim without overstating precision.`,
};

const physicsFollowUps = {
  "Thermal expansion": `Measure the original length and temperature change when comparing samples. Similar starting dimensions and heating conditions make the expansion comparison fairer.`,
  "Gas laws": `A sealed container should not be heated in an unsafe classroom test. Use a simulation or teacher-approved apparatus and follow pressure-safety guidance.`,
  "Atomic physics": `When comparing atomic models, state which observation each model explains and what it cannot yet account for. Scientific models are revised with evidence.`,
};

const chemistryExtensions = {
  "Chemistry and laboratory practice": `A laboratory conclusion should be based on observations recorded during the procedure, not on what the learner expected to happen. Use suitable apparatus for the quantity measured, label containers and record units. Wear eye protection when instructed, never taste chemicals and do not smell them directly. Keep test-tube openings pointed away from people while heating, and use only teacher-approved procedures. Distinguish an observation, such as a colour change, from an explanation about particles. Good records allow a classmate to understand what was done and identify a source of uncertainty.`,
  "Matter and measurement": `Matter has mass and occupies space. Density is mass divided by volume, so measurements need consistent units; if mass is in grams and volume in cubic centimetres, density is in g/cm3. For an irregular solid, water displacement can estimate volume, but the object must not dissolve or react with the water. Read a measuring cylinder at eye level and record the scale's precision. A measured density can help identify a material, but temperature, impurities and measurement error may affect comparison with a reference value.`,
  "Atomic structure": `The number of protons identifies an element, while neutrons contribute to the nucleus's mass. Electrons occupy regions around the nucleus and participate in bonding. Isotopes have the same proton number but different neutron numbers, so they remain the same element. Use atomic number and mass number carefully when drawing nuclide notation. The atom is mostly empty space relative to its tiny nucleus; textbook diagrams are not to scale. This model helps explain ions and reactions, although quantum models describe electron behaviour more fully than fixed circular paths.`,
  "Elements and periodic table": `Elements in a group often share chemical properties because their atoms have related outer-electron arrangements. Across a period, proton number increases, while properties change in patterns. Metals tend to lose electrons and form positive ions; many non-metals gain or share electrons. These are useful trends rather than rules without exceptions. Locate an element by its symbol and atomic number, then use its position to make a prediction that can be checked against evidence. The periodic table organizes known elements and helps chemists compare behavior systematically.`,
  "Chemical formulae": `A chemical formula shows which elements are present and the ratio of their atoms or ions. H2O contains two hydrogen atoms for each oxygen atom in a molecule; MgCl2 represents a formula unit with one magnesium ion to two chloride ions. Subscripts change composition, while coefficients change the number of particles in an equation. When writing a formula for an ionic compound, balance total positive and negative charge and reduce to the simplest whole-number ratio. Check whether the substance is molecular or ionic before describing what the formula represents.`,
  "Valency and equations": `A balanced chemical equation has the same number of each type of atom on both sides because atoms are rearranged, not created or destroyed in an ordinary chemical reaction. Balance by changing coefficients, never by altering subscripts in a correct formula. Begin with elements that appear in one compound on each side and leave hydrogen and oxygen until later when helpful. Include state symbols when they clarify the process. After balancing, count each atom again and explain what the coefficients mean in terms of reacting particles or moles.`,
  "Chemical bonding": `Ionic bonding involves electrostatic attraction between oppositely charged ions formed by electron transfer; covalent bonding involves shared electron pairs. Metallic bonding is attraction between positive ions and delocalised electrons. These models help explain properties: many ionic solids have high melting points, while metals conduct electricity because electrons can move. Not every substance fits a simple rule, so connect the model to evidence such as conductivity or melting behavior. A particle diagram should show the correct ratio and charge, not imply that electrons disappear during bonding.`,
  "Mole concept": `The mole links a measurable amount of substance to a very large number of particles. The amount in moles equals mass divided by molar mass, with units shown at each step. For example, 18 g of water is one mole when its molar mass is 18 g/mol. Use a balanced equation to determine mole ratios before converting to mass or particles. Check that the calculated amount is physically plausible and distinguish the number of moles from the mass in grams. The concept allows chemists to relate microscopic particles to laboratory-scale quantities.`,
  "States of matter": `In a solid, particles vibrate around fixed positions; in a liquid, they remain close but can move past one another; in a gas, particles are far apart and move freely. Heating changes particle energy and may cause melting or boiling. During a change of state, energy can separate particles without raising temperature. A particle model explains observable shape, flow and compressibility, but does not show particles at their true scale. Use heating and cooling curves to distinguish temperature change from energy absorbed during a phase transition.`,
  "Gas laws": `Gas-law relationships depend on which variables are fixed. For a fixed amount of gas at constant temperature, pressure and volume vary inversely; at constant volume, pressure rises with absolute temperature. Convert Celsius to kelvin before using proportional equations, and keep units consistent. The particle model explains the trends through collision frequency and energy. Real gases may depart from ideal behavior, especially at high pressure or low temperature. Never heat a sealed container in an unsafe experiment; use a simulation or approved apparatus under supervision.`,
  Solutions: `A solution is a homogeneous mixture in which a solute is dispersed in a solvent. The same substance can be a solute in one mixture and a solvent in another, depending on amount and role. Concentration describes the amount of solute in a defined volume or mass of solution. Label glassware and mix carefully when preparing a solution so the final volume is measured accurately. A clear solution is not necessarily pure or safe to drink. Distinguish dissolving from a chemical reaction by considering whether new substances form and whether the change can be reversed by physical separation.`,
  Solubility: `Solubility is the maximum amount of solute that dissolves in a stated amount of solvent at a specified temperature. Many solids become more soluble as temperature rises, while gases often become less soluble; the pattern depends on the substances. A saturated solution is at its limit under the stated conditions. Use a solubility curve to compare values and avoid assuming that more stirring changes the final equilibrium amount. Crystals form when a hot saturated solution cools, provided excess solute can no longer remain dissolved.`,
  "Separation techniques": `Choose a separation method based on a mixture's properties. Filtration separates an insoluble solid from a liquid; evaporation or crystallisation can recover a dissolved solid; distillation separates liquids with different boiling points or recovers a solvent. Chromatography separates substances according to their movement through a stationary material with a solvent. A method should preserve the component being collected and be appropriate to its hazards. Label fractions and explain which physical property enables the separation. A pure-looking sample may still contain dissolved impurities, so additional tests may be needed.`,
  "Acids and bases": `Acids produce hydrogen ions in aqueous solution, while bases accept hydrogen ions or neutralise acids; alkalis are soluble bases. Indicators show pH-related colour changes, but a colour does not measure concentration precisely. In neutralisation, an acid reacts with a base to form salt and water in a typical reaction. Use a labelled equation and distinguish a strong acid, which ionises extensively, from a concentrated acid, which contains a large amount per volume. Handle corrosive solutions with protection and follow the teacher's dilution procedure.`,
  Salts: `A salt is an ionic compound formed when an acid's hydrogen ion is replaced by a metal or ammonium ion. Salts can be prepared by neutralisation, precipitation or reaction of an acid with a suitable metal or carbonate. Choose a method based on solubility: a soluble salt may be crystallised from solution, while an insoluble salt can form as a precipitate. Wash and dry crystals using the prescribed method, and avoid heating a sample to dryness if it may decompose. Write the formula by balancing ion charges.`,
  "Oxidation and reduction": `Oxidation can be described as loss of electrons or gain of oxygen, while reduction is gain of electrons or loss of oxygen. Both occur together in a redox reaction because electrons transferred from one species are received by another. Use oxidation numbers or half-equations to track the change. In a simple metal displacement reaction, identify which atom loses electrons and which ion gains them. Do not label a reaction redox solely because colour changes; use evidence about electron transfer or oxidation-state change.`,
  "Rates of reaction": `Reaction rate measures how quickly reactants are used or products form. Temperature, concentration, pressure for gases, surface area and catalysts can affect collision frequency or the fraction of collisions with sufficient energy. Measure change over a stated time using gas volume, mass loss or another suitable observable. Repeat trials and vary one condition at a time. A catalyst changes the reaction pathway and is not used up overall. A steeper graph indicates a faster rate, but compare gradients over the same interval and units.`,
  "Energy changes": `Exothermic reactions transfer energy to the surroundings, often raising their temperature; endothermic reactions take energy in. A reaction profile shows the energy of reactants and products and the activation energy barrier. Breaking bonds requires energy, while forming bonds releases energy; the overall change depends on the balance. Use a measured temperature change with the mass and specific heat capacity when estimating energy transfer, and state assumptions about heat loss. Distinguish a reaction's energy change from whether it occurs quickly.`,
  "Chemical equilibrium": `In a reversible reaction at dynamic equilibrium, forward and reverse reactions continue at equal rates, so concentrations remain constant in a closed system. Constant concentration does not mean that reaction has stopped. Changing temperature, pressure or concentration can shift the equilibrium position, while a catalyst speeds both directions without changing the equilibrium composition. Predict a shift by considering how the system responds to the change, then relate the prediction to industrial yield and cost. State which variables are controlled when comparing equilibrium conditions.`,
  "Water and air": `Air is a mixture whose composition includes nitrogen and oxygen, with smaller amounts of other gases and variable water vapour. Water can dissolve gases and salts, so a clear sample may still contain contaminants. Test water quality using appropriate measures and reliable procedures rather than appearance alone. Combustion consumes oxygen and can produce carbon dioxide or other pollutants depending on the fuel and conditions. When discussing pollution, identify the source, pathway and affected organisms or people. Sampling location and time matter because environmental concentrations can vary.`,
  "Organic chemistry": `Organic chemistry focuses mainly on carbon compounds, especially those containing carbon-hydrogen bonds. Structural formulae show how atoms are connected, and functional groups help predict characteristic reactions. Isomers can share a molecular formula but differ in structure and properties. Draw bonds clearly and check that each atom has a plausible valency. Organic compounds occur in fuels, foods, medicines and materials; their use should be considered alongside safety and environmental persistence. A formula alone may not reveal the compound's full three-dimensional structure or behavior.`,
  Hydrocarbons: `Hydrocarbons contain only carbon and hydrogen. Alkanes are saturated and generally undergo substitution reactions, while alkenes contain a carbon-carbon double bond and can undergo addition reactions. Complete combustion produces carbon dioxide and water; limited oxygen can produce carbon monoxide or soot. Balance equations and connect products to oxygen supply. Bromine water can test for unsaturation under appropriate laboratory conditions, but follow safety instructions. Compare physical properties across a homologous series and explain how increasing chain length affects boiling point.`,
  Polymers: `Polymers are large molecules made from repeating units. Addition polymers form when monomers with double bonds join without producing a small by-product; condensation polymers form with elimination of a small molecule in each linkage step. The polymer's properties depend on its structure, chain length and processing. Plastics can be durable and useful, but persistence and waste management create environmental challenges. Distinguish the monomer from the repeating unit in a diagram and compare reuse, recycling and disposal options using evidence rather than describing every polymer as identical.`,
  "Metals and extraction": `Metal extraction depends on the metal's reactivity and the composition of its ore. A less reactive metal may be obtained by heating its oxide with carbon, while highly reactive metals require electrolysis of molten compounds. Mining and refining use energy and can affect land and water, so evaluate both material benefits and environmental costs. A displacement reaction can compare relative reactivity: a more reactive metal may displace a less reactive metal from solution. Use balanced equations and identify the substance oxidised and reduced during extraction.`,
  Electrochemistry: `Electrolysis uses electrical energy to drive a non-spontaneous chemical change. Positive ions move toward the cathode and gain electrons; negative ions move toward the anode and lose electrons. Products depend on the ions present, electrode material and whether the electrolyte is molten or aqueous. Label electrodes and show electron transfer in half-equations. Electrical safety and chemical handling rules are essential. In a simple cell, chemical reactions can instead produce electrical energy; distinguish this direction of energy conversion from electrolysis.`,
  "Environmental chemistry": `Environmental chemistry studies substances and reactions in air, water and soil. A pollutant's effect depends on its concentration, persistence, route of exposure and the organisms affected. Compare measurements with a baseline and use a suitable sampling method; a single sample may not represent an entire river or season. Prevention can include cleaner processes, treatment and regulation, but each option has cost and implementation limits. Present evidence with units and dates, distinguish correlation from cause, and identify which authority or community can act.`,
  "Practical chemistry investigation": `Plan a fair investigation by stating a testable question, identifying variables and choosing a measurement that can answer it. Use clean labelled apparatus, repeat trials and record values with units and precision. Follow chemical safety guidance, dispose of materials as instructed and never mix unknown substances. Graph the results where appropriate and explain anomalies without hiding them. A conclusion should match the evidence and note uncertainty, such as heat loss or an endpoint judged by colour. Suggest a specific improvement and explain how it would reduce that limitation.`,
};

const curriculum = JSON.parse(await fs.readFile(curriculumPath, "utf8"));
const changed = { Chemistry: 0, Physics: 0, "Physical Education": 0, English: 0 };
const missingEditorial = [];

for (const course of curriculum.courses ?? []) {
  const headingSet = course.title === "Chemistry" || course.title === "Physics" || course.title === "Physical Education";
  for (const module of course.modules ?? []) {
    for (const lesson of module.lessons ?? []) {
      const currentVersion = String(lesson.contentVersion ?? "");
      const isUneditedVersion = /textbook-(?:2|physics-1|pe-1)$/.test(currentVersion);
      const isFinalVersion = currentVersion === "textbook-3" || currentVersion === "textbook-physics-2" || currentVersion === "textbook-pe-2";
      if (headingSet && (isUneditedVersion || isFinalVersion)) {
        changed[course.title] += 1;
        if (isFinalVersion) continue;

        let content = String(lesson.content ?? "").trim();
        const title = String(lesson.title ?? "Lesson");
        const domainHeadings = course.title === "Chemistry"
          ? [`## Chemical principles in ${title}`, `## Worked chemistry example`, `## Apply ${title}`]
          : course.title === "Physics"
            ? [`## Physical model for ${title}`, `## Worked physics example`, `## Explore ${title}`]
            : [`## Movement concepts in ${title}`, `## Skill in context`, `## Practise ${title}`];
        content = content
          .replace("## Explanation", domainHeadings[0])
          .replace("## Example and application", domainHeadings[1])
          .replace("## Check your understanding", domainHeadings[2]);

        for (const closer of fixedClosers) {
          if (content.endsWith(`\n\n${closer}`)) {
            content = content.slice(0, -closer.length - 2).trimEnd();
            break;
          }
        }

        lesson.content = content;
        lesson.contentVersion = course.title === "Chemistry"
          ? "textbook-3"
          : course.title === "Physics"
            ? "textbook-physics-2"
            : "textbook-pe-2";
        lesson.summary = content.replace(/^#\s+.+\n+/, "").replace(/\s+/g, " ").trim().slice(0, 320);
      }

      if (course.title === "English Studies" && String(lesson.title ?? "").toLowerCase() === "subject-verb agreement" && course.level !== "JSS1") {
        const editorial = englishLessons[course.level];
        if (!editorial) {
          missingEditorial.push(`${course.id}/${lesson.id}: ${course.level}`);
          continue;
        }

        lesson.content = editorial.content;
        lesson.objective = "Identify the grammatical subject in simple and complex sentences, select the agreeing verb form, and justify the choice using sentence structure.";
        lesson.summary = editorial.content.replace(/^#\s+.+\n+/, "").replace(/\s+/g, " ").trim().slice(0, 320);
        lesson.activity = `Edit a short passage by marking each clause's subject and checking its finite verb; explain one correction using the sentence structure.`;
        lesson.commonMistakes = ["Do not match a verb to the nearest noun without identifying the grammatical subject of its clause."];
        lesson.keyTerms = ["subject", "finite verb", "agreement", "clause", "compound subject"];
        lesson.contentVersion = "textbook-en-concord-1";
        lesson.quiz = editorial.quiz.map((question, index) => ({
          id: `${lesson.id}-editorial-q${index + 1}`,
          ...question,
        }));
        changed.English += 1;
      }
    }
  }
}

const physicalEducationCourses = curriculum.courses.filter((course) => course.title === "Physical Education");
const missingPhysicalEducation = [];
const shortPhysicalEducation = [];
let physicalEducationLessons = 0;
for (const course of physicalEducationCourses) {
  for (const module of course.modules ?? []) {
    for (const lesson of module.lessons ?? []) {
      const extension = physicalEducationExtensions[lesson.title];
      if (!extension) {
        missingPhysicalEducation.push(`${course.id}/${lesson.id}:${lesson.title}`);
        continue;
      }

      const content = String(lesson.content ?? "").trim();
      if (!content.includes(extension)) lesson.content = `${content}\n\n${extension}`;
      const followUp = physicalEducationFollowUps[lesson.title];
      if (followUp && !String(lesson.content).includes(followUp)) {
        lesson.content = `${String(lesson.content).trim()}\n\n${followUp}`;
      }
      lesson.contentVersion = "textbook-pe-3";
      lesson.summary = lesson.content.replace(/^#\s+.+\n+/, "").replace(/\s+/g, " ").trim().slice(0, 320);
      const words = (String(lesson.content).match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []).length;
      if (words < 200) shortPhysicalEducation.push(`${lesson.id}:${words}`);
      physicalEducationLessons += 1;
    }
  }
}

const physicsCourses = curriculum.courses.filter((course) => course.title === "Physics");
const missingPhysics = [];
const shortPhysics = [];
let physicsLessons = 0;
for (const course of physicsCourses) {
  for (const module of course.modules ?? []) {
    for (const lesson of module.lessons ?? []) {
      const extension = physicsExtensions[lesson.title];
      if (!extension) {
        missingPhysics.push(`${course.id}/${lesson.id}:${lesson.title}`);
        continue;
      }

      const content = String(lesson.content ?? "").trim();
      if (!content.includes(extension)) lesson.content = `${content}\n\n${extension}`;
      const followUp = physicsFollowUps[lesson.title];
      if (followUp && !String(lesson.content).includes(followUp)) {
        lesson.content = `${String(lesson.content).trim()}\n\n${followUp}`;
      }
      lesson.contentVersion = "textbook-physics-3";
      lesson.summary = lesson.content.replace(/^#\s+.+\n+/, "").replace(/\s+/g, " ").trim().slice(0, 320);
      const words = (String(lesson.content).match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []).length;
      if (words < 200) shortPhysics.push(`${lesson.id}:${words}`);
      physicsLessons += 1;
    }
  }
}

const chemistryCourses = curriculum.courses.filter((course) => course.title === "Chemistry");
const missingChemistry = [];
const shortChemistry = [];
let chemistryLessons = 0;
for (const course of chemistryCourses) {
  for (const module of course.modules ?? []) {
    for (const lesson of module.lessons ?? []) {
      const extension = chemistryExtensions[lesson.title];
      if (!extension) {
        missingChemistry.push(`${course.id}/${lesson.id}:${lesson.title}`);
        continue;
      }

      const content = String(lesson.content ?? "").trim();
      if (!content.includes(extension)) lesson.content = `${content}\n\n${extension}`;
      lesson.contentVersion = "textbook-chemistry-4";
      lesson.summary = lesson.content.replace(/^#\s+.+\n+/, "").replace(/\s+/g, " ").trim().slice(0, 320);
      const words = (String(lesson.content).match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []).length;
      if (words < 200) shortChemistry.push(`${lesson.id}:${words}`);
      chemistryLessons += 1;
    }
  }
}

if (
  Object.values(changed).some((count) => count === 0) ||
  missingEditorial.length ||
  physicalEducationCourses.length !== 3 ||
  physicalEducationLessons !== 81 ||
  missingPhysicalEducation.length ||
  shortPhysicalEducation.length ||
  physicsCourses.length !== 3 ||
  physicsLessons !== 81 ||
  missingPhysics.length ||
  shortPhysics.length ||
  chemistryCourses.length !== 3 ||
  chemistryLessons !== 81 ||
  missingChemistry.length ||
  shortChemistry.length
) {
  throw new Error(JSON.stringify({ changed, missingEditorial, physicalEducationCourses: physicalEducationCourses.length, physicalEducationLessons, missingPhysicalEducation, shortPhysicalEducation, physicsCourses: physicsCourses.length, physicsLessons, missingPhysics, shortPhysics, chemistryCourses: chemistryCourses.length, chemistryLessons, missingChemistry, shortChemistry }));
}

if (applyChanges) await fs.writeFile(curriculumPath, `${JSON.stringify(curriculum, null, 2)}\n`, "utf8");

console.log(JSON.stringify({ mode: applyChanges ? "apply" : "dry-run", changed, missingEditorial }, null, 2));