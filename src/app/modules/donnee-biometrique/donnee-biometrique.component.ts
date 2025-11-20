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
import * as donneeBiometriqueAction from '../../store/biometric/action';
import * as donneeBiometriqueSelector from '../../store/biometric/selector';
import { LoadingSpinnerComponent } from '../loading-spinner.component';
import { EmpreinteCapture, InformationPersonnelle, StatutDonneeBio, TypeCapture, TypeDocument } from 'src/app/store/enregistrement/model';
import { FieldsetModule } from 'primeng/fieldset';
import { TagModule } from 'primeng/tag';
import { Router, RouterModule } from '@angular/router';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DonneeBiometrique } from 'src/app/store/biometric/model';
import { SearchDto } from 'src/app/store/vol/model';
import { DonneeBiometriqueService } from 'src/app/store/biometric/service';

@Component({
    selector: 'app-donnee-biometrique',
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
    templateUrl: './donnee-biometrique.component.html',
    styleUrl: './donnee-biometrique.component.scss'
})
export class DonneeBiometriqueComponent implements OnInit, OnDestroy {
    @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
    @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
    destroy$ = new Subject<boolean>();

    // Liste des données biométriques
    donneeBiometriqueList = signal<DonneeBiometrique[]>([]);

    // Objet sélectionné
    selectedDonneeBiometrique: DonneeBiometrique | null = null;

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

    // Filtres de recherche
    dateDebut: Date | null = null;
    dateFin: Date | null = null;
    isDetailModalOpen = false;
    selectedStatuts: StatutDonneeBio[] = [];

    statutsDonneeBio = [
        { label: 'Invalide', value: StatutDonneeBio.INVALIDE },
        { label: 'Validé', value: StatutDonneeBio.VALIDE },
        { label: 'Expirée', value: StatutDonneeBio.EXPIREE }
    ];

    typesCapture = [
        { label: 'Controle', value: TypeCapture.CONTROLE },
        { label: 'Enrolement', value: TypeCapture.ENROLEMENT }
    ];

    // Modal de capture biométrique
    isCaptureBiometriqueModalOpen = signal<boolean>(false);

    // Empreintes avec images
    empreinteGauche = signal<EmpreinteCapture>({ image: null, capturee: false });
    empreinteDroite = signal<EmpreinteCapture>({ image: null, capturee: false });
    empreintePouces = signal<EmpreinteCapture>({ image: null, capturee: false });
    informationPersonnelle :InformationPersonnelle ={};

    capturedPhotoPourBiometrie = signal<string | null>(null);
    isSaving = signal<boolean>(false);
    biometric = signal<DonneeBiometrique | null>(null);
    isCameraModalOpen = signal<boolean>(false);
    capturedPhotoBase64 = signal<string | null>(null);
    currentCameraTarget = signal<'recto' | 'verso' | 'profil' | 'biometrique' | 'empreinteGauche' | 'empreinteDroite' | 'empreintePouces' | null>(null);
    private mediaStream: MediaStream | null = null;
    informationPersonnelles: InformationPersonnelle[] = [];
    typeCapture = TypeCapture.CONTROLE;


    constructor(
        private fb: FormBuilder,
        private store: Store<AppState>,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private biometricService: DonneeBiometriqueService
    ) { }

    ngOnInit(): void {
        // Définir les colonnes du tableau basées sur InformationPersonnelle
        this.cols = [
            { field: 'informationPersonnelle.nomFamille', header: 'Nom' },
            { field: 'informationPersonnelle.prenom', header: 'Prénom' },
            { field: 'informationPersonnelle.typeDocument', header: 'Type document' },
            { field: 'informationPersonnelle.numeroDocument', header: 'N° document' },
            { field: 'informationPersonnelle.nationalite', header: 'Nationalité' },
            { field: 'typeCapture', header: 'Type capture' },
            { field: 'statut', header: 'Statut' }
        ];

        this.createFormSearch();
        this.createFormFilter();

        // Initialiser les dates (7 derniers jours par défaut)
        this.dateDebut = new Date();
        this.dateDebut.setDate(this.dateDebut.getDate() - 7);
        this.dateFin = new Date();

        // Charger les données
        this.loadDonneesBiometriques();
        this.subscribeToStoreUpdates();
        this.biometricService.$findPersonnes().subscribe((res) => {
            if (res) {
                this.informationPersonnelles = res;
            }
        })
    }

    private loadDonneesBiometriques(): void {
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

        const searchParams: SearchDto = {
            dateDebut: this.dateDebut,
            dateFin: this.dateFin,
            selectedStatuts: this.selectedStatuts.length > 0 ? this.selectedStatuts : undefined,
            page: this.page,
            size: this.rows
        };

        this.store.dispatch(donneeBiometriqueAction.loadDonneeBiometriques({ search: searchParams }));
    }

    private subscribeToStoreUpdates(): void {
        // Écouter la liste des données biométriques
        this.store.pipe(
            select(donneeBiometriqueSelector.donneeBiometriqueList),
            takeUntil(this.destroy$)
        ).subscribe(value => {
            this.loading.set(false);
            if (value) {
                this.donneeBiometriqueList.set(value);
            }
        });

        // Écouter le total d'items pour la pagination
        this.store.pipe(
            select(donneeBiometriqueSelector.totalItems),
            takeUntil(this.destroy$)
        ).subscribe(total => {
            if (total !== undefined) {
                this.totalItems = total;
            }
        });
    }

    // Sélectionner une donnée biométrique pour le détail
    selectDonneeBiometrique(donneeBio: DonneeBiometrique): void {
        this.selectedDonneeBiometrique = donneeBio;
        this.isDetailModalOpen = true;
    }

