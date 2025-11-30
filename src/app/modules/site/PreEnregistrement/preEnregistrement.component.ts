import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';
import * as enregistrementAction from '../../../store/enregistrement/action';
import * as enregistrementSelector from '../../../store/enregistrement/selector';
import * as globalSelector from '../../../store/global-config/selector';
import * as volAction from '../../../store/vol/action';
import * as volSelector from '../../../store/vol/selector';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { Enregistrement, MotifVoyage, TypeDocument } from 'src/app/store/enregistrement/model';
import { TypeVol, Vol } from 'src/app/store/vol/model';
import { CountryService } from 'src/app/demo/service/country.service';
import { NationaliteService } from 'src/app/demo/service/nationalite.service';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../loading-spinner.component';
import { RegulaService } from 'src/app/store/regular.service';

@Component({
    selector: 'app-front-enregistrement',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        FieldsetModule,
        InputTextModule,
        InputNumberModule,
        DropdownModule,
        CalendarModule,
        ButtonModule,
        ToastModule,
        FileUploadModule,
        LoadingSpinnerComponent
    ],
    providers: [MessageService],
    templateUrl: './preEnregistrement.component.html',
    styleUrls: ['./preEnregistrement.component.scss']
})
export class PreEnregistrementComponent implements OnInit, OnDestroy {

    private store = inject(Store);
    private messageService = inject(MessageService);
    private regulaService = inject(RegulaService);
    private destroy$ = new Subject<void>();
    private countryService = inject(CountryService);
    private nationaliteService = inject(NationaliteService);
    private router = inject(Router);

    // Signals pour la gestion de l'état local
    formData = signal<Enregistrement>({
        typeDocument: TypeDocument.PASSEPORT,
        etatVoyage: 'ALLER'
    });

    formErrors = signal<Record<string, string>>({});
    isSaving = signal<boolean>(false);
    loading = signal<boolean>(true);

    motifs = signal<{ libelle: string; value: MotifVoyage }[]>([]);
    volList$!: Observable<Array<Vol>>;
    volList: Array<Vol> = [];
    selectedVolInfo = signal<Vol | null>(null);

    // Options pour les dropdowns
    countries: any[] = [];
    selectedCountry: any;
    nationalites: any[] = [];
    selectedNationalite: any;

    ngOnInit(): void {
        this.initializeFormData();
        this.subscribeToStoreUpdates();
        this.volList$ = this.store.pipe(select(volSelector.volList));
        this.store.dispatch(volAction.loadVol());

        this.volList$.pipe(takeUntil(this.destroy$))
            .subscribe(value => {
                if (value) {
                    this.volList = [...value];
                }
            });
        this.loadMotifs();

        // Charger les pays et nationalités
        this.countryService.getCountries().then((countries) => {
            this.countries = countries;
        });

        this.nationaliteService.getCountries().then((nationalites) => {
            this.nationalites = nationalites;
        });
    }

