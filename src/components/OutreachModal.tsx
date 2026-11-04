import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Mail, 
  MessageSquare, 
  FileText, 
  Download, 
  Send, 
  Copy, 
  Check, 
  MapPin, 
  Phone, 
  Users,
  Globe
} from 'lucide-react';
import rawContacts from '../data/organizers_contacts.json';
import type { OrganizerContact, ContactStatus } from '../types/outreach';
import { PitchFlyer } from './PitchFlyer';

interface OutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'tango_outreach_contacts_state';

export const OutreachModal: React.FC<OutreachModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'outreach' | 'flyer' | 'export'>('outreach');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [templateType, setTemplateType] = useState<'official' | 'friendly' | 'whatsapp'>('official');
  const [selectedContactId, setSelectedContactId] = useState<string>(rawContacts[0]?.id || '');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Charger les statuts enregistrés dans localStorage
  const [savedStatuses, setSavedStatuses] = useState<Record<string, { status: ContactStatus; date?: string; notes?: string }>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Mettre à jour localStorage lors d'un changement
  const updateContactStatus = (id: string, newStatus: ContactStatus) => {
    setSavedStatuses(prev => {
      const updated = {
        ...prev,
        [id]: {
          ...prev[id],
          status: newStatus,
          date: new Date().toLocaleDateString('fr-FR')
        }
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Liste enrichie avec les statuts locaux
  const contacts: OrganizerContact[] = useMemo(() => {
    return (rawContacts as OrganizerContact[]).map(c => ({
      ...c,
      status: savedStatuses[c.id]?.status || c.status || 'to_contact',
      lastContactedAt: savedStatuses[c.id]?.date || null
    }));
  }, [savedStatuses]);

  // Filtrage
  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchSearch = 
        c.organizerName.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.milongaTitle.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);

      const matchStatus = 
        statusFilter === 'all' ? true : c.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [contacts, searchQuery, statusFilter]);

  const selectedContact = useMemo(() => {
    return contacts.find(c => c.id === selectedContactId) || filteredContacts[0] || contacts[0];
  }, [contacts, selectedContactId, filteredContacts]);

  // Statistiques
  const stats = useMemo(() => {
    const total = contacts.length;
    const contacted = contacts.filter(c => c.status === 'contacted').length;
    const partners = contacts.filter(c => c.status === 'partner_confirmed').length;
    const toContact = contacts.filter(c => c.status === 'to_contact').length;
    return { total, contacted, partners, toContact };
  }, [contacts]);

  // Génération du texte selon le template
  const generatedMessage = useMemo(() => {
    if (!selectedContact) return { subject: '', body: '' };

    const org = selectedContact.organizerName;
    const milonga = selectedContact.milongaTitle;
    const city = selectedContact.city;

    if (templateType === 'official') {
      return {
        subject: `Tango Itinéraire x ${org} — Valorisation gratuite de votre milonga ${milonga}`,
        body: `Bonjour ${org},

Nous vous contactons de la part du collectif associatif Tango Itinéraire.

Comme beaucoup de danseurs passionnés, nous nous retrouvons souvent sur les routes de France (vacances, week-ends, tournées) à chercher où danser le soir venu. Entre les informations dispersées sur Facebook et les sites non mis à jour, il est souvent très difficile de trouver les milongas locales qui se trouvent pourtant à quelques kilomètres de notre route.

Pour résoudre ce problème et soutenir la vie locale du tango, nous avons créé Tango Itinéraire, une application mobile gratuite (cadre associatif Loi 1901) qui calcule automatiquement les milongas sur le trajet routier des danseurs avec le temps de détour exact (ex: "à 12 min de votre autoroute").

Nous avons déjà pré-référencé avec soin votre événement : ${milonga} à ${city}.

Ce que cela change pour vous :
1. 100% Gratuit & Bénévole : Aucun abonnement, aucun frais, aucune publicité commerciale.
2. Nouveaux danseurs à vos portes : Les milongueros de passage qui roulent près de chez vous sont guidés directement jusqu'à votre salle.
3. Mise en avant de vos atouts : Vos informations clés sont valorisées (qualité du parquet, DJs, style musical, respect de la mirada/cabeceo, vestiaire, clim, et créateurs/exposants partenaires).
4. Ligne Zéro Faux Plan : Un canal direct d'alerte pour avertir les danseurs nomades en direct si vous devez décaler ou annuler un événement.

Vous pouvez tester l'application directement sur : https://tango-itineraire.fr

Si vous souhaitez modifier, enrichir votre fiche (DJs invités, exposants de chaussures, photos du parquet) ou si vous préférez au contraire que nous retirions votre événement, répondez simplement à cet e-mail.

Au plaisir de partager une tanda sur votre piste très bientôt !

Bien amicalement et milongueramente,

L'équipe Tango Itinéraire
Association Tango Itinéraire (Loi 1901)
Site & Démo : https://tango-itineraire.fr`
      };
    }

    if (templateType === 'friendly') {
      return {
        subject: `Petite question tango : votre milonga ${milonga} à ${city}`,
        body: `Bonjour l'équipe de ${org},

Je suis danseur de tango et je vous écris car on a développé un petit outil associatif bien pratique : Tango Itinéraire (https://tango-itineraire.fr).

L'idée est toute simple : quand on prend la route pour les vacances ou le travail, l'app nous dit quelles sont les milongas sur notre autoroute ou nationale et le détour exact en minutes.

Votre milonga "${milonga}" y figure déjà pour permettre aux danseurs de passage de venir vous rendre visite !

C'est 100% gratuit et sans pub (Loi 1901). Pouvez-vous juste me confirmer si vos horaires et coordonnées sont bien à jour ?

Un grand merci pour ce que vous faites pour le tango local !

Amitiés milongueras,
L'équipe Tango Itinéraire`
      };
    }

    // WhatsApp / SMS
    return {
      subject: '',
      body: `Bonjour ${org} ! 👋 
Je me permets de vous contacter de la part du collectif Tango Itinéraire. 
Nous avons lancé une application gratuite (Loi 1901) pour aider les danseurs en déplacement à trouver les milongas sur leur trajet routier. 

Votre milonga "${milonga}" à ${city} y est déjà référencée gratuitement pour vous amener des danseurs de passage ! 

Découvrez le projet et votre fiche ici : https://tango-itineraire.fr
Tout est 100% bénévole et sans aucun frais. N'hésitez pas si vous souhaitez ajuster vos horaires ou vos DJs ! 🎶💃`
    };
  }, [selectedContact, templateType]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getMailtoLink = () => {
    if (!selectedContact?.email) return '#';
    const sub = encodeURIComponent(generatedMessage.subject);
    const bod = encodeURIComponent(generatedMessage.body);
    return `mailto:${selectedContact.email}?subject=${sub}&body=${bod}`;
  };

  const getWhatsAppLink = () => {
    if (!selectedContact?.waPhone) return '#';
    const bod = encodeURIComponent(generatedMessage.body);
    return `https://wa.me/${selectedContact.waPhone}?text=${bod}`;
  };

  // Export CSV direct dans le navigateur
  const downloadContactsCsv = () => {
    const csvRows = [
      ['Association / Organisateur', 'Milonga', 'Ville', 'Email', 'Telephone', 'Statut'].join(';')
    ];
    contacts.forEach(c => {
      csvRows.push([
        `"${c.organizerName.replace(/"/g, '""')}"`,
        `"${c.milongaTitle.replace(/"/g, '""')}"`,
        `"${c.city.replace(/"/g, '""')}"`,
        `"${c.email || ''}"`,
        `"${c.phone || ''}"`,
        `"${c.status}"`
      ].join(';'));
    });
    const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'contacts_associations_tango.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-[#150e0c] text-[#f7f2e7] rounded-2xl border border-[#d4af37]/60 shadow-2xl overflow-hidden print:max-h-none print:border-none print:shadow-none print:rounded-none">
        
        {/* En-tête de la Modal (masqué à l'impression) */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#211412] via-[#2a1713] to-[#211412] border-b border-[#d4af37]/40 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8e1c2e] to-[#4a0d18] border border-[#d4af37] flex items-center justify-center shadow-md">
              <Users className="w-5 h-5 text-[#f5d77f]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base sm:text-lg font-bold text-[#f5d77f] uppercase tracking-wide">
                  Espace Associations & Outreach Milongas
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8e1c2e] text-[#fce59e] border border-[#d4af37]/50">
                  {stats.total} organisateurs
                </span>
              </div>
              <p className="text-xs text-amber-200/70">
                Outil de prise de contact direct, gestion de campagne et support visuel officiel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Boutons d'onglets */}
            <div className="hidden md:flex bg-[#120b0a] p-1 rounded-xl border border-[#d4af37]/30">
              <button
                onClick={() => setActiveTab('outreach')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'outreach'
                    ? 'bg-[#8e1c2e] text-[#fce59e] border border-[#d4af37]/60 shadow'
                    : 'text-amber-200/60 hover:text-[#f5d77f]'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Outil de Contact</span>
              </button>

              <button
                onClick={() => setActiveTab('flyer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'flyer'
                    ? 'bg-[#8e1c2e] text-[#fce59e] border border-[#d4af37]/60 shadow'
                    : 'text-amber-200/60 hover:text-[#f5d77f]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Support Visuel A4</span>
              </button>

              <button
                onClick={() => setActiveTab('export')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'export'
                    ? 'bg-[#8e1c2e] text-[#fce59e] border border-[#d4af37]/60 shadow'
                    : 'text-amber-200/60 hover:text-[#f5d77f]'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-amber-200/60 hover:text-[#f5d77f] hover:bg-[#2e1c19] border border-transparent hover:border-[#d4af37]/40 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barre d'onglets Mobile */}
        <div className="flex md:hidden bg-[#120b0a] border-b border-[#d4af37]/30 p-1.5 gap-1 shrink-0 print:hidden">
          <button
            onClick={() => setActiveTab('outreach')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg text-center ${
              activeTab === 'outreach' ? 'bg-[#8e1c2e] text-[#fce59e]' : 'text-amber-200/60'
            }`}
          >
            Contacts ({stats.total})
          </button>
          <button
            onClick={() => setActiveTab('flyer')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg text-center ${
              activeTab === 'flyer' ? 'bg-[#8e1c2e] text-[#fce59e]' : 'text-amber-200/60'
            }`}
          >
            Support Visuel A4
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg text-center ${
              activeTab === 'export' ? 'bg-[#8e1c2e] text-[#fce59e]' : 'text-amber-200/60'
            }`}
          >
            Export CSV
          </button>
        </div>

        {/* Corps principal */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 print:p-0">

          {/* ONGLET 1 : OUTREACH & CONTACT */}
          {activeTab === 'outreach' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Colonne Gauche : Liste des associations (5 cols) */}
              <div className="lg:col-span-5 flex flex-col space-y-3">
                
                {/* Statistiques rapides */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-[#211412] border border-[#d4af37]/30">
                    <span className="block text-amber-200/70 text-[10px]">À contacter</span>
                    <span className="font-bold text-amber-300 text-sm">{stats.toContact}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#211412] border border-[#d4af37]/30">
                    <span className="block text-sky-200/70 text-[10px]">Envoyés</span>
                    <span className="font-bold text-sky-400 text-sm">{stats.contacted}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#211412] border border-[#d4af37]/30">
                    <span className="block text-emerald-200/70 text-[10px]">Partenaires</span>
                    <span className="font-bold text-emerald-400 text-sm">{stats.partners}</span>
                  </div>
                </div>

                {/* Barre de Recherche et Filtres */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-amber-400/60 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Chercher ville, association, email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#120b0a] pl-9 pr-3 py-2 rounded-xl border border-[#d4af37]/40 text-xs text-[#f7f2e7] placeholder-amber-200/40 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap cursor-pointer transition ${
                        statusFilter === 'all'
                          ? 'bg-[#8e1c2e] text-[#fce59e] border border-[#d4af37]/50'
                          : 'bg-[#211412] text-amber-200/60 hover:text-amber-200'
                      }`}
                    >
                      Tous ({contacts.length})
                    </button>
                    <button
                      onClick={() => setStatusFilter('to_contact')}
                      className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap cursor-pointer transition ${
                        statusFilter === 'to_contact'
                          ? 'bg-[#8e1c2e] text-[#fce59e] border border-[#d4af37]/50'
                          : 'bg-[#211412] text-amber-200/60 hover:text-amber-200'
                      }`}
                    >
                      En attente ({stats.toContact})
                    </button>
                    <button
                      onClick={() => setStatusFilter('contacted')}
                      className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap cursor-pointer transition ${
                        statusFilter === 'contacted'
                          ? 'bg-[#8e1c2e] text-[#fce59e] border border-[#d4af37]/50'
                          : 'bg-[#211412] text-amber-200/60 hover:text-amber-200'
                      }`}
                    >
                      Contactés ({stats.contacted})
                    </button>
                    <button
                      onClick={() => setStatusFilter('partner_confirmed')}
                      className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap cursor-pointer transition ${
                        statusFilter === 'partner_confirmed'
                          ? 'bg-[#8e1c2e] text-[#fce59e] border border-[#d4af37]/50'
                          : 'bg-[#211412] text-amber-200/60 hover:text-amber-200'
                      }`}
                    >
                      Validés ({stats.partners})
                    </button>
                  </div>
                </div>

                {/* Liste des Fiches Contacts */}
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {filteredContacts.length === 0 ? (
                    <div className="p-6 text-center text-xs text-amber-200/50 bg-[#211412] rounded-xl border border-[#d4af37]/20">
                      Aucune association ne correspond à cette recherche.
                    </div>
                  ) : (
                    filteredContacts.map(c => {
                      const isSelected = selectedContact?.id === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedContactId(c.id)}
                          className={`p-3 rounded-xl border transition cursor-pointer text-left ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#2e1c19] to-[#251512] border-[#d4af37] shadow-lg ring-1 ring-[#d4af37]/50'
                              : 'bg-[#211412] border-[#d4af37]/20 hover:border-[#d4af37]/50 hover:bg-[#281815]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-display text-xs font-bold text-[#f5d77f] line-clamp-1">
                              {c.organizerName}
                            </h4>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                              c.status === 'partner_confirmed'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                                : c.status === 'contacted'
                                ? 'bg-sky-950 text-sky-300 border border-sky-600/50'
                                : 'bg-[#120b0a] text-amber-300/80 border border-[#d4af37]/30'
                            }`}>
                              {c.status === 'partner_confirmed' ? 'Partenaire ✓' : c.status === 'contacted' ? 'Envoyé' : 'À contacter'}
                            </span>
                          </div>

                          <div className="text-[11px] text-amber-200/80 font-medium line-clamp-1 mt-0.5">
                            {c.milongaTitle}
                          </div>

                          <div className="flex items-center gap-3 mt-2 text-[10px] text-amber-200/60">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#d4af37]" />
                              {c.city}
                            </span>
                            {c.email && (
                              <span className="flex items-center gap-1 line-clamp-1">
                                <Mail className="w-3 h-3 text-sky-400" />
                                {c.email}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>

              {/* Colonne Droite : Prévisualisation & Actions 1-Clic (7 cols) */}
              <div className="lg:col-span-7 flex flex-col space-y-4">
                
                {selectedContact ? (
                  <>
                    {/* Fiche Asso Sélectionnée */}
                    <div className="p-4 rounded-xl bg-[#211412] border border-[#d4af37]/40 shadow-md">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#d4af37]/20">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-sm text-[#f5d77f]">
                              {selectedContact.organizerName}
                            </span>
                          </div>
                          <div className="text-xs text-amber-200/80 mt-0.5">
                            Milonga : <strong className="text-amber-100">{selectedContact.milongaTitle}</strong> ({selectedContact.city})
                          </div>
                        </div>

                        {/* Sélecteur de statut rapide */}
                        <div className="flex items-center gap-1 bg-[#120b0a] p-1 rounded-lg border border-[#d4af37]/30">
                          <button
                            onClick={() => updateContactStatus(selectedContact.id, 'to_contact')}
                            className={`px-2 py-1 rounded text-[10px] font-semibold transition cursor-pointer ${
                              selectedContact.status === 'to_contact'
                                ? 'bg-[#8e1c2e] text-[#fce59e]'
                                : 'text-amber-200/50 hover:text-amber-200'
                            }`}
                          >
                            À contacter
                          </button>
                          <button
                            onClick={() => updateContactStatus(selectedContact.id, 'contacted')}
                            className={`px-2 py-1 rounded text-[10px] font-semibold transition cursor-pointer ${
                              selectedContact.status === 'contacted'
                                ? 'bg-sky-900 text-sky-200'
                                : 'text-amber-200/50 hover:text-amber-200'
                            }`}
                          >
                            Contacté
                          </button>
                          <button
                            onClick={() => updateContactStatus(selectedContact.id, 'partner_confirmed')}
                            className={`px-2 py-1 rounded text-[10px] font-semibold transition cursor-pointer ${
                              selectedContact.status === 'partner_confirmed'
                                ? 'bg-emerald-900 text-emerald-200'
                                : 'text-amber-200/50 hover:text-amber-200'
                            }`}
                          >
                            Partenaire ✓
                          </button>
                        </div>
                      </div>

                      {/* Coordonnées */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-xs">
                        <div className="flex items-center gap-1.5 text-amber-100/90 truncate">
                          <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span className="truncate">{selectedContact.email || 'Non renseigné'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-100/90 truncate">
                          <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{selectedContact.phone || 'Non renseigné'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-100/90 truncate">
                          <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">{selectedContact.website ? 'Site web' : 'Non renseigné'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Choix du Template */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-bold text-[#f5d77f] uppercase tracking-wide">
                        Modèle de message personnalisé :
                      </div>

                      <div className="flex items-center gap-1 bg-[#120b0a] p-1 rounded-xl border border-[#d4af37]/30 text-xs">
                        <button
                          onClick={() => setTemplateType('official')}
                          className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                            templateType === 'official'
                              ? 'bg-[#8e1c2e] text-[#fce59e]'
                              : 'text-amber-200/60 hover:text-amber-200'
                          }`}
                        >
                          Email Partenaire
                        </button>
                        <button
                          onClick={() => setTemplateType('friendly')}
                          className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                            templateType === 'friendly'
                              ? 'bg-[#8e1c2e] text-[#fce59e]'
                              : 'text-amber-200/60 hover:text-amber-200'
                          }`}
                        >
                          Email Convivial
                        </button>
                        <button
                          onClick={() => setTemplateType('whatsapp')}
                          className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                            templateType === 'whatsapp'
                              ? 'bg-[#8e1c2e] text-[#fce59e]'
                              : 'text-amber-200/60 hover:text-amber-200'
                          }`}
                        >
                          WhatsApp / SMS
                        </button>
                      </div>
                    </div>

                    {/* Zone de prévisualisation du message */}
                    <div className="space-y-2">
                      {templateType !== 'whatsapp' && (
                        <div className="flex items-center justify-between bg-[#120b0a] px-3 py-2 rounded-xl border border-[#d4af37]/30 text-xs">
                          <span className="text-amber-200/60 font-semibold shrink-0 mr-2">Objet :</span>
                          <span className="text-amber-100 font-medium truncate flex-1">{generatedMessage.subject}</span>
                          <button
                            onClick={() => copyToClipboard(generatedMessage.subject, 'subject')}
                            className="ml-2 text-amber-300 hover:text-white p-1"
                            title="Copier l'objet"
                          >
                            {copiedField === 'subject' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}

                      <div className="relative">
                        <textarea
                          readOnly
                          rows={11}
                          value={generatedMessage.body}
                          className="w-full bg-[#120b0a] p-3.5 rounded-xl border border-[#d4af37]/40 text-xs text-amber-100 font-mono leading-relaxed focus:outline-none resize-none"
                        />
                        <button
                          onClick={() => copyToClipboard(generatedMessage.body, 'body')}
                          className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#211412] border border-[#d4af37]/50 text-xs text-[#f5d77f] hover:bg-[#2d1b18] transition cursor-pointer shadow"
                        >
                          {copiedField === 'body' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-300" />}
                          <span>{copiedField === 'body' ? 'Copié !' : 'Copier'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Boutons d'Action 1-Clic */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      {selectedContact.email && (
                        <a
                          href={getMailtoLink()}
                          onClick={() => updateContactStatus(selectedContact.id, 'contacted')}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#8e1c2e] to-[#6d1320] text-[#fce59e] border border-[#d4af37]/60 hover:from-[#a32236] hover:to-[#7f1827] transition shadow-lg cursor-pointer"
                        >
                          <Mail className="w-4 h-4 text-amber-300" />
                          <span>Ouvrir dans mon logiciel Mail</span>
                        </a>
                      )}

                      {selectedContact.waPhone && (
                        <a
                          href={getWhatsAppLink()}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => updateContactStatus(selectedContact.id, 'contacted')}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500/60 transition shadow-lg cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Envoyer par WhatsApp</span>
                        </a>
                      )}

                      <button
                        onClick={() => setActiveTab('flyer')}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#211412] text-[#f5d77f] border border-[#d4af37]/50 hover:bg-[#2d1b18] hover:border-[#d4af37] transition cursor-pointer"
                      >
                        Voir le Support Visuel
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-12 text-center text-sm text-amber-200/50 bg-[#211412] rounded-xl border border-[#d4af37]/20">
                    Sélectionnez une association dans la liste à gauche.
                  </div>
                )}

              </div>

            </div>
          )}

          {/* ONGLET 2 : SUPPORT VISUEL IMPRIMABLE (A4) */}
          {activeTab === 'flyer' && (
            <div className="w-full flex flex-col items-center">
              <PitchFlyer
                organizerName={selectedContact?.organizerName}
                milongaTitle={selectedContact?.milongaTitle}
                city={selectedContact?.city}
              />
            </div>
          )}

          {/* ONGLET 3 : EXPORT & TABLEUR */}
          {activeTab === 'export' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="p-6 rounded-2xl bg-[#211412] border border-[#d4af37]/40 shadow-xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#8e1c2e]/60 border border-[#d4af37]/50 flex items-center justify-center text-amber-300">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-[#f5d77f] uppercase">
                      Télécharger la Base Complète des Associations
                    </h3>
                    <p className="text-xs text-amber-200/70">
                      Format CSV prêt pour Excel, Google Sheets, Brevo, Mailchimp ou publipostage
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#120b0a] border border-[#d4af37]/30 text-xs space-y-2 text-amber-100/90 font-mono">
                  <div>✓ <strong>{contacts.length} organisateurs uniques</strong> dédupliqués sur toute la France</div>
                  <div>✓ Colonnes : Nom, Milonga, Ville, Code Postal, Email, Téléphone, Statut</div>
                  <div>✓ Encodage UTF-8 avec BOM pour une ouverture parfaite sans caractères bizarres sous Excel Windows</div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={downloadContactsCsv}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#120b0a] hover:from-[#e5c158] hover:to-[#c49f38] transition shadow-lg cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger le fichier CSV ({contacts.length} contacts)</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('outreach')}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#120b0a] text-amber-200/80 hover:text-white border border-[#d4af37]/30 transition cursor-pointer"
                  >
                    Retour aux contacts
                  </button>
                </div>
              </div>

              {/* Guide de diffusion */}
              <div className="p-5 rounded-xl bg-[#120b0a] border border-[#d4af37]/30 text-xs text-amber-200/80 space-y-2">
                <div className="font-bold text-[#f5d77f] uppercase text-xs">
                  💡 Conseil de prise de contact bienveillante :
                </div>
                <p>
                  Les organisateurs de milongas sont à 95% des bénévoles passionnés. 
                  Privilégiez toujours un ton chaleureux et amical ("danseur à danseur") plutôt qu'un ton commercial.
                  Insistez sur le fait que l'association Loi 1901 ne leur demande aucun argent et valorise le travail de leur DJ et de leur sol.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