    // Fermer le modal de détail
    closeDetailModal(): void {
        this.isDetailModalOpen = false;
        this.selectedDonneeBiometrique = null;
    }



    closeBiometricModal(): void {
        this.isCaptureBiometriqueModalOpen.set(false);
        this.resetCaptureData();
    }

    // Remplacez cette méthode dans votre composant TypeScript

    // Ouvrir le modal de capture biométrique
    openCaptureBiometriqueModal(donneeBio: DonneeBiometrique | null): void {
        if (donneeBio) {
            // Cas d'une recapture pour une donnée existante
            this.selectedDonneeBiometrique = donneeBio;
        }

        this.resetCaptureData();
        this.isCaptureBiometriqueModalOpen.set(true);
    }

    resetCaptureData(): void {
        this.empreinteGauche.set({ image: null, capturee: false });
        this.empreinteDroite.set({ image: null, capturee: false });
        this.empreintePouces.set({ image: null, capturee: false });
        this.capturedPhotoPourBiometrie.set(null);
    }

    // Simuler la capture d'empreinte (à remplacer par votre logique réelle)
    capturerEmpreinte(type: 'empreinteGauche' | 'empreinteDroite' | 'empreintePouces'): void {
        // Simulation : remplacer par l'intégration réelle du scanner
        const fakeImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

        if (type === 'empreinteGauche') {
            this.empreinteGauche.set({ image: fakeImage, capturee: true });
        } else if (type === 'empreinteDroite') {
            this.empreinteDroite.set({ image: fakeImage, capturee: true });
        } else if (type === 'empreintePouces') {
            this.empreintePouces.set({ image: fakeImage, capturee: true });
        }

        this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Empreinte capturée avec succès',
            life: 2000
        });
    }

    async demarrerCamera(target: 'recto' | 'verso' | 'profil' | 'biometrique' | 'empreinteGauche' | 'empreinteDroite' | 'empreintePouces'): Promise<void> {
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

    // Valider avec les données biométriques
    validerAvecBiometrie(): void {


        this.isSaving.set(true);

        // Créer les fichiers à partir des images base64
        const formData = new FormData();

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
            informationPersonnelleId: this.informationPersonnelle.id,
            typeCapture: this.typeCapture,
            empreinteGauche: empreinteGaucheFile,
            empreinteDroite: empreinteDroiteFile,
            empreintePouces: empreintePoucesFile,
            photoBiometrique: photoBiometriqueFile
        });



        const biometricData = this.biometric();
        console.log("=================this.biometric()=============", this.biometric())
        if (biometricData) {
            this.store.dispatch(donneeBiometriqueAction.createDonneeBiometrique(biometricData));
        }

        // Simuler la fin de sauvegarde
        setTimeout(() => {
            this.isSaving.set(false);
            this.closeBiometricModal();
            this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Données biométriques enregistrées avec succès',
                life: 3000
            });
        }, 2000);
    }

    // Convertir dataURI en Blob
    private dataURItoBlob(dataURI: string): Blob {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
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
        this.filterFormGroup = this.fb.group({
            dateDebut: [this.dateDebut],
            dateFin: [this.dateFin],
            statuts: [[]]
        });
    }

    onPageChange(event: any): void {
        this.page = event.page;
        this.rows = event.rows;
        this.first = event.first;
        this.loadDonneesBiometriques();
    }

    onGlobalFilter(table: any, event: Event): void {
        const input = (event.target as HTMLInputElement).value;
        table.filterGlobal(input, 'contains');
    }

    confirmDelete(donneeBio: DonneeBiometrique): void {
        const nom = donneeBio.informationPersonnelle?.nomFamille || '';
        const prenom = donneeBio.informationPersonnelle?.prenom || '';

        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer les données biométriques de "${nom} ${prenom}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-secondary',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Annuler',
            accept: () => {
                this.deleteDonneeBiometrique(donneeBio);
            }
        });
    }

    deleteDonneeBiometrique(donneeBio: DonneeBiometrique): void {
        this.store.dispatch(donneeBiometriqueAction.deleteDonneeBiometrique(donneeBio));

        this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Données biométriques supprimées',
            life: 3000
        });
    }

    openFilterDialog(): void {
        this.filterFormGroup.patchValue({
            dateDebut: this.dateDebut,
            dateFin: this.dateFin,
            statuts: this.selectedStatuts
        });
        this.filterDialog = true;
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
    applyFilters(): void {
        const formValue = this.filterFormGroup.value;
        this.dateDebut = formValue.dateDebut;
        this.dateFin = formValue.dateFin;
        this.selectedStatuts = formValue.statuts || [];

        this.page = 0;
        this.first = 0;

        this.filterDialog = false;
        this.loadDonneesBiometriques();
    }

    resetFilters(): void {
        this.dateDebut = new Date();
        this.dateDebut.setDate(this.dateDebut.getDate() - 7);
        this.dateFin = new Date();
        this.selectedStatuts = [];

        this.filterFormGroup.patchValue({
            dateDebut: this.dateDebut,
            dateFin: this.dateFin,
            statuts: []
        });

        this.page = 0;
        this.first = 0;

        this.loadDonneesBiometriques();
    }

    cancelFilter(): void {
        this.filterDialog = false;
    }

    getStatutSeverity(statut?: StatutDonneeBio): string {
        switch (statut) {
            case StatutDonneeBio.VALIDE:
                return 'success';
            case StatutDonneeBio.EXPIREE:
                return 'warning';
            case StatutDonneeBio.INVALIDE:
                return 'danger';
            default:
                return 'info';
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }
}