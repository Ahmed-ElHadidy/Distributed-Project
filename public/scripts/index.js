window.addEventListener('DOMContentLoaded',()=>{

    const button = document.querySelector('#joinButton');
    const input = document.querySelector('#input');

    button.addEventListener('click',()=>{
        if(input.value != ''){
            //code for input validation and making get request to /documentID
            window.location.href = `${window.location.href}${input.value}` 
        }
    });
})