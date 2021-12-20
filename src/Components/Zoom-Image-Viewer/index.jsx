import classNames from "classnames";
import React, { useEffect, useRef, useState } from "react";
import { useWindowSize } from "react-use";
import { Button } from "antd";
import { ZoomInOutlined, ZoomOutOutlined, ReloadOutlined } from "@ant-design/icons";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { imageDomain } from "../../Utils/utils";
const wheel = {
  disabled: true,
  step: 10,
};
const zoomIn = {
  step: 10,
};
const zoomOut = {
  step: 10,
};

const ZoomImageViewer = (props) => {
  const { imageSrc, mosaicCanvasData, inputImage, canvasSize, handleOnLoadComplete, handleOnImageLoad } = props;
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

  const drawTilesInCanvas = (mosaicData, canvasWid, canvasHgt, onComplete) => {
    var imageCanvas = document.getElementById("transformComponentCanvas");
    var imageCanvasContext = imageCanvas.getContext("2d");
    imageCanvasContext.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    imageCanvas.width = canvasWid;
    imageCanvas.height = canvasHgt;
    var tileCount = 0;
    setLoadingPercentage(0);
    imageCanvasContext.globalAlpha = 0.65;

    mosaicData.forEach((element, index) => {
      var tileImage = new Image(); // Creates image object
      tileImage.src = imageDomain + "mosaic/" + element.thumbnail; // "./images/1.sm.webp";//  Assigns converted image to image object
      tileImage.crossOrigin = "Anonymous";
   
      tileImage.onload = function (ev) {
        if (tileCount === 1) {
          if (onComplete) onComplete();
        }
        tileCount++;
        const percent = (tileCount * 100) / mosaicData.length;
        //if (percent % 5 === 0) 
        setLoadingPercentage(percent);

        imageCanvasContext.drawImage(tileImage, element.x, element.y, tileImage.width, tileImage.height);
        if (tileCount === mosaicData.length - 1) {
          console.timeLog();
          setTimeout(() => {
            setLoadingPercentage(0);
          }, 1000);
          if (handleOnLoadComplete) handleOnLoadComplete();
        }
      };
    });
  };

  const alignCanvasToCenter = () => {
    if (zoomRef && zoomRef.current) {
      zoomRef.current.centerView();

      //zoomRef.current.resetTransform();
    }
  };
  useEffect(() => {
    console.log("ZoomImageViewer -> mosaicCanvasData", mosaicCanvasData.length);
    drawTilesInCanvas(mosaicCanvasData, canvasSize.x, canvasSize.y);
    setTimeout(() => {
      alignCanvasToCenter();
    }, 500);

    setLoading(false);
    if (handleOnImageLoad) handleOnImageLoad();
    
  }, [mosaicCanvasData]);

  useEffect(() => {
    var mosaicCanvas = document.getElementById("inputMosaicImage");
    var mosaicContext = mosaicCanvas.getContext("2d");
    mosaicContext.clearRect(0, 0, mosaicCanvas.width, mosaicCanvas.height);
    
    inputImage.crossOrigin = "Anonymous";
   
    mosaicCanvas.width = inputImage.width;
    mosaicCanvas.height = inputImage.height;
    mosaicContext.drawImage(inputImage, 0, 0, mosaicCanvas.width, mosaicCanvas.height);
  
    setLoading(false);
  }, [inputImage]);
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
        >
          {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
            <React.Fragment>
              {/* <div className="tools">
                <button onClick={() => zoomIn()}>+</button>
                <button onClick={() => zoomOut()}>-</button>
                <button onClick={() => resetTransform()}>x</button>
              </div> */}

              <div className="tools">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<ZoomInOutlined />}
                  size={"large"}
                  onClick={() => zoomIn()}
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon={<ZoomOutOutlined />}
                  size={"large"}
                  onClick={() => zoomOut()}
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon={<ReloadOutlined />}
                  size={"large"}
                  onClick={() => resetTransform()}
                />
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
