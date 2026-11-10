import fs from "node:fs/promises";
import path from "node:path";

const file = path.resolve(process.cwd(), "data", "curriculum.json");
const applyChanges = process.argv.includes("--apply");

const economics = {
  "Meaning and scope of economics": `# Meaning and scope of economics

Economics studies how people and societies make choices when resources are limited and wants are many. It examines production, exchange, distribution and consumption. Microeconomics looks at choices by households and firms; macroeconomics studies economy-wide outcomes such as inflation, employment and national income. These levels connect: many household decisions can affect a whole market.

Suppose a school has funds for either a new library shelf or sports equipment. Economics asks what each option costs, who benefits and what must be given up. It does not prescribe one answer without values and evidence. A careful explanation identifies the decision-maker, the scarce resource, the alternatives and the likely consequences.`,
  "Basic economic problems": `# Basic economic problems

Scarcity means available resources cannot satisfy every want. Every society must decide what to produce, how to produce it and for whom output is produced. These questions arise because land, labour, capital, time and enterprise are limited. Different economic systems answer them through varying combinations of markets, public planning and community decisions.

A local council choosing between repairing a road and expanding a clinic faces a resource-allocation problem. The choice depends on need, cost, expected benefit and public priorities. The selected option uses resources that could have supported the other. Economic reasoning makes this trade-off explicit rather than pretending that every desirable project can be funded at once.`,
  "Opportunity cost": `# Opportunity cost

Opportunity cost is the value of the next-best alternative forgone when a choice is made. It is not the sum of every rejected option and is not always measured in money. If a student spends Saturday attending a lesson instead of working a paid shift, the forgone wage may be part of the opportunity cost, along with any other valued alternative.

A firm that uses a shop unit for a bakery cannot use that same unit for a phone-repair business at the same time. To identify opportunity cost, list feasible alternatives, select the best rejected one and state what value is lost. Sunk costs already incurred should not determine a new decision because they cannot be recovered.`,
  "Factors of production": `# Factors of production

The factors of production are land, labour, capital and enterprise. Land includes natural resources; labour is human effort; capital means produced inputs such as tools and buildings, not simply money; enterprise organises the other factors and bears business risk. Production usually combines all four rather than relying on one alone.

A small bread shop uses flour and water from land-based production, workers' time, ovens and mixers as capital, and the owner's planning as enterprise. The factors earn different forms of income: rent, wages, interest and profit. Classifying resources correctly helps explain how output is created and how income is distributed.`,
  "Division of labour": `# Division of labour

Division of labour breaks a production process into specialised tasks. Workers repeat or master particular operations, which can increase output, reduce the time lost switching tasks and make training more focused. Specialisation also creates dependence: if one stage stops, the whole process may slow down.

In a school uniform workshop, one worker may cut fabric, another sew seams and another inspect finished garments. Output may rise when each person practises a task, but repetitive work can become tiring and workers may lose a broader range of skills. A business should compare productivity gains with coordination, quality and worker wellbeing.`,
  "Production and productivity": `# Production and productivity

Production is the creation of goods or services that satisfy wants. Productivity measures output relative to the inputs used, such as units per worker-hour. More output does not always mean higher productivity: a firm may produce more only because it hired many additional workers or used more materials.

If four workers make 80 stools in a day, labour productivity is 20 stools per worker-day. A new layout that allows the same workers to make 96 stools raises productivity to 24 stools per worker-day, provided quality remains acceptable. Compare like with like and state the input measure; otherwise a productivity claim is incomplete.`,
  Demand: `# Demand

Demand is the quantity of a good or service consumers are willing and able to buy at different prices during a stated period. Wanting a product is not sufficient: the buyer must also have the means to purchase it. A demand schedule links prices with quantities, while a demand curve usually slopes downward because a lower price makes a product affordable to more buyers and may encourage existing buyers to purchase more.

For a market trader, a price change can alter how many bags of rice customers buy, but income, tastes, population, prices of substitutes and expectations can shift demand too. A change in the product's own price causes movement along the curve; a change in another determinant shifts the curve. Keep these two effects distinct when explaining market evidence.`,
  Supply: `# Supply

Supply is the quantity producers are willing and able to offer for sale at different prices over a stated period. A higher price can encourage firms to supply more if production is profitable, so the supply curve often slopes upward. Costs, technology, taxes, weather and the number of sellers can shift supply independently of the product's price.

If heavy rain damages tomato crops, sellers may bring fewer tomatoes to market at every price; supply shifts left. This differs from a price increase that causes movement along an unchanged curve. To explain a supply change, identify the determinant and connect it to firms' costs or capacity rather than merely restating that “supply changed.”`,
  "Price determination": `# Price determination

In a competitive market, price is influenced by the interaction of demand and supply. Equilibrium occurs where the quantity buyers plan to buy equals the quantity sellers plan to sell. At a price below equilibrium, a shortage may put upward pressure on price; above equilibrium, unsold stock may encourage sellers to lower it.

If market demand rises while supply stays the same, equilibrium price and quantity generally rise. If supply rises while demand stays the same, equilibrium price generally falls and quantity rises. These predictions assume other conditions remain unchanged. Real markets may adjust slowly because of contracts, transport delays or rules, so an equilibrium diagram is a model rather than a minute-by-minute description.`,
  Elasticity: `# Elasticity

Price elasticity of demand measures how responsive quantity demanded is to a percentage change in price: percentage change in quantity divided by percentage change in price. Demand is elastic when the absolute value exceeds one and inelastic when it is below one. The sign is usually negative because price and quantity demanded move in opposite directions.

If price rises by 10% and quantity demanded falls by 20%, elasticity is -2, so demand is elastic. When demand is elastic, a price rise tends to reduce total revenue; with inelastic demand, revenue may rise. Availability of substitutes, the share of income spent and time to adjust can affect responsiveness. Always state whether using the signed or absolute value.`,
  "Consumer behaviour": `# Consumer behaviour

Consumer behaviour studies how people choose among goods and services. A consumer's decision can depend on income, prices, preferences, information, habits and expectations. A budget constraint shows what combinations are affordable; a change in income or price changes the set of feasible choices.

A household comparing two brands of cooking oil may consider unit price, quality, package size and trust in the seller. The lowest sticker price is not necessarily the best value if quantities differ, so compare price per litre. Economic models simplify decisions, but actual consumers may have limited information or face social and practical constraints. Explain both the model and the assumptions used.`,
  "Market structures": `# Market structures

Market structures differ in the number and size of firms, product similarity, barriers to entry and ability to influence price. Perfect competition is a benchmark with many sellers and similar products. Monopoly describes one dominant supplier with high entry barriers; oligopoly has a few interdependent firms; monopolistic competition includes many firms selling differentiated products.

A few mobile-network providers may watch one another's prices and service plans, illustrating interdependence more than perfect competition. Structure affects consumer choice, innovation and pricing, but the label alone does not determine every outcome. Use evidence about firms, entry conditions and products before classifying a market.`,
  Money: `# Money

Money serves as a medium of exchange, a unit of account and a store of value; it can also support deferred payments. It avoids the difficulty of barter, where each trader must want what the other offers at the same time. Prices expressed in money make different goods easier to compare.

If a farmer sells produce for cash and uses the proceeds to buy school supplies, money separates the sale from the later purchase. Inflation can weaken money's store-of-value function because the same amount buys fewer goods over time. Currency, bank deposits and some digital payment balances can function as money when they are widely accepted and reliably transferable.`,
  Banking: `# Banking

Banks accept deposits, provide payment services and lend funds under financial regulation. A current account supports frequent transactions; a savings account is designed to hold funds and may pay interest. When a bank makes a loan, it assesses repayment capacity, charges interest and must manage the risk that a borrower defaults.

Deposits are not simply kept as labelled notes for each customer; banks manage pooled funds while meeting withdrawal and regulatory requirements. Customers should compare fees, interest terms, access and security before choosing an account. A bank statement helps reconcile recorded transactions, and a customer should report an unfamiliar transaction promptly through official channels.`,
  Inflation: `# Inflation

Inflation is a sustained increase in the general price level, not a rise in the price of just one item. A consumer price index tracks the prices of a selected basket over time. If the index rises from 100 to 112, the measured price level has increased by 12% over the comparison period, subject to the index's coverage and method.

Inflation reduces purchasing power when incomes do not rise as quickly as prices. It can affect borrowers, savers, workers and firms differently. Causes may include rising production costs, strong demand or disruptions to supply; the actual cause depends on evidence and context. Avoid using “inflation” to describe every expensive product or a temporary seasonal price change.`,
  Unemployment: `# Unemployment

Unemployment refers to people who are without work, available for work and actively seeking work under the statistical definition used. It is distinct from being outside the labour force, such as a full-time student not seeking a job. Measures vary, so a reported rate should be interpreted using its definition, survey period and population coverage.

Unemployment can result from a mismatch between available skills and vacancies, reduced demand, seasonal patterns or changes in industry. It affects household income and can leave skills unused. A policy response should match the cause: training may address skills mismatch, while broader demand support may be relevant during a downturn. One measure is unlikely to solve every form of unemployment.`,
  "National income": `# National income

National income accounting measures economic activity over a period. Gross domestic product (GDP) is the market value of final goods and services produced within a country's borders; gross national income adjusts for income flows between residents and the rest of the world. Nominal values use current prices, while real values adjust for price changes.

GDP per person divides output by population, but it does not show how income is distributed or measure every part of wellbeing. Unpaid household work and some informal activity may be difficult to capture. When comparing years or countries, check whether figures are real or nominal, total or per person, and whether exchange rates or purchasing power are relevant.`,
  "Economic growth": `# Economic growth

Economic growth is an increase in real output over time, commonly measured by the change in inflation-adjusted GDP. Growth can expand employment and income, but the benefits may be uneven and output growth alone does not show changes in health, education or environmental quality.

If real GDP rises from ₦100 billion to ₦105 billion, the growth rate is 5% for that period. Population growth matters when considering output per person: total output can rise while average output per person falls if population grows faster. Sustainable growth depends on productivity, investment, skills, infrastructure and institutions, as well as responsible use of resources.`,
  "Population and labour": `# Population and labour

Population size and age structure influence the supply of workers and the demand for goods and services. The labour force includes employed people and unemployed people who are actively seeking work under a stated definition. It excludes people not seeking or available for work, though they may contribute in other ways.

A growing working-age population can support production when education, jobs and health services prepare people to participate. If job creation lags, unemployment or underemployment may rise. Dependency ratios compare age groups but do not capture every person's actual economic activity. Use population and labour statistics with their dates, definitions and coverage before drawing conclusions.`,
  "Agriculture and industry": `# Agriculture and industry

Agriculture supplies food and raw materials; industry processes materials into manufactured goods and provides related services. The sectors depend on one another through inputs, workers, transport, finance and markets. A food-processing firm depends on farm output, while farmers depend on storage and buyers to reduce losses and reach consumers.

Productivity can rise through improved seeds, irrigation, machinery, skills or reliable electricity, but access and cost affect who benefits. Industrial expansion can add jobs and value while creating pollution or changing land use. Evaluate a development proposal by examining output, employment, distribution of benefits and environmental effects rather than assuming that growth in one sector automatically helps everyone.`,
  "Public finance": `# Public finance

Public finance concerns how government raises revenue, allocates spending and manages borrowing. Taxes fund public services and infrastructure; government expenditure can also support demand and redistribute resources. A budget sets out planned revenue and spending for a period, while actual results may differ from the plan.

A budget deficit occurs when spending exceeds revenue during the period; a surplus occurs when revenue exceeds spending. Borrowing can fund investment or respond to a crisis, but debt creates future repayment and interest obligations. To assess a budget, examine its assumptions, priorities, funding source and expected effects on different groups. A deficit is not automatically harmful or harmless without context.`,
  Taxation: `# Taxation

Taxation is compulsory revenue collected by public authorities under law to fund public responsibilities. Direct taxes are charged on income or profits; indirect taxes are charged on spending or transactions. A progressive tax takes a larger share of income as income rises, while a proportional tax applies the same rate; a regressive tax takes a larger share from lower incomes relative to their resources.

Tax incidence describes who ultimately bears a tax, which may differ from the person who remits it. A seller may pass part of a sales tax to buyers through higher prices, depending on demand and supply responsiveness. Tax design involves revenue, fairness, efficiency and administration. Use the actual tax rule and relevant rates when calculating a liability.`,
  "International trade": `# International trade

International trade is the exchange of goods and services across national borders. Countries trade because resources, skills, costs and consumer preferences differ. Exports are sold abroad; imports are purchased from other countries. Trade can widen consumer choice and markets for producers while exposing firms to foreign competition and changes in world prices.

Comparative advantage concerns producing a good at a lower opportunity cost, not necessarily having the highest output per worker. A country can gain from specialising where its relative cost is lower and trading for other goods. Trade policy may use tariffs, quotas or standards, each with effects on prices, producers, consumers and government revenue. Evaluate those effects rather than treating trade as automatically beneficial or harmful.`,
  "Balance of payments": `# Balance of payments

The balance of payments is a systematic record of transactions between residents of a country and the rest of the world over a period. The current account records trade in goods and services, primary income and transfers. The capital and financial accounts record capital transfers and financial flows, subject to the country's accounting presentation.

An import payment is a debit in the relevant current-account category; an export receipt is a credit. The accounts balance overall through accounting entries, although individual sections can show a surplus or deficit. A current-account deficit is not automatically a crisis: its financing, composition and sustainability matter. Avoid confusing the balance of payments with a government budget.`,
  "Economic development": `# Economic development

Economic development is broader than an increase in output. It includes improvements in living standards, health, education, opportunity, economic security and the distribution of resources. GDP growth can support development, but its effect depends on who receives income and whether public services and productive capacity improve.

Indicators such as life expectancy, school participation, poverty measures and access to clean water reveal dimensions GDP alone misses. Each indicator has limitations and should be interpreted alongside others. A development project can increase production while displacing a community or damaging a watershed, so assess both benefits and costs over time. Define the outcome being measured before claiming that a policy has succeeded.`,
  "Nigerian economy": `# Nigerian economy

Nigeria's economy includes agriculture, industry and a large service sector, alongside substantial informal activity. Oil and gas are important sources of export earnings and public revenue, but the economy also depends on farming, manufacturing, trade, transport, communications and professional services. Sector shares and conditions change over time, so use dated official statistics for numerical claims.

Economic challenges such as inflation, unemployment, infrastructure gaps and exchange-rate changes interact. For example, higher transport and energy costs can affect food prices and business output. A sound analysis identifies the mechanism, the affected groups and the evidence rather than treating a single sector as the whole economy. Compare policy options by their likely costs, timing and distributional effects.`,
  "Economic policy project": `# Economic policy project

An economic policy project investigates a defined problem and evaluates possible responses. Start with a question that can be answered using evidence, such as how transport costs affect a local market. Identify data sources, affected groups and the economic concepts that help explain the issue. Distinguish observed facts from assumptions and recommendations.

Compare at least two policy options by considering objectives, costs, incentives, timing and who gains or bears costs. A recommendation should follow from the evidence and acknowledge uncertainty. Record source dates and methods, especially for statistics. A concise report should include the question, analysis, comparison, conclusion and one limitation; confident wording cannot make weak evidence stronger.`,
};

