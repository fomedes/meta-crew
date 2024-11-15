import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortScoutByRole'
})
export class SortScoutByRolePipe implements PipeTransform {

  transform(data: any[]): any[] {
    if (!data) {
      return [];
    }

    const roleOrder = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

    data.sort((a, b) => {
      if (a.scout.role === undefined) {
        const roleAIndex = roleOrder.indexOf(a.scout.covering);
        const roleBIndex = roleOrder.indexOf(b.scout.covering);

        if (roleAIndex !== roleBIndex) {
          return roleAIndex - roleBIndex;
        }

        return a.scout.specificRole.localeCompare(b.scout.specificRole);
      } else {
        const roleAIndex = roleOrder.indexOf(a.scout.role);
        const roleBIndex = roleOrder.indexOf(b.scout.role);

        if (roleAIndex !== roleBIndex) {
          return roleAIndex - roleBIndex;
        }

        return a.scout.specificRole.localeCompare(b.scout.specificRole);
      }
    });

    return data;
  }
}
