import React from "react";
import PropTypes from 'prop-types';
import { FaEdit, FaTrashAlt, FaUser } from "react-icons/fa";
import * as dateService from "../../services/dateService";

const PostCard = ({ post, buttons, canModify }) => (
    <div className="post-card">
        <div className="post-header cust-bg-shader row no-gutters">
            <div className="col col-md-2 text-center py-3">
                <h3 className="align-content-center mb-0">{`${post.author.firstName || "New"} ${post.author.lastName || "post"}`}</h3>
            </div>
            <div className="col text-right align-self-center pr-3">
                {`on ${dateService.formatDate(post.dateCreated)}`}
            </div>
        </div>
        <div className="post-body row no-gutters justify-content-between">
            <div className="post-body-user col-2 text-center pt-3 pb-3">
                {(post.author.avatarUrl &&
                    <img src={post.author.avatarUrl} className="rounded-circle img-fluid thumb128" alt="User profile avatar" />) ||
                    <FaUser />
                }
                <div className="user-date pt-2">{`Since: ${dateService.formatDate(post.author.dateCreated)}`}</div>
            </div>
            <div className="post-body-content col pt-1 cust-big-text">{post.content}</div>
            <div className="col-1 d-flex justify-content-center align-content-around flex-wrap cust-bg-shader pb-3">
                <div className="w-100 d-flex justify-content-center">
                    {canModify &&
                        <div onClick={buttons.edit} className="btn btn-secondary btn-lg">
                            <FaEdit />
                        </div>
                    }
                </div>
                <div className="w-100 d-flex justify-content-center">
                    {canModify &&
                        <div onClick={buttons.delete} className="btn btn-danger btn-lg">
                            <FaTrashAlt />
                        </div>
                    }
                </div>
            </div>
        </div>
    </div>
);

PostCard.propTypes = {
    post: PropTypes.shape({
        content: PropTypes.string,
        author: PropTypes.shape({
            firstName: PropTypes.string,
            lastName: PropTypes.string,
            avatarUrl: PropTypes.string,
            dateCreated: PropTypes.string
        }),
        dateCreated: PropTypes.string
    }),
    buttons: PropTypes.shape({
        edit: PropTypes.func,
        delete: PropTypes.func
    }),
    canModify: PropTypes.bool
}

export default React.memo(PostCard);