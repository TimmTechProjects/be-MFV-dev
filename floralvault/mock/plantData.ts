// import { Plant } from "@/types/plants";

// export const plantData: Plant[] = [
//   {
//     id: "1",
//     scientific_name: "Ocimum basilicum",
//     common_name: "Basil",
//     slug: "ocimum-basilicum",
//     origin: "India",
//     family: "Lamiaceae",
//     type: "herb",
//     imageUrl: [
//       "https://images.unsplash.com/photo-1500420254515-0faefa2dac99?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3",
//     ],
//     description: `
//   <h1>The Majestic <span style="color:#81a308;">Basil</span> 🌿</h1>
//   <blockquote><em>“Queen of the Herbs” - every Italian grandma, ever</em></blockquote>
//   <p><strong>Basil</strong> (<em>Ocimum basilicum</em>) is more than just pesto’s best friend.</p>
//   <h2>Why it slaps:</h2>
//   <ol>
//     <li><code>Sweet & spicy aroma</code> that punches your senses awake.</li>
//     <li><mark>Contains eugenol</mark> (yes, science!) – an anti-inflammatory warrior.</li>
//     <li>Basically <strong>immune-boosting green gold</strong>.</li>
//   </ol>
//   <pre><code class="language-javascript">
//   const aroma = "heavenly";
//   const basil = { purpose: "healing + culinary", rating: 5 };
//   </code></pre>
//   <hr />
//   <p style="font-size: 1.25rem;">Warning: May cause uncontrollable pizza cravings 🍕</p>
// `,
//     userId: "user-101",
//     tags: ["culinary", "medicinal", "fragrant"],
//     views: 124,
//     createdAt: new Date("2024-12-01T10:30:00Z"),
//     updatedAt: new Date("2025-01-15T14:12:00Z"),
//     isPublic: true,
//   },
//   {
//     id: "2",
//     scientific_name: "Ganoderma lucidum",
//     common_name: "Reishi Mushroom",
//     slug: "ganoderma-lucidum",
//     origin: "East Asia",
//     family: "Ganodermataceae",
//     type: "mushroom",
//     imageUrl: [
//       "https://learn.freshcap.com/wp-content/uploads/2020/07/reishi-grow-blog-title.png",
//     ],
//     description: `
//   <h1>🍄 Reishi: The <span style="color:purple;">Mushroom of Immortality</span></h1>
//   <p><strong>Ganoderma lucidum</strong> isn’t just a fungus... it’s a <em>lifestyle</em>.</p>
//   <h2>Use cases (100% wizard approved):</h2>
//   <ul>
//     <li><b>🛡️ Immune Enhancement</b> – like armor for your T-cells</li>
//     <li><b>🧘 Stress Defense</b> – instant chill with adaptogenic vibes</li>
//     <li><b>💜 Liver Protection</b> – yes, your liver has a guardian angel now</li>
//   </ul>
//   <blockquote>“Tastes like bark. Works like magic.” – herbalists, probably</blockquote>
//   <hr />
//   <p><code>reishi.mood = zen;</code></p>
//   <p><strong style="color:gold;">Drink it. Dry it. Worship it.</strong></p>
// `,

//     userId: "user-101",
//     tags: ["immune", "adaptogen", "mushroom"],
//     views: 87,
//     createdAt: new Date("2025-01-10T08:00:00Z"),
//     updatedAt: new Date("2025-03-01T09:15:00Z"),
//     isPublic: true,
//   },
//   {
//     id: "3",
//     scientific_name: "Aloe vera",
//     common_name: "Aloe",
//     slug: "aloe-vera",
//     origin: "Arabian Peninsula",
//     family: "Asphodelaceae",
//     type: "succulent",
//     imageUrl: [
//       "https://atalayabio.com/cdn/shop/articles/ATALAYABIO_HijuelosAloeVera-1080x1080px_77788d9f-223a-45be-abf6-1650d2c07de2.jpg?v=1715778245",
//     ],
//     description: `
//   <h1 style="text-decoration: underline;">Aloe Vera: Nature's First Aid Kit 🧪</h1>
//   <p><em>Aloe</em> is the friend who always has tissues, lip balm, and emotional support ready.</p>
//   <h2>Why it’s the MVP:</h2>
//   <ul>
//     <li><strong>Saves you from sunburns</strong> (a true hero)</li>
//     <li><i>Hydration</i> levels = 🌊 peak</li>
//     <li><span style="color:teal;">Soothes, cools, and conquers inflammation</span></li>
//   </ul>
//   <blockquote><em>Also fun to squish.</em></blockquote>
//   <pre><code>
//   if (burned) {
//     rub(aloeVeraGel);
//   }
//   </code></pre>
//   <hr />
//   <p style="font-weight:bold; font-size: 1.25rem;">💧 Moisture game: strong</p>
// `,

