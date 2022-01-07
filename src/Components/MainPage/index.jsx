import { Button, Carousel, notification } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useFullscreen, useMount, useToggle } from "react-use";
import { downloadImageData, getFilename, getResizedFile, shuffle, uploadDesign } from "../../Utils/utils";
import ImageDropContainer from "../ImageDropContainer";
import Spinner from "../Spinner";
import ZoomImageViewer from "../Zoom-Image-Viewer";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import LazyLoad, { lazyload } from "react-lazyload";

import Fullscreen from "../Fullscreen";
import classNames from "classnames";

let defaultImagesOptions = ["landscapeScene1.jpg", "potala.jpg", "hedge.jpg"];
defaultImagesOptions = shuffle(defaultImagesOptions);
let defaultImageSize = { width: 6120, height: 3442 };

const MainPage = () => {
  const [mosaicCanvasData, setMosaicCanvasData] = useState(null);
  const [inputImage, setInputImage] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [showCarousel, setShowCarousel] = useState(true);
  const [isCarouselFirstLoad, setIsCarouselFirstLoad] = useState(true);

  const [carouselCurrentIndex, setCarouselCurrentIndex] = useState(0);

  const defaultImageUrl = "https://images.explorug.com/mosaic/landscapeScene1.jpg";
  const defaultImagePath = "https://images.explorug.com/mosaic/";
 
  const [mosaicFilename, setMosaicFilename] = useState("");
  const alpha = 0.88;
  const minImageSizeRequired = 6000;
  const [isFullScreen, toggleFullscreen] = useToggle(false);
  const refMosaicPage = useRef(null);
  const refCarousel = useRef(null);
  const zoomRef = useRef(null);

  useFullscreen(refMosaicPage, isFullScreen, { onClose: () => toggleFullscreen(false) });
  useMount(() => {
    const onWindowMessage = async (e) => {
      if (e.origin === window.location.origin) return;
      const imageUrl = e.data;
      console.log("onWindowMessage -> imageUrl received from parent", imageUrl);
      if (imageUrl) {
        let filename = getFilename(imageUrl.split("/")[0]);
        let fileType = filename.substring(filename.lastIndexOf(".") + 1, filename.length);
        loadImage({ imageUrl: imageUrl, filename, fileType });
      }
      //const { imageData, filename, fileType } = e.data;
      // if(imageFile){
      //   handleImageChange(imageFile);
      // }
      // if (imageData && filename && fileType) loadImage({ imageData, filename, fileType });
      // else console.log("could not get imageData ilename and filetype from message");
    };
    window.addEventListener("message", onWindowMessage);

    return () => {
      window.removeEventListener("message", onWindowMessage);
    };
  });
  useEffect(() => {
    console.log('set loading true');
    setLoading(true);
    const defaultImageUrl_ = `${defaultImagePath}${defaultImagesOptions[carouselCurrentIndex]}`;
    loadFirstImage({ imageUrl: defaultImageUrl_ });
  }, []);

  const loadFirstImage = ({ imageUrl = defaultImageUrl }) => {
    setMosaicCanvasData(1);
    setCanvasSizeFromImage(defaultImageSize.width, defaultImageSize.height);

    // var defaultImage = new Image(); // Creates image object
    // defaultImage.src = imageUrl; //"./images/MonalisaMosaic.jpg"; //"https://images.explorug.com/mosaic/monalisa.jpg"; // Assigns converted image to image object
    // defaultImage.crossOrigin = "Anonymous";

    // defaultImage.onload = function () {
    //   setCanvasSizeFromImage(defaultImage.width, defaultImage.height);
    //   console.log("loadFirstImage -> defaultImage.width, defaultImage.height", defaultImage.width, defaultImage.height)
    //   setMosaicCanvasData(1);
    //   setLoading(false);
    //   defaultImage.onload = null;
    // };
    // defaultImage.onerror = function () {
    //   openNotification = { message: "Couldn't load default image", description: "Please refresh" };
    // };
  };
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
    console.time();
    var reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onloadend = function (e) {
      let filename = getFilename(imageFile.name);
      let fileType = imageFile.type;
      loadImage({ imageUrl: e.target.result, filename, fileType });
    };
  };
  const loadImage = ({ imageUrl, filename, fileType }) => {
    console.timeLog();

    var myImage = new Image();
    myImage.src = imageUrl;
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

            setInputImage(myImage);
            setShowCarousel(false);
            setMosaicCanvasData(mosaicData);
          } else {
            openNotification = {
              message: "Couldn't process your image",
              description: "Please check your internet connection and try again",
            };
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
    setLoading(false);
  };
  const handleOnLoadComplete = () => {
    setLoading(false);
  };
  const downloadMosaic = () => {
    var downloadCanvas = document.createElement("canvas");
    var downloadCanvasContext = downloadCanvas.getContext("2d");

    if (!showCarousel) {
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
    } else {
      const imageURLToDownload = defaultImagePath + defaultImagesOptions[carouselCurrentIndex];
      var imageToDownload = new Image(); // Creates image object
      imageToDownload.src = imageURLToDownload; //"./images/MonalisaMosaic.jpg"; //"https://images.explorug.com/mosaic/monalisa.jpg"; // Assigns converted image to image object
      imageToDownload.crossOrigin = "Anonymous";
      downloadCanvas.width = canvasSize.x;
      downloadCanvas.height = canvasSize.y;
      imageToDownload.onload = function () {
        downloadCanvasContext.drawImage(imageToDownload, 0, 0, downloadCanvas.width, downloadCanvas.height);
        downloadImageData(downloadCanvas, `DefaultMosaic.jpg`, "jpg");
        imageToDownload.onload = null;
      };
    }
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
  const handleCarouselImageChange = (direction) => {
    if (refCarousel && refCarousel.current) {
      if (isCarouselFirstLoad) setLoading(true);
      let currentIndex = carouselCurrentIndex;
      if (direction === "prev") {
        refCarousel.current.prev();
        let newIndex = currentIndex - 1;
        newIndex = newIndex < 0 ? defaultImagesOptions.length - 1 : newIndex;
        setCarouselCurrentIndex(newIndex);
      } else {
        refCarousel.current.next();
        let newIndex = currentIndex + 1;
        newIndex = newIndex > defaultImagesOptions.length - 1 ? 0 : newIndex;
        setCarouselCurrentIndex(newIndex);
      }
      if (zoomRef && zoomRef.current) {
        if (zoomRef.current.state.scale !== 1) zoomRef.current.resetTransform();
      }
    }
  };
  const onCarouselImgLoad = (index) => {
    if (loading) setLoading(false);
  };
  const onCarouselImgFail = () => {
    setLoading(false);
    if (refCarousel && refCarousel.current) refCarousel.current.goTo(0, true);
    openNotification = { message: "Couldn't load next view", description: "Showing default view" };
  };
  const CarouselElem = (
    <Carousel
      // autoplay
      autoplaySpeed={4000}
      ref={refCarousel}
      dots={{ className: "mosaic-dots" }}
      className="mosaic-carousel"
      style={{ width: "100%" }}
      dotPosition={"top"}
      style={{ width: canvasSize.x, height: canvasSize.y }}
      lazyLoad={true}
      onLazyLoad={(slidesLoaded) => {
        if (slidesLoaded[0] === defaultImagesOptions.length) {
          setLoading(false);
          setIsCarouselFirstLoad(false);
        }
      }}
    >
      {defaultImagesOptions.map((defaultImage, index) => (
        <div key={index}>
          <img
            onLoad={() => {
              if (onCarouselImgLoad) onCarouselImgLoad(index);
            }}
            onError={() => {
              if (onCarouselImgFail) onCarouselImgFail(index);
            }}
            className="mosaic-carousel-images"
            src={`${defaultImagePath}${defaultImage}`}
          />
        </div>
      ))}
    </Carousel>
  );

  return (
    <div ref={refMosaicPage}>
      {
        //inputImage && mosaicCanvasData &&
        // canvasSize && canvasSize.x && canvasSize.y &&
        <ZoomImageViewer
          zoomRef={zoomRef}
          mosaicCanvasData={mosaicCanvasData}
          inputImage={inputImage}
          canvasSize={canvasSize}
          handleOnLoadComplete={handleOnLoadComplete}
          handleOnImageLoad={handleOnImageLoad}
          alpha={alpha}
          handleDownload={downloadMosaic}
          CarouselElem={CarouselElem}
          showCarousel={showCarousel}
        ></ZoomImageViewer>
      }

      {showCarousel && (
        <>
          <LeftOutlined className="mainpage-icons" onClick={() => handleCarouselImageChange("prev")} />
          <RightOutlined className="mainpage-icons" onClick={() => handleCarouselImageChange("next")} />
        </>
      )}

      <ImageDropContainer onImageChange={handleImageChange} />
      {<Spinner className={classNames({hidden: !loading})} />}

      <Fullscreen isFullScreen={isFullScreen} handleFullScreen={handleFullScreen} />

      <div id="canvasArea">
        <canvas id="mosaicCanvas"></canvas>
      </div>
    </div>
  );
};

MainPage.propTypes = {};

export default MainPage;
