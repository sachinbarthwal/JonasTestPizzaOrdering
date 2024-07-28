import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], type: string): any[] {
    if (!items || !type) {
      return items;
    }
    return items.filter(item => item.type === type);
  }
}