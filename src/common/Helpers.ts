const haversine = require("haversine-distance");


export class Helpers {
    static getDistanceBetweenTwoCoordinates(cord1, cord2) {
        return haversine(cord1, cord2) / 1000;
    }

    yyyymmdd(days: number): number {
        let date = new Date();
        date.setDate(date.getDate() + days);
        let mm = date.getMonth() + 1;
        let dd = date.getDate();

        return Number([date.getFullYear(),
            (mm > 9 ? '' : '0') + mm,
            (dd > 9 ? '' : '0') + dd
        ].join(''));
    };
}