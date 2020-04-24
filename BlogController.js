const Responses = require("sabio-web-models").Responses;
const BaseController = require("./BaseController");
const { AllowAnonymous, RoutePrefix, Route } = require("sabio-routing");
const blogService = require("sabio-services").blogService;
const { getCurrentUser } = require("sabio-services").authenticationService;
const { blogSchema } = require("sabio-models").Schemas;

@RoutePrefix("/api/blogs")
class BlogController extends BaseController {
  constructor() {
    super("BlogController");
  }


  @Route("POST", "create", blogSchema)
  create(req, res, next) {
    const user = getCurrentUser(req);
    blogService
      .create(user.id, req.body)
      .then(output => {
        res.status(201).json(new Responses.ItemResponse(output));
      })
      .catch(err => {
        res.status(400).json(new Responses.ErrorResponse(err));
      });
  }
  @AllowAnonymous()
  @Route("GET", "pages")
  paginate(req, res, next) {
    const { pageIndex = 0, pageSize = 10 } = req.query;

    blogService
      .paginate(+pageIndex, +pageSize)
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
  @AllowAnonymous()
  @Route("GET", ":blogId(\\d+)/details")
  selectById(req, res, next) {
    blogService
      .selectById(+req.params.blogId)
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
  @AllowAnonymous()
  @Route("GET", ":authorId(\\d+)/pages")
  selectByCreatedBy(req, res, next) {
    const user = getCurrentUser(req);
    const { pageIndex = 0, pageSize = 10 } = req.query;
    blogService
      .selectByCreatedBy(+user.id, +pageIndex, +pageSize)
      .then(data => {
        if (data.pagedItems.length < 1) {
          const eResponse = new Error("Records Not Found");
          res.status(404).json(new Resposnses.ErrorResponse(eResponse));
          return;
        }

        const sResponse = new Responses.ItemResponse(data);
        res.status(200).json(sResponse);
      })
      .catch(err => {
        res.status(400).json(new Responses.ErrorResponse(err));
      });
  }

  @Route("PUT", ":blogId(\\d+)/edit", blogSchema)
  update(req, res, next) {
    blogService
      .update(+req.params.blogId, req.body)
      .then(data => {
        if (data.rowsAffected[0] === 0) {
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

  @Route("DELETE", ":blogId(\\d+)/delete")
  delete(req, res, next) {
    blogService
      .delete(req.params.blogId)
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
module.exports = { controller: BlogController };
