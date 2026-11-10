import fs from "node:fs/promises";
import path from "node:path";

const curriculumPath = path.resolve(process.cwd(), "data", "curriculum.json");
const applyChanges = process.argv.includes("--apply");

const lessons = {
  "Physical fitness": {
    content: `# Physical fitness

## Fitness for everyday life

Physical fitness is the capacity to carry out ordinary work and physical activity without becoming exhausted too quickly. It is not the same as being an athlete, and it cannot be judged from appearance alone. A person may be strong but tire quickly when running; another may have good endurance but need to develop balance or flexibility. Fitness changes with practice, health, age and rest.

## Building it safely

Walking, active games, dancing and household tasks can all contribute to movement. Improvement comes from regular activity that is suitable for the person, followed by recovery. Start at a manageable pace, drink water, use safe space and stop if pain, dizziness or unusual breathlessness occurs. A simple record of activity and how the body feels is more useful than comparing one learner's performance with another's.`,
    objective: "Explain physical fitness as a set of abilities that supports daily activity and identify safe ways to improve it.",
    activity: "Keep a three-day activity record. Note the activity, its duration, how hard it felt, and one sign that you need rest or water.",
    mistake: "Fitness is not measured by body shape or by one event; different activities draw on different abilities.",
    terms: ["physical fitness", "activity", "recovery", "endurance"],
    quiz: [
      { question: "Which statement best describes physical fitness?", options: ["The ability to perform daily physical tasks effectively and recover appropriately", "Winning every sporting event", "Having a particular body shape", "Training hard without rest"], answer: 0 },
      { question: "A learner feels dizzy during a run. What is the safest response?", options: ["Stop, move to a safe place and tell the teacher", "Run faster to finish sooner", "Ignore it if others are still running", "Skip water for the rest of the day"], answer: 0 },
    ],
  },
  "Health-related fitness": {
    content: `# Health-related fitness

## Fitness that supports health

Health-related fitness describes abilities that help the body function well in daily life. Its commonly taught components are cardiorespiratory endurance, muscular strength, muscular endurance, flexibility and body composition. These are related but not interchangeable. The heart and lungs support sustained activity; muscles produce and repeat force; flexible joints move through a useful range. Body composition describes the proportions of tissues in the body and should not be used to shame or rank classmates.

## Readiness matters

An activity can develop more than one component. Brisk walking mainly challenges endurance, while a controlled wall push-up uses muscular strength and endurance. Progress should be gradual and appropriate to the learner. A fitness check is a way to notice change, not a diagnosis or competition. Compare a learner's current performance with their own earlier record, using the same safe procedure.`,
    objective: "Name the major health-related fitness components and distinguish a fitness check from a medical diagnosis.",
    activity: "Choose two accessible activities and identify the health-related fitness component each is likely to develop, explaining your reasoning.",
    mistake: "A fitness test does not diagnose illness, and a single score does not describe a person's overall health.",
    terms: ["health-related fitness", "cardiorespiratory endurance", "muscular strength", "flexibility"],
    quiz: [
      { question: "Which component is most directly challenged by a sustained brisk walk?", options: ["Cardiorespiratory endurance", "Flexibility", "Reaction time", "Body composition alone"], answer: 0 },
      { question: "What is the best use of a repeated fitness check?", options: ["Compare progress using the same safe procedure", "Diagnose a disease", "Rank learners by body type", "Replace advice from a health professional"], answer: 0 },
    ],
  },
  "Components of fitness": {
    content: `# Components of fitness

## Different abilities, different demands

Health-related components include cardiorespiratory endurance, muscular strength, muscular endurance, flexibility and body composition. Skill-related components include speed, agility, balance, coordination, power and reaction time. A sport rarely depends on only one. A footballer needs endurance to keep moving, agility to change direction, coordination to control the ball and strength to contest space safely.

## Make a fair comparison

Strength is the force a muscle can produce; muscular endurance is its ability to repeat or sustain work. Power combines force with speed. Speed is moving quickly, while agility is changing direction with control. Balance keeps the body stable; coordination links movements smoothly. These distinctions help a learner select suitable practice. They do not mean one component is more valuable in every sport or for every person.`,
    objective: "Distinguish commonly confused fitness components and relate them to the demands of a sport.",
    activity: "Select a sport and make a two-column chart: the movement demands you observe and the fitness components that support them.",
    mistake: "Speed, agility and power are related but have different meanings; do not use their names as if they were synonyms.",
    terms: ["strength", "muscular endurance", "power", "agility", "coordination"],
    quiz: [
      { question: "A player changes direction quickly while staying in control. Which component is most evident?", options: ["Agility", "Flexibility", "Body composition", "Static strength"], answer: 0 },
      { question: "Which statement distinguishes strength from muscular endurance?", options: ["Strength concerns force; endurance concerns sustaining or repeating effort", "Strength is balance; endurance is reaction time", "They mean exactly the same thing", "Endurance is the fastest movement"], answer: 0 },
    ],
  },
  "Warm-up and cool-down": {
    content: `# Warm-up and cool-down

## Prepare before vigorous movement

A warm-up moves the body gradually from rest toward the demands of exercise. It can begin with easy walking or jogging, followed by controlled movements that resemble the activity ahead. For a game involving changes of direction, learners might add gentle side steps and short accelerations after their pulse and breathing have begun to rise. A warm-up should not leave the class exhausted.

## Return to rest gradually

A cool-down reduces activity at a steady pace rather than stopping abruptly after hard exercise. Easy walking and calm breathing allow the body to settle. Gentle stretching may follow when muscles are warm; bouncing or forcing a stretch is not necessary. Neither routine guarantees that injury will never occur, but preparation, suitable technique, safe space and attention to discomfort all help reduce avoidable risk.`,
    objective: "Describe how a progressive warm-up and cool-down prepare for and end physical activity.",
    activity: "Plan a five-minute warm-up for a chosen game. Put the activities in order from easiest to most like the game, and explain the progression.",
    mistake: "A warm-up is not a tiring workout, and stretching through sharp pain is not a safe preparation method.",
    terms: ["warm-up", "cool-down", "pulse", "progression"],
    quiz: [
      { question: "Why should a warm-up move from easy activity toward game-like movement?", options: ["It raises activity gradually and prepares the body for the task", "It uses up energy before the game", "It guarantees that no injury can happen", "It replaces learning the rules"], answer: 0 },
      { question: "What is a suitable cool-down after vigorous activity?", options: ["Reduce effort gradually with easy movement", "Sit down suddenly without checking how you feel", "Sprint until completely exhausted", "Force a stretch until it hurts"], answer: 0 },
    ],
  },
  "Athletics": {
    content: `# Athletics

## A family of track and field events

Athletics includes running, jumping and throwing events. Track events use marked lanes or routes; field events take place in a designated area. Each event has its own technique and rules, but all require preparation, attention to instructions and respect for other competitors. The event is not simply a test of effort: a legal attempt must follow the rules for the start, route, landing area or implement.

## Organise a safe event

Before practice, inspect the surface and equipment, mark boundaries, and make sure participants know when to begin and where to wait. In throwing events, only the thrower enters the throwing area, and everyone retrieves an implement after the teacher's signal. In jumping events, the landing area must be clear. Officials apply the same rules to each competitor and record attempts consistently.`,
    objective: "Classify athletics events and explain how event rules and safe organisation protect participants.",
    activity: "Sort a list of school events into track and field categories, then write one safety check for each category.",
    mistake: "Athletics is broader than running; jumping and throwing are also field events with distinct safety rules.",
    terms: ["track event", "field event", "attempt", "official"],
    quiz: [
      { question: "Which pair contains one track event and one field event?", options: ["A 100-metre race and a long jump", "A relay and a sprint", "A high jump and a shot put", "A discus throw and a javelin throw"], answer: 0 },
      { question: "When should a class retrieve a thrown implement?", options: ["After the teacher or official gives the signal", "While another learner is preparing to throw", "Whenever a learner wants to", "Before the attempt is recorded"], answer: 0 },
    ],
  },
  "Running events": {
    content: `# Running events

## Distance changes the race plan

Sprints, middle-distance races, long-distance races and relays place different demands on runners. A sprint requires a controlled start and rapid acceleration. Longer races require a pace the runner can maintain; starting too fast can leave little energy for the finish. Relay teams add baton exchange, timing and communication. In every race, runners must follow the start signal and remain within the rules for their event.

## Practise with control

Use a clear, even surface and leave space beyond the finish so runners can slow down safely. Warm up before fast running, wear suitable footwear and do not cross another runner's lane. A teacher can help learners compare pacing by recording split times over equal sections. The aim is to understand effort and technique, not to push through pain or compete while unwell.`,
    objective: "Compare the demands of sprint, distance and relay races and identify safe running practice.",
    activity: "Record two equal sections of a comfortable run. Compare the times and describe whether your pace stayed steady.",
    mistake: "A distance runner does not need to sprint every section; pace should match the event and the runner's readiness.",
    terms: ["sprint", "pace", "lane", "relay", "baton"],
    quiz: [
      { question: "What is a sensible pacing choice for a long-distance race?", options: ["Choose an effort that can be maintained across the distance", "Sprint at maximum speed from the first step", "Copy another runner without noticing your own condition", "Ignore the route and start signal"], answer: 0 },
      { question: "What must relay teammates coordinate?", options: ["The timing and legal exchange of the baton", "The removal of lane markings", "The order in which spectators run", "A finish before the start signal"], answer: 0 },
    ],
  },
  "Jumping events": {
    content: `# Jumping events

## Run-up, take-off and landing

Long jump and triple jump measure distance; high jump measures height. Each event uses an approach, a take-off and a landing, but the technique and rules differ. A long jumper accelerates along a run-up and takes off before the board or line. A high jumper approaches the bar and lands on the prepared landing mat. In triple jump, the sequence of hop, step and jump must remain in order.

## Safety is part of technique

Check that the landing area is level, clear and suitable before anyone begins. Take turns, wait behind the approach line and do not cross the run-up while another learner is jumping. Land in the designated area and leave it promptly when safe. Beginners should practise controlled approaches and balanced landings before trying for distance or height.`,
    objective: "Describe the phases of a jump and distinguish the rules and safety needs of jumping events.",
    activity: "Sketch a long jump approach with the take-off line and landing area labelled; add two checks the class should make before practice.",
    mistake: "A jump is not measured from wherever the jumper lands; event rules define the legal take-off and measurement point.",
    terms: ["approach", "take-off", "landing area", "foul"],
    quiz: [
      { question: "In a long jump, what makes an attempt a foul at take-off?", options: ["Taking off beyond the permitted line or board", "Landing with both feet", "Using a controlled run-up", "Waiting for the area to clear"], answer: 0 },
      { question: "What should a learner do before a jumping attempt?", options: ["Check that the landing area is clear and wait for a turn", "Cross the run-up while another person approaches", "Land on an unprepared surface", "Begin before instructions are given"], answer: 0 },
    ],
  },
  "Throwing events": {
    content: `# Throwing events

## Technique and event rules

Shot put, discus and javelin are throwing events, but each implement is held and released differently. A shot is pushed from near the shoulder; it is not thrown like a ball. A discus is released with a controlled turning action, while a javelin is carried and thrown in a marked direction. In competition, the implement must land within the sector and the athlete must follow the event's boundary rules for a legal attempt.

## Control the throwing area

Use only equipment approved for the learner and setting. The teacher controls when the throwing area is active. Throwers wait for a clear signal, aim only into the designated sector and remain behind the line until instructed. No one walks in front of a thrower or retrieves an implement early. Technique is developed with supervision; distance never takes priority over control.`,
    objective: "Identify basic differences among throwing events and state the controls needed for safe practice.",
    activity: "Draw a throwing sector and label the waiting area, thrower's position and safe retrieval route.",
    mistake: "A javelin or discus must never be thrown when people are in or near its landing sector.",
    terms: ["implement", "sector", "attempt", "retrieval"],
    quiz: [
      { question: "How is a shot put properly released?", options: ["Pushed from near the shoulder", "Kicked toward the sector", "Thrown like a small ball from behind the head", "Dropped from the boundary"], answer: 0 },
      { question: "What signals that implements may be retrieved?", options: ["The teacher or official confirms all throwing has stopped", "One learner finishes their own throw", "A spectator enters the field", "The thrower turns away"], answer: 0 },
    ],
  },
  "Football skills": {
    content: `# Football skills

## Control before speed

Football combines passing, receiving, dribbling, shooting and defending. A useful pass reaches a teammate in a space they can play, not merely in their direction. Receive with a suitable part of the foot and cushion the ball so it stays close. When dribbling, keep the ball within playing distance and look up often enough to notice teammates and opponents. Defending begins with balance and positioning; charging into a player is not a safe way to win the ball.

## Play within the rules

A team uses the field, goal and restart rules set for the game. Learners should wear suitable footwear, remove unsafe jewellery and check the playing surface. Use a smaller-sided game to give everyone more touches. Communicate with clear calls, share the ball and stop immediately when the teacher signals an injury or unsafe play.`,
    objective: "Explain how basic football techniques and fair play work together during a small-sided game.",
    activity: "In pairs, practise receiving and returning a pass with both feet. Count controlled returns rather than the hardest kicks.",
    mistake: "A strong kick is not automatically a good pass; direction, control and the receiver's position matter.",
    terms: ["pass", "control", "dribble", "marking", "fair play"],
    quiz: [
      { question: "What is the main purpose of cushioning the ball when receiving a pass?", options: ["Keep the ball close enough to control the next action", "Make the ball travel farther away", "Avoid looking at the field", "Replace communication with teammates"], answer: 0 },
      { question: "Which is a safe and fair defensive action?", options: ["Stay balanced and position yourself without charging into an opponent", "Push an opponent away from the ball", "Trip a player who is moving past", "Ignore the teacher's stop signal"], answer: 0 },
    ],
  },
  "Basketball skills": {
    content: `# Basketball skills

## Move, pass and control the ball

Dribbling means bouncing the ball with one hand while moving; a player must not carry it or dribble again after gathering it. A chest pass travels directly from the chest toward a teammate, while a bounce pass reaches the floor before the receiver. A jump shot uses coordinated leg and arm action, with the player landing under control. Good decisions matter as much as technique: pass when a teammate has a clearer route to the basket.

## Safe play in a shared space

Keep eyes up while dribbling, give other players room to land and avoid contact that could cause a fall. Use a ball suited to the group and check that the floor is dry. In practice, learners can begin stationary, then add walking and finally defenders. Calling a teammate's name before passing helps them prepare to receive.`,
    objective: "Demonstrate basic basketball control and explain how spacing and communication improve safe play.",
    activity: "Practise chest and bounce passes in pairs, moving one step farther apart only after ten controlled catches.",
    mistake: "A bounce pass is aimed at a reachable point on the floor, not directly at a teammate's feet.",
    terms: ["dribble", "chest pass", "bounce pass", "rebound", "spacing"],
    quiz: [
      { question: "When is a bounce pass useful?", options: ["When the ball can travel under a defender to a teammate", "When the floor is unsafe or slippery", "When a teammate is not looking", "When the player wants to carry the ball"], answer: 0 },
      { question: "What should a player do after gathering the ball from a dribble?", options: ["Pass or shoot without beginning a second dribble", "Run while holding it", "Start dribbling again immediately", "Push through nearby players"], answer: 0 },
    ],
  },
  "Volleyball skills": {
    content: `# Volleyball skills

## Build a controlled rally

Volleyball teams try to send the ball over the net so it lands in the opponent's court while preventing it from touching their own floor. A forearm pass uses joined hands and a stable platform; the ball contacts the forearms, not the wrists. An overhead set uses the fingertips above the forehead to direct a high ball for an attacker. A serve begins the rally from behind the end line. Teams communicate early so players do not collide while moving toward the same ball.

## Learn with a suitable ball

Start close to the net with a softer ball and a low net if needed. Practise sending the ball to a partner before adding movement or score. Keep fingers relaxed during a set and avoid striking the ball with a closed fist unless the teacher has taught a safe technique. Check the floor and posts before play, and rotate positions according to the agreed rules.`,
    objective: "Describe the roles of the forearm pass, set and serve in a volleyball rally.",
    activity: "In groups of three, pass, set and catch a soft ball in sequence; identify the communication that prevents two players reaching at once.",
    mistake: "A forearm pass is made with a stable forearm platform, not by swinging the wrists at the ball.",
    terms: ["forearm pass", "set", "serve", "rally", "rotation"],
    quiz: [
      { question: "Which technique is commonly used to direct a high ball to an attacker?", options: ["An overhead set", "A foot trap", "A chest pass", "A javelin release"], answer: 0 },
      { question: "Why should volleyball players call for the ball?", options: ["To coordinate movement and reduce collisions", "To stop teammates from moving", "To replace the rules of rotation", "To make the ball touch the floor"], answer: 0 },
    ],
  },
  "Gymnastics": {
    content: `# Gymnastics

## Shape, balance and controlled movement

Gymnastics develops body control through shapes, balances, rolls and linked movements. A stable balance has a clear base of support and controlled posture. A sequence joins movements so that one action prepares for the next. Learners first practise simple shapes close to the floor, where a teacher can check alignment and safe spacing, before attempting more difficult skills.

## Use equipment only as taught

Mats should lie flat, with enough space around them. Remove jewellery, secure loose clothing and wait for a teacher's instruction before using apparatus. Do not copy a difficult movement from a classmate or attempt a headstand, vault or backbend without direct supervision and suitable preparation. A partner may observe a sequence, but should not physically catch or lift another learner unless trained and instructed to do so.`,
    objective: "Explain how balance, body shape and safe progression support a basic gymnastics sequence.",
    activity: "Create a three-part floor sequence using a low shape, a controlled balance and a safe transition; have a partner check spacing and stillness.",
    mistake: "A soft mat does not make an unsupervised or unpractised skill safe.",
    terms: ["balance", "base of support", "sequence", "apparatus"],
    quiz: [
      { question: "What helps a learner hold a stable balance?", options: ["A controlled posture and suitable base of support", "Rushing into the position", "Closing the eyes before learning the skill", "Standing on an unstable object"], answer: 0 },
      { question: "When may a learner attempt a difficult gymnastics skill?", options: ["After instruction, suitable preparation and direct supervision", "Whenever a classmate demonstrates it", "On any available surface", "Without checking equipment"], answer: 0 },
    ],
  },
  "Dance and rhythmic movement": {
    content: `# Dance and rhythmic movement

## Movement organised in time

Dance uses body actions, space, time and energy to express an idea or follow a pattern. Rhythm is the pattern of sounds and silences; tempo is how fast or slowly the beat moves. A movement phrase is a short sequence that can be repeated or varied. Learners can explore clapping, stepping and turning before joining movements into a group pattern. Dance may be traditional, social or newly choreographed, and no single style represents every community.

## Create and perform respectfully

Give each person room to move, agree on a safe direction of travel and use music at a volume that allows instructions to be heard. When learning a cultural dance, ask about its context and use movements respectfully rather than treating a tradition as a costume or joke. A performer can change level, direction or energy while keeping the rhythm of the phrase.`,
    objective: "Use rhythm, space and movement to create a short phrase and describe one element of its structure.",
    activity: "Make an eight-count movement phrase with a partner. Identify its rhythm, one change of level and a respectful way to introduce its context.",
    mistake: "Tempo and rhythm are related but different: tempo is speed, while rhythm is the pattern of beats and silences.",
    terms: ["rhythm", "tempo", "movement phrase", "space", "energy"],
    quiz: [
      { question: "What does tempo describe in a dance?", options: ["The speed of the beat", "The floor area alone", "The clothing worn by performers", "The number of spectators"], answer: 0 },
      { question: "Which choice shows respect when presenting a community dance?", options: ["Explain its context and avoid mocking its movements", "Claim one dance represents every community", "Use it as a joke without learning about it", "Change its meaning without discussion"], answer: 0 },
    ],
  },
  "Swimming safety": {
    content: `# Swimming safety

## Prevention comes before swimming skill

Water can be dangerous even for a confident swimmer. Swim only where a responsible adult or qualified lifeguard is present, in a designated area, and with permission. Never enter water to rescue someone yourself; raise the alarm and get trained help. Do not push others, run on a wet poolside, dive into water of unknown depth or swim during a storm. A life jacket must fit properly and is not a reason to ignore supervision.

## Follow local instructions

Check depth markers, pool rules and weather before entering. Learners who are not confident in water should remain in the shallow area under direct supervision and use approved flotation equipment only as instructed. If someone is in trouble, alert the lifeguard, call for help and follow emergency directions. Swimming lessons should take place with qualified supervision and equipment suited to the learner.`,
    objective: "Identify common water hazards and describe actions that prevent drowning and unsafe rescue attempts.",
    activity: "Review a pool or water-safety scenario and write the sequence for alerting a responsible adult and getting trained help.",
    mistake: "A learner should not enter water to attempt a rescue; call for trained help and follow the emergency plan.",
    terms: ["supervision", "designated area", "lifeguard", "flotation device"],
    quiz: [
      { question: "A person appears to be struggling in water. What should a learner do first?", options: ["Alert the lifeguard or responsible adult and call for help", "Jump in without training", "Run away without telling anyone", "Wait until the person reaches the edge"], answer: 0 },
      { question: "Where should a beginner swim?", options: ["In a designated area with direct qualified supervision", "Alone in an unfamiliar river", "Beyond the depth marker", "Anywhere a flotation toy is available"], answer: 0 },
    ],
  },
  "First aid": {
    content: `# First aid

## Help while keeping the scene safe

First aid is immediate, temporary help given to someone who is injured or suddenly unwell until appropriate medical care takes over. A learner's first responsibility is safety: do not enter traffic, touch exposed electrical wires or approach a dangerous scene. Call the teacher or another responsible adult, send someone for help and follow the school's emergency plan. Tell the helper what happened, where it happened and what you can see.

## Do not make an injury worse

For a small cut, an adult can help clean it and cover it with a suitable dressing. Do not remove an object stuck in a wound or give food or drink to someone who is unconscious. If a person is unresponsive, having difficulty breathing or bleeding heavily, get emergency help immediately. First aid training matters; a textbook cannot replace supervised practical instruction or professional care.`,
    objective: "Define first aid and choose safe actions for common school emergencies while seeking adult help.",
    activity: "Use a classroom scenario to practise giving a clear emergency message: location, what happened, hazards and the person's visible condition.",
    mistake: "Do not move a seriously injured person or attempt a procedure beyond your training unless an immediate danger requires it.",
    terms: ["first aid", "emergency", "hazard", "dressing", "trained help"],
    quiz: [
      { question: "What should a learner do before helping at an accident scene?", options: ["Check for danger and call a responsible adult", "Rush into traffic", "Move every injured person", "Give an unconscious person food"], answer: 0 },
      { question: "Which information is most useful when calling for help?", options: ["The location, what happened and visible condition of the person", "A guess about the person's medical history", "The names of everyone watching", "A promise that the injury is harmless"], answer: 0 },
    ],
  },
  "Personal hygiene": {
    content: `# Personal hygiene

## Everyday habits that protect health

Personal hygiene includes habits that keep the body and shared surroundings clean. Washing hands with soap and clean water before eating and after using the toilet removes many germs. Bathing, wearing clean clothing, caring for teeth and keeping fingernails clean also support comfort and health. Menstrual hygiene is part of ordinary health care; learners should have access to clean materials, privacy and a trusted adult when they need support.

## Hygiene needs water and facilities

Good hygiene is not a reason to shame someone. Clean water, soap, toilets and waste disposal are essential, and not every household has equal access to them. In school, learners can help keep facilities usable by disposing of waste properly and reporting a broken tap or unsafe toilet. Handwashing should cover palms, backs of hands, between fingers and fingertips, then hands should be rinsed and dried with a clean method.`,
    objective: "Explain key hygiene practices and connect personal habits with clean water and shared facilities.",
    activity: "Make a handwashing sequence card for the school wash area, including when to wash and what supplies are needed.",
    mistake: "Hygiene education should address habits and access to facilities, not blame or embarrass individuals.",
    terms: ["hygiene", "handwashing", "sanitation", "menstrual hygiene"],
    quiz: [
      { question: "When is handwashing with soap especially important?", options: ["Before eating and after using the toilet", "Only when hands look dirty", "Only at the end of the school term", "Instead of cleaning shared facilities"], answer: 0 },
      { question: "Which statement about hygiene is accurate?", options: ["Clean water and usable sanitation facilities support healthy habits", "Hygiene problems should be used to shame learners", "Handwashing is unnecessary when food looks clean", "Personal hygiene replaces public sanitation"], answer: 0 },
    ],
  },
  "Nutrition and healthy eating": {
    content: `# Nutrition and healthy eating

## Food supports growth and activity

Food provides energy and nutrients needed for growth, repair and body functions. Carbohydrates are an important energy source; proteins help build and repair tissues; fats also provide energy and support body functions. Vitamins, minerals, fibre and water are needed in smaller or different amounts but remain important. A varied diet can include familiar local foods such as beans, grains, vegetables, fruit, eggs, fish and safe drinking water.

## Make choices in context

No single food supplies everything the body needs. Meals depend on availability, culture, cost, health and personal needs. A balanced choice combines different food groups over time rather than judging one meal in isolation. Keep food safe by washing produce, cooking thoroughly where needed, using clean utensils and storing food appropriately. Nutrition advice for illness or special needs should come from a qualified health professional, not from classmates or online claims.`,
    objective: "Describe the roles of major nutrients and explain why varied, safe food choices matter.",
    activity: "Plan a balanced school-day meal using foods available in your community and label the different food groups it includes.",
    mistake: "A healthy diet is not one fixed menu; it depends on varied foods, safety, access and individual needs.",
    terms: ["nutrient", "carbohydrate", "protein", "fibre", "balanced diet"],
    quiz: [
      { question: "Which nutrient is an important source of energy and is found in foods such as grains?", options: ["Carbohydrate", "Water only", "Vitamin C", "Fibre only"], answer: 0 },
      { question: "What makes a meal plan more balanced?", options: ["Including a variety of food groups over the day", "Eating only one favourite food", "Avoiding safe local foods", "Judging nutrition by colour alone"], answer: 0 },
    ],
  },
  "Communicable diseases": {
    content: `# Communicable diseases

## How infections spread

A communicable disease is caused by an infectious agent that can pass from one person, animal or environment to another. Routes include droplets from coughs and sneezes, contaminated food or water, blood, close contact, and vectors such as mosquitoes. Different diseases spread in different ways, so prevention must match the route. Handwashing helps interrupt some transmission; safe water and food hygiene address others; mosquito nets and removing standing water reduce exposure to certain mosquito-borne infections.

## Respond with care, not stigma

Symptoms alone cannot identify every disease. A person who feels unwell should tell a trusted adult and seek appropriate medical advice. Follow public-health guidance on vaccination, treatment and staying home when advised. Do not share another person's private health information or blame them for becoming ill. Prevention combines individual habits with clean water, sanitation, healthcare access and community action.`,
    objective: "Explain common routes of disease transmission and match prevention measures to those routes.",
    activity: "For three example diseases, identify a likely transmission route and one prevention measure that interrupts it.",
    mistake: "Not every infection spreads through casual touch; prevention should be based on the disease's actual route.",
    terms: ["communicable disease", "transmission", "vector", "vaccination", "prevention"],
    quiz: [
      { question: "Which action can reduce exposure to mosquito-borne disease?", options: ["Use an intact insecticide-treated net as directed", "Share drinking cups", "Leave standing water beside the home", "Avoid medical advice"], answer: 0 },
      { question: "Why should a learner avoid blaming someone who is ill?", options: ["Illness can have different causes, and stigma does not prevent transmission", "Blame is a substitute for treatment", "Every disease spreads in the same way", "Private health details should be shared widely"], answer: 0 },
    ],
  },
  "Non-communicable diseases": {
    content: `# Non-communicable diseases

## Conditions that do not spread between people

Non-communicable diseases are not passed from person to person through ordinary contact. Examples include some heart diseases, cancers, chronic respiratory conditions and diabetes. Their causes vary: genetics, age, environment, infections in some cases and long-term behaviours can all play a part. It is inaccurate to assume that a person's illness proves they made poor choices. Many conditions have several causes and are affected by access to healthcare and safe environments.

## Prevention and care

Regular physical activity, varied food, avoiding tobacco, clean air and routine health services can reduce some risks, but no habit guarantees that disease will never occur. Early assessment and treatment can help people manage a condition. Learners should rely on qualified health professionals for personal advice, respect privacy and avoid spreading claims that promise a cure without evidence.`,
    objective: "Distinguish non-communicable disease from infection and describe realistic prevention and care.",
    activity: "Sort statements into risk reduction, diagnosis and treatment, then explain why each has a different purpose.",
    mistake: "A non-communicable condition is not contagious, and its presence is not proof of personal failure.",
    terms: ["non-communicable disease", "risk factor", "screening", "treatment"],
    quiz: [
      { question: "What distinguishes a non-communicable disease?", options: ["It is not passed from person to person through ordinary contact", "It is always harmless", "It has one identical cause in everyone", "It never needs medical care"], answer: 0 },
      { question: "Which statement about prevention is sound?", options: ["Healthy habits can reduce some risks but cannot guarantee that illness never occurs", "A person with illness must have behaved badly", "Screening is the same as treatment", "Medical advice is unnecessary"], answer: 0 },
    ],
  },
  "Drug and substance misuse": {
    content: `# Drug and substance misuse

## Medicines and other substances

A medicine is intended to prevent, diagnose or treat a health problem when used as directed. The same medicine can cause harm when the wrong person takes it, the dose is changed without advice, or it is mixed with other substances. Alcohol, tobacco and some inhaled or street substances can affect judgement, coordination, breathing and long-term health. A substance's legal status does not by itself prove it is safe for every person or use.

## Practise refusal and seek help

Pressure may come from friends, advertising or stress. A learner can refuse clearly, leave the situation and contact a trusted adult. Never take an unknown pill or share prescription medicine. If someone may have taken a harmful substance, do not wait for symptoms to worsen: tell an adult and contact emergency or poison advice services. Do not punish or shame a person who needs urgent help.`,
    objective: "Explain how misuse differs from correctly supervised medicine use and identify safe responses to pressure or exposure.",
    activity: "Write and practise two short refusal responses, then name a trusted adult or service to contact in an emergency.",
    mistake: "Prescription medicine should not be shared, even when another person reports similar symptoms.",
    terms: ["medicine", "misuse", "dose", "peer pressure", "poisoning"],
    quiz: [
      { question: "A friend offers a prescription tablet that was prescribed to them. What is the safest response?", options: ["Do not take it; use only medicine prescribed or advised for you", "Take half to test it", "Share it with another friend", "Mix it with a drink"], answer: 0 },
      { question: "Someone may have swallowed an unknown substance. What should a learner do?", options: ["Tell an adult and seek emergency or poison advice promptly", "Wait alone for symptoms", "Make the person vomit", "Hide the event to avoid trouble"], answer: 0 },
    ],
  },
  "Mental and social wellbeing": {
    content: `# Mental and social wellbeing

## Health includes feelings and relationships

Mental wellbeing includes how a person thinks, feels, copes with difficulties and relates to other people. It changes over time, just as physical health does. Stress before an examination is common, but persistent sadness, fear, isolation or difficulty functioning deserves attention. Support can include a trusted adult, school counsellor, health worker, supportive routines and connection with friends or family. These supports do not replace professional care when it is needed.

## Listen and respond with respect

People experience distress differently. Listen without teasing, making promises you cannot keep or demanding private details. If someone says they may hurt themselves or another person, tell a responsible adult immediately and stay with them only if it is safe. Protecting a person's safety matters more than keeping a dangerous secret. Seeking help is a practical health choice, not a sign of weakness.`,
    objective: "Recognise signs that someone may need support and identify respectful ways to seek help.",
    activity: "Create a school support map showing at least two trusted adults or services and how a learner can reach them.",
    mistake: "Telling someone to simply cheer up does not replace listening or connecting them with appropriate support.",
    terms: ["mental wellbeing", "stress", "support", "counsellor", "confidentiality"],
    quiz: [
      { question: "A classmate says they may harm themselves. What should you do?", options: ["Tell a responsible adult immediately", "Promise to keep it secret", "Tease them to change the subject", "Leave them without telling anyone"], answer: 0 },
      { question: "Which response shows supportive listening?", options: ["Listen respectfully and help connect the person with trusted support", "Demand every private detail", "Dismiss the concern as attention-seeking", "Guarantee that the problem will disappear"], answer: 0 },
    ],
  },
  "Posture and body mechanics": {
    content: `# Posture and body mechanics

## Position the body for the task

Posture is how the body is held while sitting, standing or moving. Body mechanics describes how body parts work together during movement and lifting. A balanced stance keeps the feet secure and allows the legs and hips to help with effort. For a light object, bring it close, bend at the hips and knees where comfortable, and rise smoothly rather than twisting under load. Heavy or awkward items should be moved with help or suitable equipment.

## Comfort and movement vary

There is no single rigid posture that is perfect for every person or every task. Changing position, taking movement breaks and adjusting a chair or work surface can improve comfort. Pain, numbness or ongoing discomfort should be reported to a trusted adult or health professional rather than ignored. Safe technique reduces strain, but it cannot prevent every injury or replace medical care.`,
    objective: "Describe practical ways posture and body mechanics can reduce avoidable strain during common tasks.",
    activity: "Observe how a light object is lifted in class. Identify one safe movement and one adjustment that could make the task more comfortable.",
    mistake: "Good posture is not a single stiff pose; comfort, movement and the demands of the task all matter.",
    terms: ["posture", "body mechanics", "balance", "strain", "ergonomics"],
    quiz: [
      { question: "When lifting a light object, which action generally reduces unnecessary strain?", options: ["Keep it close and move smoothly using the legs and hips", "Twist while holding it far away", "Hold your breath and jerk upward", "Lift beyond your capacity alone"], answer: 0 },
      { question: "What may improve comfort during a long classroom task?", options: ["Adjust the work position and take movement breaks", "Hold one rigid pose for hours", "Ignore persistent pain", "Use the same setup for every body and task"], answer: 0 },
    ],
  },
  "Recreation": {
    content: `# Recreation

## Leisure with purpose and enjoyment

Recreation is activity chosen during free time for enjoyment, relaxation, social connection or personal development. It may be physical, such as a game or walk, or non-physical, such as music, reading, crafts or community groups. Recreation can help people practise skills and build relationships, but it should remain voluntary and suited to a person's interests and circumstances.

## Make recreation accessible

Safe recreation needs suitable space, equipment, supervision where appropriate and rules that include participants fairly. A school can adapt a game by changing its boundaries, equipment or team size so more learners can take part. Communities may also need to consider cost, transport, disability access and cultural preferences. Recreation is not wasted time, and it need not be competitive to be valuable.`,
    objective: "Explain the purposes of recreation and identify ways to make an activity safe and inclusive.",
    activity: "Adapt a familiar game so that learners with different movement abilities can participate, and explain each change.",
    mistake: "Recreation does not have to be competitive or physically intense to provide enjoyment and social value.",
    terms: ["recreation", "leisure", "inclusion", "adaptation"],
    quiz: [
      { question: "Which is an example of recreation?", options: ["A voluntary community music group", "Only a compulsory examination", "An unsafe task that cannot be refused", "A medical diagnosis"], answer: 0 },
      { question: "How can a teacher make a game more inclusive?", options: ["Adapt space, equipment or team size to support participation", "Exclude anyone who needs a change", "Keep rules unclear", "Reward only the strongest learner"], answer: 0 },
    ],
  },
  "Sportsmanship": {
    content: `# Sportsmanship

## Compete without losing respect

Sportsmanship is fair, respectful conduct during sport, whether a person wins or loses. It includes following rules, accepting decisions, acknowledging an opponent's good play and taking responsibility for one's own actions. A captain can help by setting a calm example, inviting teammates to contribute and addressing disagreement without insults. Fair play does not mean ignoring unsafe behaviour; a learner should alert the teacher when someone may be injured or at risk.

## Handle disagreement constructively

Players may disagree about a point or rule. Pause, explain what happened briefly and let the official or teacher apply the agreed rule. Do not retaliate, intimidate or blame a teammate for every mistake. After the game, teams can discuss one thing they did well and one action to improve. This keeps competition focused on learning as well as results.`,
    objective: "Identify respectful and fair actions before, during and after a competitive game.",
    activity: "After a short game, each team names one fair-play action it observed and one disagreement handled appropriately.",
    mistake: "Sportsmanship is not pretending that harmful conduct is acceptable; report unsafe actions to the responsible adult.",
    terms: ["sportsmanship", "fair play", "official", "respect", "accountability"],
    quiz: [
      { question: "A player disagrees with a referee's call. What is the appropriate response?", options: ["Stay respectful and let the official apply the agreed rule", "Insult the official", "Retaliate against an opponent", "Stop teammates from following the rules"], answer: 0 },
      { question: "Which action shows sportsmanship after a loss?", options: ["Acknowledge the opponents and reflect on what to improve", "Blame one teammate publicly", "Refuse to follow the closing instructions", "Claim the result without evidence"], answer: 0 },
    ],
  },
  "Rules and officiating": {
    content: `# Rules and officiating

## Rules make a game understandable

Rules define how play begins, what actions are permitted, how points are scored and how play restarts. They help participants compete on an agreed basis and reduce avoidable conflict. An official observes play, applies the rules consistently and signals decisions so players can respond. In a school game, a teacher may simplify a rule for safety or learning, but the change should be explained to everyone before play begins.

## Practise clear decisions

Officials need to watch the relevant area, learn the signals and remain impartial. Players should stop when instructed, ask a brief question respectfully and continue once the decision is clear. If learners take turns officiating, the class can compare decisions against the written rule rather than personal preference. Consistent application matters more than making a decision that favours one team.`,
    objective: "Explain the role of rules and officials and apply a simple game rule consistently.",
    activity: "Choose one rule from a familiar game, explain it to the class and officiate a short round using the same rule for both teams.",
    mistake: "An official should not change a rule mid-game for one team without explaining a fair change to all participants.",
    terms: ["rule", "official", "signal", "impartial", "restart"],
    quiz: [
      { question: "What is a central responsibility of an official?", options: ["Apply the agreed rules consistently", "Choose a winner before play", "Change rules secretly for one side", "Join one team during a decision"], answer: 0 },
      { question: "A school modifies a rule to make a game safer. What should happen before play?", options: ["Explain the change to all participants", "Tell only one team", "Wait until a dispute begins", "Leave the change unclear"], answer: 0 },
    ],
  },
  "Injury prevention": {
    content: `# Injury prevention

## Reduce avoidable risks

Injury prevention begins before activity. Inspect the playing area for holes, sharp objects, standing water and other hazards. Use equipment that fits and is in working order, learn the technique and rules, warm up progressively and match the activity to the learner's readiness. Fatigue can affect control, so breaks and water matter, especially in hot conditions. No preparation can eliminate every risk; the goal is to make sensible choices and respond early when something is wrong.

## Report and respond

Stop if you feel sharp pain, dizziness, unusual breathlessness or weakness. Tell the teacher instead of hiding an injury to stay in the game. Do not return to activity until a responsible adult has assessed the situation and any medical advice has been followed. Teammates can help prevent injuries by giving one another space, respecting boundaries and stopping when the official signals a hazard.`,
    objective: "Recognise preventable activity hazards and describe when to stop and report a possible injury.",
    activity: "Inspect a practice area using a hazard checklist and explain which hazards must be removed before play.",
    mistake: "Playing through sharp pain or dizziness can worsen a problem; stop and tell the teacher.",
    terms: ["hazard", "readiness", "fatigue", "prevention", "assessment"],
    quiz: [
      { question: "Which check should happen before a class uses a field?", options: ["Look for hazards such as holes, sharp objects and slippery areas", "Begin at full speed without inspection", "Move equipment while others play", "Ignore weather and surface conditions"], answer: 0 },
      { question: "A learner feels sharp pain during practice. What should happen?", options: ["Stop and tell the teacher", "Hide the pain and continue", "Ask a teammate to diagnose it", "Return to play without assessment"], answer: 0 },
    ],
  },
  "Fitness programme project": {
    content: `# Fitness programme project

## Plan from a clear starting point

A fitness programme should match a person's goal, current ability, available time and health needs. Begin with a baseline that can be observed safely, such as the time spent walking a set route at a comfortable pace. Choose activities that support the goal, schedule recovery and make progress gradually. A programme should include a way to record activity and how the learner felt, not just a target score.

## Review and adjust

At the end of the planned period, compare the new record with the baseline using the same conditions. Consider attendance, effort, enjoyment, rest and any discomfort. If the activity caused pain or was difficult to maintain, revise the plan and seek adult or professional advice as appropriate. Do not use another learner's measurements as your target or promise a particular body shape. The project is successful when the plan is safe, realistic and informed by evidence.`,
    objective: "Design and evaluate a simple, safe fitness plan using a baseline and progress record.",
    activity: "Prepare a one-week activity plan with a goal, manageable sessions, recovery time and a record of how each session felt.",
    mistake: "A good fitness plan is not the hardest possible plan; it is one the learner can follow safely and review honestly.",
    terms: ["baseline", "goal", "progression", "recovery", "evaluation"],
    quiz: [
      { question: "Why should a learner record a baseline before starting a fitness plan?", options: ["To compare later progress under similar conditions", "To diagnose a medical condition", "To rank classmates", "To guarantee a particular result"], answer: 0 },
      { question: "Which is the strongest reason to adjust a plan?", options: ["The activity causes discomfort or cannot be followed safely", "A classmate chose a different activity", "The plan includes recovery", "The record shows realistic progress"], answer: 0 },
    ],
  },
};

