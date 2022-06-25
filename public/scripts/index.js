window.addEventListener('DOMContentLoaded', () => {

    const button = document.querySelector('#joinButton');
    const input = document.querySelector('#input');
    const CreateDocButton = document.querySelector('#CreateDocButton')
    const closeButton = document.querySelector('#closeSign')
    const openBtn = document.querySelector('#openBtn')

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
                    myHeaders.append('Access-Control-Allow-Origin',LoadBalancerdata.url)

                    let myInit = {
                        method: 'GET',
                        headers: myHeaders,
                        mode: 'cors',
                        cache: 'default'
                      };

                    const r = new Request(LoadBalancerdata.url + "/RegesterDocument?" + new URLSearchParams({ 'docId': input.value }),myInit)
                    const serverResponse = await fetch(r)

                    const serverData = await serverResponse.json()

                    if (serverData.data === 'OK') {
                        window.location.href = `${LoadBalancerdata.url}/${input.value}`
                    }
                    else {
                        alert('An error occured')
                    }
                }
                else {
                    window.location.href = `${LoadBalancerdata.url}/${input.value}`
                }
            }
        }
    });
})