const { dataProvider, TYPES } = require("sabio-data");
const { Paged } = require("sabio-models");

class PostService {
  create(model) {
    return new Promise((resolve, reject) => {
      const procName = "dbo.Posts_Insert_V2";
      let postCreated = null;

      dataProvider.executeNonQuery(
        procName,
        inputParamMapper,
        returnParamMapper,
        onCompleted
      );

      function inputParamMapper(sql) {
        setPostInputs(model, sql);
        sql.output("Id", TYPES.Int);
      }

      function returnParamMapper(returnParams) {
        if (returnParams.id) {
          postCreated = returnParams;
        }
      }

      function onCompleted(err, data) {
        if (err) {
          reject(err);
          return;
        }
        resolve(postCreated);
      }
    });
  }

  paginate(pageIndex = 0, pageSize = 10) {
    return new Promise((resolve, reject) => {
      const procName = "dbo.Posts_Select_All_V2";
      const returnParamMapper = null;
      const recordSet = [];
      let totalCount = null;
      let result = null;

      dataProvider.executeCmd(
        procName,
        inputParamMapper,
        singleRecordMapper,
        returnParamMapper,
        onCompleted
      );

      function inputParamMapper(sql) {
        sql.input("PageIndex", TYPES.Int, pageIndex);
        sql.input("PageSize", TYPES.Int, pageSize);
      }

      function singleRecordMapper(record) {
        totalCount = record.totalCount;
        recordSet.push(mapRecordToOutput(record));
      }

      function onCompleted(err) {
        if (err) {
          reject(err);
          return;
        }
        result = new Paged(recordSet, pageIndex, pageSize, totalCount);
        resolve(result);
      }
    });
  }

  selectById(id) {
    return new Promise((resolve, reject) => {
      const procName = "dbo.Posts_Select_ById_V2";
      const returnParamMapper = null;
      let post = null;

      dataProvider.executeCmd(
        procName,
        inputParamMapper,
        singleRecordMapper,
        returnParamMapper,
        onCompleted
      );

      function inputParamMapper(sql) {
        sql.input("Id", TYPES.Int, id);
      }

      function singleRecordMapper(data) {
        post = mapRecordToOutput(data);
      }

      function onCompleted(err, data) {
        if (err) {
          reject(err);
          return;
        }
        resolve(post);
      }
    });
  }

  selectByCreatedBy(authorId, pageIndex = 0, pageSize = 10) {
    return new Promise((resolve, reject) => {
      const procName = "dbo.Posts_Select_ByCreatedBy_V2";
      const returnParamMapper = null;
      const recordSet = [];
      let totalCount = null;
      let result = null;

      dataProvider.executeCmd(
        procName,
        inputParamMapper,
        singleRecordMapper,
        returnParamMapper,
        onCompleted
      );

      function inputParamMapper(sql) {
        sql.input("AuthorId", TYPES.Int, authorId);
        sql.input("PageIndex", TYPES.Int, pageIndex);
        sql.input("PageSize", TYPES.Int, pageSize);
      }

      function singleRecordMapper(record) {
        totalCount = record.totalCount;
        recordSet.push(mapRecordToOutput(record));
      }

      function onCompleted(err) {
        if (err) {
          reject(err);
          return;
        }
        result = new Paged(recordSet, pageIndex, pageSize, totalCount);
        resolve(result);
      }
    });
  }

  selectByThreadId(threadId, pageIndex = 0, pageSize = 10) {
    return new Promise((resolve, reject) => {
      const procName = "dbo.Posts_Select_ByThreadId";
      const returnParamMapper = null;
      const recordSet = [];
      let totalCount = null;
      let result = null;

      dataProvider.executeCmd(
        procName,
        inputParamMapper,
        singleRecordMapper,
        returnParamMapper,
        onCompleted
      );

      function inputParamMapper(sql) {
        sql.input("ThreadId", TYPES.Int, threadId);
        sql.input("PageIndex", TYPES.Int, pageIndex);
        sql.input("PageSize", TYPES.Int, pageSize);
      }

      function singleRecordMapper(record) {
        totalCount = record.totalCount;
        recordSet.push(mapRecordToOutput(record));
      }

      function onCompleted(err, data) {
        if (err) {
          reject(err);
          return;
        }
        result = new Paged(recordSet, pageIndex, pageSize, totalCount);
        resolve(result);
      }
    });
  }

  update(model) {
    return new Promise((resolve, reject) => {
      const procName = "dbo.Posts_Update_V2";
      const returnParamMapper = null;

      dataProvider.executeNonQuery(
        procName,
        inputParamMapper,
        returnParamMapper,
        onCompleted
      );

      function inputParamMapper(sql) {
        setPostInputs(model, sql);
      }

      function onCompleted(err, data) {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      }
    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      const procName = "dbo.PostsDelete_ById";
      const returnParamMapper = null;

      dataProvider.executeNonQuery(
        procName,
        inputParamMapper,
        returnParamMapper,
        onCompleted
      );

      function inputParamMapper(sql) {
        sql.input("Id", TYPES.Int, id);
      }

      function onCompleted(err, data) {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      }
    });
  }
}

const setPostInputs = (model, sql) => {
  const postTypes = {
    id: TYPES.Int,
    content: TYPES.NVarChar(4000),
    threadId: TYPES.Int,
    authorId: TYPES.Int
  };
  for (var param in model) {
    sql.input(param, postTypes[param], model[param]);
  }
};

const mapRecordToOutput = record => {
  return {
    id: record.id,
    content: record.content,
    threadId: record.threadId,
    author: {
      id: record.createdBy,
      firstName: record.firstName,
      lastName: record.lastName,
      avatarUrl: record.avatarUrl,
      dateCreated: record.userDate
    },
    modifier: {
      id: record.modifiedBy,
      firstName: record.mFirstName,
      lastName: record.mLastName,
      avatarUrl: record.mAvatarUrl
    },
    dateCreated: record.dateCreated,
    dateModified: record.dateModified
  };
};

module.exports = new PostService();
