

window.addEventListener('DOMContentLoaded',()=>{

    let socket = io();
    socket.emit('id',window.location.href.substring(window.location.href.lastIndexOf('/')+1))
    console.log(`${window.location.href.substring(window.location.href.lastIndexOf('/')+1)}`);
    //io.on('connection')
});