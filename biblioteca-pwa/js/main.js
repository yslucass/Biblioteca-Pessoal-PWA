import { addLivro, getLivros, removeLivro } from "../db.js";


if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", {
        type: "module",
      });
      console.log("Service worker registrado! ", reg);
    } catch (err) {
      console.log(" Erro ao registrar service worker:", err);
    }
  });
}



const constraints = {
  video: {
    facingMode: { ideal: "environment" }, 
  },
  audio: false,
};

const cameraView = document.querySelector("#camera--view");
const cameraOutput = document.querySelector("#camera--output");
const cameraSensor = document.querySelector("#camera--sensor");
const cameraTrigger = document.querySelector("#camera--trigger");

let fotoCapturada = null;

function cameraStart() {
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      cameraView.srcObject = stream;

      
      cameraView.onloadedmetadata = () => {
        cameraView.play();
        console.log(
          "Câmera carregada:",
          cameraView.videoWidth,
          cameraView.videoHeight
        );
      };
    })
    .catch((error) => {
      console.error("Erro ao iniciar a câmera:", error);
    });
}


function dataURLtoBlob(dataURL) {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}



cameraTrigger.onclick = () => {
  if (!cameraView.videoWidth || !cameraView.videoHeight) {
    alert("A câmera ainda está carregando...");
    return;
  }

  cameraSensor.width = cameraView.videoWidth;
  cameraSensor.height = cameraView.videoHeight;
  cameraSensor
    .getContext("2d")
    .drawImage(cameraView, 0, 0, cameraSensor.width, cameraSensor.height);

  const dataURL = cameraSensor.toDataURL("image/webp");

  cameraOutput.src = dataURL;

  fotoCapturada = dataURLtoBlob(dataURL);

  console.log("Foto capturada!", fotoCapturada);
};



document.getElementById("salvarLivro").onclick = async () => {
  const titulo = document.getElementById("titulo").value;
  const autor = document.getElementById("autor").value;
  const status = document.getElementById("status").value;

  if (!fotoCapturada) {
    alert("Por favor, tire uma foto antes de salvar.");
    return;
  }

  await addLivro({
    titulo,
    autor,
    status,
    foto: fotoCapturada,
  });

  fotoCapturada = null;
  cameraOutput.src = "//:0";

  listarLivros();
};



async function listarLivros() {
  const livros = await getLivros();
  const lista = document.getElementById("listaLivros");

  lista.innerHTML = "";

  livros.forEach((l) => {
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
