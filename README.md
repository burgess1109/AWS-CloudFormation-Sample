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
    


## Sample :
- [建立 EC2 和 DB 運行環境](./EC2-DB/README.md)
