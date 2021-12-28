import React, { PropTypes } from "react";
import { FullscreenOutlined, FullscreenExitOutlined } from "@ant-design/icons";

const Fullscreen = (props) => {
  const { isFullScreen, handleFullScreen } = props;

  return (
    <div className="fullscreen-wrapper" onClick={handleFullScreen}>
      {isFullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
    </div>
  );
};

Fullscreen.propTypes = {};

export default Fullscreen;
