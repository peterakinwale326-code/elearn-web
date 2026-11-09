import fs from "node:fs/promises";
import path from "node:path";

const curriculumPath = path.resolve(process.cwd(), "data", "curriculum.json");
const applyChanges = process.argv.includes("--apply");

const civicTopics = {
  "Meaning of civic education": {
    content: `# Meaning of civic education

Civic Education studies how people live as members of a political community. It covers citizenship, rights, responsibilities, public institutions, participation and the values that support peaceful public life. Its purpose is not to teach unquestioning obedience. A responsible citizen understands rules, asks how decisions are made and uses lawful ways to raise concerns.

Civic knowledge becomes practical when learners connect it to familiar institutions. A school election can introduce representation; a community meeting can show how residents discuss a shared service. In each case, participation works best when people have reliable information and can speak without intimidation. Civic Education therefore combines knowledge with judgement: learners should be able to explain a rule, consider who it affects and identify a fair process for action.`,
    objective: "Explain the purpose of Civic Education and connect civic knowledge with participation in public life.",
    quiz: [
      { question: "Which topic belongs in Civic Education?", options: ["How citizens participate and hold public institutions accountable", "How to avoid every public responsibility", "How to silence disagreement", "How to replace evidence with loyalty"], answer: 0 },
      { question: "What is a useful outcome of civic learning?", options: ["Use knowledge of rights and institutions to participate responsibly", "Obey every instruction without question", "Avoid learning how decisions are made", "Treat personal opinion as law"], answer: 0 },
    ],
  },
  Citizenship: {
    content: `# Citizenship

Citizenship is legal membership of a state and the relationship between a person and public institutions. In Nigeria, the Constitution recognises citizenship by birth, registration and naturalisation, subject to the conditions set out in law. Citizenship is not the same as ethnicity, language, religion or residence; people may share an identity without holding the same legal status.

Citizenship brings protections and responsibilities. Citizens can use lawful processes to participate in public affairs, while also respecting the rights of others and the laws that apply. A citizen may criticise a policy without rejecting the country or its people. When examining a citizenship question, identify the legal rule and the relevant facts rather than making assumptions from a person's name, accent or appearance.`,
    objective: "Define citizenship and distinguish legal membership from cultural identity and residence.",
    quiz: [
      { question: "Which statement distinguishes citizenship from ethnicity?", options: ["Citizenship is a legal status; ethnicity is a form of social identity", "They are always identical", "Citizenship depends only on language", "Ethnicity is assigned by an election"], answer: 0 },
      { question: "Where should a question about Nigerian citizenship rules be checked?", options: ["The relevant constitutional and legal provisions", "A person's accent alone", "An unverified social post", "A classmate's guess"], answer: 0 },
    ],
  },
  "Duties of citizens": {
    content: `# Duties of citizens

Civic duties are responsibilities citizens are expected or required to fulfil under law and in public life. Examples include obeying valid laws, paying taxes when legally due, serving on a jury where applicable and respecting other people's rights. Some forms of participation, such as voting, are rights as well as important civic responsibilities; the details depend on eligibility rules.

Duties should be understood alongside government obligations. Citizens may follow traffic rules, while public authorities must maintain safe roads and apply rules fairly. A duty does not require a person to accept abuse or remain silent about wrongdoing. Learners can distinguish a legal obligation from a voluntary contribution by checking the law or policy that applies. Responsible citizenship combines cooperation with the right to question public decisions through lawful channels.`,
    objective: "Distinguish legal duties from voluntary civic contributions and explain their relationship to public responsibilities.",
    quiz: [
      { question: "Which is an example of a civic duty?", options: ["Respecting other people's lawful rights", "Taking public property for personal use", "Avoiding every legal obligation", "Preventing others from participating"], answer: 0 },
      { question: "Does fulfilling a civic duty mean citizens cannot criticise government?", options: ["No; lawful criticism and accountability are part of public life", "Yes; duties remove all rights", "Yes; public decisions cannot be questioned", "No; duties apply only to officials"], answer: 0 },
    ],
  },
  "Rights and responsibilities": {
    content: `# Rights and responsibilities

Rights protect people's dignity, freedom and ability to participate in society. Responsibilities describe obligations to respect the rights of others and follow applicable laws. These ideas work together: freedom of expression protects discussion, while responsibility requires avoiding threats and deliberate harm. A right is not a reward for good behaviour, and a responsibility does not cancel a person's basic protections.

When a dispute arises, identify the right involved, the people affected and any lawful limits that apply. Public authorities must act within the law, and people can use established complaint or review processes when they believe a right has been breached. Learners should avoid promising a legal outcome without knowing the facts. Accurate civic reasoning describes both the protection and the process for seeking it.`,
    objective: "Relate rights to responsibilities and identify the legal process relevant to a civic dispute.",
    quiz: [
      { question: "How do rights and responsibilities relate?", options: ["Responsibilities include respecting other people's rights", "Responsibilities erase rights", "Rights apply only to officials", "They have no connection"], answer: 0 },
      { question: "What should a learner identify in a rights dispute?", options: ["The right, affected people and relevant lawful process", "Only which person is more popular", "A guaranteed outcome before checking facts", "A reason to publish private details"], answer: 0 },
    ],
  },
  "Rule of law": {
    content: `# Rule of law

The rule of law means that public power is exercised under established law, not personal whim. Laws should be publicly known, applied consistently and enforced through fair procedures. Government officials and citizens are both subject to the law. An arrest, for example, must follow legal safeguards; a person's guilt should be determined through a proper process rather than public accusation.

The rule of law depends on institutions that can apply rules independently and provide remedies. It is weakened when officials act outside their authority, when similar cases are treated arbitrarily or when people cannot access justice. Learners should distinguish a law from a personal instruction and ask whether a decision has a lawful basis. Respect for law includes seeking reform through legitimate channels when a law or its application is unjust.`,
    objective: "Explain the rule of law and identify practices that strengthen or weaken it.",
    quiz: [
      { question: "Which situation reflects the rule of law?", options: ["An official's decision can be reviewed under established procedures", "A leader is exempt from every law", "Rules change secretly for one person", "Guilt is decided by rumour"], answer: 0 },
      { question: "What weakens the rule of law?", options: ["Applying similar rules arbitrarily to different people", "Publicly stating legal requirements", "Providing a fair review process", "Holding officials to lawful limits"], answer: 0 },
    ],
  },
  Constitution: {
    content: `# Constitution

A constitution is the foundational set of rules that establishes a state's institutions, distributes public powers and protects rights. Nigeria's Constitution provides for a federal system and describes the powers and responsibilities of the branches and levels of government. It also sets procedures for elections, lawmaking, public office and constitutional change.

The constitution is not simply a list of ideals: it is a legal framework used to assess whether public action is authorised. When a dispute concerns government power, identify the relevant provision and the institution responsible for interpreting or applying it. Constitutional rules can be amended only through the specified process. Learners should use an authoritative text and distinguish the wording of a provision from commentary about what it means.`,
    objective: "Describe the purpose of a constitution and explain how it structures and limits public authority.",
    quiz: [
      { question: "What is a central purpose of a constitution?", options: ["Establish public institutions, powers and rights", "Replace every ordinary law", "Give one official unlimited authority", "Prevent any future amendment"], answer: 0 },
      { question: "How should a learner check the wording of a constitutional rule?", options: ["Consult an authoritative constitutional text", "Rely only on a forwarded message", "Assume commentary is the legal text", "Ask a person who has not seen the provision"], answer: 0 },
    ],
  },
  Democracy: {
    content: `# Democracy

Democracy is a system in which political authority is grounded in the people and exercised through participation, representation and lawful institutions. Elections are important, but democracy also depends on civil liberties, open debate, accountable government, peaceful transfer of power and fair treatment under the law. A majority decision does not remove the rights of people who disagree.

Democratic participation happens between elections too. Citizens can discuss policy, contact representatives, join associations and monitor public services. These actions are meaningful when people have information and can participate without intimidation. Learners can assess a democratic practice by asking whether choices are genuine, rules are fairly applied and officials can be held accountable. Democracy is maintained through institutions and habits, not just the act of voting.`,
    objective: "Identify democratic principles beyond elections and explain how participation supports accountability.",
    quiz: [
      { question: "Which is a democratic safeguard beyond holding elections?", options: ["Protection of rights and accountability between elections", "Silencing minority views", "Giving officials permanent power", "Preventing public access to information"], answer: 0 },
      { question: "Why do democratic systems protect people who lose a vote?", options: ["A majority decision does not erase minority rights", "Only winners remain citizens", "Rights depend on popularity", "Votes replace the law"], answer: 0 },
    ],
  },
  Elections: {
    content: `# Elections

An election is a formal process through which eligible voters choose representatives or decide a public question. Credible elections require clear rules, accurate voter information, secure voting and counting, impartial administration and a process for resolving complaints. Candidates and parties compete, while voters evaluate their records, proposals and conduct.

Voters should use reliable information and protect the secrecy of their ballot. Buying votes, intimidation and deliberate misinformation undermine free choice. Election officials must apply procedures consistently and publish results through authorised channels. A close result is not proof of fraud by itself; concerns should be supported by evidence and raised through the legal process. Elections can select leaders, but citizens continue to monitor public decisions after polling ends.`,
    objective: "Describe requirements for credible elections and distinguish evidence-based complaints from unsupported claims.",
    quiz: [
      { question: "Which condition supports a credible election?", options: ["Consistent procedures for voting and counting", "Intimidation at polling places", "Secret changes to eligibility rules", "Vote buying"], answer: 0 },
      { question: "How should an election complaint be handled?", options: ["Present evidence through the authorised legal process", "Treat every rumour as proof", "Threaten election workers", "Change ballots personally"], answer: 0 },
    ],
  },
  "Political participation": {
    content: `# Political participation

Political participation is action through which people influence public decisions. Voting is one form, but participation also includes attending consultations, contacting representatives, joining lawful associations, submitting petitions and discussing policy. Different channels suit different issues; a local service concern may be raised with a local authority, while a national policy question may require a representative or public consultation.

Participation should be informed, peaceful and accessible. People may disagree about priorities, so a useful contribution states the issue, gives relevant evidence and explains who is affected. Public institutions should provide clear ways to receive and respond to concerns. Learners can practise participation through a school council or community project while respecting privacy and ensuring that quieter members have a chance to speak.`,
    objective: "Compare forms of political participation and select a suitable channel for a public concern.",
    quiz: [
      { question: "Which is political participation outside an election?", options: ["Submitting a petition about a public service", "Ignoring a public consultation", "Damaging a polling station", "Sharing private information about an opponent"], answer: 0 },
      { question: "What strengthens a public complaint?", options: ["A clear issue, relevant evidence and an explanation of who is affected", "An unsupported accusation", "A threat to an official", "An unrelated personal detail"], answer: 0 },
    ],
  },
  "Good governance": {
    content: `# Good governance

Good governance describes how public authority is exercised to serve people lawfully and effectively. It involves accountability, transparency, participation, fairness, responsiveness and responsible use of public resources. These principles can be examined in a school board, local council or national institution. For example, publishing a budget makes spending easier to scrutinise, while an accessible complaint process helps residents report a failed service.

No institution should be judged by a slogan alone. Ask whether decisions follow the law, whether affected people can contribute, whether resources are reported and whether poor performance leads to review. Good governance does not mean every decision satisfies every person; it means decisions have a defensible process and can be questioned. Citizens and officials both have roles, though public office carries special duties of service and accountability.`,
    objective: "Identify principles of good governance and use them to assess a public decision or service.",
    quiz: [
      { question: "Which practice improves transparency?", options: ["Publishing understandable information about public spending", "Hiding budgets from residents", "Changing service rules without notice", "Preventing complaints"], answer: 0 },
      { question: "Does good governance require every person to agree with every decision?", options: ["No; it requires lawful, accountable processes that can be questioned", "Yes; disagreement ends public participation", "Yes; officials must avoid explaining decisions", "No; public services need no review"], answer: 0 },
    ],
  },
  Leadership: {
    content: `# Leadership

Leadership is the exercise of influence and responsibility in guiding people toward a shared purpose. In public life, leaders may be elected, appointed or selected within an organisation. A title alone does not make leadership effective. Leaders need to explain decisions, listen to affected people, manage disagreement and use authority within lawful limits.

Accountable leadership can be assessed through conduct and results: Were commitments followed? Were resources used for the stated purpose? Could people raise concerns safely? A leader may delegate work, but remains responsible for oversight. In a class or community project, learners can practise leadership by sharing roles and reporting progress honestly. Leadership should enable others to contribute rather than create dependence on one individual.`,
    objective: "Assess leadership by examining lawful authority, participation, responsibility and results.",
    quiz: [
      { question: "Which action demonstrates accountable leadership?", options: ["Report how shared resources were used and answer questions", "Claim authority removes all scrutiny", "Silence people affected by a decision", "Hide whether a commitment was met"], answer: 0 },
      { question: "What is a useful test of leadership effectiveness?", options: ["Whether commitments, decisions and results can be reviewed", "The leader's title alone", "How many people are afraid to disagree", "Whether responsibilities are concealed"], answer: 0 },
    ],
  },
  Accountability: {
    content: `# Accountability

Accountability is the obligation to explain decisions and accept appropriate review or consequences. Public officials are accountable because they exercise authority and manage resources on behalf of the public. Mechanisms include legislative oversight, audits, courts, published reports, elections and complaint procedures. Each mechanism has a different role; an audit examines records, while a court resolves legal disputes.

Accountability works only when information is reliable and review is independent enough to matter. Accusations should not be treated as proof; evidence must be examined through fair procedures. Citizens can support accountability by asking specific questions, using lawful channels and protecting confidential information. The aim is not revenge but responsible administration, correction of mistakes and prevention of misuse of authority.`,
    objective: "Define accountability and distinguish oversight mechanisms used to review public action.",
    quiz: [
      { question: "What does an audit primarily examine?", options: ["Records and use of resources", "A person's popularity", "The weather during an election", "Private opinions unrelated to spending"], answer: 0 },
      { question: "Why should an allegation be reviewed through fair procedures?", options: ["Evidence must be assessed before conclusions or consequences", "Popularity proves guilt", "Public review has no rules", "Accountability means revenge"], answer: 0 },
    ],
  },
  "National symbols": {
    content: `# National symbols

National symbols represent a country's identity and shared civic life. Nigeria's flag, coat of arms, anthem and pledge are used in public ceremonies and educational settings. Their colours and features have defined meanings, and official descriptions should be checked rather than invented. Symbols can create a sense of belonging, but they do not erase the country's cultural and political differences.

Respect for a symbol includes understanding its context and following lawful protocol. It does not require people to agree with every government decision. Symbols are most meaningful when public institutions also uphold the rights and responsibilities they represent. Learners can distinguish an official symbol from a party logo, commercial mark or regional emblem by checking who adopted it and the purpose for which it is used.`,
    objective: "Identify Nigerian national symbols and explain their civic purpose without confusing them with party or commercial symbols.",
    quiz: [
      { question: "Which is a national symbol of Nigeria?", options: ["The national flag", "A private company's logo", "A campaign poster", "A school sports badge"], answer: 0 },
      { question: "How should a learner confirm the meaning of a symbol's design?", options: ["Use an authoritative official description", "Guess from its colours", "Rely on a rumour", "Assume every symbol has the same meaning"], answer: 0 },
    ],
  },
  "National identity": {
    content: `# National identity

National identity is a sense of belonging connected with a country and its shared civic life. It can include citizenship, common institutions, historical experiences, public symbols and participation in national affairs. People may feel Nigerian while also identifying strongly with a language, community, region, faith or profession. These identities can coexist rather than compete.

An inclusive national identity recognises equal citizenship and avoids treating one group's culture as the national standard. Public institutions, education and shared civic activities can strengthen belonging when they represent people fairly. Learners can consider how a public event, history lesson or national symbol makes different groups feel included. National identity is not a test of loyalty based on appearance or accent; it is shaped through shared rights, responsibilities and participation.`,
    objective: "Explain national identity as compatible with diverse community identities and equal citizenship.",
    quiz: [
      { question: "Can a person hold a national identity and a community identity at the same time?", options: ["Yes; identities can coexist", "No; only one identity is possible", "Only if both use the same language", "Only during elections"], answer: 0 },
      { question: "What supports an inclusive national identity?", options: ["Equal citizenship and fair representation", "Treating one group's culture as the only national culture", "Judging loyalty by accent", "Excluding minority communities"], answer: 0 },
    ],
  },
  "Unity in diversity": {
    content: `# Unity in diversity

Unity in diversity means people can cooperate around shared civic commitments while retaining different languages, beliefs and customs. Nigeria's communities contribute distinct experiences to national life. Cooperation is more durable when people have equal protection and a fair chance to participate, rather than being asked to hide their identity.

Diversity also requires practical habits: listen to unfamiliar perspectives, challenge stereotypes and resolve disagreement without intimidation. A group project can model this when members share decisions and give everyone a meaningful role. Unity is weakened by discrimination and unequal access, so addressing unfair treatment is part of building common belonging. Learners should distinguish respectful unity from forced sameness, and use specific examples rather than broad claims about entire groups.`,
    objective: "Explain how cooperation and equal participation can support unity across cultural differences.",
    quiz: [
      { question: "What does unity in diversity reject?", options: ["The idea that cooperation requires everyone to be the same", "Equal participation", "Respectful discussion", "Shared civic commitments"], answer: 0 },
      { question: "Which classroom practice supports unity in diversity?", options: ["Give each group member a meaningful role and listen to different views", "Exclude a learner for a different background", "Treat stereotypes as evidence", "Silence disagreement"], answer: 0 },
    ],
  },
  "Human rights": {
    content: `# Human rights

Human rights are protections and freedoms that belong to people because they are human. They include dignity, equal protection, expression, education and safeguards against abuse. The Nigerian Constitution protects fundamental rights, while statutes and international instruments provide additional frameworks. The exact legal remedy depends on the right, the facts and the institution with authority to respond.

Rights belong to everyone, including people who are unpopular or accused of wrongdoing. They coexist with lawful limits and responsibilities toward others. If a person believes a right has been violated, they should document relevant facts and seek advice through a trusted adult, legal service or appropriate institution. Learners should distinguish a legal right from a preference and avoid sharing private information when discussing a case.`,
    objective: "Describe human rights and identify safe, lawful routes for seeking support when they are threatened.",
    quiz: [
      { question: "Do human rights depend on whether a person is popular?", options: ["No; they belong to people and are not popularity rewards", "Yes; unpopular people have none", "Only during elections", "Only when someone agrees with officials"], answer: 0 },
      { question: "What is a responsible response to a possible rights violation?", options: ["Seek guidance and use an appropriate process", "Publish private details immediately", "Promise an outcome without knowing the law", "Ignore the person's safety"], answer: 0 },
    ],
  },
  "Child rights": {
    content: `# Child rights

Child rights are protections and entitlements for every person under 18, subject to the applicable law. They include protection from abuse and exploitation, access to education and health care, identity and the opportunity to be heard in matters affecting them. Adults and public institutions have responsibilities to protect children's wellbeing and best interests.

Children also have responsibilities appropriate to their age, such as respecting others and following fair school rules. These responsibilities do not make a child responsible for adult decisions or remove their right to protection. If a learner feels unsafe, they should speak with a trusted adult or contact an appropriate child-protection service. Class discussions should use fictional cases and protect classmates from pressure to disclose personal experiences.`,
    objective: "Identify core child protections and explain why adult safeguarding duties cannot be transferred to children.",
    quiz: [
      { question: "Which statement about child rights is accurate?", options: ["Children have protections and should be heard in matters affecting them", "Children must solve every safety problem alone", "Rights disappear when a child makes a mistake", "Only adults have a right to education"], answer: 0 },
      { question: "What should a learner do if they feel unsafe?", options: ["Tell a trusted adult or appropriate protection service", "Keep the danger secret", "Confront a dangerous adult alone", "Share the story publicly before seeking help"], answer: 0 },
    ],
  },
  "Justice and equality": {
    content: `# Justice and equality

Equality means people have equal status and protection under the law. Justice concerns fair treatment, procedures and remedies when rights or rules are at issue. Equal treatment does not always mean identical support: a person may need a reasonable accommodation to access the same opportunity. Fairness requires examining the rule, the circumstances and the effect on the people involved.

Discrimination occurs when people are treated unfairly on a protected or irrelevant basis. To assess a case, compare how similar situations were handled and ask whether a difference has a lawful, justified reason. Institutions should make decisions consistently and provide a way to challenge them. Learners can practise fairness by applying classroom rules transparently and ensuring that all participants can take part.`,
    objective: "Distinguish equality from identical treatment and identify evidence of fair or discriminatory practice.",
    quiz: [
      { question: "Why might equal access require different support for different learners?", options: ["An accommodation can remove a barrier to the same opportunity", "Fairness always means identical equipment", "Rights depend on a learner's popularity", "Different needs should be ignored"], answer: 0 },
      { question: "What can help assess whether a decision was discriminatory?", options: ["Compare treatment, circumstances and the reason for the difference", "Rely on a rumour", "Ignore the rule applied", "Assume every unequal result is justified"], answer: 0 },
    ],
  },
  "Peace and conflict": {
    content: `# Peace and conflict

Conflict is a disagreement over needs, interests or beliefs; it is not automatically violence. Peaceful societies provide ways to resolve disputes through dialogue, negotiation, mediation and lawful institutions. These processes work best when parties can speak safely and when decisions are based on evidence rather than threats.

Peacebuilding also addresses conditions that create repeated conflict, such as exclusion, misinformation or unequal access to resources. In a school dispute, a neutral teacher may help pupils explain what happened and agree on a safe remedy. Violence or threats require protection and adult intervention; a learner should not be expected to mediate a dangerous situation. Peace is sustained through fair relationships and institutions, not simply the absence of open disagreement.`,
    objective: "Distinguish conflict from violence and compare peaceful methods of resolving disputes.",
    quiz: [
      { question: "Which is a peaceful conflict-resolution method?", options: ["Mediation by a neutral person", "Retaliation", "Threatening a witness", "Spreading an unverified accusation"], answer: 0 },
      { question: "What should happen when a dispute involves a threat?", options: ["Prioritise safety and involve a responsible adult", "Ask children to mediate alone", "Keep it secret", "Encourage retaliation"], answer: 0 },
    ],
  },
  Tolerance: {
    content: `# Tolerance

Tolerance is the willingness to live peacefully with people whose beliefs, identities or opinions differ from one's own. It does not require agreement, and it does not mean accepting violence, harassment or denial of another person's rights. Respectful disagreement focuses on ideas and evidence rather than insults or stereotypes.

In a diverse classroom, tolerance includes listening, asking sincere questions and allowing others to participate. When a statement harms a classmate, silence can reinforce exclusion; a learner can respond calmly or seek help from a teacher. Institutions also have duties to protect people from discrimination. Tolerance is therefore an active civic practice supported by fair rules, not a demand that people endure abuse.`,
    objective: "Define tolerance and distinguish respectful disagreement from accepting harm or discrimination.",
    quiz: [
      { question: "Does tolerance require agreement with every belief?", options: ["No; it means respecting people's rights while disagreement remains possible", "Yes; disagreement must disappear", "Yes; harmful conduct must be accepted", "No; people should exclude everyone who differs"], answer: 0 },
      { question: "Which action shows tolerance in a discussion?", options: ["Challenge an idea with reasons without attacking a person's identity", "Use a stereotype to end debate", "Prevent another learner from speaking", "Treat harassment as harmless"], answer: 0 },
    ],
  },
  "Corruption and its effects": {
    content: `# Corruption and its effects

Corruption is the misuse of entrusted power for private benefit. It can include bribery, embezzlement, fraud, favouritism and demanding an unofficial payment for a public service. Corruption weakens trust, diverts resources from intended purposes and can make access depend on personal connections rather than fair rules.

Preventing corruption requires clear procedures, transparent records, independent oversight and safe ways to report concerns. An accusation should be supported by evidence and handled through lawful processes; public rumours can harm innocent people. Learners can identify everyday safeguards, such as receipts for payments and published criteria for selecting beneficiaries. No single action solves corruption, but institutions and citizens can reduce opportunities for misuse and insist on accountability.`,
    objective: "Define corruption and explain how transparency and oversight can reduce opportunities for misuse of power.",
    quiz: [
      { question: "Which situation is an example of corruption?", options: ["An official demands an unofficial payment to provide a service", "A public office publishes its service fees", "A citizen submits a lawful complaint", "A worker follows a transparent selection rule"], answer: 0 },
      { question: "How should a suspected corruption case be handled?", options: ["Preserve relevant evidence and report through a lawful channel", "Spread an accusation without checking", "Destroy records", "Threaten the suspected person"], answer: 0 },
    ],
  },
  "Public service": {
    content: `# Public service

Public service is work carried out by government institutions and employees to meet public needs under law. It includes areas such as education, health, sanitation, registration and infrastructure. Public servants are expected to act professionally, use resources for authorised purposes and treat service users fairly. Their authority comes with duties, including confidentiality where required and accountability for decisions.

Good public service depends on clear standards, trained staff, adequate resources and ways for users to report problems. A delay may result from poor management, insufficient capacity or a missing document; a learner should seek accurate information before assigning blame. Citizens can use official complaint channels and keep records of requests. Public servants serve the public, not a private interest or political party.`,
    objective: "Describe public service responsibilities and identify ways users can seek information or report a service problem.",
    quiz: [
      { question: "Whom should a public servant's decision serve?", options: ["The public interest within the law", "A private favour", "Only the official's friends", "A party's private finances"], answer: 0 },
      { question: "What is a sensible response to a delayed public service?", options: ["Check the official process and use a complaint channel if needed", "Offer an unofficial payment", "Destroy the application record", "Assume the cause without asking"], answer: 0 },
    ],
  },
  "Community service": {
    content: `# Community service

Community service is voluntary or organised work that benefits other people or a shared place. Examples include a supervised clean-up, tutoring programme or visit to support older residents. A service project should respond to a need identified with the people affected, not impose help they did not request. Participants should agree on roles, safety arrangements and how resources will be used.

Community service can develop cooperation and civic responsibility, but it does not replace public duties such as providing essential services. Learners should protect privacy, obtain permission before taking photographs and avoid making promises they cannot keep. After an activity, review what changed and ask participants for feedback. The value of service is measured by respectful and useful contribution, not by publicity or the number of images shared online.`,
    objective: "Plan a respectful community-service activity that responds to an identified need and includes a review.",
    quiz: [
      { question: "What should guide the choice of a community-service activity?", options: ["A need identified with the people affected", "The chance to post photographs", "An assumption that outsiders know best", "A desire to replace public services"], answer: 0 },
      { question: "What should learners consider before sharing project photographs?", options: ["Permission and the privacy of people shown", "Whether the image is dramatic", "How to avoid consent", "Whether participants can be identified without asking"], answer: 0 },
    ],
  },
  "Environmental responsibility": {
    content: `# Environmental responsibility

Environmental responsibility is the duty to use shared natural resources carefully and reduce avoidable harm. People depend on clean water, air, soil and healthy ecosystems. Everyday choices such as waste disposal matter, while businesses and public authorities also shape pollution, land use and access to services. Responsibility must be matched to the power and resources each actor has.

An effective local response begins with evidence: identify the source of a problem, who is affected and which authority or organisation has responsibility. A school clean-up may improve one area but cannot replace reliable waste collection. Learners can reduce waste, report hazards and support fair community rules. They should avoid claims that blame a whole neighbourhood without investigating the conditions and services involved.`,
    objective: "Relate environmental responsibility to evidence, shared resources and the roles of individuals and institutions.",
    quiz: [
      { question: "Why should a community identify the source of a waste problem?", options: ["The response depends on the cause and the responsible actors", "Every waste problem has one identical cause", "Evidence is unnecessary", "Blaming residents is enough"], answer: 0 },
      { question: "Does individual recycling replace public waste collection?", options: ["No; household actions and public services have different roles", "Yes; public services are never needed", "Yes; only schools create waste", "No; individual choices never matter"], answer: 0 },
    ],
  },
  "Digital citizenship": {
    content: `# Digital citizenship

Digital citizenship is responsible participation in online spaces. It includes protecting personal information, checking claims before sharing, respecting other users and understanding that online actions can have lasting effects. A strong password and privacy settings help, but no setting removes every risk. Learners should avoid posting addresses, passwords, private images or another person's information without consent.

Digital communication can support learning and civic discussion, but it can also spread misinformation and harassment quickly. Check who created a message, when it was published and what evidence supports it. If cyberbullying or a safety threat occurs, save relevant evidence and tell a trusted adult or platform moderator; do not retaliate by publishing private information. Digital rights and responsibilities apply alongside ordinary laws and school policies.`,
    objective: "Apply privacy, verification and respectful-conduct practices to common online situations.",
    quiz: [
      { question: "What should a learner check before sharing a public claim online?", options: ["The source, date and supporting evidence", "How many friends already shared it", "Whether the headline is alarming", "Whether it confirms a personal preference"], answer: 0 },
      { question: "What is a safe response to cyberbullying?", options: ["Save relevant evidence and seek trusted adult or platform support", "Publish the other person's private details", "Send threats in return", "Delete all evidence and tell nobody"], answer: 0 },
    ],
  },
  Patriotism: {
    content: `# Patriotism

Patriotism is attachment to one's country and a willingness to contribute to its wellbeing. It can be expressed through learning about the country, respecting fellow citizens, serving the community and protecting public resources. Patriotism is not the same as supporting every policy or official; citizens can criticise decisions because they care about how public power is used.

Responsible patriotism respects the country's diversity and constitutional principles. It does not justify hostility toward other nations or discrimination against people who disagree. Learners can assess patriotic claims by asking whether an action serves the public good and respects rights. Care for a country includes acknowledging problems honestly and working through lawful, constructive ways to improve conditions.`,
    objective: "Explain patriotism as civic commitment and distinguish it from unquestioning support or hostility toward others.",
    quiz: [
      { question: "Can a patriotic citizen criticise a government policy?", options: ["Yes; lawful criticism can seek improvement in the public interest", "No; patriotism removes all disagreement", "Only if the criticism is anonymous", "No; citizens cannot question officials"], answer: 0 },
      { question: "Which action can express responsible patriotism?", options: ["Protect public property and respect fellow citizens", "Discriminate against people with different views", "Spread false claims about another country", "Treat every public problem as unchangeable"], answer: 0 },
    ],
  },
  "Civic action project": {
    content: `# Civic action project

A civic action project applies civic knowledge to a shared concern. Begin by defining a problem, checking evidence and consulting the people affected. Identify the institution or group with responsibility, then choose an action within the learners' authority: prepare a petition, hold an information meeting or request a service review. A project should not expose private information or promise a result outside the group's control.

Planning includes a goal, roles, timeline, communication method and safety check. Keep a record of what was done and any response received. At the end, compare the result with the original goal and explain what remains unresolved. A project can be valuable even when a public authority does not immediately agree, because learners practise evidence-based participation and learn how institutions respond.`,
    objective: "Plan, carry out and evaluate a safe civic action based on a verified community concern.",
    quiz: [
      { question: "What should happen before a civic action project proposes a solution?", options: ["Define the concern and check evidence with affected people", "Publish names of people blamed", "Assume the first suggestion is correct", "Ignore which institution has responsibility"], answer: 0 },
      { question: "How should learners evaluate a civic project?", options: ["Compare outcomes with the goal and note unresolved issues", "Count only social-media views", "Claim success without evidence", "Blame participants for every delay"], answer: 0 },
    ],
  },
};

