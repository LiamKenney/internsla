import React from "react";
import Select from "react-select";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { ImageUpload } from "./Misc";
import * as Yup from "yup";
import blogService from "../../services/blogService";
import ErrorCard from "./ErrorCard";
import { lookUp } from "../../services/lookUpService";
import PropTypes from "prop-types";
import { FaTrashAlt, FaCheck } from "react-icons/fa";
import "./Blog.css";

import logger from "sabio-debug";

const dummyImgUrl =
  "https://sabio-training.s3-us-west-2.amazonaws.com/intern_5d119b52-f8e7-4a19-a5a0-943a1368886fdummy.png";

export default class BlogForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      options: [],
      editFlag: props.match.path === "/blogs/:id/edit",
      initialBlog: {
        id: 0,
        title: "",
        subject: "",
        content: "",
        isPublished: true,
        imageUrl: dummyImgUrl,
        blogType: {
          id: 0,
          name: ""
        }
      },
      loggedIn: ""
    };
  }

  componentDidMount = () => {
    const { match } = this.props;
    const role =
      this.props.currentUser.roles && this.props.currentUser.roles[0]
        ? this.props.currentUser.roles[0]
        : "Seeker";
    this.setState({ loggedIn: role });
    lookUp("BlogTypes")
      .then(this.setOptions)
      .catch(this.setOptions);

    if (this.state.editFlag) {
      blogService
        .selectById(match.params.id)
        .then(this.setInitialBlog)
        .catch(this.setInitialBlog);
    }
  };

  setOptions = ({ items }) => {
    this.setState({
      options: items ? items.map(optionMapper) : []
    });
  };

  setInitialBlog = ({ item }) => {
    if (item) {
      this.setState({
        initialBlog: item
      });
    }
  };

  handleSubmit = form => {
    if (!this.state.editFlag) {
      blogService
        .create(form)
        .then(newBlog => {
          logger("New blog created! ID: ", newBlog);
          this.props.history.push(`/blogs/${newBlog.item.id}/details`);
        })
        .catch(err => {
          logger("Error on blogService.create: ", err);
        });
    } else if (this.state.initialBlog) {
      blogService
        .updateById(this.props.match.params.id, form)
        .then(() => {
          logger("Blog updated!, ", form);
          this.props.history.push(
            `/blogs/${this.props.match.params.id}/details`
          );
        })
        .catch(err => {
          logger("Error on blogService.update: ", err);
        });
    }
  };

  render = () => {
    const { history } = this.props;
    const { options, initialBlog, editFlag } = this.state;

    return editFlag && initialBlog.id === 0 ? (
      <div className="blog-form d-flex">
        <ErrorCard history={history} />
      </div>
    ) : (
        <div className="blog-form d-flex col-12 pt-lg-2">
          <Formik
            enableReinitialize={true}
            initialValues={formMapper(initialBlog)}
            onSubmit={this.handleSubmit}
            validationSchema={Yup.object().shape({
              title: Yup.string().max(50, "Title cannot exceed 50 characters").required("Required"),
              subject: Yup.string().max(50, "Subject cannot exceed 50 characters").required("Required"),
              blogTypeId: Yup.number()
                .integer()
                .required("Required"),
              content: Yup.string().required("Required"),
              imageUrl: Yup.string().url(),
              isPublished: Yup.bool().required()
            })}
          >
            {({ values, setFieldValue }) => {
              return (
                <div className="card blogFormCard col-12 shadow-lg px-lg-5">
                  <Form className="form pt-lg-4 pb-lg-4 position-relative">
                    <div className="blog-form-header d-flex pb-3 position-relative align-content-center">
                      <div className="d-flex col-lg-12 px-0">
                        {values.imageUrl && values.imageUrl !== dummyImgUrl && (
                          <img
                            className="img-fluid border-0 px-0 rounded"
                            src={values.imageUrl || null}
                            alt="Blog post header"
                          />
                        )}
                        <div className="blog-form-overlay align-content-end position-absolute">
                          <h2 className="blog-form-title card-text pl-2 pb-2 position-absolute text-nowrap">
                            {editFlag ? "Edit" : "New"} Blog Post
                          </h2>
                        </div>
                      </div>
                    </div>
                    <div>
                      <FormGroup name="title" type="text" placeholder="Title" />
                      <FormGroup
                        name="subject"
                        type="text"
                        placeholder="Subject"
                        className="form-inline input-group"
                      >
                        <Select
                          value={options.find(
                            option => option.value === values.blogTypeId
                          )}
                          name="blogTypeId"
                          onChange={selectedOption => {
                            setFieldValue("blogTypeId", selectedOption.value);
                          }}
                          options={options}
                          placeholder="Choose a category..."
                          menuColor="blue"
                        />
                      </FormGroup>
                      <FormGroup
                        component="textarea"
                        name="content"
                        placeholder="Content"
                      />
                      <ImageUpload
                        value={values.imageUrl}
                        setImage={url => {
                          setFieldValue("imageUrl", url);
                        }}
                        className=""
                      />
                    </div>
                    <div className="button-container d-flex justify-content-between">
                      <Checkbox name="isPublished" className="align-self-end" />
                      <div className="button-group">
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg ml-3"
                        >
                          <FaCheck />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            history.push("/blogs/explore");
                          }}
                          className="btn btn-secondary btn-lg ml-3"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </div>
                  </Form>
                </div>

              );
            }}
          </Formik>
        </div>
      );
  };
}

BlogForm.propTypes = {
  currentUser: PropTypes.shape({
    roles: PropTypes.arrayOf(PropTypes.string)
  }),
  history: PropTypes.shape({
    push: PropTypes.func
  }),
  match: PropTypes.shape({
    path: PropTypes.string,
    params: PropTypes.shape({
      id: PropTypes.string
    })
  })
};

const FormGroup = ({
  component,
  name,
  children,
  placeholder,
  className,
  ...props
}) => {
  return (
    <div className={`form-group ${className || ""}`}>
      <Field
        name={name}
        placeholder={placeholder}
        component={component}
        className="form-control"
        {...props}
      />
      {children && <div className="select-append">{children}</div>}
      <ErrorMessage name={name} component="label" className="text-danger" />
      {children && (
        <ErrorMessage name={children.props.name} component="label" />
      )}
    </div>
  );
};

FormGroup.propTypes = {
  component: PropTypes.string,
  name: PropTypes.string,
  children: PropTypes.element,
  placeholder: PropTypes.string,
  className: PropTypes.string
};

export const Checkbox = props => {
  return (
    <div className={`custom-control custom-switch ${props.className}`}>
      <Field name={props.name}>
        {({ field, form }) => {
          return (
            <>
              <input
                type="checkbox"
                className="custom-control-input btn "
                id="draftSwitch"
                checked={field.value}
                data-toggle="toggle"
                onChange={() => form.setFieldValue(props.name, !field.value)}
              />
              <label className="custom-control-label" htmlFor="draftSwitch">
                {form.values.isPublished ? "Publish" : "Draft"}
              </label>
            </>
          );
        }}
      </Field>
    </div>
  );
};

Checkbox.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string
};

const optionMapper = entity => ({
  value: entity.id,
  label: entity.name
});

const formMapper = model => ({
  title: model.title,
  subject: model.subject,
  blogTypeId: model.blogType.id,
  content: model.content,
  imageUrl: model.imageUrl,
  isPublished: model.isPublished
});
