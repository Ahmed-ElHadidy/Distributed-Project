

window.addEventListener('DOMContentLoaded', () => {
    const documentID = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);

    let socket = io();

    if (localStorage.getItem('TextEditor_UserId') === null) {
        localStorage.setItem('TextEditor_UserId', uuid.v4())
    }
    const userId = uuid.v4()
    let docVersion = -1



    socket.emit('Regetier_client', documentID, userId);

    socket.on('Users_list', (users) => {
        const h1 = document.querySelector('#users')
        h1.innerHTML = ''
        users.forEach((user) => {
            const canvas = document.createElement('div')
            canvas.id = user
            canvas.style.width = '50px'
            canvas.style.height = '50px'
            h1.appendChild(canvas)
            let svg = multiavatar(user)
            canvas.innerHTML = svg

        })
    })

    socket.on('DocContent', (newDocVersion, content) => {
        docVersion = newDocVersion
        quill.setContents(content)
        console.log(docVersion)
    })

    socket.on('Update_DocContent', (newDocVersion, content) => {
        docVersion = newDocVersion
        quill.setContents(content)
        console.log(quill.getContents())
    })
    //if a server fails
    socket.on('disconnect', (reason) => {

    })
    // setting up quill
    const quillSetup = () => new Quill("#editor", { theme: "snow", })
    let quill = quillSetup()


    quill.on('text-change', (delta, olddelta, source) => {
        if (source !== "api") {
            console.log(delta)

            socket.emit('Text_Update', documentID, userId, docVersion, delta)
            docVersion += 1
        }
    })

});