/* Outrigger Impact — reference data
   Source: Outrigger Impact Fund pre-marketing presentation, 2025.
   Population and GDP figures per World Bank 2024 as cited in the deck appendix.
   EEZ areas (km²) were re-checked against the deck in August 2026 after four
   values were found to be wrong — the deck had shifted a block of rows, so
   Fiji's figure sat on the Dominican Republic and Dominica's on Comoros.
   `ap: true` marks a figure that is approximate; it renders with a "c." and
   must not be presented as exact. `note` carries a qualification that has to
   travel with the number.
   `window: true` marks the 20 UN SIDS Member States in the initial investment window.
   Coordinates are indicative national centroids, used for schematic plotting only. */

window.OI_STATES = [
  // name, region, ODA status, EEZ km², population, GDP per capita US$, GDP growth %, lat, lon, in window
  { n: "Kiribati",                          r: "Pacific",   oda: true,  eez: 3440220, pop: 134518,   gdp: 2289,  gr: 5.3,  lat: 1.45,   lon: 172.98, w: false },
  { n: "Federated States of Micronesia",    r: "Pacific",   oda: true,  eez: 3010644, pop: 113160,   gdp: 4166,  gr: 0.7,  lat: 6.92,   lon: 158.16, w: false },
  { n: "Papua New Guinea",                  r: "Pacific",   oda: true,  eez: 2403355, pop: 10576502, gdp: 3077,  gr: null, lat: -6.31,  lon: 143.95, w: false },
  { n: "Mauritius",                         r: "AIS",       oda: true,  eez: 2203542, pop: 1259509,  gdp: 11872, gr: 4.7,  lat: -20.35, lon: 57.55,  w: true  },
  { n: "Marshall Islands",                  r: "Pacific",   oda: true,  eez: 2001566, pop: 37548,    gdp: 7467,  gr: 2.8,  lat: 7.09,   lon: 171.38, w: false },
  { n: "Solomon Islands",                   r: "Pacific",   oda: true,  eez: 1605325, pop: 819198,   gdp: 2149,  gr: 2.5,  lat: -9.43,  lon: 159.95, w: true  },
  { n: "Seychelles",                        r: "AIS",       oda: false, eez: 1341504, pop: 121354,   gdp: 17859, gr: 3.5,  lat: -4.62,  lon: 55.45,  w: true  },
  { n: "Dominican Republic",                r: "Caribbean", oda: true,  eez: 350000, ap: true, pop: 11427557, gdp: 10876, gr: 5.0,  lat: 18.74,  lon: -70.16, w: true  },
  { n: "Maldives",                          r: "AIS",       oda: true,  eez: 920739,  pop: 527799,   gdp: 13215, gr: 5.1,  lat: 3.20,   lon: 73.22,  w: true  },
  { n: "Vanuatu",                           r: "Pacific",   oda: true,  eez: 810608,  pop: 327777,   gdp: 3543,  gr: 4.0,  lat: -17.74, lon: 168.32, w: false },
  { n: "Cabo Verde",                        r: "AIS",       oda: true,  eez: 801936,  pop: 524877,   gdp: 5273,  gr: 7.3,  lat: 15.12,  lon: -23.61, w: true  },
  { n: "Tuvalu",                            r: "Pacific",   oda: true,  eez: 753133,  pop: 9646,     gdp: 6345,  gr: 3.9,  lat: -8.52,  lon: 179.19, w: false },
  { n: "Tonga",                             r: "Pacific",   oda: true,  eez: 666052,  pop: 104175,   gdp: 4864,  gr: 2.1,  lat: -21.18, lon: -175.20, w: true },
  { n: "Bahamas",                           r: "Caribbean", oda: false, eez: 619785,  pop: 401283,   gdp: 39455, gr: 3.4,  lat: 25.03,  lon: -77.40, w: true  },
  { n: "Palau",                             r: "Pacific",   oda: true,  eez: 614807,  pop: 17695,    gdp: 15899, gr: 1.9,  lat: 7.51,   lon: 134.58, w: true  },
  { n: "Sri Lanka",                         r: "AIS",       oda: true,  eez: 533559,  pop: 21916000, gdp: 4516,  gr: 5.0,  lat: 7.87,   lon: 80.77,  w: true  },
  { n: "Dominica",                          r: "Caribbean", oda: true,  eez: 28552,  pop: 66205,    gdp: 10405, gr: 2.1,  lat: 15.41,  lon: -61.37, w: false },
  { n: "Nauru",                             r: "Pacific",   oda: true,  eez: 309261,  pop: 11947,    gdp: 13422, gr: 1.8,  lat: -0.52,  lon: 166.93, w: false },
  { n: "Jamaica",                           r: "Caribbean", oda: true,  eez: 286000, ap: true, note: "Published estimates range from about 274,000 km².",  pop: 2839175,  gdp: 7020,  gr: -0.7, lat: 18.11,  lon: -77.30, w: true  },
  { n: "Barbados",                          r: "Caribbean", oda: false, eez: 185007,  pop: 282467,   gdp: 25366, gr: 3.8,  lat: 13.19,  lon: -59.54, w: true  },
  { n: "Sao Tome and Principe",             r: "AIS",       oda: true,  eez: 165377,  pop: 235536,   gdp: 3245,  gr: 0.9,  lat: 0.19,   lon: 6.61,   w: false },
  { n: "Guyana",                            r: "Caribbean", oda: true,  eez: 139000, ap: true,  pop: 831087,   gdp: 29884, gr: 43.4, lat: 4.86,   lon: -58.93, w: true  },
  { n: "Suriname",                          r: "Caribbean", oda: true,  eez: 133303,  pop: 634431,   gdp: 7431,  gr: 2.8,  lat: 3.92,   lon: -56.03, w: true  },
  { n: "Samoa",                             r: "Pacific",   oda: true,  eez: 130480,  pop: 218019,   gdp: 4899,  gr: 9.4,  lat: -13.76, lon: -172.10, w: true },
  { n: "Antigua and Barbuda",               r: "Caribbean", oda: false, eez: 111568,  pop: 93772,    gdp: 23826, gr: 4.3,  lat: 17.06,  lon: -61.80, w: true  },
  { n: "Guinea-Bissau",                     r: "AIS",       oda: true,  eez: 106870,  pop: 2201352,  gdp: 963,   gr: 4.8,  lat: 11.80,  lon: -15.18, w: false },
  { n: "Trinidad and Tobago",               r: "Caribbean", oda: false, eez: 80173,   pop: 1368333,  gdp: 19315, gr: 1.7,  lat: 10.69,  lon: -61.22, w: true  },
  { n: "Timor-Leste",                       r: "Pacific",   oda: true,  eez: 77474,   pop: 1400638,  gdp: 1343,  gr: -2.2, lat: -8.87,  lon: 125.73, w: false },
  { n: "Saint Vincent and the Grenadines",  r: "Caribbean", oda: true,  eez: 36244,   pop: 100616,   gdp: 11501, gr: 4.1,  lat: 13.25,  lon: -61.20, w: false },
  { n: "Belize",                            r: "Caribbean", oda: true,  eez: 34312,   pop: 417072,   gdp: 8430,  gr: 8.2,  lat: 17.19,  lon: -88.50, w: true  },
  { n: "Comoros",                           r: "AIS",       oda: true,  eez: 164000, ap: true, note: "Subject to the treatment of Mayotte.",   pop: 866628,   gdp: 1784,  gr: 3.4,  lat: -11.65, lon: 43.33,  w: false },
  { n: "Fiji",                              r: "Pacific",   oda: true,  eez: 1289978,   pop: 928784,   gdp: 6288,  gr: 3.8,  lat: -17.71, lon: 178.07, w: true  },
  { n: "Grenada",                           r: "Caribbean", oda: true,  eez: 25571,   pop: 117207,   gdp: 11872, gr: 3.7,  lat: 12.12,  lon: -61.68, w: true  },
  { n: "Saint Lucia",                       r: "Caribbean", oda: true,  eez: 15413,   pop: 179744,   gdp: 14182, gr: 3.9,  lat: 13.91,  lon: -60.98, w: false },
  { n: "Saint Kitts and Nevis",             r: "Caribbean", oda: false, eez: 9502,    pop: 46843,    gdp: 22771, gr: 1.2,  lat: 17.36,  lon: -62.78, w: false }
];