//     userId: "user-204",
//     tags: ["healing", "skin-care", "succulent"],
//     views: 210,
//     createdAt: new Date("2025-02-15T09:00:00Z"),
//     updatedAt: new Date("2025-03-20T16:45:00Z"),
//     isPublic: true,
//   },
//   {
//     id: "4",
//     scientific_name: "Mentha spicata",
//     common_name: "Spearmint",
//     slug: "mentha-spicata",
//     origin: "Europe",
//     family: "Lamiaceae",
//     type: "herb",
//     imageUrl: [
//       "https://www.hishtil.com/media/20982/mentha-spicata-spanish.jpg?width=700&height=700&mode=crop",
//     ],
//     description: `<h3>Overview</h3>
// <p><strong>Spearmint</strong> is a refreshing perennial herb belonging to the <em>Lamiaceae</em> family, widely appreciated for its clean, sweet aroma and medicinal versatility.</p>

// <h4>🧪 Constituents & Benefits</h4>
// <ul>
//   <li>Contains <strong>carvone</strong> – a key compound responsible for its sweet scent</li>
//   <li>Traditionally used for <em>digestive comfort</em> and nausea reduction</li>
//   <li>Has mild sedative effects helpful in <u>stress management</u></li>
// </ul>

// <blockquote>“If peppermint is the bold extrovert, spearmint is its mellow cousin.”</blockquote>

// <h4>🌱 Common Uses</h4>
// <ul>
//   <li>Herbal teas (especially for children and sensitive stomachs)</li>
//   <li>Natural flavoring in chewing gum and toothpaste</li>
//   <li>DIY infusions for skin-soothing toners</li>
// </ul>

// `,
//     userId: "user-302",
//     tags: ["tea", "digestive", "aromatic"],
//     views: 145,
//     createdAt: new Date("2025-02-02T10:30:00Z"),
//     updatedAt: new Date("2025-03-05T11:12:00Z"),
//     isPublic: true,
//   },
//   {
//     id: "5",
//     scientific_name: "Lavandula angustifolia",
//     common_name: "Lavender",
//     slug: "lavandula-angustifolia",
//     origin: "Mediterranean",
//     family: "Lamiaceae",
//     type: "shrub",
//     imageUrl: [
//       "https://romencegardens.com/cdn/shop/files/lavandula_sweetromance1__72025.1711380523.1280.1280.jpg?v=1724161421&width=1214",
//     ],
//     description: `
//       <h3>Overview</h3>
// <p><strong>Lavender</strong> is a woody perennial shrub known for its calming aroma and iconic purple blossoms. It's a flagship herb in aromatherapy and skincare.</p>

// <h4>🧘 Therapeutic Profile</h4>
// <ul>
//   <li>Reduces anxiety, restlessness, and insomnia</li>
//   <li>Antimicrobial and anti-inflammatory effects topically</li>
//   <li>Repels moths and mosquitoes when dried</li>
// </ul>

// <h4>🛠️ Applications</h4>
// <ol>
//   <li>Essential oil diffusers or topical balms</li>
//   <li>Herbal compresses and bath blends</li>
//   <li>Dried flowers for sachets or drawer liners</li>
// </ol>

// <blockquote><em>“Lavender is to the nervous system what a hug is to the soul.”</em></blockquote>

//       `,
//     userId: "user-302",
//     tags: ["aromatherapy", "calming", "decorative"],
//     views: 174,
//     createdAt: new Date("2025-01-20T14:10:00Z"),
//     updatedAt: new Date("2025-02-18T13:00:00Z"),
//     isPublic: true,
//   },
//   {
//     id: "6",
//     scientific_name: "Echinacea purpurea",
//     common_name: "Echinacea",
//     slug: "echinacea-purpurea",
//     origin: "North America",
//     family: "Asteraceae",
//     type: "flower",
//     imageUrl: [
//       "https://www.bluestoneperennials.com/img/ECPU/650/ECPU_0_Echinacea_Purpurea.1491333866.jpg",
//     ],
//     description: `
//       <h3>Overview</h3>
// <p><strong>Echinacea</strong> is a native North American wildflower revered for its immune-modulating properties, especially during cold and flu season.</p>

