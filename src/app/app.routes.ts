import { Routes } from '@angular/router';
import { UserListComponent } from './components/user-list/user-list.component';
import { VoitureListComponent } from './components/voiture-list/voiture-list.component';
import { VoitureRechercheeListComponent } from './components/voiture-recherchee-list/voiture-recherchee-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ListAmendeComponent } from './list-amende/list-amende.component';
import { HistoriqueComponent } from './historique/historique.component';
import { AuthentificationComponent } from './authentification/authentification.component';
import { LogDetailsComponent } from './log-details/log-details.component';


export const routes: Routes = [
  { path: '', component: AuthentificationComponent },
  { path:'login', component: AuthentificationComponent},
  { path: 'liste-utilisateurs', component: UserListComponent },
  { path: 'dashboard/admin', component: DashboardComponent },
  { path: 'voiture', component: VoitureListComponent },
  { path: 'search', component: VoitureRechercheeListComponent },
  { path: 'list-amendes', component: ListAmendeComponent },
  { path: 'historiques', component: HistoriqueComponent },
  { path: 'voiture', component: VoitureListComponent },
  { path: 'search', component: VoitureRechercheeListComponent },
  { path: 'details/:id/:date', component: LogDetailsComponent },
  { path: '**', redirectTo: '' }
];
