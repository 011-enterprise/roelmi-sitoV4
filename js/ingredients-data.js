/* ==========================================================================
   Catalogo ingredienti — dati del prototipo (SITO 1, js/finder.js)
   Quando arriva il catalogo vero basta sostituire questo elenco.
   Le texture sono provvisorie (le stesse della home).
   Caricato con <script> (non con fetch): funziona anche aprendo il file in locale.
   ========================================================================== */

window.ROELMI_INGREDIENTS = [
  {
    id: 1,
    name: 'CytoFruit®',
    form: 'liquid',   // forma fisica = pittogramma (PROVA SITO 4, assegnata a occhio)
    line: 'CytoFruit',
    function: 'Biologically active waters',
    market: ['Personal Care'],
    technology: ['Nature'],
    type: 'Active',
    category: '',
    benefits: [],
    certifications: ['COSMOS/ICEA', 'Palm oil free'],
    description: 'Fruit-derived active waters that replace demineralized water in formulations. Naturally processed and enriched in oligoelements, with protective and cell-vitality benefits for sustainable, high-performance formulas.',
    texture: 'images/portfolio/texture-2.jpg',
    link: 'cytofruit.html'
  },
  {
    id: 2,
    name: 'SelectSIEVE® HopE',
    form: 'powder',
    line: 'SelectSIEVE',
    function: 'GLP-1 natural support',
    market: ['Nutraceutical'],
    technology: ['Nature'],
    type: 'Active',
    category: '',
    benefits: ['Weight management'],
    certifications: ['RSPO', 'Palm oil free'],
    description: 'Hop cone bioactives via supercritical CO₂ extraction, stabilised in powder form — supporting weight management, insulin sensitivity and natural GLP-1 release for metabolic health applications.',
    texture: 'images/portfolio/texture-6.jpg',
    link: '#'
  },
  {
    id: 3,
    name: 'TechnoHYAL® HyaPearl',
    form: 'wax-pearls',
    line: 'TechnoHYAL',
    function: 'Active Make-Up',
    market: ['Personal Care'],
    technology: ['Biotech'],
    type: 'Active',
    category: '',
    benefits: ['Active make up', 'Hydration (Long Term)'],
    certifications: ['NATRUE', 'COSMOS/ICEA'],
    description: 'Olive glycerides and hyaluronic acid combined in a patented matrix — delivering hydration and skin nourishment in anhydrous color cosmetic formulations for active make-up.',
    texture: 'images/portfolio/texture-1.jpg',
    link: '#'
  },
  {
    id: 4,
    name: 'ColorGLAM®',
    form: 'powder',
    line: 'ColorGLAM',
    function: 'Color portfolio',
    market: ['Personal Care'],
    technology: ['Nature'],
    type: 'Functional',
    category: 'Pigments',
    benefits: ['Active make up', 'Pigments dispersant'],
    certifications: ['RSPO', 'Palm oil free'],
    description: 'Ester-coated pigments functionalized with Tripelargonin, an upcycled sustainable ester — for high color release, formulation stability and a weightless, refined skin feel.',
    texture: 'images/portfolio/texture-5.jpg',
    link: '#'
  },
  // Prodotti nuovi (testi del cliente, 02/11/2026). color = colore della linea
  // dietro il pittogramma (base.css, --line-…); form scelta da confermare
  {
    id: 5,
    name: 'Beaulixir®',
    form: 'liquid',
    line: 'Beaulixir',
    color: 'beaulixir',
    function: 'A hair wellness potion',
    market: ['Nutraceutical'],
    technology: ['Nature'],
    type: 'Active',
    category: '',
    benefits: ['Hair loss', 'Hair health'],
    certifications: [],
    description: 'Fatty acids and phytosterols from six botanical oils that reduce hair loss and improve density, thickness and shine. Dosage: 400–600 mg a day.',
    texture: 'images/portfolio/texture-6.jpg',
    link: '#'
  },
  {
    id: 6,
    name: 'SelectSIEVE® Glitter',
    form: 'powder',
    line: 'SelectSIEVE',
    color: 'glitter',
    function: 'Radiance that starts from within',
    market: ['Nutraceutical'],
    technology: ['Nature'],
    type: 'Active',
    category: '',
    benefits: ['Dark spots', 'Skin ageing'],
    certifications: [],
    description: 'Polyphenols from olive fruit and licorice root that reduce dark spots and hyperpigmentation for a brighter, more even complexion. Dosage: 200 mg a day.',
    texture: 'images/portfolio/texture-6.jpg',
    link: 'selectsieve-glitter.html'
  },
  {
    id: 7,
    name: 'SeidoTech® Lux',
    form: 'liquid-gel',
    line: 'SeidoTech',
    color: 'seidotech',
    function: 'Eye contour revitalization',
    market: ['Personal Care'],
    technology: ['Biotech'],
    type: 'Active',
    category: '',
    benefits: ['Dark circles', 'Eye bags'],
    certifications: ['COSMOS', 'Halal'],
    description: 'A precision-fermented extract from Italian vine leaves for dark circles, eye bags and signs of fatigue, supported by a clinical study on 120 participants. Use level: 1%.',
    texture: 'images/portfolio/texture-1.jpg',
    link: '#'
  }
];
