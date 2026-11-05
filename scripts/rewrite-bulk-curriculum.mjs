import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const curriculumPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "curriculum.json",
);

const lessonsByTopic = {
  "Nouns & Classifications": [
    {
      title: "Common, Proper and Collective Nouns",
      content: `## Naming people, places and things

A **noun** names a person, place, thing, substance, or idea. A common noun names a general member of a class: *teacher*, *river*, or *market*. A proper noun identifies a particular person or place and begins with a capital letter: *Amina*, *Lagos*, or *River Niger*. The capital letter changes the way the word is used, not the kind of thing it names.

A **collective noun** names a group considered as a unit: *a class of pupils*, *a flock of birds*, or *a team of players*. The noun after *of* tells you what makes up the group. In a sentence, the collective noun is usually the subject: *The team practises after school.*

## Read the noun in context

In *Amina bought oranges at the market*, *Amina* is a proper noun, while *oranges* and *market* are common nouns. In *The choir sang*, *choir* is collective. Classify each noun by the job it does in the sentence; do not rely on the first letter alone.`,
      quiz: {
        question: "Which noun names a particular place and therefore takes a capital letter?",
        correct: "Lagos",
        distractors: ["city", "market", "river"],
      },
    },
    {
      title: "Countable, Uncountable and Abstract Nouns",
      content: `## Can you count it?

A **countable noun** has singular and plural forms: *one book, three books*. It can follow *a* or *an* in the singular. An **uncountable noun** names a substance, material, or mass that is not normally counted as separate units: *water, rice, information*. We measure it with another noun: *a glass of water*, *two bags of rice*, *a piece of information*.

An **abstract noun** names an idea, quality, feeling, or state rather than a physical object: *honesty, courage, childhood,* and *joy*. Many abstract nouns are uncountable, but some can be counted when they refer to particular instances: *a kindness* or *several experiences*.

## Choose a suitable quantity word

Use *many* with countable plurals (*many books*) and *much* with uncountable nouns (*much water*). In ordinary statements, *a lot of* works with both (*a lot of books; a lot of water*). Avoid *informations*: say *some information* or *two pieces of information*.`,
      quiz: {
        question: "Which phrase correctly counts an uncountable noun?",
        correct: "two pieces of information",
        distractors: ["two informations", "two information", "an information"],
      },
    },
    {
      title: "Plural Forms, Possession and Noun Use",
      content: `## Forming plurals

Most nouns form the plural with *-s* (*pencil/pencils*). Nouns ending in *s, sh, ch,* or *x* commonly take *-es* (*class/classes; box/boxes*). Some plurals change spelling (*city/cities*) or change completely (*child/children; foot/feet*). Learn irregular forms from their use in sentences rather than adding *-s* to every word.

## Showing ownership

An apostrophe marks possession: *the pupil's book* belongs to one pupil; *the pupils' books* belong to more than one. The apostrophe does not make a noun plural. Compare *the girls' uniforms* with *the girl's uniform* to see why its position matters.

Nouns can also work as modifiers: in *school bus*, *school* helps specify the kind of bus. In *The bus belongs to the school*, *school* is the object of the preposition *to*. Its sentence role depends on how it is used.`,
      quiz: {
        question: "Which phrase means that a book belongs to several pupils?",
        correct: "the pupils' book",
        distractors: ["the pupil's book", "the pupils book", "the pupils's book"],
      },
    },
  ],
  "Subject-Verb Concord": [
    {
      title: "Matching Verbs to Singular and Plural Subjects",
      content: `## Find the true subject

**Concord** is agreement between a subject and its verb. In the present tense, a singular third-person subject usually takes a verb ending in *-s*: *The learner reads*. A plural subject uses the base form: *The learners read*. The noun nearest the verb does not always determine the form; identify the whole subject first.

In *The basket of mangoes is on the table*, the subject is *basket*, not *mangoes*, so the singular verb *is* is correct. In the past tense, ordinary verbs do not change between singular and plural subjects: *She walked; they walked*. The verb *be* does change: *I was; they were*.

## Check the sentence

Underline the subject, then test the verb: *The teacher and the pupils ___ ready.* The compound subject refers to more than one, so write *are*.`,
      quiz: {
        question: "Choose the verb that agrees with the subject: 'The basket of oranges ___ full.'",
        correct: "is",
        distractors: ["are", "were", "have"],
      },
    },
    {
      title: "Compound Subjects and Words Between Subject and Verb",
      content: `## Compound subjects

Two subjects joined by *and* usually take a plural verb: *Bola and Musa walk to school*. When the subjects name one combined idea or a single item, a singular verb may be appropriate: *Bread and tea is my usual breakfast*. Let the intended meaning guide the choice.

Subjects joined by *or* or *nor* are often matched to the nearer subject: *Either the teacher or the pupils are presenting first*; *Either the pupils or the teacher is presenting first*. This is one reason to keep the parts of a sentence clear.

## Ignore an intervening phrase

Phrases beginning with *with, together with,* or *as well as* do not normally change the number of the subject: *The head teacher, together with the staff, is attending*. The subject remains *head teacher*. Find the main subject before choosing the verb.`,
      quiz: {
        question: "Which verb agrees with the compound subject in 'Musa and Amina ___ the debate'?",
        correct: "are leading",
        distractors: ["is leading", "leads", "was leading"],
      },
    },
    {
      title: "Indefinite Subjects and Tricky Concord",
      content: `## Pronouns that take singular verbs

The pronouns *each, everyone, everybody, somebody,* and *neither* are grammatically singular: *Everyone has a notebook*; *Each of the players is ready*. The plural noun after *of* does not change the subject's number.

Some subjects name a total amount or a single title and are treated as singular: *Ten kilometres is a long walk*; *Mathematics is compulsory*. Other nouns that look plural, such as *scissors*, usually take a plural verb: *The scissors are blunt*. With *a pair of scissors*, the subject is *pair*, so use *is*.

## Make the meaning clear

When *none* means “not one,” a singular verb is possible; when it means “not any,” a plural verb may fit a plural noun. In formal school writing, recast an awkward sentence if readers could interpret it in two ways.`,
      quiz: {
        question: "Choose the correct verb: 'Each of the players ___ a number.'",
        correct: "has",
        distractors: ["have", "are having", "were"],
      },
    },
  ],
  "Adjectives & Adverbs": [
    {
      title: "Adjectives: Description, Quantity and Comparison",
      content: `## What an adjective describes

An **adjective** gives information about a noun or pronoun: *a careful driver; the road is narrow*. It may describe quality (*bright*), size (*small*), number (*three*), or possession (*their*). Adjectives commonly come before a noun or after a linking verb such as *be, seem,* or *become*.

For most short adjectives, add *-er* to compare two things and *-est* to compare three or more: *tall, taller, tallest*. Use *more* and *most* with many longer adjectives: *more careful; most interesting*. Do not use both forms together: write *taller*, not *more taller*.

## Keep the comparison logical

The comparative form compares two items: *This path is shorter than that one*. The superlative identifies the extreme in a group: *This is the shortest path of the three*. Use *than* after a comparative when naming the second item.`,
      quiz: {
        question: "Which is the correct comparative form of 'careful'?",
        correct: "more careful",
        distractors: ["carefuler", "most careful", "more carefuler"],
      },
    },
    {
      title: "Adverbs: How, When, Where and How Often",
      content: `## What an adverb modifies

An **adverb** can describe a verb, an adjective, or another adverb. It tells how, when, where, or how often an action occurs: *She spoke quietly; we arrived yesterday; the children waited outside; he often practises*. Many adverbs of manner end in *-ly*, but not all do: *fast, well,* and *hard* are also adverbs.

Adverbs can strengthen adjectives: *a very clear answer*. Here *very* modifies *clear*, not *answer*. An adverb can also modify another adverb: *They moved quite slowly*.

## Avoid confusing forms

An adjective describes a noun (*a careful reader*); an adverb describes how an action is performed (*reads carefully*). The verb *feel* often links the subject to an adjective: *I feel well*. Do not add *-ly* automatically; *hardly* means “almost not,” not “with effort.”`,
      quiz: {
        question: "Which word is the adverb of manner in 'The class listened carefully'?",
        correct: "carefully",
        distractors: ["class", "listened", "the"],
      },
    },
    {
      title: "Adjective and Adverb Placement in Sentences",
      content: `## Place modifiers beside what they describe

An adjective should sit close to the noun it describes: *The careful driver checked the tyre*. An adverb's position depends on its meaning. Manner adverbs often follow the verb or its object (*She answered politely*); frequency adverbs usually come before a main verb (*She often reads*) but after *be* (*She is often early*).

## Make the meaning precise

Compare *Only Kemi borrowed the book* with *Kemi borrowed only the book*. In the first sentence, no one else borrowed it; in the second, she borrowed nothing else. The position of *only* changes the focus.

Avoid a misplaced modifier that seems to describe the wrong thing. In *Walking to school, the rain soaked Tunde*, the opening phrase appears to say that the rain was walking. Write *As Tunde walked to school, the rain soaked him* instead.`,
      quiz: {
        question: "Where does the frequency adverb usually go in 'She ___ visits the library'?",
        correct: "often",
        distractors: ["visit often", "oftenly", "is often visits"],
      },
    },
  ],
  "Transitive Verbs": [
    {
      title: "Recognising Transitive and Intransitive Verbs",
      content: `## Follow the action

A **transitive verb** has an object that receives its action: in *The baker kneaded the dough*, *dough* is the direct object of *kneaded*. Ask “kneaded what?” to locate it. An **intransitive verb** does not take a direct object: in *The baby slept peacefully*, *slept* has no object.

Some verbs can work either way. Compare *The bell rang* (no object) with *The caretaker rang the bell* (the object is *bell*). Classify the verb from its use in the particular sentence, not from a word list alone.

## Do not mistake every following phrase for an object

In *The pupils laughed at the joke*, *joke* follows the preposition *at*; it is the object of the preposition, not a direct object of *laughed*. A direct object normally follows the verb without a linking preposition.`,
      quiz: {
        question: "Which sentence uses 'opened' transitively?",
        correct: "Amina opened the window.",
        distractors: ["The window opened slowly.", "The door opened at noon.", "The flowers opened."],
      },
    },
    {
      title: "Direct Objects and Indirect Objects",
      content: `## Identify what is given and to whom

The **direct object** receives the action of a transitive verb. An **indirect object** tells who receives the direct object or benefits from the action: *The teacher gave the class an assignment*. Here *assignment* is the direct object; *class* is the indirect object.

The same meaning can be written with a preposition: *The teacher gave an assignment to the class*. In this version, *assignment* remains the direct object, while *class* is the object of *to*. A sentence may have a direct object without an indirect one: *The teacher gave an assignment*.

## Use the questions carefully

Ask “gave what?” to find *assignment*, then “gave it to whom?” to find *class*. These questions help, but confirm each answer by checking its relationship to the verb.`,
      quiz: {
        question: "In 'Musa sent his sister a message', what is the direct object?",
        correct: "a message",
        distractors: ["Musa", "his sister", "sent"],
      },
    },
    {
      title: "Objects, Passive Voice and Object Complements",
      content: `## From object to subject

A transitive verb can usually form a passive sentence. In *The pupils cleaned the room*, *room* is the object. It becomes the subject in *The room was cleaned by the pupils*. The passive is useful when the action or result matters more than the doer, or when the doer is unknown.

## When the verb describes its object

Some sentences add an **object complement**, a word or phrase that identifies or describes the object: *The class elected Amina captain*. *Amina* is the object of *elected*; *captain* tells what role she received. In *The news made him anxious*, *him* is the object and *anxious* describes him.

An object complement is not another object. Check whether the final word renames or describes the object rather than receiving a separate action.`,
      quiz: {
        question: "Which word is the object complement in 'The class elected Amina captain'?",
        correct: "captain",
        distractors: ["class", "elected", "Amina"],
      },
    },
  ],
  "IPv4 Subnetting": [
    {
      title: "IPv4 Addresses and Network Prefixes",
      content: `## Read the address

An IPv4 address contains 32 bits, grouped into four 8-bit octets and usually written in dotted decimal, such as **192.168.10.25**. Each octet ranges from 0 to 255. A subnet prefix states how many leading bits identify the network. In **192.168.10.0/24**, the first 24 bits are the network portion and the remaining 8 bits identify host addresses within that subnet.

The prefix length and subnet mask express the same boundary. A **/24** mask is **255.255.255.0**: three full octets belong to the network. A **/26** mask is **255.255.255.192**, because the last octet begins with two network bits.

## Why use subnets?

Subnetting divides a larger address range into smaller networks. This helps organise devices, limit broadcast traffic, and allocate addresses to match the size of each network.`,
      quiz: {
        question: "How many bits are in an IPv4 address?",
        correct: "32",
        distractors: ["16", "24", "64"],
      },
    },
    {
      title: "Calculating Subnet Size and Host Range",
      content: `## Count the host bits

For an IPv4 prefix of **/n**, the host portion has **32 − n** bits. A /26 therefore leaves 6 host bits and contains **2⁶ = 64** total addresses. In a conventional IPv4 subnet, the first address identifies the network and the last is the broadcast address, leaving **62 usable host addresses**.

For **192.168.10.0/26**, the mask is **255.255.255.192**. The first subnet spans .0 through .63: .0 is the network address, .1–.62 are host addresses, and .63 is the broadcast address. The next /26 subnet begins at .64.

## Check the block size

Subtract the mask's final octet from 256: **256 − 192 = 64**. Network boundaries in this octet therefore occur at 0, 64, 128, and 192. This shortcut works when the subnet boundary lies in that octet.`,
      quiz: {
        question: "How many usable host addresses are in a conventional IPv4 /26 subnet?",
        correct: "62",
        distractors: ["64", "30", "126"],
      },
    },
    {
      title: "Finding a Network, Broadcast and Host Address",
      content: `## Place an address in its subnet

Take **192.168.10.77/26**. A /26 block advances by 64 in the final octet: 0, 64, 128, 192. Since 77 falls between 64 and 127, its network address is **192.168.10.64** and its broadcast address is **192.168.10.127**. The usable host range is .65–.126.

The prefix determines the block boundaries; do not assume that every network ends in .0. A /24 network and its /26 subnets have different network addresses and host ranges.

## A reliable method

1. Convert the prefix to its subnet mask.
2. Find the block size in the octet where the mask is partial.
3. Locate the block containing the given address.
4. Use the block's first and last addresses for the network and broadcast; the addresses between them are hosts.`,
      quiz: {
        question: "What is the network address of 192.168.10.77/26?",
        correct: "192.168.10.64",
        distractors: ["192.168.10.0", "192.168.10.77", "192.168.10.127"],
      },
    },
  ],
  "OSI Layer Architecture": [
    {
      title: "The Seven Layers and Their Order",
      content: `## A model for network communication

The **OSI model** divides communication into seven layers, from top to bottom: **Application, Presentation, Session, Transport, Network, Data Link, Physical**. A common memory aid is “All People Seem To Need Data Processing.” The model is a teaching and troubleshooting framework; real protocols do not always fit neatly into only one layer.

The application layer supports network services used by software. Presentation concerns how data is represented or protected. Session coordinates exchanges. Transport manages end-to-end delivery. Network handles logical addressing and routing. Data Link moves frames across a local link. Physical carries raw bits as signals.

## Work from the user's action downward

When a browser requests a web page, application data is prepared, transported, placed in network packets and link frames, then sent as signals. At the receiver, the process is interpreted in reverse.`,
      quiz: {
        question: "Which OSI layer is responsible for logical addressing and routing?",
        correct: "Network",
        distractors: ["Physical", "Presentation", "Session"],
      },
    },
    {
      title: "Encapsulation, Addresses and Data Units",
      content: `## Headers guide delivery

As data moves down the OSI layers, each layer adds control information. This process is **encapsulation**. The transport layer may add port information to a segment; the network layer adds logical IP addresses to a packet; the data-link layer adds local hardware addresses to a frame. The physical layer sends the frame's bits as signals.

The names help identify the work being done: transport data is often called a **segment** (TCP) or **datagram** (UDP), network data a **packet**, and data-link data a **frame**. At the receiver, each layer reads and removes the information intended for it; this is decapsulation.

## Distinguish the addresses

An IP address helps a packet reach a network and host across networks. A link-layer address is used for delivery on the current local link. A port helps direct transport data to the correct application on a device.`,
      quiz: {
        question: "At which OSI layer is an IP packet encapsulated inside a local-link frame?",
        correct: "Data Link",
        distractors: ["Application", "Transport", "Presentation"],
      },
    },
    {
      title: "Using OSI Layers to Troubleshoot",
      content: `## Start with observable symptoms

The OSI model helps narrow a fault by asking where communication stops. If a cable is unplugged or a wireless signal is absent, investigate the **Physical** layer. If a device cannot reach another host on the same local network, examine link settings and frames. If local delivery works but remote networks do not, check IP configuration, routes, and the **Network** layer.

If packets reach the device but a particular service fails, check transport ports and the application itself. A browser error does not automatically prove an application-layer fault: DNS, routing, firewall rules, and the server may all affect the result.

## Test one layer at a time

Confirm the link, then local addressing, then communication with the default gateway, and finally the remote service. Record each result. A successful test rules out some causes but does not prove that every higher layer is working.`,
      quiz: {
        question: "A disconnected network cable is primarily a fault at which OSI layer?",
        correct: "Physical",
        distractors: ["Network", "Transport", "Application"],
      },
    },
  ],
  "VLAN Configuration": [
    {
      title: "VLANs and Broadcast Domains",
      content: `## Divide a switched network logically

A **virtual LAN (VLAN)** groups switch ports into a logical local network. Devices in the same VLAN share a broadcast domain even if they connect to different ports on a managed switch. Devices in separate VLANs are separated at Layer 2; traffic between them needs a router or a Layer 3 switch.

An office might place staff computers in one VLAN and guest devices in another. This limits which local broadcasts each group receives and makes network policy easier to organise. A VLAN is not, by itself, encryption or a complete security boundary; routing and access controls still need careful configuration.

## Keep addressing consistent

Each VLAN normally has its own IP subnet and default gateway. A host assigned to the wrong VLAN may receive no address from the expected DHCP service or may be unable to reach its gateway.`,
      quiz: {
        question: "What separates the broadcast domains of two VLANs?",
        correct: "A router or Layer 3 switch",
        distractors: ["A longer Ethernet cable", "A different host name", "A faster switch port"],
      },
    },
    {
      title: "Access Ports, Trunks and VLAN Tags",
      content: `## Carry one VLAN or many

An **access port** normally connects an end device and belongs to one VLAN. The device sends ordinary Ethernet frames without choosing a VLAN tag. A **trunk** carries traffic for multiple VLANs between network devices. IEEE **802.1Q** adds a tag to identify the VLAN associated with each frame on the trunk.

Both ends of a trunk must agree about which VLANs are allowed and how untagged traffic is handled. If a VLAN is missing from the trunk, devices in that VLAN may communicate locally but fail to cross the link.

## Trace the path

A computer sends an untagged frame into its access port. The switch associates it with that port's VLAN. Across a trunk, the switch tags the frame; the receiving switch reads the tag and forwards it only within the matching VLAN.`,
      quiz: {
        question: "Which standard adds VLAN identification to Ethernet frames on a trunk?",
        correct: "IEEE 802.1Q",
        distractors: ["IPv4", "TCP", "DNS"],
      },
    },
    {
      title: "Planning and Verifying VLAN Membership",
      content: `## Plan before changing switch ports

Record each VLAN's purpose, identifier, subnet, gateway, and required ports. Assign end-device ports as access ports in the intended VLAN. Configure switch-to-switch links as trunks and allow only the VLANs that need to cross them. Use a consistent native or untagged-VLAN policy at both ends.

After configuration, verify the VLAN exists, the access port belongs to it, and each required trunk carries it. Check the device's IP address, subnet mask, and gateway. If a host cannot reach another device, test within the same VLAN first, then test the routed path.

## Diagnose the boundary

If hosts in one VLAN work but another VLAN does not, inspect VLAN membership and trunk allowed lists before changing IP settings at random. If hosts communicate within their VLAN but not with other subnets, investigate the Layer 3 gateway and its routing or access-control policy.`,
      quiz: {
        question: "Which setting should be checked when a VLAN works locally but is missing across a switch link?",
        correct: "The trunk's allowed VLAN list",
        distractors: ["The browser cache", "The host's display resolution", "The Ethernet cable colour"],
      },
    },
  ],
  "Routing Protocols": [
    {
      title: "Routes, Next Hops and Packet Forwarding",
      content: `## How a router chooses a path

A router examines a packet's destination IP address and compares it with its **routing table**. Each route identifies a destination network and usually a next hop or outgoing interface. If several routes match, the router uses the most specific matching prefix, known as **longest-prefix match**.

If the destination is on a directly connected network, the router can send the packet on that link. Otherwise, it forwards the packet to the next router listed in the selected route. If no suitable route exists, the packet is dropped unless a default route provides a path.

## Follow the next hop

The next hop is not necessarily the packet's final destination. It is the next router on the path. Each router makes its own forwarding decision, so a route must be available at every stage for the packet to reach its destination.`,
      quiz: {
        question: "When several routes match a destination, which one does a router prefer?",
        correct: "The route with the longest matching prefix",
        distractors: ["The route with the shortest prefix", "The oldest route", "The route with the largest network address"],
      },
    },
    {
      title: "Static Routes and Dynamic Routing",
      content: `## Routes entered by an administrator

A **static route** is configured manually. It is predictable and can suit a small or stable network, but an administrator must update it when the topology changes. A default route is a static or learned route used when no more specific destination matches.

## Routes learned by routers

A **dynamic routing protocol** lets routers exchange information and update routes as links or networks change. Routers use metrics and protocol rules to compare possible paths. Dynamic routing reduces manual updates in larger networks but requires planning and monitoring.

Static and dynamic routes can coexist. A router may use static routes for a small branch and a dynamic protocol for the rest of the organisation. The forwarding decision still uses the selected route's destination prefix and next hop.`,
      quiz: {
        question: "What is a key feature of a static route?",
        correct: "It is entered manually and does not automatically learn topology changes",
        distractors: ["It always chooses the physically shortest cable", "It is learned from every neighbour automatically", "It can only route within one VLAN"],
      },
    },
    {
      title: "RIP, OSPF and BGP in Context",
      content: `## Different protocols solve different problems

**RIP** is a distance-vector protocol that uses hop count as its metric; its maximum useful path length is limited, so it suits only small networks. **OSPF** is a link-state protocol used within an organisation's autonomous system. Routers share link-state information and calculate paths using a cost metric.

**BGP** exchanges reachability information between autonomous systems, the large administrative networks that make up the Internet. Its route decisions can reflect policy as well as path attributes; it is not simply a search for the fewest hops.

## Choose by network scope

RIP and OSPF are examples of interior gateway protocols for routing within an organisation. BGP is an exterior gateway protocol for routing between autonomous systems. The right protocol depends on scale, policy, and operational needs—not on a claim that one protocol is universally fastest.`,
      quiz: {
        question: "Which protocol is commonly used to exchange routes between autonomous systems?",
        correct: "BGP",
        distractors: ["RIP", "OSPF", "ARP"],
      },
    },
  ],
  "Living & Non-Living Things": [
    {
      title: "Characteristics Used to Identify Living Things",
      content: `## Look for a pattern of life processes

Living organisms carry out life processes: **movement, respiration, sensitivity, growth, reproduction, excretion,** and **nutrition**. These are sometimes remembered as MRS GREN. An animal may move from place to place, while a plant responds to light and grows in one location. Movement alone therefore does not define life.

Respiration releases energy from food within cells; it is not the same as breathing. Growth is a lasting increase in size or cell number. Excretion removes waste products made by the organism, while egestion removes undigested food from the digestive tract.

## Judge the organism, not one moment

An individual organism may not display every process visibly at every moment: a seed can be dormant and still be alive. Use the combined evidence of life processes and the organism's ability to maintain and reproduce its living system.`,
      quiz: {
        question: "Which process releases usable energy from food inside cells?",
        correct: "Respiration",
        distractors: ["Egestion", "Movement", "Excretion"],
      },
    },
    {
      title: "Comparing Living Things with Non-Living Things",
      content: `## Growth is not enough on its own

Plants and animals are living things: they are made of cells and carry out life processes. A stone does not feed, respire, or reproduce. Some non-living things imitate one feature of life. Fire can spread and use fuel, but it is not made of cells and does not carry out the integrated life processes of an organism.

A parked car can move when a person supplies energy, but it does not grow or reproduce itself. By contrast, a young plant uses materials and energy to build new tissue. Distinguish self-maintained biological processes from motion or change caused entirely by an external force.

## Use evidence together

No single visible action is a reliable test. Ask whether the thing is cellular and whether it carries out the life processes as a coordinated organism. This avoids classifying a moving machine or a growing crystal as alive.`,
      quiz: {
        question: "Why is a fire not classified as a living organism?",
        correct: "It is not made of cells and does not carry out the coordinated life processes of an organism",
        distractors: ["It can spread", "It uses energy", "It produces heat"],
      },
    },
    {
      title: "Cells, Organisms and Their Environments",
      content: `## Cells are the basic units of life

All living organisms are made of one or more **cells**. A unicellular organism, such as many bacteria, carries out its life processes in one cell. A multicellular organism has many cells that may specialise: muscle cells contract, while red blood cells carry oxygen.

Organisms interact with their environment. Green plants use light energy to make sugars from carbon dioxide and water; animals obtain energy and materials by feeding on other organisms. Both release usable energy through cellular respiration.

## Sort examples by evidence

Classify a mushroom as living even though it does not move from place to place: it grows, obtains nutrients, respires, and reproduces. A seed is also alive while dormant. Looking at cells and multiple life processes gives a sounder decision than asking whether something walks or looks active.`,
      quiz: {
        question: "What is the basic structural unit found in all living organisms?",
        correct: "The cell",
        distractors: ["The organ", "The tissue", "The organ system"],
      },
    },
  ],
  "Energy & Work": [
    {
      title: "Forms of Energy and Energy Transfer",
      content: `## Energy changes form

Energy is a quantity associated with the ability to cause change or transfer work. Common forms include **kinetic** energy of motion, **gravitational potential** energy due to height, chemical energy in fuels and food, thermal energy, electrical energy, light, and sound.

In a torch, chemical energy in the battery is transferred electrically and becomes light and thermal energy in the bulb. In a falling object, gravitational potential energy decreases as kinetic energy increases. Energy is transferred between stores; it does not disappear.

## Conservation and useful output

The **law of conservation of energy** states that energy is not created or destroyed in a physical process, although it can spread into less useful forms such as heating the surroundings. A device's efficiency compares useful energy output with total energy input.`,
      quiz: {
        question: "What happens to energy when a ball falls?",
        correct: "Gravitational potential energy is transferred mainly into kinetic energy",
        distractors: ["Energy is destroyed", "Kinetic energy becomes mass", "The ball gains energy from nowhere"],
      },
    },
    {
      title: "Work Done by a Force",
      content: `## Force must cause displacement

In physics, **work** is done when a force causes an object to move. For a constant force in the direction of motion, **work done = force × distance**, written **W = Fd**. Work is measured in joules (J); one joule is one newton metre.

If a student pushes a box with a 10 N force through 3 m in the same direction, the work done is **10 × 3 = 30 J**. Holding the box still requires effort, but because it does not move, no mechanical work is done on the box by the upward holding force.

## Consider direction

If the force acts at an angle θ to the displacement, only its component along the direction of motion contributes: **W = Fd cos θ**. A force perpendicular to the motion does no work on the object in this model.`,
      quiz: {
        question: "A 10 N force moves a box 3 m in the same direction. How much work is done?",
        correct: "30 J",
        distractors: ["3 J", "13 J", "30 W"],
      },
    },
    {
      title: "Power, Efficiency and Everyday Energy Use",
      content: `## How quickly is work done?

**Power** is the rate of doing work or transferring energy: **P = W ÷ t**. It is measured in watts (W), where one watt equals one joule per second. Two people may do the same work, but the person who completes it in less time produces more power.

If a motor transfers 600 J in 10 s, its power is **600 ÷ 10 = 60 W**. Power describes the rate, not the total energy used; a 60 W motor running longer transfers more energy than one running briefly.

## Where useful energy goes

Efficiency is **useful energy output ÷ total energy input × 100%**. A lamp also heats its surroundings, so not all electrical input becomes useful light. Inefficient energy transfers are not energy loss from the universe; energy spreads into forms that are harder to use.`,
      quiz: {
        question: "A device transfers 600 J in 10 s. What is its power?",
        correct: "60 W",
        distractors: ["6 W", "610 W", "6,000 W"],
      },
    },
  ],
  "Chemical Changes": [
    {
      title: "Physical Changes and Chemical Reactions",
      content: `## Has a new substance formed?

A **physical change** alters a substance's form or state without changing its chemical identity. Melting ice produces liquid water; both are H₂O. A **chemical change** forms one or more new substances with different properties. When iron reacts with oxygen and water, rust forms; it is not simply iron in a different shape.

Evidence of a reaction may include a lasting colour change, gas formation, a precipitate, or a temperature change. No one sign proves a reaction by itself: boiling also produces bubbles, but it is a physical change. Use evidence and ask whether new substances were made.

## Reversible is not the same as physical

Many physical changes are easy to reverse, but reversibility alone is not the definition. Focus on the substances present before and after the change.`,
      quiz: {
        question: "Which change forms a new substance?",
        correct: "Iron reacting with oxygen to form rust",
        distractors: ["Ice melting to water", "Water evaporating", "Sugar dissolving in water"],
      },
    },
    {
      title: "Reactants, Products and Word Equations",
      content: `## Describe a reaction

The starting substances in a chemical reaction are **reactants**; the substances formed are **products**. A word equation places reactants on the left and products on the right. For example: **magnesium + oxygen → magnesium oxide**. The arrow means “reacts to form”; it does not mean that atoms vanish.

In a reaction, atoms rearrange as old bonds break and new bonds form. The atoms of each element are conserved. This is why a balanced chemical equation has the same number of each kind of atom on both sides.

## Read the equation as evidence

If magnesium burns in oxygen, the bright flame is an observation; magnesium oxide is the product. Naming the reactant and product separates what was present at the start from what the reaction made.`,
      quiz: {
        question: "In 'magnesium + oxygen → magnesium oxide', what is the product?",
        correct: "Magnesium oxide",
        distractors: ["Magnesium", "Oxygen", "The arrow"],
      },
    },
    {
      title: "Conservation of Mass and Reaction Evidence",
      content: `## Atoms are rearranged, not lost

In a chemical reaction, atoms are rearranged into new substances. In a closed system, total mass remains constant: the mass of the reactants equals the mass of the products. If a reaction produces a gas in an open container, the measured mass may fall because the gas escapes—not because matter has been destroyed.

For example, vinegar and a carbonate can release carbon dioxide. Weighing the open container misses the escaping gas. If the gas is trapped in a sealed system, its mass is included in the products and the total remains the same.

## Interpret observations carefully

Bubbles, a colour change, or a new solid can support the conclusion that a reaction occurred. Compare the starting and final materials and consider alternative explanations before deciding.`,
      quiz: {
        question: "Why can an open container appear to lose mass during a gas-producing reaction?",
        correct: "Some product gas escapes and is no longer on the balance",
        distractors: ["Atoms have been destroyed", "The balance changes the products", "Mass is converted into temperature"],
      },
    },
  ],
  "Solar System": [
    {
      title: "The Sun, Planets and Smaller Solar-System Bodies",
      content: `## A system held together by gravity

The **Solar System** consists of the Sun and the objects bound to it by gravity. The Sun is a star at its centre. The eight planets, in order from the Sun, are **Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus,** and **Neptune**. The first four are rocky inner planets; the outer planets are much larger and include gas and ice giants.

The system also contains dwarf planets, moons, asteroids, comets, and smaller pieces of rock and dust. A dwarf planet orbits the Sun but has not cleared its orbital neighbourhood; Pluto is one example.

## Orbits and gravity

A planet's forward motion and the Sun's gravitational pull combine to keep it in orbit. Planets do not shine by making their own visible light; they reflect sunlight.`,
      quiz: {
        question: "Which planet is third from the Sun?",
        correct: "Earth",
        distractors: ["Venus", "Mars", "Jupiter"],
      },
    },
    {
      title: "Rotation, Revolution, Day and Year",
      content: `## Two different motions

**Rotation** is a body's spin on its axis. Earth takes about 24 hours to rotate once, producing the cycle of day and night as different parts face the Sun. **Revolution** is motion around another body. Earth takes about one year to complete one revolution around the Sun.

The Moon revolves around Earth and also rotates. Because the Moon's rotation and orbital periods are nearly the same, the same general side faces Earth over time. Its changing appearance is caused by the changing view of its sunlit half, not by Earth's shadow during an ordinary phase.

## Keep the motions distinct

A planet's rotation explains its day; its revolution around the Sun defines its year. Do not use these terms interchangeably.`,
      quiz: {
        question: "Which motion of Earth produces the day-and-night cycle?",
        correct: "Rotation on its axis",
        distractors: ["Revolution around the Sun", "The Moon's orbit", "The Sun's rotation"],
      },
    },
    {
      title: "Earth's Tilt, Seasons and the Moon's Phases",
      content: `## Why seasons change

Earth's axis is tilted by about **23.5°** relative to the plane of its orbit. As Earth travels around the Sun, each hemisphere takes turns tilting towards or away from it. A hemisphere tilted towards the Sun receives more direct sunlight and has longer days; tilted away, it receives less direct sunlight and has shorter days.

Seasons are therefore caused mainly by Earth's axial tilt—not by Earth being much closer to the Sun in summer. The Northern and Southern Hemispheres have opposite seasons at the same time.

## Why the Moon appears to change shape

The Sun always illuminates half of the Moon. As the Moon orbits Earth, we see different portions of that lit half, producing phases such as crescent, quarter, and full. A lunar eclipse is different: Earth's shadow falls on the Moon.`,
      quiz: {
        question: "What is the main cause of Earth's seasons?",
        correct: "Earth's tilted axis as it orbits the Sun",
        distractors: ["Earth's changing distance from the Moon", "The Sun's changing size", "Earth's daily rotation"],
      },
    },
  ],
};

