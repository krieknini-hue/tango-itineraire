import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const venuesPath = path.join(__dirname, '../src/data/scraped_venues.json');
const rawVenues = JSON.parse(fs.readFileSync(venuesPath, 'utf8'));

console.log(`Lecture de ${rawVenues.length} événements / lieux...`);

const contactsMap = new Map();

for (const venue of rawVenues) {
  const org = venue.organizer;
  if (!org) continue;

  const email = (org.email || '').toLowerCase().trim();
  const name = (org.name || '').trim();
  const phone = (org.phone || '').trim();
  const website = (org.website || '').trim();

  // Clé unique basée sur l'email, ou le nom si pas d'email
  const key = email || name.toLowerCase();
  if (!key) continue;

  if (!contactsMap.has(key)) {
    // Nettoyer le téléphone pour WhatsApp (ex: 06 12 34 56 78 -> 33612345678)
    let cleanPhone = phone.replace(/[\s\.\-\(\)]/g, '');
    let waPhone = cleanPhone;
    if (waPhone.startsWith('0') && waPhone.length === 10) {
      waPhone = '33' + waPhone.slice(1);
    } else if (waPhone.startsWith('+33')) {
      waPhone = waPhone.slice(1);
    }

    contactsMap.set(key, {
      id: venue.id,
      organizerName: name || 'Association / Collectif Tango',
      email: email,
      phone: phone,
      waPhone: waPhone,
      website: website,
      milongaTitle: venue.title || 'Milonga locale',
      city: venue.city || 'France',
      postalCode: venue.postalCode || '',
      address: venue.address || '',
      floor: venue.floor || 'Parquet',
      status: 'to_contact',
      lastContactedAt: null,
      notes: ''
    });
  }
}

const contacts = Array.from(contactsMap.values()).sort((a, b) => 
  a.city.localeCompare(b.city, 'fr', { sensitivity: 'base' })
);

console.log(`Déduplication terminée : ${contacts.length} organisateurs uniques trouvés.`);

// 1. Sauvegarde du JSON pour l'interface web
const outputPathJson = path.join(__dirname, '../src/data/organizers_contacts.json');
fs.writeFileSync(outputPathJson, JSON.stringify(contacts, null, 2), 'utf8');
console.log(`✓ Fichier JSON généré : ${outputPathJson}`);

// 2. Sauvegarde du CSV pour Excel / Google Sheets / Brevo
const csvRows = [
  ['ID', 'Association / Organisateur', 'Milonga', 'Ville', 'Code Postal', 'Email', 'Telephone', 'WhatsApp_Format', 'Site Web', 'Statut'].map(v => `"${v}"`).join(';')
];

for (const c of contacts) {
  csvRows.push([
    c.id,
    c.organizerName.replace(/"/g, '""'),
    c.milongaTitle.replace(/"/g, '""'),
    c.city.replace(/"/g, '""'),
    c.postalCode,
    c.email,
    c.phone,
    c.waPhone,
    c.website,
    c.status
  ].map(v => `"${v || ''}"`).join(';'));
}

const outputPathCsv = path.join(__dirname, '../contacts_associations_tango.csv');
fs.writeFileSync(outputPathCsv, '\uFEFF' + csvRows.join('\r\n'), 'utf8'); // BOM pour Excel
console.log(`✓ Fichier CSV généré : ${outputPathCsv}`);

// 3. Fichier Markdown récapitulatif avec les modèles de messages
const mdSummary = `# 📋 Campagne de Contact & Partenariats — Tango Itinéraire

Ce document regroupe la stratégie de communication, les modèles d'e-mails et de messages WhatsApp prêts à l'envoi pour prévenir les associations et les milongas partenaires.

---

## 📊 Statistiques de la Base
- **Total contacts uniques :** ${contacts.length} associations / organisateurs
- **Avec adresse e-mail :** ${contacts.filter(c => c.email).length}
- **Avec numéro de téléphone :** ${contacts.filter(c => c.phone).length}
- **Fichier tableur Excel exporté :** \`contacts_associations_tango.csv\` à la racine du projet.

---

## 💌 Modèle 1 — E-mail Officiel & Partenariat Bienveillant (Recommandé)

**Objet :** \`Tango Itinéraire x [Nom Asso] — Valorisation gratuite de votre milonga [Nom Milonga]\`

**Corps du message :**
\`\`\`text
Bonjour [Nom Organisateur],

Nous vous contactons de la part du collectif associatif Tango Itinéraire.

Comme beaucoup de danseurs passionnés, nous nous retrouvons souvent sur les routes de France (vacances, week-ends, tournées) à chercher où danser le soir venu. Entre les informations dispersées sur Facebook et les sites non mis à jour, il est souvent très difficile de trouver les milongas locales qui se trouvent pourtant à quelques kilomètres de notre route.

Pour résoudre ce problème et soutenir la vie locale du tango, nous avons créé **Tango Itinéraire**, une application mobile gratuite (cadre associatif Loi 1901) qui calcule automatiquement les milongas sur le trajet routier des danseurs avec le temps de détour exact (ex: "à 12 min de votre autoroute").

Nous avons déjà pré-référencé avec soin votre événement : **[Nom Milonga]** à **[Ville]**.

👉 **Ce que cela change pour vous :**
1. **100% Gratuit & Bénévole :** Aucun abonnement, aucun frais, aucune publicité commerciale.
2. **Nouveaux danseurs à vos portes :** Les milongueros de passage qui roulent près de chez vous sont guidés directement jusqu'à votre salle.
3. **Mise en avant de vos atouts :** Vos informations clés sont valorisées (qualité du parquet, DJs, style musical, respect de la mirada/cabeceo, vestiaire, clim, et créateurs/exposants partenaires).
4. **Ligne Zéro Faux Plan :** Un canal direct d'alerte pour avertir les danseurs nomades en direct si vous devez décaler ou annuler un événement.

Vous pouvez tester l'application directement sur : https://tango-itineraire.fr (ou en local sur votre smartphone).

Si vous souhaitez modifier, enrichir votre fiche (DJs invités, exposants de chaussures, photos du parquet) ou si vous préférez au contraire que nous retirions votre événement, répondez simplement à cet e-mail.

Au plaisir de partager une tanda sur votre piste très bientôt !

Bien amicalement et milongueramente,

L'équipe Tango Itinéraire
Association Tango Itinéraire (Loi 1901)
Site & Démo : https://tango-itineraire.fr
\`\`\`

---

## 📱 Modèle 2 — Message WhatsApp & SMS Court

\`\`\`text
Bonjour [Nom Organisateur] ! 👋 
Je me permets de vous contacter de la part du collectif Tango Itinéraire. 
Nous avons lancé une application gratuite (Loi 1901) pour aider les danseurs en voyage à trouver les milongas sur leur trajet routier. 

Votre milonga "[Nom Milonga]" à [Ville] y est déjà référencée gratuitement pour vous amener des danseurs de passage ! 

Découvrez le projet et votre fiche ici : https://tango-itineraire.fr
Tout est 100% bénévole et sans frais pour les assos. N'hésitez pas si vous voulez qu'on ajuste les horaires ou les DJs ! 🎶💃
\`\`\`
`;

const outputPathMd = path.join(__dirname, '../CAMPAGNE_CONTACT_ASSOCIATIONS.md');
fs.writeFileSync(outputPathMd, mdSummary, 'utf8');
console.log(`✓ Fichier Récapitulatif généré : ${outputPathMd}`);
