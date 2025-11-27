import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { RippleModule } from 'primeng/ripple';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from 'src/app/store/user/service';
import { AccountService } from 'src/app/service-util/auth/account.service';
import { Observable } from 'rxjs';
import { AuthServerProvider } from 'src/app/service-util/auth/auth-jwt.service';

interface Service {
    icon: string;
    title: string;
    description: string;
    buttonText: string;
    buttonClass: string;
    route: string;
}

interface Procedure {
    number: number;
    title: string;
    description: string;
    colorClass: string;
}

interface Condition {
    icon: string;
    title: string;
    items: string[];
    colorClass: string;
}

interface Airline {
    name: string;
    colorClass: string;
}

interface FAQ {
    question: string;
    answer: string;
    expanded: boolean;
}

@Component({
    templateUrl: './landing.component.html',
    styles: [
        `
            ::placeholder {
                color: #fff;
            }
            
            .hero-gradient {
                background: linear-gradient(135deg, #059669 0%, #047857 100%);
            }
            
            .card-hover {
                transition: all 0.3s ease;
            }
            
            .card-hover:hover {
                transform: translateY(-8px);
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }
            
            .gradient-text {
                background: linear-gradient(110.43deg, #059669 0.04%, #10b981 100.11%);
                background-clip: text;
                -webkit-background-clip: text;
                color: transparent;
            }
            
            .procedure-card {
                transition: all 0.3s ease;
            }
            
            .procedure-card:hover {
                border-color: #059669;
            }
            
            .faq-item {
                transition: all 0.3s ease;
            }
        `,
    ],
    standalone: true,
    imports: [
        CommonModule,
        RippleModule,
        StyleClassModule,
        ButtonModule,
        InputTextModule,
        RouterModule
    ],
})
export class LandingComponent implements OnInit {
    servicesList: Service[] = [];
    procedures: Procedure[] = [];
    conditionsList: Condition[] = [];
    airlines: Airline[] = [];
    faqs: FAQ[] = [];
    isAuthenticated = false;
    isAuthenticated$!: Observable<boolean>;
    
    constructor(private layoutService: LayoutService,private auth: AuthServerProvider, private accountService:AccountService) {}

    ngOnInit() {
         this.isAuthenticated$ = this.auth.isAuthenticated$;
        this.initializeServices();
        this.initializeProcedures();
        this.initializeConditions();
        this.initializeAirlines();
        this.initializeFAQs();
    }

    logout(): void {
  this.accountService.logoutSite();
}
    initializeServices() {
        this.servicesList = [
            {
                icon: 'pi pi-pencil',
                title: 'Effectuer mon pré-enregistrement',
                description: 'Remplissez vos informations en quelques minutes et évitez les files d\'attente à l\'aéroport.',
                buttonText: 'Commencer maintenant',
                buttonClass: 'p-button-success',
                route: '/pre-enregistrement'
            },
            {
                icon: 'pi pi-search',
                title: 'Vérifier mon pré-enregistrement',
                description: 'Consultez le statut de votre pré-enregistrement et téléchargez vos documents.',
                buttonText: 'Vérifier maintenant',
                buttonClass: 'p-button-danger',
                route: '/verification'
            }
        ];
    }

    initializeProcedures() {
        this.procedures = [
            {
                number: 1,
                title: 'Inscription et Connexion',
                description: 'Créez votre compte ou connectez-vous à votre espace personnel.',
                colorClass: 'bg-green-600'
            },
            {
                number: 2,
                title: 'Remplir le formulaire',
                description: 'Saisissez vos informations personnelles et de voyage de manière sécurisée.',
                colorClass: 'bg-red-600'
            },
            {
                number: 3,
                title: 'Validation et Impression',
                description: 'Validez vos données et imprimez votre reçu de pré-enregistrement.',
                colorClass: 'bg-yellow-500'
            },
            {
                number: 4,
                title: 'Présentation à l\'aéroport',
                description: 'Présentez votre reçu de pré-enregistrement, faite vous valider et passez rapidement.',
                colorClass: 'bg-green-600'
            }
        ];
    }

