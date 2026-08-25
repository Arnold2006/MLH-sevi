import type { SiteSettings, Service, GalleryItem } from "./types";

export const DEFAULT_SETTINGS: SiteSettings = {
  businessName: "Summit Håndværkerservice",
  tagline: "Grundigt håndværk. Ærlig rådgivning. Faire priser.",
  phone: "+45 20 34 56 78",
  email: "mike@summit-haandvaeker.dk",
  serviceArea:
    "Aarhus, Lystrup, Hinnerup og omegn – typisk inden for 25 km.",
  hours: "Man – fre: 8.00 – 17.00\nLørdag: 9.00 – 13.00\nSøndag: Lukket",
  heroBadge: "Autoriseret · Forsikret · Lokal",
  heroHeadline: "Din boligs huskeliste – klaret.",
  heroSubtext:
    "Fra den dryppende hane til den skæve terrassebrædt – Summit Håndværkerservice løser de opgaver, du aldrig får tid til. Fast pris på forhånd og pænt resultat, når jeg går. Det er en garanti.",
  heroImage: "/images/hero.svg",
  heroImagePosition: "50% 50%",
  aboutHeadline: "Hej, jeg er Mike – din lokale håndværker.",
  aboutText:
    "Jeg startede Summit Håndværkerservice i 2011 efter mere end ti år i byggebranchen. Det begyndte med weekendopgaver for naboerne, men er siden vokset til en komplet håndværkervirksomhed – filosofien er dog præcis den samme: mød til tiden, sig en fair pris, lav kvalitetsarbejde, og efterlad hver bolig pænere, end jeg fandt den.\n\nNår du hyrer Summit, får du mig – ikke en roterende stab af underentreprenører. Jeg står inde for hver eneste opgave med et enkelt løfte: Er du ikke tilfreds med arbejdet, retter jeg det.\n\nNår jeg ikke står på stigen, træner jeg sønnens fodboldhold, strejfer rundt i byggemarkedet eller planlægger mit næste haveprojekt.",
  aboutImage: "/images/about.svg",
  aboutImagePosition: "50% 50%",
  homeWhyTitle: "Professionelt håndværk. Personlig service.",
  homeWhyBullets:
    "Gratis og uforpligtende tilbud\nGulve beskyttes og roden ryddes op – ved hver eneste opgave\nDe fleste projekter færdige i ét besøg\nMødestabil, autoriseret og fuldt forsikret",
  statYears: "15+",
  statJobs: "2.400+",
  ctaHeadline: "Klar til at strege det af listen?",
  ctaText:
    "Ring eller send en besked i dag og få et gratis, uforpligtende tilbud. De fleste opgaver kan prisgives efter ét besøg.",
};

export const DEFAULT_SERVICES: Service[] = [
  {
    id: "svc-general-repairs",
    order: 1,
    title: "Generelle reparationer",
    description:
      "Knirkende døre, klemmende vinduer, revnet fugemasse og løbende toiletcisterner – de små problemer, der vokser, hvis man ignorerer dem. Løst hurtigt og korrekt.",
    rate: "fra 349 kr.",
  },
  {
    id: "svc-plumbing",
    order: 2,
    title: "VVS-opgaver",
    description:
      "Udskiftning af haner og toiletsæt, utætte rør under vasken, ny affaldskværn – og lukning af den ene ventil, som ingen kan finde.",
    rate: "fra 399 kr.",
  },
  {
    id: "svc-electrical",
    order: 3,
    title: "Mindre el-arbejde",
    description:
      "Loftlamper, loftventilatorer, dimmere, reparation af stikkontakter og montering af ringeklokker. Små el-opgaver udført sikkert og efter forskrifterne.",
    rate: "fra 399 kr.",
  },
  {
    id: "svc-carpentry",
    order: 4,
    title: "Snedker- & listearbejde",
    description:
      "Hylder efter mål, loftsliste, gulvlister, udskiftning af rådne trædele og finlistearbejde med tætte samlinger og skarpe linjer.",
    rate: "fra 449 kr.",
  },
  {
    id: "svc-painting",
    order: 5,
    title: "Gips & maling",
    description:
      "Reparation af huller, matchning af struktur, fjernelse af vandskjolder og skarpe malepudsninger, der smelter usynligt sammen med de eksisterende vægge.",
    rate: "fra 499 kr.",
  },
  {
    id: "svc-tv-mounting",
    order: 6,
    title: "TV-montering & ophæng",
    description:
      "Tv i alle størrelser monteret sikkert i regler, kabler skjult og beslag vateret. Også spejle, kunstværker, hylder og gardinskinner.",
    rate: "fra 395 kr.",
  },
  {
    id: "svc-assembly",
    order: 7,
    title: "Montering af møbler",
    description:
      "Fladpakkemøbler, babysenge, grillafl, legeredskaber og træningsudstyr monteret – uden den berømte overskydende pose skruer.",
    rate: "fra 295 kr.",
  },
  {
    id: "svc-deck-fence",
    order: 8,
    title: "Terrasse- & hegnsløsninger",
    description:
      "Udskiftning af skæve brædder, stramning af løse gelændere, justering af porte, højtryksrensning og bejdse – så dine udendørsarealer forbliver sikre og flotte.",
    rate: "tilbud efter besigtigelse",
  },
];

