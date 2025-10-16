import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DonneesService } from '../../services/donnees.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Passager } from '../../modeles/passager';
import { Voyage } from '../../modeles/voyage';
import { Aeroport } from '../../modeles/aeroport';

export interface PassagerEnregistre {
  passager: Passager;
  dernierVoyage: Voyage;
  nombreVoyages: number;
  historiqueVoyages: Voyage[];
}

@Component({
  selector: 'app-registre-passagers',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './registre-passagers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrePassagersComponent {
  private donneesService = inject(DonneesService);

  // --- Raw Data ---
  private tousLesPassagers = signal<Passager[]>(this.donneesService.getPassagers());
  private tousLesVoyages = signal<Voyage[]>(this.donneesService.getVoyages());
  
  // --- Filter Signals ---
  filtreRecherche = signal('');
  filtreAeroport = signal('');
  filtreEtatVoyage = signal('');
  filtreNumeroVol = signal('');
  filtreDateDebut = signal('');
  filtreDateFin = signal('');

  // --- State for Modals ---
  isDetailsModalOpen = signal(false);
  selectedPassagerComplet = signal<PassagerEnregistre | null>(null);

  // --- State for Image Viewer ---
  isImageViewerOpen = signal(false);
  imagesForViewer = signal<{ url: string, title: string }[]>([]);
  currentImageIndex = signal(0);

  // --- PDF Modal State ---
  isPdfModalOpen = signal(false);
  pdfContentTitle = signal('');
  pdfData = signal<any>(null);
  generatedDate = new Date().toLocaleDateString('fr-FR');
  isPdfDataArray = computed(() => Array.isArray(this.pdfData()));

  // --- Data for filters ---
  aeroports = computed<Aeroport[]>(() => this.donneesService.getAeroports().filter(a => !a.supprime));
  etatsVoyage = computed<string[]>(() => [...new Set(this.tousLesVoyages().map(v => v.etat_voyage))]);

  // --- Combined and Computed Data ---
  passagersEnregistres = computed<PassagerEnregistre[]>(() => {
    const voyages = this.tousLesVoyages();
    const passagersMap = new Map(this.tousLesPassagers().map(p => [p.id_unique, p]));
    const voyagesParPassager = new Map<string, Voyage[]>();

    for (const voyage of voyages) {
      if (!voyagesParPassager.has(voyage.id_unique_passager)) {
        voyagesParPassager.set(voyage.id_unique_passager, []);
      }
      voyagesParPassager.get(voyage.id_unique_passager)!.push(voyage);
    }
    
    const resultat: PassagerEnregistre[] = [];
    voyagesParPassager.forEach((voyages, id_unique) => {
      const passager = passagersMap.get(id_unique);
      if (passager) {
        const voyagesTries = [...voyages].sort((a, b) => {
          const dateA = new Date(a.date_creation.split(' ')[0].split('/').reverse().join('-')).getTime();
          const dateB = new Date(b.date_creation.split(' ')[0].split('/').reverse().join('-')).getTime();
          return dateB - dateA;
        });
        
        resultat.push({
          passager,
          dernierVoyage: voyagesTries[0],
          nombreVoyages: voyages.length,
          historiqueVoyages: voyagesTries,
        });
      }
    });
    return resultat;
  });

  passagersFiltres = computed(() => {
    const recherche = this.filtreRecherche().toLowerCase().trim();
    const aeroport = this.filtreAeroport();
    const etat = this.filtreEtatVoyage();
    const numVol = this.filtreNumeroVol().toLowerCase().trim();
    const dateDebut = this.filtreDateDebut();
    const dateFin = this.filtreDateFin();

    return this.passagersEnregistres().filter(p => {
      const dernierVoyage = p.dernierVoyage;
      
      const parRecherche = recherche
        ? `${p.passager.prenom} ${p.passager.nom}`.toLowerCase().includes(recherche) ||
          p.passager.numero_document.toLowerCase().includes(recherche) ||
          dernierVoyage.numero_vol.toLowerCase().includes(recherche) ||
          dernierVoyage.numero_enregistrement.toLowerCase().includes(recherche)
        : true;
      
      const parAeroport = aeroport ? dernierVoyage.nom_aeroport === aeroport : true;
      const parEtat = etat ? dernierVoyage.etat_voyage === etat : true;
      const parNumVol = numVol ? dernierVoyage.numero_vol.toLowerCase().includes(numVol) : true;
      
      const voyageDateParts = dernierVoyage.date_voyage.split('/');
      const voyageDateISO = `${voyageDateParts[2]}-${voyageDateParts[1]}-${voyageDateParts[0]}`;
      const parDateDebut = dateDebut ? voyageDateISO >= dateDebut : true;
      const parDateFin = dateFin ? voyageDateISO <= dateFin : true;

      return parRecherche && parAeroport && parEtat && parNumVol && parDateDebut && parDateFin;
    });
  });
  
  // --- Pagination state ---
  currentPage = signal(1);
  itemsPerPage = 10;
  
  totalPages = computed(() => Math.ceil(this.passagersFiltres().length / this.itemsPerPage));
  
  passagersPagines = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.passagersFiltres().slice(startIndex, startIndex + this.itemsPerPage);
  });

  paginationText = computed(() => {
    const total = this.passagersFiltres().length;
    if (total === 0) return "Affichage de 0 à 0 sur 0 passagers";
    const start = (this.currentPage() - 1) * this.itemsPerPage + 1;
    const end = Math.min(start + this.itemsPerPage - 1, total);
    return `Affichage de ${start} à ${end} sur ${total} passagers`;
  });
  
  // --- Methods ---
  openDetailsModal(passager: PassagerEnregistre): void {
    this.selectedPassagerComplet.set(passager);
    this.isDetailsModalOpen.set(true);
  }

  closeModals(): void {
    this.isDetailsModalOpen.set(false);
    this.selectedPassagerComplet.set(null);
    this.closeImageViewer();
    this.closePdfModal();
  }

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

  // --- Image Viewer Methods ---
  openImageViewer(startIndex: number): void {
    const passagerData = this.selectedPassagerComplet();
    if (!passagerData) return;

    const images = [
      { url: passagerData.passager.photo_profil_url, title: "Photo de profil" },
      { url: passagerData.passager.photo_identite_url, title: "Photo d'identité" },
      { url: passagerData.passager.doc_recto_url, title: "Document Recto" },
      { url: passagerData.passager.doc_verso_url, title: "Document Verso" },
    ];
    
    this.imagesForViewer.set(images);
    this.currentImageIndex.set(startIndex);
    this.isImageViewerOpen.set(true);
  }

  closeImageViewer(): void {
    this.isImageViewerOpen.set(false);
    this.imagesForViewer.set([]);
    this.currentImageIndex.set(0);
  }
  
  nextImage(): void {
    this.currentImageIndex.update(index => (index + 1) % this.imagesForViewer().length);
  }

  prevImage(): void {
    this.currentImageIndex.update(index => (index - 1 + this.imagesForViewer().length) % this.imagesForViewer().length);
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'Validé': return 'bg-green-100 text-green-800';
      case 'En attente': return 'bg-yellow-100 text-yellow-800';
      case 'Rejeté': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  pagePrecedente(): void {
    this.currentPage.update(page => Math.max(1, page - 1));
  }

  pageSuivante(): void {
    this.currentPage.update(page => Math.min(this.totalPages(), page + 1));
  }
}
