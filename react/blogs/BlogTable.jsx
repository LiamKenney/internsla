import React from "react";
import blogService from "../../services/blogService";
import PropTypes from "prop-types";
import BlogCard from "./BlogCard";
import Pagination from "rc-pagination";
import "rc-pagination/assets/index.css";
import "./Blog.css";

import logger from "sabio-debug";

export default class BlogTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      blogArray: [],
      page: {
        index: 1,
        size: 6,
        totalCount: 0,
      },
    };
  }

  componentDidMount = () => {
    const { index, size } = this.state.page;
    this.handlePageChange(index, size);
  };

  handlePageChange = (current, size) => {
    blogService
      .paginate(current - 1, size)
      .then(this.mapPaginateData)
      .catch(errorHandler);
  };

  mapPaginateData = (response) => {
    const { item } = response;
    const { pagedItems, ...page } = item;
    this.setState({
      blogArray: pagedItems,
      page: {
        index: +page.pageIndex,
        size: +page.pageSize,
        totalCount: +page.totalCount,
      },
    });
  };

  blogCardMapper = (data, index) => {
    if (data.datePublish !== null) {
      return (
        <div key={index} className="cust-hrem-40 col-6 col-xl-4 mb-5">
          <BlogCard goToBlog={this.goToBlog} blog={data} />
        </div>
      );
    }
  };

  goToBlog = (data) => {
    this.props.history.push(`/blogs/${data.id}/details`, data);
  };

  render = () => {
    const { index, size, totalCount } = this.state.page;
    return (
      <div className="blog blog-table py-4 px-4">
        <div className="button-container my-3">
          <button
            onClick={() => {
              this.props.history.push("/blogs/create");
            }}
            className="btn btn-primary btn-lg"
          >Create</button>
        </div>
        <div className="blog-table-cards row">
          {this.state.blogArray.length > 0 &&
            this.state.blogArray.map(this.blogCardMapper)}
        </div>
        <Pagination
          onChange={this.handlePageChange}
          current={index + 1}
          pageSize={size}
          total={totalCount}
          className="d-flex justify-content-center"
        />
      </div>
    );
  };
}

BlogTable.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
};

const errorHandler = (err) => {
  logger("Error: ", err);
};