const economicsExtensions = {
  "Meaning and scope of economics": `A school can use economics to examine a limited budget: it cannot fund every useful activity at once, so it must compare alternatives. Positive statements describe what is, such as a measured rise in food prices; normative statements express what ought to happen, such as a proposal to subsidise food. Keep these categories distinct when analysing policy. A good explanation identifies the decision-maker, the scarce resource, the available choices and the evidence used to compare them. Economics does not provide a value-free answer to every public question, but it makes assumptions and trade-offs visible.`,
  "Basic economic problems": `The questions of what to produce, how to produce and for whom to produce apply to households, firms and governments. A bakery chooses which products to make, what equipment and labour to use, and which customers can afford the price. Each answer reflects resources, technology, costs and priorities. A change in one decision can affect the others: a more automated method may increase output but require investment and different worker skills. Use a specific example to identify the choices and the groups affected. The questions do not have one universal answer because resources and social goals differ.`,
  "Opportunity cost": `Opportunity cost is the value of the next best alternative given up, not the sum of every rejected option. If a learner spends Saturday at a paid job instead of attending a free revision class, the relevant cost includes the learning opportunity forgone as well as any direct expense. Some costs are difficult to express in money, but they still matter to the decision. Compare realistic alternatives and consider the decision-maker's goal. Once a choice is made, the opportunity cost remains a useful way to review whether scarce time or funds were used as intended.`,
  "Factors of production": `Land, labour, capital and enterprise are used together to produce goods and services. A farm uses land and water, workers provide labour, tools and irrigation equipment are capital, and the entrepreneur organises production and accepts risk. Capital in economics means produced assets used to make other goods; it does not simply mean money. The factors can be complementary, so a shortage of one may limit the value of the others. When analysing output, identify which factor is scarce and whether it can be substituted, trained or used more productively.`,
  "Division of labour": `Division of labour assigns different stages of production to different workers or teams. In a bakery, one person may mix dough while another shapes loaves and a third manages the oven. Repetition can increase speed and skill, but narrow tasks may become monotonous and production can stop if one stage fails. Specialisation also makes workers and firms more dependent on exchange with others. Evaluate both productivity and working conditions, and explain how coordination, training and equipment affect whether specialisation improves the final output.`,
  "Production and productivity": `Production transforms inputs into goods or services, while productivity compares output with the inputs used. If a workshop makes 120 chairs with 12 workers in a week, labour productivity is 10 chairs per worker for that period; it does not measure product quality by itself. Better tools, training or work organisation may raise productivity, though investment has a cost. Compare like periods and consistent output measures. A rise in total production can occur simply because more workers were hired, so distinguish increased scale from improved productivity.`,
  Demand: `A demand schedule records quantities consumers are willing and able to buy at different prices over a period. Willingness without purchasing power is not effective demand. If the price of a substitute falls, demand for the original product may shift; a change in the product's own price causes movement along its demand curve. Separate these causes when explaining market change. A survey of stated preferences may not match actual purchases, so compare reported interest with sales or other evidence. State the time period and market being examined.`,
  Supply: `A supply schedule records quantities producers are willing and able to offer at different prices during a period. Production costs, technology, weather, taxes and the number of firms can shift supply. For example, a rise in fertiliser cost may reduce the quantity farmers offer at each price, while improved storage can allow more produce to reach the market. A change in the good's own price is shown as movement along the curve. Explain the specific factor that changed and avoid treating every increase in quantity supplied as a shift.`,
  "Price determination": `Market price is influenced by buyers' demand and sellers' supply. At an equilibrium price, the quantity demanded equals the quantity supplied for the defined market and period. If a price is held below that level, buyers may want more than sellers offer, creating a shortage; a price above it may leave unsold stock. Actual markets can adjust slowly because of contracts, transport delays or regulation. Use a supply-and-demand diagram to show the direction of change, then identify assumptions and local conditions that may prevent an immediate adjustment.`,
  Elasticity: `Price elasticity of demand measures the percentage change in quantity demanded relative to the percentage change in price. A product with close substitutes may have more elastic demand than a necessity with few alternatives, but the result depends on the time period and market definition. If demand is inelastic, a price rise can increase total revenue; if demand is elastic, it can reduce revenue. Calculate with percentage changes and state the interpretation. Do not infer elasticity from a single price observation, because other factors may have changed at the same time.`,
  "Consumer behaviour": `Consumer choice is shaped by income, prices, preferences, information and the availability of alternatives. A household may choose a cheaper staple when transport costs rise, even if its preference has not changed. A budget constraint shows which combinations are affordable, while observed purchases reveal choices under actual conditions. Do not assume that every consumer has the same information or freedom to choose. When examining a purchase, identify the person's goal, constraint and alternatives, and distinguish a personal preference from a general claim about all consumers.`,
  "Market structures": `Market structures differ in the number and size of firms, product similarity, barriers to entry and ability to influence price. A local market may not fit a textbook model perfectly, so use evidence about competitors, costs and consumer options. More competition can encourage lower prices or innovation, but outcomes also depend on quality, access and regulation. Identify the relevant market before classifying it; a firm may face many competitors in one product and few in another. Explain how the structure affects the choices available to buyers and sellers.`,
  Money: `Money serves as a medium of exchange, a unit of account and a store of value. It avoids the need for a direct barter match: a farmer can sell produce for money and later buy tools from a different seller. Money's usefulness depends on trust and acceptance, while inflation can reduce the purchasing power of stored cash. Compare money with barter using a real exchange and explain which function matters. Distinguish currency from wealth: an asset may have value without being a generally accepted means of payment.`,
  Banking: `Banks accept deposits, process payments and may lend to households and businesses under regulatory requirements. A deposit account can support saving and transactions, while a loan creates a repayment obligation and may include interest and fees. Compare account terms, access, security and charges before choosing a service. Banks manage pooled funds and must balance lending with withdrawals and risk; deposits are not simply kept as labelled notes for each customer. A bank statement helps reconcile activity, and an unfamiliar transaction should be reported promptly through an official channel.`,
  Inflation: `Inflation is a sustained increase in the general price level, which reduces what a unit of money can buy over time. One product becoming more expensive is not enough to establish economy-wide inflation. A price index tracks a selected basket, so its result depends on the goods, weights and period used. Inflation affects households differently: people with fixed incomes may lose purchasing power, while borrowers or workers with changing incomes may experience different effects. Use dated data and distinguish the inflation rate from the price level itself.`,
  Unemployment: `The unemployment rate usually compares people who are without work, available and actively seeking work with the labour force, according to the measure used. It does not include every person without a job; students, caregivers and discouraged workers may be classified differently. Separate cyclical, structural and frictional explanations because they suggest different responses. Training may address a skills mismatch but cannot alone create enough vacancies when demand is weak. Interpret survey definitions and dates before comparing rates across places or periods.`,
  "National income": `National income accounts measure economic activity over a period using defined methods. Gross domestic product measures final output produced within a country's borders, while gross national income adjusts for income flows between residents and the rest of the world. Nominal values use current prices; real measures adjust for price changes. Per-person averages can hide inequality and do not describe unpaid work or every aspect of wellbeing. State the measure, period and price basis, then explain what conclusion the statistic can and cannot support.`,
  "Economic growth": `Economic growth is an increase in real output over time, commonly measured using inflation-adjusted GDP. Compare the same periods and check whether population growth changes output per person. Growth can expand employment and revenue, but the gains may be uneven and environmental costs can reduce wellbeing. Productivity, investment, skills and stable institutions can influence long-run growth, while short-term demand changes also matter. Explain the mechanism behind a proposed cause rather than treating correlation as proof. Growth is one economic objective, not a complete measure of development.`,
  "Population and labour": `Population size and age structure affect the number of people available to work and the demand for services. The labour force depends on participation as well as total population; working-age people who are not seeking work may not be counted as employed or unemployed. Migration can change skills and local labour supply, while education and health influence productivity. Use current data and clear definitions when comparing regions. A large population creates opportunities and planning responsibilities, but it is not automatically an economic advantage or burden.`,
  "Agriculture and industry": `Agriculture and industry connect through inputs, processing, transport and markets. A food processor depends on reliable farm supply, while farmers depend on storage, equipment and buyers. Investment in roads or cold storage can reduce losses, but its benefits depend on who can access it and how costs are shared. Compare output and employment across stages rather than describing sectors as isolated. Consider seasonal risks, environmental effects and price changes when assessing a policy that links farming with manufacturing.`,
  "Public finance": `Public finance examines government revenue, expenditure and borrowing. A budget sets priorities and constraints for a stated period; compare planned allocations with actual spending and service outcomes. Borrowing can fund long-lived infrastructure or respond to a crisis, but creates future interest and repayment obligations. A deficit is not automatically harmful, and a surplus is not automatically evidence of good public services. Assess the purpose, financing, timing and distribution of costs. Use official budget documents and distinguish a proposal from an enacted appropriation.`,
  Taxation: `Tax incidence concerns who ultimately bears a tax, which can differ from the person who submits payment to government. A seller facing a new charge may pass some cost to buyers, depending on competition and how responsive demand is. Evaluate taxes by considering revenue, fairness, efficiency and administration together. A rate calculation should use the correct tax base and applicable rule; do not assume a headline rate applies to every transaction. Compare the effects on different income groups and explain the evidence behind the conclusion.`,
  "International trade": `Trade affects households and firms through prices, product choice, jobs and access to markets. Comparative advantage is based on opportunity cost: a country may benefit by specialising in a good it produces at a lower relative cost, even if another country is more productive in every good. Trade barriers can protect some producers but raise costs for consumers and downstream businesses. Use a specific product chain to identify winners, costs and adjustment needs. The outcome depends on exchange rates, transport, standards and the ability of workers to move between activities.`,
  "Balance of payments": `The balance of payments records transactions between residents and the rest of the world over a period, using consistent accounting conventions. Export revenue and import payments enter the relevant trade categories; investment income and transfers are recorded separately. A current-account deficit must be considered alongside its financing, composition and persistence. It is not the same as a government budget deficit. When interpreting a report, identify the account, sign convention and period, and avoid declaring a crisis from one number without evidence about reserves and financial flows.`,
  "Economic development": `Development includes changes in health, education, opportunity, security and living standards as well as output. A project may raise measured production but displace residents or damage water sources, so assess outcomes across groups and over time. Indicators such as school participation and life expectancy add context, though each has limits. Define the goal before judging success and compare results with a baseline. A careful recommendation explains who benefits, who bears costs and what evidence remains uncertain.`,
  "Nigerian economy": `Nigeria's sectors are linked: changes in oil revenue can affect public budgets and foreign exchange, while transport and energy costs influence farms, manufacturers and service firms. Use official, dated statistics and name the indicator before making a numerical claim. Inflation, unemployment and exchange-rate movements can affect households differently by income and location. A balanced analysis traces a mechanism from cause to outcome and considers policy trade-offs. Avoid treating one export, region or sector as a complete description of the economy.`,
  "Economic policy project": `A strong policy project defines its population, location and period before collecting evidence. Use official statistics where available, explain how interviews or observations were selected and protect participants' private information. Compare at least two responses using consistent criteria such as cost, time, effectiveness and distribution. Separate a finding from a recommendation, and acknowledge evidence that does not fit the preferred explanation. A conclusion should answer the research question and identify what further information would improve the decision.`,
};