    private subscribeToStoreUpdates(): void {
        // Écouter les vols


        // Écouter les notifications de statut
        this.store.pipe(
            select(globalSelector.status),
            takeUntil(this.destroy$)
        ).subscribe(status => {
            if (status && status.message) {
                this.showToast(status.status, status.message);
            }
        });

        // Écouter la création réussie
        this.store.pipe(
            select(enregistrementSelector.selectedEnregistrement),
            takeUntil(this.destroy$)
        ).subscribe(created => {
            if (created && created.id) {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Votre pré-enregistrement a été créé avec succès !',
                    life: 5000
                });

                // Rediriger vers une page de confirmation
                setTimeout(() => {
                    this.router.navigateByUrl('/confirmation');
                }, 2000);
            }
        });
    }

    private showToast(severity: string, message: string): void {
        const severityMap: Record<string, 'success' | 'info' | 'warn' | 'error'> = {
            'success': 'success',
            'error': 'error',
            'warning': 'warn',
            'info': 'info'
        };

        this.messageService.add({
            severity: severityMap[severity] || 'info',
            summary: this.getSummaryBySeverity(severity),
            detail: message,
            life: 5000
        });
    }

    private getSummaryBySeverity(severity: string): string {
        const summaries: Record<string, string> = {
            'success': 'Succès',
            'error': 'Erreur',
            'warning': 'Attention',
            'info': 'Information'
        };
        return summaries[severity] || 'Notification';
    }

    initializeFormData(): void {
        this.formData.set({
            typeDocument: TypeDocument.PASSEPORT,
            etatVoyage: 'ALLER',
            numeroDocument: '',
            numeroNip: '',
            dateDelivrance: '',
            lieuDelivrance: '',
            photoProfil: null,
            imageRecto: null,
            imageVerso: null,
            nomFamille: '',
            prenom: '',
            dateNaissance: '',
            lieuNaissance: '',
            nationalite: '',
            profession: '',
            paysResidence: '',
            emailContact: '',
            telephoneBurkina: '',
            telephoneEtranger: '',
            adresseBurkina: '',
            adresseEtranger: '',
            volId: null,
            villeDepart: '',
            villeDestination: '',
            dateVoyage: '',
            heureVoyage: '',
            motifVoyage: undefined,
            dureeSejour: null
        });
    }

    //   loadVols(): void {
    //     this.store.dispatch(volAction.loadVol());
    //   }

    loadMotifs(): void {
        this.motifs.set([
            { libelle: 'Affaires', value: MotifVoyage.AFFAIRES },
            { libelle: 'Tourisme', value: MotifVoyage.TOURISME },
            { libelle: 'Famille', value: MotifVoyage.FAMILLE },
            { libelle: 'Études', value: MotifVoyage.ETUDES },
            { libelle: 'Médical', value: MotifVoyage.MEDICAL },
        ]);
    }

    updateFormDataField(field: keyof Enregistrement, value: any): void {
        this.formData.update(data => ({ ...data, [field]: value }));

        // Effacer l'erreur pour ce champ si elle existe
        if (this.formErrors()[field]) {
            this.formErrors.update(errors => {
                const newErrors = { ...errors };
                delete newErrors[field];
                return newErrors;
            });
        }
    }

    /**
     * Gestion de l'upload de fichiers
     */
   onFileSelect(event: any, fieldName: 'imageRecto' | 'imageVerso' | 'photoProfil'): void {
  const file = event.files[0];

  if (file) {
    // Vérifications existantes (taille, type)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.messageService.add({
        severity: 'error',
        summary: 'Fichier trop volumineux',
        detail: 'La taille du fichier ne doit pas dépasser 5MB',
        life: 3000
      });
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Type de fichier invalide',
        detail: 'Seuls les fichiers JPG, JPEG et PNG sont acceptés',
        life: 3000
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64String = e.target.result;
      this.updateFormDataField(fieldName, base64String);

      this.messageService.add({
        severity: 'success',
        summary: 'Fichier chargé',
        detail: `Image ${this.getFieldLabel(fieldName)} chargée avec succès`,
        life: 2000
      });

      // Lecture automatique du document si c'est le recto
      if (fieldName === 'imageRecto') {
        this.autoFillFromDocument(file);
      }
    };

    reader.onerror = () => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur de lecture',
        detail: 'Impossible de lire le fichier',
        life: 3000
      });
    };

    reader.readAsDataURL(file);
  }
}

private autoFillFromDocument(file: File): void {
  this.messageService.add({
    severity: 'info',
    summary: 'Lecture du document',
    detail: 'Analyse du document en cours...',
    life: 3000
  });

  this.regulaService.verifyDocument(file).subscribe({
    next: (response) => {
      console.log('✅ Réponse Regula:', response);
      
      const documentInfo = this.regulaService.extractDocumentInfo(response);
      this.fillFormWithDocumentInfo(documentInfo);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Document analysé',
        detail: 'Les informations ont été extraites automatiquement',
        life: 3000
      });
    },
    error: (error) => {
      console.error('❌ Erreur Regula:', error);
      this.messageService.add({
        severity: 'warn',
        summary: 'Lecture impossible',
        detail: 'Le document n\'a pas pu être lu automatiquement. Remplissez manuellement.',
        life: 5000
      });
    }
  });
}


