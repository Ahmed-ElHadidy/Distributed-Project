window.addEventListener('DOMContentLoaded', () => {

    const button = document.querySelector('#joinButton');
    const input = document.querySelector('#input');
    const CreateDocButton = document.querySelector('#CreateDocButton')
    const closeButton = document.querySelector('#closeSign')
    const openBtn = document.querySelector('#openBtn')
    // const userImage = document.querySelector('#userImage')

    // if (localStorage.getItem('TextEditor_UserId') === null) {
    //     localStorage.setItem('TextEditor_UserId', uuid.v4())
    // }
    // const userId = localStorage.getItem('TextEditor_UserId')

    // // setup user avatar
    // let svg = multiavatar(userId)
    // userImage.innerHTML = svg


    closeButton.addEventListener('click', () => {
        document.querySelector('.bg-modal').style.display = "none";

    })

    openBtn.addEventListener('click', () => {
        document.querySelector('.bg-modal').style.display = "flex";
    })


    CreateDocButton.addEventListener('click', async (e) => {
        e.preventDefault()
        const response = await fetch('/getId')
        const data = await response.json()
        window.location.href = `${data.url}/${data.id}`
    })

    button.addEventListener('click', async (e) => {
        if (input.value != '') {

            const LoadBalancerResponse = await fetch('/checkId?' + new URLSearchParams({ 'docId': input.value }))
            const LoadBalancerdata = await LoadBalancerResponse.json()
            if (LoadBalancerdata.url === 'invalid') {
                alert('invalid Document')
            }
            else {
                if (LoadBalancerdata.firstConnect) {
                    let myHeaders = new Headers();
                    myHeaders.append('Access-Control-Allow-Origin', LoadBalancerdata.url)

                    let myInit = {
                        method: 'GET',
                        headers: myHeaders,
                        mode: 'cors',
                        cache: 'default'
                    };

                    const r = new Request(LoadBalancerdata.url + "/RegesterDocument?" + new URLSearchParams({ 'docId': input.value }), myInit)
                    let serverResponse
                    let serverData
                    try {
                        serverResponse = await fetch(r)

                        serverData = await serverResponse.json()


                        if (serverData.data === 'OK') {
                            window.location.href = `${LoadBalancerdata.url}/${input.value}`
                        }
                        else {
                            alert('An error occured')
                        }
                    }
                    catch (err) {
                        alert('there was a proplem connecteing to the server')
                    }
                }
                else {
                    window.location.href = `${LoadBalancerdata.url}/${input.value}`
                }
            }
        }
    });
})