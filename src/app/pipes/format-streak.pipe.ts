import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatStreak',
})
export class FormatStreakPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase();
  }
}
