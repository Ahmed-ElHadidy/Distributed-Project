

window.addEventListener('DOMContentLoaded',()=>{
    const documentID = window.location.href.substring(window.location.href.lastIndexOf('/')+1);
    const userId = uuid.v4()
    
    let socket = io();
    socket.emit('Regetier_client',documentID,userId);

    socket.on('Users_list',(users)=>{
        
        document.querySelector('#users').textContent = `Connected Users: ${users}`;
    })
});