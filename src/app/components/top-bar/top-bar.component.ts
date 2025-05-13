import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { VoitureService } from '../../services/voiture.service';
import { VoitureRechercheeService } from '../../services/voiture-recherchee.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css'
})
export class TopBarComponent {

  userLength = 0;
  voitureLength = 0;
  voitureRechercheeLength = 0;

  constructor(private userService: UserService, private voitureService: VoitureService, private voitureRecherche: VoitureRechercheeService) { }

    ngOnInit(): void {

      this.userService.getAllUsers().pipe(
        map(users => users.length)
      ).subscribe(length => this.userLength = length);
    
      this.voitureService.getVoitures().pipe(
        map(voitures => voitures.length)
      ).subscribe(length => this.voitureLength = length);

      this.voitureRecherche.getVoituresRecherchees().pipe(
        map(voitures => voitures.length)
      ).subscribe(length => this.voitureRechercheeLength = length);

  }
  
}
