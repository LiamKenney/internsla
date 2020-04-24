import React from "react";
import * as vimeoService from "../../services/vimeoService";
import PropTypes from "prop-types";
import swal from "sweetalert2";
import * as Yup from "yup";
import { FaTrashAlt, FaFileUpload } from "react-icons/fa";
import "./Videos.css";

import debug from "sabio-debug";
const logger = debug.extend("VideoPlayerimportant");

export default class VideoPlayer extends React.Component {
    static propTypes = {
        files: PropTypes.arrayOf({
            url: PropTypes.string
        }),
        currentUser: PropTypes.shape({
            id: PropTypes.number
        }),
        match: PropTypes.shape({
            params: PropTypes.shape({
                id: PropTypes.number
            }),
            path: PropTypes.string
        })
    };
    constructor(props) {
        super(props);
        this.state = {
            vimeoFile: this.props.files.find(vimeoFilter) || null,
            vimeoResponse: null
        };
        this.fileInput = React.createRef();
        this.form = React.createRef();
    }

    componentDidMount = () => {
        this.retrieveVideoData();
    }

    componentDidUpdate = () => {
        this.retrieveVideoData();
    }

    prepareUpload = (event) => {
        logger("Change fired", { ...event }, this.fileInput);
        if (event.target.files.length > 0) {
            if (event.target.files[0].type.split("/")[0] === "video") {
                let name = "", description = "";
                swal.queue([{
                    title: "Enter title for video (required)",
                    input: "text",
                    inputValue: "",
                    inputValidator: (value) => {
                        return new Promise(resolve => {
                            if (Yup.string().required().isValidSync(value)) {
                                name = value;
                                resolve();
                                return;
                            }
                            resolve("Must be valid input");
                        })
                    }
                }, {
                    title: "Enter description for video (optional)",
                    input: "text",
                    inputValue: "",
                    inputValidator: (value) => {
                        return new Promise(resolve => {
                            if (Yup.string().isValidSync(value)) {
                                description = value;
                                resolve();
                                return;
                            }
                            resolve("Must be valid input");
                        })
                    }
                }, {
                    title: "Confirm upload",
                    text: `Are you sure you want to upload ${event.target.files[0].name}?`,
                    icon: "question",
                    showCancelButton: () => !swal.isLoading(),
                    confirmButtonText: "Confirm upload",
                    cancelButtonText: "Choose another file",
                    showLoaderOnConfirm: true,
                    preConfirm: () => {
                        swal.showLoading();
                        if (this.state.vimeoFile && this.state.vimeoFile.url) {
                            return vimeoService.update(this.fileInput.current.files[0], name, description, this.props.currentUser.id, this.state.vimeoFile.id, this.state.vimeoFile.url)
                                .then(response => {
                                    logger("Update complete", response);
                                    return response;
                                })
                                .catch(err => {
                                    swal.showValidationMessage(
                                        `Upload failed: ${err}`
                                    )
                                });
                        } else {
                            return vimeoService.create(this.fileInput.current.files[0], name, description, this.props.currentUser.id)
                                .then(response => {
                                    logger("Create complete", response);
                                    return response;
                                })
                                .catch(err => {
                                    swal.showValidationMessage(
                                        `Upload failed: ${err}`
                                    )
                                });
                        }
                    }
                }]).then(result => {
                    if (!result.dismiss) {
                        this.handleUploadSuccess(result);
                    } else {
                        this.restartForm(result.dismiss === swal.DismissReason.cancel)
                    }
                }).catch(this.handleUploadError);
            } else {
                this.handleFileSelectError();
            }
        }
    }
    handleUploadSuccess = ({ value }) => {
        logger("Values passed to success", value);
        const response = value[2];
        logger("Response", response);
        swal.fire({
            title: "Success!",
            text: "Video successfully uploaded",
            icon: "success"
        }).then(() => {
            this.setState({
                vimeoFile: {
                    createdBy: this.props.currentUser.id,
                    dateCreated: new Date().toISOString(),
                    fileTypeId: response.item.fileTypeId,
                    id: response.item.fileId,
                    url: response.item.url
                }
            })
        })
    }
    handleFileSelectError = () => {
        swal.fire({
            title: "Incorrect file type",
            text: `Please select a video file.`,
            icon: "error",
            showCancelButton: true,
            confirmButtonText: "Choose another file",
            cancelButtonText: "Cancel"
        }).then((result) => {
            this.restartForm(result.value);
        })
    }

