import React, { PropTypes, useState } from "react";

import {
  encodeColorsToString,
  getFilename,
  uploadInputFile,
} from "../../Utils/utils";
import ImageDropContainer from "../ImageDropContainer";
import { Radio, Space } from "antd";

const FileInputPage = (props) => {
  const {connectionid=''} = props;
  const [dataType, setDataType] = useState(1);

  const handleImageChange = (imageFile) => {
    if (!imageFile) return;
    console.log("image received");

    console.log("imageFile received on WindowMessage");
    var reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onloadend = function (e) {
      console.timeLog();
      var myImage = new Image();
      myImage.src = e.target.result;
      myImage.onload = function (ev) {
        var inputImageWid = myImage.width;
        var inputImageHgt = myImage.height;

        var imageCanvas = document.createElement("canvas");
        var imageCanvasContext = imageCanvas.getContext("2d");

        imageCanvas.width = inputImageWid;
        imageCanvas.height = inputImageHgt;
        imageCanvasContext.drawImage(myImage, 0, 0, imageCanvas.width, imageCanvas.height);

        let filename = getFilename(imageFile.name);
        let fileType = imageFile.type;
        let imgData = imageCanvas.toDataURL(fileType, 0.75);

        const ImageDataJson = {
          imageData: imgData,
          filename,
          fileType,
        };
        if (dataType === 1) {
          console.log("sending Image file");
          window.parent.postMessage(imageFile, "*");
        } 
        else if (dataType === 2) {
          console.log("sending data in Json format with filename and filetype");
          window.parent.postMessage(ImageDataJson, "*");
        } 
        else if (dataType === 3) {
          console.log("sending Image Data");
          const compressed = encodeColorsToString( ImageDataJson)
          console.log("handleImageChange -> compressed", compressed);
          window.parent.postMessage(compressed, "*");
        } 
        else{
          console.log("sending Image element");
          window.parent.postMessage(myImage, "*");
        }
        myImage.onload = null;
      };
      myImage.onerror = function () {
        openNotification = { message: "Couldn't upload the file", description: "Please try again" };
      };
    };
  };
  const onImageChange = (imageFile) => {
    if (!imageFile) return;
    console.log("image received");

    console.log("imageFile received on WindowMessage");
    uploadInputFile(imageFile, connectionid, (res)=>{
    console.log("uploadInputFile -> res", res)
    window.parent.postMessage(res, "*");
    },
    (err)=>{
    console.log("onImageChange -> err", err)

    })
    // var reader = new FileReader();
    // reader.readAsDataURL(imageFile);
    // reader.onloadend = function (e) {
    //   console.timeLog();
    
    // };
  };
  const onOptionChange = (e) => {
    console.log("onOptionChange -> val", e.target.value);
    setDataType(e.target.value);
  };

  return (
    <div className="file-input-page">
      <ImageDropContainer onImageChange={onImageChange} title="Click here to select your image for Mosaic" />
      {/* <Radio.Group onChange={onOptionChange} value={dataType}>
        <Space direction="vertical">
          <Radio value={1}>File</Radio>
          <Radio value={2}>Json with imgdata, filename and filetype</Radio>
          <Radio value={3}>Compressed JSON with imgdata, filename and filetype</Radio>
          <Radio value={4}>Image only</Radio>
        </Space>
      </Radio.Group> */}
    </div>
  );
};

FileInputPage.propTypes = {};

export default FileInputPage;
