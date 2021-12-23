import { Button } from "antd";
import React, { useEffect, useState } from "react";
import { downloadImageData, getDefaultMosaicData, getFilename, getResizedFile, uploadDesign } from "../../Utils/utils";
import ImageDropContainer from "../ImageDropContainer";
import Spinner from "../Spinner";
import ZoomImageViewer from "../Zoom-Image-Viewer";

const MainPage = () => {
  const [mosaicCanvasData, setMosaicCanvasData] = useState(null);
  const [inputImage, setInputImage] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [mosaicLoadComplete, setMosaicLoadComplete] = useState(false);

  const [mosaicFilename, setMosaicFilename] = useState("");
  useEffect(() => {
    setLoading(true);
    loadDefaultMosaic();
  }, []);

  const loadDefaultMosaic = () => {
    setMosaicLoadComplete(false);
    var defaultImage = new Image(); // Creates image object
    defaultImage.src = "https://images.explorug.com/mosaic/monalisa.jpg"; // Assigns converted image to image object
    defaultImage.crossOrigin = "Anonymous";

    defaultImage.onload = function () {
      setCanvasSizeFromImage(defaultImage.width, defaultImage.height);
      setInputImage(defaultImage);
    };

    getDefaultMosaicData(
      "monalisa",
      function (res) {
        const monalisaMosaicData = JSON.parse(res);
        setMosaicCanvasData(monalisaMosaicData);
      },
      function () {
        console.log("error while getting default data");
      }
    );
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
    console.log("handleImageChange -> setLoading");
    console.time();
    var reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onloadend = function (e) {
      console.timeLog();
      var myImage = new Image();
      myImage.src = e.target.result;
      let filename = getFilename(imageFile.name);
      setMosaicFilename(filename);
      let fileType = imageFile.type;
      myImage.onload = function (ev) {
        console.log("handleImageChange -> myImage", myImage.width, myImage.height);
        console.timeLog();
        setCanvasSizeFromImage(myImage.width, myImage.height);

        var doubleTileFile = getResizedFile(myImage, fileType, true);
        myImage.onload = null;
        uploadDesign(
          doubleTileFile,
          filename,
          function (res) {
            console.log("res", res);
            console.timeLog();

            if (res && res !== "" && res !== "maxsize" && res[0] !== "<") {
              //sessionStorage.setItem("res", res);
              const mosaicData = JSON.parse(res);
              setInputImage(myImage);

              setMosaicCanvasData(mosaicData);
            } else {
              console.log("response is not json");
              setLoading(false);
            }
          },
          function () {
            console.log("Error while uploading image");
            setLoading(false);
          }
        );
      };
    };
  };
  const handleOnImageLoad = () => {
    console.log("handleOnLoadComplete -> handleOnLoadComplete");
    setLoading(false);
  };
  const handleOnLoadComplete = () => {
    console.log("handleOnLoadComplete -> handleOnLoadComplete");
    setLoading(false);
    setMosaicLoadComplete(true);
  };
  const downloadMosaic = () => {
    console.log("downloadMosaic -> downloadMosaic");
    var downloadCanvas = document.createElement("canvas");
    var downloadCanvasContext = downloadCanvas.getContext("2d");

    var mosaicCanvas = document.getElementById("inputMosaicImage");
    downloadCanvas.width = mosaicCanvas.width;
    downloadCanvas.height = mosaicCanvas.height;
    downloadCanvasContext.drawImage(mosaicCanvas, 0, 0, downloadCanvas.width, downloadCanvas.height);

    var imageCanvas = document.getElementById("transformComponentCanvas");
    downloadCanvasContext.globalAlpha = 0.65;
    downloadCanvasContext.drawImage(imageCanvas, 0, 0, imageCanvas.width, imageCanvas.height);
    const filename =
      mosaicFilename && mosaicFilename != ""
        ? mosaicFilename.substring(0, mosaicFilename.lastIndexOf("."))
        : "MonalisaMosaic";
    downloadImageData(downloadCanvas, `${filename}-mosaic.jpg`, "jpg");
  };

  return (
    <>
      {inputImage && mosaicCanvasData && (
        <ZoomImageViewer
          mosaicCanvasData={mosaicCanvasData}
          inputImage={inputImage}
          canvasSize={canvasSize}
          handleOnLoadComplete={handleOnLoadComplete}
          handleOnImageLoad={handleOnImageLoad}
        ></ZoomImageViewer>
      )}

      <ImageDropContainer onImageChange={handleImageChange} />
      <Button disabled={loading} type="primary" className="download-button" onClick={downloadMosaic}>
        Download Image
      </Button>

      {loading && <Spinner />}
      <div id="canvasArea">
        <canvas id="mosaicCanvas"></canvas>
      </div>
    </>
  );
};

MainPage.propTypes = {};

export default MainPage;
