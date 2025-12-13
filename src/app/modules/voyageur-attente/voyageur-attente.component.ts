import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { CalendarModule } from 'primeng/calendar';
import { Observable, Subject, takeUntil } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import * as enregistrementAction from '../../store/enregistrement/action';
import * as enregistrementSelector from '../../store/enregistrement/selector';
import * as motifVoyageAction from '../../store/motifVoyage/action';
import * as motifVoyageSelector from '../../store/motifVoyage/selector';
import { LoadingSpinnerComponent } from '../loading-spinner.component';
import { EmpreinteCapture, Enregistrement, TypeDocument } from 'src/app/store/enregistrement/model';
import { FieldsetModule } from 'primeng/fieldset';
import { TagModule } from 'primeng/tag';
import { SearchDto } from 'src/app/store/vol/model';
import { Aeroport } from 'src/app/store/aeroport/model';
import * as aeroportAction from '../../store/aeroport/action';
import * as aeroportSelector from '../../store/aeroport/selector';
import { Router, RouterModule } from '@angular/router';
import { MotifVoyage, StatutVoyageur } from 'src/app/store/motifVoyage/model';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DonneeBiometrique } from 'src/app/store/biometric/model';
import * as biometricAction from '../../store/biometric/action';


@Component({
    selector: 'app-voyageur-attente',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        LoadingSpinnerComponent,
        ButtonModule,
        RippleModule,
        TooltipModule,
        ToolbarModule,
        ToastModule,
        InputTextModule,
        ReactiveFormsModule,
        FormsModule,
        DropdownModule,
        CalendarModule,
        PaginatorModule,
        DialogModule,
        FieldsetModule,
        RouterModule,
        MultiSelectModule,
        TagModule,
        ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './voyageur-attente.component.html',
    styleUrl: './voyageur-attente.component.scss'
})
export class VoyageurAttenteComponent implements OnInit, OnDestroy {
    @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
    @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;


    destroy$ = new Subject<boolean>();

    // Listes de données
    enregistrementList = signal<Enregistrement[]>([]);
    newEnregistrement: Enregistrement = {};

    // Objet sélectionné
    selectedEnregistrement: Enregistrement = {};

    // Configuration du tableau
    cols: any[] = [];

    // État du formulaire et recherche
    keyword = '';
    formSearch!: FormGroup;
    totalItems = 0;
    itemsPerPage = 10;
    page = 0;
    first: number = 0;
    rows: number = 10;
    filterDialog: boolean = false;
    loading = signal<boolean>(true);
    filterFormGroup!: FormGroup;
    aeroportList$!: Observable<Array<Aeroport>>;
    aeroports: Aeroport[] = [];
    motifVoyages: MotifVoyage[] = [];
    aeroportSelected: Aeroport | null = null;
    motifVoyageSelected: MotifVoyage | null = null;
    isEditModalOpen: boolean = false;
    isCaptureBiometriqueModalOpen: boolean = false;

    // Empreintes avec images
    empreinteGauche = signal<EmpreinteCapture>({ image: null, capturee: false });
    empreinteDroite = signal<EmpreinteCapture>({ image: null, capturee: false });
    empreintePouces = signal<EmpreinteCapture>({ image: null, capturee: false });




    capturedPhotoPourBiometrie = signal<string | null>(null);
    biometric = signal<DonneeBiometrique | null>(null);
    // Modale Caméra
    isCameraModalOpen = signal<boolean>(false);
    isSaving = signal<boolean>(false);

    capturedPhotoBase64 = signal<string | null>(null);
    currentCameraTarget = signal<'recto' | 'verso' | 'profil' | 'biometrique' | 'empreinteGauche' | 'empreinteDroite' | 'empreintePouces' | null>(null);

    editFormGroup!: FormGroup;
    // Filtres de recherche
    dateDebut: Date | null = null;
    dateFin: Date | null = null;
    isDetailModalOpen = false;
    selectedStatuts: StatutVoyageur[] = [];
    typesDocument = [
        { label: 'Passeport', value: 'PASSEPORT' },
        { label: 'CNI', value: 'CNI' }
    ];
    formData = signal<Enregistrement>({
        typeDocument: TypeDocument.PASSEPORT,
    });
    private mediaStream: MediaStream | null = null;