const economicsFollowUps = {
  "Factors of production": `Ask whether the factors can be combined differently without lowering quality. A change in one input may alter both costs and the skills workers need.`,
  "Division of labour": `The method works best when tasks are coordinated and workers can learn more than one operation. Consider how a delay at one stage affects the whole production line.`,
  "Production and productivity": `When comparing two periods, check that the product quality and working hours are comparable. A higher output per worker is not automatically a higher wage or profit.`,
  "Consumer behaviour": `Preferences can be influenced by advertising and incomplete information. A sound explanation states what the consumer knows and which alternatives are actually affordable.`,
  "Market structures": `Barriers such as start-up costs or exclusive access can limit new competitors. Look for evidence about entry before concluding that a market is competitive.`,
  Money: `If prices rise quickly, sellers may need to update labels more often and households may spend income sooner. This illustrates why stable purchasing power matters.`,
  Banking: `Borrowers should compare the total repayment, not only the advertised interest rate. Late fees and repayment timing can change the real cost of credit.`,
  Unemployment: `A survey must define the age range and reference period before its rate can be interpreted. Compare like measures rather than unrelated headline percentages.`,
  "National income": `A large increase in aggregate output can coexist with hardship if income is concentrated. Pair national totals with measures of distribution and access to services.`,
  "Economic growth": `A useful comparison checks both the real growth rate and population change. Also note whether the increase came from one temporary price or output change.`,
  "Population and labour": `A demographic change affects the economy through participation, skills and dependency, not simply through the number of residents. Use age-group evidence to explain the link.`,
  "Agriculture and industry": `Reliable storage can connect seasonal harvests to factories operating throughout the year. Evaluate who pays for that infrastructure and who can use it.`,
  "Public finance": `Citizens can compare an approved allocation with actual releases and completed services. State the budget year, because spending figures from different periods are not directly interchangeable.`,
  "Economic development": `A change should be measured against a baseline and checked after implementation. Report both intended results and unexpected effects on communities or the environment.`,
  "Nigerian economy": `When using statistics, cite the source and publication period and check whether figures are nominal or adjusted for prices. This prevents misleading comparisons.`,
  "Economic policy project": `A clear table can compare options by cost, time and affected groups. Explain why the selected criteria fit the research question and note missing evidence.`,
};

const accounting = {
  "Meaning and purpose of accounting": `# Meaning and purpose of accounting

Accounting identifies, records, classifies, summarises and communicates financial information. It helps owners assess performance, managers plan cash needs, lenders judge repayment risk and public authorities calculate taxes. Bookkeeping records transactions; accounting also interprets the resulting reports for decisions.

When a shop sells goods for cash, the transaction changes cash and sales income. A receipt provides evidence, and the record should include the date, amount and nature of the sale. Reliable accounting depends on complete source records and consistent rules. It does not guarantee that a business will succeed, but it makes financial choices more informed and allows records to be checked.`,
  "Users of accounting information": `# Users of accounting information

Users of accounting information have different questions. Owners may ask whether profit is improving; managers need budgets and stock data; banks examine repayment capacity; suppliers may assess whether invoices will be paid; employees may consider business stability; tax authorities check statutory obligations. Financial statements serve several users, while management reports can be prepared for internal decisions.

A lender may focus on cash flow and debt, whereas an owner may compare return on investment. One report cannot answer every question, and users should understand the period, accounting policies and limitations. Information should be relevant, reliable and timely. Identify the user's decision before choosing which figures to analyse.`,
  "Accounting concepts": `# Accounting concepts

Accounting concepts guide how transactions are recorded. The business entity concept separates a business's records from the owner's personal spending. The going-concern assumption treats the business as continuing unless evidence suggests otherwise. The accrual basis records income when earned and expenses when incurred, not only when cash changes hands.

If an owner pays a personal electricity bill from the business account, it is drawings rather than a business expense. If rent for December is unpaid at year-end, the expense still belongs to December under accrual accounting. These concepts make statements comparable and prevent cash timing from hiding the real performance of a period.`,
  "Accounting equation": `# Accounting equation

The accounting equation is Assets = Capital + Liabilities. Assets are resources controlled by the business; liabilities are obligations to outsiders; capital represents the owner's residual interest. Every transaction keeps the equation balanced because it changes at least two related elements.

If an owner starts a shop with ₦50,000 cash, assets and capital each rise by ₦50,000. Buying shelves for ₦12,000 cash changes the form of assets but not their total. Buying goods on credit for ₦8,000 increases inventory and liabilities by the same amount. After each transaction, check that total assets equal capital plus liabilities.`,
  "Double-entry principle": `# Double-entry principle

Double-entry accounting records each transaction in at least two accounts, with total debits equal to total credits. The entries reflect the transaction's effect, not a rule that debit always means increase or credit always means decrease. Asset and expense accounts normally increase by debits; liability, capital and income accounts normally increase by credits.

When a business pays ₦5,000 cash for stationery, debit stationery expense and credit cash. When it sells goods for cash, debit cash and credit sales. Naming the accounts first helps avoid memorising entries without understanding them. The equality of debits and credits is a useful arithmetic check, but it does not prove that the correct accounts were chosen.`,
  "Source documents": `# Source documents

Source documents provide evidence for accounting entries. Invoices record credit sales or purchases, receipts acknowledge payment, credit notes adjust amounts, bank statements list account transactions and cheque counterfoils record payments issued. The document type depends on the transaction and the business's control procedures.

Before recording an entry, check the date, parties, description, amount and authorisation. A supplier invoice for ₦24,000 of goods bought on credit supports a purchases or inventory entry and a payable. Numbering documents and filing them systematically makes later verification easier. An entry without reliable evidence is difficult to audit and may be incorrect or fraudulent.`,
  "Books of original entry": `# Books of original entry

Books of original entry record transactions first, usually grouped by type. The sales day book records credit sales of goods; the purchases day book records credit purchases; the cash book records cash and bank movements; returns books record goods returned. Cash sales are entered in the cash book rather than the sales day book.

If a business sells goods on credit to Amina Stores, the sales invoice is entered in the sales day book and later posted to the customer's account and sales account. Classification at the first entry determines whether later totals are meaningful. Check that the book's purpose matches the transaction and that each entry has a source document.`,
  "Cash book": `# Cash book

The cash book records money received and paid through cash and bank. A two-column cash book may include cash and bank columns; a three-column version can also record discounts allowed and received. Receipts are entered on the debit side and payments on the credit side. A contra entry transfers money between cash and bank and is marked in both columns.

If ₦10,000 is deposited from cash into the bank, bank increases and cash decreases; the transaction appears on both sides of the cash book. Balance the columns at the period end and carry down the balances. Compare the bank column with the bank statement, allowing for timing differences and bank-originated entries.`,
  "Petty cash book": `# Petty cash book

A petty cash book records small, frequent payments such as bus fares, postage or minor stationery. Under the imprest system, the petty cashier receives a fixed float, makes supported payments and is reimbursed for the amount spent so the float returns to its agreed level.

With an imprest of ₦20,000, receipts total ₦13,500 during the week. The reimbursement is ₦13,500, restoring the fund to ₦20,000. Analyse receipts into expense columns so totals can be posted efficiently. A voucher should show the date, purpose, amount and approval. The imprest system makes unexplained shortages easier to identify than an undocumented cash tin.`,
  "Ledger accounts": `# Ledger accounts

Ledger accounts collect entries relating to one asset, liability, income, expense or person's account. Transactions are posted from books of original entry to the relevant ledger accounts. The debit and credit sides record opposite aspects of a transaction; balancing an account shows the net position at a date.

When a customer pays ₦7,000 owed, debit cash and credit the customer's personal account. The customer account now shows a lower receivable. Use dates and cross-references so a reviewer can trace an entry back to its source. A ledger total should agree with the corresponding control account or schedule when the records are complete.`,
  "Trial balance": `# Trial balance

A trial balance lists ledger balances at a particular date, with debit balances in one column and credit balances in another. If the double entries have been posted and balanced correctly, the column totals should agree. Agreement is a useful arithmetic check, but it does not prove that every transaction is recorded or classified correctly.

An omitted transaction, an error of principle or equal errors on both sides may leave the trial balance balanced. If totals differ, check additions, balance transfers and whether an amount was entered on the wrong side. Once the trial balance is prepared, adjustments such as accruals and depreciation may be needed before final accounts are produced.`,
  "Errors and corrections": `# Errors and corrections

Accounting errors include omission, commission, principle, original-entry and compensating errors. Some affect the trial balance; others do not. Posting a purchase of equipment to repairs expense is an error of principle, while entering ₦540 as ₦450 is an error of original entry. The correction should preserve an audit trail rather than erase the original record.

If an amount is posted to the wrong account, identify the intended account, the account actually used and whether the debit-credit total changed. A suspense account may temporarily hold a trial-balance difference, but it is not a permanent solution. Correcting entries should be supported, authorised and explained.`,
  "Bank reconciliation": `# Bank reconciliation

A bank reconciliation explains the difference between the bank balance in the cash book and the balance on the bank statement at the same date. Timing differences include unpresented cheques and deposits not yet credited. Bank charges, direct debits, interest and dishonoured cheques may appear on the statement before the business records them.

First update the cash book for items known from the statement, then reconcile the adjusted cash-book balance to the statement balance using timing differences. For example, an unpresented cheque reduces the cash-book balance but not yet the bank statement. Do not treat every difference as an error; identify its cause and verify it against documents.`,
  Depreciation: `# Depreciation

Depreciation allocates the depreciable cost of a long-term asset over its useful life. It reflects use, time or obsolescence; it is not a direct measurement of an asset's market value and does not create cash. Under the straight-line method, annual depreciation = (cost - residual value) / useful life.

A machine costing ₦120,000 with a residual value of ₦20,000 and a five-year useful life has annual straight-line depreciation of ₦20,000. The entry debits depreciation expense and credits accumulated depreciation. Consistent estimates and disclosure matter because changing useful life or residual value changes reported profit and carrying amount.`,
  "Accruals and prepayments": `# Accruals and prepayments

Accruals and prepayments apply the matching principle by recording expenses in the period they relate to. An accrued expense has been incurred but not yet paid; a prepayment has been paid but partly relates to a future period. Income can also be accrued or received in advance.

If annual insurance of ₦12,000 is paid on 1 October and the year ends on 31 December, ₦3,000 is an expense for three months and ₦9,000 is a prepayment for the remaining nine months. An unpaid December electricity bill is an accrued expense. Adjustments prevent cash timing from overstating or understating a period's profit.`,
  "Inventory valuation": `# Inventory valuation

Inventory is measured at the lower of cost and net realisable value under common accounting standards. Cost includes purchase and directly attributable costs needed to bring items to their present location and condition. Net realisable value is the estimated selling price less costs to complete and sell.

If goods cost ₦10,000 but can now be sold for ₦9,200 after ₦500 selling costs, net realisable value is ₦8,700, so the inventory is written down to ₦8,700. FIFO and weighted average are common cost formulas; the method affects cost of sales and closing inventory when purchase prices change. State the method and apply it consistently.`,
  "Final accounts": `# Final accounts

Final accounts summarise a business's performance and financial position for a period. A trading account calculates gross profit from sales and cost of goods sold; an income statement includes other income and expenses to determine profit; a statement of financial position lists assets, liabilities and equity at a date. Adjustments are made before these statements are prepared.

If net sales are ₦180,000 and cost of goods sold is ₦112,000, gross profit is ₦68,000. Deduct operating expenses to find profit for the period. Closing inventory appears in the cost-of-sales calculation and as a current asset. Check cross-references and ensure each balance is classified in the correct statement.`,
  "Trading account": `# Trading account

A trading account calculates gross profit or gross loss from buying and selling goods. Net sales equal sales less returns inward. Cost of goods sold is opening inventory plus net purchases and direct costs less closing inventory. Gross profit is net sales minus cost of goods sold.

If opening inventory is ₦20,000, net purchases ₦75,000, carriage inward ₦5,000 and closing inventory ₦18,000, cost of goods sold is ₦82,000. With net sales of ₦110,000, gross profit is ₦28,000. Carriage outward is a selling expense, not a direct cost of bringing goods into the business.`,
  "Profit and loss account": `# Profit and loss account

The profit and loss account, or income statement, starts with gross profit and includes other income and operating expenses to determine net profit or loss. Expenses are matched to the period they help generate income, including adjustments for accruals, prepayments and depreciation.

If gross profit is ₦28,000, commission received is ₦2,000 and expenses total ₦19,500, net profit is ₦10,500. Drawings are not an expense because they are a withdrawal of owner capital. Classify each item before calculating; an arithmetic total cannot correct a wrong classification.`,
  "Balance sheet": `# Balance sheet

A balance sheet, now commonly called a statement of financial position, reports assets, liabilities and equity at a particular date. Current assets are expected to be realised or used in the operating cycle; non-current assets support operations over a longer period. Current and non-current liabilities are classified according to settlement timing and applicable rules.

The accounting equation must hold: assets = equity + liabilities. If a business has assets of ₦240,000 and liabilities of ₦90,000, equity is ₦150,000. The statement describes a position at one date, not profit over a period. Compare it with prior periods and supporting notes to understand changes and measurement policies.`,
  "Manufacturing accounts": `# Manufacturing accounts

A manufacturing account calculates the cost of goods produced during a period. Direct materials, direct labour and direct production expenses form prime cost. Add factory overheads and adjust work in progress to calculate cost of production. Administrative and selling expenses are not factory costs.

If prime cost is ₦80,000, factory overhead is ₦24,000, opening work in progress ₦6,000 and closing work in progress ₦10,000, cost of production is ₦100,000. The closing work in progress is deducted because that production is unfinished. The cost of production is then transferred to the trading account as part of goods available for sale.`,
  "Partnership accounts": `# Partnership accounts

A partnership is a business owned by two or more partners under an agreed arrangement. The partnership agreement should state capital contributions, profit-sharing ratios, drawings, salaries or interest on capital where applicable. Profit is shared according to the agreement, not automatically in proportion to capital.

If partners share profit 3:2 and the distributable profit is ₦100,000, their shares are ₦60,000 and ₦40,000. A profit appropriation account shows how profit is allocated after any agreed adjustments. Keep partners' capital and current accounts distinct so permanent contributions are not confused with drawings or annual allocations.`,
  "Company accounts": `# Company accounts

A company is a separate legal entity from its shareholders. Share capital represents funds contributed for ownership shares; retained earnings are accumulated profits not distributed. A dividend is a distribution to shareholders and is not an operating expense used to calculate profit.

If a company earns profit after tax of ₦500,000 and declares a dividend of ₦120,000, retained earnings increase by the undistributed amount, subject to other movements and legal requirements. Company accounts follow statutory reporting and disclosure rules. Distinguish issued share capital, liabilities and reserves when reading a statement of financial position.`,
  "Cash-flow information": `# Cash-flow information

A cash-flow statement explains cash and cash-equivalent movements during a period, grouped into operating, investing and financing activities. Profit is not the same as cash flow because credit sales, non-cash expenses and timing differences affect when cash moves.

A credit sale can increase revenue and profit before the customer pays; depreciation reduces profit but does not use cash in that period. Cash-flow information helps assess whether a business can pay suppliers, invest and meet loan obligations. Reconcile the opening cash balance to the closing balance and explain material movements rather than relying on profit alone.`,
  "Accounting ratios": `# Accounting ratios

Accounting ratios compare related figures to assess profitability, liquidity, efficiency or solvency. The current ratio is current assets divided by current liabilities. Gross-profit margin is gross profit divided by revenue, multiplied by 100. Ratios are meaningful when calculated consistently and compared with prior periods, plans or relevant organisations.

If current assets are ₦90,000 and current liabilities are ₦45,000, the current ratio is 2:1. This does not by itself prove the business is healthy: inventory may be slow-moving and debts may fall due soon. Read ratios alongside the underlying statements and business context. State the formula, units or percentage and what the result can and cannot show.`,
  "Computerized accounting": `# Computerized accounting

Computerized accounting uses software to record transactions, post entries and prepare reports. A chart of accounts defines categories; each transaction is entered with a date, amount, account and supporting document. The software can automate calculations, but incorrect input or setup can still produce misleading reports.

Access controls, backups, audit trails and regular reconciliations protect the records. Restrict permissions according to each user's responsibilities, and do not share passwords. Before relying on a report, check the period, account mapping and whether all transactions were entered. Automation improves speed and consistency only when the underlying data and procedures are sound.`,
  "Accounting project": `# Accounting project

An accounting project applies recording and analysis to a small, realistic entity. Define the period and scope, obtain permission to use records, and protect personal or commercially sensitive information. Collect source documents, classify transactions, record entries and check that debits equal credits before preparing a trial balance or statements.

Explain the accounting policies and any estimates used, such as depreciation or inventory valuation. Reconcile important balances and note limitations, including missing documents or incomplete periods. Present findings clearly and avoid claiming that a sample proves more than it can. A good project is traceable: a reader can follow each conclusion back to evidence.`,
};