const lessonExtensions = {
  "Nouns & Classifications": [
    "Consider the sentence “The class carried a basket of mangoes to Amina’s shop.” *Class* is collective, *basket* and *shop* are common nouns, and *Amina* is a proper noun. Classification depends on what each word names in this sentence; capitalisation is a useful clue for proper nouns, but it does not turn every capitalised word into one.",
    "To express a quantity, pair a unit with a mass noun: “three bags of rice” counts bags, while “rice” remains uncountable in this use. The same distinction explains “a piece of advice” and “two pieces of information.” In formal writing, avoid adding a plural ending to these mass nouns unless the meaning has changed to distinct types or instances.",
    "Compare “the teacher’s notes,” “the teachers’ notes,” and “school bus.” The apostrophe marks possession in the first two phrases; in the last, *school* modifies *bus* without asserting ownership. For an irregular plural such as *children*, add apostrophe-s: “the children’s books.”",
  ],
  "Subject-Verb Concord": [
    "In “The box of exercise books is beside the desk,” the subject is *box*. The prepositional phrase *of exercise books* adds information but does not control the verb. Removing that phrase—“The box is beside the desk”—is a useful test when a nearby plural noun makes the choice confusing.",
    "Read a compound subject for meaning before selecting the verb. “The nurse and the driver are here” names two people; “Rice and beans is served at lunch” can describe one combined dish. With *either…or*, place the verb beside the nearer subject where possible, or rewrite the sentence to avoid an awkward mismatch.",
    "Words such as *everyone* and *each* take singular verbs in standard school English: “Each of the teams has a captain.” Do not let *teams* mislead you. By contrast, *a number of pupils are waiting* uses a plural verb because the phrase means several pupils; *the number of pupils is rising* treats the total as one figure.",
  ],
  "Adjectives & Adverbs": [
    "In “The careful driver crossed the narrow bridge slowly,” *careful* and *narrow* describe nouns, while *slowly* tells how the action happened. After a linking verb, an adjective can describe the subject: “The soup smells spicy.” Use this role test instead of assuming every descriptive word is an adverb.",
    "For an irregular comparison, write *good, better, best* and *bad, worse, worst*. Compare like with like: “This path is shorter than that road,” not “This path is shorter than walking to school.” The second comparison mixes a path with an activity, so revise it to make the two things being compared clear.",
    "Adverbs can modify adjectives (*remarkably bright*), other adverbs (*very carefully*), or verbs (*listened attentively*). Position can change emphasis: “Only Musa borrowed the atlas” means no one else borrowed it; “Musa borrowed only the atlas” means he borrowed nothing else. Place *only* beside the word it limits.",
  ],
  "Transitive Verbs": [
    "In “The pupils opened the windows,” ask *opened what?* The answer, *the windows*, is the direct object, so *opened* is transitive here. In “The pupils slept,” there is no object answering *slept what?*; the verb is intransitive in this sentence. A verb’s classification can change with its use.",
    "A direct object receives the action; an indirect object identifies the recipient. In “The librarian gave the class new books,” *books* is the direct object and *class* is the indirect object. The sentence can be recast as “The librarian gave new books to the class,” which makes the relationship easier to see.",
    "A passive sentence makes the receiver of an action the grammatical subject: “The caretaker locked the gate” becomes “The gate was locked by the caretaker.” The *by*-phrase can be omitted when the actor is unknown or unimportant. Do not confuse an object complement—“They elected Amina captain”—with a second object.",
  ],
  "IPv4 Subnetting": [
    "An octet is written in decimal, but its value represents eight binary bits. In a /24, the first three octets identify the network and the last octet identifies a host within it. A /24 contains 256 total addresses; in an ordinary subnet, the network and broadcast addresses are reserved, leaving 254 usable host addresses.",
    "For a /27, five host bits remain, so the block contains 2⁵ = 32 addresses and conventionally 30 usable host addresses. The mask’s final octet is 224; 256 − 224 gives the block size of 32. Subnets in that octet begin at 0, 32, 64, 96, 128, 160, 192, and 224.",
    "Place 10.4.7.139/27 in the block boundaries 10.4.7.128 through 10.4.7.159. The network address is .128, the broadcast address is .159, and the conventional host range is .129–.158. The prefix—not the apparent neatness of the last octet—determines those boundaries.",
  ],
  "OSI Layer Architecture": [
    "When a learner opens a website, the application creates a request; transport organises end-to-end communication; the network layer forwards packets between networks; and the local link carries frames across one connection. Each description answers a different question, which is why the OSI model helps explain a communication process without claiming that every real protocol fits one layer perfectly.",
    "Encapsulation adds information needed at each stage. A transport header can identify a service by port, an IP header identifies source and destination addresses, and a link frame carries information for the current local connection. A router forwards the packet onward using network-layer information and creates a new local-link frame for the next link.",
    "If a computer can communicate with another device on its local network but not with a remote service, the physical connection is less likely to be the first fault to investigate. Check the default gateway and route next; then consider name resolution, transport access, and the service itself. A successful lower-layer test narrows possibilities but does not prove every higher layer works.",
  ],
  "VLAN Configuration": [
    "Imagine one managed switch serving an office, a computer room, and visitors. Assigning ports to separate VLANs places each group in a different Layer 2 broadcast domain, even though the groups share the same physical switch. This logical separation helps organise traffic, but it does not encrypt data or replace carefully designed access controls.",
    "A trunk link carries traffic for multiple VLANs between network devices, using tags to identify the VLAN associated with each frame. An access port normally connects an end device to one VLAN without requiring the device to interpret those tags. The two port roles solve different connection problems and should not be treated as interchangeable.",
    "A host in VLAN 20 normally needs an address and default gateway appropriate to that VLAN’s subnet. If it receives an address from another subnet or cannot reach its gateway, check the port’s VLAN assignment, the trunk’s allowed VLANs, and the corresponding Layer 3 interface. Change one setting at a time and verify the resulting connectivity.",
  ],
  "Routing Protocols": [
    "A router compares a destination address with its routing table and selects a matching route, usually preferring the most specific prefix. The next hop is the neighbour to which the packet should be sent; it is not necessarily the packet’s final destination. If no specific route matches, a configured default route may provide the next step.",
    "A static route is entered by an administrator and is predictable, but it must be maintained as the network changes. A dynamic routing protocol lets routers exchange reachability information and update routes. The choice depends on network size, change frequency, operational skill, and the consequences of a route becoming unavailable.",
    "RIP uses a simple hop-count metric and is suited mainly to small or teaching networks; OSPF calculates paths within an autonomous routing domain; BGP exchanges reachability information between autonomous systems and applies policy as well as path attributes. These protocols address different scales and purposes, so they are not interchangeable labels for the same task.",
  ],
  "Living & Non-Living Things": [
    "Respiration is a chemical process in cells that releases usable energy from nutrients; breathing is the movement of air into and out of lungs. A fish respires without lungs, and plant cells respire even when no visible breathing occurs. Keeping the two terms distinct prevents a familiar animal process from being mistaken for the definition of life.",
    "A flame spreads, uses fuel, and gives off heat, yet those observations alone do not make it an organism. It has no cellular organisation and does not coordinate nutrition, respiration, growth, excretion, and reproduction as living systems do. A useful classification relies on several linked characteristics rather than one dramatic resemblance.",
    "A cell is the basic unit of living structure and function. In a multicellular organism, specialised cells form tissues, tissues form organs, and organs work together in systems; the systems still depend on cellular activity. Organisms also exchange matter and energy with their environments, so habitat conditions can affect survival and growth.",
  ],
  "Energy & Work": [
    "A phone battery stores chemical energy. During use, energy is transferred electrically to the screen and speaker, with some becoming light, sound, and thermal energy. The battery’s stored energy decreases; the energy has not vanished. A useful energy-flow account names the starting store, the transfer pathway, and the resulting stores.",
    "A 20 N horizontal force moves a crate 4 m in its direction. Work done is 20 × 4 = 80 J. If the crate does not move, the applied force does no mechanical work on it in this model because displacement is zero. When force and displacement are at an angle, use only the component of force along the movement.",
    "If a pump transfers 900 J in 30 s, its power is 900 ÷ 30 = 30 W. If 600 J of a 900 J input becomes useful output, efficiency is (600 ÷ 900) × 100%, or about 66.7%. The remaining energy is transferred to less useful forms, often heating the surroundings; it has not been destroyed.",
  ],
  "Chemical Changes": [
    "When an ice cube melts, the particles remain water molecules; they move differently as the state changes. When magnesium reacts with oxygen, a white solid with different properties forms. The first is a physical change and the second is a chemical reaction because the substances present have changed.",
    "A gas, temperature change, colour change, or precipitate can provide evidence of a reaction, but context matters. Bubbles from boiling water do not show that water has decomposed; the bubbles are water vapour. Combine observations with knowledge of the starting materials and products before deciding that a chemical reaction occurred.",
    "In a closed reaction, the total mass before and after is the same because atoms are rearranged rather than created or destroyed. If vinegar and bicarbonate react in an open container, carbon dioxide can escape and the measured mass of the container’s contents falls. Include the escaping gas in the system boundary to account for the mass.",
  ],
  "Solar System": [
    "The Sun’s gravity and a planet’s forward motion together produce an orbit. The planets are not all alike: Mercury through Mars are rocky worlds, while Jupiter and Saturn are gas giants and Uranus and Neptune are ice giants. Moons orbit planets; asteroids and comets follow their own paths around the Sun.",
    "At a particular moment, the half of Earth facing the Sun experiences day while the opposite side experiences night. Earth’s rotation brings locations through this pattern. Its revolution around the Sun takes about a year, but the seasons are not caused by that revolution alone; the tilt of Earth’s axis changes the angle and duration of sunlight.",
    "During a lunar month, the Moon’s position relative to Earth and the Sun changes, so observers see different portions of its sunlit half. At full moon, the visible side is largely illuminated; at new moon, the illuminated side faces mostly away from Earth. A lunar eclipse is a separate alignment in which Earth’s shadow falls on the Moon.",
  ],
};

