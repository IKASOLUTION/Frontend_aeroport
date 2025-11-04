import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ChartData, ChartOptions } from 'chart.js';
import { Subject, takeUntil } from 'rxjs';

import { AgentService } from 'src/app/store/agent/service';
import { Agent } from 'src/app/store/agent/model';
import { TacheService } from 'src/app/store/tache/service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CamembertTachesStats, HistogrammeTache } from 'src/app/store/tache/model';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    CommonModule,
    ChartModule,
    TableModule,
    CardModule,
    ToolbarModule,
    ButtonModule,
    TagModule,
    AvatarModule,
    DropdownModule,
    InputTextModule,
    TooltipModule,
    ProgressSpinnerModule
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  agents: Agent[] = [];
  
  isLoading = true;
  
  histogrammeData: HistogrammeTache | null = null;
  camembertData: CamembertTachesStats | null = null;
  
  histogrammeChartData: ChartData | null = null;
  camembertChartData: ChartData | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private agentService: AgentService,
    private tacheService: TacheService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.isLoading = false;
    
    // Charger histogramme
    this.tacheService.getHistogrammeTaches()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.histogrammeData = data;
          if (data) {
            this.histogrammeChartData = this.buildHistogrammeChart(data);
          }
          this.checkLoadingComplete();
        },
        error: (err) => {
          console.error('Erreur histogramme:', err);
          this.checkLoadingComplete();
        }
      });

    // Charger camembert
    this.tacheService.getCamembertTaches()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.camembertData = data;
          if (data) {
           // this.camembertChartData = this.buildCamembertChart(data);
          }
          this.checkLoadingComplete();
        },
        error: (err) => {
          console.error('Erreur camembert:', err);
          this.checkLoadingComplete();
        }
      });

    // Charger agents
    this.agentService.getAgentByServiceUserConnected()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.agents = data || [];
          this.checkLoadingComplete();
        },
        error: (err) => {
          console.error('Erreur agents:', err);
          this.checkLoadingComplete();
        }
      });
  }

  private checkLoadingComplete(): void {
    // Simple check - si on a au moins une donnée, on arrête le loading
    if (this.histogrammeData !== null || this.camembertData !== null) {
      this.isLoading = false;
    }
  }

  // KPI getters simples
  get totalTasksTermine(): number {
    return this.camembertData?.nbTachesExpirees || 0;
  }

  get totalTasksEnCours(): number {
    return this.camembertData?.nbTachesEnCours || 0;
  }

  get performanceRate(): number {
    if (!this.camembertData) return 0;
    
    const total = [
      this.camembertData.nbTachesEnCours || 0,
      this.camembertData.nbTachesEcheanceProche || 0,
      this.camembertData.nbTachesExpirees || 0
    ].reduce((sum, val) => sum + val, 0);

    const completed = this.totalTasksTermine;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  private buildHistogrammeChart(data: HistogrammeTache): ChartData {
    console.log('Building histogramme with data:', data);
    
    if (!data || !data.tachesTermineesParMois) {
      console.log('No tachesTermineesParMois data');
      return {
        labels: [],
        datasets: [{
          label: 'Tâches terminées',
          data: [],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1
        }]
      };
    }

    try {
      const labels = Object.keys(data.tachesTermineesParMois);
      const values = Object.values(data.tachesTermineesParMois).map(val => Number(val) || 0);
      
      console.log('Histogramme labels:', labels);
      console.log('Histogramme values:', values);

      const result = {
        labels: labels,
        datasets: [{
          label: 'Tâches terminées',
          data: values,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1
        }]
      };

      console.log('Final histogramme result:', result);
      return result;
    } catch (error) {
      console.error('Error building histogramme:', error);
      return {
        labels: [],
        datasets: [{
          label: 'Tâches terminées',
          data: [],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1
        }]
      };
    }
  }

  private buildCamembertChart(data: CamembertTachesStats): ChartData {
    console.log('Building camembert with data:', data);
    
    if (!data) {
      console.log('No data for camembert');
      return {
        labels: [],
        datasets: [{ 
          data: [], 
          backgroundColor: [],
          borderWidth: 0
        }]
      };
    }

    // Conversion explicite en nombre avec vérification
    const enCours = Number(data.nbTachesEnCours) || 0;
    const echeanceProche = Number(data.nbTachesEcheanceProche) || 0;
    const expirees = Number(data.nbTachesExpirees) || 0;
    
    console.log('Camembert values:', { enCours, echeanceProche, expirees });

    const result = {
      labels: ['En cours', 'Échéance proche', 'Expirées'],
      datasets: [{
        data: [enCours, echeanceProche, expirees],
        backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
        borderWidth: 0
      }]
    };
    
    console.log('Final camembert result:', result);
    return result;
  }

  getBarChartOptions(): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    };
  }

  getPieChartOptions(): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      }
    };
  }

  getStatusLegend(): any[] {
    if (!this.camembertData) return [];

    return [
      { label: 'En cours', color: '#4caf50', value: this.camembertData.nbTachesEnCours || 0 },
      { label: 'Échéance proche', color: '#ff9800', value: this.camembertData.nbTachesEcheanceProche || 0 },
      { label: 'Expirées', color: '#f44336', value: this.camembertData.nbTachesExpirees || 0 }
    ];
  }

  getInitials(nom: string, prenom: string): string {
    return `${nom?.charAt(0) || ''}${prenom?.charAt(0) || ''}`.toUpperCase();
  }
}