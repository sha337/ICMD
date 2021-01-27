const moment = require('moment');

let utilfunctions = {};

utilfunctions.intervals = function(startString, endString, duration) {
    var start = moment(startString, 'hh:mm a');
    var end = moment(endString, 'hh:mm a');

    // round starting minutes up to nearest 15 (12 --> 15, 17 --> 30)
    // note that 59 will round up to 60, and moment.js handles that correctly
    start.minutes(Math.ceil(start.minutes() / 15) * 15);

    var result = [];

    var current = moment(start);

    while (current <= end) {
        result.push(current.format('HH:mm'));
        current.add(duration, 'minutes');
    }
    return result;
}

utilfunctions.getDate = function(){
    let d = Date().toString().substr(4, 11);
    let month = new Date().toLocaleString('default', { month: 'long' });
    let date = month + '' + d.slice(3, 6) + ',' + d.slice(6);
    return date;
}



module.exports = utilfunctions;