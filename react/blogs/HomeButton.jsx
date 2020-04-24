import React from "react";
import PropTypes from "prop-types";

const HomeButton = props => {
  const { history, className, ...otherProps } = props;
  const pushBlogList = () => {
    history.push("/blogs/explore");
  };

  return (
    <div className="d-flex justify-content-center pb-3">
      <button
        onClick={pushBlogList}
        className={`btn btn-primary ${className}`}
        {...otherProps}
      >
        Back to Blog Explorer
      </button>
    </div>
  );
};

HomeButton.propTypes = {
  className: PropTypes.string,
  history: PropTypes.shape({
    push: PropTypes.func
  })
};

export default React.memo(HomeButton);
