import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ModuleParamService } from '@/services/module-param.service';
import { MenuActionService } from '@/services/menu-action.service';
import { MenuAction } from '@/modeles/menuAction';
import { ModuleParam } from '@/modeles/moduleParam';


interface ToastMessage {
  severity: 'success' | 'error' | 'info' | 'warning';
  summary: string;
  detail: string;
  life?: number;
}

@Component({
  selector: 'app-module-param',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './module-param.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModuleParamComponent {
  // Services injectés
  private moduleParamService = inject(ModuleParamService);
  private menuService = inject(MenuActionService);

  // Signals pour l'état du composant
  deleteModuleParamDialog = signal(false);
  deleteModuleParamsDialog = signal(false);
  detailsDialog = signal(false);
  creeMenu = signal(false);
  creeMod = signal(false);
  submitted = signal(false);
  loading = signal(false);

  // Données
  moduleParams = signal<ModuleParam[]>([]);
  moduleParamsFiltered = signal<ModuleParam[]>([]);
  moduleParam = signal<ModuleParam>({});
  selectedModuleParams = signal<ModuleParam[]>([]);
  selectedMulti = signal<any>(null);

  menuActions = signal<MenuAction[]>([]);
  menuActionsList = signal<MenuAction[]>([]);
  selectedMenus = signal<MenuAction[]>([]);
  menuActionListe = signal<MenuAction[]>([]);
  menuAction = signal<MenuAction>({
    deleted: false,
    id: 0,
    menuActionCode: "",
    menuActionLibelle: "",
    moduleParamId: 0,
    moduleParamLibelle: ""
  });

  editIndex = signal(-1);

  // Toast messages
  toastMessages = signal<ToastMessage[]>([]);

  // Configuration
  cols = signal<any[]>([]);
  statuses = signal<any[]>([]);
  rowsPerPageOptions = [5, 10, 20];

  // Computed pour la recherche
  searchTerm = signal('');

  ngOnInit(): void {
    this.load();
    this.loadMenuActions();
  }

  load(): void {
    this.loading.set(true);
    this.moduleParamService.query().subscribe({
      next: (rest) => {
        if (rest.body) {
          this.moduleParams.set(rest.body);
          this.moduleParamsFiltered.set(rest.body);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  loadMenuActions(): void {
    this.menuService.query().subscribe((menu) => {
      if (menu.body) {
        this.menuActionListe.set(menu.body);
      }
    });
  }

  addMessage(severity: 'success' | 'error' | 'info' | 'warning', summary: string, detail: string): void {
    const messages = [...this.toastMessages()];
    messages.push({ severity, summary, detail, life: 3000 });
    this.toastMessages.set(messages);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      this.removeMessage(messages.length - 1);
    }, 3000);
  }

  removeMessage(index: number): void {
    const messages = [...this.toastMessages()];
    messages.splice(index, 1);
    this.toastMessages.set(messages);
  }

  // --- Menu Actions Methods ---
  saveMenuAction(): void {
    this.submitted.set(true);
    const currentMenuAction = this.menuAction();
    const currentIndex = this.editIndex();

    if (currentMenuAction.menuActionCode && currentMenuAction.menuActionLibelle) {
      const updatedMenuActions = [...this.menuActions()];
      
      if (currentIndex !== -1) {
        updatedMenuActions[currentIndex] = currentMenuAction;
      } else {
        updatedMenuActions.push({ ...currentMenuAction });
      }
      
      this.menuActions.set(updatedMenuActions);
      this.editIndex.set(-1);
      this.menuAction.set({
        deleted: false,
        id: 0,
        menuActionCode: "",
        menuActionLibelle: "",
        moduleParamId: 0,
        moduleParamLibelle: ""
      });
      this.submitted.set(false);
      this.creeMenu.set(false);
    } else {
      this.addMessage('error', 'Enregistrement non pris en compte',
        'Veuillez renseigner les champs obligatoires !!!');
    }
  }

  modifierMenu(menuAction: MenuAction, i: number): void {
    console.log("=============", i);
    this.editIndex.set(i);
    this.menuAction.set({ ...menuAction });
    this.creeMenu.set(true);
  }

  deleteMenu(menuAction: MenuAction, i: number): void {
    const currentMenuActions = [...this.menuActions()];
    
    if (!menuAction.id) {
      currentMenuActions.splice(i, 1);
      this.menuActions.set(currentMenuActions);
    } else {
      this.menuService.delete(menuAction.id).subscribe(() => {
        const filtered = currentMenuActions.filter(menu => menu.id !== menuAction.id);
        this.menuActions.set(filtered);
        this.addMessage('success', 'Succès', 'Menu supprimé avec succès');
      });
    }
  }

  creerMenu(): void {
    this.menuAction.set({
      deleted: false,
      id: 0,
      menuActionCode: "",
      menuActionLibelle: "",
      moduleParamId: 0,
      moduleParamLibelle: ""
    });
    this.editIndex.set(-1);
    this.submitted.set(false);
    this.creeMenu.set(true);
  }

  closeMenu(): void {
    this.creeMenu.set(false);
    this.submitted.set(false);
  }

  annulerMenu(): void {
    this.menuAction.set({
      deleted: false,
      id: 0,
      menuActionCode: "",
      menuActionLibelle: "",
      moduleParamId: 0,
      moduleParamLibelle: ""
    });
    this.editIndex.set(-1);
    this.submitted.set(false);
  }

  // --- Module Param Methods ---
  openNew(): void {
    this.submitted.set(false);
    this.creeMenu.set(true);
  }

  creerModuleA(): void {
    this.moduleParam.set({});
    this.menuActions.set([]);
    this.selectedMulti.set(null);
    this.creeMod.set(true);
  }

  editModuleParam(moduleParam: ModuleParam): void {
    this.moduleParam.set({ ...moduleParam });
    this.selectedMulti.set({ 
      libelle: moduleParam.moduleParamLibelle, 
      code: moduleParam.moduleParamCode 
    });
    this.creeMod.set(true);
    
    if (moduleParam.menuActions) {
      this.selectedMenus.set(moduleParam.menuActions);
    }
    
    if (moduleParam.id) {
      this.moduleParamService.findMenuByModule(moduleParam.id).subscribe((res) => {
        if (res.body) {
          this.menuActions.set(res.body);
          console.log("Menus chargés:", res.body);
        }
      });
    } else {
      this.menuActions.set([]);
    }
  }

  deleteModuleParam(moduleParam: ModuleParam): void {
    this.deleteModuleParamDialog.set(true);
    this.moduleParam.set({ ...moduleParam });
  }

  deleteSelectedModuleParams(): void {
    if (this.selectedModuleParams().length > 0) {
      this.deleteModuleParamsDialog.set(true);
    }
  }

  confirmDelete(): void {
    this.deleteModuleParamDialog.set(false);
    const currentModuleParam = this.moduleParam();
    
    if (currentModuleParam.id) {
      this.subscribeToSaveResponse(
        this.moduleParamService.delete(currentModuleParam.id)
      );
    }
    this.moduleParam.set({});
  }

  confirmDeleteSelected(): void {
    this.deleteModuleParamsDialog.set(false);
    this.subscribeToSaveResponseList(
      this.moduleParamService.deleteAll(this.selectedModuleParams())
    );
    this.selectedModuleParams.set([]);
  }

  hideDialog(): void {
    this.submitted.set(false);
  }

  saveModuleParam(): void {
    this.submitted.set(true);
    const currentModuleParam = this.moduleParam();
    const currentMenuActions = this.menuActions();
    
    if (currentModuleParam.moduleParamLibelle && 
        currentModuleParam.moduleParamCode && 
        currentMenuActions) {
      
      // Prepare payload: when creating a new ModuleParam, backend typically expects
      // menuActions without client-generated ids or moduleParamId set to 0.
      // Remove/omit id fields for newly created items to avoid server errors.
      const cleanedMenuActions = currentMenuActions.map(m => {
        // If menu action has a real id (>0), keep it (update case). Otherwise omit id.
        const base: any = {
          menuActionCode: m.menuActionCode,
          menuActionLibelle: m.menuActionLibelle,
          deleted: !!m.deleted
        };
        if (m.id && m.id > 0) {
          base.id = m.id;
        }
        return base as MenuAction;
      });

      const updatedModuleParam = {
        ...currentModuleParam,
        // If this is a create (no id), ensure we don't send id:0 for moduleParam
        id: currentModuleParam.id && currentModuleParam.id > 0 ? currentModuleParam.id : undefined,
        menuActions: cleanedMenuActions
      } as ModuleParam;

      if (currentModuleParam.id) {
        this.subscribeToSaveResponse(
          this.moduleParamService.update(updatedModuleParam)
        );
      } else {
        this.subscribeToSaveResponse(
          this.moduleParamService.create(updatedModuleParam)
        );
      }
      
      this.moduleParam.set({});
      this.selectedMulti.set(null);
      this.menuActions.set([]);
      this.submitted.set(false);
    }
  }

  onGlobalFilter(searchValue: string): void {
    this.searchTerm.set(searchValue);
    const search = searchValue.toLowerCase();
    
    if (!search) {
      this.moduleParamsFiltered.set([...this.moduleParams()]);
      return;
    }
    
    const filtered = this.moduleParams().filter(module =>
      module.moduleParamCode?.toLowerCase().includes(search) ||
      module.moduleParamLibelle?.toLowerCase().includes(search)
    );
    
    this.moduleParamsFiltered.set(filtered);
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedModuleParams.set([...this.moduleParams()]);
    } else {
      this.selectedModuleParams.set([]);
    }
  }

  isSelected(module: ModuleParam): boolean {
    return this.selectedModuleParams().some(m => m.id === module.id);
  }

  toggleSelection(module: ModuleParam, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const selected = [...this.selectedModuleParams()];
    
    if (checked) {
      selected.push(module);
    } else {
      const index = selected.findIndex(m => m.id === module.id);
      if (index > -1) {
        selected.splice(index, 1);
      }
    }
    
    this.selectedModuleParams.set(selected);
  }

  updateModuleParam(field: string, value: any): void {
    this.moduleParam.update(current => ({
      ...current,
      [field]: value
    }));
  }

  updateMenuAction(field: string, value: any): void {
    this.menuAction.update(current => ({
      ...current,
      [field]: value
    }));
  }

  resetForm(): void {
    this.moduleParam.set({});
    this.selectedMulti.set(null);
    this.menuActions.set([]);
    this.submitted.set(false);
    this.creeMenu.set(false);
  }

  

    showDetailsDialog(moduleParam: ModuleParam): void {
      // debug: log invocation and payload
      console.log('[ModuleParam] showDetailsDialog called with', moduleParam);
      this.moduleParam.set({ ...moduleParam });
      // si les menuActions sont présents dans l'objet reçu, on les met dans le signal menuActions
      if (moduleParam.menuActions && moduleParam.menuActions.length > 0) {
        this.menuActions.set(moduleParam.menuActions);
      } else {
        this.menuActions.set([]);
      }
      // use a microtask to avoid potential event-timing issues that could immediately close the dialog
      Promise.resolve().then(() => this.detailsDialog.set(true));
  }
  // --- Response Handlers ---
  protected subscribeToSaveResponse(result: Observable<HttpResponse<ModuleParam>>): void {
    result.subscribe({
      next: (res: HttpResponse<ModuleParam>) => this.onSaveSuccess(),
      error: (res: HttpErrorResponse) => {
        console.error('[ModuleParam] save error', res);
        this.onSaveError();
      }
    });
  }

  protected subscribeToSaveResponseList(result: Observable<HttpResponse<ModuleParam[]>>): void {
    result.subscribe({
      next: (res: HttpResponse<ModuleParam[]>) => this.onSaveSuccess(),
      error: (res: HttpErrorResponse) => {
        console.error('[ModuleParam] save list error', res);
        this.onSaveError();
      }
    });
  }

  protected onSaveSuccess(): void {
    this.addMessage('success', 'Succès', 'Opération réussie !');
    this.load();
  }

  protected onSaveError(): void {
    const errorMessage = 'Le code du module existe déjà!';
    this.addMessage('error', 'Erreur', errorMessage);
  }
}