    initializeConditions() {
        this.conditionsList = [
            {
                icon: 'pi pi-sign-in',
                title: 'Conditions d\'Entrée',
                items: [
                    'Passeport valide 6 mois minimum',
                    'Visa si requis selon votre nationalité',
                    'Certificat de vaccination obligatoire'
                ],
                colorClass: 'bg-green-600'
            },
            {
                icon: 'pi pi-map-marker',
                title: 'Conditions de Séjour',
                items: [
                    'Déclaration de séjour obligatoire',
                    'Respect des lois locales',
                    'Assurance voyage recommandée'
                ],
                colorClass: 'bg-red-600'
            },
            {
                icon: 'pi pi-sign-out',
                title: 'Conditions de Sortie',
                items: [
                    'Billet de retour ou aller simple justifié',
                    'Aucune restriction particulière',
                    'Droits de sortie si applicable'
                ],
                colorClass: 'bg-yellow-500'
            }
        ];
    }

    initializeAirlines() {
        this.airlines = [
            { name: 'Royal Air Maroc', colorClass: 'bg-green-600' },
            { name: 'Air Algérie', colorClass: 'bg-red-600' },
            { name: 'Air France', colorClass: 'bg-yellow-500' },
            { name: 'Air Canada', colorClass: 'bg-green-500' },
            { name: 'Brussels Airlines', colorClass: 'bg-red-500' },
            { name: 'Lufthansa', colorClass: 'bg-yellow-400' },
            { name: 'Swiss Intl', colorClass: 'bg-green-500' },
            { name: 'United', colorClass: 'bg-red-500' },
            { name: 'Turkish', colorClass: 'bg-yellow-400' },
            { name: 'Ethiopian', colorClass: 'bg-green-600' },
            { name: 'ASKY', colorClass: 'bg-red-600' },
            { name: 'Air Côte d\'Ivoire', colorClass: 'bg-yellow-500' }
        ];
    }

    initializeFAQs() {
        this.faqs = [
            {
                question: 'Combien de temps avant mon vol dois-je faire mon pré-enregistrement ?',
                answer: 'Vous pouvez effectuer votre pré-enregistrement jusqu\'à 24 heures avant votre vol et au plus tard 1 heure avant l\'heure prévue de départ. Nous vous recommandons fortement de faire votre pré-enregistrement au moins 3 heures avant votre vol international et 2 heures avant votre vol domestique.',
                expanded: false
            },
            {
                question: 'Puis-je modifier mes informations après le pré-enregistrement ?',
                answer: 'Oui, vous pouvez modifier vos informations jusqu\'à 1 heure avant le départ de votre vol via votre espace personnel sur NEYWAONGO. Après ce délai, vous devrez vous adresser directement au comptoir d\'enregistrement de votre compagnie aérienne à l\'aéroport.',
                expanded: false
            },
            {
                question: 'Le pré-enregistrement est-il obligatoire ?',
                answer: 'Le pré-enregistrement n\'est pas obligatoire mais fortement recommandé pour gagner du temps à l\'aéroport. Avec le pré-enregistrement, vous pouvez éviter les longues files d\'attente et passer directement à la sécurité.',
                expanded: false
            },
            {
                question: 'Quels documents dois-je présenter à l\'aéroport ?',
                answer: 'Vous devez présenter votre carte d\'embarquement électronique, votre pièce d\'identité valide (passeport pour les voyages internationaux), votre billet de voyage et tout document spécifique requis par votre destination (visa, certificats de vaccination, etc.).',
                expanded: false
            }
        ];
    }

    scrollBehavior(el: HTMLElement) {
        el.scrollIntoView({ behavior: 'smooth' });
    }

    scrollToElement($element: any): void {
        setTimeout(() => {
            $element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest',
            });
        }, 200);
    }

    toggleFAQ(index: number) {
        this.faqs[index].expanded = !this.faqs[index].expanded;
    }
}