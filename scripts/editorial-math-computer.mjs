import fs from "node:fs/promises";
import path from "node:path";

const curriculumPath = path.resolve(process.cwd(), "data", "curriculum.json");
const applyChanges = process.argv.includes("--apply");

const mathematics = {
  "Whole numbers and place value": `# Whole numbers and place value

Place value tells what a digit is worth because of its position. In 5,284, the 5 represents five thousands, the 2 represents two hundreds, the 8 represents eight tens and the 4 represents four ones. Expanded form makes the value visible: 5,284 = 5,000 + 200 + 80 + 4. A zero holds a place; without it, 5,204 would be confused with 524.

Compare numbers by starting at the greatest place. Since 5 thousands is more than 4 thousands, 5,284 is greater than 4,962. Rounding 5,284 to the nearest hundred gives 5,300 because the tens digit is 8. Keep the place being rounded and inspect the digit immediately to its right.

Write 70,406 in expanded form and round it to the nearest thousand. Explain the job of the zero in the hundreds place.`,
  "Factors, multiples and primes": `# Factors, multiples and primes

A factor divides a number exactly; a multiple is the result of multiplying a number by a whole number. The factors of 18 are 1, 2, 3, 6, 9 and 18, while its first positive multiples are 18, 36 and 54. A prime number has exactly two positive factors, 1 and itself. The number 1 is not prime because it has only one positive factor.

Prime factorisation writes a composite number as a product of primes. For example, 36 = 2 x 2 x 3 x 3 = 2^2 x 3^2. The highest common factor uses shared prime factors at their smaller powers; the lowest common multiple uses every prime factor at its larger power. This gives HCF(18, 24) = 6 and LCM(18, 24) = 72.

Find the prime factorisation of 60, then use it to calculate the HCF and LCM of 60 and 84.`,
  "Integers and directed numbers": `# Integers and directed numbers

Integers include positive whole numbers, negative whole numbers and zero. A number line gives direction: values increase to the right and decrease to the left. Therefore -2 is greater than -7, even though 7 is greater than 2. Temperature and debt are useful contexts because the sign shows direction relative to a reference point.

Adding a positive integer moves right; adding a negative integer moves left. Subtracting a negative is equivalent to adding its positive: 4 - (-3) = 4 + 3 = 7. Multiplication follows sign rules: equal signs give a positive product and unlike signs give a negative product. For example, (-5) x 3 = -15.

Evaluate -6 + 11 - 8 and explain each move on a number line. Then compare -6 and -8 without using their absolute values alone.`,
  "Algebraic expressions": `# Algebraic expressions

An algebraic expression combines numbers, variables and operations. In 4x + 7, x is a variable, 4 is its coefficient and 7 is a constant. The term 4x means four multiplied by x; it is not the two-digit number 4x. Like terms have the same variable part, so 3a + 5a = 8a, while 3a + 5b cannot be combined.

The distributive law removes brackets: 3(x + 4) = 3x + 12 because 3 multiplies both terms. Substitution evaluates an expression for a chosen value. If x = 5, then 3x + 12 = 15 + 12 = 27. Keep the order of operations clear, especially when powers and negative values appear.

Simplify 5p - 2 + 3p + 9, then evaluate the result when p = -2.`,
  "Sequences and patterns": `# Sequences and patterns

A sequence is an ordered list formed by a rule. In 4, 7, 10, 13, each term increases by 3, so the common difference is 3. The next term is 16. A term-to-term rule describes how to move from one term to the next; a position-to-term rule calculates any term directly.

For the sequence 4, 7, 10, 13, the nth term is 3n + 1: when n = 1 it gives 4, and when n = 5 it gives 16. Check a proposed rule against more than the first term. Not every sequence adds the same amount; 2, 4, 8, 16 multiplies by 2 instead.

Find the next two terms in 6, 11, 16, 21 and write a rule for the nth term. Verify it at n = 1 and n = 4.`,
  "Volume and capacity": `# Volume and capacity

Volume measures the space occupied by a three-dimensional object. A rectangular prism has volume length x width x height. If its dimensions are 8 cm, 3 cm and 5 cm, its volume is 120 cm^3. Capacity describes how much a container holds and is often measured in litres or millilitres. One litre equals 1,000 millilitres and 1,000 cm^3.

Units must match the calculation. Multiplying three lengths in centimetres produces cubic centimetres, not centimetres. For a prism, a cross-section area can be multiplied by its length. Irregular containers may need measurement by displacement or by reading a graduated scale, depending on the material and shape.

A tank measures 2 m by 1.5 m by 1 m. Find its volume in cubic metres and capacity in litres. State the conversion used.`,
  "Time, speed and distance": `# Time, speed and distance

For steady motion, speed = distance / time. Rearranging gives distance = speed x time and time = distance / speed. Units must agree: a speed in kilometres per hour requires time in hours if the answer is in kilometres. A cyclist travelling at 12 km/h for 2.5 hours covers 30 km.

Convert minutes to hours before using a speed in km/h: 30 minutes is 0.5 hours. Average speed is total distance divided by total time, including stops when the question asks for the whole journey. It is not necessarily the speed at every moment. A distance-time graph has a steeper gradient when the object travels faster and a horizontal section when it is stationary.

A bus covers 150 km in 3 hours, including a 30-minute stop. Find its average speed for the full journey and while moving.`,
  "Graphs and tables": `# Graphs and tables

A table organises paired values so patterns can be checked before graphing. On a graph, the horizontal axis usually shows the independent quantity and the vertical axis the measured result. Label both axes with units, choose an even scale and plot points accurately. A line graph is useful for continuous change; a bar chart compares separate categories.

The shape of a graph communicates the relationship. A straight line through the origin can represent direct proportion; a horizontal section means the vertical quantity is unchanged as the horizontal quantity increases. Do not join category bars as if the categories formed a continuous measurement. Read coordinates from the scale rather than estimating from the visual spacing alone.

Plot distance against time for a learner who walks 20 m in 10 s, waits 5 s and then walks 15 m in 5 s. Label the stationary interval.`,
  "Coordinates": `# Coordinates

An ordered pair (x, y) locates a point relative to two perpendicular axes. Move along the horizontal x-axis first, then vertically to the y-value. The origin is (0, 0). Signs identify quadrants: in the first quadrant both coordinates are positive; in the second, x is negative and y is positive.

On a Cartesian grid, the distance between (x1, y1) and (x2, y2) is found by considering horizontal and vertical changes. For example, from (1, 2) to (4, 6), the changes are 3 and 4, so the distance is 5 units by Pythagoras. The midpoint averages the coordinates: ((x1+x2)/2, (y1+y2)/2).

Plot A(-2, 3) and B(4, 3). State their horizontal separation and midpoint, and explain why the y-coordinate stays fixed.`,
  "Transformations": `# Transformations

A transformation moves or changes a shape according to a rule. A translation slides every point by the same vector; a reflection flips the shape across a mirror line; a rotation turns it around a centre by a stated angle. A dilation enlarges or reduces a shape from a centre using a scale factor. Rigid transformations preserve lengths and angles; dilation preserves angles but changes lengths.

Describe a transformation precisely by naming the type and the information it requires. A reflection needs a mirror line; a rotation needs a centre, direction and angle; a translation needs a vector. For example, translating (2, 1) by vector (3, -2) gives (5, -1). Check a second vertex to confirm that the same rule was applied consistently.

Reflect the triangle with vertices (1, 1), (4, 1), (2, 3) in the y-axis. Write each image coordinate and compare side lengths.`,
  "Pythagoras theorem": `# Pythagoras theorem

In a right-angled triangle, the square of the hypotenuse equals the sum of the squares of the other two sides: a^2 + b^2 = c^2. The hypotenuse c is opposite the right angle and is always the longest side. The theorem does not apply to a triangle without a right angle.

If the shorter sides are 6 cm and 8 cm, then c^2 = 36 + 64 = 100, so c = 10 cm. To find a shorter side, rearrange: a^2 = c^2 - b^2. Keep units consistent and take the positive square root for a physical length. A quick estimate helps catch an answer that is shorter than one of the known sides.

A ladder reaches 12 m up a wall and its foot is 5 m from the wall. Find its length and identify the hypotenuse in a labelled sketch.`,
  "Similarity and scale": `# Similarity and scale

Similar shapes have equal corresponding angles and proportional corresponding sides. If the scale factor from a smaller shape to a larger one is 3, every length is multiplied by 3, while area is multiplied by 3^2 = 9. Volume changes by the cube of the scale factor. Confusing these powers leads to incorrect area and volume calculations.

A map scale of 1:50,000 means 1 cm on the map represents 50,000 cm, or 500 m, on the ground. A measured 4 cm therefore represents 2 km. Keep units consistent before multiplying. For similar triangles, identify matching angles first, then pair the sides opposite those angles to form a correct ratio.

Two similar rectangles have corresponding widths 4 cm and 10 cm. Find the scale factor and the larger length if the smaller length is 7 cm.`,
  "Financial mathematics": `# Financial mathematics

Financial mathematics applies arithmetic to money decisions. A percentage is a rate per hundred: 15% of ₦8,000 is 0.15 x 8,000 = ₦1,200. A discount reduces a marked price, while a tax or service charge increases the amount paid. Calculate each on the correct base and state whether it is added or subtracted.

Simple interest is calculated on the original principal: I = Prt, where P is principal, r is the annual rate as a decimal and t is time in years. A ₦20,000 loan at 5% simple interest for 2 years earns I = 20,000 x 0.05 x 2 = ₦2,000. Compound interest is different because interest is added to the balance before later periods are calculated.

A ₦12,500 item is discounted by 8%. Find the discount and sale price, then check that the sale price is below the original price.`,
  "Data interpretation": `# Data interpretation

Data interpretation turns recorded values into a supported conclusion. Check the title, units, category labels and time period before comparing numbers. The mean is the total divided by the number of values; the median is the middle value after sorting; the mode is the most frequent value. These measures answer different questions and can differ greatly when data contains an extreme value.

For 4, 5, 5, 6, 20, the mean is 8 and the median is 5. The unusually high value pulls the mean upward, so the median may better describe a typical result in this set. A graph may also exaggerate differences if its vertical axis begins above zero; inspect the scale before drawing conclusions.

Compare the mean and median of 6, 7, 7, 8, 22. Explain which measure better represents the cluster of ordinary values and why.`,
  "Mixed problem solving": `# Mixed problem solving

Multi-step problems often combine arithmetic, measurement, algebra and interpretation. Read the question once for the situation and again to identify the requested quantity. Record the known values with units, choose a method and keep the working visible. If a diagram helps, label it before calculating.

For a rectangular garden 12 m by 8 m, a path 1 m wide runs inside all four edges. The planting area is a rectangle 10 m by 6 m, so it is 60 m^2; the full garden is 96 m^2 and the path covers 36 m^2. The check is that planting area plus path equals total area. This kind of check can reveal a missing region or unit error.

Create a two-step budget problem involving a percentage discount and change from a fixed amount. Solve it, then use estimation to check whether the result is reasonable.`,
};

