import React from "react";
import HomeButton from "./HomeButton";

export const ErrorCard = (props) => {
    return (
        <div className="card w-25 d-flex mt-5 ml-5 shadow-lg">
            <h1 className="my-5 d-flex justify-content-center">No Blog Found</h1>
            <HomeButton {...props} />
        </div>
    )
}

export default React.memo(ErrorCard);