const governmentTopics = {
  "Meaning and scope of government": {
    content: `# Meaning and scope of government

Government is the system of institutions and office-holders through which a state makes and applies public decisions. The word can also refer to the people currently holding executive office. Government's scope includes making laws, maintaining public order, providing services, managing public resources and conducting relations with other states. These functions are limited by the constitution and other laws.

Government is not identical to the state. The state is the enduring political community with territory, population, sovereignty and institutions; governments change through elections or other constitutional processes. To analyse a government action, identify the institution involved, its legal authority and the people affected. This distinction helps learners avoid treating a temporary administration as if it were the whole country.`,
    objective: "Distinguish government as an institution and administration, and describe its lawful functions.",
    quiz: [
      { question: "Which is a function of government?", options: ["Make and administer public policy under law", "Replace the state whenever office-holders change", "Act without constitutional limits", "Control every private decision"], answer: 0 },
      { question: "What is the key difference between a state and its government?", options: ["Governments may change while the state continues", "A state has no population", "Government means only territory", "The terms are always identical"], answer: 0 },
    ],
  },
  "State and nation": {
    content: `# State and nation

A state is a political organisation with a defined territory, permanent population, government and sovereignty. Sovereignty means supreme legal authority within its territory and independence in external relations, subject to international obligations. A nation is a group of people connected by a shared identity, history, language or sense of belonging. The two concepts are related but not identical.

A nation may span more than one state, and one state may include several nations or national communities. Nigeria is a sovereign state with many ethnic, linguistic and cultural groups. These terms should be used carefully: a shared identity does not automatically create a separate state, and citizenship is a legal relationship rather than proof of one cultural background.`,
    objective: "Compare state and nation and identify the four commonly cited elements of a state.",
    quiz: [
      { question: "Which set names the commonly cited elements of a state?", options: ["Territory, population, government and sovereignty", "Language, flag, anthem and currency", "Election, party, court and market", "Family, school, town and road"], answer: 0 },
      { question: "Can one state include several national communities?", options: ["Yes; state and nation describe different political and social ideas", "No; every state has one culture", "Only if no one migrates", "No; nations have no shared identity"], answer: 0 },
    ],
  },
  "Power and authority": {
    content: `# Power and authority

Power is the ability to influence decisions or behaviour. Authority is power recognised as legitimate under accepted rules or law. A public official may have authority to issue a permit because legislation assigns that function; the official does not have authority to demand a private payment. The distinction matters because influence alone does not make an action lawful.

Authority can come from a constitution, statute, delegated office or accepted institutional procedure. It should be exercised within those limits and remain accountable. A decision made outside an official's remit may be challenged through review or appeal. When analysing a case, ask who made the decision, what source authorises it and what procedure can examine it.`,
    objective: "Distinguish power from legitimate authority and identify the legal source and limits of an official decision.",
    quiz: [
      { question: "What makes an official's power an authority?", options: ["A recognised legal or institutional basis for exercising it", "The official's personal confidence", "A demand from an unrelated person", "The absence of public review"], answer: 0 },
      { question: "An officer asks for a payment not required by law. What should a citizen recognise?", options: ["The demand may exceed the officer's lawful authority", "Every request from an official is lawful", "A private payment creates authority", "No procedure can review the demand"], answer: 0 },
    ],
  },
  "Political socialization": {
    content: `# Political socialization

Political socialization is the process through which people learn political beliefs, values and ways of participating. Families, schools, peer groups, religious organisations, political parties and mass media can all influence what people know and expect from government. Their influence differs; a news report, a classroom discussion and a family conversation do not provide the same type of information.

People are not passive recipients. They can compare messages, examine evidence and revise their views through experience. A learner assessing political information should identify its source, purpose and supporting facts. Political socialization helps explain how political culture is transmitted and how it can change when new generations encounter different institutions, events and media.`,
    objective: "Identify agents of political socialization and evaluate how they influence political learning.",
    quiz: [
      { question: "Which is an agent of political socialization?", options: ["Mass media that communicate political information", "A weather pattern", "A private arithmetic operation", "A landform alone"], answer: 0 },
      { question: "How should a learner assess a political message?", options: ["Check its source, purpose and evidence", "Accept it because it is repeated", "Treat every opinion as a fact", "Ignore who created it"], answer: 0 },
    ],
  },
  Constitution: {
    content: `# Constitution

A constitution establishes the structure of government, allocates powers and sets limits on public authority. Nigeria's Constitution provides for a federal republic, defines the roles of the executive, legislature and judiciary, and protects fundamental rights. It also sets rules for elections, public office and the amendment process.

Constitutions may be classified by how they are written, how they can be amended and how power is distributed. In practice, learners should consult the text and distinguish a constitutional provision from a political claim about it. Courts interpret constitutional disputes within their jurisdiction, while amendment requires the special procedure stated in the document. These rules allow institutions to change while preserving legal continuity.`,
    objective: "Explain how a constitution structures government and distinguish constitutional text from political interpretation.",
    quiz: [
      { question: "What does a constitution do in a state?", options: ["Allocates government powers and places legal limits on them", "Gives every official unlimited authority", "Replaces all public institutions", "Prevents every legal change"], answer: 0 },
      { question: "How is a constitutional amendment made?", options: ["Through the special procedure set out in the constitution", "By an unofficial announcement", "By changing a textbook", "By a single private request"], answer: 0 },
    ],
  },
  "Types of constitution": {
    content: `# Types of constitution

Constitutions can be compared using several classifications. A written constitution is gathered in an authoritative document or set of documents; an unwritten constitution draws on statutes, conventions, court decisions and other sources. A rigid constitution requires a special amendment procedure, while a flexible one can be changed through a process closer to ordinary legislation. Federal constitutions divide powers between levels of government; unitary systems concentrate constitutional authority more centrally.

These labels describe features, not a simple ranking. A constitution may be written and rigid while also organising a federal system. Classification helps compare how rules are recorded, changed and applied. To classify a country accurately, use its legal texts and institutions rather than assuming that one label answers every question.`,
    objective: "Classify constitutions by form, amendment process and distribution of authority.",
    quiz: [
      { question: "What distinguishes a rigid constitution?", options: ["It requires a special amendment procedure", "It has no legal text", "It can never be amended", "It is identical to an ordinary policy"], answer: 0 },
      { question: "Can a constitution be both written and federal?", options: ["Yes; these labels describe different features", "No; written constitutions cannot distribute power", "Only if it is unwritten", "No; federalism refers to elections only"], answer: 0 },
    ],
  },
  "Rule of law": {
    content: `# Rule of law

The rule of law requires public power to operate under publicly known rules and fair procedures. No person, including a public official, is above the law. Similar cases should be treated consistently, and people should have access to an independent process for resolving legal disputes. Arrest, detention and trial must follow legal safeguards rather than personal orders.

The principle is weakened by arbitrary enforcement, corruption, denial of due process or inability to obtain a remedy. It does not mean that every law is automatically just; laws can be challenged and reformed through constitutional processes. When evaluating a government action, identify the legal basis, the procedure followed and the review available to those affected.`,
    objective: "Assess government action against legality, due process, consistent enforcement and access to review.",
    quiz: [
      { question: "Which practice supports the rule of law?", options: ["An official decision can be reviewed under fair legal procedures", "A leader can ignore laws", "Rules are enforced only against opponents", "A person is punished without a hearing"], answer: 0 },
      { question: "Does the rule of law prevent citizens from challenging a law?", options: ["No; lawful constitutional processes can be used to seek change", "Yes; every law is beyond review", "Yes; courts cannot interpret law", "No; citizens may use violence instead"], answer: 0 },
    ],
  },
  "Separation of powers": {
    content: `# Separation of powers

Separation of powers assigns lawmaking, execution and adjudication primarily to different branches of government. In Nigeria, the legislature makes laws, the executive implements them and the judiciary interprets the law and resolves disputes. The branches interact, but each has defined responsibilities and limits.

The purpose is to reduce excessive concentration of authority and create checks. Legislative oversight can examine executive conduct; courts can review whether government action is lawful; the executive may have constitutionally defined roles in legislation. These checks do not eliminate conflict or guarantee good decisions. To analyse a dispute, identify which branch acted, what power it used and whether another institution has a lawful review role.`,
    objective: "Describe the functions of the three branches and explain how checks can limit concentrated power.",
    quiz: [
      { question: "Which branch primarily interprets law and resolves legal disputes?", options: ["The judiciary", "The legislature", "The executive", "A political party"], answer: 0 },
      { question: "Why are checks and balances used?", options: ["To limit concentration and review the use of public power", "To remove every branch's legal duties", "To let one branch control all decisions", "To prevent laws from being reviewed"], answer: 0 },
    ],
  },
  Legislature: {
    content: `# Legislature

The legislature is the lawmaking branch of government. At the federal level in Nigeria, the National Assembly consists of the Senate and House of Representatives. Legislatures debate bills, approve laws, represent constituencies, scrutinise public policy and exercise oversight within constitutional limits.

The lawmaking process includes introducing a bill, considering it through stages, debating and voting, and completing any required assent procedure. A bill is not law merely because a member proposes it. Oversight can require officials to explain decisions, though it does not replace courts or independent audit institutions. Constituency representation connects public concerns to national debate, but a legislator's duty extends beyond personal favours to lawful public service.`,
    objective: "Explain legislative functions and outline the stages through which a bill may become law.",
    quiz: [
      { question: "Which is a function of the legislature?", options: ["Debate bills and scrutinise public policy", "Decide every court case", "Conduct all daily ministry operations", "Appoint every voter"], answer: 0 },
      { question: "When does a proposal become a law?", options: ["After completing the required constitutional lawmaking process", "As soon as a member mentions it", "When it appears in a campaign speech", "When a private group supports it"], answer: 0 },
    ],
  },
  Executive: {
    content: `# Executive

The executive branch implements laws and directs public administration. At the federal level in Nigeria, it includes the President, Vice-President, ministers and government departments, with functions defined by the Constitution and statutes. State and local executives perform responsibilities assigned to their level of government.

Executive power is not unlimited. Officials must act within legal authority, use public funds for authorised purposes and remain subject to legislative, judicial and administrative review. Policy announcements should be distinguished from laws and from services already delivered. To assess an executive decision, identify the legal authority, the institution responsible for implementation, the resources involved and the mechanism for public accountability.`,
    objective: "Describe executive responsibilities and analyse the legal and oversight limits on executive action.",
    quiz: [
      { question: "What is a primary role of the executive?", options: ["Implement laws and administer public programmes", "Interpret every constitutional dispute", "Replace the legislature", "Conduct private business for officials"], answer: 0 },
      { question: "What limits executive action?", options: ["The Constitution, statutes and oversight processes", "An official's personal preference alone", "The absence of a written order", "A campaign slogan"], answer: 0 },
    ],
  },
  Judiciary: {
    content: `# Judiciary

The judiciary consists of courts that interpret and apply law, determine disputes and protect legal rights within their jurisdiction. Nigeria's court system includes superior courts established by the Constitution and other courts created by law. Cases reach different courts according to subject matter, location and appeal rules.

Judicial independence allows judges to decide cases according to law and evidence without improper pressure. It does not place courts above the Constitution; courts must act within jurisdiction and follow fair procedure. An appeal asks a higher court to review a decision on recognised grounds. Learners should distinguish a court judgment from a political opinion about a case and should not assume that every dispute can be decided by the same court.`,
    objective: "Explain judicial functions, jurisdiction and the importance of independent and fair adjudication.",
    quiz: [
      { question: "What is a central function of the judiciary?", options: ["Resolve legal disputes by applying law", "Implement every government programme", "Write all legislation", "Campaign for a political party"], answer: 0 },
      { question: "Why does jurisdiction matter?", options: ["A court may hear only cases assigned to it by law", "Every court hears every case", "Jurisdiction is a campaign promise", "It removes the need for appeals"], answer: 0 },
    ],
  },
  "Pressure groups": {
    content: `# Pressure groups

A pressure group is an organised association that seeks to influence public policy without directly seeking to form a government. Groups may represent workers, businesses, professional interests, communities or causes such as environmental protection. They use methods including research, public campaigns, petitions, lobbying and litigation, subject to the law.

Pressure groups can bring specialised knowledge and neglected concerns into public debate. Their influence varies with resources, access and public support, so their claims should be assessed critically. Ask whom a group represents, how it is funded and what evidence supports its proposal. A pressure group differs from a political party, which seeks electoral power and responsibility for governing.`,
    objective: "Distinguish pressure groups from political parties and assess their methods of influence.",
    quiz: [
      { question: "How does a pressure group differ from a political party?", options: ["It seeks to influence policy rather than directly form a government", "It cannot have members", "It is part of the judiciary", "It must be funded by government"], answer: 0 },
      { question: "What should an analyst ask about a pressure group's claim?", options: ["Whom it represents and what evidence supports its proposal", "How to avoid checking its funding", "Whether it can replace the courts", "Whether every claim should be accepted"], answer: 0 },
    ],
  },
  "Political parties": {
    content: `# Political parties

A political party is an organised group that seeks political power through elections and proposes policies for governing. Parties recruit candidates, organise campaigns, develop platforms and connect voters with public institutions. In a multiparty system, different parties compete for support, while elected members remain subject to constitutional rules and public scrutiny.

Parties can structure political choices, but party loyalty does not replace a representative's public responsibilities. Voters may compare policy proposals, records, feasibility and respect for democratic rules. Internal party procedures also matter: transparent candidate selection and financial accountability can strengthen public trust. A party is not the same as a pressure group, which usually seeks influence without taking responsibility for forming a government.`,
    objective: "Explain the functions of political parties and distinguish party competition from pressure-group activity.",
    quiz: [
      { question: "What is a defining aim of a political party?", options: ["Compete for elected office and seek to govern", "Resolve legal disputes as a court", "Administer every public service directly", "Replace voter participation"], answer: 0 },
      { question: "What can help voters compare parties?", options: ["Examine policies, records and whether proposals are feasible", "Rely only on slogans", "Ignore candidates' conduct", "Assume party membership proves a claim"], answer: 0 },
    ],
  },
  Elections: {
    content: `# Elections

Elections allow eligible voters to choose representatives and, in some cases, decide public questions. In Nigeria, the Independent National Electoral Commission administers federal and state elections, while rules also assign responsibilities for other electoral processes. Credibility depends on clear eligibility, accurate registers, secure voting, transparent counting and lawful resolution of disputes.

Political parties nominate candidates and campaign; voters assess proposals and records. Electoral systems shape how votes translate into seats. Intimidation, vote buying, ballot interference and misinformation undermine free choice. An allegation should be supported by evidence and raised through the prescribed process. Elections establish who holds office, but democratic accountability continues through oversight, public debate and the next opportunity to vote.`,
    objective: "Describe requirements for credible elections and explain how electoral complaints should be addressed.",
    quiz: [
      { question: "Which institution administers federal and state elections in Nigeria?", options: ["The Independent National Electoral Commission", "The National Assembly alone", "A private campaign organisation", "A political party's local office"], answer: 0 },
      { question: "How should a voter address evidence of an electoral irregularity?", options: ["Use the legal complaint process and preserve relevant evidence", "Destroy ballots", "Threaten election staff", "Treat an online rumour as a final judgment"], answer: 0 },
    ],
  },
  "Electoral systems": {
    content: `# Electoral systems

An electoral system is the set of rules that converts votes into elected offices or seats. Under a plurality system, the candidate with the most votes in a constituency may win even without an absolute majority. Proportional systems allocate seats more closely in relation to parties' vote shares; mixed systems combine features of different methods.

Each system creates incentives and trade-offs. Constituency systems can strengthen a local link between representatives and voters, while proportional methods may represent a wider range of political opinion. The exact effect depends on district boundaries, thresholds and other rules. Compare systems by asking how votes translate into seats, how voters choose candidates and whether the system supports fair competition and accountable representation.`,
    objective: "Explain how electoral rules translate votes into seats and compare common system trade-offs.",
    quiz: [
      { question: "What does an electoral system determine?", options: ["How votes are translated into offices or legislative seats", "How courts interpret every law", "Who may own a newspaper", "How public budgets are audited"], answer: 0 },
      { question: "What is one possible trade-off of a constituency-based plurality system?", options: ["A local representative link may be strong while some votes do not win seats", "Every party always receives seats in exact proportion", "Voters cannot choose candidates", "Districts have no effect"], answer: 0 },
    ],
  },
  "Public opinion": {
    content: `# Public opinion

Public opinion is the distribution of views held by people on a public issue at a particular time. It is not necessarily unanimous or stable. Views can be influenced by experience, information, political leadership, social groups and media coverage. A poll estimates opinion among a sample; its result depends on how respondents were selected, the questions asked and when the survey was conducted.

Governments may consider public opinion when making policy, but popularity alone does not determine legality or protect minority rights. Analysts should examine a poll's sample size, method, wording and margin of error rather than repeating a headline. Public meetings, elections, petitions and media discussion provide other signals, each with limitations. Responsible government listens while also evaluating evidence, costs and constitutional obligations.`,
    objective: "Explain public opinion and evaluate the limits of polls and other indicators of public views.",
    quiz: [
      { question: "Why can a poll fail to represent public opinion accurately?", options: ["Its sample or question wording may be biased", "Every poll surveys every person", "Views never change", "Poll results are always legal decisions"], answer: 0 },
      { question: "Should popularity alone determine whether a policy is lawful?", options: ["No; legality and rights are governed by law as well as public views", "Yes; a popular policy cannot violate rights", "Yes; courts have no role", "No; public opinion is never relevant"], answer: 0 },
    ],
  },
  "Local government": {
    content: `# Local government

Local government is the tier of government closest to many community services and local concerns. Nigeria's Constitution recognises local government councils and provides for their democratically elected structure, while state laws shape aspects of their administration. Local responsibilities commonly include local roads, markets, sanitation and community-level services, subject to constitutional and statutory arrangements.

Local government is not simply a community association: it is a public authority with legal duties, budgets and accountability requirements. Residents can follow council decisions, ask how funds are used and raise service concerns through appropriate channels. When evaluating performance, distinguish a council's assigned responsibility from duties held by state or federal institutions. Clear assignment of responsibility helps residents direct questions to the institution able to act.`,
    objective: "Describe the role of local government and identify how residents can monitor local services.",
    quiz: [
      { question: "What makes a local government council different from a voluntary association?", options: ["It is a public institution with legal duties and public resources", "It has no rules", "It can ignore residents", "It is a private business"], answer: 0 },
      { question: "How should a resident raise a local-service concern?", options: ["Identify the responsible authority and use its complaint or representation channel", "Assume every tier has the same duty", "Damage public property", "Send private information to an unrelated office"], answer: 0 },
    ],
  },
  Federalism: {
    content: `# Federalism

Federalism is a constitutional arrangement that divides public authority between a central government and constituent units, such as states. Nigeria's Constitution assigns powers through the Exclusive, Concurrent and Residual legislative lists. The federal government has authority over matters on the Exclusive List; some matters are shared under the Concurrent List; residual matters generally fall to states.

Division of power can bring decisions closer to local needs while preserving national coordination. It can also create disputes about responsibility, funding or jurisdiction. A sound analysis identifies the specific constitutional list or provision and the level of government responsible. Federalism does not mean that every service is shared equally, nor that state governments are independent sovereign states.`,
    objective: "Explain Nigeria's federal structure and use constitutional lists to identify assigned responsibilities.",
    quiz: [
      { question: "What does federalism divide?", options: ["Constitutional powers between central and constituent governments", "The judiciary from every legal rule", "Voters into permanent groups", "One state into private companies"], answer: 0 },
      { question: "How should a learner determine which tier has authority over a subject?", options: ["Check the constitutional allocation and relevant law", "Assume every matter is exclusive to the centre", "Rely on the nearest office's opinion", "Ignore the legislative lists"], answer: 0 },
    ],
  },
  "Nigeria’s political development": {
    content: `# Nigeria's political development

Nigeria's political development includes changes in institutions, constitutional arrangements and public participation. British colonial administration brought together territories that became Nigeria in 1914; independence followed in 1960. The country became a republic in 1963. Since then, Nigeria has experienced constitutional change, periods of civilian government and military rule, and a return to the Fourth Republic in 1999.

Historical events should be studied with dates, sources and context. Political development was shaped by regional interests, constitutional negotiations, military intervention, civil conflict and democratic movements. Avoid reducing this history to a single cause or group. Learners can compare constitutional periods by examining how authority was organised, how leaders were selected and what rights or institutions existed. Primary documents and reliable historical accounts help distinguish evidence from later interpretation.`,
    objective: "Trace major phases of Nigeria's political development and compare institutions across constitutional periods.",
    quiz: [
      { question: "In which year did Nigeria gain independence?", options: ["1960", "1914", "1963", "1999"], answer: 0 },
      { question: "Why should political history use multiple reliable sources?", options: ["Events can have different causes and interpretations that need evidence", "One opinion is enough for every period", "Dates are unimportant", "Sources cannot disagree"], answer: 0 },
    ],
  },
  "Military rule": {
    content: `# Military rule

Military rule occurs when armed forces control government, usually after suspending or displacing constitutional civilian institutions. Nigeria experienced several periods of military government, including from 1966 to 1979 and from 1983 to 1999, with interruptions and changes of leadership. Military administrations often governed through decrees and centralised authority rather than competitive national elections.

Historical study should distinguish a military government from the armed forces as a national institution. Military rule can affect civil liberties, legislative representation and the independence of courts; its specific effects varied across periods. Learners should examine how power was taken, how decisions were made and how civilian constitutional government was restored. Accurate dates and primary sources are important, especially when comparing different regimes.`,
    objective: "Describe the institutional features of military rule and compare them with constitutional civilian government.",
    quiz: [
      { question: "Which feature is commonly associated with military rule?", options: ["Government controlled by military authorities outside normal electoral succession", "Regular transfer through competitive elections only", "No central executive", "Automatic independence of every legislature"], answer: 0 },
      { question: "Why should different military periods be studied separately?", options: ["Their leaders, policies and effects were not identical", "Every regime used exactly the same institutions", "Dates do not matter", "Historical evidence is unnecessary"], answer: 0 },
    ],
  },
  "Democracy in Nigeria": {
    content: `# Democracy in Nigeria

Nigeria's Fourth Republic began in 1999 and is based on constitutional civilian government, periodic elections and institutions at federal, state and local levels. Democratic practice includes more than casting a ballot: it also depends on political competition, civil liberties, independent courts, legislative oversight and citizens' ability to question public decisions.

Assessing democracy requires evidence. Consider whether elections are competitive, public institutions follow constitutional rules, rights are protected and officials can be held accountable. Challenges such as vote buying, insecurity, misinformation or unequal access can weaken participation, but their presence does not make every institution meaningless. Learners should distinguish constitutional design from how institutions operate in practice and use current, reliable sources when discussing political events.`,
    objective: "Evaluate democratic practice in Nigeria by distinguishing constitutional arrangements from observed performance.",
    quiz: [
      { question: "When did Nigeria's Fourth Republic begin?", options: ["1999", "1960", "1979", "1983"], answer: 0 },
      { question: "Which evidence helps assess democratic practice?", options: ["Election conditions, rights protection and institutional accountability", "A single campaign slogan", "Popularity alone", "The existence of a constitution without examining practice"], answer: 0 },
    ],
  },
  "Public administration": {
    content: `# Public administration

Public administration is the organisation and implementation of government policy and services. It includes planning, staffing, budgeting, record keeping and delivery through ministries, departments and agencies. Elected officials set policy within their authority; public administrators apply laws and procedures to carry it out.

Effective administration requires clear responsibilities, trained personnel, reliable records and transparent use of funds. A policy can fail during implementation if roles are unclear or resources are unavailable. Citizens evaluate administration through service access, timeliness, fairness and complaint handling. Public administration is not separate from accountability: decisions should be documented and reviewable, while personal data must be protected according to law.`,
    objective: "Explain how public administration turns policy into services and identify conditions for effective implementation.",
    quiz: [
      { question: "What is a central task of public administration?", options: ["Implement policy and organise public services", "Replace constitutional lawmaking", "Campaign for candidates while on duty", "Decide private disputes without authority"], answer: 0 },
      { question: "What can help diagnose a service-delivery failure?", options: ["Review roles, resources and implementation records", "Assume staff are always at fault", "Ignore the service standard", "Remove all records"], answer: 0 },
    ],
  },
  "Civil service": {
    content: `# Civil service

The civil service is the permanent professional workforce that supports government administration. Civil servants advise on policy, maintain records and help implement decisions made by the lawful government of the day. Political office-holders change, while the career service is intended to provide continuity and technical knowledge.

The service is expected to be politically impartial in carrying out official duties, act within the law and protect confidential information. Civil servants remain accountable for professional conduct and proper use of public resources. Merit-based recruitment, training and clear procedures can support competence. A civil servant's duty is to serve the public through lawful government, not to use office for private gain or party campaigning.`,
    objective: "Distinguish the career civil service from political office and explain principles of professional conduct.",
    quiz: [
      { question: "What is a purpose of a permanent civil service?", options: ["Provide administrative continuity and professional expertise", "Replace elected government permanently", "Campaign for one party during official work", "Make every judicial decision"], answer: 0 },
      { question: "What does political impartiality require in official duties?", options: ["Apply lawful procedures without using office to favour a party", "Hide public records", "Refuse to serve a new administration", "Use government resources for campaigning"], answer: 0 },
    ],
  },
  "Foreign policy": {
    content: `# Foreign policy

Foreign policy is the set of principles and decisions guiding a state's relations with other states and international organisations. It may address security, trade, diplomacy, regional cooperation, development and the protection of citizens abroad. Nigeria's foreign policy is shaped by constitutional institutions, national interests, regional responsibilities and changing international conditions.

Diplomacy, treaties, trade agreements, peacekeeping and participation in international bodies are tools of foreign policy. A policy should be assessed by its stated goals, legal commitments, costs and outcomes rather than by a slogan. Domestic priorities and foreign relations interact: trade can affect employment, while regional stability can influence security. Learners should distinguish a government announcement from a binding treaty or an implemented agreement.`,
    objective: "Define foreign policy and analyse the goals, tools and trade-offs of an international decision.",
    quiz: [
      { question: "Which is a tool of foreign policy?", options: ["Diplomatic negotiation", "A school timetable", "A private family rule", "A local sports fixture"], answer: 0 },
      { question: "How should a foreign-policy decision be assessed?", options: ["Examine goals, legal commitments, costs and outcomes", "Rely only on a slogan", "Assume every announcement is a treaty", "Ignore effects on citizens"], answer: 0 },
    ],
  },
  "International organizations": {
    content: `# International organizations

International organizations are bodies created by states or other members to cooperate on shared concerns. The United Nations works on peace, security, development and human rights; the African Union promotes continental cooperation; ECOWAS supports regional integration and cooperation in West Africa. Each organization has a founding agreement, members and defined powers.

Membership does not erase national sovereignty, though states accept obligations under treaties they join. Organizations can provide forums for negotiation, coordinate responses and set common standards, but their effectiveness depends on member cooperation and resources. When examining an organization, identify its mandate, decision-making process and limits. Do not assume that every international body can directly enforce every decision within a member state.`,
    objective: "Compare the mandates and limits of international and regional organizations.",
    quiz: [
      { question: "What should be checked when analysing an international organization?", options: ["Its mandate, members and decision-making powers", "Only its logo", "Whether it can ignore its founding agreement", "The personal opinion of one member"], answer: 0 },
      { question: "Does membership automatically remove a state's sovereignty?", options: ["No; states accept defined obligations through agreements", "Yes; every organization controls all domestic matters", "Yes; members cease to be states", "No; treaties create no obligations"], answer: 0 },
    ],
  },
  "Citizenship and participation": {
    content: `# Citizenship and participation

Citizenship is legal membership of a state; participation is the range of ways citizens influence public affairs. Participation includes voting when eligible, attending consultations, joining associations, contacting representatives and using lawful complaint processes. The available route depends on the issue and the level of government responsible.

Meaningful participation requires information, access and freedom from intimidation. Citizens should support claims with evidence and respect the rights of others. Governments can strengthen participation by publishing clear information and responding to public concerns. Participation is not limited to citizens in every context—residents and organisations may also contribute to consultations—but some legal rights, including voting, depend on citizenship and eligibility rules.`,
    objective: "Distinguish citizenship from participation and choose a suitable channel for a public concern.",
    quiz: [
      { question: "Which is a form of political participation outside voting?", options: ["Contacting a representative about a public issue", "Ignoring an open consultation", "Threatening a public servant", "Damaging a service facility"], answer: 0 },
      { question: "Why does the level of government matter when raising a concern?", options: ["Different institutions have different legal responsibilities", "Every office controls every service", "It removes the need for evidence", "It determines a person's ethnicity"], answer: 0 },
    ],
  },
  "Government research project": {
    content: `# Government research project

A Government research project investigates a political institution, process or public issue using evidence. Begin with a focused question, such as how a local council publishes meeting decisions. Identify what information would answer it and which sources are appropriate: constitutional texts, legislation, official records, reputable reporting and interviews can each contribute different evidence.

Record sources accurately, distinguish fact from interpretation and protect interview participants' privacy. Compare claims across sources and note gaps or uncertainty. A conclusion should answer the question without claiming more than the evidence supports. Recommendations should identify the institution with authority and explain why the proposed action follows from the findings. A project is not stronger because it is longer; clarity, reliability and sound reasoning matter most.`,
    objective: "Plan a Government research project with a focused question, reliable sources and evidence-based conclusions.",
    quiz: [
      { question: "What makes a Government research question manageable?", options: ["It focuses on a defined institution, process or issue", "It asks about every government in history", "It assumes the conclusion", "It requires no evidence"], answer: 0 },
      { question: "What should a researcher do when sources disagree?", options: ["Compare their evidence and note uncertainty", "Hide the source that disagrees", "Treat the newest claim as automatically correct", "Invent a result that satisfies both"], answer: 0 },
    ],
  },
};