manualDocumentRead(fileField: 'imageRecto' | 'imageVerso'): void {
  const fileInput = document.querySelector(`[data-field="${fileField}"]`) as HTMLInputElement;
  
  if (fileInput && fileInput.files && fileInput.files[0]) {
    this.autoFillFromDocument(fileInput.files[0]);
  } else {
    this.messageService.add({
      severity: 'warn',
      summary: 'Aucun fichier',
      detail: 'Veuillez d\'abord sélectionner un fichier',
      life: 3000
    });
  }
}

private fillFormWithDocumentInfo(documentInfo: any): void {
  if (!documentInfo) return;

  // Mise à jour des champs seulement s'ils sont vides
  const currentData = this.formData();

  const updates: Partial<Enregistrement> = {};

  // Informations personnelles
  if (!currentData.nomFamille && documentInfo.nomFamille) {
    updates.nomFamille = documentInfo.nomFamille;
  }
  if (!currentData.prenom && documentInfo.prenom) {
    updates.prenom = documentInfo.prenom;
  }
  if (!currentData.dateNaissance && documentInfo.dateNaissance) {
    updates.dateNaissance = documentInfo.dateNaissance;
  }
  if (!currentData.lieuNaissance && documentInfo.lieuNaissance) {
    updates.lieuNaissance = documentInfo.lieuNaissance;
  }
  if (!currentData.nationalite && documentInfo.nationalite) {
    updates.nationalite = documentInfo.nationalite;
  }

  // Informations document
  if (!currentData.numeroDocument && documentInfo.numeroDocument) {
    updates.numeroDocument = documentInfo.numeroDocument;
  }
  if (!currentData.dateDelivrance && documentInfo.dateDelivrance) {
    updates.dateDelivrance = documentInfo.dateDelivrance;
  }
  if (!currentData.lieuDelivrance && documentInfo.lieuDelivrance) {
    updates.lieuDelivrance = documentInfo.lieuDelivrance;
  }

  // Appliquer les mises à jour
  if (Object.keys(updates).length > 0) {
    this.formData.update(data => ({ ...data, ...updates }));
    
    console.log('📝 Formulaire mis à jour avec:', updates);
    
    this.messageService.add({
      severity: 'success',
      summary: 'Champs remplis automatiquement',
      detail: `${Object.keys(updates).length} champs ont été pré-remplis`,
      life: 4000
    });
  } else {
    this.messageService.add({
      severity: 'info',
      summary: 'Aucune nouvelle information',
      detail: 'Le document ne contient pas de nouvelles informations à ajouter',
      life: 3000
    });
  }
}

    private getFieldLabel(fieldName: string): string {
        const labels: Record<string, string> = {
            'imageRecto': 'recto',
            'imageVerso': 'verso',
            'photoProfil': 'de profil'
        };
        return labels[fieldName] || '';
    }

    onVolSelectionChange(volId: number): void {
        // const selectedVol = this.volList().find(v => v.id === volId);

        // if (!selectedVol) return;

        // // Met à jour la sélection affichée
        // this.selectedVolInfo.set(selectedVol);

        // // Détermine les valeurs selon typeVol
        // const isArrivee = selectedVol.typeVol === TypeVol.ARRIVEE;

        // const aeroport = selectedVol.aeroport?.nomAeroport ?? '';
        // const agentAeroport = selectedVol.nomAgentConnecteAeroport ?? '';

        // // Si ARRIVEE => aeroport → agent
        // // Sinon => agent → aeroport
        // const villeDepart = isArrivee ? aeroport : agentAeroport;
        // const villeDestination = isArrivee ? agentAeroport : aeroport;

        // // Conversion dates
        // const isoDate = selectedVol.dateDepart
        //     ? new Date(selectedVol.dateDepart).toISOString()
        //     : null;

        // const dateVoyage = isoDate ? isoDate.split('T')[0] : '';
        // const heureVoyage = isoDate ? isoDate.split('T')[1].substring(0, 5) : '';

        // // Mise à jour du formulaire
        // this.formData.update(data => ({
        //     ...data,
        //     volId,
        //     villeDepart,
        //     villeDestination,
        //     dateVoyage,
        //     heureVoyage
        // }));
    }

    findPays(country: any): void {
        if (country && country.name) {
            this.formData.update(data => ({
                ...data,
                paysResidence: country.name
            }));
        }
    }

    findNationalite(nationalite: any): void {
        if (nationalite && nationalite.nationalite) {
            this.formData.update(data => ({
                ...data,
                nationalite: nationalite.nationalite
            }));
        }
    }

    validateForm(): boolean {
        const errors: Record<string, string> = {};
        const data = this.formData();

        // Validation Document
        if (!data.typeDocument) errors['typeDocument'] = 'Le type de document est requis';
        if (!data.numeroDocument?.trim()) errors['numeroDocument'] = 'Le numéro de document est requis';
        if (!data.dateDelivrance) errors['dateDelivrance'] = 'La date de délivrance est requise';
        if (!data.lieuDelivrance?.trim()) errors['lieuDelivrance'] = 'Le lieu de délivrance est requis';
        if (!data.imageRecto) errors['imageRecto'] = 'L\'image recto est requise';
        if (!data.imageVerso) errors['imageVerso'] = 'L\'image verso est requise';
        if (!data.photoProfil) errors['photoProfil'] = 'La photo de profil est requise';

        // Validation Informations Personnelles
        if (!data.prenom?.trim()) errors['prenom'] = 'Le prénom est requis';
        if (!data.nomFamille?.trim()) errors['nomFamille'] = 'Le nom de famille est requis';
        if (!data.dateNaissance) errors['dateNaissance'] = 'La date de naissance est requise';
        if (!data.lieuNaissance?.trim()) errors['lieuNaissance'] = 'Le lieu de naissance est requis';
        if (!data.nationalite?.trim()) errors['nationalite'] = 'La nationalité est requise';
        if (!data.profession?.trim()) errors['profession'] = 'La profession est requise';

        // Validation Coordonnées
        if (!data.paysResidence?.trim()) errors['paysResidence'] = 'Le pays de résidence est requis';
        if (!data.adresseBurkina?.trim()) errors['adresseBurkina'] = 'L\'adresse au Burkina est requise';
        if (!data.adresseEtranger?.trim()) errors['adresseEtranger'] = 'L\'adresse à l\'étranger est requise';

        // Validation Email (si fourni)
        if (data.emailContact && !this.isValidEmail(data.emailContact)) {
            errors['emailContact'] = 'L\'email n\'est pas valide';
        }

        // Validation Voyage
        if (!data.volId) errors['volId'] = 'Le vol est requis';
        if (!data.motifVoyage) errors['motifVoyage'] = 'Le motif du voyage est requis';
        if (!data.dureeSejour) errors['dureeSejour'] = 'La durée du séjour est requise';

        this.formErrors.set(errors);
        return Object.keys(errors).length === 0;
    }

    isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    submitEnregistrement(): void {
        console.log('📝 Soumission du formulaire...');

        if (!this.validateForm()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur de validation',
                detail: 'Veuillez corriger les erreurs dans le formulaire',
                life: 5000
            });

            // Scroll vers la première erreur
            const firstError = Object.keys(this.formErrors())[0];
            if (firstError) {
                const element = document.getElementById(firstError);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }

            return;
        }

        this.isSaving.set(true);

        const enregistrementData = this.prepareEnregistrementData();
        console.log('📤 Données à envoyer:', enregistrementData);

        this.store.dispatch(enregistrementAction.createEnregistrement(enregistrementData));
    }

    private prepareEnregistrementData(): Enregistrement {
        const data = this.formData();
        return {
            ...data,
            dateDelivrance: this.formatDate(data.dateDelivrance),
            dateNaissance: this.formatDate(data.dateNaissance),
            dateVoyage: this.formatDate(data.dateVoyage)
        };
    }

    private formatDate(date: any): string {
        if (!date) return '';
        if (date instanceof Date) {
            return date.toISOString().split('T')[0];
        }
        return date;
    }

    resetForm(): void {
        this.initializeFormData();
        this.formErrors.set({});
        this.selectedVolInfo.set(null);
        this.selectedCountry = null;
        this.selectedNationalite = null;

        this.messageService.add({
            severity: 'info',
            summary: 'Formulaire réinitialisé',
            detail: 'Le formulaire a été réinitialisé',
            life: 2000
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}