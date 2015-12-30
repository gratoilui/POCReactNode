var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/'));

var users =[]; // liste des utilisateurs connectés

io.on('connection', function(socket){
    //event lors de la déconnection d'un client
    socket.on('disconnect', function(){
        //On recherche dans la liste des utilisateurs connectés
        //l'tulisateur qui se déconnecte pour le supprimer
        for(var i = 0 ; i < users.length; i++) {
            if(users[i].id == socket.id){
                console.log('Déconnection de '+users[i].user);
                var msg = {username : users[i].user};
                //on informe les écrans "board" de la déconnection de l'utilisateur pour qu'ils mettent
                //leur liste d'utilisateur à jour
                io.emit('removeuser', msg);
                break;
            }
        }
        console.log('user disconnected');
    });
    //event d'arrivé d'un message provenant des clients
    socket.on('chat_msg', function(msg){
        console.log('message received');
        io.emit('chat_msg', msg);
    });
    //event d'enregistrment d'un utilisateur
    socket.on('chat_cnx', function(msg){
        console.log('connection de l\'utilisateur ' +msg.username);
        if(msg.username != '') {
            console.log(socket.id);
            users.push({id : socket.id, user : msg.username});
            //on informe les écrans "board" de la connection de l'utilisateur avec son nom, pour qu'ils mettent
            //leur liste d'utilisateur à jour
            io.emit('adduser', msg);
        }
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});