const accountingExtensions = {
  "Meaning and purpose of accounting": `A small shop can use a daily sales record to compare cash received with receipts and stock movement. If totals disagree, the owner should investigate the source documents before changing the books. This shows why accounting is a system of evidence, not simply arithmetic. Reports depend on consistent definitions and a clear period. A reader should ask whether the figures are complete, who prepared them and what decision they can support. Accounting can reveal patterns and obligations, but it cannot guarantee future sales or remove the need for judgement.`,
  "Users of accounting information": `Suppose a business reports a profit but cannot pay a supplier on time. The owner may investigate cash collection, while the supplier focuses on payment history and the bank reviews cash flow and debt. Each user has a different decision, so one figure cannot answer every question. Identify the user first, then select relevant information and note its period and limitations. Financial statements summarise recorded transactions; they are not a promise that the organisation will remain profitable or liquid.`,
  "Accounting concepts": `Consistency allows meaningful comparison across periods, while prudence asks for caution when estimates are uncertain. The business entity concept separates business transactions from the owner's personal spending, and the going-concern assumption supports continued-use measurements unless evidence suggests otherwise. Concepts guide preparation but do not replace accounting standards or professional judgement. When a case appears to involve competing principles, state the facts, identify the relevant concept and explain its effect on recognition or measurement.`,
  "Accounting equation": `Every transaction affects at least two elements while preserving assets = liabilities + equity. If the owner contributes cash, assets and equity both rise. If the business buys equipment on credit, assets and liabilities rise. If it pays a creditor, cash and the liability fall by the same amount. Record the date and source document, then check the equation after posting. A balanced equation is an important check, but it does not prove that every transaction was recorded in the right account.`,
  "Double-entry principle": `Double entry records equal debit and credit amounts in different accounts according to the transaction's effect. A cash sale debits cash and credits sales; a credit purchase debits purchases or inventory and credits the supplier account. The words debit and credit mean left and right sides, not automatically good and bad. Determine the accounts affected before choosing sides, then check that total debits equal total credits. Equality can expose arithmetic errors, although a wrong account may still leave the trial balance equal.`,
  "Source documents": `A source document provides evidence for a transaction: an invoice records a sale or purchase, a receipt confirms payment and a credit note adjusts an amount. Match the document to the date, party, goods and value before posting. Numbering documents and filing them in order makes missing records easier to spot. A document can contain an error, so compare it with delivery records or an agreement when necessary. Protect customer and supplier information, and retain records according to applicable rules.`,
  "Books of original entry": `Books of original entry organise transactions before amounts are posted to ledger accounts. A sales journal records credit sales, while a cash book records cash and bank movements. Each entry needs a date, reference and correct account classification. At the end of a period, totals may be posted to the ledger, with individual customer balances recorded separately where needed. Choose the book based on the transaction rather than entering every event in one list. Reconcile totals with source documents so omissions can be found early.`,
  "Cash book": `The cash book records receipts and payments through cash or bank and can serve as both a book of original entry and a ledger account. A contra entry transfers value between cash and bank, such as cash deposited into the bank; it affects both columns but is not income or expense. Balance each side at the period end and compare bank activity with the statement. A correct balance depends on complete entries, accurate dates and distinguishing transfers from external transactions.`,
  "Petty cash book": `A petty cash book controls small payments such as local transport or stationery. Under an imprest system, the petty cashier receives a fixed float, records vouchers for each payment and is reimbursed for the amount spent to restore the float. If the float is ₦10,000 and vouchers total ₦7,200, the remaining cash should be ₦2,800 before replenishment. Keep receipts, check the balance and use authorised categories. The system supports accountability but does not remove the need to review unusual or unsupported claims.`,
  "Ledger accounts": `Ledger accounts group transactions by item, customer, supplier, income or expense. Posting transfers information from the original-entry book while preserving its date and reference. For a customer account, a credit sale increases the receivable and a later cash receipt reduces it. Balance an account by comparing its debit and credit totals, then carry the balance forward as required. A ledger helps locate the source of a total, but accuracy depends on correct postings and timely reconciliation with supporting records.`,
  "Trial balance": `A trial balance lists ledger balances to test whether total debits equal total credits at a date. If the totals differ, check additions, posting sides, omitted balances and transfers. Agreement does not reveal every error: a transaction may be omitted entirely, recorded in the wrong account or entered at the same wrong amount on both sides. Use the trial balance as one control, not proof that accounts are error-free. Keep a clear audit trail when correcting a discovered mistake.`,
  "Errors and corrections": `Errors can affect agreement in different ways. A transposition may create a difference divisible by nine, while an error of omission may leave the trial balance balanced. A suspense account can temporarily hold a difference while an error is investigated, but it should not be used to conceal an unexplained balance. Identify the original entry, determine the correct treatment and record a dated journal correction with an explanation. After correction, check the ledger and related statements to confirm that the effect is complete.`,
  "Bank reconciliation": `Prepare a reconciliation for the same date and distinguish items that update the cash book from timing differences that remain until the bank processes them. Bank fees and direct debits should be entered in the cash book; unpresented cheques are already recorded by the business but not yet shown by the bank. Verify unusual items with statements and payment evidence. A reconciliation that balances is useful, but a recurring delay or unexplained payment may indicate a control problem that deserves further review.`,
  Depreciation: `Depreciation spreads an asset's depreciable amount over the periods expected to benefit from its use. The method should reflect the pattern of consumption where it can be estimated reliably. Under reducing balance, expense is a fixed percentage of carrying amount; under straight line, it is generally constant each year. Record the asset cost, useful life, residual value and method, then review estimates when circumstances change. Depreciation reduces reported profit and carrying amount, but the expense itself is not a cash payment in that period.`,
  "Accruals and prepayments": `At a reporting date, compare cash paid or received with the period in which the service was used or earned. If rent covers six months beyond year-end, the unused portion is a prepayment asset; if electricity was used but the bill has not arrived, record an accrued expense and liability. Reverse or release adjustments in the correct later period to avoid double counting. Keep calculations and contract dates so another person can verify the allocation. Matching improves period comparison but requires reasonable estimates when exact bills are unavailable.`,
  "Inventory valuation": `Inventory valuation affects both the closing asset and cost of sales, so a change can alter reported profit. Count items carefully, identify damaged or obsolete stock and retain purchase-cost evidence. Apply the chosen cost formula consistently to interchangeable items and compare cost with net realisable value at the reporting date. For example, an item that can only be sold below its cost may require a write-down. Document assumptions and avoid including selling costs as inventory cost. A physical count and valuation review provide different checks and both are necessary.`,
  "Final accounts": `Prepare statements only after checking ledger balances and making supported adjustments for inventory, accruals, prepayments and depreciation. The trading result flows into the income statement, while assets, liabilities and equity appear in the statement of financial position. Cross-reference figures and confirm that the accounting equation remains consistent. Compare the current period with prior information, but explain changes in policy or business conditions before drawing conclusions. Statements summarise historical records and estimates; readers should use notes and context rather than treating one figure as a complete account of performance.`,
  "Trading account": `Classify direct costs by whether they bring goods to a saleable condition and location. Carriage inward may be part of cost of goods available for sale, while carriage outward is usually a selling expense. Returns inward reduce sales; returns outward reduce purchases. Show the calculation in order so a reader can trace net sales, cost of goods sold and gross profit. Compare gross profit with sales only when periods and classification methods are consistent. A margin change may reflect price, purchase cost, stock loss or product mix and needs investigation.`,
  "Profit and loss account": `An income statement reports income earned and expenses incurred during a period, not merely cash movements. Classify expenses by their function or nature consistently and include accruals, prepayments and depreciation where relevant. A business can report a profit but still face cash shortages if customers have not paid or loan repayments are due. Compare trends and investigate unusual items rather than assuming that a larger profit always means stronger financial health. Explain the period and measurement basis when presenting results.`,
  "Balance sheet": `The statement of financial position is a snapshot at a specific date. Classify resources as current or non-current and obligations by expected settlement, applying the relevant reporting rules. Equity is the residual interest after liabilities, not simply the cash invested. Compare dates to identify changes, then use notes to understand measurement, restrictions or contingent obligations. A healthy-looking asset total may include slow-moving inventory or overdue receivables, so examine quality and liquidity as well as size.`,
  "Manufacturing accounts": `A manufacturing account calculates the cost of goods produced by combining direct materials, direct labour and production overheads. Opening work in progress is added and closing work in progress is deducted to find production cost for the period. Distinguish factory costs from selling and administration expenses. If materials issued to production are ₦40,000, direct labour is ₦25,000 and factory overhead is ₦15,000, prime cost is ₦65,000 and factory cost before work-in-progress adjustments is ₦80,000. State classifications and check that units and period match.`,
  "Partnership accounts": `A partnership agreement may specify capital contributions, profit-sharing ratios, interest on capital, salaries and interest on drawings. Apply the agreed terms before dividing residual profit; a partner's salary is an appropriation of profit, not necessarily a business operating expense. Record drawings separately from expenses and reconcile each partner's capital or current account. If the agreement is silent, the applicable legal default may matter, so do not assume a customary arrangement. Explain the basis used and check that appropriations do not exceed the profit available.`,
  "Company accounts": `A company is a separate legal entity from its shareholders, so company transactions must not be mixed with owners' personal spending. Share capital represents funds raised by issuing shares, while retained earnings accumulate profits kept in the business after distributions. Dividends are distributions to shareholders, not operating expenses. Read the statement dates and notes, since accounting classifications and legal requirements depend on the applicable framework. A shareholder's investment does not guarantee a dividend, and a profit figure does not alone establish the company's ability to pay one.`,
  "Cash-flow information": `Cash-flow information explains movements in cash over a period and groups them by operating, investing and financing activities. Profit differs from operating cash flow because of non-cash expenses, working-capital changes and timing of receipts or payments. A business can be profitable yet unable to pay a bill when due. Compare cash flow with obligations and planned investment, and check whether a one-off receipt disguises a recurring shortfall. Trace each amount to the underlying statement and avoid counting a transfer between cash accounts as an external cash flow.`,
  "Accounting ratios": `Ratios relate financial statement figures to support comparison, but their meaning depends on consistent definitions and context. A current ratio compares current assets with current liabilities; a gross margin compares gross profit with sales. Compare the same business over time and, cautiously, with similar organisations. A high ratio is not automatically good: excess inventory may weaken liquidity, while high margins could coincide with falling sales. State the formula, period and data source, then explain what the result suggests and what it cannot prove.`,
  "Computerized accounting": `Accounting software can automate calculations, organise records and produce reports, but it depends on accurate setup and input. Assign appropriate permissions, use unique user accounts and back up data securely. Reconcile imported bank transactions with statements and review suggested account codes before accepting them. Keep an audit trail for edits and protect customer or payroll information. Automation may reduce repetitive arithmetic errors, but it cannot decide whether a transaction is genuine or correctly classified without human review.`,
  "Accounting project": `A practical project should define a small organisation, period and question before collecting sample transactions. Use realistic source documents, record each event in the correct book, post to ledgers and prepare a trial balance or selected statement. Mark fictional data clearly and do not use real classmates' financial details. Check totals at each stage and include one example of a control or correction. The report should explain the method, findings and limitations so another learner can reproduce the work and identify where an error might arise.`,
};