const curriculum = JSON.parse(await fs.readFile(curriculumPath, "utf8"));
let updatedLessons = 0;
let minimumWordCount = Number.POSITIVE_INFINITY;
const seenTopics = new Set();
const fillerPattern = /Detailed analytical breakdown|Step-by-step application in standardized exam problems|standard evaluation query|Correct analytical response option|Incorrect distractor option|Sample evaluation question|This unit covers key principles/i;

for (const course of curriculum.courses ?? []) {
  for (const module of course.modules ?? []) {
    const topic = String(module.title ?? "").replace(/^Module:\s*/, "");
    const topicLessons = lessonsByTopic[topic];
    if (!topicLessons) throw new Error(`No authored lesson set for module: ${topic}`);
    seenTopics.add(topic);

    for (const lesson of module.lessons ?? []) {
      const part = Number(String(lesson.code ?? "").match(/\.(\d+)$/)?.[1]) - 1;
      const authored = topicLessons[part];
      if (!authored) throw new Error(`Unexpected lesson part in ${topic}: ${lesson.code}`);
      lesson.title = authored.title;
      lesson.content = `# ${topic}\n\n${authored.content}\n\n## Applying the concept\n\n${lessonExtensions[topic][part]}`;
      lesson.assessmentSeed = {
        prompt: authored.quiz.question,
        correct: authored.quiz.correct,
        distractors: authored.quiz.distractors,
      };
      const wordCount = (lesson.content.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []).length;
      minimumWordCount = Math.min(minimumWordCount, wordCount);
      if (wordCount < 80 || fillerPattern.test(lesson.content)) {
        throw new Error(`Lesson content is too short or contains filler: ${lesson.code}`);
      }
      if (lesson.assessmentSeed.distractors.length !== 3 || !lesson.assessmentSeed.correct) {
        throw new Error(`Lesson assessment is incomplete: ${lesson.code}`);
      }
      updatedLessons += 1;
    }
  }
}

