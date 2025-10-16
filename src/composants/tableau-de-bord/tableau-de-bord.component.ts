import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DonneesService } from '../../services/donnees.service';
import { FormsModule } from '@angular/forms';

const PRETTY_COLORS = [
  '#34d399', '#fbbf24', '#60a5fa', '#f87171', '#a78bfa', '#22d3ee', '#f472b6',
];

const getTodayString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

@Component({
  selector: 'app-tableau-de-bord',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './tableau-de-bord.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableauDeBordComponent {
  private donneesService = inject(DonneesService);

  // --- Raw Data Signals ---
  private tousLesAeroports = signal(this.donneesService.getAeroports());
  private tousLesEnregistrements = signal(this.donneesService.getEnregistrements());
  private tousLesVols = signal(this.donneesService.getVols());
  private tousLesVoyages = signal(this.donneesService.getVoyages());
  private tousLesListeNoire = signal(this.donneesService.getListeNoire());
  private toutesLesCompagnies = signal(this.donneesService.getCompagnies());

  // --- Filter Signals ---
  filtreAeroportId = signal('');
  filtreDateDebut = signal(getTodayString());
  filtreDateFin = signal(getTodayString());

  aeroports = computed(() => this.tousLesAeroports().filter(a => !a.supprime));
  voyages = computed(() => this.tousLesVoyages());
  listeNoire = computed(() => this.tousLesListeNoire());
  compagnies = computed(() => this.toutesLesCompagnies());

  // --- Filtered Data ---
  enregistrementsFiltres = computed(() => {
    let data = this.tousLesEnregistrements();
    const dateDebut = this.filtreDateDebut();
    const dateFin = this.filtreDateFin();
    const aeroportId = this.filtreAeroportId();

    if (dateDebut) {
      data = data.filter(e => e.date_creation >= dateDebut);
    }
    if (dateFin) {
      data = data.filter(e => e.date_creation <= dateFin);
    }
    if (aeroportId) {
      const aeroport = this.tousLesAeroports().find(a => a.id === +aeroportId);
      if(aeroport) {
          const volsDeAeroport = this.tousLesVols().filter(v => v.ville_depart.includes(aeroport.ville)).map(v => v.numero_vol);
          data = data.filter(e => volsDeAeroport.includes(e.vol));
      }
    }
    return data;
  });

  volsFiltres = computed(() => {
    let data = this.tousLesVols();
    const dateDebut = this.filtreDateDebut();
    const dateFin = this.filtreDateFin();
    const aeroportId = this.filtreAeroportId();

    if (dateDebut) {
      data = data.filter(v => v.date_depart.split(' ')[0] >= dateDebut);
    }
    if (dateFin) {
      data = data.filter(v => v.date_depart.split(' ')[0] <= dateFin);
    }
    if (aeroportId) {
       const aeroport = this.tousLesAeroports().find(a => a.id === +aeroportId);
        if(aeroport) {
            data = data.filter(v => v.ville_depart.includes(aeroport.ville));
        }
    }
    return data;
  });

  // --- Computed Stats & Charts ---
  stats = computed(() => {
    const enregistrements = this.enregistrementsFiltres();
    return {
      utilisateurs: this.donneesService.getUtilisateurs().length,
      enregistrements: enregistrements.length,
      vols: this.volsFiltres().length,
      listeNoire: this.donneesService.getListeNoire().length,
      aeroports: this.donneesService.getAeroports().length,
      compagnies: this.donneesService.getCompagnies().length,
      voyages: this.tousLesVoyages().length,
      roles: this.donneesService.getRoles().length,
      motifs: this.donneesService.getMotifsVoyages().length,
      biometrie: this.donneesService.getDonneesBiometriques().length,
      historique: this.donneesService.getHistorique().length,
      voyageursEnAttente: enregistrements.filter(e => e.statut === 'EN_ATTENTE').length,
    };
  });

  statutEnregistrements = computed(() => {
    const enregistrements = this.enregistrementsFiltres();
    const total = enregistrements.length;
    if (total === 0) {
      return { valides: 0, enAttente: 0, rejetes: 0, annules: 0 };
    }
    const valides = (enregistrements.filter(e => e.statut === 'VALIDE').length / total) * 100;
    const enAttente = (enregistrements.filter(e => e.statut === 'EN_ATTENTE').length / total) * 100;
    const rejetes = (enregistrements.filter(e => e.statut === 'REJETE').length / total) * 100;
    const annules = (enregistrements.filter(e => e.statut === 'ANNULE').length / total) * 100;
    return { valides, enAttente, rejetes, annules };
  });

  statutVols = computed(() => {
    const vols = this.volsFiltres();
    const total = vols.length;
    if (total === 0) {
      return { 
        programmes: { count: 0, percent: 0 }, 
        confirmes: { count: 0, percent: 0 }, 
        retardes: { count: 0, percent: 0 }, 
        annules: { count: 0, percent: 0 } 
      };
    }
    
    // FIX: Added explicit type for accumulator to prevent type errors.
    const counts = vols.reduce((acc: { [key: string]: number }, vol) => {
        acc[vol.statut] = (acc[vol.statut] || 0) + 1;
        return acc;
    }, {});
    
    return {
      programmes: {
        count: counts['PROGRAMME'] || 0,
        percent: ((counts['PROGRAMME'] || 0) / total) * 100
      },
      confirmes: {
        count: counts['CONFIRME'] || 0,
        percent: ((counts['CONFIRME'] || 0) / total) * 100
      },
      retardes: {
        count: counts['RETARDE'] || 0,
        percent: ((counts['RETARDE'] || 0) / total) * 100
      },
      annules: {
        count: counts['ANNULE'] || 0,
        percent: ((counts['ANNULE'] || 0) / total) * 100
      }
    };
  });

  // New chart: Motifs de voyage
  motifsRepartition = computed(() => {
    const voyages = this.tousLesVoyages();
    const total = voyages.length;
    if (total === 0) return { data: [], gradient: 'transparent' };

    // FIX: Added explicit type for accumulator to prevent type errors.
    const counts = voyages.reduce((acc: { [key: string]: number }, voyage) => {
      // FIX: Corrected property access from 'motif' to 'motif_voyage' to align with the Voyage model interface.
      acc[voyage.motif_voyage] = (acc[voyage.motif_voyage] || 0) + 1;
      return acc;
    }, {});

    let cumulativePercent = 0;
    const data = Object.entries(counts).map(([motif, count], index) => {
      const percent = (count / total) * 100;
      const color = PRETTY_COLORS[index % PRETTY_COLORS.length];
      const result = { motif, count, percent, color, offset: cumulativePercent };
      cumulativePercent += percent;
      return result;
    });

    const gradient = `conic-gradient(${data.map(d => `${d.color} ${d.offset}% ${d.offset + d.percent}%`).join(', ')})`;
    
    return { data, gradient };
  });
  
  // New chart: Passagers par aéroport
  passagersParAeroport = computed(() => {
    const enregistrements = this.enregistrementsFiltres();
    const vols = this.tousLesVols();
    if (enregistrements.length === 0) return [];
    
    const volsMap = new Map(vols.map(v => [v.numero_vol, v]));

    // FIX: Added explicit type for accumulator to prevent type errors.
    const counts = enregistrements.reduce((acc: { [key: string]: number }, enreg) => {
      const vol = volsMap.get(enreg.vol);
      if (vol) {
        const aeroport = vol.ville_depart;
        acc[aeroport] = (acc[aeroport] || 0) + 1;
      }
      return acc;
    }, {});

    const maxCount = Math.max(...Object.values(counts), 1);
    
    return Object.entries(counts)
      .map(([aeroport, count]) => ({
        aeroport,
        count,
        percent: (count / maxCount) * 100
      }))
      .sort((a, b) => b.count - a.count);
  });
  
  // New chart: Répartition sur la liste noire
  listeNoireRepartition = computed(() => {
    const liste = this.tousLesListeNoire();
    const total = liste.length;
    if (total === 0) return { data: [], gradient: 'transparent' };

    // FIX: Added explicit type for accumulator to prevent type errors.
    const counts = liste.reduce((acc: { [key: string]: number }, personne) => {
      acc[personne.statut] = (acc[personne.statut] || 0) + 1;
      return acc;
    }, {});
    
    const colorMap = { 'ACTIVE': '#f87171', 'LEVEE': '#34d399' }; // red-500, green-500

    let cumulativePercent = 0;
    const data = Object.entries(counts).map(([statut, count]) => {
      const percent = (count / total) * 100;
      const color = colorMap[statut as keyof typeof colorMap] || '#9ca3af'; // gray-400 fallback
      const result = { statut, count, percent, color, offset: cumulativePercent };
      cumulativePercent += percent;
      return result;
    });

    const gradient = `conic-gradient(${data.map(d => `${d.color} ${d.offset}% ${d.offset + d.percent}%`).join(', ')})`;
    
    return { data, gradient };
  });

  // New chart: Statut des compagnies aériennes
  compagniesStatutRepartition = computed(() => {
    const compagnies = this.toutesLesCompagnies();
    const total = compagnies.length;
    if (total === 0) return { data: [], gradient: 'transparent' };

    // FIX: Added explicit type for accumulator to prevent type errors.
    const counts = compagnies.reduce((acc: { [key: string]: number }, comp) => {
      acc[comp.statut] = (acc[comp.statut] || 0) + 1;
      return acc;
    }, {});
    
    const colorMap = { 'ACTIVE': '#34d399', 'INACTIVE': '#fbbf24', 'SUSPENDUE': '#f87171' }; // green-500, amber-400, red-500

    let cumulativePercent = 0;
    const data = Object.entries(counts).map(([statut, count]) => {
      const percent = (count / total) * 100;
      const color = colorMap[statut as keyof typeof colorMap] || '#9ca3af'; // gray-400 fallback
      const result = { statut, count, percent, color, offset: cumulativePercent };
      cumulativePercent += percent;
      return result;
    });

    const gradient = `conic-gradient(${data.map(d => `${d.color} ${d.offset}% ${d.offset + d.percent}%`).join(', ')})`;
    
    return { data, gradient };
  });
  
  appliquerFiltres() {
    // No-op : les signaux et ngModel mettent à jour l'UI automatiquement.
    // Le bouton donne un retour d'action à l'utilisateur.
  }
}
