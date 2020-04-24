import React from "react";
import blogService from "../../services/blogService";
import BlogDisplay from "./BlogDisplay";
import PropTypes from "prop-types";
import ErrorCard from "./ErrorCard";
import Comments from "../comment/Comments";

import debug from "sabio-debug";
const logger = debug.extend("NOTICE: ");

export default class BlogPost extends React.Component {
  constructor(props) {
    logger("Constructor props: ", props);
    super(props);
    this.state = {
      blog: {
        id: +props.match.params.id,
        blogType: {
          id: 0,
          name: "",
        },
        authorId: 0,
        title: "",
        subject: "",
        content: "",
        imageUrl: "",
        isPublished: true,
        dateCreated: "",
        dateModified: "",
        datePublish: "",
        loggedIn: "",
      },
      updateFlag: this.props.currentUser.roles.find(role => role === "Admin"),
    };
  }

  componentDidMount() {
    const role =
      this.props.currentUser.roles && this.props.currentUser.roles[0]
        ? this.props.currentUser.roles[0]
        : "Seeker";
    this.setState({ loggedIn: role });
    blogService
      .selectById(this.state.blog.id)
      .then(({ item }) => this.mapBlogToState(item))
      .catch(this.loadFail);
  }

  mapBlogToState = ({
    id,
    blogType,
    author,
    title,
    subject,
    content,
    imageUrl,
    isPublished,
    dateCreated,
    dateModified,
    datePublish,
  }) => {
    this.setState(prevState => {
      return {
        blog: {
          id,
          blogType,
          author,
          title,
          subject,
          content,
          imageUrl,
          isPublished,
          dateCreated,
          dateModified,
          datePublish,
        },
        updateFlag: prevState.updateFlag || author.id === this.props.currentUser.id
      }
    });
  };

  loadFail = (err) => {
    logger(err);
  };

  render() {
    return (
      <>
        <div className="blog blog-post d-flex justify-content-center">
          {(this.state.blog.blogType.id !== 0 && (
            <BlogDisplay
              blog={this.state.blog}
              history={this.props.history}
              className="w-75"
              edit={this.state.updateFlag}
            />
          )) || <ErrorCard history={this.props.history} />}
        </div>
        <div className="col-12">
          <Comments
            currentUser={this.props.currentUser.id}
            entityId={this.state.blog.id}
            user={this.props.currentUser}
          />
        </div>
      </>
    );
  }
}

BlogPost.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  }),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  location: PropTypes.shape({
    blog: PropTypes.object,
  }),
  currentUser: PropTypes.arrayOf(PropTypes.string),
};
