class oldDate{
    // Only deals in years, months and dates
    // Months/Days are 1 based, do not start at 0
    // No timezones, no daylight savings times.
    // Assume all dates in gregorian calender. If you want to use a different calender, make an extends.
    constructor(year, month=1, day = 1){
        if (typeof year === 'string'){
            year = parseInt(year, 10);
        } if(typeof month === 'string'){
            month = parseInt(month, 10);
        } if(typeof day === 'string'){
            day = parseInt(day, 10);
        }
        this.year = year;
        this.month = month;
        this.day = day;
    }

    toString(){
        return this.year + "-" + this.month + "-" + this.day;
    }

    after(date){
        if (this.year > date.year){
            return true
        } else if(this.year === date.year && this.month > date.month){
            return true;
        } else if(this.year === date.year && this.month === date.month && this.day > date.day){
            return true;
        }
        return false;
    }

    before(date){
        return !this.after(date);
    }

    partOfYear(){
        let fraction = (this.month - 1) / 12;
        if (this.day != null) {
            // Fuck your months having variable amount of days
            // Nobody will notice the pixels
            fraction += ((this.day - 1) / 30.42) / 12;
        }
        return fraction;
    }

    //Returns difference in floating points of year fractions
    // Positive if date1 before date2
    differenceTwoDates(date){
        let yearDifference = date.year - this.year;
        yearDifference += this.partOfYear(date) - this.partOfYear(this);
        return yearDifference;
    }
}