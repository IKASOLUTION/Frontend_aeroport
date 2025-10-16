import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DonneesService } from '../../services/donnees.service';
import { Alerte } from '../../modeles/alerte';
import { FormsModule } from '@angular/forms';
import { PersonneListeNoire } from '../../modeles/liste-noire';

export interface AlerteDetaillee extends Alerte {
  personneDetails: PersonneListeNoire | undefined;
}

@Component({
  selector: 'app-notifications-urgentes',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './notifications-urgentes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsUrgentesComponent implements OnInit {
  private donneesService = inject(DonneesService);
  private route = inject(ActivatedRoute);
  private toutesLesAlertes = signal<Alerte[]>([]);
  private listeNoire = signal<PersonneListeNoire[]>([]);

  // --- Modal State ---
  isDetailsModalOpen = signal(false);
  selectedAlerte = signal<AlerteDetaillee | null>(null);

  // --- Filter Signals ---
  filtreRecherche = signal('');
  filtreAeroport = signal('');
  filtreUrgence = signal<'Élevée' | 'Moyenne' | 'Faible' | ''>('');
  filtreDateDebut = signal('');
  filtreDateFin = signal('');

  // --- Data for filters ---
  aeroports = computed(() => [...new Set(this.toutesLesAlertes().map(a => a.aeroport))]);
  urgences: ('Élevée' | 'Moyenne' | 'Faible')[] = ['Élevée', 'Moyenne', 'Faible'];

  // --- Joined Data for Display ---
  alertesDetaillees = computed(() => {
    const alertes = this.toutesLesAlertes();
    const listeNoireMap = new Map(this.listeNoire().map(p => [p.id, p]));
    return alertes.map(alerte => ({
      ...alerte,
      personneDetails: listeNoireMap.get(alerte.personne_id)
    }));
  });

  alertesFiltrees = computed(() => {
    const recherche = this.filtreRecherche().toLowerCase().trim();
    const aeroport = this.filtreAeroport();
    const urgence = this.filtreUrgence();
    const dateDebut = this.filtreDateDebut();
    const dateFin = this.filtreDateFin();

    return this.alertesDetaillees().filter(alerte => {
      const parRecherche = recherche
        ? alerte.personne.toLowerCase().includes(recherche) || alerte.agent.toLowerCase().includes(recherche)
        : true;
      const parAeroport = aeroport ? alerte.aeroport === aeroport : true;
      const parUrgence = urgence ? alerte.urgence === urgence : true;

      const alerteDate = alerte.date.split(' ')[0]; // YYYY-MM-DD format from data
      const parDateDebut = dateDebut ? alerteDate >= dateDebut : true;
      const parDateFin = dateFin ? alerteDate <= dateFin : true;

      return parRecherche && parAeroport && parUrgence && parDateDebut && parDateFin;
    });
  });

  // --- Pagination state ---
  currentPage = signal(1);
  itemsPerPage = 10;

  // --- Computed data for display ---
  totalPages = computed(() => Math.ceil(this.alertesFiltrees().length / this.itemsPerPage));

  alertesPaginees = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.alertesFiltrees().slice(startIndex, startIndex + this.itemsPerPage);
  });

  paginationText = computed(() => {
    const total = this.alertesFiltrees().length;
    if (total === 0) {
      return "Affichage de 0 à 0 sur 0 alertes";
    }
    const start = (this.currentPage() - 1) * this.itemsPerPage + 1;
    const end = Math.min(start + this.itemsPerPage - 1, total);
    return `Affichage de ${start} à ${end} sur ${total} alertes`;
  });

  // --- PDF Modal State ---
  isPdfModalOpen = signal(false);
  pdfContentTitle = signal('');
  pdfData = signal<any>(null);
  generatedDate = new Date().toLocaleDateString('fr-FR');
  isPdfDataArray = computed(() => Array.isArray(this.pdfData()));

  constructor() {
    this.toutesLesAlertes.set(this.donneesService.getAlertes());
    this.listeNoire.set(this.donneesService.getListeNoire());
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const alerteId = params['id'];
      if (alerteId) {
        const alerte = this.alertesDetaillees().find(a => a.id === +alerteId);
        if (alerte) {
          this.openDetailsModal(alerte);
        }
      }
    });
  }

  // --- Modal Management ---
  openDetailsModal(alerte: AlerteDetaillee): void {
    this.selectedAlerte.set(alerte);
    this.isDetailsModalOpen.set(true);
  }

  closeModals(): void {
    this.isDetailsModalOpen.set(false);
    this.selectedAlerte.set(null);
    this.closePdfModal();
  }
  
  // --- PDF Modal Management ---
  openPdfModal(data: any, title: string): void {
    this.pdfData.set(data);
    this.pdfContentTitle.set(title);
    this.isPdfModalOpen.set(true);
  }

  closePdfModal(): void {
    this.isPdfModalOpen.set(false);
    this.pdfData.set(null);
    this.pdfContentTitle.set('');
  }

  getUrgenceClass(urgence: 'Élevée' | 'Moyenne' | 'Faible'): string {
    switch (urgence) {
      case 'Élevée':
        return 'bg-red-100 text-red-800 border-red-400';
      case 'Moyenne':
        return 'bg-yellow-100 text-yellow-800 border-yellow-400';
      case 'Faible':
        return 'bg-green-100 text-green-800 border-green-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // --- Pagination methods ---
  pagePrecedente(): void {
    this.currentPage.update(page => Math.max(1, page - 1));
  }

  pageSuivante(): void {
    this.currentPage.update(page => Math.min(this.totalPages(), page + 1));
  }
}
