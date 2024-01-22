import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortByRole',
})
export class SortByRolePipe implements PipeTransform {
  transform(players: any[]): any[] {
    if (!players) {
      return [];
    }

    const roleOrder = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

    players.sort((a, b) => {
      const roleAIndex = roleOrder.indexOf(a.role);
      const roleBIndex = roleOrder.indexOf(b.role);

      if (roleAIndex !== roleBIndex) {
        return roleAIndex - roleBIndex;
      }

      return a.specificRole.localeCompare(b.specificRole);
    });

    return players;
  }
}
