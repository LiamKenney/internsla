const BaseController = require("./BaseController");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: "webVideos",
  filename: (req, file, callback) => {
    callback(
      null,
      `${file.fieldname}_${req.user.id}.${file.mimetype.split("/").pop()}`
    );
  },
});
const upload = multer({ storage: storage }).single("file");
const Responses = require("sabio-web-models").Responses;
const { RoutePrefix, Route } = require("sabio-routing");
const { videoSchema } = require("sabio-models").Schemas;
const { videoService } = require("sabio-services");
const Vimeo = require("vimeo").Vimeo;
// const logger = require("sabio-debug").extend("VideoController-important");
const vimeoKeys = {
  clientId: process.env.VIMEO_CLIENT_ID,
  clientSecret: process.env.VIMEO_CLIENT_SECRET,
  token: process.env.VIMEO_TOKEN,
};
const client = new Vimeo(
  vimeoKeys.clientId,
  vimeoKeys.clientSecret,
  vimeoKeys.token
);

@RoutePrefix("/api/videos")
class VideoController extends BaseController {
  constructor() {
    super("VideoController");
  }

  @Route("POST", "create")
  create(req, res, next) {
    upload(req, res, () => {
      videoSchema.validate(req.body, (err) => {
        if (err) {
          const eResponse = new Responses.ErrorResponse(err);
          res.status(400).json(eResponse);
        }
        videoService
          .upload(req, client)
          .then((result) => {
            const sResponse = new Responses.ItemResponse(result);
            res.status(201).json(sResponse);
          })
          .catch((err) => {
            const eResponse = new Responses.ErrorResponse(err);
            res.status(400).json(eResponse);
          });
      });
    });
  }

  @Route("GET", "retrieve/:videoUri")
  retrieve(req, res, next) {
    videoService
      .retrieve(req.params.videoUri, client)
      .then((body) => {
        const result = {
          name: body.name,
          description: body.description,
          html: body.embed.html,
        };
        const sResponse = new Responses.ItemResponse(result);
        res.status(201).json(sResponse);
      })
      .catch((err) => {
        const eResponse = new Responses.ErrorResponse(err);
        res.status(400).json(eResponse);
      });
  }

  @Route("PUT", "update")
  update(req, res, next) {
    upload(req, res, () => {
      videoSchema.validate(req.body, (err) => {
        if (err) {
          const eResponse = new Responses.ErrorResponse(err);
          res.status(400).json(eResponse);
        }
        videoService
          .update(req, client)
          .then((result) => {
            const sResponse = new Responses.ItemResponse(result);
            res.status(201).json(sResponse);
          })
          .catch((err) => {
            const eResponse = new Responses.ErrorResponse(err);
            res.status(400).json(eResponse);
          });
      });
    });
  }

  @Route("DELETE", "delete/:videoUri")
  delete(req, res, next) {
    upload(req, res, () => {
      videoService
        .remove(req.params.videoUri, client)
        .then((body, statusCode, headers) => {
          const sResponse = new Responses.SuccessResponse();
          res.status(201).json(sResponse);
        })
        .catch((err, statusCode) => {
          const eResponse = new Responses.ErrorResponse(err);
          res.status(400).json(eResponse);
        });
    });
  }
}

// const test = function(req, res, next) {
//   // logger(req.body, req.file);
//   res.status(200).json("Test hit", req.body, req.file);
// };

module.exports = { controller: VideoController };
