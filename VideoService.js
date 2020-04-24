const { dataProvider, TYPES } = require("sabio-data");
const mssql = require("mssql");
const fs = require("fs");
const logger = require("sabio-debug").extend("VideoController-important");
const percLogger = logger.extend("Progress");

const addUrl = (url, filetype, userId) => {
  return new Promise((resolve, reject) => {
    const procName = "[dbo].[Files_Insert_V4]";
    let result = {};
    dataProvider.executeNonQuery(
      procName,
      inputParamMapper,
      returnParamMapper,
      onCompleted
    );
    function inputParamMapper(req) {
      const fileTable = new mssql.Table();
      fileTable.columns.add("URL", TYPES.NVarChar(255));
      fileTable.columns.add("FileTypeName", TYPES.NVarChar(50));
      fileTable.columns.add("CreatedBy", TYPES.Int);
      fileTable.rows.add(url, filetype, userId);
      req.input("Files", TYPES.TVP, fileTable);
      req.output("fileId", TYPES.Int);
      req.output("fileTypeId", TYPES.Int);
    }
    function returnParamMapper(params) {
      result = { ...params, url };
    }

    function onCompleted(err, data) {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    }
  });
};

const updateUrl = (url, fileType, userId, fileId) => {
  return new Promise((resolve, reject) => {
    const procName = "[dbo].[Files_Update_V3]";
    let result = {};
    dataProvider.executeNonQuery(
      procName,
      inputParamMapper,
      returnParamMapper,
      onCompleted
    );
    function inputParamMapper(req) {
      req.input("Id", TYPES.Int, fileId);
      req.input("Url", TYPES.NVarChar(255), url);
      req.input("FileTypeName", TYPES.NVarChar(50), fileType);
      req.input("CreatedBy", TYPES.Int, userId);
    }

    function returnParamMapper(params) {
      result = { ...params, url };
    }

    function onCompleted(err, data) {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    }
  });
};
const upload = (req, client) => {
  const { file, body } = req;
  return new Promise((resolve, reject) => {
    client.upload(
      file.path,
      {
        name: body.name,
        description: body.description,
      },
      (uri) => {
        const url = "www.vimeo.com/" + uri.split("/").pop();
        const service = body.fileId ? updateUrl : addUrl;
        service(url, file.mimetype.split("/").pop(), body.userId, body.fileId)
          .then((result) => {
            deleteLocalFile(file.path);
            resolve(result);
          })
          .catch(reject);
      },
      logProgress,
      reject
    );
  });
};

const retrieve = (videoUri, client) => {
  return new Promise((resolve, reject) => {
    client.request(
      {
        method: "GET",
        path: "/videos/" + videoUri,
      },
      (error, body, statusCode, headers) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(body);
      }
    );
  });
};

const remove = (uri, client) => {
  const vimeoPath = "/videos/" + uri;
  return new Promise((resolve, reject) => {
    client.request(
      {
        method: "DELETE",
        path: vimeoPath,
      },
      (err, body, statusCode, headers) => {
        if (err) {
          reject(err, statusCode);
          return;
        }
        resolve(body, statusCode, headers);
      }
    );
  });
};

const update = (req, client) => {
  return new Promise((resolve, reject) => {
    upload(req, client)
      .then((result) => {
        remove(req.body.url.split("/").pop(), client).then(() => {
          resolve(result);
        });
      })
      .catch(reject);
  });
};

function logProgress(bytesUploaded, bytesTotal) {
  const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
  percLogger(bytesUploaded, bytesTotal, percentage + "%");
}

function deleteLocalFile(path) {
  fs.unlink(path, (err) => {
    if (err) {
      logger(err);
    }
  });
}
module.exports = { upload, retrieve, update, remove };