const computerStudies = {
  "Computer as a machine": `# Computer as a machine

A computer is an electronic system that accepts data, processes it according to instructions, stores information and produces output. The input-process-output-storage model helps trace a task. When a learner types marks, the keyboard supplies input, software calculates a total, the screen displays it and a file may store it for later use.

Hardware is the physical equipment; software is the set of programs and instructions. A computer does not understand a result in the human sense: it follows operations encoded by software. The quality of output depends on the accuracy of input and the correctness of the instructions. This is why checking source data matters before relying on a calculation.

Trace a school attendance task through input, processing, output and storage. Name one possible error at each stage.`,
  "Parts of a computer": `# Parts of a computer

A computer system includes input devices, a processor, memory, storage and output devices. The CPU executes instructions and coordinates operations. RAM temporarily holds data and programs currently in use; it is volatile, so its contents are lost when power is removed. Storage devices such as SSDs keep files when the computer is off.

These parts work together rather than independently. When opening a document, the storage device supplies its data, RAM holds working information, the processor runs the application and the display presents the page. A printer is an output device, while a keyboard supplies input. Knowing each part's role makes troubleshooting more precise than saying simply that “the computer is faulty.”

For printing a saved document, identify which component stores the file, processes the print command and produces the paper output.`,
  "Input devices": `# Input devices

An input device sends data or instructions to a computer. A keyboard enters text, a mouse controls a pointer, a microphone captures sound and a scanner converts a paper image into digital data. Touchscreens can both show output and detect input. Choose a device according to the kind of information and the task.

Input must be interpreted by software. A barcode scanner reads a code that identifies a product; it does not itself decide the price. A microphone captures an analogue sound signal that the system converts into digital data. Devices need compatible ports, drivers or wireless connections, and the user may need to grant permission before an application can access them.

For recording a spoken interview and then typing its transcript, name the input device used at each stage and the data it captures.`,
  "Output devices": `# Output devices

An output device presents processed information in a form people or other systems can use. A monitor displays text and images, speakers produce sound, a printer creates a paper copy and a projector enlarges an image for a group. Output quality depends on the device and on how the software prepares the information.

Different tasks call for different output. A printed receipt is useful when a customer needs a physical record; a screen is better for information that changes frequently. Resolution, colour capability, paper size and accessibility features should be considered when choosing a device. Output can also return to a computer, as when a printer reports that it is out of paper.

Choose an output device for a class presentation and one for a signed payment receipt. Explain why the two tasks differ.`,
  "Storage devices": `# Storage devices

Storage keeps programs and data for later use. A hard disk and a solid-state drive retain files without power; an SSD has no moving disk parts and is usually faster. A USB flash drive is portable, while cloud storage keeps data on remote systems accessed through a network. RAM is working memory, not permanent storage.

Capacity measures how much data a device can hold; access speed and reliability also matter. A backup is a separate copy that helps recover data after loss or damage. Saving a file to one device is not a complete backup if that device is the only copy. Removable media should be handled safely and scanned when its source is unknown.

Choose storage for a school project that must be edited in class and backed up at home. State one benefit and one risk of your choice.`,
  "Data and information": `# Data and information

Data are recorded facts or symbols; information is data organised and interpreted so it answers a question. The marks 62, 74 and 81 are data. A calculated mean of 72.3, labelled as the class average for a named test, is information because it has context and meaning.

Data quality affects information quality. Incorrect spelling, missing values or marks entered in the wrong column can produce misleading reports. Validation checks can detect some errors, such as a score outside the allowed range, but they cannot prove every entry is true. Keep the original source and document how data was collected when decisions depend on it.

Give an example of raw school data and show how adding labels and a calculation turns it into useful information.`,
  "Number systems": `# Number systems

Computers represent data using binary digits, 0 and 1, because electronic circuits can distinguish two states. In binary place value, columns represent powers of two: 1, 2, 4, 8 and so on. The binary number 1011 equals 8 + 0 + 2 + 1 = 11 in decimal.

Hexadecimal uses sixteen symbols, 0-9 and A-F, and provides a compact way to write binary values. One hexadecimal digit represents four binary bits; for example, binary 1111 equals hexadecimal F. Text, images and sound are also encoded as numbers according to defined standards, so the same bits can represent different kinds of data depending on the format.

Convert binary 1101 to decimal by showing each place value. Then write decimal 10 in binary.`,
  "Computer software": `# Computer software

Software is a set of instructions and related data that tells a computer how to perform tasks. System software, including an operating system, manages hardware and provides services to applications. Application software helps users complete tasks such as writing documents, analysing data or communicating.

Software is stored and executed by hardware, but it is not a physical component like a keyboard. A word processor relies on the operating system to access files and display text. Software licences describe how a program may be used, copied or modified; installing a program does not automatically grant permission to redistribute it.

Classify an operating system, a spreadsheet and a printer driver by their roles. Explain how an application depends on system software.`,
  "Operating systems": `# Operating systems

An operating system manages a computer's resources and provides an interface for users and applications. It schedules processor time, manages memory, organises files, controls devices and supports security. Examples include Windows, macOS, Linux, Android and iOS, each designed for different devices and use cases.

When a user saves a document, the application asks the operating system to write data to storage. The operating system manages permissions and reports errors such as a full drive. Updates can fix security weaknesses and improve compatibility, but users should save work and use trusted sources before updating.

Describe what the operating system does when a learner opens, edits and saves a document.`,
  "Files and folders": `# Files and folders

A file stores information under a name and format; a folder organises files and other folders. A path identifies a file's location, such as Documents/Science/report.docx. Extensions often indicate the format, but renaming an extension does not convert the file contents.

Good file management uses meaningful names, a consistent folder structure and regular backups. Avoid names such as final-final-new because they obscure which version is current. Use version dates or a clear sequence, and check where a file is saved before closing the application. Shared computers may require logging out so other users cannot access private files.

Design a folder structure for a term's assignments and name one file so its subject, topic and version are clear.`,
  "Word processing": `# Word processing

A word processor creates and edits text documents. It supports typing, selecting, revising, formatting, checking spelling and saving or printing. The content and its appearance are related but distinct: changing a heading style should not alter the words, while editing a sentence changes the text itself.

Save early and use a descriptive filename. Before printing, use print preview to check page breaks, margins and page count. Spell-check can find some misspellings but may not detect a correctly spelled word used incorrectly. A final read-through is still needed for meaning, punctuation and factual accuracy.

Create a one-page notice with a clear title, date, paragraphs and contact information. Use preview to check that no important line is cut off.`,
  "Formatting documents": `# Formatting documents

Formatting controls how a document is presented. Font size, alignment, spacing, margins and styles can make information easier to scan. Use built-in heading styles for section titles instead of changing each heading manually; styles provide consistency and can support navigation and accessibility tools.

Excessive fonts, colours and underlining compete with the message. A formal report usually needs a small number of consistent styles, readable contrast and clear hierarchy. Page layout should reflect the intended use: a wide table may need landscape orientation, while an ordinary letter usually fits portrait orientation.

Format a short report with one title style, section headings and body text. Explain one choice that improves readability rather than decoration.`,
  "Spreadsheets": `# Spreadsheets

A spreadsheet arranges data in cells identified by column letters and row numbers: B3 is column B, row 3. A formula begins with = and can refer to cells, so changing an input updates dependent results. For marks in B2:B4, =SUM(B2:B4) calculates the total and =AVERAGE(B2:B4) calculates the mean.

Labels explain what a column contains, and consistent data types make calculations reliable. A chart should match the question: a bar chart compares categories, while a line chart can show change over time. Check formulas by testing a small example and comparing the result with a hand calculation; a plausible-looking chart can still be based on the wrong range.

Enter five test scores, calculate total and average, then make a labelled chart. Change one score and confirm which results update.`,
  "Formulas and charts": `# Formulas and charts

Spreadsheet formulas combine values, cell references and functions. Relative references change when a formula is copied; absolute references such as $B$2 remain fixed. If a tax rate is stored in B2, a copied formula can multiply each price by $B$2 without shifting the rate reference.

Charts communicate patterns only when the data range and labels are correct. A column chart compares categories; a line chart is suited to ordered time data. Avoid starting a value axis at a misleading point when the size of differences matters. Always check the chart title, units, legend and selected range against the source table.

Create a price table with a fixed tax rate in one cell. Copy a formula down the column and explain why the rate reference must stay fixed.`,
  "Presentation software": `# Presentation software

Presentation software combines text, images, charts and media into slides for an audience. A slide should support the speaker's explanation rather than duplicate a full report. Use a clear title, readable type and a visual that helps explain the point. Keep source information for images and data so the audience can check important claims.

Good presentation design considers the room, screen size, audience and time available. High contrast improves legibility; animation should reveal sequence only when it aids understanding. Rehearse with the actual equipment and keep a backup copy. Slides are not a substitute for explaining a chart or answering questions.

Prepare three slides explaining one school topic. Include a title, one labelled visual and a final source slide; remove any text you would rather explain aloud.`,
  "Computer networks": `# Computer networks

A computer network connects devices so they can exchange data and share resources. A local area network serves a limited place such as a school; a wide area network spans larger distances. Devices use wired or wireless links, network interface hardware and agreed communication protocols.

A router forwards data between networks, while a switch connects devices within many local networks. The Internet is a global network of networks, not the same thing as the Web. Network performance depends on bandwidth, latency, congestion and the quality of the connection. Shared access also requires security controls and responsible use.

Trace how a school laptop reaches a website through a wireless access point and router. Identify one point where a connection problem might occur.`,
  "Internet and web": `# Internet and web

The Internet is the global system of interconnected networks that carry data using shared protocols. The World Wide Web is one service on the Internet: browsers request web resources from servers, commonly using HTTP or HTTPS. Email, file transfer and voice calls can also use the Internet without being web pages.

A URL identifies a resource and may include a scheme, domain and path. DNS helps translate a domain name into a network address. HTTPS encrypts the connection between browser and server and helps verify the server's identity, but it does not prove that a page's claims are true.

Explain the difference between the Internet and the Web using a browser request as an example.`,
  "Search and information literacy": `# Search and information literacy

Search engines index web pages and rank results in response to a query. Search operators, specific terms and quotation marks can narrow results, but ranking is not the same as verification. A result may be sponsored, outdated, incomplete or selected to match a user's activity.

Assess a source by checking its author, purpose, date, evidence and links to original material. Compare important claims with independent sources. A polished page or high result position does not guarantee accuracy. Keep track of the exact source and date when using information in schoolwork, and distinguish a source's evidence from your own conclusion.

Find two sources for a health or technology claim. Compare who published them, what evidence they cite and whether the claims agree.`,
  "Email and online communication": `# Email and online communication

Email sends messages between accounts using mail servers. A clear subject line helps a recipient understand the purpose; the message should identify its request and include only relevant attachments. CC makes recipients visible to one another, while BCC hides the list from other recipients. Use reply-all only when every recipient needs the response.

Check addresses and attachments before sending. Be cautious with links and requests for passwords or urgent payments, especially when the sender's address differs slightly from the expected one. Online communication creates records that can be forwarded or stored, so avoid sending private information to an unverified recipient and use respectful language.

Draft a short email to a teacher requesting an assignment clarification. Add a useful subject and explain why BCC would not be appropriate for this message.`,
  "Cyber safety": `# Cyber safety

Cyber safety protects devices, accounts and people from online harm. Use unique passwords, enable multi-factor authentication where available, install updates from trusted sources and lock devices when unattended. Phishing messages may imitate a trusted organisation to persuade a user to open a link, share credentials or pay money.

Before acting, check the sender's address, the actual link destination and whether the request is expected. Do not reuse a password across school and personal accounts. If an account may be compromised, change its password from a trusted device, notify the responsible adult or administrator and follow the service's recovery steps. Keep evidence of threats and report them rather than retaliating.

Review a fictional urgent account-warning email. Identify two signs to verify before clicking and one safe reporting action.`,
  "Digital citizenship": `# Digital citizenship

Digital citizenship is responsible participation in connected spaces. It includes protecting personal information, respecting other users, checking claims before sharing and understanding that online actions can persist. A post can be copied beyond its original audience, so privacy settings reduce exposure but cannot guarantee that content stays private.

Respectful online conduct includes disagreeing with ideas without targeting a person, asking consent before sharing another person's image and following the rules of the service. When cyberbullying occurs, save relevant evidence, block or report the account and tell a trusted adult. Do not publish private details in retaliation. Digital rights and responsibilities apply alongside school policy and law.

Decide whether a fictional class photo can be posted publicly. List whose permission and what privacy risks should be considered.`,
  "Computer viruses and malware": `# Computer viruses and malware

Malware is software designed to harm, disrupt or gain unauthorised access to a system. A virus attaches to a file or program and spreads when it runs; a worm can spread across networks, while ransomware may encrypt files and demand payment. Not every computer problem is a virus, and a warning pop-up can itself be a scam.

Reduce risk by keeping software updated, using reputable security tools, downloading from trusted sources and keeping separate backups. Do not open unexpected attachments or disable protections because a message demands it. If malware is suspected, disconnect from a network when advised, tell the responsible administrator and avoid entering passwords on the affected device.

Explain why a backup stored on the same always-connected device may not protect against ransomware.`,
  "Data privacy": `# Data privacy

Data privacy concerns how personal information is collected, used, stored and shared. Personal data can include names, contact details, location, school records and information that identifies someone when combined with other facts. Collect only what is needed for a clear purpose, restrict access and protect data with appropriate security.

Consent should be informed and freely given, especially when sharing images or sensitive details. A public post can reveal more than intended through faces, uniforms, location tags or background information. Privacy settings help manage an audience but do not prevent screenshots or onward sharing. If information is exposed, report it promptly and follow the organisation's response process.

Review a fictional school survey. Identify two fields it should avoid collecting and explain how responses should be protected.`,
  "Algorithms and flowcharts": `# Algorithms and flowcharts

An algorithm is a finite, ordered set of steps for solving a problem. A flowchart represents those steps with standard symbols: an oval for start or end, a rectangle for a process, a parallelogram for input or output and a diamond for a decision. Arrows show the direction of control.

A good algorithm has clear inputs, outputs and conditions. To decide whether a learner passes at 50 or more, the decision tests score >= 50; each branch must lead to an output. Trace sample values on both sides of the boundary, such as 49 and 50, to check that the rule behaves as intended. A flowchart is a model, so update it when requirements change.

Draw a flowchart that reads two test scores, calculates their average and reports pass when the average is at least 50.`,
  "Programming concepts": `# Programming concepts

A program is a set of instructions written in a programming language to transform input into useful output. Variables name values, expressions calculate results, selection chooses a path and iteration repeats steps. Functions group work under a name so it can be reused and tested independently.

Programmers break a problem into inputs, rules and outputs before writing code. For a class average, inputs are the marks, processing sums them and divides by the count, and output is the result. Test normal cases, boundary values and invalid input. A program that runs without a syntax error can still produce the wrong answer if its logic or assumptions are incorrect.

Describe the input, processing and output for a program that converts a temperature from Celsius to Fahrenheit.`,
  "Computer ethics": `# Computer ethics

Computer ethics concerns responsible choices when designing, using and sharing digital systems. Issues include privacy, consent, intellectual property, accessibility, security and the effects of automation. A technically possible action is not automatically fair or lawful; users should consider who is affected and what permission or rule applies.

Copying software without a licence, accessing another person's account or publishing private data can harm others and violate rules. Ethical design also considers people with disabilities and groups who may be excluded by a system. When facing a dilemma, identify stakeholders, possible harms, obligations and less harmful alternatives, then explain the decision.

Discuss a fictional app that collects a learner's location continuously. Identify what the app needs, what should be explained and how collection could be limited.`,
  "Practical computer project": `# Practical computer project

A practical computer project solves a defined need using digital tools. Begin with a user and a problem statement, then list requirements, available hardware and software, data needs and constraints. Sketch the result before building it. A small project such as a class inventory sheet should identify fields, validation rules, users and how a backup will be kept.

Build in stages and test each requirement with realistic data. Record errors and changes so another person can understand the work. Check usability, privacy and accessibility as well as whether the tool functions. A final report should describe what was built, how it was tested, limitations and what would be improved next.

Plan a small class project with a user, three requirements, a test case and one privacy safeguard.`,
};

