import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inscription.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InscriptionComponent {}