/* Coarse continental outlines [lon, lat] — schematic orientation aid only, not a
   cartographic boundary. Deliberately low-detail: the map's subject is the ocean. */
window.OI_LAND = [
  // Africa
  [[10,37],[25,32],[34,31],[43,12],[51,12],[41,-2],[40,-16],[33,-26],[25,-34],[18,-34],
   [12,-17],[9,-1],[9,4],[3,6],[-8,4],[-17,15],[-17,21],[-10,30],[-6,36]],
  // Eurasia
  [[-9,43],[0,50],[10,55],[20,56],[28,60],[30,66],[40,68],[60,70],[75,73],[105,77],
   [130,73],[145,72],[162,70],[170,66],[163,60],[155,58],[142,54],[135,45],[130,42],
   [126,37],[122,30],[110,21],[105,10],[103,1],[98,8],[93,20],[88,22],[80,15],[72,20],
   [68,24],[60,25],[57,26],[50,28],[48,30],[43,37],[36,36],[30,40],[26,40],[20,42],[14,40],[8,44],[-2,43]],
  // North America
  [[-168,66],[-160,71],[-140,70],[-125,70],[-110,68],[-95,68],[-85,66],[-80,62],[-64,60],
   [-56,52],[-66,45],[-70,42],[-75,36],[-81,26],[-83,29],[-90,29],[-97,26],[-97,21],
   [-91,19],[-87,21],[-88,16],[-83,9],[-79,9],[-84,15],[-92,15],[-105,20],[-110,24],
   [-117,32],[-122,37],[-124,45],[-130,54],[-140,60],[-152,59],[-165,62]],
  // South America
  [[-81,0],[-79,-6],[-71,-18],[-70,-24],[-72,-38],[-73,-45],[-75,-52],[-68,-55],[-65,-50],
   [-62,-40],[-57,-35],[-48,-25],[-40,-20],[-35,-8],[-44,-2],[-50,0],[-52,5],[-60,8],
   [-67,11],[-72,12],[-77,8],[-79,2]],
  // Australia
  [[113,-22],[114,-27],[115,-34],[119,-34],[129,-32],[137,-33],[140,-38],[147,-38],
   [150,-37],[153,-28],[153,-25],[149,-20],[145,-15],[142,-11],[137,-12],[132,-11],
   [129,-15],[122,-17],[114,-22]],
  // New Zealand
  [[173,-35],[178,-38],[177,-40],[174,-41],[171,-44],[168,-47],[166,-45],[171,-42]],
  // Greenland
  [[-45,60],[-42,65],[-30,68],[-22,71],[-20,76],[-30,82],[-45,83],[-58,82],[-70,78],[-60,70],[-52,65]],
  // Madagascar
  [[49,-12],[50,-16],[48,-21],[46,-25],[44,-25],[43,-21],[45,-16],[47,-13]],
  // Borneo / Sulawesi / New Guinea shelf (indicative)
  [[109,2],[117,7],[119,5],[118,-1],[116,-4],[110,-3],[109,0]],
  [[131,-1],[137,-2],[141,-3],[147,-6],[151,-10],[144,-9],[138,-8],[133,-4]],
  // Japan
  [[131,33],[136,35],[140,38],[142,42],[145,44],[141,41],[137,37],[133,34]],
  // British Isles / Iceland (context)
  [[-6,50],[1,52],[0,58],[-5,58],[-6,54]],
  [[-22,64],[-15,65],[-14,66],[-22,66]]
];

