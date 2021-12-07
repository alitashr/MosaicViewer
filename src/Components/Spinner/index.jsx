import React, { PropTypes } from 'react';

const Spinner = props => {
  return (
    <div className="loader-container">
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
  );
};

Spinner.propTypes = {
  
};

export default Spinner;