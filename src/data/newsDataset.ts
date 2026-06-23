import { NewsArticle } from '../types';

export const trainingCorpus: NewsArticle[] = [
  // --- REAL NEWS ARTICLES ---
  {
    id: 'real-1',
    title: 'NASA James Webb Space Telescope Observes Atmospheric Composition of Distant Exoplanet',
    text: 'NASA\'s James Webb Space Telescope has captured a highly detailed atmospheric profile of a hot gas giant exoplanet orbiting a sun-like star roughly 700 light-years away. Utilizing its high-precision infrared spectrograph instruments, the observatory revealed clear signatures of water vapor, sulfur dioxide, and carbon dioxide in the alien planet\'s atmosphere. This discovery represents the first time atmospheric chemistry has been mapped with such extreme detail on a planet outside our solar system, enabling astronomers to model planet formation processes and assess potential habitability characteristics in future deep space studies.',
    label: 'real',
    source: 'NASA Jet Propulsion Laboratory',
    date: 'August 14, 2025',
    summary: 'Webb telescope uses high-precision spectroscopy to detect atmospheric chemical compounds on a distant exoplanet.'
  },
  {
    id: 'real-2',
    title: 'European Central Bank Holds Interest Rates Steady Citing Controlled Inflation Metrics',
    text: 'The European Central Bank declared today that it will maintain its benchmark interest rates at the current levels, indicating that recent policy interventions have successfully guided inflationary pressures back toward long-term targets. Economists reported a moderate stabilization in consumer price index indices across Eurozone member states, although food and core services pricing remains elevated. The governing council stated that it would continue to follow a strict data-dependent strategy, avoiding premature commitments but remaining vigilant against potential supply chain disruptions or global oil volatility.',
    label: 'real',
    source: 'Reuters Business Desk',
    date: 'November 3, 2025',
    summary: 'ECB pauses rate adjustments as Eurozone inflationary pressures show steady signs of returning to targets.'
  },
  {
    id: 'real-3',
    title: 'Global Commission on Climate Action Unveils Annual Framework to Mitigate Carbon Emissions',
    text: 'At the annual environment summit in Geneva, delegates representing over eighty nations approved a comprehensive legal framework targeting the reduction of industrial carbon dioxide emissions by forty percent over the next decade. The agreement establishes a binding carbon pricing mechanism and mandates public reporting of industrial output metrics. Additionally, a combined capital fund of fifty billion dollars has been approved to finance clean energy transition initiatives in developing economies, prioritizing solar, wind, and geothermal grid modernizations.',
    label: 'real',
    source: 'Associated Press',
    date: 'October 19, 2025',
    summary: 'Summit delegates approve a legal framework and fifty billion dollar fund to accelerate international clean energy transition.'
  },
  {
    id: 'real-4',
    title: 'Federal Court Approves Landmark Anti-Trust Settlement Restructuring Digital Retail Markets',
    text: 'A federal district court has officially finalized a major anti-trust settlement that dismantles certain exclusive distribution practices of major technology conglomerates. The ruling mandates that digital storefronts must permit alternative payment processors and third-party application providers to operate freely without paying punitive commissions. Industry analysts expect this landmark structural reform will bolster marketplace competition, reduce consumer costs, and encourage smaller software startup organizations that were previously marginalized by platform monopolies.',
    label: 'real',
    source: 'The Wall Street Journal',
    date: 'February 12, 2026',
    summary: 'Court enters anti-trust order ending retail monopolies and allowing lower-commission alternative payment systems.'
  },
  {
    id: 'real-5',
    title: 'National Institutes of Health Publish Long-Term Study on Cardiovascular Benefits of Regular Exercise',
    text: 'Researchers at the National Institutes of Health have published a thirty-year observational study tracking cardiovascular health in a cohort of fifty thousand adults. The findings, published in the Journal of Medicine, demonstrate that individuals who engaged in at least one hundred and fifty minutes of moderate aerobic cardiovascular activity weekly had a thirty-six percent lower incidence of coronary artery disease compared to sedentary participants. The research controls for genetic baseline metrics, diet variations, and socio-economic variables, solidifying the policy recommendation for public athletic wellness frameworks.',
    label: 'real',
    source: 'NIH Journal of Medicine',
    date: 'June 5, 2025',
    summary: 'Large-scale thirty-year study confirms 36% reduction in coronary disease for adults exercising 150 minutes weekly.'
  },

  // --- FAKE NEWS ARTICLES ---
  {
    id: 'fake-1',
    title: 'SHOCKING SECRET: Secret Water Engine Discovered That Auto Companies Tried To Hide For Decades!!!',
    text: 'ALERT!!! A brilliant independent garage scientist in Ohio has just invented a secret engine that runs completely on ordinary tap water!!! This miracle device splits water molecules into pure hydrogen fuel on the fly, emitting zero greenhouse emissions. The giant oil conglomerates and corrupt auto manufacturers have been attempting to suppress this world-saving miracle technology for fifty years!!! Spread this viral news before they take this video down and hide it forever!!! High-ranking politicians have allegedly accepted billions in bribes to silence this inventor, who is now fleeing for his life!!! SHARE THIS NOW!!!',
    label: 'fake',
    source: 'TruthSeekersUnite Blog',
    date: 'March 15, 2026',
    summary: 'Clickbait article claiming an Ohio scientist invented a water-fueled engine that auto companies have suppressed with bribes.'
  },
  {
    id: 'fake-2',
    title: 'Medical Miracle: Doctors Terrified After Banana Extract Proved To Instantly Cure Cancer Overnight!',
    text: 'Wow!!! You will never believe this standard fruit that pharmaceutical corporations absolutely hate!!! A top-secret hospital trial in Switzerland recently revealed that concentrated banana peel compound injections destroy one hundred percent of malicious tumor cells in just six short hours! The chief medical researcher was immediately arrested by FDA secret agents to protect the lucrative chemotherapy industry Profits!!! Doctors are literally terrified of you learning this simple home cure. This natural remedy is completely free and works instantly for anyone! Do not trust the system, stock up on bananas immediately and save your family!!!',
    label: 'fake',
    source: 'HealthyNaturalConsciousness.net',
    date: 'January 28, 2026',
    summary: 'Sensational alternative health claim that banana peel extracts instantly eliminate all tumors overnight.'
  },
  {
    id: 'fake-3',
    title: 'UNBELIEVABLE! Hidden Government Documents Leak Showing Weather Control Machines Created Hurricanes',
    text: 'A classified military handbook leaked onto anonymous forums yesterday has shocked the entire globe!!! Whistleblower patriots have released official satellite coordinates confirming that recent major hurricanes were actually created in a secret laboratory using giant electromagnetic laser cannons! These climate weapons are being controlled by globalist elites to drive citizens out of rural areas and force them into crowded surveillance cities! The media is completely silent about this ultimate betrayal of humanity!!! Download these secret documents now before they wipe them from the internet and suspend all accounts!!!',
    label: 'fake',
    source: 'IntelDropFreePress',
    date: 'October 30, 2025',
    summary: 'Conspiracy article claiming leaked military handbooks prove hurricanes are artificially created by laser climate weapons.'
  },
  {
    id: 'fake-4',
    title: 'LEAKED ALERT: Global Bank Planning To Deactivate All Physical Currency Accounts By Next Friday!',
    text: 'URGENT!!! An anonymous high-ranking international central banker has secretly leaked that elite financial institutions have finalized a blueprint to completely terminate all physical cash transactions by next Friday!!! Every citizen\'s bank account will be forcefully converted into trackable carbon-credit digital tokens, and any physical paper money in your possession will instantly become totally worthless plastic waste!!! They are doing this to monitor your every purchase and lock your funds if you buy too much fuel. Get your physical cash out of the ATM machines before next Thursday lockouts start! Panic is spreading fast!!!',
    label: 'fake',
    source: 'CryptoPatriotFreedomNews',
    date: 'April 9, 2026',
    summary: 'Alarmist financial rumors asserting that physical cash will be deactivated and replaced by carbon token surveillance units next week.'
  },
  {
    id: 'fake-5',
    title: 'PROOF!!! Famous Film Actor Spares Billionaire In Secret Ritual Broadcasted On Deep Web Channels!',
    text: 'OMGGGG!!! Highly encrypted video files uncovered from darknet servers have confirmed that a legendary Hollywood award-winning actor and prominent tech billionaires held a secret globalist occult ritual in a private island last month!!! Leaked screenshots show powerful elites participating in bizarre ceremonies and drinking liquid synthetic gold to halt physical biological aging!!! Insiders claim several participants were cloned in high-tech underground laboratories after the event. The entire mainstream news media is taking billions in advertising to cover up this ultimate horizontal satanic scandal!!! Watch the bizarre video link here immediately!!!',
    label: 'fake',
    source: 'TheDarkEyeTruth',
    date: 'December 11, 2025',
    summary: 'Satirical or conspiratorial allegation claiming Hollywood actors and billionaires are drinking synthetic gold to halt aging.'
  }
];

