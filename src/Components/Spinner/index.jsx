import classNames from 'classnames';
import React, { PropTypes } from 'react';

const Spinner = props => {
  const {className} = props;
  return (
    <div className={classNames("loader-container", className)}>
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
  );
};

Spinner.propTypes = {
  
};

export default Spinner;