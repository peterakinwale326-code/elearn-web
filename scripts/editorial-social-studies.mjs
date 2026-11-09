import fs from "node:fs/promises";
import path from "node:path";

const curriculumPath = path.resolve(process.cwd(), "data", "curriculum.json");
const applyChanges = process.argv.includes("--apply");

const topics = {
  "Meaning and Scope of Social Studies": {
    content: `# Meaning and scope of Social Studies

Social Studies examines how people live together and how they relate to their physical and social environments. It draws on history, geography, economics and civic learning, but its purpose is not simply to memorise facts from each subject. It helps learners ask how a community works, why a problem occurs and what evidence might support a response.

When studying an issue, separate observation from opinion. For example, a class investigating litter can record where waste is found, ask how it arrives there and consider who is responsible for collection. A useful explanation connects people, places, institutions and consequences. Social Studies encourages informed participation: learners should listen to different views, check claims and suggest realistic actions rather than assume that one person can solve every problem alone.`,
    objective: "Explain the scope of Social Studies and use evidence to investigate a community issue.",
    activity: "Map a small school or neighbourhood issue by recording observations, affected groups and one possible response.",
    quiz: [
      { question: "What makes a community investigation a Social Studies task?", options: ["It connects people, place, evidence and possible action", "It collects opinions without checking facts", "It studies only dates from the past", "It avoids the effects on people"], answer: 0 },
      { question: "When a claim about a local issue is made, what should a learner do?", options: ["Look for relevant evidence before accepting it", "Repeat it because an adult said it", "Treat every opinion as a measurement", "Ignore who is affected"], answer: 0 },
    ],
  },
  "Meaning and goals of social studies": {
    content: `# Meaning and goals of Social Studies

Social Studies helps learners understand relationships among people, communities and the environments in which they live. It brings together ideas from history, geography, economics and civic education to examine real situations. The subject aims to develop knowledge, responsible judgement and the ability to participate constructively in community life.

A good investigation begins with a clear question. If pupils ask why a nearby road floods, they can observe drainage, note where water collects and speak with people who use the road. They should distinguish what they saw from what they inferred. The subject does not require learners to agree on every issue; it asks them to support conclusions with evidence and to consider how different groups may be affected by a proposed response.`,
    objective: "Describe the purpose of Social Studies and distinguish observation from inference in an investigation.",
    activity: "Write one investigable question about the school community and list two kinds of evidence that could help answer it.",
    quiz: [
      { question: "Which is an example of an observation during a road-flooding study?", options: ["Water collects near the blocked drain after rain", "Residents are careless", "The council will never act", "Flooding is unimportant"], answer: 0 },
      { question: "Which is a central goal of Social Studies?", options: ["Understand society and participate responsibly", "Memorise opinions without evidence", "Avoid discussing community problems", "Study only physical features"], answer: 0 },
    ],
  },
  "The Human Environment": {
    content: `# The human environment

The human environment includes the people, settlements, buildings, roads, services and institutions created or organised by people. It interacts with the natural environment. A road may improve access to a market, yet it can also change traffic, land use and drainage. To understand a place, learners should notice both its physical features and how people use them.

An environment is not identical everywhere. Rural and urban areas differ in population density, land use and access to services, but neither is simply better in every respect. A careful study describes the place, identifies who uses it and considers how changes affect different groups. When a new facility is proposed, questions about access, safety, maintenance and environmental effects help residents assess its value.`,
    objective: "Describe human-environment interaction and identify effects of a change in a local place.",
    activity: "Sketch one familiar place and label three human-made features, their uses and one effect each has on the surroundings.",
    quiz: [
      { question: "Which feature is part of the human environment?", options: ["A market built beside a road", "A natural rainfall pattern", "A mountain formed by geological processes", "A seasonal wind"], answer: 0 },
      { question: "Why should a proposed road be assessed beyond travel time?", options: ["It may also affect safety, land use and drainage", "Roads never affect nearby residents", "Only its colour matters", "It removes the need for maintenance"], answer: 0 },
    ],
  },
  "The Family": {
    content: `# The family

A family is a social group whose members are connected through relationships such as birth, marriage, adoption or long-term care. Families may be nuclear, extended or organised in other ways; no single household pattern describes every family. Families provide care, belonging, guidance and support, although the way these responsibilities are organised varies among households and cultures.

Family members depend on one another, but their needs and abilities differ. A child may need adult protection, while an older relative may contribute knowledge or care. Respectful communication helps family members make decisions and resolve disagreements. Social Studies examines these relationships without assuming that every family has the same resources or experiences. When support is needed, trusted adults and appropriate community services can help.`,
    objective: "Explain the family as a social group and describe varied forms of family support.",
    activity: "Draw a relationship map using fictional names and identify two ways members support one another.",
    quiz: [
      { question: "Which statement about families is accurate?", options: ["Families can take different forms and provide care and belonging", "Every family has the same household structure", "Only one kind of family can support children", "Family relationships never change"], answer: 0 },
      { question: "Why is a fictional relationship map useful in class?", options: ["It allows discussion without exposing a learner's private family details", "It proves all families are alike", "It replaces family responsibilities", "It identifies which family is best"], answer: 0 },
    ],
  },
  "Family and family roles": {
    content: `# Family and family roles

Family roles are the responsibilities people take on within a household, such as caring for children, preparing food, earning income, helping with schoolwork or maintaining the home. Roles are influenced by age, ability, culture and circumstance. They can change when a family member becomes ill, begins school or takes on new work. A role should not be treated as proof that one person is naturally suited to a task.

Families function best when responsibilities are discussed fairly and adjusted to people's needs. Children can contribute age-appropriate tasks, but adults remain responsible for their safety and care. Listening to each member helps identify work that is overlooked or unevenly shared. If conflict arises, describe the problem calmly, agree on a practical change and review whether it works.`,
    objective: "Identify family roles and explain how responsibilities can be shared fairly and safely.",
    activity: "Use a fictional household schedule to identify one task that could be shared more fairly and explain your revision.",
    quiz: [
      { question: "What is a sensible way to respond when household responsibilities are unfairly shared?", options: ["Discuss the tasks and agree on a practical redistribution", "Assume one member must do everything", "Give a child unsafe adult responsibilities", "Ignore the effect on family members"], answer: 0 },
      { question: "What can influence how family roles are organised?", options: ["Age, ability, culture and circumstance", "A fixed rule that every household is identical", "Only the oldest person's preference", "A person's gender alone"], answer: 0 },
    ],
  },
  "Family Roles, Rights and Conflict": {
    content: `# Family roles, rights and conflict

Family members have responsibilities toward one another, but every person also deserves safety, dignity and a voice in decisions that affect them. Children have a right to care and protection; adults have a duty to provide appropriate supervision. Sharing work does not mean that a child should be made responsible for an adult's safety or essential needs.

Disagreement is possible when expectations differ. A useful first step is to describe the specific issue without insults, then let each person explain their concern. A solution should protect the rights and safety of everyone involved. Violence, threats and abuse are not ordinary disagreements. A child who feels unsafe should tell a trusted adult or contact an appropriate protection service; they should not be asked to resolve danger alone.`,
    objective: "Relate family responsibilities to rights and distinguish ordinary disagreement from unsafe conduct.",
    activity: "Discuss a fictional disagreement about chores and identify a fair solution that protects each family member's safety.",
    quiz: [
      { question: "Which response is appropriate when a family disagreement involves threats or violence?", options: ["Seek help from a trusted adult or protection service", "Treat it as a normal argument to settle alone", "Keep it secret to protect the person causing harm", "Escalate the argument"], answer: 0 },
      { question: "What should a fair solution to a household disagreement consider?", options: ["The rights, safety and needs of everyone involved", "Only the loudest person's preference", "Whether a child can replace an adult caregiver", "How to avoid hearing different views"], answer: 0 },
    ],
  },
  "Marriage and family life": {
    content: `# Marriage and family life

Marriage is a social and legal relationship whose customs differ among communities and faith traditions. In Nigeria, legal requirements depend on the type of marriage and the applicable law. Social Studies can compare these traditions respectfully without treating one community's practice as universal. Marriage is an adult commitment; children must not be pressured into marriage or denied protection and education.

Family life involves cooperation, care, communication and shared responsibilities. Healthy relationships depend on respect and consent, not coercion. Family structures may change through birth, migration, separation, bereavement or remarriage. When discussing these experiences, use examples that protect classmates' privacy. The purpose of study is to understand social relationships and rights, not to judge a learner's household.`,
    objective: "Describe marriage as a varied social institution and identify respectful principles in family life.",
    activity: "Compare two fictional family scenarios and identify how communication and shared responsibility support wellbeing.",
    quiz: [
      { question: "How should Social Studies compare marriage customs?", options: ["Describe differences respectfully and avoid treating one custom as universal", "Assume every community follows the same practice", "Mock unfamiliar customs", "Ignore legal requirements"], answer: 0 },
      { question: "Which principle supports healthy family relationships?", options: ["Respectful communication and consent", "Coercion in important decisions", "Silencing children about safety", "Avoiding shared responsibility"], answer: 0 },
    ],
  },
  "The Community": {
    content: `# The community

A community is a group of people connected by place, shared interests, identity or institutions. A neighbourhood is one kind of community, but learners may also belong to a school, language, faith, professional or online community. Communities contain different groups and viewpoints; membership does not mean that everyone has the same needs or power.

People rely on community institutions and services such as schools, health centres, markets, local associations and public offices. To understand how a community works, ask who provides a service, who can access it and how residents can raise concerns. Community participation includes listening, sharing information and contributing to agreed work. It should not replace the responsibilities of public authorities or exclude people who are less able to attend meetings.`,
    objective: "Define community and identify the role of institutions and participation in community life.",
    activity: "Map three community services and record who provides each, who uses it and how a concern can be reported.",
    quiz: [
      { question: "Which statement best describes a community?", options: ["People connected by place, interests, identity or institutions", "A group in which everyone has identical views", "Only people who live in one household", "People who never interact"], answer: 0 },
      { question: "What is one useful question when studying a community service?", options: ["Who can access it and how can residents raise concerns?", "Which group should be excluded?", "How can the service avoid all accountability?", "Why do residents' needs not matter?"], answer: 0 },
    ],
  },
  "Community development": {
    content: `# Community development

Community development is a process through which residents, organisations and public agencies identify needs and work toward improvements. A project might address water access, a damaged footpath or a poorly maintained classroom. It should begin by asking residents what the problem is, who is affected and what resources or responsibilities are involved. A project chosen without local input may solve the wrong problem or leave some groups out.

Planning includes a clear goal, roles, a realistic budget or resource list, a timeline and a way to review results. Community members can contribute ideas and labour, while public authorities remain accountable for services assigned to them. After completion, maintenance matters: a facility that cannot be repaired may not provide lasting benefit. Evaluation should compare the result with the original need and listen to different users.`,
    objective: "Outline participatory steps for planning and evaluating a community development project.",
    activity: "Prepare a one-page plan for a fictional community improvement, including consultation, roles, resources and maintenance.",
    quiz: [
      { question: "Why should residents be consulted before a community project is selected?", options: ["Their experience helps identify the actual need and affected groups", "Consultation delays every useful project", "Only outsiders understand local needs", "It removes the need to plan"], answer: 0 },
      { question: "What should a project plan consider after construction?", options: ["Who will maintain the facility and with what resources", "How to avoid evaluating the result", "How to stop residents using it", "Why accountability is unnecessary"], answer: 0 },
    ],
  },
  "Leadership": {
    content: `# Leadership

Leadership is the process of helping a group set direction, make decisions and work toward a shared purpose. A leader may be chosen, elected, appointed or recognised through experience. Effective leadership is not simply giving orders: it involves listening, explaining decisions, sharing responsibility and being answerable for the use of authority.

Leadership styles should fit the task and include the people affected. A class representative who gathers classmates' views before speaking to a teacher is exercising representative leadership. A leader should not use a position to intimidate others or claim personal ownership of group work. Learners can assess leadership by asking whether decisions are fair, whether commitments are kept and whether members can raise concerns safely.`,
    objective: "Explain leadership as guidance and shared responsibility, and assess it using evidence of fairness and accountability.",
    activity: "Review a fictional class decision and identify which leadership actions included members and which excluded them.",
    quiz: [
      { question: "Which action shows responsible leadership?", options: ["Listen to members and explain a decision", "Use a role to silence questions", "Claim credit for everyone's work", "Hide how shared resources were used"], answer: 0 },
      { question: "How can learners assess a leader's conduct?", options: ["Examine fairness, kept commitments and opportunities to raise concerns", "Rely only on the leader's popularity", "Assume authority removes accountability", "Ignore the effects of decisions"], answer: 0 },
    ],
  },
  "Nigeria and its peoples": {
    content: `# Nigeria and its peoples

Nigeria is home to many ethnic, linguistic and cultural communities. People also differ by religion, occupation, region, age and personal experience. These identities can overlap: a person may belong to a language community, a town, a professional group and the Nigerian state at the same time. No single description represents every member of a large group.

Studying Nigeria's peoples means learning about diversity without turning difference into stereotype. Compare histories and cultural practices using reliable sources, and distinguish a group's public institution from the views of every individual within it. Shared citizenship and constitutional rights provide a common civic framework, while local languages and traditions remain important parts of identity. Respectful discussion asks how communities interact and how public decisions can include people fairly.`,
    objective: "Describe Nigeria's diversity and distinguish shared citizenship from individual and community identities.",
    activity: "Use a map and reliable reference sources to compare two Nigerian communities without treating either as uniform.",
    quiz: [
      { question: "What is a careful way to describe a large cultural group?", options: ["Recognise internal diversity and avoid claiming every member is alike", "Assume all members share one opinion", "Use one person's experience as proof about everyone", "Rank groups by their customs"], answer: 0 },
      { question: "What can provide a shared civic framework across Nigeria's communities?", options: ["Citizenship and constitutional rights", "A requirement to abandon local identities", "One person's private preference", "A stereotype about a region"], answer: 0 },
    ],
  },
  "Culture": {
    content: `# Culture

Culture includes learned ways of life shared and adapted by groups: language, food, dress, music, beliefs, skills, ceremonies and social expectations. People learn culture through family, school, peers, media and community life. Culture is not fixed or identical for every member; it changes through new experiences, contact with other groups and debate within a community.

Studying culture requires curiosity and respect. A practice should be understood in its context rather than mocked or labelled backward because it is unfamiliar. At the same time, cultural explanation does not excuse harm or remove a person's rights. Learners can compare practices by asking what meaning participants give them, how they have changed and who is affected. Nigeria's cultural diversity is a resource for learning, not a basis for ranking groups.`,
    objective: "Explain culture as learned and changing, and discuss cultural differences respectfully.",
    activity: "Choose a public cultural practice and describe its context, how it is learned and one way it has changed.",
    quiz: [
      { question: "Which statement about culture is accurate?", options: ["It is learned, shared and capable of change", "It is identical for every member of a group", "It never changes through contact", "It can be judged without understanding its context"], answer: 0 },
      { question: "How should learners approach an unfamiliar cultural practice?", options: ["Ask about its meaning and context without mocking participants", "Assume it is inferior", "Treat one person's view as the whole group's view", "Ignore the people affected"], answer: 0 },
    ],
  },
  "Values, Morals and Good Character": {
    content: `# Values, morals and good character

Values are principles people consider important, such as honesty, fairness and care. Morals are beliefs about right and wrong conduct. Character is shown through repeated choices, especially when a person faces pressure or inconvenience. These ideas are connected but not identical: a person may value fairness yet still need to practise acting fairly when resources are limited.

Social Studies uses situations to examine values rather than treating them as slogans. If a learner finds a lost item, honesty involves making a reasonable effort to return it; fairness includes considering who owns it and following school procedures. Different communities may express values in different ways, and discussion should focus on reasons, effects and rights. Good character develops through reflection, accountability and the willingness to correct harm.`,
    objective: "Distinguish values, morals and character and apply them to a practical ethical choice.",
    activity: "Analyse a fictional lost-property case and explain how honesty and fairness guide a response.",
    quiz: [
      { question: "What does character refer to in this lesson?", options: ["Patterns of choices that show how a person acts", "A person's clothing", "A rule that never needs explanation", "A single opinion"], answer: 0 },
      { question: "A learner finds a classmate's notebook. Which action best reflects honesty?", options: ["Return it through the owner or a responsible teacher", "Keep it because it was unattended", "Hide it from the class", "Sell it to another pupil"], answer: 0 },
    ],
  },
  "Values and norms": {
    content: `# Values and norms

Values are shared ideas about what a group considers important; norms are expectations or rules that guide behaviour. Respect may be a value, while taking turns to speak at a meeting is a norm that expresses it. Norms can be informal, such as greeting a neighbour, or formal, such as a school rule. They may differ between settings and can change over time.

Not every existing norm is fair. Learners can ask who created it, whom it benefits, whether it protects safety and whether it respects rights. A norm that silences one group deserves scrutiny rather than automatic obedience. When a rule is unclear, seek an explanation from the responsible authority and use a respectful process to suggest change. Understanding the difference between values and norms helps explain why rules exist and how they can be improved.`,
    objective: "Distinguish values from norms and evaluate whether a social expectation is fair and rights-respecting.",
    activity: "Choose a school norm, identify the value it may express and assess how fairly it applies to learners.",
    quiz: [
      { question: "Which example is a norm expressing the value of respect?", options: ["Taking turns to speak in a meeting", "A person's height", "The location of a school", "A weather pattern"], answer: 0 },
      { question: "How should an unfair norm be approached?", options: ["Examine its effects and seek a respectful way to challenge it", "Assume every norm is fair", "Punish anyone who asks a question", "Ignore the rights of affected people"], answer: 0 },
    ],
  },
  "Socialisation": {
    content: `# Socialisation

Socialisation is the lifelong process through which people learn language, behaviour, values and ways of participating in society. Families, schools, peer groups, religious communities, media and workplaces can all influence what people learn. These influences are not always identical; a learner may encounter different expectations at home and school and must understand the context for each.

Socialisation helps people communicate and cooperate, but it does not mean that individuals simply copy everything they see. People interpret expectations, question them and contribute to social change. Media literacy is part of this process: a message can shape beliefs, so learners should ask who created it, what evidence it uses and whose perspective is missing. Recognising these influences helps a person make informed choices while respecting others.`,
    objective: "Identify agents of socialisation and explain how people interpret rather than simply copy social messages.",
    activity: "Compare how a school rule and a media message teach expectations, noting their source and possible effects.",
    quiz: [
      { question: "Which is an agent of socialisation?", options: ["A peer group that influences shared behaviour", "A rainfall measurement", "A landform", "A numerical unit"], answer: 0 },
      { question: "How can a learner assess a message that may influence behaviour?", options: ["Ask who created it, what evidence it gives and whose view is missing", "Accept it because it is popular", "Share it before checking", "Assume every message is neutral"], answer: 0 },
    ],
  },
  "Socialization": {
    content: `# Socialization

Socialization is how people learn the language, expectations and skills needed to take part in social life. It begins in childhood and continues through new settings such as school, work and community groups. Family members may teach care and communication; schools teach shared rules and academic habits; peers and media also influence interests and behaviour.

Learning social expectations does not require a person to accept every message uncritically. People can compare expectations with evidence, fairness and rights. For example, a group may pressure a learner to exclude someone. The learner can recognise the pressure while choosing a response that respects the excluded person's dignity. Studying socialization helps explain how behaviour is learned and how individuals can contribute to changing harmful expectations.`,
    objective: "Describe socialization and evaluate how different social influences can shape behaviour.",
    activity: "Use a fictional peer-pressure scenario to identify the influence, its message and a respectful alternative response.",
    quiz: [
      { question: "Which statement best describes socialization?", options: ["Learning expectations and skills for participating in social life", "Being forced to copy every person nearby", "Learning only at school", "A rule that never changes"], answer: 0 },
      { question: "A peer group pressures a learner to exclude a classmate. What is a constructive response?", options: ["Recognise the pressure and act in a way that respects the classmate", "Exclude the classmate without question", "Share rumours about the learner", "Assume the group must be right"], answer: 0 },
    ],
  },
  "Values, morals and good character": {
    content: `# Values, morals and good character

Values are principles people consider important, such as honesty, fairness and care. Morals are beliefs about right and wrong conduct. Character is shown through repeated choices, especially when a person faces pressure or inconvenience. These ideas are connected but not identical: a person may value fairness yet still need to practise acting fairly when resources are limited.

Social Studies uses situations to examine values rather than treating them as slogans. If a learner finds a lost item, honesty involves making a reasonable effort to return it; fairness includes considering who owns it and following school procedures. Different communities may express values in different ways, and discussion should focus on reasons, effects and rights. Good character develops through reflection, accountability and the willingness to correct harm.`,
    objective: "Distinguish values, morals and character and apply them to a practical ethical choice.",
    activity: "Analyse a fictional lost-property case and explain how honesty and fairness guide a response.",
    quiz: [
      { question: "What does character refer to in this lesson?", options: ["Patterns of choices that show how a person acts", "A person's clothing", "A rule that never needs explanation", "A single opinion"], answer: 0 },
      { question: "A learner finds a classmate's notebook. Which action best reflects honesty?", options: ["Return it through the owner or a responsible teacher", "Keep it because it was unattended", "Hide it from the class", "Sell it to another pupil"], answer: 0 },
    ],
  },
  "Peace, Conflict and Peer Pressure": {
    content: `# Peace, conflict and peer pressure

Conflict occurs when people or groups have opposing needs, interests or interpretations. It is not always violent; disagreement can reveal a problem that needs attention. Peaceful resolution begins by making the situation safe, listening to each account and identifying the issue rather than attacking a person's character. Negotiation seeks an agreement; mediation uses a neutral person to help parties communicate.

Peer pressure is influence from people of similar age or status. It can encourage helpful behaviour or push someone toward unsafe choices. A learner can pause, state a boundary, suggest another activity or leave and seek support. If conflict involves threats, bullying or violence, the responsible adult should be informed. Reconciliation does not require a person to accept continued harm or abandon a fair process.`,
    objective: "Distinguish conflict from violence and identify safe ways to resist harmful peer pressure.",
    activity: "Role-play a disagreement about a group task and practise listening, stating needs and reaching a safe agreement.",
    quiz: [
      { question: "What is a useful first step in resolving a non-violent disagreement?", options: ["Listen to each account and identify the issue", "Insult the other person", "Spread the disagreement online", "Threaten anyone who disagrees"], answer: 0 },
      { question: "A friend pressures a learner to do something unsafe. What is a reasonable response?", options: ["State a boundary, leave if needed and seek support", "Agree to avoid disappointing the friend", "Hide the risk from adults", "Pressure another person to join"], answer: 0 },
    ],
  },
  "Peace, Conflict and Peer Pressure": {
    content: `# Peace, conflict and peer pressure

Conflict arises when people have competing needs, interests or views. It may be handled peacefully through discussion, negotiation or mediation, but it can become harmful when people use threats, intimidation or violence. A calm process identifies the disagreement, gives each person a chance to explain and looks for an agreement that does not violate anyone's safety or rights.

Peer pressure is influence from people in a person's social group. It can support good decisions, such as encouraging a friend to study, or encourage risky behaviour. A learner can prepare a brief refusal, suggest a safer alternative and leave the situation. Adults should be involved when pressure includes threats, bullying or danger. Resolving conflict does not mean pretending that harm did not occur.`,
    objective: "Describe constructive conflict resolution and choose a safe response to peer pressure.",
    activity: "Write two possible responses to a fictional risky invitation: one direct refusal and one request for support.",
    quiz: [
      { question: "Which action is part of peaceful conflict resolution?", options: ["Listen to each side and agree on a safe next step", "Use threats to end discussion", "Share private accusations publicly", "Ignore the effect on others"], answer: 0 },
      { question: "What should happen when peer pressure includes a threat?", options: ["Seek help from a trusted adult", "Handle it alone to keep a secret", "Threaten someone in return", "Assume the threat is harmless"], answer: 0 },
    ],
  },
  "National unity": {
    content: `# National unity

National unity is a sense of belonging and shared responsibility among people who live in the same country. It does not require everyone to speak one language, practise one religion or hold the same opinion. Nigeria's many communities contribute distinct histories, languages and traditions to public life. Unity is strengthened when people can participate fairly and when public institutions treat groups with respect.

Shared citizenship, constitutional rights, cooperation and fair access to services can support unity. Discrimination, exclusion and unequal treatment can weaken trust. A learner can contribute by refusing stereotypes, working with classmates from different backgrounds and checking claims about groups before repeating them. Unity is not silence about injustice; respectful discussion and equal protection are part of building a country people can identify with.`,
    objective: "Explain national unity as shared belonging that can include cultural and political difference.",
    activity: "Identify one school practice that helps learners from different backgrounds participate equally and propose an improvement.",
    quiz: [
      { question: "Does national unity require everyone to share one culture?", options: ["No; shared citizenship can include different cultures and views", "Yes; differences prevent cooperation", "Yes; only one language can be used", "No; people should avoid all shared responsibilities"], answer: 0 },
      { question: "Which action can support unity at school?", options: ["Challenge stereotypes and make group work inclusive", "Exclude learners with different backgrounds", "Spread unverified claims about a group", "Treat unequal access as unimportant"], answer: 0 },
    ],
  },
  "Citizenship": {
    content: `# Citizenship

Citizenship is legal membership of a state and a relationship between a person and public institutions. It carries rights and responsibilities defined by law. In Nigeria, citizenship may be acquired by birth, registration or naturalisation under the Constitution; the details depend on legal conditions. Ethnicity, language or place of residence alone does not determine every person's citizenship status.

Citizens participate in public life by obeying lawful rules, using services responsibly, respecting others' rights and taking part in elections or community discussion when eligible. A citizen can question government decisions through lawful channels. Citizenship does not mean that the government is always right, nor does it remove the duty to treat non-citizens with dignity. Understanding the legal basis helps learners distinguish citizenship from broader identity and belonging.`,
    objective: "Define citizenship and distinguish legal status from cultural identity and civic participation.",
    activity: "Sort examples into legal status, identity and civic participation, and explain why each category differs.",
    quiz: [
      { question: "What is citizenship primarily concerned with?", options: ["Legal membership and a person's relationship with the state", "A person's favourite language", "The town where someone shops", "Membership in one sports team"], answer: 0 },
      { question: "Which is an example of civic participation?", options: ["Taking part in a lawful community consultation", "Sharing an unverified accusation", "Ignoring other people's rights", "Claiming every government decision is correct"], answer: 0 },
    ],
  },
  "Human rights": {
    content: `# Human rights

Human rights are basic entitlements and freedoms that belong to people because they are human. They include protections such as dignity, life, fair treatment, expression and education, subject to the law and relevant limitations. Rights apply to everyone; they are not rewards for agreement or good behaviour. A right may be protected by a constitution, statute or international agreement, and the exact remedy depends on the law and circumstances.

Rights exist alongside responsibilities to respect the rights of others. For example, freedom of expression does not justify threats or deliberate harm. If a right is denied, a person can document what happened and seek advice from a trusted adult, legal support or an appropriate institution. Learners should distinguish a legal right from a personal preference and avoid promising outcomes without knowing the applicable process.`,
    objective: "Explain human rights as universal protections and identify lawful ways to seek help when rights are at risk.",
    activity: "Review a fictional rights dispute and identify the right at issue, affected people and a safe institution to consult.",
    quiz: [
      { question: "What is an important feature of human rights?", options: ["They belong to people and are not rewards for agreement", "They apply only to popular people", "They remove all responsibilities", "They guarantee every personal preference"], answer: 0 },
      { question: "What should a learner do when a right may have been violated?", options: ["Seek guidance from a trusted adult or appropriate institution", "Publish private details immediately", "Assume no process exists", "Promise a legal outcome without advice"], answer: 0 },
    ],
  },
  "Conflict and resolution": {
    content: `# Conflict and resolution

Conflict is a disagreement or competition over needs, goals, resources or beliefs. It can occur between individuals, groups or institutions. The presence of conflict does not automatically mean violence; the way people respond determines whether it escalates. Identifying the issue, the people affected and any unequal power helps explain what is happening.

Resolution may involve direct discussion, negotiation, mediation or a formal process. Each approach should protect safety and allow relevant people to be heard. In a school dispute over shared equipment, a schedule may address the resource problem better than blaming one class. When threats or violence are present, safety comes first and a responsible adult should be informed. An agreement should be clear enough to review later.`,
    objective: "Identify causes of conflict and compare peaceful methods of resolution.",
    activity: "Use a fictional dispute over a shared resource to propose a negotiated agreement and a way to review it.",
    quiz: [
      { question: "Which method uses a neutral person to help disputing parties communicate?", options: ["Mediation", "Retaliation", "Rumour spreading", "Exclusion"], answer: 0 },
      { question: "What should come first when a conflict includes a threat?", options: ["Safety and help from a responsible adult", "A public argument", "A forced private meeting", "An agreement to ignore the threat"], answer: 0 },
    ],
  },
  "Cooperation": {
    content: `# Cooperation

Cooperation is people working together toward a shared purpose while contributing different skills or resources. It requires communication, agreed roles and a way to make decisions. In a class project, one learner might gather information, another organise it and another present the findings. Clear roles reduce duplicated work, but the group should check that each member has a meaningful contribution.

Cooperation does not mean that everyone must agree immediately. Members can raise concerns, compare evidence and revise a plan. Fair cooperation recognises contributions and shares benefits and responsibilities. It also depends on trust: people need to keep commitments or inform the group when plans change. When a group fails, review the process rather than blaming one person without evidence.`,
    objective: "Describe the conditions for effective cooperation and apply them to a group task.",
    activity: "Plan a short class project with assigned roles, a communication method and a check for fair participation.",
    quiz: [
      { question: "Which practice supports cooperation in a group project?", options: ["Agree on roles and review whether each member can contribute", "Let one person do all the work", "Hide changes from the group", "Treat questions as disloyalty"], answer: 0 },
      { question: "Does cooperation require everyone to agree at once?", options: ["No; members can raise concerns and compare evidence", "Yes; disagreement must be silenced", "Yes; decisions need no discussion", "No; members should avoid a shared goal"], answer: 0 },
    ],
  },
  "Population": {
    content: `# Population

Population is the number of people living in a defined area at a stated time. Population size changes through births, deaths and migration. A population count is useful only when its area, date and method are known. Population density compares the number of people with the land area; it does not by itself show whether a place is overcrowded because access to housing, services and transport also matters.

Population data helps governments plan schools, clinics, water supply and transport. Counts can be incomplete when people are missed or boundaries are unclear, so responsible use includes checking the source and date. A large population can bring skills and demand as well as pressure on services. Learners should avoid treating people as a problem and instead examine how planning and resources meet people's needs.`,
    objective: "Distinguish population size from density and explain how population data supports planning.",
    activity: "Compare two fictional districts using population and land-area figures, then list one additional fact needed to assess service pressure.",
    quiz: [
      { question: "How is population density calculated conceptually?", options: ["People counted in relation to a defined land area", "Births in one family", "The number of roads in a district", "People who use one market on a single day"], answer: 0 },
      { question: "Why does high density alone not prove that a place is overcrowded?", options: ["Services, housing and transport also affect living conditions", "Density never uses land area", "Every dense area lacks services", "Population data has no planning value"], answer: 0 },
    ],
  },
  "Migration": {
    content: `# Migration

Migration is movement from one place to another with the intention of living there for a period of time. It may be internal, within a country, or international, across national borders. People migrate for many reasons: work, education, family, safety, environmental change or access to services. A single move can involve several reasons, and the decision may be voluntary or shaped by pressure.

Migration affects both places of origin and destination. Families may gain income or skills through remittances, while communities may lose workers or be separated from relatives. Destination areas may benefit from new skills but need to plan housing and services. Avoid describing migrants as a single type of person. Reliable analysis asks who moved, why, under what conditions and what evidence supports the explanation.`,
    objective: "Define migration and compare possible effects on places of origin and destination.",
    activity: "Use a fictional family case to separate reasons for migration from effects on the origin and destination communities.",
    quiz: [
      { question: "Which example is internal migration?", options: ["A family moves from one Nigerian state to another", "A student reads about another country", "A trader visits a market for one day", "A person changes schools within one town"], answer: 0 },
      { question: "Why should migration be explained using more than one possible cause?", options: ["People may move for several connected reasons", "Every migrant has the same reason", "Movement always happens voluntarily", "Destination communities are unaffected"], answer: 0 },
    ],
  },
  "Urbanization": {
    content: `# Urbanization

Urbanization is the growth in the share or number of people living in urban areas. It can result from natural population increase, migration and the expansion or reclassification of settlements. Urban growth can support markets, education, specialised work and cultural exchange. It can also increase demand for housing, clean water, transport, waste collection and health services when planning does not keep pace.

Urban problems are not solved by blaming people who move to cities. Planning decisions, land access, employment and infrastructure shape how growth affects residents. A useful study compares areas within a city, since services and risks are not distributed equally. Learners can map a change, identify who benefits or faces difficulty and consider realistic responses such as transport planning, drainage maintenance and affordable services.`,
    objective: "Explain urbanization and evaluate both opportunities and service-planning challenges.",
    activity: "Compare two neighbourhoods in a fictional growing town and identify one planning need in each.",
    quiz: [
      { question: "Which factor can contribute to urbanization?", options: ["Settlement expansion and migration to urban areas", "Only a change in rainfall", "A decrease in all city services", "The disappearance of all rural communities"], answer: 0 },
      { question: "What is a useful way to study urban growth?", options: ["Examine how benefits and service needs differ across neighbourhoods", "Blame newcomers for every problem", "Assume all residents have equal access", "Ignore planning decisions"], answer: 0 },
    ],
  },
  "Environment and resources": {
    content: `# Environment and resources

The environment includes living things, physical conditions and the places people use. Resources such as water, soil, forests and minerals support life and economic activity, but they are limited or unevenly distributed. How a resource is used affects ecosystems and communities. Cutting trees can provide land or fuel in the short term while increasing erosion or reducing habitat if regeneration is ignored.

Sustainable use considers present needs and the ability of future generations to meet theirs. It involves evidence about the resource, the people who depend on it and the consequences of different choices. Conservation may include protecting watersheds, reducing waste or restoring damaged areas. Responsibility is shared among households, businesses and public authorities; individual action matters, but infrastructure and fair rules also shape environmental outcomes.`,
    objective: "Explain resource use and assess how a choice can affect ecosystems and communities over time.",
    activity: "Trace one everyday product to a natural resource and list two effects of its production or disposal.",
    quiz: [
      { question: "What does sustainable resource use consider?", options: ["Present needs and the resource available to future generations", "Only immediate profit", "A resource's colour", "Whether waste can be hidden"], answer: 0 },
      { question: "Why is environmental responsibility shared?", options: ["Households, businesses and authorities influence resource use", "Only children affect ecosystems", "Public rules never matter", "One person can control every environmental outcome"], answer: 0 },
    ],
  },
  "Agriculture and society": {
    content: `# Agriculture and society

Agriculture includes growing crops, raising livestock, fishing and related work that supplies food and raw materials. It connects rural and urban communities through labour, markets, transport, processing and consumption. A poor harvest may affect farmers' income, food prices and businesses that depend on farm products. Agricultural work is influenced by land access, rainfall, soil, tools, credit, storage and market conditions.

Agricultural development should consider both production and people's livelihoods. Improved seeds or machinery can raise output, but access and cost determine who benefits. Soil and water need care so production can continue. Learners can trace a local food from producer to consumer and identify where value is added, where losses occur and how transport or storage affects its price.`,
    objective: "Describe agriculture's connections to society and identify factors that shape production and livelihoods.",
    activity: "Trace a familiar food through production, transport, sale and consumption; note one point where storage could reduce waste.",
    quiz: [
      { question: "Which is one way agriculture connects rural and urban communities?", options: ["Food moves through transport and markets to consumers", "Farms have no relationship with towns", "Only cities produce raw materials", "Farm prices never affect consumers"], answer: 0 },
      { question: "Why should agricultural development consider access and cost?", options: ["A technology may benefit only people who can obtain and use it", "Every farmer has identical resources", "Costs do not affect production", "Soil care is unrelated to farming"], answer: 0 },
    ],
  },
  "Industry and employment": {
    content: `# Industry and employment

Industry transforms raw materials into goods or provides services through organised work. Employment gives people income and can develop skills, while businesses supply products and services to society. Industries differ in scale, technology and working conditions. A food-processing business, for example, connects farmers, transporters, workers, retailers and consumers.

Industrial growth can create jobs and add value, but it may also affect health, safety and the environment. Workers need fair conditions and protection from avoidable hazards. Communities can ask how a facility manages waste, what skills it requires and whether local people can access employment. Economic activity should be assessed through its benefits and costs rather than assuming that any new industry is automatically beneficial.`,
    objective: "Explain how industry links production and employment and assess effects on workers and communities.",
    activity: "Choose a local product and diagram the jobs and services involved in making and selling it.",
    quiz: [
      { question: "What does a food-processing industry do?", options: ["Transforms farm products into goods for further use or sale", "Only consumes finished goods", "Removes the need for workers", "Disconnects farms from markets"], answer: 0 },
      { question: "What should a community consider when a new industry opens?", options: ["Jobs, working conditions and environmental effects", "Only the building's size", "Whether workers can be ignored", "How to avoid public information"], answer: 0 },
    ],
  },
  "Transportation": {
    content: `# Transportation

Transportation moves people and goods between places. Roads, railways, waterways and air routes each have different costs, capacities and environmental effects. A farmer may rely on roads to move produce to market; a poor route or delay can increase spoilage and price. Transport also affects access to schools, health services, work and family networks.

Transport systems need maintenance, safe design and fair access. Congestion, crashes, emissions and unreliable service affect people differently. When comparing options, consider distance, travel time, cost, safety, accessibility and the type of goods carried. A new route can bring opportunity while also changing land use and local traffic. Good planning asks who benefits, who bears the cost and how risks will be managed.`,
    objective: "Compare transport modes and explain how transport affects access, trade and safety.",
    activity: "Plan a route for perishable produce from a farm to a market and identify two risks that could delay or damage it.",
    quiz: [
      { question: "Why can transport affect the price of farm produce?", options: ["Delay and damage can add costs or reduce the amount sold", "Routes never affect markets", "Transport removes all storage needs", "Prices depend only on distance"], answer: 0 },
      { question: "Which factors belong in a transport comparison?", options: ["Cost, safety, accessibility and environmental effect", "Colour of the vehicle alone", "Only the driver's preference", "Whether maintenance can be avoided"], answer: 0 },
    ],
  },
  "Communication": {
    content: `# Communication

Communication is the exchange of information, ideas or feelings. It can be spoken, written, visual or non-verbal. Effective communication depends on a message, a sender, a receiver and a channel; noise, language differences or poor access can change how a message is understood. Listening and asking a clarifying question are as important as speaking clearly.

Communication supports family life, education, commerce and public services. A health notice, for instance, must reach the intended audience in a language and format they can use. Feedback helps the sender know whether the message was understood. Learners should adapt their language to the audience, check important facts and protect private information. Misunderstanding is easier to resolve when people describe what they heard rather than assume intent.`,
    objective: "Identify parts of a communication process and explain how feedback and access affect understanding.",
    activity: "Give a partner a short set of directions, then revise them based on where the listener needed clarification.",
    quiz: [
      { question: "What does feedback help a sender understand?", options: ["Whether the receiver understood the message", "Whether the message can be hidden", "Whether the channel is always perfect", "Whether listening is unnecessary"], answer: 0 },
      { question: "How can a public message become more accessible?", options: ["Use a suitable language and format for its audience", "Assume everyone reads the same language", "Remove all opportunities for questions", "Share private information publicly"], answer: 0 },
    ],
  },
  "Mass media": {
    content: `# Mass media

Mass media distribute information to large audiences through radio, television, newspapers, websites and social platforms. Media can inform the public, support education, entertain and provide a forum for discussion. Different outlets choose what to report and how to frame it, so audiences should distinguish reporting, commentary and advertising.

Media literacy means checking a message before accepting or sharing it. Consider the source, date, evidence, intended audience and whether other reliable sources confirm the claim. Images and headlines can be taken out of context. A popular post is not automatically accurate. People also have responsibilities when publishing: avoid spreading private information, targeted harassment or unverified allegations. A free media environment can support accountability, while accuracy and fairness remain important.`,
    objective: "Explain the roles of mass media and apply basic checks to a media claim.",
    activity: "Compare two reports on the same event and note differences in sources, evidence and framing.",
    quiz: [
      { question: "What should a learner check before sharing a striking online claim?", options: ["Source, date and supporting evidence", "Number of angry comments only", "Whether the headline is exciting", "Whether a friend shared it"], answer: 0 },
      { question: "Which is a public role of mass media?", options: ["Informing people and providing a forum for discussion", "Guaranteeing every claim is true", "Replacing all public institutions", "Removing the need for privacy"], answer: 0 },
    ],
  },
  "Science and society": {
    content: `# Science and society

Science develops explanations through observation, evidence, testing and revision. Scientific knowledge can support health care, agriculture, communication and environmental planning. It is not a collection of unchangeable claims: explanations can be refined when stronger evidence becomes available. A scientific result should be evaluated by its method and evidence, not by whether it agrees with a person's preference.

Technology applies knowledge to practical purposes, but its effects depend on how people design and use it. A new tool may improve access to information while raising questions about privacy, cost or unequal availability. When communities consider a scientific or technological change, they can ask what evidence supports it, who benefits, what risks exist and how those risks may be monitored.`,
    objective: "Distinguish scientific evidence from opinion and assess social effects of a technology.",
    activity: "Choose a familiar technology and make a benefits-and-risks table for two different groups of users.",
    quiz: [
      { question: "What supports a scientific explanation?", options: ["Evidence gathered through a suitable method", "Popularity alone", "A claim that cannot be checked", "Agreement with one person's preference"], answer: 0 },
      { question: "What should a community ask about a new technology?", options: ["Who benefits, what risks exist and how they can be monitored", "Whether it is new enough to avoid questions", "How to ignore unequal access", "Why evidence is unnecessary"], answer: 0 },
    ],
  },
  "Social problems": {
    content: `# Social problems

A social problem is a condition that harms people's wellbeing or prevents fair participation and is recognised as requiring collective attention. Examples may include unsafe water, unemployment, discrimination, violence or inadequate housing. The causes are often connected: limited employment can affect income, health and school attendance. Describing a problem accurately requires evidence and attention to whose experiences are being counted.

Responses should address causes as well as immediate effects. A community study might collect information from affected people, review available services and identify the responsibilities of relevant authorities. Avoid blaming individuals for conditions shaped by broader systems. A proposal should be realistic, respectful and open to review. Learners can contribute by raising concerns safely and supporting informed action, while recognising that complex problems require cooperation and sustained resources.`,
    objective: "Define a social problem and outline an evidence-based way to investigate causes and responses.",
    activity: "Choose a fictional community problem and identify affected groups, evidence needed and one responsible institution to consult.",
    quiz: [
      { question: "Why should an investigation include affected people?", options: ["Their experience helps show how the problem operates and whom it harms", "They must be blamed for the problem", "Their views replace all other evidence", "It removes the need for privacy"], answer: 0 },
      { question: "What makes a response to a social problem more useful?", options: ["It considers causes, responsible institutions and how results will be reviewed", "It makes a promise without evidence", "It blames one group automatically", "It ignores affected people"], answer: 0 },
    ],
  },
  "Global interdependence": {
    content: `# Global interdependence

Countries and communities depend on one another through trade, communication, migration, technology, culture and shared environmental systems. A product sold locally may use materials from several countries and be assembled elsewhere. A change in one part of the chain can affect workers, prices and availability in other places. Interdependence brings opportunities for exchange as well as vulnerability to disruptions.

Global connections are not always equal. Some participants have more bargaining power, information or resources than others. Learners can trace where a product comes from, who makes it and how it reaches consumers. They can then ask how benefits and costs are shared. International cooperation is also needed for issues such as disease control and climate risks, because their effects can cross borders.`,
    objective: "Explain global interdependence using a product or issue connected across countries.",
    activity: "Trace the origin, production and transport of a common product and identify two groups linked by the supply chain.",
    quiz: [
      { question: "What is an example of global interdependence?", options: ["A local product relies on materials and workers in several countries", "A community uses no outside goods or information", "A national border prevents every exchange", "A product has only one possible effect"], answer: 0 },
      { question: "Why should a supply chain be examined for unequal effects?", options: ["Different participants may receive different benefits and bear different costs", "All participants always have equal power", "Trade never affects workers", "Prices cannot change"], answer: 0 },
    ],
  },
  "Community investigation": {
    content: `# Community investigation

A community investigation uses a clear question and appropriate evidence to understand a local issue. Begin by defining the place and topic, then decide what information is needed. Observation, maps, public records and interviews can each help, but every method has limits. An interview records a person's account; it does not automatically represent every resident. Ask permission, explain the purpose and avoid collecting private details that are not needed.

Organise findings before drawing conclusions. Separate direct observations from interpretations, compare evidence from more than one source and note what remains uncertain. Present results clearly, including the method and limitations. A recommendation should follow from the evidence and identify who could act. Investigation is not surveillance or a search for someone to blame; it is a disciplined way to understand a shared concern.`,
    objective: "Plan a respectful community investigation and distinguish evidence, interpretation and recommendation.",
    activity: "Draft a short investigation plan with a question, two evidence sources, a privacy safeguard and a way to present findings.",
    quiz: [
      { question: "What should a learner do before interviewing a community member?", options: ["Explain the purpose, ask permission and avoid unnecessary private details", "Record the person secretly", "Promise the interview represents everyone", "Share the person's address"], answer: 0 },
      { question: "What belongs in a responsible investigation report?", options: ["The method, evidence, limitations and supported recommendation", "Only the conclusion", "Private details unrelated to the question", "Claims that the evidence cannot support"], answer: 0 },
    ],
  },
};