export const testShowcaseArticles: NewsArticle[] = [
  {
    id: 'test-1',
    title: 'Global Semiconductor Alliance Announces Cooperative Supply Agreement for Quantum Processor Fab Units',
    text: 'A coalition of leading microchip manufacturers has announced a collaborative semiconductor supply chain pact to establish state-of-the-art lithography fabrication facilities in the Netherlands. The twenty-billion-euro endeavor aims to streamline supply lines for next-generation silicon-carbide quantum processors. Member companies signed a joint memo outlining operational goals, environmental standards, and technology transfer safeguards. The infrastructure expansion is backed by state infrastructure subsidies and will operate under strict regulatory and national security oversight to ensure robust global supply resilience against geopolitically motivated trade limits.',
    label: 'real',
    source: 'Financial Times Technology',
    date: 'June 18, 2026'
  },
  {
    id: 'test-2',
    title: 'CONFIRMED: Scientists Shocked After Groundbreaking Anti-Gravity Device Successfully Tests In Basement!',
    text: 'OH MY GOD!!! A renegade former space engineer has successfully engineered an anti-gravity propulsion drive using standard kitchen copper wiring and magnetron parts from a broken microwave!!! Footage uploaded online shows heavy iron weights literally floating in mid-air in his basement workshop!!! Shockingly, NASA and FBI agents immediately raided his home to confiscate the propulsion machine and erase his digital hard-drives, but patriot neighbors managed to preserve identical flash-drive copies of the blueprint designs. Click the button below to download the schematic plans and power your home for free before this webpage is forcibly taken down!!!',
    label: 'fake',
    source: 'FreeEnergyAndLevitationBlog',
    date: 'June 21, 2026'
  },
  {
    id: 'test-3',
    title: 'World Health Organization Declares Elimination of Wild Poliovirus Variant Across Southeast Asia region',
    text: 'The World Health Organization officially confirmed today that the transmissible wild poliovirus variant has been fully eradicated in Southeast Asia. This monumental achievements in global public health is the culmination of a rigorous two-decade vaccination campaign launched in cooperation with provincial ministries, local health workers, and humanitarian non-profit organizations. Epidemiologists noted that no native active transmissions of the virus have been reported for four consecutive years. Continued environmental surveillance and routine childhood vaccination cycles will remain in place to prevent external reimportation hazards.',
    label: 'real',
    source: 'World Health News Bulletin',
    date: 'April 14, 2026'
  },
  {
    id: 'test-4',
    title: 'STUNNING LEAK: Massive Underground City Discovered Under Grand Canyon Filled With Giant Alien Gold Statues!',
    text: 'WE ARE NOT ALONE!!! A brave hiker exploring deep off-limit zones inside the Grand Canyon has accidentally discovered a massive hidden cavern entrance that leads to a high-tech subterranean city of giant titanium pyramids!!! Inside, tourists would find thousands of massive pure gold humanoid statues reaching over fifteen feet high along with metallic tablets displaying highly advanced stellar maps of distant galaxy systems. Mainstream archaeologists are actively working with the special forces to conceal the excavation site to avoid completely rewriting human history!!! Share this viral post to blow this conspiracy wide open!!!',
    label: 'fake',
    source: 'AnomalousAncientAliens.org',
    date: 'June 20, 2026'
  }
];