// <h4>🌿 Medicinal Insight</h4>
// <p>All parts of the plant are used, but the <strong>root</strong> and <strong>flower heads</strong> are most potent. It stimulates macrophage activity and is commonly taken as:</p>

// <ul>
//   <li>Alcohol-based tinctures</li>
//   <li>Tea infusions</li>
//   <li>Capsules or lozenges</li>
// </ul>

// <h4>⚠️ Note</h4>
// <p>Short-term use is preferred. Long-term usage may cause immune overstimulation in sensitive individuals.</p>
//       `,
//     userId: "user-104",
//     tags: ["immune", "flower", "wild"],
//     views: 95,
//     createdAt: new Date("2025-02-12T07:20:00Z"),
//     updatedAt: new Date("2025-03-01T08:35:00Z"),
//     isPublic: true,
//   },
//   {
//     id: "7",
//     scientific_name: "Vaccinium myrtillus",
//     common_name: "Bilberry",
//     slug: "vaccinium-myrtillus",
//     origin: "Europe",
//     family: "Ericaceae",
//     type: "shrub",
//     imageUrl: [
//       "https://www.la-saponaria.com/img/cms/mirtillo-frutto-pianta.jpg",
//     ],
//     description: `
//       <h3>Overview</h3>
// <p><strong>Bilberry</strong> is a low-growing European shrub bearing dark berries rich in <em>anthocyanins</em>—potent antioxidants linked to vascular health and vision support.</p>

// <h4>👁️ Benefits</h4>
// <ul>
//   <li>Improves <strong>night vision</strong> (famously used by WWII pilots)</li>
//   <li>Strengthens fragile capillaries and reduces bruising</li>
//   <li>Regulates blood sugar and supports insulin sensitivity</li>
// </ul>

// <blockquote><em>“Where blueberries whisper, bilberries roar—in phytochemical depth.”</em></blockquote>

// <h4>🥣 Preparation</h4>
// <p>Traditionally consumed as jam, dried fruit, or herbal syrup. Excellent for herbal formulations targeting the circulatory system.</p>
//   `,
//     userId: "user-104",
//     tags: ["antioxidant", "vision", "circulatory"],
//     views: 96,
//     createdAt: new Date("2025-02-11T10:00:00Z"),
//     updatedAt: new Date("2025-03-02T12:00:00Z"),
//     isPublic: true,
//   },
//   {
//     id: "8",
//     scientific_name: "Gynostemma pentaphyllum",
//     common_name: "Jiaogulan",
//     slug: "gynostemma-pentaphyllum",
//     origin: "China",
//     family: "Cucurbitaceae",
//     type: "vine",
//     imageUrl: [
//       "https://seedsforgarden.com/cdn/shop/articles/Gynostemma_pentaphyllum_Seeds.jpg?v=1738695286",
//     ],
//     description: `
//       <h2>Overview</h2>
// <p><strong>Jiaogulan</strong>, also known as <em>“The Herb of Immortality”</em>, is a vine native to China and prized in traditional medicine for its extensive health-supporting properties.</p>

// <h3>🧠 Nervous System Support</h3>
// <ul>
//   <li>Protects both the central and peripheral nervous systems through potent antioxidants</li>
//   <li>Boosts nitric oxide production to shield nerve cells from oxidative damage</li>
//   <li>Improves blood flow via nitric oxide’s natural vasodilating effect</li>
// </ul>

// <h3>🔥 Metabolic & Cellular Defense</h3>
// <ul>
//   <li>Activates AMP-activated protein kinase (AMPK) to stimulate fat burning and energy release</li>
//   <li>Induces apoptosis in damaged cells and assists with DNA repair</li>
//   <li>Boosts <strong>Super-Oxide Dismutase (SOD)</strong> production—an elite antioxidant tied to disease resistance and anti-aging</li>
// </ul>

// <h3>🧘 Adaptogenic Balance</h3>
// <ul>
//   <li>Helps maintain physiological equilibrium under stress</li>
//   <li>Reduces systemic inflammation</li>
//   <li>Can be prepared as a tea (using leaves) or dried root supplement</li>
// </ul>
// <blockquote>“Jiaogulan doesn’t just promote longevity—it enhances the quality of that longevity.”</blockquote>

