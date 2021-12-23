export const mainDomain = "https://lab.explorug.com/";
export const imageDomain = "https://images.explorug.com/";
export const domain = mainDomain + "Photomosaic/Default.aspx"; //"https://lab.explorug.com/photomosaic/default.aspx";// "https://explorug.com/archanastools/PhotomosaicWeb/default.aspx";

export const getResizedFile = (image, fileType, isDoubletile = false) => {
  var imageCanvas = document.createElement("canvas");
  var imageCanvasContext = imageCanvas.getContext("2d");

  const imageWidth = 180 * Math.ceil(image.width / 180);
  const imageHeight = 240 * Math.ceil(image.height / 240);
  imageCanvas.width = (2 * imageWidth) / 30;
  imageCanvas.height = (2 * imageHeight) / 40;
  imageCanvasContext.drawImage(image, 0, 0, imageCanvas.width, imageCanvas.height);
  console.log("getResizedFile -> imageCanvas.width, imageCanvas.height", imageCanvas.width, imageCanvas.height);
  //console.log("onImageChange -> imageCanvas.width, imageCanvas.height", imageCanvas.width, imageCanvas.height);
  let imgData = imageCanvas.toDataURL(fileType, 0.75);
  // let blob = dataURItoBlob(imgData);
  //$("#canvasArea").append(imageCanvas);
  var blobBin = atob(imgData.split(",")[1]);
  var array = [];
  for (var i = 0; i < blobBin.length; i++) {
    array.push(blobBin.charCodeAt(i));
  }
  var file = new Blob([new Uint8Array(array)], { type: "image/png" });

  return file;
};

export const getFilename = (name) => {
  var prefix = name.substr(0, name.lastIndexOf("."));
  var ext = name.substr(name.lastIndexOf("."), name.length);
  var randomNum = Math.round(Math.random(100) * 100000);
  let filename = prefix + "-" + randomNum + ext;
  return filename;
};

function dataURItoBlob(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(",")[1]);

  // separate out the mime component
  var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  var ia = new Uint8Array(ab);

  // set the bytes of the buffer to the correct values
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  var blob = new Blob([ab], { type: mimeString });
  return blob;
}

export const uploadDesign = (doubleTile, filename, callback, onerror) => {
  console.log("uploadDesign -> image with filename,", filename);
  const data = new FormData();
  data.append("doubleTile", doubleTile);
  data.append("filename", filename);
  var request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (request.readyState === 4) {
      if (callback) callback(request.response);
    }
  };
  request.open("POST", domain, true);
  request.onerror = function () {
    console.log("** An error occurred during the transaction");
    if (onerror) onerror();
  };
  request.responseType = "text";
  request.send(data);
};

export const getDefaultMosaicData = (defaultMosaicName, callback, onerror) => {
  const data = new FormData();
  data.append("mode", defaultMosaicName);
  var request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (request.readyState === 4) {
      if (callback) callback(request.response);
    }
  };
  request.open("POST", domain, true);
  request.onerror = function () {
    console.log("** An error occurred during the transaction");
    if (onerror) onerror();
  };
  request.responseType = "text";
  request.send(data);
};

export const downloadImageData = (canvas, name, mime) => {
  const mimetype = mime === "jpg" ? "jpeg" : mime;
  const downloadBlob = (blob) => {
    var url = URL.createObjectURL(blob);
    var anchor = document.createElement("a");
    anchor.href = url;
    anchor.setAttribute("download", name);

    setTimeout(function () {
      if (navigator.msSaveOrOpenBlob) {
        navigator.msSaveOrOpenBlob(blob, name);
      } else {
        anchor.click();
      }
    }, 100);
  };
  const type = `image/${mimetype}`;
  if (canvas.toBlob) {
    canvas.toBlob(downloadBlob, type, 0.95);
    return;
  }
  const dataurl = canvas.toDataURL(type, 0.95);
  downloadBlob(dataURItoBlob(dataurl));
};
