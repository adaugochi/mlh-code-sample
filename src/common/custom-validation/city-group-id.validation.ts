import {Injectable} from "@nestjs/common";
import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import {getConnection} from "typeorm";
import {AppConstants} from "../../contants";
const isNullOrEmpty = require('is-null-or-empty');

@ValidatorConstraint({ name: 'CityGroupIdExists', async: true })
@Injectable()
export class CityGroupIdValidation implements ValidatorConstraintInterface {
    constructor() {
    }

    async validate(value: number) {
        try {
            if (isNullOrEmpty(value)) return true;
            let city = await getConnection().createQueryBuilder()
                .select('id')
                .from("tbl_cities_groups", "tbl_cities_groups")
                .where({ id: value })
                .execute();
            return !!city[0]?.id;
        } catch (e) {
            return false;
        }
    }

    defaultMessage(args: ValidationArguments) {
        return AppConstants.Messages.INVALID_CITY_ID;
    }
}