const courseIds = new Set(["jss1-social-studies", "jss2-social-studies", "jss3-social-studies"]);
const curriculum = JSON.parse(await fs.readFile(curriculumPath, "utf8"));
let matchingCourses = 0;
let updatedLessons = 0;
const missingTitles = new Set();

for (const course of curriculum.courses ?? []) {
  if (!courseIds.has(course.id)) continue;
  matchingCourses += 1;

  for (const module of course.modules ?? []) {
    for (const lesson of module.lessons ?? []) {
      const editorial = topics[lesson.title];
      if (!editorial) {
        missingTitles.add(lesson.title);
        continue;
      }

      updatedLessons += 1;
      lesson.content = editorial.content;
      lesson.objective = editorial.objective;
      lesson.activity = editorial.activity;
      lesson.commonMistakes = ["Use the evidence and context in the example; do not assume one experience represents every person or community."];
      lesson.keyTerms = [lesson.title, "community", "evidence", "participation"];
      lesson.summary = editorial.content.replace(/^#\s+.+\n+/, "").replace(/\s+/g, " ").trim().slice(0, 320);
      lesson.quiz = editorial.quiz.map((question, index) => ({ id: `${lesson.id}-editorial-q${index + 1}`, ...question }));
    }
  }
}

if (matchingCourses !== courseIds.size || updatedLessons !== 81 || missingTitles.size) {
  throw new Error(JSON.stringify({ matchingCourses, updatedLessons, expectedLessons: 81, missingTitles: [...missingTitles] }));
}

if (applyChanges) await fs.writeFile(curriculumPath, `${JSON.stringify(curriculum, null, 2)}\n`, "utf8");

console.log(JSON.stringify({ mode: applyChanges ? "apply" : "dry-run", courses: matchingCourses, topics: Object.keys(topics).length, updatedLessons }, null, 2));