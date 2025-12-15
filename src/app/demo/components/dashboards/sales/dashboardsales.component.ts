import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { User } from 'src/app/store/user/model';
import { Observable, Subject } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CountryService } from 'src/app/demo/service/country.service';
import { select } from '@ngrx/store';
import * as userSelector from 'src/app/store/user/selector';
import * as userAction from 'src/app/store/user/action';
import { takeUntil } from 'rxjs/operators';
import { initialVolState } from 'src/app/store/vol/state';
import { StatutVol, Vol, VolStatistics, VolTableDisplay } from 'src/app/store/vol/model';
import * as volSelector from 'src/app/store/vol/selector';
import * as volAction from 'src/app/store/vol/action';
import { Voyage } from 'src/app/store/voyage/model';
import { Enregistrement } from 'src/app/store/enregistrement/model';
import * as enregistrementSelector from 'src/app/store/enregistrement/selector';
import * as enregistrementAction from 'src/app/store/enregistrement/action';
import { en } from '@fullcalendar/core/internal-common';
import { ListeNoire } from 'src/app/store/listeNoir/model';
import * as listeNoireSelector from 'src/app/store/listeNoir/selector';
import * as listeNoireAction from 'src/app/store/listeNoir/action'; 
import { Notification } from 'src/app/store/notification/model';
import * as notificationSelector from 'src/app/store/notification/selector';
import * as notificationAction from 'src/app/store/notification/action';    
@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        ChartModule,
        MenuModule,
        TableModule,
        ButtonModule,
        RippleModule,
        TimelineModule,
        CardModule
    ],
    templateUrl: './DashboardSales.component.html',
})
export class  DashboardSalesComponent implements OnInit, OnDestroy {
    
    statutVolsData: any;
    enregistrementsData: any;
    passagersAeroportData: any;
    chartOptions: any;
    doughnutOptions: any;
    totalUsers: number = 0;
    users: User[] = [];
    userList$!: Observable<Array<User>>;
    userList: Array<User> = [];
    volList: Array<Vol> = [];
    volList$!: Observable<Array<Vol>>;
    volsRecentsTotal: number = 0;
    volRecent: Vol[] = [];
    vols: Vol[] = [];
    enregistrementList: Array<Enregistrement> = [];
    enregistrementList$!: Observable<Array<Enregistrement>>;
    totalVoyage: number = 0;
    enregistrements: Enregistrement[] = [];
   
    voyageList$!: Observable<Array<Voyage>>;
    voyageList: Array<Voyage> = [];
    voyages: Voyage[] = [];

    destroy$ = new Subject<boolean>();
    volsRecents: VolTableDisplay[] = [];
    loading: boolean = true;
    listeNoireList: Array<ListeNoire> = [];
    listeNoireList$!: Observable<Array<ListeNoire>>
    listeNoires: ListeNoire[] = [];
    listeNoireTotal: number = 0;
    notifications: any[] = [];
    notificationsRecent: Notification[] = [];
    activites: any[] = [];
    usersCountThisMonth: number = 0;
    notificationsCount: number = 0;
    notificationsList: Array<Notification> = [];
    notificationsList$!: Observable<Array<Notification>>;
    notificationss: Notification[] = [];

        constructor(
            //private fb: FormBuilder,
            private store: Store<AppState>, 
            // private messageService: MessageService,
            // private countryService: CountryService,
            // private confirmationService: ConfirmationService
        ) {}

    ngOnInit() {
        //this.initializeChartsData();
        this.initializeChartOptions();
        this.initializeTableData();
        this.initializeNotifications();
        this.initializeActivites();
        this.initializTotal();
        this.loadVolsData();
      
    }