const lessonExtensions = {
  "Physical fitness": `Fitness develops through regular activity, suitable recovery and gradual progression. A learner beginning a walking routine should choose a comfortable pace, record duration and notice how the body responds rather than competing with a classmate. Sleep, hydration and rest support adaptation. Changes in performance can reflect illness, stress or conditions on the day, so compare records made in similar circumstances. Fitness is not a measure of a person's worth or appearance; it is one part of wellbeing and should be approached safely.`,
  "Health-related fitness": `The health-related components describe different abilities, so an assessment should name the component it measures. A timed walk can provide information about cardiorespiratory endurance, while a controlled flexibility task assesses range of movement. Results depend on the protocol, effort, age and health, and should not be used to diagnose disease. Compare a learner's record over time using the same method and allow privacy. A balanced programme includes more than one component, with activities chosen to be accessible and enjoyable rather than focused on ranking pupils.`,
  "Components of fitness": `Skill-related components such as balance, agility, coordination, power, reaction time and speed support particular movements, while health-related components support general function. A basketball player may need agility to change direction, but that does not make agility the only valuable ability. Match practice to the task and teach technique before increasing intensity. Observe movement quality and safety as well as time or distance. When comparing results, explain which component is being considered and avoid presenting one test as a complete picture of fitness.`,
  "Warm-up and cool-down": `A warm-up should prepare the body for the activity that follows. Begin with light movement, then use controlled dynamic actions related to the session; a sprinter may include progressive running drills. A cool-down gradually reduces activity and can include gentle movement and reflection. Neither routine guarantees that injury will not occur, and stretching should not be forced through pain. Adjust the warm-up for weather, space and the learner's condition. Stop and tell the teacher if dizziness, chest discomfort or unusual pain occurs.`,
  Athletics: `Athletics combines events that test running, jumping and throwing, each with its own techniques and safety requirements. Before practice, inspect the surface, mark clear lanes and keep spectators outside the event area. Learners should understand where equipment will travel and wait for an official signal before retrieving it. Performance records are useful only when conditions and rules are comparable. Teach the movement in manageable stages, give specific feedback and allow rest. Participation can be adapted so that learners with different abilities practise meaningfully without creating unsafe competition.`,
  "Running events": `Running technique depends on the event. A short sprint emphasises a controlled start, acceleration and maintaining form, while distance running requires an even pace and judgement about effort. Learners should warm up, run in the correct direction and avoid crossing another runner's lane. Record distance and time with a consistent method, then use the result to plan gradual improvement. A fast first lap followed by exhaustion may indicate poor pacing. Stop if a learner feels unwell, and do not use performance comparisons to shame or pressure anyone.`,
  "Jumping events": `Jumping events require a clear approach path, a safe take-off area and a landing surface suited to the event. In a long jump lesson, practise the run-up and take-off separately before combining them; land with control and leave the pit when instructed. For high jump, use equipment and technique only under qualified supervision. Measure from the correct take-off line to the nearest mark made in the landing area. Repeated attempts should include rest, because fatigue can change technique and raise risk.`,
  "Throwing events": `Throwing lessons require strict control of the throwing sector. Only the learner taking a turn should throw, and everyone should retrieve equipment after the teacher's signal. Use age-appropriate implements and begin with light, controlled technique practice. A measured result is taken from the throwing line to the first point of contact, following the event rules. Do not throw toward people or retrieve an implement while another throw is in progress. Stop when the area is unclear or equipment is damaged.`,
  "Football skills": `Passing, receiving, dribbling and shooting depend on awareness as well as foot technique. Practise with space between learners, use a suitable ball and look up before passing so that the receiver is ready. A controlled first touch can move the ball into useful space rather than simply stopping it. Small-sided games help learners make decisions, but rules should protect safety and fair participation. Give feedback about one observable action at a time, such as body position or support movement, rather than labelling a learner as naturally talented or untalented.`,
  "Basketball skills": `Dribbling, passing, shooting and defending are learned through controlled practice and safe movement. Keep the head up while dribbling, pass to a teammate with a clear line and give space during a shot. A defender should move with balance and avoid dangerous contact. Adjust team size and court space so that all players can participate. In a practice game, pause to ask why a pass was available or blocked; this links technique to decision-making. Follow the rules for travelling and contact consistently, and stop play when a learner is injured.`,
  "Volleyball skills": `Volleyball uses controlled contacts to send the ball over a net and organise a team attack. Beginners can practise ready position, forearm passing and setting with a light ball before playing at full speed. Call for the ball clearly, maintain safe spacing and avoid reaching across another learner's path. Rotate positions according to the agreed rules so each player experiences different roles. A successful rally depends on communication and preparation, not only a powerful serve. Lowering the net or allowing a bounce can make early practice more accessible while learners develop control.`,
  Gymnastics: `Gymnastics develops balance, body control, strength and movement sequences, but equipment-based skills require a qualified teacher and suitable mats. Begin with shapes and low-level balances on a clear surface, and progress only when control is demonstrated. Never attempt a headstand, lift or partner balance without instruction and spotting arrangements. Learners should wait for equipment to be free and report damaged mats. Assessment should focus on safe technique, effort and improvement, not pressure to perform a skill beyond readiness.`,
  "Dance and rhythmic movement": `A movement sequence can show rhythm through repeated patterns, changes in level, direction and timing. Count beats aloud or use a steady musical phrase, then practise a short sequence slowly before increasing pace. Provide enough personal space and agree on respectful ways to observe and give feedback. Music and movement traditions may have cultural meaning; introduce them accurately and avoid mocking accents, dress or style. Learners can create different movements to express the same beat, so evaluation should consider control and connection to rhythm rather than demand identical performances.`,
  "Swimming safety": `Swimming safety starts before entering the water. Use a supervised facility, follow lifeguard instructions, check depth and conditions, and never swim alone or enter water to rescue someone without training. A learner should tell the instructor about relevant health concerns and use suitable flotation support where directed. Walking, not running, around a wet pool reduces slipping risk. Open water can have currents, sudden depth changes and hidden hazards; confidence in a pool does not make it safe. If someone is in trouble, alert a lifeguard or emergency service immediately.`,
  "First aid": `First aid is immediate help that preserves safety until trained care is available; it does not replace professional diagnosis. First check that the scene is safe, call a responsible adult or emergency service and follow your training. Do not move a person with a suspected serious neck or back injury unless there is immediate danger, and do not give food or drink to someone who is unconscious. For severe bleeding, seek urgent help and use direct pressure only if it is safe and you have been taught how.`,
  "Personal hygiene": `Hygiene routines reduce the spread of some infections when practised consistently. Washing hands with soap and clean water is especially important after using a toilet and before handling food. Keep personal towels and grooming items separate, cover coughs and clean shared equipment according to guidance. Hygiene does not prevent every illness, and a learner who is unwell should tell a responsible adult rather than be blamed. Explain routines respectfully and ensure that facilities, water and supplies are available; advice alone cannot replace access to them.`,
  "Nutrition and healthy eating": `A balanced eating pattern includes a range of foods that provide energy, protein, vitamins, minerals, fibre and water. Needs vary with age, activity, health and access to food, so one menu should not be presented as suitable for everyone. Read labels for serving size and ingredient information, and treat health claims cautiously. Food supports activity and growth, but body size does not reveal a person's diet or character. Discuss affordable, locally available choices without shaming learners or asking them to disclose private household circumstances.`,
  "Communicable diseases": `Communicable diseases pass through routes such as droplets, contaminated food or water, blood or vectors. Prevention depends on the route: safe water and sanitation can reduce waterborne transmission, while measures against mosquito bites can reduce some vector-borne risks. Vaccination and treatment guidance should come from qualified health authorities. A person who is ill deserves care and privacy, not blame or exclusion based on rumour. In a classroom example, identify the pathogen route and match a prevention step to it rather than assuming one measure controls every disease.`,
  "Non-communicable diseases": `Non-communicable diseases are not transmitted from one person to another, although risk can be influenced by several factors including environment, family history and behaviour. Regular activity, balanced food and avoiding tobacco can support health, but they do not guarantee that a person will never become ill. Do not diagnose a classmate from appearance or symptoms. A health concern should be discussed with a caregiver or qualified professional. Public health measures such as accessible screening and safe environments also affect risk beyond individual choices.`,
  "Drug and substance misuse": `Medicines should be used only as directed by a qualified professional or the product instructions, and learners should never share prescription drugs. Alcohol, tobacco and other substances can affect judgement, coordination and health, with risks varying by substance and amount. If someone may have taken a harmful substance, tell a trusted adult and seek urgent medical help; do not wait for symptoms to worsen. Prevention lessons should use accurate information and supportive language. A person experiencing dependence needs professional care, not ridicule or punishment alone.`,
  "Mental and social wellbeing": `Wellbeing includes emotional, social and physical experiences and can change over time. Sleep, supportive relationships, movement and time for rest may help, but they are not substitutes for professional support when distress is persistent or severe. Listen without pressuring someone to disclose details, keep private information appropriately confidential and tell a trusted adult if there is a safety concern. A class activity should not ask learners to diagnose one another. Respectful communication and belonging can support wellbeing, while bullying and exclusion can undermine it.`,
  "Posture and body mechanics": `Body mechanics concern how posture and movement distribute effort during daily tasks. When lifting a light object, bring it close, bend comfortably and avoid twisting while carrying; ask for help with heavy or awkward loads. A desk and screen should allow a relaxed position, but no single posture must be held rigidly for hours. Changing position and taking movement breaks can reduce discomfort. Persistent pain should be reported to a caregiver or health professional rather than treated through a classroom exercise alone.`,
  Recreation: `Recreation is chosen for enjoyment, relaxation or social connection and can include games, walking, dance or creative activities. Select an activity that fits the space, weather, available equipment and abilities of participants. Agree on rules and boundaries before beginning, and leave room for people who prefer a lower-intensity option. Recreation can support wellbeing without requiring competition or expensive equipment. After an activity, ask whether everyone could take part and what would make the next session safer or more enjoyable.`,
  Sportsmanship: `Sportsmanship is shown through actions before, during and after play: following rules, accepting decisions respectfully, encouraging teammates and caring for opponents' safety. A referee's decision can be questioned through the agreed process, but insults or intimidation are not acceptable. Winning does not excuse unfair conduct, and losing does not make effort meaningless. In a reflection, cite a specific action and explain how it affected the game. This makes sportsmanship observable instead of treating it as a vague label for a popular player.`,
  "Rules and officiating": `Rules define how an event is played and help participants understand what counts as a valid action. An official applies the rules consistently, watches the play and communicates decisions. Before officiating a class game, learn the key rules, agree on boundaries and explain signals so participants know what to expect. Some school activities use adapted rules for safety or access; tell everyone the adaptation before play. If a decision is uncertain, pause safely and consult the agreed rule rather than inventing a penalty.`,
  "Injury prevention": `Injury prevention combines preparation, suitable equipment, safe technique, environmental checks and attention to fatigue. Inspect the playing area for holes or wet patches, secure jewellery and use footwear suited to the surface. Increase training gradually and include rest; doing more when tired can reduce control. A warm-up may prepare movement but cannot eliminate every risk. Report pain promptly, stop the activity when necessary and follow the teacher's or health professional's guidance before returning. Do not pressure an injured learner to continue for the team's benefit.`,
  "Fitness programme project": `Evaluate a plan by comparing the stated goal with completed sessions and how the learner felt, not by judging body shape. Keep the same simple measure throughout, such as minutes walked at a comfortable pace, and note rest or illness that affected the record. A useful review may find that the schedule was too ambitious or that recovery improved participation. Change one part at a time and set a realistic next goal. If exercise causes persistent pain, dizziness or unusual breathlessness, stop and tell a responsible adult.`,
};

