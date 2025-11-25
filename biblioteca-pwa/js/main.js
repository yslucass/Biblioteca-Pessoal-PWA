import { addLivro, getLivros, removeLivro } from "../db.js";
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            let reg;
            reg = await navigator.serviceWorker.register('/sw.js', { type: "module" });

            console.log('Service worker registrada! 😎', reg);
        } catch (err) {
            console.log('😥 Service worker registro falhou: ', err);
        }
    });
}

var constraints = { video: { facingMode: "user" }, audio: false };

const cameraView = document.querySelector("#camera--view"),
    cameraOutput = document.querySelector("#camera--output"),
    cameraSensor = document.querySelector("#camera--sensor"),
    cameraTrigger = document.querySelector("#camera--trigger")

function cameraStart() {
    navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function(stream){
        let track = stream.getTracks()[0];
        cameraView.srcObject = stream;
    })
    .catch(function(error){
        console.error("Ocorreu um Erro.", error)
    })
}

let fotoCapturada = null;

// substitui seu cameraTrigger.onclick
cameraTrigger.onclick = function() {
    cameraSensor.width = cameraView.videoWidth;
    cameraSensor.height = cameraView.videoHeight;
    cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);

    const dataURL = cameraSensor.toDataURL("image/webp");
    cameraOutput.src = dataURL;

    // converte DataURL em Blob para salvar no IndexedDB
    fetch(dataURL)
      .then(res => res.blob())
      .then(blob => fotoCapturada = blob);
};

document.getElementById("salvarLivro").onclick = async () => {
    const titulo = document.getElementById("titulo").value;
    const autor = document.getElementById("autor").value;
    const status = document.getElementById("status").value;

    if (!fotoCapturada) {
        alert("Tire uma foto antes!");
        return;
    }

    await addLivro({
        titulo,
        autor,
        status,
        foto: fotoCapturada
    });

    fotoCapturada = null;
    cameraOutput.src = "//:0";

    listarLivros();
};

async function listarLivros() {
    const livros = await getLivros();
    const lista = document.getElementById("listaLivros");

    lista.innerHTML = "";

    livros.forEach(l => {
        const url = URL.createObjectURL(l.foto);

        lista.innerHTML += `
          <div class="card">
            <img src="${url}" width="120">
            <p><b>${l.titulo}</b></p>
            <p>${l.autor}</p>
            <p>Status: ${l.status}</p>
            <button onclick="excluir(${l.id})">Excluir</button>
          </div>
        `;
    });
}

window.excluir = async (id) => {
    await removeLivro(id);
    listarLivros();
};

window.addEventListener("load", () => {
    listarLivros();
    cameraStart();
});