    initializTotal() {
        // Simuler la récupération du nombre total d'utilisateurs
             this.userList$ = this.store.pipe(select(userSelector.userList));
                   this.store.dispatch(userAction.loadUser());
                   
                   this.userList$.pipe(takeUntil(this.destroy$))
                       .subscribe(value => {
                           if (value) {
                               this.loading = false;
                               this.users = [...value];
                                 this.totalUsers = value.length;
                               console.log('=== Aéroports reçus ===', value);
                           }
                       });
                
             this.enregistrementList$ = this.store.pipe(select(enregistrementSelector.enregistrementList));
                   this.store.dispatch(enregistrementAction.loadEnregistrement());
                   
                   this.enregistrementList$.pipe(takeUntil(this.destroy$))
                       .subscribe(value => {
                           if (value) {
                               this.loading = false;
                               this.enregistrements = [...value];
                                 this.totalVoyage = value.length;
                           }
                       });
        
        
          this.store.dispatch(userAction.loadUsersCountThisMonth());
        
        // Abonnez-vous au selector
        this.store.select(userSelector.usersCountThisMonth)
            .pipe(takeUntil(this.destroy$))
            .subscribe(count => {
                this.usersCountThisMonth = count || 0;
                console.log('👥 Users count this month:', this.usersCountThisMonth);
            });

        this.listeNoireList$ = this.store.pipe(select(listeNoireSelector.listeNoireList));
        this.store.dispatch(listeNoireAction.loadListeNoire());
        this.listeNoireList$.pipe(takeUntil(this.destroy$))
            .subscribe(value => {
                if (value) {
                    this.loading = false;
                    this.listeNoires = [...value];
                    this.listeNoireTotal = value.length;
                    console.log('=== Liste Noire reçus ===', value);
                }
            });


          this.notificationsList$ = this.store.pipe(select(notificationSelector.notificationList));
        this.store.dispatch(notificationAction.loadNotification());
        this.notificationsList$.pipe(takeUntil(this.destroy$))
            .subscribe(value => {
                if (value) {
                    this.loading = false;
                    this.notificationss = [...value];
                    this.notificationsCount = value.length;
                    this.notificationsRecent = this.notificationss.slice(0, 4);
                    
                    console.log('=== Liste Noire reçus ===', value);
                }
            });

            
        


    }


    
  loadVolsData() {
    this.volList$ = this.store.pipe(select(volSelector.volList));
    this.store.dispatch(volAction.loadVol());
    
    this.volList$.pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (value) {
          this.loading = false;
          this.vols = [...value];
          this.volsRecentsTotal = value.length;

             this.volRecent = this.getMostRecentVols(value, 5);
            this.volsRecents = this.transformVolsForDisplay(this.volRecent);

          console.log('=== Vols reçus ===', value);
          
          // Mettre à jour le graphique avec les données réelles
          this.updateStatutVolsChart(value);
        }
      });
  }



   updateStatutVolsChart(vols: Vol[]) {
    // Compter les vols par statut
    const stats = this.calculateVolStatistics(vols);
    
    const documentStyle = getComputedStyle(document.documentElement);
    
    this.statutVolsData = {
      labels: [
        'Programmé',
        'Confirmé', 
        'Effectué',
        'Retardé',
        'Annulé'
      ],
      datasets: [
        {
          label: 'Nombre de vols',
          data: [
            stats.programme,
            stats.confirme,
            stats.effectue,
            stats.retarde,
            stats.annule
          ],
          backgroundColor: [
            documentStyle.getPropertyValue('--blue-500'),    // Programmé
            documentStyle.getPropertyValue('--green-500'),   // Confirmé
            documentStyle.getPropertyValue('--cyan-500'),    // Effectué
            documentStyle.getPropertyValue('--yellow-500'),  // Retardé
            documentStyle.getPropertyValue('--red-500')      // Annulé
          ],
          borderWidth: 1
        }
      ]
    };
  }

  /**
   * Calcule les statistiques des vols par statut
   */
  calculateVolStatistics(vols: Vol[]): VolStatistics {
    const stats: VolStatistics = {
      programme: 0,
      confirme: 0,
      annule: 0,
      retarde: 0,
      effectue: 0
    };

    vols.forEach(vol => {
      switch (vol.statut) {
        case StatutVol.PROGRAMME:
          stats.programme++;
          break;
        case StatutVol.CONFIRME:
          stats.confirme++;
          break;
        case StatutVol.ANNULE:
          stats.annule++;
          break;
        case StatutVol.RETARDE:
          stats.retarde++;
          break;
        case StatutVol.EFFECTUE:
          stats.effectue++;
          break;
      }
    });

    console.log('=== Statistiques des vols ===', stats);
    return stats;
  }


  getMostRecentVols(vols: Vol[], limit: number): Vol[] {
    return [...vols]
      .sort((a, b) => {
        const dateA = a.dateDepart ? new Date(a.dateDepart).getTime() : 0;
        const dateB = b.dateDepart ? new Date(b.dateDepart).getTime() : 0;
        return dateB - dateA; // Tri décroissant (plus récent en premier)
      })
      .slice(0, limit);
  }

   transformVolsForDisplay(vols: Vol[]): VolTableDisplay[] {
    return vols.map(vol => ({
      numero: vol.numero || 'N/A',
      compagnie: vol.compagnie?.nomCompagine || 'N/A',
      depart: vol.villeNomD || vol.villeDepart?.nom || 'N/A',
      arrivee: vol.villeNomA || vol.villeArrivee?.nom || 'N/A',
      statut: this.getStatutLabel(vol.statut),
      statutClass: this.getStatutClass(vol.statut),
      date: this.formatDate(vol.dateDepart),
      volOriginal: vol // Garder une référence au vol original si besoin
    }));
  }
 getStatutLabel(statut?: StatutVol): string {
    if (!statut) return 'Inconnu';
    
    const labels: Record<StatutVol, string> = {
      [StatutVol.PROGRAMME]: 'Programmé',
      [StatutVol.CONFIRME]: 'Confirmé',
      [StatutVol.ANNULE]: 'Annulé',
      [StatutVol.RETARDE]: 'Retardé',
      [StatutVol.EFFECTUE]: 'Effectué'
    };
    
    return labels[statut] || 'Inconnu';
  }

  getStatutClass(statut?: StatutVol): string {
    if (!statut) return 'secondary';
    
    const classes: Record<StatutVol, string> = {
      [StatutVol.PROGRAMME]: 'info',        // Bleu
      [StatutVol.CONFIRME]: 'success',      // Vert
      [StatutVol.ANNULE]: 'danger',         // Rouge
      [StatutVol.RETARDE]: 'warning',       // Jaune/Orange
      [StatutVol.EFFECTUE]: 'primary'       // Bleu foncé ou cyan
    };
    
    return classes[statut] || 'secondary';
  }
