import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";


@Injectable()
export class PositiveIntPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        const val = parseInt(value, 10)
        if (isNaN(val) || val <= 0) {
            throw new BadRequestException(`Аргумент должен быть положитекльным числом, получили ${value}`)
        }

        return val
    }
}