export const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: "gal-backsplash",
    images: ["/images/gallery/kitchen-backsplash.svg"],
    title: "Køkkenvæg med metrofliser",
    description:
      "Metrofliser monteret i løbet af en weekend – laserrettede rækker, forseglet fuge og stikkontakter flyttet i niveau med den nye overflade.",
    category: "Indendørs",
    addedAt: "2026-07-12T09:00:00.000Z",
  },
  {
    id: "gal-deck",
    images: ["/images/gallery/deck-restoration.svg"],
    title: "Renovering af terrasse",
    description:
      "Elleve skæve brædder udskiftet, gelændere strammet, hele terrassen slebet og bejdset. Som ny til grillsommeren.",
    category: "Udendørs",
    addedAt: "2026-06-28T09:00:00.000Z",
  },
  {
    id: "gal-faucet",
    images: ["/images/gallery/bathroom-faucet.svg"],
    title: "Ny hane på badeværelset",
    description:
      "Gammeldags blandingsbatteri udskiftet med en moderne pull-down-hane i børstet stål. Nye tilløb og ingen dryp – garanteret.",
    category: "VVS",
    addedAt: "2026-06-14T09:00:00.000Z",
  },
  {
    id: "gal-lighting",
    images: ["/images/gallery/basement-lighting.svg"],
    title: "Ny belysning i kælderen",
    description:
      "Fire standardpærer udskiftet med indbyggede LED-spots. Samme kontakt, tre gange så meget lys, halvt så meget strøm.",
    category: "El",
    addedAt: "2026-05-30T09:00:00.000Z",
  },
  {
    id: "gal-paint",
    images: ["/images/gallery/living-room-paint.svg"],
    title: "Maleopfriskning af stuen",
    description:
      "Vægge spartlet, slebet og malet i varm hvid. Skarpe kanter malet i hånden – ingen kanter efter malertapen.",
    category: "Maling",
    addedAt: "2026-05-16T09:00:00.000Z",
  },
  {
    id: "gal-closet",
    images: ["/images/gallery/closet-shelving.svg"],
    title: "Garderobehylder efter mål",
    description:
      "Garderobsystem fra gulv til loft i krydsfiner med justerbare hylder. Fordoblede opbevaringspladsen i et lille soveværelse.",
    category: "Snedker",
    addedAt: "2026-04-25T09:00:00.000Z",
  },
  {
    id: "gal-door",
    images: ["/images/gallery/front-door.svg"],
    title: "Renovering af hoveddør",
    description:
      "Solbleget hoveddør afrenset, slebet, bejdset og forseglet med UV-beskyttelse. Beslag poleret og lås justeret.",
    category: "Udendørs",
    addedAt: "2026-04-10T09:00:00.000Z",
  },
  {
    id: "gal-ceiling-fan",
    images: ["/images/gallery/ceiling-fan.svg"],
    title: "Montering af loftventilator",
    description:
      "Loftbeslag monteret, vinger balanceret og fjernbetjeningsmodtager skjult i kuplen. Uden slingren og næsten lydløs.",
    category: "El",
    addedAt: "2026-03-22T09:00:00.000Z",
  },
];

export function defaultMessages() {
  return [];
}
