class Event {
    constructor(start_date, title, end_date = undefined, description = ""){
        this.start_date = start_date;
        this.title = title;
        this.end_date = end_date;
        this.description = description;
    };

    // Because array sort wants an (a,b) sorting function rather than this.compare(b)
    static comparefunction(a, b){
        if (a.start_date.after(b.start_date)){
            return 1;
        } else{
            return -1;
        }
    }
}

class Period extends Event {
    constructor(start_date, title, end_date = undefined, description = "", oldEvents = new Map()){
        super(start_date, title, end_date, description);
        this.subEvents = oldEvents;
    }

    addEvent(event) {
        this.subEvents.set(event.title, event);
        // Date magicking
        if(event.start_date.before(this.start_date)){
            this.start_date = event.start_date
        }
        // this might fuckup due to undefined
        if(event.end_date.after(this.end_date)){
            this.end_date = event.end_date;
        }
    }
}

class DefaultPeriod extends Period{

    constructor(event, title){
        console.assert(event instanceof Event, "Period is being constructed without a matching event");
        let end_date = (event.end_date == null) ? event.start_date : event.end_date;
        super(event.start_date, title, end_date, event.description);

        this.subEvents = new Map();
        this.subEvents.set(event.title, event)
    }

    // Update end/beginning dates if new event added to period is
}