//       `,
//     userId: "user-888",
//     tags: ["adaptogen", "longevity", "tea"],
//     views: 115,
//     createdAt: new Date("2025-01-25T09:45:00Z"),
//     updatedAt: new Date("2025-02-28T11:20:00Z"),
//     isPublic: true,
//   },
//   {
//     id: "9",
//     scientific_name: "Ferula drudeana",
//     common_name: "Ferula",
//     slug: "ferula-drudeana",
//     origin: "Turkey",
//     family: "Apiaceae",
//     type: "herb",
//     imageUrl: [
//       "https://thebigsmoke.com.au/wp-content/uploads/Ferula_assa-foetida_-_Kyzylkum_5-scaled.jpg",
//     ],
//     description: `
//       <h2>Overview</h2>
// <p><strong>Ferula drudeana</strong> is a rare herb found in Turkey and believed by some scholars to be the lost medicinal plant <em>Silphion</em>—a botanical treasure of the ancient world.</p>

// <h3>🧪 Pharmacological Highlights</h3>
// <ul>
//   <li>Contains sesquiterpene lactones—compounds shown to inhibit tumor growth and trigger apoptosis</li>
//   <li>Demonstrates antibacterial, antiviral, and antifungal activities</li>
//   <li>Offers anti-inflammatory and antioxidant benefits</li>
// </ul>

// <h3>💫 Historical & Reproductive Use</h3>
// <ul>
//   <li>Traditionally used for managing menstrual irregularities and reproductive health</li>
//   <li>Possibly a rediscovery of <em>Silphion</em>, once used as a digestive tonic and contraceptive</li>
// </ul>

// <h3>⚠️ Caution</h3>
// <ul>
//   <li><strong>Not recommended during pregnancy</strong> due to potential uterine-stimulating effects</li>
//   <li>May assist with headaches, nerve pain, and muscle discomfort</li>
// </ul>
// <blockquote>“Ferula drudeana is as much a botanical mystery as it is a therapeutic marvel.”</blockquote>

//       `,
//     userId: "user-888",
//     tags: ["ancient", "digestive", "rare"],
//     views: 132,
//     createdAt: new Date("2025-01-12T08:30:00Z"),
//     updatedAt: new Date("2025-03-03T10:00:00Z"),
//     isPublic: true,
//   },
//   {
//     id: "10",
//     scientific_name: "Agave tequilana",
//     common_name: "Blue Agave",
//     slug: "agave-tequilana",
//     origin: "Mexico",
//     family: "Asparagaceae",
//     type: "succulent",
//     imageUrl: [
//       "https://www.littlerednursery.com/cdn/shop/files/tequilla.jpg?v=1709492819",
//     ],
//     description: `
//       <h2>Overview</h2>
// <p><strong>Blue Agave</strong> is a resilient succulent native to Mexico, most famously distilled into <em>tequila</em>, but packed with metabolic and gut-supporting benefits.</p>

// <h3>🌿 Nutritional Powerhouse</h3>
// <ul>
//   <li>Rich in <strong>inulin</strong>, a prebiotic fiber that nurtures Bifidobacteria and Lactobacilli</li>
//   <li>Improves calcium and magnesium absorption</li>
//   <li>Slows down sugar uptake, aiding glycemic control</li>
// </ul>

// <h3>🩺 Traditional & Modern Uses</h3>
// <ul>
//   <li>Sap used topically for burns and wounds due to antimicrobial traits</li>
//   <li>May reduce liver fat and improve gut health</li>
//   <li>Low-glycemic alternative to conventional sweeteners</li>
// </ul>

// <h3>⚠️ Caution</h3>
// <ul>
//   <li>Raw agave contains oxalates and should not be consumed uncooked</li>
// </ul>
// <blockquote>“Agave isn’t just for tequila—its inulin content is a quiet revolution for gut health.”</blockquote>

//       `,
//     userId: "user-101",
//     tags: ["digestive", "prebiotic", "succulent"],
//     views: 176,
//     createdAt: new Date("2025-02-01T14:00:00Z"),
//     updatedAt: new Date("2025-03-10T16:30:00Z"),
//     isPublic: true,
//   },
// ];
