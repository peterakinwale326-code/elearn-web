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
        lesson.content = content;
        lesson.summary = content.replace(/^#\s+.+\n+/, "").replace(/\s+/g, " ").trim().slice(0, 320);
        lesson.contentVersion = "textbook-editorial-1";
      }
    }
  }

  if (courses !== group.ids.size || lessons !== group.expected || missing.size) {
    throw new Error(JSON.stringify({ subject: group.subject, courses, lessons, expected: group.expected, missing: [...missing] }));
  }
  results.push({ subject: group.subject, courses, lessons, topics: Object.keys(group.topics).length });
}

if (applyChanges) await fs.writeFile(file, `${JSON.stringify(curriculum, null, 2)}\n`, "utf8");

console.log(JSON.stringify({ mode: applyChanges ? "apply" : "dry-run", groups: results }, null, 2));