const courseIds = new Set([
  "jss1-physical-and-health-education",
  "jss2-physical-and-health-education",
  "jss3-physical-and-health-education",
]);
const curriculum = JSON.parse(await fs.readFile(curriculumPath, "utf8"));
let matchingCourses = 0;
let updatedLessons = 0;
const missingTitles = new Set();

for (const course of curriculum.courses ?? []) {
  if (!courseIds.has(course.id)) continue;
  matchingCourses += 1;

  for (const module of course.modules ?? []) {
    for (const lesson of module.lessons ?? []) {
      const editorial = lessons[lesson.title];
      if (!editorial) {
        missingTitles.add(lesson.title);
        continue;
      }

      updatedLessons += 1;
      lesson.content = `${editorial.content}\n\n${lessonExtensions[lesson.title]}`;
      lesson.objective = editorial.objective;
      lesson.activity = editorial.activity;
      lesson.commonMistakes = [editorial.mistake];
      lesson.keyTerms = editorial.terms;
      lesson.summary = editorial.content
        .replace(/^#\s+.+\n+/, "")
        .replace(/^##\s+.+\n+/gm, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 320);
      lesson.quiz = editorial.quiz.map((question, index) => ({
        id: `${lesson.id}-editorial-q${index + 1}`,
        ...question,
      }));
    }
  }
}

const expectedLessons = matchingCourses * Object.keys(lessons).length;
const shortLessons = curriculum.courses
  .filter((course) => courseIds.has(course.id))
  .flatMap((course) => course.modules.flatMap((module) => module.lessons))
  .map((lesson) => ({ id: lesson.id, words: (String(lesson.content ?? "").match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []).length }))
  .filter((lesson) => lesson.words < 200);
if (matchingCourses !== courseIds.size || updatedLessons !== expectedLessons || missingTitles.size || shortLessons.length) {
  throw new Error(JSON.stringify({ matchingCourses, updatedLessons, expectedLessons, shortLessons, missingTitles: [...missingTitles] }));
}

if (applyChanges) {
  await fs.writeFile(curriculumPath, `${JSON.stringify(curriculum, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify({ mode: applyChanges ? "apply" : "dry-run", courses: matchingCourses, topics: Object.keys(lessons).length, updatedLessons, minimumWords: Math.min(...shortLessons.map((lesson) => lesson.words), ...curriculum.courses.filter((course) => courseIds.has(course.id)).flatMap((course) => course.modules.flatMap((module) => module.lessons.map((lesson) => (String(lesson.content ?? "").match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []).length)))) }, null, 2));