formatDate(date?: Date): string {
    if (!date) return 'N/A';
    
    const d = new Date(date);
    
    // Format: 20/11/2025 14:30
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    // const hours = String(d.getHours()).padStart(2, '0');
    // const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year}`;
  }
initializeChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.chartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y || 0;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              weight: 500
            }
          },
          grid: {
            display: false,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary,
            stepSize: 1,
            beginAtZero: true
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
  }

 

    initializeChartsData() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        // Données Statut des Vols
        this.statutVolsData = {
            labels: ['À l\'heure', 'Retardé', 'Annulé', 'En cours'],
            datasets: [
                {
                    label: 'Nombre de vols',
                    data: [320, 85, 15, 30],
                    backgroundColor: [
                        documentStyle.getPropertyValue('--green-500'),
                        documentStyle.getPropertyValue('--yellow-500'),
                        documentStyle.getPropertyValue('--red-500'),
                        documentStyle.getPropertyValue('--blue-500')
                    ],
                    borderWidth: 1
                }
            ]
        };

        // Données Enregistrements par Mois
        this.enregistrementsData = {
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'],
            datasets: [
                {
                    label: 'Enregistrements',
                    data: [650, 590, 800, 810, 560, 550, 820],
                    fill: true,
                    borderColor: documentStyle.getPropertyValue('--primary-color'),
                    backgroundColor: 'rgba(64, 158, 255, 0.2)',
                    tension: 0.4
                }
            ]
        };

        // Données Passagers par Aéroport
        this.passagersAeroportData = {
            labels: ['Ouagadougou', 'Bobo-Dioulasso', 'Ouahigouya', 'Koudougou', 'Dédougou'],
            datasets: [
                {
                    data: [5400, 2500, 1200, 800, 340],
                    backgroundColor: [
                        documentStyle.getPropertyValue('--blue-500'),
                        documentStyle.getPropertyValue('--green-500'),
                        documentStyle.getPropertyValue('--yellow-500'),
                        documentStyle.getPropertyValue('--cyan-500'),
                        documentStyle.getPropertyValue('--purple-500')
                    ],
                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue('--blue-400'),
                        documentStyle.getPropertyValue('--green-400'),
                        documentStyle.getPropertyValue('--yellow-400'),
                        documentStyle.getPropertyValue('--cyan-400'),
                        documentStyle.getPropertyValue('--purple-400')
                    ]
                }
            ]
        };

        // Options des graphiques
        this.chartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };

        this.doughnutOptions = {
            cutout: '60%',
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            }
        };
    }

    initializeTableData() {
        this.volsRecents = [
            {
                numero: 'AF-2045',
                compagnie: 'Air France',
                depart: 'Ouagadougou',
                arrivee: 'Paris',
                statut: 'À l\'heure',
                statutClass: 'success',
                date: '20/11/2025 14:30'
            },
            {
                numero: 'ET-908',
                compagnie: 'Ethiopian Airlines',
                depart: 'Ouagadougou',
                arrivee: 'Addis-Abeba',
                statut: 'Retardé',
                statutClass: 'warning',
                date: '20/11/2025 16:45'
            },
            {
                numero: 'TK-567',
                compagnie: 'Turkish Airlines',
                depart: 'Ouagadougou',
                arrivee: 'Istanbul',
                statut: 'À l\'heure',
                statutClass: 'success',
                date: '20/11/2025 18:20'
            },
            {
                numero: 'MS-734',
                compagnie: 'EgyptAir',
                depart: 'Ouagadougou',
                arrivee: 'Le Caire',
                statut: 'En cours',
                statutClass: 'info',
                date: '20/11/2025 19:00'
            },
            {
                numero: 'KP-425',
                compagnie: 'ASKY Airlines',
                depart: 'Ouagadougou',
                arrivee: 'Lomé',
                statut: 'Annulé',
                statutClass: 'danger',
                date: '20/11/2025 20:15'
            }
        ];
    }

    initializeNotifications() {
        this.notifications = [
            {
                icon: 'pi pi-exclamation-triangle',
                iconClass: 'text-orange-500',
                bgClass: 'bg-orange-100',
                message: 'Personne de la liste noire détectée',
                time: 'Il y a 5 minutes'
            },
            {
                icon: 'pi pi-check-circle',
                iconClass: 'text-green-500',
                bgClass: 'bg-green-100',
                message: 'Vol AF-2045 enregistré avec succès',
                time: 'Il y a 15 minutes'
            },
            {
                icon: 'pi pi-info-circle',
                iconClass: 'text-blue-500',
                bgClass: 'bg-blue-100',
                message: 'Nouveau passager enregistré',
                time: 'Il y a 1 heure'
            },
            {
                icon: 'pi pi-clock',
                iconClass: 'text-yellow-500',
                bgClass: 'bg-yellow-100',
                message: 'Vol ET-908 retardé de 30 minutes',
                time: 'Il y a 2 heures'
            }
        ];
    }

    initializeActivites() {
        this.activites = [
            {
                status: 'Vol Enregistré',
                date: '20/11/2025 14:30',
                icon: 'pi pi-check',
                color: '#28a745',
                description: 'Le vol AF-2045 a été enregistré avec 145 passagers'
            },
            {
                status: 'Alerte Sécurité',
                date: '20/11/2025 13:15',
                icon: 'pi pi-exclamation-triangle',
                color: '#ffc107',
                description: 'Vérification d\'identité requise pour le passager #8745'
            },
            {
                status: 'Nouveau Vol',
                date: '20/11/2025 12:00',
                icon: 'pi pi-plus-circle',
                color: '#17a2b8',
                description: 'Vol TK-567 ajouté au planning'
            },
            {
                status: 'Maintenance',
                date: '20/11/2025 10:30',
                icon: 'pi pi-wrench',
                color: '#6c757d',
                description: 'Maintenance de routine effectuée sur le système'
            }
        ];
    }

    ngOnDestroy() {
        // Complétez le Subject pour éviter les fuites mémoire
        this.destroy$.next(true);
        this.destroy$.complete();
    }

}