const courseGroups = new Map([
  ["Civic Education", new Set(["jss1-civic-education", "jss2-civic-education", "jss3-civic-education"])],
  ["Government", new Set(["ss1-government", "ss2-government", "ss3-government"])],
]);
const topicGroups = new Map([
  ["Civic Education", civicTopics],
  ["Government", governmentTopics],
]);
const curriculum = JSON.parse(await fs.readFile(curriculumPath, "utf8"));
const courseCounts = new Map([...courseGroups.keys()].map((title) => [title, 0]));
const lessonCounts = new Map([...courseGroups.keys()].map((title) => [title, 0]));
const missingTitles = new Map([...courseGroups.keys()].map((title) => [title, new Set()]));

for (const course of curriculum.courses ?? []) {
  const allowedIds = courseGroups.get(course.title);
  if (!allowedIds?.has(course.id)) continue;
  courseCounts.set(course.title, courseCounts.get(course.title) + 1);

  const topics = topicGroups.get(course.title);
  for (const module of course.modules ?? []) {
    for (const lesson of module.lessons ?? []) {
      const editorial = topics[lesson.title];
      if (!editorial) {
        missingTitles.get(course.title).add(lesson.title);
        continue;
      }

      lessonCounts.set(course.title, lessonCounts.get(course.title) + 1);
      lesson.content = editorial.content;
      lesson.objective = editorial.objective;
      lesson.activity = `Apply ${lesson.title} to a realistic school or community decision; state the relevant principle and explain your reasoning.`;
      lesson.commonMistakes = ["Distinguish the legal principle from a personal opinion, and check which institution has authority before drawing a conclusion."];
      lesson.keyTerms = [lesson.title, "citizenship", "public authority", "accountability"];
      lesson.summary = editorial.content.replace(/^#\s+.+\n+/, "").replace(/\s+/g, " ").trim().slice(0, 320);
      lesson.quiz = editorial.quiz.map((question, index) => ({ id: `${lesson.id}-editorial-q${index + 1}`, ...question }));
    }
  }
}

const expected = new Map([
  ["Civic Education", 81],
  ["Government", 81],
]);
for (const [title, count] of expected) {
  if (courseCounts.get(title) !== 3 || lessonCounts.get(title) !== count || missingTitles.get(title).size) {
    throw new Error(JSON.stringify({ title, courses: courseCounts.get(title), lessons: lessonCounts.get(title), expectedLessons: count, missingTitles: [...missingTitles.get(title)] }));
  }
}

if (applyChanges) await fs.writeFile(curriculumPath, `${JSON.stringify(curriculum, null, 2)}\n`, "utf8");

console.log(JSON.stringify({
  mode: applyChanges ? "apply" : "dry-run",
  courses: Object.fromEntries(courseCounts),
  lessons: Object.fromEntries(lessonCounts),
  uniqueTopics: { "Civic Education": Object.keys(civicTopics).length, Government: Object.keys(governmentTopics).length },
}, null, 2));