import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './connexion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnexionComponent {
  modalMotDePasseOublieOuvert = signal(false);

  ouvrirModal(): void {
    this.modalMotDePasseOublieOuvert.set(true);
  }

  fermerModal(): void {
    this.modalMotDePasseOublieOuvert.set(false);
  }
}