const mongodb = require('../utils/mongodb');


/**
 * Creating New MongoDb Connection obect by Switching DB
 */
const getTenantDB = (tenantId, modelName, schema) => {
  const dbName = `academy_${tenantId}`;
  if (mongodb) {
    // useDb will return new connection
    const db = mongodb.useDb(dbName, { useCache: true });
    console.log(`DB switched to ${dbName}`);
    db.model(modelName, schema);
    return db;
  }
  return throwError(500, codes.CODE_8004);
};

/**
 * Return Model as per tenant
 */
module.exports.getModelByTenant = (tenantId, modelName, schema) => {
  console.log(`getModelByTenant tenantId : ${tenantId}.`);
  const tenantDb = getTenantDB(tenantId, modelName, schema);
  return tenantDb.model(modelName);
};