const AWS = require('aws-sdk');

const s3 = new AWS.S3();
const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

exports.handler = (event, context, callback) => {
  console.info('CRON JOB EVENT : \n' + JSON.stringify(event));

  let params = {
    Bucket: process.env.LambdaBucketName,
    Key: process.env.CronJobLambdaFile
  };

  s3.getObject(params, function (err, data) {
    callback(null, { err: err, data: data });
    if (err) {
      console.error(err, err.stack);
    } else {
      console.info(process.env.LambdaBucketName + ' object : ' + JSON.stringify(data));
    }
  });

  ddb.listTables({ Limit: 10 }, function (err, data) {
    callback(null, { err: err, data: data });
    if (err) {
      console.error('Error', err.code);
    } else {
      console.info('DynamoDB table names : ', data.TableNames);
    }
  });
};
