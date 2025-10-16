import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DonneesService } from '../../services/donnees.service';
import { ActionHistorique } from '../../modeles/historique';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './historique.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoriqueComponent {
  private donneesService = inject(DonneesService);
  private toutesLesActions = signal<ActionHistorique[]>([]);

  // --- Filter Signals ---
  filtreRechercheUtilisateur = signal('');
  filtreTypeAction = signal('');
  filtreAction = signal('');
  filtreDateDebut = signal('');
  filtreDateFin = signal('');

  // --- Computed data for filters ---
  utilisateurs = computed(() => [...new Set(this.toutesLesActions().map(a => a.utilisateur))]);
  typesAction = computed(() => [...new Set(this.toutesLesActions().map(a => a.type_action))]);
  actionsTypes: ('CREATE' | 'UPDATE' | 'DELETE' | 'VALIDATE')[] = ['CREATE', 'UPDATE', 'DELETE', 'VALIDATE'];

  actionsFiltrees = computed(() => {
    const recherche = this.filtreRechercheUtilisateur().toLowerCase().trim();
    const typeAction = this.filtreTypeAction();
    const action = this.filtreAction();
    const dateDebut = this.filtreDateDebut();
    const dateFin = this.filtreDateFin();

    return this.toutesLesActions().filter(item => {
      const parRecherche = recherche ? item.utilisateur.toLowerCase().includes(recherche) : true;
      const parTypeAction = typeAction ? item.type_action === typeAction : true;
      const parAction = action ? item.action === action : true;
      
      const itemDate = item.date_action.split(' ')[0];
      const parDateDebut = dateDebut ? itemDate >= dateDebut : true;
      const parDateFin = dateFin ? itemDate <= dateFin : true;

      return parRecherche && parTypeAction && parAction && parDateDebut && parDateFin;
    });
  });

  // --- Pagination state ---
  currentPage = signal(1);
  itemsPerPage = 10;

  // --- Computed data for display ---
  totalPages = computed(() => Math.ceil(this.actionsFiltrees().length / this.itemsPerPage));

  actionsPaginees = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.actionsFiltrees().slice(startIndex, startIndex + this.itemsPerPage);
  });

  paginationText = computed(() => {
    const total = this.actionsFiltrees().length;
    if (total === 0) {
      return "Affichage de 0 à 0 sur 0 actions";
    }
    const start = (this.currentPage() - 1) * this.itemsPerPage + 1;
    const end = Math.min(start + this.itemsPerPage - 1, total);
    return `Affichage de ${start} à ${end} sur ${total} actions`;
  });

  // --- PDF Modal State ---
  isPdfModalOpen = signal(false);
  pdfContentTitle = signal('');
  pdfData = signal<any>(null);
  generatedDate = new Date().toLocaleDateString('fr-FR');

  constructor() {
    this.toutesLesActions.set(this.donneesService.getHistorique());
  }

  getActionClass(action: string): string {
    switch(action) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-cyan-100 text-cyan-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'VALIDATE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  // --- Pagination methods ---
  pagePrecedente(): void {
    this.currentPage.update(page => Math.max(1, page - 1));
  }

  pageSuivante(): void {
    this.currentPage.update(page => Math.min(this.totalPages(), page + 1));
  }
}