/* Impact themes and the 14 KPIs, per the fund's impact framework. */
window.OI_KPIS = [
  { th: "Climate mitigation",      no: 1,  k: "Positive impact on climate change", m: "Tonnes of CO₂e mitigated or sequestered" },
  { th: "Climate adaptation",      no: 2,  k: "Climate resilience",                m: "Number of people with improved climate resilience" },
  { th: "Biodiversity",            no: 3,  k: "Ecosystem enhancement",             m: "Area of seascapes and landscapes under sustainable management (ha, including MPAs supported)" },
  { th: "Biodiversity",            no: 4,  k: "Protection of biodiversity",        m: "Project-level indicators tracking improvement in ecosystems and species" },
  { th: "Environmental resilience",no: 5,  k: "Pollution reduction",               m: "Project-level indicators tracking reduction in pollution — plastics, agrochemicals — and minimised water use" },
  { th: "Environmental resilience",no: 6,  k: "Blue infrastructure",               m: "Length of coastline with improved protection against extreme weather events (km)" },
  { th: "Economic resilience",     no: 7,  k: "Resilient enterprises",             m: "Number of enterprises supported that meet resilience criteria" },
  { th: "Economic resilience",     no: 8,  k: "Sustainable production",            m: "Value of production that is certified sustainable (US$)" },
  { th: "Economic resilience",     no: 9,  k: "Import substitution",               m: "Value of on-island production that would otherwise need to be imported" },
  { th: "Economic resilience",     no: 10, k: "Investment into SIDS",              m: "Total project investment brought to the island (US$, direct and co-investment)" },
  { th: "Livelihoods",             no: 11, k: "Employment",                        m: "Number of direct jobs created or supported" },
  { th: "Livelihoods",             no: 12, k: "Livelihoods",                       m: "Number of livelihoods created or supported, for example cooperative members" },
  { th: "Inclusion",               no: 13, k: "Gender equity",                     m: "Proportion of jobs held by women; number of women's livelihoods supported" },
  { th: "Inclusion",               no: 14, k: "Inclusion",                         m: "Project-level indicators tracking inclusion of all relevant groups, including age-related groups, Indigenous Peoples, LGBTQ+ people, vulnerable groups and minorities" }
];
