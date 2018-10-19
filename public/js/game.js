var socket = io();

//#region connect
socket.on('connect', function () {

    console.log('Connected to server');

    var params = jQuery.deparam(window.location.search);

    socket.emit('join',params,function(err){

        if(err){

        alert(err);

        window.location.href = '/';

        }

    });

});

//#endregion

//#region startGame
socket.on("startGame",function(message){

    console.log(message);

    var template = jQuery('#message-template').html();

    var html = Mustache.render(template,{

      from:message,

    });

    jQuery('#messages').append(html);

});
//#endregion

//#region newUser
socket.on("newUser",function(message) {

    var template = jQuery('#message-template').html();

    var html = Mustache.render(template,{

      from:message,

    });

    jQuery('#messages').append(html);
    
});
//#endregion

//#region disconnect
socket.on('disconnect', function () {

    console.log('Disconnected from server');

});
//#endregion 