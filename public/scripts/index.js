window.addEventListener('DOMContentLoaded',()=>{

    const button = document.querySelector('#joinButton');
    const input = document.querySelector('#input');
    const CreateDocButton = document.querySelector('#CreateDocButton')
    CreateDocButton.addEventListener('click', async(e)=>{
        e.preventDefault()
        const response = await fetch('/getId')
        const data = await response.json()
        window.location.href = `${data.url}/${data.id}`
    })

    button.addEventListener('click',async(e)=>{
        if(input.value != ''){
            const response = await fetch('/checkId?'+ new URLSearchParams({'docId':input.value})) 
            const data =  await response.json()
            console.log(data)
            data.url === 'invalid' ? alert('invalid Document') : window.location.href = `${data.url}/${input.value}`
        }
    });
})