const { dataProvider, TYPES } = require("sabio-data");
const { Paged } = require("sabio-models");

class BlogService {
  create(createdBy, model) {
    return new Promise((resolve, reject) => {
      const procName = "dbo.Blogs_Insert_V2";
      let newId = null;

      dataProvider.executeNonQuery(
        procName,
        inputParamMapper,
        returnParamMapper,
        onCompleted
      );

      function inputParamMapper(sql) {
        setBlogInputs(model, sql);
        sql.input("AuthorId", TYPES.Int, createdBy);
        sql.output("Id", TYPES.Int);
      }

      function returnParamMapper(outputParams) {
        newId = outputParams;
      }

      function onCompleted(err, data) {
        if (err) {
          reject(err);
          return;
        }
        resolve(newId);
      }
    });
  }

  paginate(pageIndex = 0, pageSize = 10) {
    return new Promise((resolve, reject) => {
      const procName = "dbo.BlogsSelectAll_Paginated_V2";
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

      function onCompleted(err, data) {
        if (err) {
          reject(err);
          return;
        }
        if (recordSet.length === 0) {
          reject(new Error("Record Not Found"));
          return;
        }
        result = new Paged(recordSet, pageIndex, pageSize, totalCount);
        resolve(result);
      }
    });
  }

  selectById(id) {
    return new Promise((resolve, reject) => {
      const procName = "dbo.BlogsSelect_ById_V2";
      const returnParamMapper = null;
      let result = null;

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

      function singleRecordMapper(record) {
        result = mapRecordToOutput(record);
      }

      function onCompleted(err, data) {
        if (err) {
          reject(err);
          return;
        }
        if (!result) {
          reject(new Error("Record Not Found"));
          return;
        }
        resolve(result);
      }
    });
  }

  selectByCreatedBy(createdBy, pageIndex = 0, pageSize = 10) {
    return new Promise((resolve, reject) => {
      const procName = "dbo.BlogsSelect_ByCreatedBy_V2";
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
        sql.input("AuthorId", TYPES.Int, createdBy);
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
        if (recordSet.length === 0) {
          reject(new Error("Record Not Found"));
          return;
        }
        result = new Paged(recordSet, pageIndex, pageSize, totalCount);
        resolve(result);
      }
    });
  }

  selectByCreatedBy(createdBy, pageIndex = 0, pageSize = 10) {
    return new Promise((resolve, reject) => {
      const procName = "dbo.BlogsSelect_ByCreatedBy_V2";
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
        sql.input("AuthorId", TYPES.Int, createdBy);
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

  update(id, model) {
    return new Promise((resolve, reject) => {
      const procName = "dbo.Blogs_Update_V3";
      const returnParamMapper = null;

      dataProvider.executeNonQuery(
        procName,
        inputParamMapper,
        returnParamMapper,
        onCompleted
      );

      function inputParamMapper(sql) {
        setBlogInputs(model, sql);
        sql.input("Id", TYPES.Int, id);
      }

      function onCompleted(err, data) {
        if (err) {
          reject(err);
          return;
        }
        if (data.rowsAffected[0] === 0) {
          reject(new Error("Record Not Found"));
          return;
        }
        resolve(data);
      }
    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      const procName = "dbo.BlogsDelete_ById";
      const returnParams = null;

      dataProvider.executeNonQuery(
        procName,
        inputParams,
        returnParams,
        onCompleted
      );

      function inputParams(sql) {
        sql.input("Id", TYPES.Int, id);
      }

      function onCompleted(err, data) {
        if (err) {
          reject(err);
          return;
        }
        if (data.rowsAffected[0] === 0) {
          reject(new Error("Record Not Found"));
          return;
        }
        resolve(data);
      }
    });
  }
}

const setBlogInputs = (model, sql) => {
  const blogTypes = {
    blogTypeId: TYPES.Int,
    title: TYPES.NVarChar(50),
    subject: TYPES.NVarChar(50),
    content: TYPES.NVarChar(TYPES.MAX),
    isPublished: TYPES.Bit,
    imageUrl: TYPES.NVarChar(255)
  };
  for (var param in model) {
    sql.input(param, blogTypes[param], model[param]);
  }
};

const mapRecordToOutput = record => {
  return {
    id: record.id,
    blogType: {
      id: record.blogTypeId,
      name: record.blogTypeName
    },
    author: {
      id: record.authorId,
      email: record.email,
      firstName: record.firstName,
      lastName: record.lastName,
      avatarUrl: record.avatarUrl
    },
    title: record.title,
    subject: record.subject,
    content: record.content,
    isPublished: record.isPublished,
    imageUrl: record.imageUrl,
    dateCreated: record.dateCreated,
    dateModified: record.dateModified,
    datePublish: record.datePublish
  };
};
module.exports = new BlogService();
