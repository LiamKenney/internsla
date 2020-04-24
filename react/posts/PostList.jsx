import React from "react";
import PostCard from "./PostCard";
import PostForm from "./PostForm";
import postService from "../../services/postService";
import PropTypes from 'prop-types';
import swal from "sweetalert2";
import Pagination from "rc-pagination";
import "rc-pagination/assets/index.css";

import debug from "sabio-debug";
const logger = debug.extend("important");

export default class PostList extends React.Component {

    static propTypes = {
        threadId: PropTypes.number.isRequired,
        currentUser: PropTypes.shape({
            id: PropTypes.number.isRequired
        }),
        history: PropTypes.shape({
            push: PropTypes.func
        })
    }

    constructor(props) {
        super(props);
        this.state = {
            postArray: [],
            editIndex: -1,
            page: {
                index: 1,
                size: 12,
                totalCount: 0,
            }
        };
    }

    componentDidMount = () => {
        const { index, size } = this.state.page;
        this.handlePageChange(index, size);
    }

    handlePageChange = (current, size) => {
        postService
            .selectByThreadId(this.props.threadId, current - 1, size)
            .then(this.mapPaginateData)
            .catch(errorHandler);
    }

    mapPaginateData = (response) => {
        const { item } = response;
        const { pagedItems, ...page } = item;
        this.setState({
            postArray: pagedItems,
            postElements: pagedItems.map(this.postCardMapper),
            page: {
                index: +page.pageIndex,
                size: +page.pageSize,
                totalCount: +page.totalCount
            }
        })
    }

    handleSubmit = (form, bag) => {
        form = {
            ...form,
            threadId: this.props.threadId,
            authorId: this.props.currentUser.id
        };
        const { postArray, editIndex } = this.state;
        const service = postService[editIndex === 0 ? "create" : "update"];

        service(form, editIndex > 0 ? postArray[editIndex].id : undefined)
            .then((res) => {
                this.submitSuccess(res, form);
                bag.resetForm();
            })
            .catch(err => logger(err));
    }

    submitSuccess = (res, form) => {
        const { postArray, editIndex } = this.state;
        let newPost = {
            ...form,
        };
        newPost = res.item ?
            {
                ...newPost,
                ...res.item,
                author: {
                    ...this.props.currentUser
                }
            } :
            {
                ...postArray[editIndex],
                ...newPost,
                author: {
                    ...postArray[editIndex].author,
                    id: this.props.currentUser.id
                }
            };
        this.appendPost(newPost);
    }


    appendPost = (post) => {
        this.setState(prevState => {
            if (prevState.editIndex === 0) {
                const newPostArray = [...prevState.postArray, post];
                return {
                    postArray: newPostArray,
                    postElements: newPostArray.map(this.postCardMapper),
                    editIndex: -1
                }
            } else {
                const newPostArray = [...prevState.postArray];
                newPostArray[prevState.editIndex] = post;
                return {
                    postArray: newPostArray,
                    postElements: newPostArray.map(this.postCardMapper),
                    editIndex: -1
                }
            }
        });
    }

    editHandler = (editIndex) => {
        return () => {
            this.setState({ editIndex });
        }
    }

    deleteHandler = (key) => {
        return () => {
            const options = {
                title: "Delete post",
                text: "Are you sure you want to delete this post?",
                icon: "warning",
                showCancelButton: true,
                showLoaderOnConfirm: true,
                preConfirm: () => {
                    const id = this.state.postArray[key].id;
                    return postService.delete(id)
                        .then(() => { this.deleteSuccess(key) })
                        .catch(errorHandler);
                }
            }
            swal.fire(options);
        }
    }

    toggleFormOpen = () => {
        this.setState(prevState => ({
            editIndex: prevState.editIndex < 0 ? 0 : -1
        }));
    }

    deleteSuccess = (key) => {
        swal.fire({
            title: "Success!",
            text: "Post successfully deleted",
            icon: "success"
        }).then(() => {
            this.setState(prevState => {
                const newPostArray = prevState.postArray.filter((post, index) => index !== key);
                return {
                    postArray: newPostArray,
                    postElements: newPostArray.map(this.postCardMapper)
                }
            });
        });
    }


    postCardMapper = (post, i) => {
        return (<PostCard post={post} buttons={{ edit: this.editHandler(i), delete: this.deleteHandler(i) }} canModify={post.author.id === this.props.currentUser.id} key={i} />);
    }

    render = () => {
        const { index, size, totalCount } = this.state.page;
        const { postArray, editIndex } = this.state;
        return (
            <div className="post post-list">
                <div className="post-list-content">
                    {(this.state.postArray &&
                        this.state.postArray.length > 0 &&
                        this.state.postElements) ||
                        <h5 className="text-center text-muted">No responses yet!</h5>}
                </div>
                <div className="post-list-footer row no-gutters justify-content-center py-3 cust-bg-shader">
                    {(this.state.postArray &&
                        this.state.postArray.length > 0 &&
                        <Pagination onChange={this.handlePageChange} current={index + 1} pageSize={size} total={totalCount} className="customPaginate" />)
                    }
                    < div className="w-100" />
                    <PostForm isOpen={editIndex >= 0} toggleOpen={this.toggleFormOpen} initialPost={editIndex > 0 ? postArray[editIndex].content : undefined} onSubmit={this.handleSubmit} />
                </div>
            </div>
        )
    }
}

const errorHandler = err => {
    logger("Error: ", err);
}
