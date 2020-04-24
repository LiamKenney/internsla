const BaseController = require("./BaseController");
const Responses = require("sabio-web-models").Responses;
const { RoutePrefix, Route } = require("sabio-routing");
const { postSchema } = require("sabio-models").Schemas;
const { postService } = require("sabio-services");

@RoutePrefix("/api/posts")
class PostController extends BaseController {
  constructor() {
    super("PostController");
  }

  @Route("POST", "create", postSchema)
  create(req, res, next) {
    postService
      .create(req.body)
      .then(id => {
        const currentTime = new Date().toUTCString();
        const response = {
          ...id,
          createdBy: req.body.createdBy,
          dateCreated: currentTime,
          dateModified: currentTime
        };
        res.status(201).json(new Responses.ItemResponse(response));
      })
      .catch(err => {
        res.status(400).json(new Responses.ErrorResponse(err));
      });
  }

  @Route("GET", "pages")
  paginate(req, res, next) {
    const { pageIndex = 0, pageSize = 10 } = req.query;
    postService
      .paginate(+pageIndex, +pageSize)
      .then(data => {
        if (data.pagedItems.length < 1) {
          const eResponse = new Error("Record Not Found");
          res.status(404).json(new Responses.ErrorResponse(eResponse));
          return;
        }
        res.status(200).json(new Responses.ItemResponse(data));
      })
      .catch(err => {
        res.status(400).json(new Responses.ErrorResponse(err));
      });
  }

  @Route("GET", ":postId(\\d+)/details")
  selectById(req, res, next) {
    postService
      .selectById(+req.params.postId)
      .then(data => {
        if (!data) {
          const eResponse = new Error("Record Not Found");
          res.status(404).json(new Responses.ErrorResponse(eResponse));
          return;
        }
        res.status(200).json(new Responses.ItemResponse(data));
      })
      .catch(err => {
        res.status(400).json(new Responses.ErrorResponse(err));
      });
  }

  @Route("GET", "author/:authorId(\\d+)/pages")
  selectByCreatedBy(req, res, next) {
    const { pageIndex = 0, pageSize = 10 } = req.query;
    postService
      .selectByCreatedBy(+req.params.authorId, +pageIndex, +pageSize)
      .then(data => {
        if (data.pagedItems.length < 1) {
          const eResponse = new Error("Records Not Found");
          res.status(404).json(new Responses.ErrorResponse(eResponse));
          return;
        }
        res.status(200).json(new Responses.ItemResponse(data));
      })
      .catch(err => {
        res.status(400).json(new Responses.ErrorResponse(err));
      });
  }

  @Route("GET", "thread/:threadId(\\d+)/pages")
  selectByThreadId(req, res, next) {
    const { pageIndex = 0, pageSize = 10 } = req.query;
    postService
      .selectByThreadId(+req.params.threadId, +pageIndex, +pageSize)
      .then(data => {
        if (data.pagedItems.length < 1) {
          const eResponse = new Error("Records Not Found");
          res.status(404).json(new Responses.ErrorResponse(eResponse));
          return;
        }
        res.status(200).json(new Responses.ItemResponse(data));
      })
      .catch(err => {
        res.status(400).json(new Responses.ErrorResponse(err));
      });
  }

  @Route("PUT", ":postId(\\d+)/edit", postSchema)
  update(req, res, next) {
    const model = {
      id: +req.params.postId,
      content: req.body.content,
      authorId: req.body.authorId
    };
    postService
      .update(model)
      .then(data => {
        if (data.rowsAffected[1] === 0) {
          const eResponse = new Error("Record Not Found");
          res.status(404).json(new Responses.ErrorResponse(eResponse));
          return;
        }
        res.status(201).json(new Responses.SuccessResponse());
      })
      .catch(err => {
        res.status(400).json(new Responses.ErrorResponse(err));
      });
  }

  @Route("DELETE", ":postId(\\d+)/delete")
  delete(req, res, next) {
    postService
      .delete(+req.params.postId)
      .then(data => {
        if (data.rowsAffected[0] === 0) {
          const eResponse = new Error("Record Not Found");
          res.status(404).json(new Responses.ErrorResponse(eResponse));
          return;
        }
        res.status(200).json(new Responses.SuccessResponse());
      })
      .catch(err => {
        res.status(400).json(new Responses.ErrorResponse(err));
      });
  }
}

module.exports = { controller: PostController };
