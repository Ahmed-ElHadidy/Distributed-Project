

window.addEventListener('DOMContentLoaded',()=>{
    const documentID = window.location.href.substring(window.location.href.lastIndexOf('/')+1);
    let socket = io();
    socket.emit('send_id',documentID);
});