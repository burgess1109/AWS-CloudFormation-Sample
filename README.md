# AWS-CloudFormation-Sample

提供一些簡單且基本的 [AWS CloudFormation template](https://aws.amazon.com/tw/cloudformation/resources/templates) Sample，可以從這些 template 繼續延伸。

使用 AWS CloudFormation template 好處是可以透過 template 設定值快速建置 AWS 服務，這些設定可以進行版本控制，也能保持各種環境的 AWS 服務設定一致。
相較於在 console 介面操作可靠許多。

## Prepare

執行 AWS CloudFormation 需要準備下列事項：

1. 安裝 [AWS CLI](https://docs.aws.amazon.com/zh_tw/cli/latest/userguide/install-cliv2.html)
2. 一組有相關服務佈署權限的 IAM User 存取金鑰 ID 和私密存取金鑰，如果沒有可參考[管理 IAM 使用者的存取金鑰](https://docs.aws.amazon.com/zh_tw/IAM/latest/UserGuide/id_credentials_access-keys.html)。
3. 設定 [登入資料檔案](https://docs.aws.amazon.com/zh_tw/cli/latest/userguide/cli-configure-profiles.html)，AWS 是靠 `aws_access_key_id`(存取金鑰 ID) 和 `aws_secret_access_key`(私密存取金鑰) 辦認使用者。

**Note** 
- 請在 `~/.aws/config` 設定 region，template 不會特別指定。
- 請勿向第三方提供您的存取金鑰，也不要建立 AWS account root user 的存取金鑰，應另建立 IAM user 提供相關服務的佈署權限，並用該 IAM user 的存取金鑰 ID 和私密存取金鑰進行 AWS CLI 操作。
- 上述的方式是取得一組  long-term access key，key 不會過期，所以擁有存取金鑰即擁有永久的操作權限，更安全的做法是建立一個 deploy 用的 IAM roles ，並透過 `AssumeRole` 去取得 temporary security credentials，
以下是個取得 900 秒 deploy-test role 的 temporary security credentials 例子：
    
    ```
    aws sts assume-role --role-arn arn:aws:iam::xxxx:role/deploy-test --role-session-name burgess-deploy-test --duration-seconds 900 --profile test
    ```
    
    上述指令會回傳 `AssumedRoleUser` 和 `Credentials`，再把回傳值寫入 `~/.aws/credentials` 的 `aws_access_key_id`(AccessKeyId)、`aws_secret_access_key`(SecretAccessKey)、`aws_session_token`(SessionToken) 即可。
    
    ```json
    {
        "AssumedRoleUser": {
            "AssumedRoleId": "xxxxx",
            "Arn": "xxxxx"
        },
        "Credentials": {
            "SecretAccessKey": "xxxxx",
            "SessionToken": "xxxxxx",
            "Expiration": "2020-03-15T00:05:07Z",
            "AccessKeyId": "xxxxxx"
        }
    }
    ```
    
    關於 AWS Access Keys 的管理方式，可參考 [Best Practices for Managing AWS Access Keys](https://docs.aws.amazon.com/general/latest/gr/aws-access-keys-best-practices.html)
    

## Resources

請依下列順序建立資源，刪除資源時則相反順序刪除

### VPC

建立一組 VPC 供本範例所有資源使用，本範例所有資源將會在這組 VPC 下，CIDR range 為 10.1.0.0/16，並會在不同 AZ 建立一組 public subnet 跟 private subnet，public subnet 網段為 `10.1.10.0/24` 及 `10.1.11.0/24`，private subnet 網段為 `10.1.50.0/24` 及 `10.1.51.0/24`，詳細設定參考 [vpc.yml](./vpc.yml)

- 部署: `aws --region <YOUR AWS REGION> cloudformation deploy --template-file vpc.yml --stack-name cf-sample-vpc`
- 刪除資源: `aws --region <YOUR AWS REGION> cloudformation delete-stack --stack-name cf-eks-vpc` 

### Security Group

建立不同 Security Group 供不同資源使用，例如開放 80 port 的 SG 給 web server，開放 3306 port 的 SG 給 SQL server，詳細設定參考 [securityGroup.yml](./securityGroup.yml)

- 部署: `aws --region <YOUR AWS REGION> cloudformation deploy --template-file securityGroup.yml --stack-name cf-sample-sg`
- 刪除資源: `aws --region <YOUR AWS REGION> cloudformation delete-stack --stack-name cf-sample-sg` 

### EC2

本範例簡單建立一個作為 ssh tunnel 的 EC2，有些 AWS 資源需要在相同 VPC 才能連線(ex: DocDB)，外部就需要通過 EC2 ssh tunnel 連接，詳細設定參考 [ec2.yml](./ec2.yml)

- 請先建立一組 [EC2 Key Pairs](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html)，在本機執行 EC2 SSH 登入時會用到，可以使用 console 介面或使用 AWS CLI 的 [`aws ec2 create-key-pair`](https://docs.aws.amazon.com/cli/latest/reference/ec2/create-key-pair.html) 指令建立金鑰。請妥善保存金鑰。
- 部署: `aws --region <YOUR AWS REGION> cloudformation deploy --template-file ec2.yml --stack-name cf-sample-ec2`
- 連線到 SSH Tunnel: `ssh -i <金鑰檔案位置> ec2-user@<EC2 IPv4 DNS>`
- 刪除資源: `aws --region <YOUR AWS REGION> cloudformation delete-stack --stack-name cf-sample-ec2` 

### MariaDB

本範例會建立一個 MariaDB Server，`parameter-overrides` 裡的參數可自行調整，詳細設定參考 [mariaDB.yml](./mariaDB.yml)

- 部署: 
    ```
    aws --region <YOUR AWS REGION> cloudformation deploy
        --template-file mariaDB.yml
        --stack-name cf-sample-maria
        --parameter-overrides
        VPCStackName=cf-sample-vpc
        DBName=<YOUR DB NAME>
        DBUser=<YOUR USER NAME>
        DBPassword=<YOUR USER PASSWORD>
        EngineVersion=<YOUR MARIA DB VERSION>
        DBInstanceClass=db.t3.medium
        AllocatedStorage=20
    ```
- 至 AWS 後台查詢 DB Endpoint，連線至 mariaDB: `mysql -h <DB Endpoint> -u <YOUR USER NAME> -p<YOUR USER PASSWORD>`  
- 刪除資源: `aws --region <YOUR AWS REGION> cloudformation delete-stack --stack-name cf-sample-maria` 

### Aurora Cluster

本範例會建立一個 writer & 一個 reader 組成的 DB Cluster，`parameter-overrides` 裡的參數可自行調整，詳細設定參考 [auroraDBCluster.yml](./auroraDBCluster.yml)

- 部署: 
    ```
    aws --region <YOUR AWS REGION> cloudformation deploy
        --template-file auroraDBCluster.yml
        --stack-name cf-sample-aurora-mysql
        --parameter-overrides
        VPCStackName=cf-sample-vpc
        DBName=<YOUR DB NAME>
        DBUser=<YOUR USER NAME>
        DBPassword=<YOUR USER PASSWORD>
        EngineVersion=8.0.mysql_aurora.3.01.0
    ```
- 至 AWS 後台查詢 Cluster Endpoint，會有 writer 跟 reader 兩個位置，連線至 mysql: `mysql -h <Cluster Endpoint> -u <YOUR USER NAME> -p<YOUR USER PASSWORD>`  
- 刪除資源: `aws --region <YOUR AWS REGION> cloudformation delete-stack --stack-name cf-sample-aurora-mysql` 

### Redis

本範例會建立一個同 VPC 才能連線的 Redis Cluster，`parameter-overrides` 裡的參數可自行調整，詳細設定參考 [redis.yml](./redis.yml)

- 部署: 
    ```
    aws --region <YOUR AWS REGION> cloudformation deploy
        --template-file redis.yml
        --stack-name cf-sample-redis
        --parameter-overrides
        VPCStackName=cf-sample-vpc
        CacheNodeType=cache.t3.small 
    ```
- 請先連線至先前作為 ssh tunnel 的 EC2，安裝 redis-cli，再連到 Redis：`redis-cli -h <Redis Endpoint> -p 6379`
- 刪除資源: `aws --region <YOUR AWS REGION> cloudformation delete-stack --stack-name cf-sample-redis` 

### DocumentDB

本範例會建立一個同 VPC 才能連線的 DocumentDB，`parameter-overrides` 裡的參數可自行調整，詳細設定參考 [documentDB.yml](./documentDB.yml)

- 部署: 
    ```
    aws --region <YOUR AWS REGION> cloudformation deploy
        --template-file documentDB.yml
        --stack-name cf-sample-docdb
        --parameter-overrides
        MasterUser=<YOUR USER NAME>
        MasterPassword=<YOUR USER PASSWORD>
        DBInstanceClass=db.t3.medium
    ```
- 請先連線至先前作為 ssh tunnel 的 EC2，安裝 mongo client，再連到 DocumentDB
- 刪除資源: `aws --region <YOUR AWS REGION> cloudformation delete-stack --stack-name cf-sample-docdb` 

### SES

本範例建立 ConfigurationSet 跟 SES template，[ConfigurationSetEventDestination](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ses-configurationseteventdestination.htmll)可以追蹤某些 event，例如：SES 接收成功並準備發信(send)、成功寄送到對方 mail server(delivery)、接收者打開信件(open)等等，可參考 [CloudWatch Event Destination for Amazon SES Event Publishing](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/event-publishing-add-event-destination-cloudwatch.html#event-publishing-add-event-destination-cloudwatch-add)，有助於分析統計。[SES template](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ses-template.html) 傳送 mail 時指定某個 template 以及帶入相關參數即可，不用在 code 裡頭撰寫制式的 mail 內容。

- 請先進行 [AWS SES domain 驗證](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/verify-domain-procedure.html)，驗證完成才能使用 `@your_domain.com` 去發信，如果是用 route53 管理 domain，至 AWS 後台完成驗證。
- 部署: `aws --region <YOUR AWS REGION> cloudformation deploy --template-file ses.yml --stack-name cf-sample-ses`
- 查看設定:
    - `aws --region <YOUR AWS REGION> ses list-configuration-sets`
    - `aws --region <YOUR AWS REGION> ses list-templates`
- 刪除資源: `aws --region <YOUR AWS REGION> cloudformation delete-stack --stack-name cf-sample-ses` 

### DynamoDB

本範例建立 DynamoDB，詳細設定參考 [dynamodb.yml](./dynamodb.yml)

- 部署: `aws --region <YOUR AWS REGION> cloudformation deploy --template-file dynamodb.yml --stack-name cf-sample-dynamodb`
- 連線 DynamoDB: `aws dynamodb scan --table-name Album --region <YOUR AWS REGION>`
- 刪除資源: `aws --region <YOUR AWS REGION> cloudformation delete-stack --stack-name cf-sample-dynamodb` 

### Lambda

參考 [部署 Lambda](./Lambda-Cron/README.md)