    handleUploadError = () => {
        swal.fire({
            title: "Error uploading file",
            text: `Please try again.`,
            icon: "error",
            showCancelButton: true,
            confirmButtonText: "Try again",
            cancelButtonText: "Cancel"
        }).then((result) => {
            this.restartForm(result.value);
        })
    }
    handleDelete = () => {
        swal.fire({
            title: "Delete video",
            text: `Are you sure you want to delete ${this.state.vimeoResponse.name}?`,
            icon: "warning",
            showCancelButton: () => !swal.isLoading(),
            showLoaderOnConfirm: true,
            preConfirm: () => {
                return vimeoService.remove(this.state.vimeoFile.url)
                    .then(response => {
                        logger("Delete complete", response);
                        return response;
                    })
                    .catch(err => {
                        swal.showValidationMessage(
                            `Delete failed: ${err}`
                        )
                    });
            }
        }).then((response) => {
            if (response.value && response.value.isSuccessful) {
                swal.fire({
                    title: "Success!",
                    text: "Video has been deleted",
                    icon: "success"
                }).then(() => {
                    this.setState({
                        vimeoFile: null,
                        vimeoResponse: null
                    })
                });
            }
        })
    }
    handleUpdate = () => {
        swal.fire({
            title: "Upload a new video",
            text: "This will replace any existing video. Do you want to continue?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: '<label className="p-0" htmlFor="fileUpload" >Confirm</label>',
            cancelButtonText: '<label className="p-0" htmlFor="fileUpload" >Cancel</label>'
        }).then(result => {
            this.restartForm(!result.dismiss);
        })
    }
    retrieveVideoData = () => {
        if (this.state.vimeoFile && !this.state.vimeoResponse) {
            vimeoService.retrieve(this.state.vimeoFile.url)
                .then(response => {
                    if (response.item && response.item.html) {
                        const playerHtml = response.item.html.replace(/(height|width)="(\d+)"/gi, match => {
                            const isHeight = match.match(/height/) > 0;
                            return match.replace(/="(\d+)"/, isHeight ? "=800" : "=800");
                        });
                        this.setState(() => {
                            return {
                                vimeoResponse: {
                                    ...response.item,
                                    html: <div className="player-container" dangerouslySetInnerHTML={{ __html: playerHtml }} ></div>
                                }
                            }
                        });
                    }
                })
                .catch(logger);
        }
    }
    restartForm = (condition) => {
        if (condition) {
            this.form.current.reset();
            this.fileInput.current.click();
        } else {
            this.form.current.reset();
        }
    }
    render = () => {
        return (
            <div className="video-player row no-gutters justify-content-center p-3">
                <h3 className="video-title col-12 text-center">Video Resume</h3>
                {this.state.vimeoResponse ?
                    <div>
                        <h4 className="text-center">{this.state.vimeoResponse.name}</h4>
                        {this.state.vimeoResponse.html}
                        {+this.props.match.params.id === this.props.currentUser.id &&
                            this.props.match.path === "/seeker/:id/edit" &&
                            (<form className="d-flex justify-content-between p-3 bg-shade" ref={this.form} >
                                <button type="button" className="btn btn-secondary btn-sm" onClick={this.handleUpdate}><FaFileUpload /></button>
                                <input type="file" id="fileUpload" name="fileUpload" onChange={this.prepareUpload} ref={this.fileInput} />
                                <button type="button" className="btn btn-danger btn-sm" onClick={this.handleDelete} ><FaTrashAlt /></button>
                            </form>
                            )}
                    </div> :
                    <MissingVideo changeHandler={this.prepareUpload} inputRef={this.fileInput} formRef={this.form} uploadButton={+this.props.match.params.id === this.props.currentUser.id && this.props.match.path === "/seeker/:id/edit"} />}
            </div>
        );
    }
}

function vimeoFilter(file) {
    if (file.url.match(/^www.vimeo.com\//)) {
        return file;
    }
}

const MissingVideo = React.memo(function MissingVideoMemo(props) {
    return (
        <div className="col-12 justify-content-center">
            <h4 className="text-center">No video found.</h4>
            {props.uploadButton &&
                <form className="d-flex justify-content-center" ref={props.formRef}>
                    <input type="file" id="fileUpload" name="fileUpload" onChange={props.changeHandler} ref={props.inputRef} />
                    <label htmlFor="fileUpload" className="btn btn-primary text-center">Upload a video</label>
                </form>
            }
        </div>
    )
});

MissingVideo.propTypes = {
    changeHandler: PropTypes.func,
    inputRef: PropTypes.shape({
        current: PropTypes.instanceOf(Element)
    }),
    formRef: PropTypes.shape({
        current: PropTypes.instanceOf(Element)
    }),
    uploadButton: PropTypes.bool
}