const accountingFollowUps = {
  "Meaning and purpose of accounting": `A manager can then compare sales, costs and cash timing to decide whether to change prices or order stock. Record the basis for the decision so later results can be reviewed.`,
  "Users of accounting information": `Ask whether the user needs a past result, a current obligation or an estimate of future cash. Different questions call for different schedules, even when they concern the same organisation.`,
  "Accounting concepts": `Apply the concept to the transaction's date and evidence, and explain any estimate made. Consistency improves comparison, but a justified change in policy should be disclosed rather than concealed.`,
  "Accounting equation": `After posting, compare the supporting documents with both affected accounts. If the equation balances but the transaction was classified incorrectly, correct the accounts and retain an explanation of the change.`,
  "Double-entry principle": `Use a journal narrative to state why each account is debited or credited. This makes the posting easier to review and helps separate a classification error from an arithmetic mistake.`,
  "Source documents": `A supplier invoice should be checked against the order and goods received before payment is approved. This control can reveal duplicate charges, incorrect quantities or goods that never arrived.`,
  "Cash book": `Compare the closing balance with physical cash or the bank statement as appropriate. Investigate stale cheques and unusual entries promptly instead of carrying them forward without explanation.`,
  "Petty cash book": `A supervisor can count the remaining cash and compare it with the float less approved vouchers. Keep vouchers sequential and investigate a shortage rather than silently replacing it.`,
  "Ledger accounts": `Reconcile customer and supplier balances with their statements, and follow up on items that do not agree. A subsidiary ledger should support, not contradict, the control account total.`,
  "Trial balance": `If a difference remains, check whether a balance was omitted or entered on the wrong side before using suspense. Keep each correction traceable to the original ledger reference.`,
  "Errors and corrections": `A correction should show the incorrect entry, the required entry and the resulting adjustment. This lets a reviewer see the effect on profit and financial position without erasing history.`,
  "Bank reconciliation": `An old outstanding item should be followed up with the payee or bank. Repeated unexplained differences can signal weak controls, duplicate entries or unauthorised activity.`,
  Depreciation: `When an asset is sold or retired, remove its cost and accumulated depreciation and record any disposal gain or loss. Keep the calculation separate from the cash proceeds.`,
  "Accruals and prepayments": `Use invoices, contracts and service dates to support the time allocation. Recheck estimates when the actual amount arrives and adjust the next period without recording the same expense twice.`,
  "Final accounts": `A final review should compare statement totals with the trial balance and confirm that adjustments have been posted once. Explain any material estimate or classification that affects interpretation.`,
  "Trading account": `Compare the closing stock count with inventory records and investigate shortages or damaged goods. A correct gross-profit calculation still depends on a reliable quantity and valuation.`,
  "Profit and loss account": `A useful analysis compares margins across periods and asks what changed in price, volume or costs. Avoid attributing a change to management decisions without supporting evidence from records.`,
  "Balance sheet": `Check whether receivables are collectible and liabilities are complete. Classification alone cannot show liquidity; compare due dates and expected cash receipts with obligations.`,
  "Manufacturing accounts": `Production records should reconcile materials issued, labour time and overhead allocation with output. Explain the basis for shared factory costs so unit costs can be compared fairly.`,
  "Partnership accounts": `Show each appropriation separately and verify the agreed ratio before allocating residual profit. Partners should review the statement and resolve differences using the partnership agreement.`,
  "Company accounts": `Check whether share issues, reserves and distributions are supported by company records and the relevant approvals. Do not treat a shareholder's personal transaction as a company expense.`,
  "Cash-flow information": `Review whether operating cash flow can meet near-term payments and whether capital spending has a sustainable funding source. Explain temporary timing differences separately from recurring shortages.`,
  "Accounting ratios": `Use the same formula and period for comparisons, and state when classifications differ. A ratio is a prompt for investigation, not a standalone verdict about management quality.`,
  "Computerized accounting": `Restrict access by role, preserve audit logs and test backups by restoring a sample. Review unusual automated matches before posting because software can repeat a wrong rule quickly.`,
  "Accounting project": `Include enough anonymised source records for a classmate to reproduce one transaction from entry through report. Explain a discrepancy and show how the correction changed the final figures.`,
};

