import React from "react";
import PropTypes from 'prop-types';
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { CSSTransition } from "react-transition-group";
import "./Post.css"
// import debug from "sabio-debug";
// const logger = debug.extend("important");

export default class PostForm extends React.Component {
    static propTypes = {
        isOpen: PropTypes.bool,
        toggleOpen: PropTypes.func,
        initialPost: PropTypes.string,
        onSubmit: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        this.state = {
            isVisible: props.isOpen
        }
    }

    toggleVisible = () => {
        this.setState(({ isVisible }) => ({ isVisible: !isVisible }))
    }

    render() {
        const { isOpen } = this.props
        const { isVisible } = this.state;
        return (
            <div className="post-form w-75 justify-content-center mb-5">
                <Formik
                    enableReinitialize={true}
                    initialValues={{ content: this.props.initialPost }}
                    onSubmit={this.props.onSubmit}
                    validationSchema={Yup.object().shape({
                        content: Yup.string().required('Required'),
                    })}
                >
                    <Form>
                        <div className="w-100 d-flex justify-content-center">
                            <button type="button" onClick={this.props.toggleOpen} className="btn btn-primary">{isOpen ? "Close" : "Reply"}</button>
                        </div>
                        <CSSTransition in={isOpen} timeout={500} onEnter={this.toggleVisible} onExited={this.toggleVisible} >
                            <div className={`post-form-box w-100 my-3`}>
                                {isVisible &&
                                    <div className="post-form-box-content">
                                        <div className="text-center pb-1">Make sure you have read the forum rules before posting</div>
                                        <Field name="content" component="textarea" placeholder="Have something to add? Write it here!" wrap="hard" cols="20" className="form-control mb-2" />
                                        <div>
                                            <ErrorMessage name="content" component="span" className="text-danger" />
                                        </div>
                                        <div className="d-flex w-100 justify-content-center">
                                            <button type="submit" className="btn btn-primary" >Submit</button>
                                        </div>
                                    </div>
                                }
                            </div>
                        </CSSTransition>
                    </Form>
                </Formik >
            </div >
        )
    }
}