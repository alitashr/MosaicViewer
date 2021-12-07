import classNames from "classnames";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "antd";
import { ZoomInOutlined, ZoomOutOutlined, ReloadOutlined } from "@ant-design/icons";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
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

const drawTilesInCanvas = (mosaicData, canvasWid, canvasHgt, onComplete) => {
  //console.log("drawTilesInCanvas -> mosaicData", mosaicData);

  var imageCanvas = document.getElementById("transformComponentCanvas");
  var imageCanvasContext = imageCanvas.getContext("2d");
  imageCanvasContext.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
  
  imageCanvas.width = canvasWid;
  imageCanvas.height = canvasHgt;
  
  console.log("drawTilesInCanvas -> imageCanvas.width, imageCanvas.height", canvasWid, canvasHgt);

  var tileCount = 0;
  imageCanvasContext.globalAlpha = 0.65;

  mosaicData.forEach((element, index) => {
    var tileImage = new Image(); // Creates image object
    tileImage.src = "https://images.explorug.com/mosaic/" + element.thumbnail; // Assigns converted image to image object
    tileImage.onload = function (ev) {
      tileCount++;

      imageCanvasContext.drawImage(tileImage, element.x, element.y, tileImage.width, tileImage.height);
      if (tileCount === mosaicData.length - 1) {
        if (onComplete) onComplete();
        console.timeLog();
        //setMosaicCanvasData(imageCanvas);
      }
    };
  });
};

const ZoomImageViewer = (props) => {
  const { imageSrc, mosaicCanvasData, inputImage, canvasSize, handleOnLoadComplete } = props;
  const [currentZoom, setCurrentZoom] = useState(1);

  const [loading, setLoading] = useState(true);
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

  // useEffect(() => {
  //   if (!defaultZoom || !parseFloat(defaultZoom)) return;
  //   console.log("useEffect -> defaultZoom", defaultZoom);
  //   if (defaultZoom >= options.minScale && defaultZoom <= options.maxScale) {
  //     //setCurrentZoom(defaultZoom);
  //   }
  // }, [defaultZoom]);

  const onTileLoadingComplete = ()=>{
    //reloadRef.current.context.dispatch.resetTransform();
    console.log("onTileLoadingComplete -> reloadRef.current", reloadRef.current)
  
  }
  useEffect(() => {
    console.log("ZoomImageViewer -> mosaicCanvasData", mosaicCanvasData);
    console.log("onTileLoadingComplete -> reloadRef.current", reloadRef.current)

    drawTilesInCanvas(mosaicCanvasData, canvasSize.x, canvasSize.y);
      
    // var mosaicCanvas = document.getElementById('transformComponentCanvas');
    // var mosaicContext = mosaicCanvas.getContext('2d');
    // mosaicCanvas.width = mosaicCanvasData.width;
    // mosaicCanvas.height = mosaicCanvasData.height;
    // mosaicContext.drawImage(mosaicCanvasData, 0, 0, mosaicCanvas.width, mosaicCanvas.height);
    if (zoomRef && zoomRef.current) zoomRef.current.centerView();
    setLoading(false);
    if (handleOnLoadComplete) handleOnLoadComplete();
  }, [mosaicCanvasData]);

  useEffect(() => {
    //console.log("ZoomImageViewer -> mosaicCanvasData", inputImage);
    var mosaicCanvas = document.getElementById("inputMosaicImage");
    var mosaicContext = mosaicCanvas.getContext("2d");
    mosaicContext.clearRect(0, 0, mosaicCanvas.width, mosaicCanvas.height);

    mosaicCanvas.width = inputImage.width;
    mosaicCanvas.height = inputImage.height;
    mosaicContext.drawImage(inputImage, 0, 0, mosaicCanvas.width, mosaicCanvas.height);
    console.log("useEffect -> mosaicCanvas.width, mosaicCanvas.height", mosaicCanvas.width, mosaicCanvas.height);
    
    setLoading(false);
    //if (zoomRef && zoomRef.current) zoomRef.current.centerView();
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
              <Button type="primary" shape="circle" icon={<ZoomInOutlined />} size={"large"} onClick={()=>zoomIn()} />
              <Button type="primary" shape="circle" icon={<ZoomOutOutlined />} size={"large"} onClick={()=>zoomOut()} />
              <Button type="primary" shape="circle" icon={<ReloadOutlined />} size={"large"} onClick={()=>resetTransform()} />
            </div>

              <TransformComponent  ref={reloadRef}>
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
     
    </>
  );
};
export default ZoomImageViewer;