const literature = {
  "Literature and society": `# Literature and society

Literature represents human experience through invented or remembered voices, events and images. A text can reflect social expectations, question authority or imagine alternatives. Analysis connects textual choices to context without reducing a poem or story to a single lesson. Ask who speaks, whose experience is centred and what tensions the work leaves unresolved.

In an original scene, a market trader closes her stall before a new road is built, while a neighbour welcomes the shorter journey to school. The contrast can invite discussion of development and unequal effects. Support an interpretation with details from the text, and distinguish the writer's choices from assumptions about a whole community.`,
  "Genres of literature": `# Genres of literature

Genre is a category that groups works by conventions, form or audience. Prose uses sentences and paragraphs; poetry organises language through line, rhythm and imagery; drama is written for performance through speech and stage action. Genres overlap: a prose work can be lyrical, and a play can contain poetic language.

Classifying a text is a starting point, not an interpretation. A dramatic monologue uses a speaker addressing a listener, while a short story is shaped through narration and plot. Identify the features that support a genre label, then consider how the writer bends those conventions. Avoid assuming that every work in one genre has the same structure or purpose.`,
  "Elements of prose": `# Elements of prose

Prose fiction is shaped by elements such as plot, character, setting, point of view, conflict and theme. These elements interact. A stormy setting may heighten danger, while a character's choice reveals values and changes the plot. A narrator's knowledge controls what readers can know at each moment.

In a short story about a lost purse, the plot may turn on whether the finder reports it; the setting of a crowded bus station affects who witnesses the choice. To analyse prose, select a detail, explain how it works and connect it to a larger effect. Do not list elements without showing their relationship.`,
  "Plot and structure": `# Plot and structure

Plot is the arrangement of events; structure is how the writer presents them. A narrative may use chronological order, flashback, parallel scenes or an unresolved ending. Exposition introduces needed information, while a turning point changes what characters can do or expect. Not every story follows a simple rise-and-fall pattern.

If a story begins with a character waiting outside a closed clinic and later returns to the morning events, the opening creates a question that the flashback answers gradually. Analyse how the order shapes suspense or sympathy. Distinguish what happens in the story from when and how the reader learns it.`,
  Characterization: `# Characterization

Characterization is the way a writer presents a character through action, speech, thought, description and the reactions of others. Direct description tells readers a trait; indirect characterization allows readers to infer it. A character can be inconsistent or change, so conclusions should be based on several moments rather than one line.

In an original scene, a student returns a borrowed book before an examination despite being tempted to keep it. The action suggests honesty, while dialogue and context may complicate the judgement. Support claims with specific details and consider whether the narrator is reliable. Avoid labelling a character “good” or “bad” without explaining the evidence.`,
  Setting: `# Setting

Setting includes the time, place and social conditions in which a work unfolds. It can shape what characters are able to do, create atmosphere and carry symbolic meaning. A rural road during the rainy season, for example, affects travel differently from the same road in dry weather.

An original scene set in a crowded ferry terminal might make a missed connection feel urgent and bring strangers into contact. Analyse which details establish place and time, then connect them to conflict, mood or action. Setting is not merely background decoration, and its effects should be demonstrated from the text rather than assumed.`,
  "Point of view": `# Point of view

Point of view is the position from which a story is narrated. First-person narration uses “I” and limits knowledge to the speaker's experience. Third-person limited follows one character's perspective; omniscient narration can present the thoughts of several characters. An unreliable narrator may misread events or conceal information.

If a narrator describes a neighbour only through rumours, readers should distinguish the narrator's claims from confirmed facts. Ask what the narrator knows, what they may not know and how the perspective shapes sympathy. A shift in point of view can reveal information or create contrast. Do not confuse the author with a fictional narrator.`,
  Theme: `# Theme

Theme is an idea or question developed through a work, not simply its topic. A story may concern migration, while its themes explore belonging, obligation or the cost of ambition. A theme is usually expressed as a complete claim about human experience and is developed through events, images and character choices.

In an original story, two siblings disagree about leaving their village for work. Their choices may develop a theme about opportunity and responsibility without offering one simple answer. Support a theme statement with multiple details from the work. Avoid reducing a complex text to a moral slogan or treating a character's view as the writer's final position.`,
  "Style and tone": `# Style and tone

Style is the writer's characteristic use of language and structure; tone is the attitude conveyed toward a subject or audience. Diction, sentence length, imagery, repetition and punctuation all contribute. A formal tone may use measured syntax, while clipped sentences can create urgency, but effects depend on context.

Compare “The door stood open” with “The door gaped at the empty corridor.” The second phrasing personifies the door and may create unease. Name the specific choice, quote accurately and explain its effect in the passage. Tone can shift, so avoid assigning one adjective to an entire work without evidence.`,
  "Narrative techniques": `# Narrative techniques

Narrative techniques include dialogue, description, pacing, foreshadowing, flashback, repetition and shifts in focus. Writers use them to control information and shape readers' expectations. Foreshadowing offers a clue before an event; flashback presents an earlier event that changes how the present is understood.

If a story repeatedly mentions a cracked clock before a character misses an important meeting, the detail may establish time pressure rather than predict a literal disaster. Interpret technique in relation to the passage. A technique's name is not an explanation: show what the text does and how that choice affects the reader's understanding.`,
  "Poetry and poetic voice": `# Poetry and poetic voice

Poetry concentrates language through line breaks, sound, rhythm, imagery and pattern. The poetic voice is the speaker created by the poem; it is not automatically the poet's personal voice. A lyric poem may focus on a single moment, while a narrative poem tells a story, but forms can overlap.

In an original four-line poem about a bus at dawn, repeated hard consonants might echo the engine while a pause at the line break delays the arrival. Read aloud, notice sound and pacing, then examine how those features support meaning. Refer to line numbers or brief quotations and distinguish the speaker's feelings from the writer's biography.`,
  Imagery: `# Imagery

Imagery is language that appeals to the senses or creates a vivid mental picture. It can be visual, auditory, tactile, olfactory or gustatory. Metaphor and simile can also create imagery by linking unlike things. The effect depends on the associations a comparison invites in context.

An original phrase such as “the generator coughed behind the shop” gives sound and human-like action to a machine. Ask what is being compared, which senses are engaged and how the image changes the mood or understanding. Avoid stopping at “it creates a picture”; explain what the picture suggests and why it matters in the passage.`,
  "Figures of speech": `# Figures of speech

Figures of speech use language beyond literal meaning for emphasis, comparison or effect. A simile compares using “like” or “as”; a metaphor makes a direct comparison; personification gives human qualities to something non-human; irony creates a gap between appearance and meaning. Hyperbole deliberately exaggerates.

In “The town swallowed the road,” personification or metaphor may suggest that development has absorbed the route into the settlement. Identify the figure, interpret the comparison and connect it to the passage. Do not label every striking phrase a metaphor, and do not assume that naming a device proves its effect.`,
  "Sound devices": `# Sound devices

Sound devices organise language through repeated or contrasting sounds. Alliteration repeats initial consonant sounds, assonance repeats vowel sounds and onomatopoeia imitates or evokes a sound. Rhyme links similar ending sounds, while consonance repeats consonants within or at the ends of words.

In an original line, “soft sand slid underfoot” repeats the /s/ sound. The effect may suggest quiet movement, but context decides whether that reading is persuasive. Read the line aloud, identify the actual repeated sounds and explain how they contribute to pace, mood or emphasis. Avoid claiming that a sound always has one fixed meaning.`,
  "Rhythm and metre": `# Rhythm and metre

Rhythm is the pattern of movement created by stressed and unstressed syllables, pauses and line lengths. Metre is a recurring pattern of stresses. In English poetry, an iamb commonly moves from an unstressed to a stressed syllable; a line may vary from a regular pattern to create emphasis.

Read a poem aloud before marking stresses because natural pronunciation matters. A sudden short line or pause can interrupt a steady rhythm and draw attention to a change in thought. Scansion is a tool, not an end in itself: connect the pattern to the poem's voice or meaning, and allow for variation rather than forcing every line into a perfect scheme.`,
  "Dramatic structure": `# Dramatic structure

Dramatic structure organises action for performance. Acts and scenes establish changes of time or place; exposition introduces circumstances; conflict creates pressure; a climax or turning point changes the direction of events. Some plays use episodic structure or an open ending rather than a single resolution.

In an original one-act play about a community meeting, the arrival of a missing document can shift the conflict from blame to negotiation. Consider what the audience knows at each point, how entrances and exits affect tension and whether the ending resolves the central question. Stage structure should be analysed through both dialogue and the action that can be performed.`,
  "Dialogue and stagecraft": `# Dialogue and stagecraft

Dialogue reveals relationships, conflict and information through what characters say and how they say it. Stagecraft includes directions for movement, setting, lighting, sound, props and pauses. A pause can communicate hesitation; a character turning away can contradict spoken reassurance.

In a short original exchange, one character says “I am not worried” while repeatedly checking a silent phone. The stage action complicates the line. Analyse speech together with directions and performance possibilities. A script is designed to be heard and seen, so consider how timing, gesture and space shape an audience's interpretation.`,
  "Tragedy and comedy": `# Tragedy and comedy

Tragedy and comedy are dramatic traditions with different conventions, though individual works can mix them. Tragedy often presents serious conflict and consequences, while comedy may use misunderstanding, reversal, wit or reconciliation. A tragic protagonist is not simply a sad character; the structure examines choices, pressures and outcomes.

An original scene can use comic misunderstanding to expose a character's pride, then resolve the conflict through recognition. Another play may end without restoring order. Identify the conventions a work uses and how it adapts them. Genre labels help frame expectations but do not replace close analysis of language, action and ending.`,
  "Prose passage analysis": `# Prose passage analysis

Analysing prose means explaining how selected details create meaning, not retelling the passage. Track narrator, setting, character action, diction and structure. A focused paragraph can make a point, give brief textual evidence, explain the evidence and connect it to a larger idea.

In an original passage where a character folds an unopened letter and hides it in a drawer, the action may suggest fear or avoidance. The interpretation should account for surrounding details and remain open to alternatives. Use short quotations accurately, avoid paraphrasing the whole plot and distinguish what the passage states from what you infer.`,
  "Poetry passage analysis": `# Poetry passage analysis

Poetry analysis considers voice, images, sound, rhythm, lineation and progression of thought. Begin by identifying what changes across the passage: the speaker may move from observation to memory, or from confidence to doubt. Select a few details that support the interpretation rather than listing every device.

For an original poem about rain on a tin roof, repeated sounds may establish a steady rhythm before a final broken line signals interruption. Explain how the sound and line break work together. Quote briefly, refer to line numbers and avoid treating the speaker as the poet without evidence.`,
  "Drama passage analysis": `# Drama passage analysis

Drama analysis examines spoken language, stage directions, conflict and the audience's position. Ask what each character wants, what prevents them from getting it and how power shifts during the scene. The audience may know something a character does not, creating tension or dramatic irony.

In an original scene, a clerk quietly slides a receipt across a counter while a customer publicly denies receiving it. The prop and gesture may contradict the dialogue. Use evidence from both speech and stage directions, and consider how actors or staging could make the conflict visible. Do not analyse a script as though it were only a narrative.`,
  "Comparative study": `# Comparative study

Comparative study examines similarities and differences between works in relation to a focused question. Choose a basis for comparison such as narrative voice, treatment of power, setting or structure. Compare like with like and support each point with evidence from both texts.

Two original stories may both depict migration, but one may use a first-person narrator who welcomes change while another uses a family dialogue that reveals divided views. Explain how the choices differ and what each enables the reader to see. Avoid writing one full essay about each text with no connection between them; organise paragraphs around comparative claims.`,
  "Literary criticism": `# Literary criticism

Literary criticism is reasoned interpretation and evaluation of texts. Different critical approaches may focus on form, history, gender, class, psychology or reader response. A critical lens directs attention to certain questions; it should not predetermine the conclusion or replace evidence from the work.

A historical reading may ask how a text reflects the institutions of its time, while a formal reading may focus on imagery and structure. Both can illuminate a work and both have limits. State the approach, support claims with textual evidence and acknowledge details that complicate the reading. Criticism is an argument to assess, not a list of labels to memorise.`,
  "Context and interpretation": `# Context and interpretation

Context includes historical, cultural, linguistic and biographical conditions relevant to a text. It can clarify references and social expectations, but it should not be used to reduce a work to the author's life or the period in which it was written. Textual evidence remains central.

If a poem refers to a public ceremony, contextual knowledge may explain its symbols; close reading still shows how the poet arranges them. Use reliable sources for contextual claims and separate documented facts from speculation. Ask how context changes or deepens an interpretation, and consider whether the text resists a simple explanation.`,
  "Writing literary responses": `# Writing literary responses

A literary response makes a clear claim about how a text creates meaning. A useful paragraph states a point, supports it with a brief quotation or precise reference, explains the writer's choice and links the explanation to the question. Evidence should be selected, not copied at length.

For a question about isolation, a response might connect a character's repeated refusal to answer the door with the setting and narrative point of view. Explain why those details matter rather than retelling events. Organise the essay around ideas, use present tense for literary discussion and check that every paragraph answers the prompt.`,
  "Exam practice": `# Exam practice

Exam practice develops the habits needed to read a prompt carefully, plan an argument and use evidence under time limits. Identify the command word: “describe” asks for features, “analyse” asks how choices work and “compare” requires linked similarities or differences. Allocate time for planning, writing and checking.

For an unseen passage, read once for situation and again for patterns in language, voice and structure. Annotate only useful details, then form a claim that answers the question. Leave time to check quotation accuracy, paragraph focus and whether the conclusion follows from evidence. Practise with varied passages rather than memorising one model response.`,
  "Independent literary study": `# Independent literary study

Independent study involves choosing a manageable question about a literary work, locating reliable context and developing an evidence-based interpretation. Keep notes on quotations, page numbers and source details as you read. A research question such as how a setting changes a character's choices is more workable than a question about every theme in a novel.

Compare your reading with at least one critical source, but do not copy its argument as your own. Explain where the source is persuasive and where the text offers another possibility. Respect copyright by quoting only brief passages with attribution. A clear project presents its question, method, textual evidence, interpretation and limitations.`,
};

