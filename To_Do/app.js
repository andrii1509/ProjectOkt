let markersCurrent = [];
let markersHistory = [];
var map, infoWindow;
function initMap(markers) {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 6
    });
    infoWindow = new google.maps.InfoWindow;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            infoWindow.setPosition(pos);
            infoWindow.setContent('Location found.');
            infoWindow.open(map);
            map.setCenter(pos);
        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        handleLocationError(false, infoWindow, map.getCenter());
    }
    markers.forEach(function (item) {
        let marker = new google.maps.Marker({
            position: {lat : item.lat, lng : item.lng},
            title:"Hello World!"
        });
        marker.setMap(map);
    });
    let myLatlng = new google.maps.LatLng(22,79);

    let marker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        title: 'Default Marker',
        draggable:true
    });

    google.maps.event.addListener(map,'click',function(event) {

            marker = new google.maps.Marker({
                position: event.latLng,
                map: map,
                title: 'Click Generated Marker',
                draggable:true
            });
        }
    );

    google.maps.event.addListener(marker, 'drag',
        function(event) {
            document.getElementById('lat').value = this.position.lat();
            document.getElementById('lng').value = this.position.lng();
        });


    google.maps.event.addListener(marker,'dragend',function(event) {
        document.getElementById('lat').value = this.position.lat();
        document.getElementById('lng').value = this.position.lng();
        alert('Drag end');
    });


}
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
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
            arrHistory.push(item);
            markersHistory.push(item.location)
        } else {
            arrCurrent.push(item);
            markersCurrent.push(item.location)
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
    name.text(obj.name);
    let date = $("<h4>");
    date.text(obj.date);
    block.append(name);
    block.append(date);
    let p = $("<p>");
    p.addClass("descItem");
    p.text(`${obj.desc}`);
    let btnChg = $("<button id='change'>");
    btnChg.addClass("removeBtn")
        .text("Edit")
        .click(function (e) {
            e.stopPropagation();
            changeEvent(obj, btnChg, name, p, date)
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

$("#add").click(function () {
    addEvent()
});


$("#search").on("input", function () {
    $("#fil").html("");
    $("#lab").text("Search");
    $("#eventContainer").html("");
    let val = $("#search").val();
    allEvents.filter(item =>{
        if (item.name.includes(val)){
            showEvents(item)
        }
    })
});


function addEvent(){
    let name = $("#name").val();
    let desc = $("#desc").val();
    let date = $("#date").val();
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



function  removeEvent(obj, block) {
    db.collection("events")
        .doc(`${obj.id}`)
        .delete()
        .then(function () {
            block.text("Removed");
            console.log("success");
        })
}

function changeEvent(obj, editBtn, name, p, date){
    let btn = $("<button class='removeBtn'>")
        .text("Save");
    let inpName = $("<input type='text'>")
        .val(`${obj.name}`);
    let inpDesc = $("<textarea>")
        .val(obj.desc);
    let inpDate = $("<input type='datetime-local'>")
        .val(obj.date);
    editBtn.replaceWith(btn);
    name.replaceWith(inpName);
    p.replaceWith(inpDesc);
    date.replaceWith(inpDate);
    btn.click(function (e) {
        e.stopPropagation();
        db.collection("events")
            .doc(`${obj.id}`)
            .set({
                    name: inpName.val(),
                    desc : inpDesc.val(),
                    date : inpDate.val(),
                },
                {
                    merge :  true
                })
            .then(function () {
                name.text(inpName.val());
                p.text(inpDesc.val());
                date.text(inpDate.val());
                obj.name = inpName.val();
                obj.desc = inpDesc.val();
                obj.date = inpDate.val();
                console.log("Changed");
            });
        btn.replaceWith(editBtn);
        inpName.replaceWith(name);
        inpDesc.replaceWith(p);
        inpDate.replaceWith(date);
        editBtn.click(function (e) {
            e.stopPropagation();
            changeEvent(obj, editBtn, name, p, date)
        });
    });
}



db.collection("events")
    .get()
    .then(function (dataList) {
        dataList.forEach(data =>{
            let obj = data.data();
            obj.id = data.id;
            allEvents.push(obj);
        });
        sortArr(allEvents);
        initMap(markersCurrent);


        $("#lab").text("Current Tasks");
        arrCurrent.forEach(item =>{
            showEvents(item)
        });
        $("#curr").click(function () {
            $("#search").val("");
            $("#eventContainer").html("");
            $("#lab").text("Current Tasks");
            initMap(markersCurrent);
            showHistoryAndCurrent(arrCurrent)

        });
        $("#history").click(function () {
            $("#search").val("");
            $("#eventContainer").html("");
            $("#lab").text("history Tasks");
            initMap(markersHistory);
            showHistoryAndCurrent(arrHistory)
        });
    })
    .catch(function (err) {
        console.log(err);
    });
