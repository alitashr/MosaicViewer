/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { Slider } from "@blueprintjs/core";
import classNames from "classnames";

const AtSlider = props => {
  const { value, max = 100, min = 0, isIdle, ...otherProps } = props;
  // const [sliderVal, setsliderVal] = useState(value ? value : min);
  useEffect(() => {
    document.getElementsByClassName("bp3-slider-handle")[0].style.left = `${((value - min) /
      (max - min)) *
      100}%`;
  }, [value]);
  return (
    <div className={classNames("sliderContainer", { "at-idle-fadeout": isIdle })}>
      <Slider {...otherProps} className="visualizationSlider" value={value} max={max} min={min} />
      <div className={"SliderLabelsContainer"}>
        <span className="at-slider-text-visualization">{"Visualization"}</span>
        <span className="at-slider-text-photorealistic">
          {"Photorealistic"}
        </span>
      </div>
    </div>
  );
};

export { AtSlider };
