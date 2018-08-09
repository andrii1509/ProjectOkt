class Event{
    constructor(name, describe, date){
        this.name = name;
        this.desc = describe;
        this.date = date;
    }
    show(){
        showEvent(this)
    }
}
let db = firebase.firestore();
let events = db.collection("Events");
events.get()
    .then(function (data) {
        data.forEach(el =>{
            let elData = el.data();
            console.log(elData);
            let event = new Event(elData.name, elData.desc, elData.date);
            event.show();
        })
    })
    .catch(function (err) {
        console.log(err);
    });
function showEvent(obj) {
    console.log(obj);
    let div = $("<div>");
    div.addClass("item");
    let h2 = $("<h2>");
    let h3 = $("<h3>");
    h3.text(obj.desc);
    let h4 = $("<h4>");
    h2.text(obj.name);
    h4.text(obj.date);
    let btn = $("<button>");
    btn.text("remove");
    btn.click(function () {
        remove(obj);
    });
    div.click(function () {
        div.append(h3);
    });
    div.append(h2, h4, btn);
    $("#container1").append(div)
}
function remove(obj){

}
$("#addEvent").click(function () {
    let name = $("#name").val();
    let describe = $("#text").val();
    let date = $("#time").val();
    let obj = new Event(name, describe, date);
    events.add({
        name : name,
        desc : describe,
        date : date
    }).then(function () {
        console.log("success");
    });
});