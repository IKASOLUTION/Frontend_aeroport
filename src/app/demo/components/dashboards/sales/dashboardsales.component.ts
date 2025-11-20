import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';

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
export class  DashboardSalesComponent implements OnInit {
    
    statutVolsData: any;
    enregistrementsData: any;
    passagersAeroportData: any;
    chartOptions: any;
    doughnutOptions: any;

    volsRecents: any[] = [];
    notifications: any[] = [];
    activites: any[] = [];

    ngOnInit() {
        this.initializeChartsData();
        this.initializeTableData();
        this.initializeNotifications();
        this.initializeActivites();
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
}