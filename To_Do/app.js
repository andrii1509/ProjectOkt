var map;
let positionLat = 0;
let positionLng =0;

function getLocation() {
        navigator.geolocation.watchPosition(showPosition)
}

function showPosition(position) {
    positionLat = position.coords.latitude;
    positionLng = position.coords.longitude;
    console.log(positionLng, positionLat);
}

function initMap() {
    getLocation();
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat : positionLat, lng : positionLng},
        zoom: 4
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
        if (Date.parse(item.date) <= now) {
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
    if ((now + oneDay >= objDate) && (objDate > now)) {
        block.css({
            "background" : "rgba(150, 7, 0, 0.3)",
            "border" : "2px solid red"
        });
    }
    if (objDate < now){
        block.css({
            "background" : "rgba(29, 29, 29, 0.3)",
            "border" : "2px solid black"
        })
    }
}



function showEvents(obj) {
    let block = $("<div>");
    light(obj, block);
    block.addClass("item");
    let name = $("<h3>");
    let time = $("<h4>");
    time.text(obj.time);
    name.text(obj.name);
    let date = $("<h4>");
    date.text(obj.date);
    block.append(name);
    block.append(date);
    block.append(time);
    let p = $("<h4>");
    p.addClass("descItem");
    p.text(`${obj.desc}`);
    let btnChg = $("<button id='change'>");
    btnChg.addClass("removeBtn")
        .text("Edit")
        .click(function (e) {
            e.stopPropagation();
            changeEvent(obj, btnChg, name, p, date, time)
        });
    let btnRem = $("<button>");
    btnRem.addClass("removeBtn")
        .text("Remove")
        .on("click", function (event) {
            event.stopPropagation();
            removeEvent(obj, block)
        });
    block.append(p);
    block.append(btnChg);
    block.append(btnRem);
    p.toggle();
    btnChg.toggle();
    btnRem.toggle();
    block.dblclick(function () {
        p.fadeToggle();
        btnRem.fadeToggle();
        btnChg.fadeToggle();
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
                time : time,
                location : ""
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


function  removeEvent(obj, block) {
    db.collection("events")
        .doc(`${obj.id}`)
        .delete()
        .then(function () {
            block.text("Removed");
            console.log("success");
        })
}

function changeEvent(obj, editBtn, name, p, date, time){
    let btn = $("<button class='removeBtn'>")
        .text("Save");
    let inpName = $("<input type='text'>")
        .val(`${obj.name}`);
    let inpDesc = $("<textarea>")
        .val(obj.desc);
    let inpDate = $("<input type='date'>")
        .val(obj.date);
    let inpTime = $("<input type='time'>")
        .val(obj.time);
    editBtn.replaceWith(btn);
    name.replaceWith(inpName);
    p.replaceWith(inpDesc);
    date.replaceWith(inpDate);
    time.replaceWith(inpTime);
    btn.click(function (e) {
        e.stopPropagation();
        db.collection("events")
            .doc(`${obj.id}`)
            .set({
                name: inpName.val(),
                desc : inpDesc.val(),
                date : inpDate.val(),
                time : inpTime.val(),
                location : ""
            })
            .then(function () {
                name.text(inpName.val());
                p.text(inpDesc.val());
                date.text(inpDate.val());
                time.text(inpTime.val());
                console.log("Changed");
            });
        btn.replaceWith(editBtn);
        inpName.replaceWith(name);
        inpDesc.replaceWith(p);
        inpDate.replaceWith(date);
        inpTime.replaceWith(time);
        editBtn.click(function (e) {
            e.stopPropagation();
            changeEvent(obj, editBtn, name, p, date, time)
        });
    });
}


$("#filter").click(function (){
    $("#lab").text("Search");
    $("#fil").html("");
    $("#eventContainer").html("");
    allEvents.forEach(function (item) {
        showEvents(item)
    });
    filterEvent()
});



function filterEvent() {
    let inp = $("<input type='text' placeholder='name'>");
    $("#fil").append(inp);
    inp.on("input", function () {
        $("#eventContainer").html("");
        let val = inp.val();
        console.log(val);
        allEvents.filter(item =>{
            if (item.name.includes(val)){
                showEvents(item)
            }
        })
    });
}



db.collection("events")
    .get()
    .then(function (dataList) {
        dataList.forEach(data =>{
            let obj = data.data();
            obj.id = data.id;
            console.log(obj);
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
