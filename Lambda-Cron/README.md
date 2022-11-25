# 建立 Cron Job Lambda

本範例是建立 Cron Job Lambda Function，Lambda Function 會定期執行 S3 getObject 以及 DynamoDB listTables，並將結果存在 log 裡

- 部署 S3 Bucket 供打包後的 Lambda code 上傳
    ```
    aws cloudformation deploy --template-file s3.yml --stack-name cf-sample-s3 --parameter-overrides LambdaBucketName=<Your Bucket Name>
    ```

- 打包 Lambda code 並上傳到步驟 1  建立的 S3 Bucket
    ```
    cd ./lambda-dep && zip -r <Lambda zip file name> . && cd ..
	aws s3 cp ./lambda-dep/<Lambda zip file name> s3://<Your Bucket Name>
    ```
    - Lambda zip file name : 打包上傳的 lambda .zip 檔名(EX: lambda01.zip)
   
3. 部署 Lambda
    ```
    aws cloudformation deploy --template-file lambda.yml --stack-name cf-sample-lambda --capabilities CAPABILITY_NAMED_IAM --parameter-overrides Frequency=<Cron Job Frequency> LambdaBucketName=<Your Bucket Name> CronJobLambdaFile=<Lambda zip file name>
    ```
    - LambdaBucketName : 步驟一的 S3 Bucket 名稱
    - Frequency : cron jon 頻率，請參考[Schedule expressions using rate or cron](https://docs.aws.amazon.com/lambda/latest/dg/services-cloudwatchevents-expressions.html)
    - CronJobLambdaFile : 步驟二打包上傳的 lambda zip 檔名

4. 查看 cloudWatch
   - 至 console 介面查看 `/aws/lambda/cf-lambda-sample-CronJobLambdaFunction-XXXXXXX` 的日誌群組，可查到每五分鐘 lambda 執行所留下的 log

5. 刪除 stack

    刪除 stack 會把之前透過 CloudFormation 佈署的所有服務也移除。
    
    ```
    aws cloudformation delete-stack --stack-name cf-sample-lambda
    aws cloudformation delete-stack --stack-name cf-sample-s3
    ```
   
    P.S. 因 [s3.yml](./s3.yml) 的 `DeletionPolicy` 是設定 `Retain`，所以刪除 `cf-sample-s3` stack 時並不會把 S3 Bucket 刪除，若想一併刪除，可將 `DeletionPolicy` 更改成 `Delete` 