const literatureExtensions = {
  "Literature and society": `A text can reflect its period while also questioning the values it depicts. Separate what the narrator or speaker says from what the author may invite readers to examine. A novel about migration, for example, can represent family separation through setting, dialogue and recurring images rather than through direct explanation alone. Support an interpretation with a precise passage and consider another plausible reading. Context can deepen analysis, but it should not replace attention to the words on the page or reduce a character to a symbol for an entire group.`,
  "Genres of literature": `Genre is a useful expectation, not a rigid checklist. A narrative poem can use imagery and rhythm while also developing characters and conflict; a stage play may include narration or song. Identify the features actually present and explain how they shape the reader's or audience's experience. When comparing genres, use the same subject or theme to notice what dialogue, stage directions, narration or line breaks make possible. Avoid classifying a text from its title alone. Form and purpose work together, and a writer may combine conventions to create a particular effect.`,
  "Elements of prose": `Prose elements interact: plot creates circumstances for character choices, setting can limit or enable those choices, and point of view controls what readers know. In a short passage, select one moment where two elements meet and trace its effect. For instance, a character's hesitation in a crowded station may reveal both private fear and public pressure. Use a short quotation, explain its language and connect it to the larger work. Listing elements without showing their relationship produces description rather than analysis.`,
  "Plot and structure": `Plot concerns the arrangement and development of events, not simply a list of everything that happens. A flashback may reveal a motive after readers have judged a character, changing how an earlier scene is understood. Notice where a text delays information, repeats an event or shifts pace. Explain the effect using the order in which the audience receives details. A structural claim should refer to a specific transition or turning point. Then consider whether the ending resolves the central conflict, leaves it open or deliberately complicates it.`,
  Characterization: `Characterization may be direct, through description, or indirect, through speech, action, thought and other characters' responses. A character who promises to help but repeatedly avoids responsibility presents a tension readers can evaluate. Track change across more than one scene and consider contradictory evidence. Avoid treating a character as a real person whose motives can be known with certainty; explain what the text supports. Compare an early and later moment, quote a telling detail and show how the writer shapes sympathy, doubt or distance.`,
  Setting: `Setting includes place, time, social conditions and the rules that shape daily life. A locked gate may be a physical detail, but its effect depends on who controls it and who is excluded. Compare descriptions of the same place at different moments to see whether its meaning changes. Use textual evidence for atmosphere and avoid assuming that a setting represents every real community that resembles it. Explain how time and place affect the characters' options, conflict or sense of belonging.`,
  "Point of view": `First-person narration limits readers to one speaker's account, while third-person narration can remain close to one character or move more broadly. An unreliable narrator may omit, misunderstand or distort events; identify evidence for unreliability instead of using the label as a guess. Compare what the narrator claims with what actions or other voices reveal. Ask how a different viewpoint would alter the reader's knowledge or sympathy. Point of view is a deliberate route into the story, not simply a pronoun choice.`,
  Theme: `A theme is an idea developed through a text, not a single word such as “love” or “justice.” Formulate it as a claim, for example, “loyalty can become harmful when it prevents honest judgement.” Find moments that develop or challenge the claim, including evidence that complicates it. A theme may remain unresolved, and characters can express competing views. Quote briefly, explain the language and connect the moment to the whole work. Avoid assuming that a character's opinion is the author's final message.`,
  "Style and tone": `Style includes choices in diction, sentence pattern, imagery and form; tone is the attitude conveyed by those choices. A plain sentence beside an elaborate description may create contrast, while repeated formal language can sound sincere or satirical depending on context. Identify the exact words that shape tone and consider who is speaking to whom. Do not assign a tone from subject matter alone: a sad event may be narrated with restraint or irony. Explain how a pattern affects the reader and support the interpretation with nearby details.`,
  "Narrative techniques": `Narrative techniques include foreshadowing, flashback, suspense, dialogue, repetition and shifts in time. Trace a technique through a particular sequence: what information is withheld, when it is revealed and how that changes expectation. A warning early in a story may create suspense only if later events make it meaningful. Avoid naming a technique without explaining its function. Compare the reader's knowledge at two points and support the comparison with evidence. A technique can create several effects at once, so state the strongest one and acknowledge ambiguity where appropriate.`,
  "Poetry and poetic voice": `The poetic voice is the speaker constructed by the poem and should not automatically be equated with the poet. Identify who appears to speak, the situation and any change in address or attitude. A shift from “I” to “we” can widen the experience or create a claim of shared identity. Read the poem aloud to notice pauses and emphasis, then connect sound to meaning rather than treating rhythm as decoration. Quote a short phrase and explain how its syntax, image or sound supports an interpretation of the speaker's stance.`,
  Imagery: `Imagery uses sensory language to shape an idea or feeling. A description of dust covering a family photograph may suggest neglect, memory or change; the interpretation should be tested against the surrounding passage. Notice whether images recur, transform or contrast. A single image can support more than one reading, so explain why one interpretation fits the pattern of the text. Identify the sensory detail, connect it to the speaker's situation and consider how it affects mood or theme. Avoid translating every image into a fixed symbolic dictionary.`,
  "Figures of speech": `A metaphor describes one thing through another, while a simile signals comparison with words such as “like” or “as”; personification gives human qualities to something non-human. Identify the two ideas being connected and explain what the comparison makes noticeable. In “the city swallowed the road,” the image may suggest scale or danger, depending on context. Do not stop at naming the device. Ask whether it sharpens, complicates or challenges the literal meaning, and support the effect with the passage around it.`,
  "Sound devices": `Alliteration repeats initial consonant sounds, while assonance repeats vowel sounds and onomatopoeia imitates or evokes sound. These patterns matter when they reinforce pace, mood or emphasis. Read the line aloud and compare the sound pattern with the action or feeling described. Repetition may be deliberate, but not every repeated letter creates a meaningful device. Quote the relevant words, name the sound accurately and explain its effect in context. Sound analysis should complement meaning rather than become a list of labels detached from the poem.`,
  "Rhythm and metre": `Rhythm is the movement of stressed and unstressed syllables; metre is a recurring pattern that can be regular or varied. Mark a short passage by speaking it naturally before imposing a formal pattern. A pause or extra syllable may disrupt expectation and reflect hesitation, urgency or emphasis. Do not force every line into a named metre when the evidence is uncertain. Explain what the variation does at that moment and connect it to syntax and meaning. Performance can reveal rhythm, but different readers may stress a line differently.`,
  "Dramatic structure": `A play's structure develops through scenes, entrances, exits, revelations and reversals. Identify the event that changes what a character can do, then trace its consequences in later scenes. A turning point may be small in stage action but large in what the audience learns. Stage directions, pauses and scene changes can carry meaning alongside spoken lines. Compare the audience's knowledge with a character's knowledge to explain dramatic irony or suspense. Support the interpretation with the sequence of events rather than retelling the entire plot.`,
  "Dialogue and stagecraft": `Dialogue reveals relationships through what characters say, avoid, repeat or interrupt. Stagecraft includes movement, lighting, sound, props and spatial arrangement, all of which shape performance. A character who speaks while standing apart from a group may be isolated, but the actor's movement and the play's context must support that reading. Select a line and a stage direction, then explain how they work together for an audience. Consider how a production choice could change emphasis without changing the words.`,
  "Tragedy and comedy": `Tragedy and comedy are dramatic traditions with varied conventions, not simple labels for sad or funny moments. A tragic ending may follow from a character's decision, social pressure or circumstances that cannot be controlled; comedy may use misunderstanding, reversal or reconciliation. Track how the work prepares the outcome and whose perspective shapes it. A comic scene can expose serious inequality, and a tragedy can include humour. Explain the effect of the convention in the whole play rather than classifying a scene from one emotion.`,
  "Prose passage analysis": `Begin with a defensible claim about what the passage reveals, then choose details that support it. Analyse diction, sentence structure, imagery, viewpoint and character action only where they contribute to the claim. A short quotation should be introduced and interpreted, not left to speak for itself. Connect the passage to the larger work if the question requires it, while keeping the close reading central. A strong response explains how the writing creates meaning and notes any ambiguity instead of retelling events line by line.`,
  "Poetry passage analysis": `Read the whole poem before selecting details so that a phrase is not separated from its development. Track speaker, situation, shifts, images, sound and lineation, then connect them to a clear interpretation. Quote only the words needed and explain their effect. If a poem changes direction at a conjunction or stanza break, show how the shift alters the reader's understanding. Avoid paraphrasing every line or naming devices without analysis. End by explaining how the form and language work together to develop the poem's central tension or idea.`,
  "Drama passage analysis": `A drama passage is written for performance, so analyse both speech and stage directions. Identify who is present, what each character wants and what changes during the exchange. Pauses, entrances, props and movement may alter the force of a line. Consider what the audience knows that a character does not, and explain how this creates tension or irony. Use a brief quotation with a nearby direction, then connect the moment to the play's conflict. Do not assume one staging choice is the only possible interpretation.`,
  "Comparative study": `A comparison needs a shared question, not two separate mini-essays. Choose a basis such as voice, power or memory, then examine how each text develops it through form and language. Pair evidence from both works and explain a meaningful similarity or difference. Avoid comparing a whole novel with one isolated line unless the task calls for that scale. Context can clarify different choices, but do not assume one text is superior because it follows a familiar convention. End by stating what the comparison reveals that either text alone would not show.`,
  "Literary criticism": `Literary criticism offers a lens for asking questions about a text, such as whose interests a narrative privileges or how class shapes opportunity. A lens is a tool, not a replacement for evidence or a conclusion to impose in advance. Define the critical idea briefly, apply it to a specific passage and test it against details that do not fit. Different approaches may illuminate different features. A balanced response explains what the lens makes visible and what it leaves unexplained, while keeping the text itself in view.`,
  "Context and interpretation": `Context may include a work's historical period, intended audience, publication conditions and cultural references. Use reliable sources and distinguish documented facts from later interpretation. Context can explain why a word or institution mattered, but it does not determine every reader's response. Connect contextual evidence to a specific textual choice, such as a restriction on a character's movement or speech. Avoid treating a community as uniform or assuming that a writer speaks for every person in that period.`,
  "Writing literary responses": `Plan a response around a claim that answers the question, then organise paragraphs by reasons rather than by plot sequence. Integrate short quotations grammatically and analyse specific words. A paragraph can move from claim to evidence to explanation and link back to the argument. Use present tense for literary events unless discussing historical context. Leave time to check that each quotation is accurate, each paragraph advances the thesis and the conclusion synthesises rather than repeats. Clear reasoning matters more than decorative terminology.`,
  "Exam practice": `Read the command word and identify the text, passage and scope required. Allocate time for planning, evidence selection and review. For a comparison, build paired points; for close analysis, stay near the supplied language. Support each claim with precise evidence and explain its effect rather than listing devices. If a question allows more than one interpretation, choose one and justify it. After writing, check that the answer addresses every part of the prompt and has not become a plot summary.`,
  "Independent literary study": `An independent study begins with a focused question that can be answered through close reading. Select a manageable passage or feature, keep notes with page references and distinguish quotation from paraphrase. Consult criticism for context, but evaluate the critic's evidence rather than adopting the conclusion automatically. Revise the question if the material does not support it. A final report should state the method, explain key evidence, consider a counter-reading and acknowledge limits. Record publication details so another reader can locate the sources used.`,
};

const literatureFollowUps = {
  "Elements of prose": `In a response, move from a claim to a quotation and explain how the chosen element shapes meaning. Check whether a later detail supports or complicates the first impression.`,
  "Plot and structure": `A reader can map the order of events separately from their presentation. Comparing those sequences shows where the writer creates delay, surprise or a changed judgement.`,
  Characterization: `Use more than one action when describing a character. A contradiction may be deliberate and can reveal pressure, uncertainty or a change in the character's priorities.`,
  Setting: `A setting detail gains significance through its effect on a character or event. Compare who can move freely in the place with who faces a restriction.`,
  "Point of view": `Mark what the narrator knows, suspects and cannot know. This boundary helps explain why readers may share one character's uncertainty or distrust another account.`,
  Theme: `Test a theme statement against a scene that appears to challenge it. Revising the claim to account for tension usually produces a more accurate interpretation.`,
  "Style and tone": `Compare the passage's tone with a later moment before describing a whole work. A shift may expose irony, emotional distance or a change in the speaker's attitude.`,
  "Narrative techniques": `A useful analysis names the technique, points to its location and explains what the reader knows before and after it. This keeps terminology tied to evidence.`,
  "Poetry and poetic voice": `Notice whether the speaker addresses a person, an object or an absent audience. The choice of address can shape intimacy, authority or distance.`,
  Imagery: `Follow an image if it returns later with a changed meaning. Such development can make a pattern more significant than a single striking description.`,
  "Figures of speech": `Explain the qualities transferred by the comparison and whether the context confirms them. A metaphor may invite admiration while also exposing a limitation.`,
  "Sound devices": `Check the effect by reading the phrase aloud in its sentence. Explain how sound supports pace or emphasis without claiming that every repeated sound has a fixed meaning.`,
  "Rhythm and metre": `Scan only a short passage first and mark natural speech stresses. Compare a variation with the surrounding pattern before linking it to a pause or shift in feeling.`,
  "Dramatic structure": `A turning point can be tested by asking what the characters can do before and after it. This gives a reasoned structural claim instead of a plot label.`,
  "Dialogue and stagecraft": `A performance can vary, so separate what the text directs from what a production might choose. Explain how the direction guides, but does not fully determine, an audience's response.`,
  "Tragedy and comedy": `Track how the ending follows from earlier choices and pressures. A mixed tone may complicate the genre and make the audience respond with both concern and amusement.`,
  "Prose passage analysis": `Keep quotations short and interpret their wording. A paragraph should explain how evidence supports the claim, not retell the events surrounding it.`,
  "Poetry passage analysis": `Notice stanza breaks, punctuation and enjambment alongside imagery. Explain how one formal choice changes the pace or emphasis of the speaker's thought.`,
  "Drama passage analysis": `Compare a character's spoken words with the stage direction at that moment. A mismatch can create dramatic irony or reveal an unspoken response.`,
  "Comparative study": `Arrange paired evidence in the same paragraph and state why the contrast matters. This avoids writing two unrelated descriptions under one heading.`,
  "Literary criticism": `After applying a critical lens, check a detail that resists it. Addressing that counter-evidence makes the reading more precise and less predetermined.`,
  "Context and interpretation": `Use contextual facts to clarify a textual choice, then return to the passage. Avoid treating background information as proof of what every reader must think.`,
  "Writing literary responses": `Revise topic sentences so each advances the central argument. Remove plot details that do not support the point, and check quotation accuracy before submission.`,
  "Exam practice": `Before finishing, compare each paragraph with the command word and the question's scope. Add explanation where evidence is present but its relevance is not yet clear.`,
  "Independent literary study": `Keep a research log with the question, source details and useful page references. This makes it easier to verify quotations and distinguish your reading from a critic's.`,
};

