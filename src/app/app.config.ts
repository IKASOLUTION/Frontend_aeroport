import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideStore } from '@ngrx/store';
import  { reducer } from './store/profil/reducer';
import { provideEffects } from '@ngrx/effects';
import { ProfilEffects } from './store/profil/effect';
import {  UnifiedAuthInterceptor } from './service-util/interceptor/auth.interceptor';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { UserEffects } from './store/user/effect';
import { UserReducer } from './store/user/reducer';
import { authInitializerFactory } from './service-util/interceptor/auth.initializer.factory';
import { GlobalConfigreducer } from './store/global-config/reducer';






import { Modulereducer } from './store/module-param/reducer';
import { ModuleParamEffects } from './store/module-param/effect';
import { MenuActionEffects } from './store/menu/effect';
import { Menureducer } from './store/menu/reducer';
import { Enregistrementreducer } from './store/enregistrement/reducer';
import { EnregistrementEffects } from './store/enregistrement/effect';
import { DonneeBiometriqueEffects } from './store/biometric/effect';
import { biometricReducer } from './store/biometric/reducer';
import { PaysReducer } from './store/pays/reducer';
import { PaysEffects } from './store/pays/effect';
import { VilleReducer } from './store/ville/reducer';
import { VilleEffects } from './store/ville/effect';
import { AeroportEffects } from './store/aeroport/effect';
import { AeroportReducer } from './store/aeroport/reducer';
import { CompagnieReducer } from './store/compagnie/reducer';
import { CompagnieEffects } from './store/compagnie/effect';
import { VolReducer } from './store/vol/reducer';
import { VolEffects } from './store/vol/effect';
import { MotifVoyageEffects } from './store/motifVoyage/effect';
import { ListeNoireEffects } from './store/listeNoir/effect';
import { ListeNoireReducer } from './store/listeNoir/reducer';
import { MotifVoyageReducer } from './store/motifVoyage/reducer';



export const appConfig: ApplicationConfig = {

  providers: [

    {
      provide: APP_INITIALIZER,
      useFactory: authInitializerFactory,
      multi: true
    },

    provideHttpClient(
      withInterceptors([UnifiedAuthInterceptor])
    ),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideStore({globalState: GlobalConfigreducer, profilState: reducer , userState: UserReducer, menuActionState: Menureducer, moduleParamState: Modulereducer, villeState: VilleReducer, paysState: PaysReducer, aeroportState: AeroportReducer,compagnieState: CompagnieReducer,
    enregistrementState: Enregistrementreducer, donneeBiometriqueState: biometricReducer, volState: VolReducer, motifVoyageState: MotifVoyageReducer, listeNoireState: ListeNoireReducer
    }),
    provideEffects([ProfilEffects, UserEffects, MenuActionEffects, ModuleParamEffects, EnregistrementEffects,DonneeBiometriqueEffects,
       PaysEffects, VilleEffects, AeroportEffects, CompagnieEffects, VolEffects, ListeNoireEffects, MotifVoyageEffects]),


   provideRouter(routes),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false
    }),

    importProvidersFrom(
      NgxWebstorageModule.forRoot({
        prefix: 'myApp',
        separator: '.',
        caseSensitive: true
      })
    ),
  ],
};
