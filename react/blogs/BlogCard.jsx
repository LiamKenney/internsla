import React from "react";
import PropTypes from "prop-types";
import { FaImage } from "react-icons/fa";
import { formatDate } from "../../services/dateService";
import "./Blog.css";

const dummyImgUrl =
  "https://i.pinimg.com/236x/c6/8e/bc/c68ebcd8dbb77ef644be75f235bd0695--the-obsession-david-bowie.jpg";

const BlogCard = props => {
  const { blog, goToBlog } = props;
  const handleView = () => {
    goToBlog(blog);
  };
  const maxCharLimit = 100;
  mapTimes(blog);
  return (
    <div onClick={handleView} className="blog-card card clickable expand shadow-md h-100">
      <div className="blog-card-img-container overflow-hidden h-50 position-relative">
        {(blog.imageUrl && (
          <>
            <div className="blog-card-img-fade position-absolute"></div>
            <img
              className="blog-card-img img-fluid of-cover w-100 h-100"
              src={blog.imageUrl || dummyImgUrl}
              alt={`Header`}
            />
          </>
        )) || (
            <div className="blog-card-img-wrapper h-100 d-flex justify-content-center">
              <FaImage className="align-self-center w-25 h-100 cust-o-50" />
            </div>
          )}
      </div>
      <div className="blog-display-body d-block w-100 h-50 px-3 ">
        <div className="blog-display-header cust-h-30 pt-2 row no-gutters">
          <div className="col-12 h-100 d-flex">
            <h2 className="blog-display-title align-self-end">
              {blog.title}
            </h2>
          </div>
        </div>
        <div className="breakline d-flex w-100 justify-content-center">
          <div className="w-75 border-top border" />
        </div>
        <div className="row no-gutters cust-h-70 overflow-hidden pt-3">
          <div className="col-8">
            <h3 className="blog-subject">{blog.subject}</h3>
          </div>
          <div className="col-4">
            <h4 className="text-right" >Category: {blog.blogType.name}</h4>
          </div>
          <p className="blog-content w-100 text-wrap col-12">
            {blog.content.length > maxCharLimit
              ? blog.content.slice(0, maxCharLimit) + "..."
              : blog.content}
          </p>
          <div className="blog-date-container d-flex col-4 align-self-end">
            <small className="align-self-end">
              {blog.isPublished
                ? "Published on " + blog.datePublish
                : "Draft"}
            </small>
          </div>
        </div>
      </div>
    </div >
  );
};

BlogCard.propTypes = {
  blog: PropTypes.shape({
    id: PropTypes.number,
    blogType: PropTypes.shape({
      name: PropTypes.string
    }),
    authorId: PropTypes.number,
    title: PropTypes.string,
    subject: PropTypes.string,
    content: PropTypes.string,
    imageUrl: PropTypes.string,
    isPublished: PropTypes.bool,
    dateCreated: PropTypes.string,
    dateModified: PropTypes.string,
    datePublish: PropTypes.string
  }),
  history: PropTypes.shape({
    push: PropTypes.func
  }),
  goToBlog: PropTypes.func
};

const mapTimes = model => {
  ["dateCreated", "dateModified", "datePublish"].forEach(key => {
    if (model[key]) {
      model[key] = formatDate(model[key]);
    }
  });
};

export default React.memo(BlogCard);
