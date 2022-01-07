import classNames from "classnames";
import React, { useEffect, useRef, useState } from "react";
import { useWindowSize } from "react-use";
import { Button, Carousel } from "antd";
import { ZoomInOutlined, ZoomOutOutlined, ReloadOutlined, DownloadOutlined } from "@ant-design/icons";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { imageDomain } from "../../Utils/utils";
const wheel = {
  disabled: true,
  step: 10,
};
const zoomIn = {
  step: 0.1,
  animationTime: 2000,
};
const zoomOut = {
  step: 0.1,
};
const doubleClick = {
  step: 0.5,
  animationTime: 300,
};

const ZoomImageViewer = (props) => {
  const {
    imageSrc,
    mosaicCanvasData,
    inputImage,
    canvasSize,
    handleOnLoadComplete,
    handleOnImageLoad,
    alpha = 0.88,
    handleDownload,
  } = props;
  const windowSize = useWindowSize();
  const [currentZoom, setCurrentZoom] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingPercentage, setLoadingPercentage] = useState(0);
  const imageRef = useRef(null);
  const zoomRef = useRef(null);
  const reloadRef = useRef(null);

  const options = {
    minScale: 1,
    maxScale: 12,
    limitToBounds: true,
    initialScale: currentZoom,
  };
  useEffect(() => {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = "Anonymous";
    image.origin = "Anonymous";
    setLoading(true);
    image.onload = () => {
      try {
        imageRef.current.src = image.src;
        //zoomRef.current.centerView();
        //window.transformREF = zoomRef;
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
  }, [imageSrc]);

  useEffect(() => {
    alignCanvasToCenter();
  }, [windowSize]);

  const alignCanvasToCenter = () => {
    if (zoomRef && zoomRef.current) {
      if (zoomRef.current.state.scale === options.minScale) zoomRef.current.centerView();
      console.log("alignCanvasToCenter -> zoomRef.current", zoomRef.current);
    }
  };
  useEffect(() => {
    if (!mosaicCanvasData || !mosaicCanvasData.length)
      console.log("ZoomImageViewer -> mosaicCanvasData", mosaicCanvasData.length);
    let la = true;

    const drawTilesInCanvas = (mosaicData, canvasWid, canvasHgt, onComplete) => {
      if (!mosaicData || !mosaicData.length) return;
      var imageCanvas = document.getElementById("transformComponentCanvas");
      var imageCanvasContext = imageCanvas.getContext("2d");
      imageCanvasContext.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
      imageCanvas.width = canvasWid;
      imageCanvas.height = canvasHgt;
      var tileCount = 0;
      setLoadingPercentage(0);
      imageCanvasContext.globalAlpha = alpha;
      if (!la) return;
      function sliceIntoChunks(arr, chunkSize) {
        const res = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
          const chunk = arr.slice(i, i + chunkSize);
          res.push(chunk);
        }
        return res;
      }

      //const numOfChunks = mosaicData.length > 10000 ? 30 : 10;
      // var mosaicDataChunks = sliceIntoChunks(mosaicData, Math.ceil(mosaicData.length / numOfChunks));
      const chunksSize = 100;
      var mosaicDataChunks = sliceIntoChunks(mosaicData, chunksSize);
      console.log("drawTilesInCanvas -> mosaicDataChunks", mosaicDataChunks);

      let chunkCount = 0;

      const loadImagesArray = (mosaicDataArr) => {
        var imageCountOfThisArr = 0;
        //console.log("loadImagesArray", mosaicDataArr.length, la);
        if (!la) return;
        mosaicDataArr.forEach((element, index) => {
          var tileImage = new Image(); // Creates image object
          tileImage.src = imageDomain + "mosaic/" + element.thumbnail; //  "mosaic/NewSet2/"  //"./images/1.sm.webp";//  Assigns converted image to image object
          tileImage.crossOrigin = "Anonymous";
          if (!la) return;
          tileImage.onload = function (ev) {
            if (!la) return;
            imageCountOfThisArr++;
            tileCount++;
            const percent = Math.ceil((tileCount * 100) / mosaicData.length / 5) * 5;
            setLoadingPercentage(percent);
            if (!la) return;
            imageCanvasContext.drawImage(tileImage, element.x, element.y, tileImage.width, tileImage.height);
            if (imageCountOfThisArr === mosaicDataArr.length - 1) {
              if (!la) return;
              chunkCount++;
              if (chunkCount <= mosaicDataChunks.length - 1) loadImagesArray(mosaicDataChunks[chunkCount]);
              else {
                setTimeout(() => {
                  setLoadingPercentage(0);
                }, 1000);
                if (handleOnLoadComplete) handleOnLoadComplete();
              }
            }
          };
        });
      };
      loadImagesArray(mosaicDataChunks[0]);
    };

    drawTilesInCanvas(mosaicCanvasData, canvasSize.x, canvasSize.y);
    setTimeout(() => {
      alignCanvasToCenter();
    }, 100);

    setLoading(false);
    if (handleOnImageLoad) handleOnImageLoad();

    if (zoomRef && zoomRef.current) {
      zoomRef.current.zoomIn({ step: 10, animationTime: 2000 });
      //zoomRef.current.resetTransform();
    }

    return () => {
      la = false;
    };
  }, [mosaicCanvasData]);

  useEffect(() => {
    var mosaicCanvas = document.getElementById("inputMosaicImage");
    var mosaicContext = mosaicCanvas.getContext("2d");
    mosaicContext.clearRect(0, 0, mosaicCanvas.width, mosaicCanvas.height);
    inputImage.crossOrigin = "Anonymous";
    mosaicCanvas.width = canvasSize.x; //inputImage.width;
    mosaicCanvas.height = canvasSize.y; // inputImage.height;
    mosaicContext.drawImage(inputImage, 0, 0, mosaicCanvas.width, mosaicCanvas.height);
    setLoading(false);
  }, [inputImage]);
  const contentStyle = {
    height: "160px",
    color: "#fff",
    lineHeight: "160px",
    textAlign: "center",
    background: "#364d79",
  };

  return (
    <>
      <div className={classNames("at-zoom-image-viewer-transformwrapper", { hidden: loading })}>
        <TransformWrapper
          id="at-viewer-wrapper"
          options={options}
          wheel={wheel}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          ref={zoomRef}
          initialScale={currentZoom}
          initialPositionX={0}
          initialPositionY={0}
          doubleClick={doubleClick}
          // zoomAnimation= {{
          //   disabled:true,
          //   size:0.1,
          //   animationTime: 1000}
          // }
          onChange={(newPositionX, newPositionY, newZoom) => console.log(newPositionX, newPositionY, newZoom)}
        >
          {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
            <React.Fragment>
              <div className="tools">
                <Button
                  title="Zoom In"
                  type="primary"
                  shape="circle"
                  icon={<ZoomInOutlined />}
                  size={"large"}
                  onClick={() => zoomIn()}
                />
                <Button
                  title="Zoom Out"
                  type="primary"
                  shape="circle"
                  icon={<ZoomOutOutlined />}
                  size={"large"}
                  onClick={() => zoomOut()}
                />
                <Button
                  title="Reset"
                  type="primary"
                  shape="circle"
                  icon={<ReloadOutlined />}
                  size={"large"}
                  onClick={() => resetTransform()}
                />
                {handleDownload && (
                  <Button
                    title="Download this Photo Mosaic"
                    type="primary"
                    shape="circle"
                    icon={<DownloadOutlined />}
                    size={"large"}
                    onClick={() => handleDownload()}
                  />
                )}
              </div>

              <TransformComponent ref={reloadRef}>
                {imageSrc ? (
                  <img className="zoom-image" src={""} ref={imageRef} alt="test" crossOrigin="true" />
                ) : (
                  <>
                    
                    <canvas className="zoomTransformCanvas" id="inputMosaicImage" />
                    <canvas className="zoomTransformCanvas" id="transformComponentCanvas" />
                  </>
                )}
              </TransformComponent>
            </React.Fragment>
          )}
        </TransformWrapper>
      </div>
      <div className="loader-bar">
        <div style={{ width: `${loadingPercentage}%` }}></div>
      </div>
    </>
  );
};
export default ZoomImageViewer;