const business = {
  "Meaning and scope of business": `# Meaning and scope of business

Business organises resources to produce or exchange goods and services that meet needs or wants. It includes commercial activities such as retail and manufacturing, as well as services such as repair, transport and food preparation. A business may be owned by one person or many and can operate on a small community scale or across countries.

A neighbourhood tailor buys fabric, pays for labour and equipment, and sells completed clothes. The business must consider customers, costs, quality and legal responsibilities. Not every activity is a business: unpaid household work provides value but is not usually an exchange for revenue. When analysing an enterprise, identify what it offers, who it serves and how it sustains operations.`,
  "Occupation and economic activity": `# Occupation and economic activity

An occupation is the work a person does to earn income or contribute a service. Economic activities are often grouped into primary work that obtains natural resources, secondary work that processes materials and tertiary work that provides services. A worker can take part in more than one stage over a career.

A farmer grows cassava, a processor turns it into flour and a retailer sells it to households. These occupations are linked through production and trade. Some work is formal and documented; some is informal but still economically important. Classify an occupation by its main activity, not only by the worker's location or job title.`,
  Production: `# Production

Production creates goods or services by combining resources and adding value. A producer may transform inputs, provide a service or make goods available where customers need them. Production includes more than manufacturing: a bus operator produces transport service, while a bakery transforms ingredients into bread.

If a bakery uses flour, electricity, labour and an oven to make 200 loaves, it should track input quantities, output and waste. Productivity compares output with the inputs used; quality and safety also matter. Increasing quantity by wasting more material may not improve the business. Plan production around demand, capacity and available resources.`,
  "Trade and aids to trade": `# Trade and aids to trade

Trade is the exchange of goods and services. Aids to trade make exchange easier: transport moves goods, warehousing stores them, banking supports payments, insurance shares risk, communication links buyers and sellers, and advertising informs potential customers.

A trader selling fresh produce depends on transport speed and suitable storage; delays may cause spoilage. A bank transfer can reduce the need to carry cash, while insurance may cover defined losses under a policy. These services add cost but can reduce other costs or risks. Identify which aid solves which problem before deciding whether it is useful.`,
  "Home trade": `# Home trade

Home trade, or domestic trade, takes place within one country. Wholesale trade buys in larger quantities from producers and sells to retailers or other businesses; retail trade sells goods to final consumers. Some businesses combine these roles, especially when they sell directly to customers online or at a market.

A wholesaler may supply a shop with cartons of soap at a lower unit price, allowing the retailer to sell individual bars. The wholesaler needs storage and working capital, while the retailer must estimate customer demand. Domestic trade involves local transport, pricing, records and consumer protections; reliable documents help resolve disputes.`,
  "Foreign trade": `# Foreign trade

Foreign trade is the exchange of goods and services across national borders. Exports are sold to buyers abroad; imports are bought from foreign suppliers. Businesses must consider customs procedures, currency conversion, transport, product standards and payment risk. Exchange-rate movements can change the local-currency cost of an order.

A Nigerian manufacturer importing machinery may agree on a foreign-currency price and face higher costs if the naira weakens before payment. Trade documents such as invoices and shipping records support the transaction. Compare suppliers using total landed cost, not only the listed price, and check quality and delivery obligations.`,
  "Office and office work": `# Office and office work

An office coordinates information, communication, records and administrative tasks that support an organisation. Work may include scheduling, handling correspondence, maintaining files, preparing reports and assisting customers. Digital tools change how these tasks are done, but accuracy, confidentiality and clear procedures remain important.

When a customer requests a refund, an office worker may verify the transaction, record the request and pass it to the authorised staff member. A good office process identifies who may access information and how records are stored. Organised work reduces delays and helps another staff member continue a task when needed.`,
  "Office equipment": `# Office equipment

Office equipment helps staff create, store, communicate and process information. Computers and printers support document work; scanners digitise paper records; telephones and routers support communication. Choose equipment for the task, workload, accessibility and maintenance requirements rather than buying features that are not needed.

A small office may share a network printer, reducing the need for a device at every desk. Staff should follow safe-use instructions, protect equipment from spills and report faults rather than attempting repairs beyond their training. Regular maintenance and secure disposal of devices help protect both business continuity and stored information.`,
  "Sources of business information": `# Sources of business information

Businesses use internal information such as sales records, stock counts and customer enquiries, and external information such as market reports, official statistics, supplier catalogues and competitor prices. Each source answers different questions and has limitations. Sales records describe past transactions but do not guarantee future demand.

Before making a decision, check when information was collected, who produced it, how it was measured and whether it applies to the target customers. A survey of ten friends may not represent a town's market. Compare independent sources and keep a record of assumptions so a business can review a decision when new evidence appears.`,
  "Communication in business": `# Communication in business

Business communication exchanges information with customers, staff, suppliers and public agencies. It may be written, spoken or digital. A clear message identifies its purpose, audience, required action and deadline. Important agreements should be recorded so both parties can confirm what was decided.

An order confirmation should state the goods, quantity, price, delivery date and payment terms. Confidential data should be sent only through suitable channels to the intended recipient. Tone also matters: a complaint can be answered respectfully while the business checks the facts. Choose the channel according to urgency, detail and need for a permanent record.`,
  Banking: `# Banking

Banks provide accounts, payment services and loans to individuals and businesses. A current account is useful for frequent transactions; savings accounts hold funds and may earn interest. Businesses should compare account fees, transaction limits, access, security and the bank's terms before choosing an account.

A bank statement records transactions processed by the bank. The business should compare it with its own cash book, investigate unfamiliar entries and keep receipts. Digital banking saves time but requires secure passwords, device protection and careful checking of recipient details before confirming a transfer.`,
  "Savings and current accounts": `# Savings and current accounts

A savings account is designed to hold money and may pay interest; a current account supports frequent deposits and payments. The features vary by provider, so compare minimum balances, charges, withdrawal access, interest and documentation. A business's needs differ from a student's savings goal.

If a customer keeps emergency funds in an account with limited withdrawals, they should understand access rules before an urgent need arises. Interest is calculated according to the account terms and may be affected by balance and time. Keep statements and confirm that deposits and withdrawals are recorded accurately.`,
  "Cheques and payment methods": `# Cheques and payment methods

Businesses may pay or receive money using cash, bank transfers, cards, cheques and approved digital services. A cheque is a written instruction to a bank to pay a stated amount from an account, subject to validity and available funds. It can be dishonoured if requirements are not met.

Each payment method has different speed, cost, record and fraud risks. Before making a transfer, confirm the recipient and amount; never share a one-time code with someone who contacts you unexpectedly. A receipt or transaction reference supports reconciliation. Choose a method that is secure, accepted by the other party and appropriate for the amount.`,
  Insurance: `# Insurance

Insurance is an agreement in which an insurer provides defined financial protection in return for a premium, subject to the policy terms. The insured must disclose relevant information and follow conditions. Common business risks include fire, theft, vehicle damage and liability, but not every loss is covered.

Before buying a policy, compare the insured events, exclusions, excess, limits and claim procedure. A shop's fire policy may not cover flood damage unless that risk is included. Insurance transfers specified financial risk; it does not prevent the event or replace safety measures. Keep policy documents and report a claim within the required time.`,
  Transport: `# Transport

Transport moves people and goods between locations. Businesses choose road, rail, water or air transport according to distance, speed, cost, capacity and the nature of the goods. Perishable goods need timely handling; heavy bulk goods may be cheaper to move by a mode with high carrying capacity.

A retailer ordering vegetables should include transport time and spoilage risk in the total cost. Route disruption can delay delivery and affect customer service. Compare the full cost, including loading, insurance and storage, rather than only the fare. Clear delivery records help identify where a delay occurred.`,
  Warehousing: `# Warehousing

Warehousing stores goods between production and sale. It helps businesses maintain stock, balance seasonal supply and serve customers without waiting for each item to be produced. Warehouses need stock records, security, suitable conditions and safe handling procedures.

First-in, first-out rotation is useful for goods with expiry dates because older stock is issued first. A warehouse should record receipts, issues and balances, and investigate differences between records and physical counts. Too much stock ties up money and can spoil; too little can cause lost sales. Stock policy balances availability with holding cost.`,
  Advertising: `# Advertising

Advertising communicates a product or service to potential customers and may aim to inform, persuade or remind. A business chooses an audience, message, medium and budget. A useful advert makes the offer understandable and truthful; claims should be supported and must not hide important conditions.

A local bakery promoting a new bread might use a community noticeboard or social media, depending on who buys it. Measure results with enquiries or sales rather than views alone. Advertising can increase awareness, but price, quality, availability and customer service also affect whether people buy again.`,
  "Consumer protection": `# Consumer protection

Consumer protection safeguards buyers from unsafe goods, misleading claims, unfair terms and poor service. Consumers should receive accurate information, a receipt where appropriate and a way to raise a complaint. Businesses must comply with relevant product-safety, labelling and trading rules.

If an appliance stops working shortly after purchase, the buyer should keep the receipt, note the fault and contact the seller through its stated process. The remedy depends on the law, product and circumstances. A business should handle complaints consistently and avoid promising a remedy before checking the facts. Honest records protect both consumer and trader.`,
  Entrepreneurship: `# Entrepreneurship

Entrepreneurship is the process of identifying an opportunity, organising resources and taking calculated risks to create value. An entrepreneur may start a new business or improve an existing service. Success depends on more than a good idea: customers, costs, skills, regulation and cash flow all matter.

A student noticing demand for affordable lunch packs could interview potential buyers, estimate ingredient and packaging costs, test a small batch and revise the offer. This reduces uncertainty before a large investment. Risk cannot be removed, but it can be investigated and managed. Keep personal and business money separate and record every transaction.`,
  "Business opportunity": `# Business opportunity

A business opportunity is a customer need that can be served in a feasible and sustainable way. A promising idea should identify who the customers are, what problem they have, what alternatives already exist and whether they will pay enough to cover costs.

Before selling phone accessories near a school, a learner could observe existing shops, ask potential customers what they need and estimate supplier, transport and stall costs. Interest in an idea is not proof of demand; a small test can provide better evidence. Consider permissions, safety and competition before committing funds.`,
  "Simple bookkeeping": `# Simple bookkeeping

Bookkeeping is the systematic recording of business transactions. Each entry should have a date, description, amount and supporting document. Separate business transactions from personal spending so that income, expenses and cash balances can be assessed accurately.

A small trader who receives ₦8,000 from a customer records the receipt and identifies whether it is a cash sale or collection of an earlier debt. These are different transactions even though cash increases in both. At regular intervals, total receipts and payments, reconcile cash and keep documents in order. Consistent records help prepare accounts and make errors easier to find.`,
  "Cash book": `# Cash book

A cash book records cash and bank receipts and payments. Money received is entered on the receipts side; payments are entered on the payments side. A cash book can include separate columns for cash, bank and discounts, depending on the business's needs.

If an owner transfers ₦5,000 from the cash box into the bank, cash decreases and the bank balance increases. Record both sides as a contra entry. Compare the bank column with the statement and investigate timing differences or bank charges. Never alter an entry silently; document corrections so the record remains traceable.`,
  "Stock records": `# Stock records

Stock records track goods received, goods sold or issued and the quantity remaining. A stock card may include item code, date, supplier, quantity, unit cost and balance. Reliable records help prevent shortages, over-ordering and unnoticed loss.

If a shop starts with 40 notebooks, receives 25 and sells 18, the expected balance is 47. A physical count should be compared with the record; a difference may result from damage, recording error or theft and should be investigated. Set a reorder level based on demand and delivery time rather than waiting until stock is exhausted.`,
  "Profit and loss": `# Profit and loss

Profit is the excess of revenue over the costs attributable to earning that revenue during a period; a loss occurs when costs exceed revenue. Cash received is not always revenue for the period, and cash paid is not always an expense, because credit and accruals affect timing.

If a trader sells goods for ₦90,000 and the cost of those goods is ₦55,000, gross profit is ₦35,000. Deduct operating expenses such as rent and transport to find net profit. Drawings by the owner are not business expenses. Use the same time period for income and expenses when comparing performance.`,
  "Business documents": `# Business documents

Business documents record and support transactions. A quotation states proposed prices; a purchase order requests goods; an invoice requests payment; a receipt confirms payment; a delivery note lists goods delivered; a credit note adjusts an amount owed. Their purpose depends on the stage of the transaction.

When goods arrive, compare the delivery note with the purchase order and inspect quantities before signing. An invoice should be checked against the order and delivery record before payment. Keep documents in a consistent filing system so a transaction can be traced from order to payment. Documents may be paper or digital, but access and retention should be controlled.`,
  "Customer relations": `# Customer relations

Customer relations are the ways a business communicates with and supports its customers before, during and after a sale. Clear information, respectful treatment, reliable delivery and fair complaint handling can build trust and repeat business. A business should not promise what it cannot deliver.

When a customer reports a late order, record the issue, check the dispatch details, explain what is known and offer a realistic next step. Feedback can reveal a problem in ordering or delivery, but one complaint may not represent every customer. Protect customer contact information and use it only for appropriate business purposes.`,
  "Small business project": `# Small business project

A small business project develops and tests an idea using a simple plan. Describe the product or service, target customers, competitors, required resources, estimated costs, selling price and likely risks. Verify assumptions with a small survey or trial before investing heavily.

If a learner plans a weekend fruit stall, estimate purchase cost, transport, expected unsold stock and packaging. Break-even occurs when revenue covers total costs; sales above that point may produce profit, while lower sales create a loss. Keep records during the trial and compare actual results with estimates. The final review should explain what changed and what should be improved.`,
};

const courseGroups = [
  { subject: "Economics", ids: new Set(["ss1-economics", "ss2-economics", "ss3-economics"]), topics: economics, expected: 81 },
  { subject: "Accounting", ids: new Set(["ss1-accounting", "ss2-accounting", "ss3-accounting"]), topics: accounting, expected: 81 },
  { subject: "Literature in English", ids: new Set(["ss1-literature-in-english", "ss2-literature-in-english", "ss3-literature-in-english"]), topics: literature, expected: 81 },
  { subject: "Business Studies", ids: new Set(["jss2-business-studies", "jss3-business-studies"]), topics: business, expected: 54 },
];
const curriculum = JSON.parse(await fs.readFile(file, "utf8"));
const results = [];

for (const group of courseGroups) {
  let courses = 0;
  let lessons = 0;
  const missing = new Set();
  for (const course of curriculum.courses ?? []) {
    if (!group.ids.has(course.id)) continue;
    courses += 1;
    for (const module of course.modules ?? []) {
      for (const lesson of module.lessons ?? []) {
        const content = group.topics[lesson.title];
        if (!content) {
          missing.add(lesson.title);
          continue;
        }
        lessons += 1;
        const extension = group.subject === "Economics"
          ? economicsExtensions[lesson.title]
          : group.subject === "Accounting"
            ? accountingExtensions[lesson.title]
            : group.subject === "Literature in English"
              ? literatureExtensions[lesson.title]
            : undefined;
        const followUp = group.subject === "Economics"
          ? economicsFollowUps[lesson.title]
          : group.subject === "Accounting"
            ? accountingFollowUps[lesson.title]
            : group.subject === "Literature in English"
              ? literatureFollowUps[lesson.title]
              : undefined;
        lesson.content = [content, extension, followUp].filter(Boolean).join("\n\n");
        lesson.summary = content.replace(/^#\s+.+\n+/, "").replace(/\s+/g, " ").trim().slice(0, 320);
        lesson.contentVersion = "textbook-editorial-1";
      }
    }
  }

  const shortLessons = ["Economics", "Accounting", "Literature in English"].includes(group.subject)
    ? curriculum.courses.filter((course) => group.ids.has(course.id)).flatMap((course) => course.modules.flatMap((module) => module.lessons)).map((lesson) => ({ id: lesson.id, words: (String(lesson.content ?? "").match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []).length })).filter((lesson) => lesson.words < 200)
    : [];
  if (courses !== group.ids.size || lessons !== group.expected || missing.size || shortLessons.length) {
    throw new Error(JSON.stringify({ subject: group.subject, courses, lessons, expected: group.expected, shortLessons, missing: [...missing] }));
  }
  results.push({ subject: group.subject, courses, lessons, topics: Object.keys(group.topics).length });
}

if (applyChanges) await fs.writeFile(file, `${JSON.stringify(curriculum, null, 2)}\n`, "utf8");

console.log(JSON.stringify({ mode: applyChanges ? "apply" : "dry-run", groups: results }, null, 2));