const missingTopics = Object.keys(lessonsByTopic).filter((topic) => !seenTopics.has(topic));
if (missingTopics.length) {
  throw new Error(`Curriculum is missing authored topics: ${missingTopics.join(", ")}`);
}

const coursesBySubject = new Map();
for (const course of curriculum.courses ?? []) {
  const subject = String(course.subject ?? "").trim();
  if (!subject) throw new Error(`Course "${course.title}" has no subject.`);

  let group = coursesBySubject.get(subject);
  if (!group) {
    group = { course, modules: new Map() };
    coursesBySubject.set(subject, group);
  }

  for (const module of course.modules ?? []) {
    const topic = String(module.title ?? "").replace(/^Module:\s*/, "");
    const existing = group.modules.get(topic);
    if (!existing) {
      module.title = topic;
      group.modules.set(topic, { module, lessons: new Map() });
    }

    const topicModule = group.modules.get(topic);
    for (const lesson of module.lessons ?? []) {
      const previous = topicModule.lessons.get(lesson.title);
      if (
        previous &&
        (
          previous.content !== lesson.content ||
          JSON.stringify(previous.assessmentSeed) !== JSON.stringify(lesson.assessmentSeed)
        )
      ) {
        throw new Error(`Conflicting authored lesson content for ${subject}: ${topic} / ${lesson.title}`);
      }
      if (!previous) topicModule.lessons.set(lesson.title, lesson);
    }
  }
}

