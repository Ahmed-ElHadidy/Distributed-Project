

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
        document.querySelector('#users').textContent = `Connected Users: ${users}`;
    })

    socket.on('DocContent', (newDocVersion,content) => {
        docVersion = newDocVersion
        quill.setContents(content)
        console.log(docVersion)
    })

    socket.on('Update_DocContent',(newDocVersion,content) => {
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

            socket.emit('Text_Update',documentID,userId,docVersion,delta)
            docVersion += 1
        }
    })

});