    statutsVol = [
        { label: 'Validé', value: StatutVoyageur.VALIDE },
        { label: 'En_attente', value: StatutVoyageur.EN_ATTENTE },
        { label: 'Annulé', value: StatutVoyageur.ANNULE },
        { label: 'Rejeté', value: StatutVoyageur.REJETE }
    ];

    constructor(
        private fb: FormBuilder,
        private store: Store<AppState>,

        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        // Définir les colonnes du tableau
        this.cols = [
            { field: 'nomFamille', header: 'Nom' },
            { field: 'prenom', header: 'Prénom' },
            { field: 'typeDocument', header: 'Type document' },
            { field: 'numeroDocument', header: 'N° document' },
            { field: 'nationalite', header: 'Nationalité' },
            { field: 'villeDepart', header: 'Ville départ' },
            { field: 'villeDestination', header: 'Destination' },
            { field: 'dateVoyage', header: 'Date voyage' },
            { field: 'motifVoyage', header: 'Motif' }
        ];

        this.createFormSearch();
        this.createFormFilter();
        this.createEditForm();


        // Initialiser les dates (7 derniers jours par défaut)
        this.dateDebut = new Date();
        this.dateDebut.setDate(this.dateDebut.getDate() - 7);
        this.dateFin = new Date();

        // Charger les données
        this.loadEnregistrements();
        this.subscribeToStoreUpdates();
        // Charger les aéroports
        this.aeroportList$ = this.store.pipe(select(aeroportSelector.aeroportList));
        this.store.dispatch(aeroportAction.loadAeroport());

        this.aeroportList$.pipe(takeUntil(this.destroy$))
            .subscribe(value => {
                if (value) {
                    this.aeroports = [...value];
                    console.log('=== Aéroports assignés ===', this.aeroports);
                }
            });


        this.store.dispatch(motifVoyageAction.loadMotifVoyage());

        this.store.pipe(select(motifVoyageSelector.motifVoyageList)).pipe(takeUntil(this.destroy$))
            .subscribe(value => {
                if (value) {
                    this.motifVoyages = value || [];
                }
            });
    }



