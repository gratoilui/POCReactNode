var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = 3000;

app.use(express.static(__dirname + '/'));

var users = {}; // liste des utilisateurs connectés
var textSave = []; //Ensemble des textes écrit avec leur position et leur couleur pour les nouveaux arrivant


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
        //l'utilisateur qui se déconnecte pour le supprimer
        var user = users[socket.id];
        if(user) {
            delete users[socket.id]; // on supprime l'objet de la liste
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
        textSave.push(msg); //on garde en memoire le nouveau message pour pouvoir les envoyer aux nouveaux connectés
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
    //event d'initialisation du canvas avec les messages existants
    socket.on('init', function(msg){
        //on envoie au nouveau connecté les précédents textes
        io.emit('init'+msg.counter, {textSave : textSave});
    });
    //event d'initialisation de la listes des utilisateurs
    socket.on('initUsers', function(msg){
        //on envoie au nouveau connecté les précédents textes
        io.emit('initUsers'+msg.counter, {users : users});
    });
});

http.listen(port, function(){
    console.log('listening on *:'+port);
});