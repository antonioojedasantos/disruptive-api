//begin: init user by days
function getDaysArray(start, end) {
    var arr={};
    for(var dt = start*1; dt<=end; dt++){
        arr[dt] = 0;
    }
    return arr;
};
//end: init user by days

module.exports = {getDaysArray};