const topicOrder = Object.keys(lessonsByTopic);
curriculum.courses = [...coursesBySubject.entries()].map(([subject, group]) => {
  const course = group.course;
  course.title = `${course.level} ${subject}`;
  course.modules = [...group.modules.entries()]
    .sort(([left], [right]) => topicOrder.indexOf(left) - topicOrder.indexOf(right))
    .map(([, { module, lessons }]) => {
      module.lessons = [...lessons.values()];
      return module;
    });
  return course;
});
updatedLessons = curriculum.courses.reduce(
  (total, course) =>
    total +
    (course.modules ?? []).reduce(
      (moduleTotal, module) => moduleTotal + (module.lessons ?? []).length,
      0,
    ),
  0,
);
const retainedTopics = new Set(
  curriculum.courses.flatMap((course) =>
    course.modules.map((module) => module.title),
  ),
);
const missingRetainedTopics = topicOrder.filter((topic) => !retainedTopics.has(topic));
if (missingRetainedTopics.length) {
  throw new Error(`Not all authored topics were retained: ${missingRetainedTopics.join(", ")}`);
}

curriculum.meta = {
  ...curriculum.meta,
  generator: "Authored textbook curriculum",
  courseCount: curriculum.courses.length,
  totalRecords: updatedLessons,
};

await fs.writeFile(curriculumPath, `${JSON.stringify(curriculum, null, 2)}\n`, "utf8");
console.log(`Rewrote ${updatedLessons} lessons across ${seenTopics.size} authored topics.`);
console.log(`Shortest lesson: ${minimumWordCount} words.`);
