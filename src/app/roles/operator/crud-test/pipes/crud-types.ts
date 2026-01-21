import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'crudTypesPipe'
})
export class CrudTypesPipe implements PipeTransform {

    transform(value: string): string {
        if (value == 'A')
            return "A Tip"
        else if (value == 'B')
            return "B Tip"
        else
            return value;
    }

}
