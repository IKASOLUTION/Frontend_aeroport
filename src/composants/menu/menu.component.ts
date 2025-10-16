import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-barre-laterale',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  menuService = inject(MenuService);
}