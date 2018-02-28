var socket = io.connect("http://24.16.255.56:8888");
var dataX = "0,0,0,0,0,80,200,320,440,560,680,740,740,740,740,740,740,700,580,460,340,220,100,0,0";
var dataY = "230,360,480,580,700,740,740,740,740,740,740,680,560,440,320,200,80,0,0,0,0,0,0,20,140";
var dataD = "3,3,3,3,3,2,2,2,2,2,2,4,4,4,4,4,4,1,1,1,1,1,1,3,3";
socket.emit("save", { studentname: "Dongsheng Han", statename: "States X Y Direction", dataX, dataY, dataD});
socket.emit("load", { studentname: "Dongsheng Han", statename: "States X Y Direction" });
window.onload = function () {
    console.log("starting up da sheild");
    var messages = [];
    var field = document.getElementById("field");
    var username = document.getElementById("username");

    socket.on("ping", function (ping) {
        console.log(ping);
        socket.emit("pong");
    });

    socket.on('sync', function (data) {
        console.log(data.length +" messages synced.");
        messages = data;
        var html = '';
        for (var i = 0; i < messages.length; i++) {
            html += '<b>' + (messages[i].username ? messages[i].username : 'Server') + ': </b>';
            html += messages[i].message + '<br />';
        }
        content.innerHTML = html;
        content.scrollTop = content.scrollHeight;
    });

    socket.on('message', function (data) {
        if (data.message) {
            messages.push(data);
            // update html
            var html = '';
            for (var i = 0; i < messages.length; i++) {
                html += '<b>' + (messages[i].username ? messages[i].username : 'Server') + ': </b>';
                html += messages[i].message + '<br />';
            }
            content.innerHTML = html;
            content.scrollTop = content.scrollHeight;
        } else {
            console.log("There is a problem:", data);
        }
    });

    field.onkeydown = function (e) {
        if (e.keyCode == 13) {
            var text = field.value;
            var name = "Dongsheng Han";
            socket.emit('send', { message: text, username: name });
            field.value = "";
        }
    };
	socket.on("load", function (data) {
		console.log(dataX, dataY, dataD);
	});

		

    socket.on("connect", function () {
        console.log("Socket connected.")
    });
    socket.on("disconnect", function () {
        console.log("Socket disconnected.")
    });
    socket.on("reconnect", function () {
        console.log("Socket reconnected.")
    });

};
