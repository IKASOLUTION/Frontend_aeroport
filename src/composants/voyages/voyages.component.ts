import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DonneesService } from '../../services/donnees.service';
import { Voyage } from '../../modeles/voyage';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-voyages',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './voyages.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoyagesComponent {
  private donneesService = inject(DonneesService);
  private notificationService = inject(NotificationService);
  
  // --- Raw Data Signals ---
  private tousLesVoyages = signal<Voyage[]>([]);
  
  // --- Filter Signals ---
  filtreRecherche = signal('');
  filtreEtatVoyage = signal('');
  filtreDateDebut = signal('');
  filtreDateFin = signal('');

  // --- Data for Form Dropdowns ---
  etatsVoyage: Voyage['etat_voyage'][] = ['Arrivé', 'Départ'];
  
  // --- Enriched and Filtered Data ---
  voyagesFiltres = computed(() => {
    const recherche = this.filtreRecherche().toLowerCase().trim();
    const etat = this.filtreEtatVoyage();
    const dateDebut = this.filtreDateDebut();
    const dateFin = this.filtreDateFin();
    
    return this.tousLesVoyages()
      .filter(voyage => {
        const parRecherche = recherche
          ? voyage.numero_vol.toLowerCase().includes(recherche) ||
            `${voyage.prenom_passager} ${voyage.nom_passager}`.toLowerCase().includes(recherche) ||
            voyage.ville_destination.toLowerCase().includes(recherche) ||
            voyage.numero_enregistrement.toLowerCase().includes(recherche)
          : true;
        
        const parEtat = etat ? voyage.etat_voyage === etat : true;
        
        // Convert DD/MM/YYYY to YYYY-MM-DD for comparison
        const voyageDateParts = voyage.date_voyage.split('/');
        const voyageDateISO = `${voyageDateParts[2]}-${voyageDateParts[1]}-${voyageDateParts[0]}`;

        const parDateDebut = dateDebut ? voyageDateISO >= dateDebut : true;
        const parDateFin = dateFin ? voyageDateISO <= dateFin : true;
        
        return parRecherche && parEtat && parDateDebut && parDateFin;
      });
  });

  // --- Pagination state ---
  currentPage = signal(1);
  itemsPerPage = 10;
  
  // --- Computed data for display ---
  totalPages = computed(() => Math.ceil(this.voyagesFiltres().length / this.itemsPerPage));
  
  voyagesPagines = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.voyagesFiltres().slice(startIndex, startIndex + this.itemsPerPage);
  });

  paginationText = computed(() => {
    const total = this.voyagesFiltres().length;
    if (total === 0) return "Affichage de 0 à 0 sur 0 voyages";
    const start = (this.currentPage() - 1) * this.itemsPerPage + 1;
    const end = Math.min(start + this.itemsPerPage - 1, total);
    return `Affichage de ${start} à ${end} sur ${total} voyages`;
  });

  // --- State for Modals ---
  isDeleteModalOpen = signal(false);
  isDetailsModalOpen = signal(false);
  
  selectedVoyage = signal<Voyage | null>(null);

  // --- PDF Modal State ---
  isPdfModalOpen = signal(false);
  pdfContentTitle = signal('');
  pdfData = signal<any>(null);
  generatedDate = new Date().toLocaleDateString('fr-FR');
  isPdfDataArray = computed(() => Array.isArray(this.pdfData()));

  constructor() {
    this.tousLesVoyages.set(this.donneesService.getVoyages());
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'Validé': return 'bg-green-100 text-green-800';
      case 'En attente': return 'bg-yellow-100 text-yellow-800';
      case 'Rejeté': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  // --- Modal Management ---
  openDetailsModal(voyage: Voyage): void {
    this.selectedVoyage.set(voyage);
    this.isDetailsModalOpen.set(true);
  }

  openDeleteModal(voyage: Voyage): void {
    this.selectedVoyage.set(voyage);
    this.isDeleteModalOpen.set(true);
  }

  closeModals(): void {
    this.isDeleteModalOpen.set(false);
    this.isDetailsModalOpen.set(false);
    this.selectedVoyage.set(null);
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

  // --- CRUD Operations ---
  confirmDelete(): void {
    const voyageToDelete = this.selectedVoyage();
    if (voyageToDelete) {
      this.tousLesVoyages.update(voyages =>
        voyages.filter(v => v.id !== voyageToDelete.id)
      );
      this.notificationService.show(`Le voyage pour "${voyageToDelete.prenom_passager} ${voyageToDelete.nom_passager}" a été supprimé.`, 'info');
      if (this.voyagesPagines().length === 0 && this.currentPage() > 1) {
        this.currentPage.update(page => page - 1);
      }
    }
    this.closeModals();
  }

  // --- Pagination methods ---
  pagePrecedente(): void {
    this.currentPage.update(page => Math.max(1, page - 1));
  }

  pageSuivante(): void {
    this.currentPage.update(page => Math.min(this.totalPages(), page + 1));
  }
}
