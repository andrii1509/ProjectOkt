var map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 49.85, lng: 24.0166666667},
        zoom: 8
    });
}
let db=firebase.firestore();
let arrCurrent = [];
let arrHistory = [];
let allEvents =[];
function showHistoryAndCurrent(arr){
    arr.forEach(item =>{
        showEvents(item)
    })
}
function sortArr(arr) {
    let now = Date.parse(Date());
    arr.sort(function (a, b) {

        let dateA = Date.parse(a.date);
        let dateB = Date.parse(b.date);
        return dateA - dateB
    });
    arr.forEach(item => {
        if (Date.parse(item.date) < now) {
            arrHistory.push(item)
        } else {
            arrCurrent.push(item)
        }

    })
}
function light(obj, block){
    let now = Date.parse(Date());
    let oneDay = 86400000;
    let objDate = Date.parse(obj.date);
    if (now + (oneDay*3) >= objDate + oneDay) {
        block.css({
            "background" : "rgba(220, 131, 2, 0.3)",
            "border" : "2px solid orange"
        });
    }
    if (now + oneDay >= objDate) {
        block.css({
            "background" : "rgba(150, 7, 0, 0.3)",
            "border" : "2px solid red"
        });
    }
}
function showEvents(obj) {
    let block = $("<div>");
    light(obj, block);
    block.addClass("item");
    let name = $("<h3>");
    let dateTime = $("<h4>");
    name.text(obj.name);
    dateTime.text(obj.date + " : " + obj.time);
    block.append(name);
    block.append(dateTime);
    let p = $("<h4>");
    p.addClass("descItem");
    p.text(`${obj.desc}`);
    let btn = $("<button>");
    btn.addClass("removeBtn")
        .text("Remove")
        .click(function () {

        });
    block.click(function () {
        console.log(obj.desc);
        block.append(p);
        block.append(btn)
    });
    $("#eventContainer").append(block)
}
function norm() {
    this.style.background = "snow";
}
document.getElementById("name").oninput = norm;
document.getElementById("date").oninput = norm;
function addEvent(){
    let name = $("#name").val();
    let desc = $("#desc").val();
    let date = $("#date").val();
    let time = $("#time").val();
    if (name === "") {
        $("#name").css("background", "red")
    }
        else if (date === "") {
        $("#date").css("background", "red")
    }
    else{
        db.collection("events")
            .add({
                name : name,
                desc : desc,
                date : date,
                time : time
            })
            .then(function () {
                    $("#success").text("SUCCESS");
                    setTimeout(function () {
                        $("#success").text("")
                    },3000)
                }
            )

    }
}
$("#add").click(function () {
    addEvent()
});
function  removeEvent() {

}
function filterEvent() {

}
db.collection("events")
    .get()
    .then(function (dataList) {
        dataList.forEach(data =>{
            let obj = data.data();
            allEvents.push(obj);
        });
        sortArr(allEvents);
        $("#lab").text("Current Tasks");
        arrCurrent.forEach(item =>{
           showEvents(item)
        });
        $("#curr").click(function () {
            $("#eventContainer").html("");
            $("#lab").text("Current Tasks");
            showHistoryAndCurrent(arrCurrent)
        });
        $("#history").click(function () {
            $("#eventContainer").html("");
            $("#lab").text("history Tasks");
            showHistoryAndCurrent(arrHistory)
        });
    })
    .catch(function (err) {
        console.log(err);
    });
