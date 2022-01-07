import { Button, notification } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useFullscreen, useMount, useToggle } from "react-use";
import { downloadImageData, getFilename, getResizedFile, uploadDesign } from "../../Utils/utils";
import ImageDropContainer from "../ImageDropContainer";
import Spinner from "../Spinner";
import ZoomImageViewer from "../Zoom-Image-Viewer";

import Fullscreen from "../Fullscreen";
const MainPage = () => {
  const [mosaicCanvasData, setMosaicCanvasData] = useState(null);
  const [inputImage, setInputImage] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [mosaicLoadComplete, setMosaicLoadComplete] = useState(false);
  const defaultImageUrl = "https://images.explorug.com/mosaic/landscapeScene1.jpg";

  const [mosaicFilename, setMosaicFilename] = useState("");
  const alpha = 0.88;
  const minImageSizeRequired = 6000;
  const [isFullScreen, toggleFullscreen] = useToggle(false);
  const refMosaicPage = useRef(null);
  useFullscreen(refMosaicPage, isFullScreen, { onClose: () => toggleFullscreen(false) });
  useMount(() => {
    const onWindowMessage = async (e) => {
      if (e.origin === window.location.origin) return;
      const { imageData, filename, fileType } = e.data;
      // if(imageFile){
      //   handleImageChange(imageFile);
      // }
      if (imageData && filename && fileType) loadImage({ imageData, filename, fileType });
      else console.log("could not get imageData ilename and filetype from message");
    };
    window.addEventListener("message", onWindowMessage);

    return () => {
      window.removeEventListener("message", onWindowMessage);
    };
  });
  useEffect(() => {
    setLoading(true);
    loadDefaultMosaic({ imageUrl: defaultImageUrl });
  }, []);

  const openNotification = ({ type = "warning", placement = "bottomLeft", message, description }) => {
    (message = message ? message : `Couldn't process this image.`),
      (description = description ? description : "Please try another one.");
    notification[type]({
      message: message,
      description: description,
      placement,
    });
  };

  const loadDefaultMosaic = ({ imageUrl = defaultImageUrl }) => {
    setMosaicLoadComplete(false);
    var defaultImage = new Image(); // Creates image object
    defaultImage.src = imageUrl; //"./images/MonalisaMosaic.jpg"; //"https://images.explorug.com/mosaic/monalisa.jpg"; // Assigns converted image to image object
    defaultImage.crossOrigin = "Anonymous";

    defaultImage.onload = function () {
      setCanvasSizeFromImage(defaultImage.width, defaultImage.height);
      if (defaultImage !== inputImage) {
        setInputImage(defaultImage);
        setMosaicCanvasData(1);
      } else {
        setLoading(false);
      }
      defaultImage.onload = null;
    };
    defaultImage.onerror = function () {
      if (imageUrl !== "./images/MonalisaMosaic.jpg") loadDefaultMosaic({ imageUrl: "./images/MonalisaMosaic.jpg" });
      else {
        openNotification = { message: "Couldn't load default image", description: "Please refresh" };
      }
    };
  };

  const setCanvasSizeFromImage = (wid, hgt) => {
    const imgWid = 180 * Math.ceil(wid / 180);
    const imgHgt = 240 * Math.ceil(hgt / 240);
    setCanvasSize({
      x: imgWid,
      y: imgHgt,
    });
  };
  const handleImageChange = (imageFile) => {
    if (!imageFile) return;
    setLoading(true);
    setMosaicLoadComplete(false);
    console.time();
    var reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onloadend = function (e) {
      let filename = getFilename(imageFile.name);
      let fileType = imageFile.type;
      loadImage({ imageData: e.target.result, filename, fileType });
    };
  };
  const loadImage = ({ imageData, filename, fileType }) => {
    console.timeLog();

    var myImage = new Image();
    myImage.src = imageData;
    setMosaicFilename(filename);
    myImage.onload = function (ev) {
      var inputImageWid = myImage.width;
      var inputImageHgt = myImage.height;
      var smallerValue = Math.min(inputImageWid, inputImageHgt);
      if (smallerValue < minImageSizeRequired) {
        if (smallerValue === inputImageWid) {
          inputImageWid = minImageSizeRequired;
          inputImageHgt = (myImage.height / myImage.width) * inputImageWid;
        } else {
          inputImageHgt = minImageSizeRequired;
          inputImageWid = (myImage.width / myImage.height) * inputImageHgt;
        }
      }
      console.timeLog();
      setCanvasSizeFromImage(inputImageWid, inputImageHgt);
      var { doubleTileFile, pixellatedImageData } = getResizedFile(
        myImage,
        inputImageWid,
        inputImageHgt,
        fileType,
        true
      );
      myImage.onload = null;
      uploadDesign(
        doubleTileFile,
        filename,
        inputImageWid,
        inputImageHgt,
        function (res) {
          //console.log("res", res);
          console.timeLog();

          if (res && res.toLowerCase() === "invalid") {
            openNotification({ type: "warning", placement: "bottomLeft" });
            setLoading(false);
          } else if (res && res !== "" && res !== "maxsize" && res[0] !== "<") {
            const mosaicData = JSON.parse(res);
            //draw pixellated image on transformComponentCanvas start
            // var pixellatedImage = new Image();
            // pixellatedImage.src = pixellatedImageData;
            // pixellatedImage.onload = function () {
            //   pixellatedImage.onload = null;
            //   var overlayPixellatedCanvas = document.getElementById("transformComponentCanvas");
            //   var overlayPixellatedContext = overlayPixellatedCanvas.getContext("2d");
            //   overlayPixellatedContext.clearRect(0, 0, overlayPixellatedCanvas.width, overlayPixellatedCanvas.height);
            //   pixellatedImage.crossOrigin = "Anonymous";
            //   overlayPixellatedCanvas.width = canvasSize.x; //inputImage.width;
            //   overlayPixellatedCanvas.height = canvasSize.y; // inputImage.height;
            //   overlayPixellatedContext.imageSmoothingEnabled = false;
            //   overlayPixellatedContext.globalAlpha = 0.5;

            //   overlayPixellatedContext.drawImage(
            //     pixellatedImage,
            //     0,
            //     0,
            //     overlayPixellatedCanvas.width,
            //     overlayPixellatedCanvas.height
            //   );
            // };

            //draw pixellated image on transformComponentCanvas end

            setInputImage(myImage);
            setMosaicCanvasData(mosaicData);
          } else {
            openNotification = {
              message: "Couldn't process your image",
              description: "Please check your internet connection and try again",
            };
            console.log("response is not json");
            setLoading(false);
          }
        },
        function () {
          console.log("Error while uploading image");
          openNotification = {
            message: "Error while uploading image",
            description: "Please check your internet connection and try again",
          };
          setLoading(false);
        }
      );
    };
    myImage.onerror = function () {
      openNotification = { message: "Couldn't upload the file", description: "Please try again" };
    };
  };
  const handleOnImageLoad = () => {
    console.log("handleOnImageLoad -> handleOnImageLoad");
    setLoading(false);
  };
  const handleOnLoadComplete = () => {
    console.log("handleOnLoadComplete -> handleOnLoadComplete");
    setLoading(false);
    setMosaicLoadComplete(true);
  };
  const downloadMosaic = () => {
    var downloadCanvas = document.createElement("canvas");
    var downloadCanvasContext = downloadCanvas.getContext("2d");

    var mosaicCanvas = document.getElementById("inputMosaicImage");
    downloadCanvas.width = mosaicCanvas.width;
    downloadCanvas.height = mosaicCanvas.height;
    downloadCanvasContext.drawImage(mosaicCanvas, 0, 0, downloadCanvas.width, downloadCanvas.height);

    var imageCanvas = document.getElementById("transformComponentCanvas");
    downloadCanvasContext.globalAlpha = alpha;
    downloadCanvasContext.drawImage(imageCanvas, 0, 0, imageCanvas.width, imageCanvas.height);
    const file = mosaicFilename && mosaicFilename != "" ? mosaicFilename : "Default."; //defaultImageUrl.split('/').pop();
    const filename = file.substring(0, file.lastIndexOf("."));
    downloadImageData(downloadCanvas, `${filename}-mosaic.jpg`, "jpg");
  };

  const handleFullScreen = () => {
    let fcDelay = 1000;
    if (!isFullScreen) {
      fcDelay = 0;
    }
    if (isFullScreen) {
      fcDelay = 0;
    }
    if (document.body.requestFullscreen) {
      setTimeout(() => {
        toggleFullscreen();
      }, fcDelay);
    } else {
      toggleFullscreen();
    }
  };
  return (
    <div ref={refMosaicPage}>
      {inputImage && mosaicCanvasData && (
        <ZoomImageViewer
          mosaicCanvasData={mosaicCanvasData}
          inputImage={inputImage}
          canvasSize={canvasSize}
          handleOnLoadComplete={handleOnLoadComplete}
          handleOnImageLoad={handleOnImageLoad}
          alpha={alpha}
          handleDownload={downloadMosaic}
        ></ZoomImageViewer>
      )}

      <ImageDropContainer onImageChange={handleImageChange} />
      {/* <Button disabled={loading} type="primary" className="download-button" onClick={downloadMosaic}>
        Download Image
      </Button> */}

      {loading && <Spinner />}

      <Fullscreen isFullScreen={isFullScreen} handleFullScreen={handleFullScreen} />

      <div id="canvasArea">
        <canvas id="mosaicCanvas"></canvas>
      </div>
    </div>
  );
};

MainPage.propTypes = {};

export default MainPage;
