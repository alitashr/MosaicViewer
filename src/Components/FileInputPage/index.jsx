import React, { PropTypes } from 'react';
import ImageDropContainer from '../ImageDropContainer';

const FileInputPage = props => {
  
  const handleImageChange = (imageFile) => {
    if (!imageFile) return;
    console.log('image received');
    window.parent.postMessage({imageFile: imageFile}, "*");    
  };

  return (
    <div className='file-input-page'>
       <ImageDropContainer onImageChange={handleImageChange} title="Click here to select your image for Mosaic"/>
    </div>
  );
};

FileInputPage.propTypes = {
  
};

export default FileInputPage;