import React, { useEffect, useState } from "react";
import { getFilename, getResizedFile, uploadDesign } from "../../Utils/utils";
import ImageDropContainer from "../ImageDropContainer";
import Spinner from "../Spinner";
import ZoomImageViewer from "../Zoom-Image-Viewer";

const MainPage = () => {
  const [imgSrc, setImgSrc] = useState(null);
  const [mosaicCanvasData, setMosaicCanvasData] = useState(null);
  const [inputCanvasData, setInputCanvasData] = useState(null);
  const [inputImage, setInputImage] = useState(null);

  const [canvasSize, setCanvasSize] = useState({ x: 0, y: 0 });
  const defaultZoom = sessionStorage.getItem("defaultZoom");
  console.log("MainPage -> defaultZoom", defaultZoom);

  useEffect(() => {
    const img = sessionStorage.getItem("design") || "./images/BEAT+MODA_compressed.jpg";
    //setImgSrc(img);
    console.log("useEffect -> img", img);
    const data = sessionStorage.getItem("res") || "";
    const canvasWid = sessionStorage.getItem("canvasWidth") || "";
    const canvasHgt = sessionStorage.getItem("canvasHeight") || "";

    // if (data !== "" && canvasWid !== "" && canvasHgt !== "" && data[0] !== "<") {
    //   const mosaicData = JSON.parse(data);
    //   drawTilesInCanvas(mosaicData, canvasWid, canvasHgt);
    // }
  }, []);
  const drawTilesInCanvas = (mosaicData, canvasWid, canvasHgt) => {
    console.log("drawTilesInCanvas -> mosaicData", mosaicData);

    var imageCanvas = document.getElementById("mosaicCanvas");
    imageCanvas.width = canvasWid;
    imageCanvas.height = canvasHgt;
    var imageCanvasContext = imageCanvas.getContext("2d");

    var tileCount = 0;
    imageCanvasContext.globalAlpha = 0.5;
    mosaicData.forEach((element, index) => {
      var tileImage = new Image(); // Creates image object
      tileImage.src = "https://images.explorug.com/mosaic/" + element.thumbnail; // Assigns converted image to image object
      tileImage.onload = function (ev) {
        tileCount++;

        imageCanvasContext.drawImage(tileImage, element.x, element.y, tileImage.width, tileImage.height);
        if (tileCount === mosaicData.length - 1) {
          setMosaicCanvasData(imageCanvas);
        }
      };
    });
  };
  const handleImageChange = (imageFile) => {
    if (!imageFile) return;
    var reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onloadend = function (e) {
      var myImage = new Image(); // Creates image object
      myImage.src = e.target.result; // Assigns converted image to image object

      let filename = getFilename(imageFile.name);
      let fileType = imageFile.type;

      myImage.onload = function (ev) {
        const imgWid = 180 * Math.ceil(myImage.width / 180);
        const imgHgt = 240 * Math.ceil(myImage.height / 240);
        setCanvasSize({
          x: imgWid,
          y: imgHgt,
        });

        sessionStorage.setItem("canvasWidth", imgWid);
        sessionStorage.setItem("canvasHeight", imgHgt);
        //var file = getResizedFile(myImage, fileType, false);

        // var inputImageCanvas = document.getElementById("inputImageCanvas");
        // var inputImageCanvasContext = mosaicCanvas.getContext("2d");
        // inputImageCanvasContext.clearRect(0, 0, inputImageCanvas.width, inputImageCanvas.height);
        // inputImageCanvas.width = imgWid;
        // inputImageCanvas.height = imgHgt;
        // inputImageCanvasContext.drawImage(myImage, 0, 0, imgWid, imgHgt);
        // console.log("input image drawn");
        //setInputCanvasData(inputImageCanvas);

        setInputImage(myImage);

        var doubleTileFile = getResizedFile(myImage, fileType, true);

        uploadDesign(doubleTileFile, filename, function (res) {
          console.log("res", res);

          if (res && res !== "" && res !== "maxsize") {
            sessionStorage.setItem("res", res);
            const mosaicData = JSON.parse(res);
            console.log("mosaicData", mosaicData);

            drawTilesInCanvas(mosaicData, imgWid, imgHgt);
          }
        });
      };
    };
  };
  return (
    <>
      {inputImage && mosaicCanvasData && (
        <ZoomImageViewer mosaicCanvasData={mosaicCanvasData} inputImage={inputImage}></ZoomImageViewer>
      )}

      <ImageDropContainer onImageChange={handleImageChange} />

      <Spinner />
      <div id="canvasArea">
        <canvas id="mosaicCanvas"></canvas>
      </div>
    </>
  );
};

MainPage.propTypes = {};

export default MainPage;
