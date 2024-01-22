import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'specificRole',
})
export class SpecificRolePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }

    // Check if the input string is "Goalkeeper" and return "GK" in that case
    if (value.toLowerCase() === 'goalkeeper') {
      return 'GK';
    } else if (value.toLocaleLowerCase() === 'striker') {
      return 'ST';
    } else if (value.toLocaleLowerCase() === 'defender') {
      return 'DEF';
    } else if (value.toLocaleLowerCase() === 'midfielder') {
      return 'MID';
    } else if (value.toLocaleLowerCase() === 'forward') {
      return 'FWD';
    }

    // If not "Goalkeeper," keep only capital letters
    return value.replace(/[^A-Z]/g, '');
  }
}
