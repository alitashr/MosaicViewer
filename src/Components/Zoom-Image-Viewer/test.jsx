import { Button } from "antd";
import { ZoomInOutlined, ZoomOutOutlined, ReloadOutlined } from "@ant-design/icons";

import React, { useEffect, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useDoubleClick } from "../../Utils/hooks";

var mouseEvent = "";

const ZoomImageViewer = (props) => {
  const { showMosaic, imageSrc } = props;

  const [refCallback, elem] = useDoubleClick(onDblClick);
  const reloadRef = useRef(null);

  useEffect(() => {
   if (showMosaic) {
      //setTimeout(() => {
        console.log("//setTimeout -> reloadRef", reloadRef)
       
        //reloadRef.current.context.dispatch.resetTransform();
        
      //}, 1000);
    }
  }, [showMosaic]);

  function onDblClick() {
    mouseEvent = "dbl click";
  }
  const options = {
    minScale: 1,
    maxScale: 9,
    limitToBounds: true,
  };
  const wheel = {
    disabled: true,
    step: 10,
  };
  const zoomIn = {
    step: 20,
  };
  const zoomOut = {
    step: 20,
  };
  const onImgClick = (e) => {console.log('img clicked')
  };

  const onMouseDown = (e) => {
    if (!e.target.className || typeof e.target.className !== "string") return;
    if (
      typeof e.target.className === "string" &&
      e.target.className.indexOf("TransformComponent-module_content__TZU5O") >= 0
    )
      mouseEvent = "mousedown";
  };

  const onMouseMove = () => {
    if (mouseEvent === "mousedown") {
      mouseEvent = "mousemove";
    }
  };
  const onMouseUp = (e) => {
    setTimeout(() => {
      if (mouseEvent === "mousedown") {
        onImgClick(e);
      }
    }, 400);
  };

  return (
    <div
      className="bd-popups bd-zoom-image-viewer-wrapper"
      id="zoomImageWrapper"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      ref={refCallback}
    >
      <TransformWrapper 
      options={options} wheel={wheel} zoomIn={zoomIn} zoomOut={zoomOut}>
        {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
          <React.Fragment>
            <div className="tools">
              <Button type="primary" shape="circle" icon={<ZoomInOutlined />} size={"large"} onClick={zoomIn} />
              <Button type="primary" shape="circle" icon={<ZoomOutOutlined />} size={"large"} onClick={zoomOut} />
              <Button type="primary" shape="circle" icon={<ReloadOutlined />} size={"large"} onClick={resetTransform} />
            </div>
            
            <TransformComponent>
              <img className="mosaic-image" src={imageSrc} alt="test" />
            </TransformComponent>
          </React.Fragment>
        )}
      </TransformWrapper>
    </div>
  );
};

ZoomImageViewer.propTypes = {};

export default ZoomImageViewer;
