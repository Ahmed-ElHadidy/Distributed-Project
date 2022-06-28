window.addEventListener('DOMContentLoaded', () => {
    const documentID = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);

    let socket = io();
    let Delta = Quill.import('delta')
    if (localStorage.getItem('TextEditor_UserId') === null) {
        localStorage.setItem('TextEditor_UserId', uuid.v4())
    }
    const userId = uuid.v4()
    let docVersion = -1
    let connected = false
    let hist = []

    socket.on('connect', () => {

        connected = true
        console.log(connected)
    })

    socket.emit('Regetier_client', documentID, userId);
    socket.on('invalidDoc', () => {
        window.location.href = 'http://3.64.126.0:3000'
    })
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
    })

    socket.on('Update_DocContent', (newDocVersion, content) => {
            try {

                const update = quill.getContents().diff(new Delta(content))
                docVersion = newDocVersion
                quill.updateContents(update)
            } catch (err) {
                console.log('here')
            }
        })
        //if a server fails
    socket.on('disconnect', async(reason) => {
        try {
            let res = await fetch(`http://3.64.126.0:3000/isServerDown?docId=${documentID}`)
            let data = await res.json()
            if (data.res === 'YES') {
                window.location.href = 'http://3.64.126.0:3000'
            }
        } catch (err) {
            console.log(err)
            connected = false
            socket.socket.reconnect()

        }
    })


    socket.on('reconnect', () => {
        socket.emit('Re-connection')
        connected = true
        hist.forEach((h) => {
            socket.emit('Text_Update', documentID, userId, h.docVersion, h.delta)
        })
        hist = []
    })

    // setting up quill

    var toolbarOptions = [
        ["bold", "italic", "underline", "strike"], // toggled buttons
        ["blockquote", "code-block"],

        [{ header: 1 }, { header: 2 }], // custom button values
        [{ list: "ordered" }, { list: "bullet" }],
        [{ script: "sub" }, { script: "super" }], // superscript/subscript
        [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
        [{ direction: "rtl" }], // text direction

        [{ size: ["small", false, "large", "huge"] }], // custom dropdown
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ list: "ordered" }, { list: "bullet" }],

        [{ color: [] }, { background: [] }], // dropdown with defaults from theme
        [{ font: [] }],
        [{ align: [] }],
        ["link", "image", "video"],

        ["clean"], // remove formatting button
    ];
    const quillSetup = () => new Quill("#editor", {
        theme: "snow",
        modules: {
            toolbar: toolbarOptions,
        },
    })


    let quill = quillSetup()
    quill.on('text-change', (delta, olddelta, source) => {
        if (source !== "api") {
            console.log(window.navigator.onLine)
            if (connected === false) {
                console.log(hist)
                hist.push({ 'docVersion': docVersion, 'delta': delta })
            } else {
                socket.emit('Text_Update', documentID, userId, docVersion, delta)
            }
            docVersion += 1
        }
    })

});