import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortByRole',
})
export class SortByRolePipe implements PipeTransform {
  transform(data: any[]): any[] {
    if (!data) {
      return [];
    }

    const roleOrder = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

    data.sort((a, b) => {
      if (a.role === undefined) {
        const roleAIndex = roleOrder.indexOf(a.covering);
        const roleBIndex = roleOrder.indexOf(b.covering);

        if (roleAIndex !== roleBIndex) {
          return roleAIndex - roleBIndex;
        }

        return a.specificRole.localeCompare(b.specificRole);
      } else {
        const roleAIndex = roleOrder.indexOf(a.role);
        const roleBIndex = roleOrder.indexOf(b.role);

        if (roleAIndex !== roleBIndex) {
          return roleAIndex - roleBIndex;
        }

        return a.specificRole.localeCompare(b.specificRole);
      }
    });

    return data;
  }
}