    private loadEnregistrements(): void {
        if (!this.dateDebut || !this.dateFin) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez sélectionner une période',
                life: 3000
            });
            return;
        }

        if (this.dateDebut > this.dateFin) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'La date de début doit être avant la date de fin',
                life: 3000
            });
            return;
        }

        this.loading.set(true);

        const searchDto: SearchDto = {
            dateDebut: this.dateDebut,
            dateFin: this.dateFin,
            aeroportId: this.aeroportSelected ? this.aeroportSelected.id : 0,
            status: this.selectedStatuts.length > 0 ? this.selectedStatuts : undefined,
            page: this.page,
            size: this.rows,
            sortBy: 'dateVoyage,desc'
        };

        console.log('=== SearchDto envoyé ===', searchDto);
        this.store.dispatch(enregistrementAction.loadVoyageurAttenteByPeriode({ searchDto }));
    }





    private subscribeToStoreUpdates(): void {
        // Écouter la liste des enregistrements
        this.store.pipe(
            select(enregistrementSelector.voyageurAttentList),
            takeUntil(this.destroy$)
        ).subscribe(value => {
            this.loading.set(false);
            if (value) {
                this.enregistrementList.set(value);
            }
        });

        // Écouter le total d'items pour la pagination
        this.store.pipe(
            select(enregistrementSelector.enregistrementTotalItems),
            takeUntil(this.destroy$)
        ).subscribe(total => {
            if (total !== undefined) {
                this.totalItems = total;
            }
        });
    }

    // Sélectionner un enregistrement pour le détail
    selectEnregistrement(enregistrement: Enregistrement): void {

        this.store.dispatch(enregistrementAction.selecteEnregistrement({ enregistrement }));
        this.openDetailModal(enregistrement);
    }

    // Ouvrir le modal de détail
    // openDetailModal(enregistrement: Enregistrement): void {
    //     this.selectedEnregistrement = enregistrement;
    //     this.isDetailModalOpen = true;
    // }

    openDetailModal(enregistrement: Enregistrement): void {
        this.selectedEnregistrement = enregistrement;
        
        // Convertir les dates string en objets Date si nécessaire
        const dateDelivrance = enregistrement.dateDelivrance 
            ? new Date(enregistrement.dateDelivrance) 
            : null;
        const dateNaissance = enregistrement.dateNaissance 
            ? new Date(enregistrement.dateNaissance) 
            : null;
        const dateVoyage = enregistrement.dateVoyage 
            ? new Date(enregistrement.dateVoyage) 
            : null;
        
        // Remplir le formulaire avec les données
        this.editFormGroup.patchValue({
            // Informations Document
            typeDocument: enregistrement.typeDocument,
            numeroDocument: enregistrement.numeroDocument,
            numeroNip: enregistrement.numeroNip,
            dateDelivrance: dateDelivrance,
            lieuDelivrance: enregistrement.lieuDelivrance,
            
            // Informations Personnelles
            nomFamille: enregistrement.nomFamille,
            prenom: enregistrement.prenom,
            dateNaissance: dateNaissance,
            lieuNaissance: enregistrement.lieuNaissance,
            nationalite: enregistrement.nationalite,
            profession: enregistrement.profession,
            
            // Coordonnées
            paysResidence: enregistrement.paysResidence,
            emailContact: enregistrement.emailContact,
            telephoneBurkina: enregistrement.telephoneBurkina,
            telephoneEtranger: enregistrement.telephoneEtranger,
            adresseBurkina: enregistrement.adresseBurkina,
            adresseEtranger: enregistrement.adresseEtranger,
            
            // Informations de Voyage
            aeroportDepart: enregistrement.aeroportDepart,
            aeroportDestination: enregistrement.aeroportDestination,
            dateVoyage: dateVoyage,
            heureVoyage: enregistrement.heureVoyage,
            dureeSejour: enregistrement.dureeSejour
        });
        
        console.log('📋 Formulaire rempli avec:', this.editFormGroup.value);
        
        this.isDetailModalOpen = true;
    }

    // Fermer le modal de détail
    closeDetailModal(): void {
        this.isDetailModalOpen = false;
        this.selectedEnregistrement = {};
    }

    closeFilterDialog(): void {
        this.filterDialog = false;
    }

    createFormSearch(): void {
        this.formSearch = this.fb.group({
            keyword: [null]
        });
    }

    createFormFilter(): void {
        this.aeroportSelected = null;
        this.filterFormGroup = this.fb.group({
            dateDebut: [this.dateDebut],
            dateFin: [this.dateFin],
            aeroport: [null],
            statutVoyages: [null]
        });
    }

    onPageChange(event: any): void {
        this.page = event.page;
        this.rows = event.rows;
        this.first = event.first;
        this.loadEnregistrements();
    }

    onGlobalFilter(table: any, event: Event): void {
        const input = (event.target as HTMLInputElement).value;
        table.filterGlobal(input, 'contains');
    }

    confirmDelete(enregistrement: Enregistrement): void {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer le voyageur "${enregistrement.nomFamille} ${enregistrement.prenom}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-secondary',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Annuler',
            accept: () => {
                this.deleteVoyageurAttend(enregistrement);
            }
        });
    }
    deleteVoyageurAttend(enregistrement: Enregistrement) {
        const searchDto: SearchDto = {
            dateDebut: this.dateDebut ?? new Date(),
            dateFin: this.dateFin ?? new Date(),
            aeroportId: this.aeroportSelected ? this.aeroportSelected.id : 0,
            status: this.selectedStatuts.length > 0 ? this.selectedStatuts : undefined,
            page: this.page,
            size: this.rows,
            sortBy: 'dateVoyage,desc'
        };
        this.store.dispatch(enregistrementAction.deleteEnregistrementAttente({ enregistrement: enregistrement, search: searchDto }));

    }

    openFilterDialog(): void {
        this.filterFormGroup.patchValue({
            dateDebut: this.dateDebut,
            dateFin: this.dateFin,
            aeroport: this.aeroportSelected,
            statutVoyages: this.selectedStatuts
        });
        this.filterDialog = true;
    }

    applyFilters(): void {
        const formValue = this.filterFormGroup.value;
        this.dateDebut = formValue.dateDebut;
        this.dateFin = formValue.dateFin;
        this.aeroportSelected = formValue.aeroport;
        this.selectedStatuts = formValue.statutVoyages;

        this.page = 0;
        this.first = 0;

        this.filterDialog = false;
        this.loadEnregistrements();
    }

    resetFilters(): void {
        this.dateDebut = new Date();
        this.dateDebut.setDate(this.dateDebut.getDate() - 7);
        this.dateFin = new Date();
        this.aeroportSelected = null;
        this.motifVoyageSelected = null;

        this.filterFormGroup.patchValue({
            dateDebut: this.dateDebut,
            dateFin: this.dateFin,
            aeroport: null,
            statutVoyages: []
        });

        this.page = 0;
        this.first = 0;

        this.loadEnregistrements();
    }

    cancelFilter(): void {
        this.filterDialog = false;
    }


    // Créer le formulaire d'édition
    createEditForm(): void {
        this.editFormGroup = this.fb.group({
            // Informations Document
            typeDocument: [null],
            numeroDocument: [null],
            numeroNip: [null],
            dateDelivrance: [null],
            lieuDelivrance: [null],

            // Informations Personnelles
            nomFamille: [null],
            prenom: [null],
            dateNaissance: [null],
            lieuNaissance: [null],
            nationalite: [null],
            profession: [null],

            // Coordonnées
            paysResidence: [null],
            emailContact: [null],
            telephoneBurkina: [null],
            telephoneEtranger: [null],
            adresseBurkina: [null],
            adresseEtranger: [null],

            // Informations de Voyage
            aeroportDepart: [null],
            aeroportDestination: [null],
            dateVoyage: [null],
            heureVoyage: [null],
            motifVoyage: [null],
            etatVoyage: [null],
            dureeSejour: [null],
            statut: [null]
        });
    }



    openEditModal(enregistrement: Enregistrement): void {
        this.selectedEnregistrement = enregistrement;

        // Pré-remplir le formulaire avec les données existantes
        this.editFormGroup.patchValue({
            typeDocument: enregistrement.typeDocument,
            numeroDocument: enregistrement.numeroDocument,
            numeroNip: enregistrement.numeroNip, // CORRECTION: c'était informationPersonnelle
            dateDelivrance: enregistrement.dateDelivrance ? new Date(enregistrement.dateDelivrance) : null,
            lieuDelivrance: enregistrement.lieuDelivrance,
            nomFamille: enregistrement.nomFamille,
            prenom: enregistrement.prenom,
            dateNaissance: enregistrement.dateNaissance ? new Date(enregistrement.dateNaissance) : null,
            lieuNaissance: enregistrement.lieuNaissance,
            nationalite: enregistrement.nationalite,
            profession: enregistrement.profession,
            paysResidence: enregistrement.paysResidence,
            emailContact: enregistrement.emailContact,
            telephoneBurkina: enregistrement.telephoneBurkina,
            telephoneEtranger: enregistrement.telephoneEtranger,
            adresseBurkina: enregistrement.adresseBurkina,
            adresseEtranger: enregistrement.adresseEtranger,
            aeroportDepart: enregistrement.aeroportDepart,
            aeroportDestination: enregistrement.aeroportDestination,
            dateVoyage: enregistrement.dateVoyage ? new Date(enregistrement.dateVoyage) : null,
            heureVoyage: enregistrement.heureVoyage,
            motifVoyage: enregistrement.motifVoyage,
            etatVoyage: enregistrement.etatVoyage,
            dureeSejour: enregistrement.dureeSejour,

        });

        this.isEditModalOpen = true;
    }
    closeEditModal(): void {
        this.isEditModalOpen = false;
        this.editFormGroup.reset();
        this.selectedEnregistrement = {};
    }


    saveEnregistrement(): void {
        if (this.editFormGroup.valid) {
            const updatedEnregistrement: Enregistrement = {
                ...this.editFormGroup.value,
                id: this.selectedEnregistrement?.id, // ✅ AJOUTEZ CETTE LIGNE
                // Convertir les dates au format string si nécessaire
                dateDelivrance: this.editFormGroup.value.dateDelivrance
                    ? new Date(this.editFormGroup.value.dateDelivrance).toISOString()
                    : undefined,
                dateNaissance: this.editFormGroup.value.dateNaissance
                    ? new Date(this.editFormGroup.value.dateNaissance).toISOString()
                    : undefined,
                dateVoyage: this.editFormGroup.value.dateVoyage
                    ? new Date(this.editFormGroup.value.dateVoyage).toISOString()
                    : undefined,
                statut: StatutVoyageur.VALIDE,
            };

            console.log("----------Voir status et ID-------", updatedEnregistrement);

            // Dispatch l'action de mise à jour
            this.store.dispatch(enregistrementAction.updateEnregistrement(updatedEnregistrement));

            this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Enregistrement mis à jour avec succès',
                life: 3000
            });
            this.newEnregistrement = updatedEnregistrement;
            this.closeEditModal();
            this.isCaptureBiometriqueModalOpen = true;
            this.loadEnregistrements();

        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Veuillez remplir tous les champs requis',
                life: 3000
            });
        }
    }
    // Gestion de la caméra pour empreintes
    async capturerEmpreinte(type: 'empreinteGauche' | 'empreinteDroite' | 'empreintePouces'): Promise<void> {
        this.currentCameraTarget.set(type);
        this.capturedPhotoBase64.set(null);
        this.isCameraModalOpen.set(true);

        try {
            await this.waitForView();

            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 1280, height: 720 }
            });

            if (this.videoElement && this.videoElement.nativeElement) {
                this.videoElement.nativeElement.srcObject = this.mediaStream;
            }
        } catch (error) {
            console.error('Erreur d\'accès à la caméra:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur caméra',
                detail: 'Impossible d\'accéder à la caméra',
                life: 3000
            });
            this.isCameraModalOpen.set(false);
        }
    }
    async demarrerCamera(target: 'recto' | 'verso' | 'profil' | 'biometrique'): Promise<void> {
        this.currentCameraTarget.set(target);
        this.capturedPhotoBase64.set(null);
        this.isCameraModalOpen.set(true);

        try {
            await this.waitForView();

            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 1280, height: 720 }
            });

            if (this.videoElement && this.videoElement.nativeElement) {
                this.videoElement.nativeElement.srcObject = this.mediaStream;
            }
        } catch (error) {
            console.error('Erreur d\'accès à la caméra:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur caméra',
                detail: 'Impossible d\'accéder à la caméra',
                life: 3000
            });
            this.isCameraModalOpen.set(false);
        }
    }

    private waitForView(): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, 100));
    }

    capturerPhoto(): void {
        if (!this.videoElement || !this.canvasElement) return;

        const video = this.videoElement.nativeElement;
        const canvas = this.canvasElement.nativeElement;
        const context = canvas.getContext('2d');

        if (!context) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const photoBase64 = canvas.toDataURL('image/jpeg', 0.8);
        this.capturedPhotoBase64.set(photoBase64);
    }

    reprendrePhoto(): void {
        this.capturedPhotoBase64.set(null);
    }

    confirmerPhoto(): void {
        const photo = this.capturedPhotoBase64();
        const target = this.currentCameraTarget();

        if (!photo || !target) return;

        if (target === 'biometrique') {
            this.capturedPhotoPourBiometrie.set(photo);
        } else if (target === 'empreinteGauche') {
            this.empreinteGauche.set({ image: photo, capturee: true });
        } else if (target === 'empreinteDroite') {
            this.empreinteDroite.set({ image: photo, capturee: true });
        } else if (target === 'empreintePouces') {
            this.empreintePouces.set({ image: photo, capturee: true });
        } else {
            this.formData.update(data => ({
                ...data,
                [target === 'recto' ? 'imageRecto' : target === 'verso' ? 'imageVerso' : 'photoProfil']: photo
            }));
        }

        this.arreterCamera();
    }

    arreterCamera(): void {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        this.isCameraModalOpen.set(false);
        this.capturedPhotoBase64.set(null);
        this.currentCameraTarget.set(null);
    }

    closeBiometricModal(): void {
        this.isCaptureBiometriqueModalOpen = false;
        this.empreinteGauche.set({ image: null, capturee: false });
        this.empreinteDroite.set({ image: null, capturee: false });
        this.empreintePouces.set({ image: null, capturee: false });
        this.capturedPhotoPourBiometrie.set(null);
    }


    validerAvecBiometrie(): void {
        if (!this.empreinteGauche().capturee || !this.empreinteDroite().capturee ||
            !this.empreintePouces().capturee || !this.capturedPhotoPourBiometrie()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Données incomplètes',
                detail: 'Veuillez capturer toutes les données biométriques',
                life: 3000
            });
            return;
        }

        //const passager = this.passagerPourBiometrie();
        //if (!passager) return;

        // Convertir les images en fichiers
        const empreinteGaucheFile = this.convertBase64ToFile(this.empreinteGauche().image, 'empreinte_gauche.jpg');
        const empreinteDroiteFile = this.convertBase64ToFile(this.empreinteDroite().image, 'empreinte_droite.jpg');
        const empreintePoucesFile = this.convertBase64ToFile(this.empreintePouces().image, 'empreinte_pouces.jpg');
        const photoBiometriqueFile = this.convertBase64ToFile(this.capturedPhotoPourBiometrie(), 'photo_biometrique.jpg');

        // Vérifier que toutes les conversions ont réussi
        if (!empreinteGaucheFile || !empreinteDroiteFile || !empreintePoucesFile || !photoBiometriqueFile) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur de conversion',
                detail: 'Impossible de convertir les images capturées',
                life: 3000
            });
            return;
        }

        this.biometric.set({
            //informationPersonnelleId: this.enregistrementSelect()?.informationPersonnelleId,
            informationPersonnelleId: this.newEnregistrement.informationPersonnelleId,

            empreinteGauche: empreinteGaucheFile,
            empreinteDroite: empreinteDroiteFile,
            empreintePouces: empreintePoucesFile,
            photoBiometrique: photoBiometriqueFile
        });

        const biometricData = this.biometric();
        if (biometricData) {
            this.store.dispatch(biometricAction.createDonneeBiometrique(biometricData));

            this.router.navigateByUrl('/admin/gestion-enregistrements');
        }

        this.closeBiometricModal();
        // this.resetForm();
    }

    private convertBase64ToFile(base64String: string | null, filename: string = 'photo.jpg'): File | undefined {
        if (!base64String) return undefined;

        try {
            const base64Data = base64String.split(',')[1] || base64String;
            const byteString = atob(base64Data);
            const arrayBuffer = new ArrayBuffer(byteString.length);
            const uint8Array = new Uint8Array(arrayBuffer);

            for (let i = 0; i < byteString.length; i++) {
                uint8Array[i] = byteString.charCodeAt(i);
            }

            const blob = new Blob([uint8Array], { type: 'image/jpeg' });
            return new File([blob], filename, { type: 'image/jpeg' });
        } catch (error) {
            console.error('Erreur conversion base64 vers File:', error);
            return undefined;
        }
    }

    clearTableFilters(table: any): void {
    table.clear();
    this.resetFilters();
}

// Si vous voulez un bouton pour réinitialiser uniquement les filtres du header
resetHeaderFilters(table: any): void {
    table.clear(); // Réinitialise tous les filtres du tableau PrimeNG
}

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }
}