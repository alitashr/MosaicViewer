import React, { useEffect, useState } from "react";
import { getDefaultMosaicData, getFilename, getResizedFile, uploadDesign } from "../../Utils/utils";
import ImageDropContainer from "../ImageDropContainer";
import Spinner from "../Spinner";
import ZoomImageViewer from "../Zoom-Image-Viewer";

const MainPage = () => {
  const [mosaicCanvasData, setMosaicCanvasData] = useState(null);
  const [inputImage, setInputImage] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    loadDefaultMosaic();
  }, []);

  const loadDefaultMosaic = () => {
    var defaultImage = new Image(); // Creates image object
    defaultImage.src = "https://images.explorug.com/mosaic/monalisa.jpg"; // Assigns converted image to image object
    defaultImage.onload = function () {
      setCanvasSizeFromImage(defaultImage.width, defaultImage.height);
      setInputImage(defaultImage);
    };

    getDefaultMosaicData("monalisa", function (res) {
      const monalisaMosaicData = JSON.parse(res);
      setMosaicCanvasData(monalisaMosaicData);
    }, function(){
      console.log('error while getting default data')
    });
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
    console.time();
    var reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onloadend = function (e) {
      console.timeLog();
      var myImage = new Image(); 
      myImage.src = e.target.result; 
      let filename = getFilename(imageFile.name);
      let fileType = imageFile.type;
      myImage.onload = function (ev) {
        console.timeLog();
        setCanvasSizeFromImage(myImage.width, myImage.height);
      
        var doubleTileFile = getResizedFile(myImage, fileType, true);

        uploadDesign(doubleTileFile, filename, function (res) {
          console.log("res", res);
          console.timeLog();

          if (res && res !== "" && res !== "maxsize" && res[0] !== "<") {
            //sessionStorage.setItem("res", res);
            const mosaicData = JSON.parse(res);
            console.log("mosaicData", mosaicData);
            setInputImage(myImage);
            setMosaicCanvasData(mosaicData);
          } else {
            console.log("response is not json");
            setLoading(false);
          }
        }, function(){
          console.log("Error while uploading image");
          setLoading(false);
        });
      };
    };
  };
  const handleOnLoadComplete = () => {
    console.log("handleOnLoadComplete -> handleOnLoadComplete");
    setLoading(false);
  };

  return (
    <>
      {inputImage && mosaicCanvasData && (
        <ZoomImageViewer
          mosaicCanvasData={mosaicCanvasData}
          inputImage={inputImage}
          canvasSize={canvasSize}
          handleOnLoadComplete={handleOnLoadComplete}
        ></ZoomImageViewer>
      )}

      <ImageDropContainer onImageChange={handleImageChange} />
      {loading && <Spinner />}
      <div id="canvasArea">
        <canvas id="mosaicCanvas"></canvas>
      </div>
    </>
  );
};

MainPage.propTypes = {};

export default MainPage;
