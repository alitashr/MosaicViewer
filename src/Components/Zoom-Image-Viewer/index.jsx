import classNames from "classnames";
import React, { Children, useEffect, useRef, useState } from "react";

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

const ZoomImageViewer = (props) => {
  const { imageSrc, defaultZoom, mosaicCanvasData, inputCanvasData, inputImage, Children } = props;
  const [currentZoom, setCurrentZoom] = useState(0.5);

  const [loading, setLoading] = useState(true);
  const imageRef = useRef(null);
  const zoomRef = useRef(null);
  const options = {
    minScale: 0.5,
    maxScale: 8,
    limitToBounds: true,
    initialScale: currentZoom,
  };
  useEffect(() => {
    // resetTransform();
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
    if (!defaultZoom || !parseFloat(defaultZoom)) return;
    console.log("useEffect -> defaultZoom", defaultZoom);
    if (defaultZoom >= options.minScale && defaultZoom <= options.maxScale) {
      //setCurrentZoom(defaultZoom);
    }
  }, [defaultZoom]);

  useEffect(()=>{
    console.log("ZoomImageViewer -> mosaicCanvasData", mosaicCanvasData);
    var mosaicCanvas = document.getElementById('transformComponentCanvas');
    var mosaicContext = mosaicCanvas.getContext('2d');
    mosaicCanvas.width = mosaicCanvasData.width;
    mosaicCanvas.height = mosaicCanvasData.height;
    mosaicContext.drawImage(mosaicCanvasData, 0, 0, mosaicCanvas.width, mosaicCanvas.height);
  
    setLoading(false);

  },[mosaicCanvasData]);

  useEffect(()=>{
    console.log("ZoomImageViewer -> mosaicCanvasData", inputImage);
    var mosaicCanvas = document.getElementById('inputMosaicImage');
    var mosaicContext = mosaicCanvas.getContext('2d');
    mosaicCanvas.width = inputImage.width;
    mosaicCanvas.height = inputImage.height;
    mosaicContext.drawImage(inputImage, 0, 0, mosaicCanvas.width, mosaicCanvas.height);
  
    setLoading(false);

  },[inputImage])
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
              {/* <AtSlider
                isIdle={false}
                value={currentZoom>options.maxScale? options.maxScale: currentZoom}
                onRelease={(val) => {
                  const zoomval = Math.abs(currentZoom - val);
                  if (val < currentZoom) {
                    zoomOut(zoomval);
                  } else {
                    zoomIn(zoomval);
                  }
                  setCurrentZoom(val);
                }}
                min={options.minScale}
                max={options.maxScale}
                stepSize={1}
              /> */}
              <div className="tools">
              <button onClick={() => zoomIn()}>+</button>
              <button onClick={() => zoomOut()}>-</button>
              <button onClick={() => resetTransform()}>x</button>
            </div>

              <TransformComponent>
                <canvas className='zoomTransformCanvas' id='inputMosaicImage'/>
                <canvas className='zoomTransformCanvas' id='transformComponentCanvas'/> 
                {/* {Children} */}
                {/* <img className="zoom-image" src={""} ref={imageRef} alt="test" crossOrigin='true' /> */}
              </TransformComponent>
            </React.Fragment>
          )}
        </TransformWrapper>
      </div>
      {/* {
        <AtSpinnerOverlay
          show={loading}
          className={classNames("atCenter popupSpinner", { hidden: !loading })}
        ></AtSpinnerOverlay>
      } */}
    </>
  );
};
export default ZoomImageViewer;
