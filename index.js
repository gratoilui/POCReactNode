var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/'));

var users = {}; // liste des utilisateurs connectés

//Fonction pour générer une couleur aléatoire
function randomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

io.on('connection', function(socket){
    //event lors de la déconnection d'un client
    socket.on('disconnect', function(){
        //On recherche dans la liste des utilisateurs connectés
        //l'tulisateur qui se déconnecte pour le supprimer
        var user = users[socket.id];
        if(user) {
            var msg = {username: user.name};
            //on informe les écrans "board" de la déconnection de l'utilisateur pour qu'ils mettent
            //leur liste d'utilisateur à jour
            io.emit('removeuser', msg);
        }

        console.log('user disconnected');
    });
    //event d'arrivé d'un message provenant des clients
    socket.on('chat_msg', function(msg){
        console.log('message received');
        var user = users[socket.id];
        msg.color = user.color;
        io.emit('chat_msg', msg);
    });
    //event d'enregistrment d'un utilisateur
    socket.on('chat_cnx', function(msg){
        console.log('connection de l\'utilisateur ' +msg.username);
        if(msg.username != '') {
            console.log(socket.id);
            var user = {};
            user.name = msg.username;
            //on détermine la couleur à associer à l'utilisateur
            user.color = randomColor();
            //on stocke l'objet dans la map des users
            users[socket.id] = user;
            msg.color = user.color;
            //on informe les écrans "board" de la connection de l'utilisateur avec son nom, pour qu'ils mettent
            //leur liste d'utilisateur à jour
            io.emit('adduser', msg);
        }
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});