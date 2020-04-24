import React from "react";
import PropTypes from "prop-types";
import withUpload from "../fileUpload/UploadWrapper";
import { FaImage } from "react-icons/fa";

export const ImageUpload = withUpload(
    ({ files, handleUpload, setImage, value, ...props }) => {
        if (files && files.length > 0 && files[0] !== value) {
            setImage(files[0]);
        }
        const imgUrl = (files && files.length > 0) ? files[0] : value;
        return (
            <div className="form-inline justify-content-start pb-lg-1 image-upload">
                <div className="">
                    <input
                        type="file"
                        multiple
                        onChange={handleUpload}
                        className=""
                        {...props}
                    />
                </div>
                {(imgUrl && (
                    <div className="">
                        <img
                            src={imgUrl}
                            className="img-thumbnail thumb128 rounded-lg btn_purple"
                            alt="Upload preview"
                        />
                    </div>
                )) || <FaImage className="thumb64 ml-5" />}
            </div>
        );
    }
);

ImageUpload.propTypes = {
    files: PropTypes.arrayOf(PropTypes.string),
    handleUpload: PropTypes.func,
    setFile: PropTypes.func,
    value: PropTypes.string
};

export default { ImageUpload };