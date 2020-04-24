import React from "react";
import PropTypes from "prop-types";
import swal from "sweetalert";
import blogService from "../../services/blogService";
import { formatDate } from "../../services/dateService";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import HomeButton from "./HomeButton";
import "./Blog.css"

const dummyImgUrl =
  "https://sabio-training.s3-us-west-2.amazonaws.com/intern_5d119b52-f8e7-4a19-a5a0-943a1368886fdummy.png";

const BlogDisplay = (props) => {
  const { blog, history, className, edit } = props;

  mapTimes(blog);

  const handleEdit = () => {
    history.push(`/blogs/${blog.id}/edit`, blog);
  };

  const handleDelete = () => {
    const options = {
      title: "Delete blog",
      text: "Are you sure you want to delete this blog post?",
      icon: "warning",
      buttons: {
        confirm: {
          value: "confirm",
          text: "Yes, I'm sure"
        },
        deny: {
          value: "deny",
          text: "Nevermind"
        }
      }
    };
    swal(options).then(value => {
      if (value === "confirm") {
        deleteBlog();
      }
    });
  };

  const deleteBlog = () => {
    blogService
      .deleteById(props.blog.id)
      .then(() => {
        swal({
          title: "Success!",
          text: "Blog successfully deleted",
          icon: "success",
          button: "Ok"
        });
      })
      .then(() => {
        history.push("/blogs/explore");
      })
      .catch(() => {
        swal({
          title: "Error!",
          text: "The blog was not able to be deleted",
          icon: "error",
          button: "Ok"
        }).then(() => {
          history.push("/blogs/explore");
        });
      });
  };

  return (
    <div className={`blog blog-display card shadow-lg ${className} `}>
      <div
        className={`blog-display-img d-flex posiiton-relative ${
          blog.imageUrl ? "cust-hrem-30" : ""
          } w-100`}
      >
        {blog.imageUrl && (
          <>
            <div className="blog-card-img-fade position-absolute"></div>
            <img
              className="of-cover w-100"
              src={blog.imageUrl || dummyImgUrl}
              alt={`Header for ${blog.title}`}
            />
          </>
        )}
      </div>
      <div className="blog-display-body row no-gutters px-3">
        <div className="blog-display-header mt-3 w-100 row no-gutters">
          <div className="col-lg-8 align-content-end">
            <h1 className="blog-display-title">{blog.title}</h1>
          </div>
          <div className="blog-date-container col-lg-4 row no-gutters">
            <div className="blog-date-created col-12 d-flex justify-content-end">
              {edit &&
                `Created on ${blog.dateCreated}`
              }
            </div>
            <div className="blog-date-publish col-12 d-flex justify-content-end">
              {blog.isPublished ? "Published on " + blog.datePublish : "Draft"}
            </div>
            <div className="blog-date-modified col-12 d-flex justify-content-end">
              {`Last modified on ${blog.dateModified}`}
            </div>
          </div>
        </div>
        <div className="breakline d-flex w-100 justify-content-center mt-3">
          <div className="w-75" />
        </div>
        <div className="blog-display-main  w-100 mt-3 row no-gutters justify-content-between">
          <div className="blog-display-main-content col">
            <div className="">
              <h2 className="blog-subject text-wrap">{blog.subject}</h2>
            </div>
            <div className="blog-content-container">
              <p className="blog-content text-wrap">{blog.content}</p>
            </div>
          </div>
          <div className="blog-display-main-author col-3 d-block  ">
            <div className="d-flex justify-content-center">
              <img
                height="100px"
                src={blog.author ? blog.author.avatarUrl : dummyImgUrl}
                className="rounded-circle img-fluid thumb128 mb-2"
                alt="Author profile"
              />
            </div>
            <div className="d-flex justify-content-end">
              <h3 className="text-center">
                Author:{" "}
                {blog.author
                  ? blog.author.firstName + " " + blog.author.lastName
                  : null}
              </h3>
            </div>
            <div className="d-flex justify-content-center">
              <h4 className="text-center">{`under ${blog.blogType ? blog.blogType.name : null}`}</h4>
            </div>

            <div className="content-wrap d-flex justify-content-around px-3">
              {edit && (
                <>
                  <button onClick={handleEdit} className="btn btn-edit">
                    <FaEdit />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="btn-delete btn"
                  >
                    <FaTrashAlt />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="blog-display-footer my-3 mh-1">
        <div className="d-flex justify-content-between align-content-end px-5">
          <HomeButton
            history={history}
            className="align-self-end d-block btn-lg"
          />
        </div>
      </div>
    </div>
  );
};

const mapTimes = model => {
  ["dateCreated", "dateModified", "datePublish"].forEach(key => {
    if (model[key]) {
      model[key] = formatDate(model[key]);
    }
  });
};

BlogDisplay.propTypes = {
  edit: PropTypes.bool,
  loggedIn: PropTypes.string,
  className: PropTypes.string,
  blog: PropTypes.shape({
    id: PropTypes.number,
    blogType: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string
    }),
    author: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      avatarUrl: PropTypes.string
    }),
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
  })
};
export default React.memo(BlogDisplay);