const computerStudyExtensions = {
  "Computer as a machine": `A computer's result depends on the quality of its input and instructions. In a class attendance example, a misspelled learner name may create a duplicate record, while an incorrect formula may count the wrong range. Check the original register, test the calculation with a small sample and compare the final total with a second method. This is called verification: it looks for errors after processing rather than assuming that a computer is always correct. Computers can repeat instructions quickly, but they do not decide whether the task is fair or whether the data should have been collected. A user remains responsible for checking the purpose, accuracy and appropriate handling of information.`,
  "Parts of a computer": `The component roles are easiest to remember by tracing one complete task. When editing a saved report, storage supplies the file, RAM holds the open working copy, the CPU executes the editor's instructions and the display shows the current page. Saving sends updated data back to storage. If the printer is offline, the report may still be open because output and processing are separate functions. This distinction helps diagnose a problem: a blank display, a full drive and a disconnected printer point to different components. Identify the symptom first, then check the relevant connection, setting or resource rather than replacing every part of the system.`,
  "Input devices": `Select an input device by considering the form of data, accuracy required and conditions of use. A barcode reader is efficient for repeated product codes, while a keyboard is better for entering a person's name. A microphone may capture speech, but background noise can reduce recognition accuracy. Before recording people, explain the purpose and obtain appropriate permission; before scanning a document, check that the resulting file is legible. The device transfers a signal, and software interprets it according to a format. If the wrong device or setting is selected, the system may receive incomplete or misleading data. Test the input with a small sample before relying on it for a larger task.`,
  "Output devices": `Output should suit both the information and its audience. A chart projected to a classroom needs large labels and strong contrast, while a printed receipt needs a clear date, amount and business identifier. A speaker may communicate an alert to a group, but a person with hearing loss may need a visual message as well. Check the output after it is produced: compare a printed total with the source record and confirm that a presentation is readable from the back of the room. Output devices present results; they do not guarantee that the results are accurate or accessible. Choose more than one form when the audience or task requires it.`,
  "Storage devices": `Choose storage by balancing capacity, speed, portability, durability and access control. A learner may keep an editable working copy on a laptop and a separate backup on approved school storage. If both copies remain on the same device, theft or hardware failure can remove them together. Cloud storage can support access from several locations, but requires a reliable connection and careful account security. Organise versions clearly and test that a backup can actually be opened; an unreadable copy is not useful recovery. Avoid saving private records to a shared public device. A storage plan should state what is kept, where it is backed up and who is allowed to access it.`,
  "Data and information": `Information is useful only when its context is clear. A list of marks without learner names, subject, date or maximum score cannot answer whether a class improved. Before calculating a mean, check that every value belongs to the same assessment and that missing entries are treated consistently. Validation can flag a mark above the maximum, but a plausible number may still have been entered for the wrong learner. Preserve the original record and note any corrections so another person can trace how the report was made. When presenting results, use labels and an explanation that answer a specific question without exposing personal data unnecessarily.`,
  "Number systems": `Binary place value works like decimal place value, but each position is a power of two. For 11010, the positions are 16, 8, 4, 2 and 1, so the value is 16 + 8 + 0 + 2 + 0 = 26. A binary digit is called a bit, and groups of eight bits form a byte. Hexadecimal is compact because one digit corresponds to four bits: binary 1010 is hexadecimal A. These are representations, not different kinds of information; text and images are encoded using agreed formats. Show the place values when converting so that a reader can check the calculation rather than relying on a memorised answer.`,
  "Computer software": `Software is selected for the task, device and licence conditions. A spreadsheet can calculate totals, but a database may be better for searching a large set of related records. Before installing a program, check that it comes from a trusted source, is compatible with the operating system and is permitted by its licence. Updates can add features or repair weaknesses; unsupported software may become unsafe. Applications also depend on system services such as memory, file access and device drivers. If an application cannot print, first check whether the operating system recognises the printer before assuming the document itself is damaged.`,
  "Operating systems": `The operating system coordinates work that applications need but do not manage alone. It allocates memory, schedules tasks, stores files and mediates access to devices. User accounts and permissions help prevent one person from changing another person's work. For example, a school computer may allow a learner to open a shared lesson document but prevent changes to system settings. Updates should be obtained through the device's trusted update service, and important work should be saved before restarting. When diagnosing a slow system, check running tasks and available storage before deleting files or changing security settings.`,
  "Files and folders": `A useful folder structure makes retrieval predictable for both the learner and a teacher. Group files by term or subject, use descriptive names and keep the latest version easy to identify. For example, “Biology_cell_diagram_2026-11-10” says more than “newfile2.” File extensions indicate formats such as .pdf or .docx, but changing the extension alone does not convert the file. Before moving or deleting a file, confirm that another required copy exists. On a shared computer, sign out of personal accounts and avoid storing sensitive information in a public folder. Good organisation reduces accidental loss and makes backups easier to check.`,
  "Word processing": `A well-prepared document separates content from styling. Use paragraph breaks to organise ideas, headings to signal sections and consistent styles to make navigation easier. Editing should begin with meaning and accuracy, then spelling and layout. Automatic spelling suggestions can miss a correctly spelled but incorrect word, such as “their” where “there” is needed. Save a working copy before major revisions and use a descriptive filename. Before submitting or printing, check page breaks, headers, dates and whether tables remain readable. A final read aloud can reveal awkward phrasing that a spell-checker cannot identify.`,
  "Formatting documents": `Formatting is a tool for communication, not a substitute for clear writing. A heading hierarchy helps readers locate sections, while consistent font size and spacing reduce visual effort. Colour should provide sufficient contrast and should not be the only way information is distinguished, since some readers may not perceive it. Use page numbers and captions when a document is long or contains figures. Review the document on the intended screen or paper size because a layout that looks balanced on one device may wrap badly elsewhere. Keep a copy of the original before applying extensive changes, then check that formatting has not hidden or removed important text.`,
  "Spreadsheets": `A spreadsheet should be designed so that another person can understand and check it. Put one type of value in each column, add clear headings and keep units visible. Use formulas rather than typing a result manually so that a changed input updates the calculation. Check the formula range: a total that omits the final row may look reasonable while being wrong. Test with a small set whose answer can be calculated by hand, then compare. Protect formula cells when several people edit a sheet, and do not include personal data unless it is necessary. A chart should be built from the intended cells and labelled with a title, category and units.`,
  "Formulas and charts": `Relative and absolute references solve different copying problems. If a formula in C2 multiplies a price in A2 by a rate in B2, copying it down should usually change row 2 to row 3. If one fixed rate is stored in F1, use an absolute reference such as $F$1 so it does not shift. After filling formulas, inspect more than the first result and test an edge case. For a chart, select only relevant cells, label the axes and include units. A truncated scale can exaggerate differences, so choose an axis range that represents the data honestly and explain any deliberate change from zero.`,
  "Presentation software": `Plan slides around the audience's questions. State one main idea per slide, use a visual only when it clarifies that idea and explain evidence in the speaker's own words. Large paragraphs encourage the audience to read instead of listen. Charts need readable axes and a source; images require permission or an appropriate licence and should not imply evidence they do not show. Rehearse the timing, test links and media on the presentation device and save a backup in an accessible format. If a slide contains sensitive information, remove it before sharing the deck. A useful presentation allows the audience to follow the reasoning, not just admire the layout.`,
  "Computer networks": `A network problem can occur at several points: a device may lack a wireless connection, a router may be offline, a name service may fail to locate a website, or the destination server may be unavailable. Test from the nearest connection outward and record the error rather than repeatedly changing settings. Bandwidth describes how much data can be transferred over time; latency describes delay. Many users streaming video can affect a school's available capacity. Network administrators also use passwords, updates and access controls to protect shared resources. Sharing a network does not mean every user should be able to open every file.`,
  "Internet and web": `A browser requests resources from web servers using web protocols, while the Internet provides the network paths that carry those requests. A domain name is easier to remember than a numerical address; DNS helps locate the corresponding server. HTTPS encrypts data in transit and helps confirm the site's identity, but a secure connection can still lead to an unreliable or fraudulent page. Check the domain spelling, publisher and evidence before entering information. A page may also use cookies or other tools to remember activity, so review privacy choices on shared devices. These distinctions help users understand both how a page loads and what its security indicators do not prove.`,
  "Search and information literacy": `A careful search begins with the question, not with the first result. Choose terms that name the topic and relevant date or location, then compare sources with different authors or purposes. Check whether a page cites original data, identifies its author and distinguishes evidence from opinion. For a numerical claim, trace it to the report or dataset and note how it was collected. Search rankings may be influenced by relevance, advertising and user settings, so position is not a quality certificate. Keep a record of source title, publisher and access date. In a report, paraphrase accurately and credit the source rather than copying text without attribution.`,
  "Email and online communication": `A professional message gives the recipient enough context to respond without exposing unnecessary information. Use a specific subject, greeting, short explanation and clear request. Check the recipient list before sending: CC is visible to other recipients, while BCC is suitable only when the hidden list is appropriate to the purpose. Attachments should have clear names and should not contain private information by mistake. Verify an unexpected payment or password request through a separate trusted channel instead of replying to the message. Keep a copy of important correspondence and write as though it may be forwarded. Respectful, precise communication reduces confusion and protects both sender and recipient.`,
  "Cyber safety": `A layered safety routine is more reliable than trusting one warning tool. Use unique passwords stored securely, enable multi-factor authentication, install updates from trusted sources and keep backups separate from the device. Phishing messages often create urgency, imitate familiar branding or direct users to a lookalike address. Hovering or inspecting a link can help, but on a phone it may be safer to navigate to the known official site independently. Never disclose a one-time code to a caller or message sender. If an account is compromised, use a trusted device to change credentials, report the incident and follow the service's recovery process.`,
  "Digital citizenship": `Online participation has an audience, record and impact. Before posting, ask whether the information is accurate, whether everyone shown agreed to share it and whether the post reveals a location or private detail. A message can be copied even after deletion, so do not rely on privacy settings alone. Disagreement should address claims rather than insult people. If harassment occurs, preserve relevant evidence, use reporting and blocking tools and seek help from a trusted adult. Do not respond by publishing the other person's details. Responsible digital citizenship includes protecting one's own rights while respecting the safety and dignity of others.`,
  "Computer viruses and malware": `Malware reaches devices through several routes, including unsafe downloads, compromised websites and infected attachments. A virus attaches to another file and may spread when that file runs; ransomware may block access to data, while spyware can collect information without permission. Security software helps detect known threats but cannot replace careful decisions or current updates. Keep important backups disconnected or protected from routine changes so that malware cannot alter every copy at once. If a device behaves suspiciously, stop entering passwords, notify the responsible administrator and follow approved response steps. Do not pay or install a tool advertised by an unexpected warning without expert guidance.`,
  "Data privacy": `Privacy protection begins before data is collected. Ask what information is necessary, how it will be used, who can see it and when it will be deleted. A school survey about study habits may not need home addresses or passwords. Restrict access, use secure storage and explain the purpose in language participants understand. Images can reveal identity through uniforms, backgrounds or location tags even when a name is omitted. Consent should be appropriate to the person's age and the sensitivity of the information. If data are shared accidentally, report the exposure promptly and follow the organisation's process rather than hiding the incident.`,
  "Algorithms and flowcharts": `Test an algorithm with ordinary values, boundary values and invalid input. If the pass condition is score >= 50, test 49 and 50 to make sure the boundary is correct; also consider an empty or out-of-range score. A flowchart should have a clear start, input, process, decision and outcome, with arrows that make every route traceable. If a decision has two branches, label them so a reader knows which condition is true. Trace a sample value through the diagram step by step. This reveals missing outputs, loops that never end or paths that do not reach an end point before code is written.`,
  "Programming concepts": `A program should be decomposed into small operations that can be tested independently. A function for calculating an average can receive a list of marks, return a result and handle an empty list deliberately. Selection handles different conditions, while iteration repeats work over a collection. Use meaningful variable names and comments only where they clarify a non-obvious choice. Test typical input, boundaries and invalid data, then compare the output with an independently calculated result. A program that runs without an error may still implement the wrong rule, so testing must check meaning as well as syntax.`,
  "Computer ethics": `Ethical analysis considers who benefits, who may be harmed and what choices are available. If an application collects location data, ask whether continuous tracking is necessary, whether users understand it and how access can be limited. Copyright and licence terms matter when copying software, images or text. Accessibility matters when a tool excludes users who need captions, keyboard navigation or clear contrast. A decision should be checked against law, school rules and respect for privacy, not just technical convenience. Explain the reasoning and choose the least intrusive option that still meets the legitimate need.`,
  "Practical computer project": `A project becomes testable when each requirement has an observable result. For a class inventory sheet, a requirement might be that every item has a unique code and a non-negative quantity. Create test data for a normal item, a duplicate code and an invalid quantity, then record whether the sheet handles each correctly. Ask a potential user to try the tool and note where instructions are unclear. Keep a versioned backup, document limitations and remove personal data that is not needed. A final report should connect the original need to the features built and the evidence gathered during testing.`,
};

const courseIds = new Set(["jss2-mathematics", "jss3-mathematics", "ss1-mathematics", "ss2-mathematics", "ss3-mathematics"]);
const computerIds = new Set(["jss2-computer-studies", "jss3-computer-studies", "ss1-computer-studies", "ss2-computer-studies", "ss3-computer-studies"]);
const curriculum = JSON.parse(await fs.readFile(curriculumPath, "utf8"));
let mathematicsLessons = 0;
let computerLessons = 0;
const missing = { Mathematics: new Set(), Computer: new Set() };

for (const course of curriculum.courses ?? []) {
  const subject = courseIds.has(course.id) ? "Mathematics" : computerIds.has(course.id) ? "Computer" : null;
  if (!subject) continue;
  const topics = subject === "Mathematics" ? mathematics : computerStudies;
  for (const module of course.modules ?? []) {
    for (const lesson of module.lessons ?? []) {
      const content = topics[lesson.title];
      if (!content) {
        if (
          subject === "Mathematics" &&
          String(lesson.content ?? "").includes("is treated as a mathematical idea that must be defined precisely")
        ) {
          missing[subject].add(lesson.title);
        }
        continue;
      }

      lesson.content = content;
      if (subject === "Computer") {
        const extension = computerStudyExtensions[lesson.title];
        if (!extension) {
          missing.Computer.add(lesson.title);
          continue;
        }
        lesson.content = `${content}\n\n${extension}`;
      }
      lesson.objective = subject === "Mathematics"
        ? `Use the definitions and worked relationships in ${lesson.title.toLowerCase()} to solve a problem and check the result.`
        : `Explain how ${lesson.title.toLowerCase()} works, apply it to a school task and identify one limitation or safety consideration.`;
      lesson.activity = content.split("\n\n").at(-1);
      lesson.summary = content.replace(/^#\s+.+\n+/, "").replace(/\s+/g, " ").trim().slice(0, 320);
      lesson.commonMistakes = subject === "Mathematics"
        ? ["Keep units and the meaning of each quantity visible; check the result against the question."]
        : ["Choose a tool or procedure for the task and verify the input, output and relevant safety or privacy conditions."];
      lesson.keyTerms = [lesson.title, subject === "Mathematics" ? "calculation" : "data", subject === "Mathematics" ? "unit" : "system"];
      if (subject === "Mathematics") mathematicsLessons += 1;
      else computerLessons += 1;
    }
  }
}

const shortComputerLessons = curriculum.courses
  .filter((course) => computerIds.has(course.id))
  .flatMap((course) => course.modules.flatMap((module) => module.lessons))
  .map((lesson) => ({ id: lesson.id, words: (String(lesson.content ?? "").match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []).length }))
  .filter((lesson) => lesson.words < 200);

if (mathematicsLessons !== 75 || computerLessons !== 135 || missing.Mathematics.size || missing.Computer.size || shortComputerLessons.length) {
  throw new Error(JSON.stringify({ mathematicsLessons, expectedMathematics: 75, computerLessons, expectedComputer: 135, shortComputerLessons, missing: { Mathematics: [...missing.Mathematics], Computer: [...missing.Computer] } }));
}

if (applyChanges) await fs.writeFile(curriculumPath, `${JSON.stringify(curriculum, null, 2)}\n`, "utf8");

console.log(JSON.stringify({ mode: applyChanges ? "apply" : "dry-run", mathematicsLessons, computerLessons }, null, 2));