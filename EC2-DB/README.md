# 建立 EC2 和 DB 運行環境

這是一個建置 EC2 與 DB(RDS or Aurora)的服務範例，讓 EC2 可以連線到 DB。

1. 請先建立一組 [EC2 Key Pairs](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html)，在本機 執行 EC2 SSH 登入時會用到，可以使用 console 介面或使用 AWS CLI 的 [`aws ec2 create-key-pair`](https://docs.aws.amazon.com/cli/latest/reference/ec2/create-key-pair.html) 指令建立金鑰。請妥善保存金鑰。
2. 佈署 EC2
    ```
    aws cloudformation deploy --template-file ec2-template.yml --stack-name cf-ec2-sample --profile <Your profile name> --parameter-overrides KeyName=<Your Key Name>
    ```
    - template-file : 執行佈署的 template 檔案
    - stack-name : cloudformation stack 名稱
    - profile : AWS credentials 的 profile name
    - KeyName : 步驟 1 所建立的 Key Pairs 名稱

3. 部署 DB

    以下可選襗佈署的儲存庫:
    
    **佈署 RDS-MySQL**
    
    ```
    aws cloudformation deploy --template-file rds-mysql-template.yml --stack-name cf-mysql-sample --profile <Your profile name> --parameter-overrides DBUser=<DB User> DBPassword=<DB Password> EC2SecurityGroup=ec2-access-test
    ```
    
    - template-file : 執行佈署的 template 檔案
    - stack-name : cloudformation stack 名稱
    - profile : AWS credentials 的 profile name
    - DBUser : DB 使用者
    - DBPassword : DB 密碼
    - EC2SecurityGroup : 允許存取的 Security Group，這裡指定上一步驟 EC2 建立的 Security Group，讓 DB 允許 EC2 連入
   
    **佈署 Aurora-MySQL**
    
    ```
    aws cloudformation deploy --template-file aurora-mysql-template.yml --stack-name cf-aurora-sample --profile <Your profile name> --parameter-overrides DBUser=<DB User> DBPassword=<DB Password> EC2SecurityGroup=ec2-access-test
    ```
    
    - template-file : 執行佈署的 template 檔案
    - stack-name : cloudformation stack 名稱
    - profile : AWS credentials 的 profile name
    - DBUser : DB 使用者
    - DBPassword : DB 密碼
    - EC2SecurityGroup : 允許存取的 Security Group，這裡指定上一步驟 EC2 建立的 Security Group，讓 DB 允許 EC2 連入
    
    **佈署 ElasticCache Redis**
    
    ```
    aws cloudformation deploy --template-file cache-redis-template.yml --stack-name cf-redis-sample --profile <Your profile name> --parameter-overrides EC2SecurityGroup=ec2-access-test
    ```
   
    - template-file : 執行佈署的 template 檔案
    - stack-name : cloudformation stack 名稱
    - profile : AWS credentials 的 profile name
    - EC2SecurityGroup : 允許存取的 Security Group，這裡指定上一步驟 EC2 建立的 Security Group，讓 Redis 允許 EC2 連入
   
    

4. 建立完成
    
    到 [AWS console](https://console.aws.amazon.com) 的相關 service，即可看到正在運行的 EC2 or RDS 服務。
    
    - 連線到 EC2
    
    ```
    ssh -i <步驟 1 的金鑰檔案位置> <EC2 endpoint>
    ```
    
    - EC2 連線到 DB
    ```
    sudo su root
    yum install mysql
    mysql -h <DB endpoint> -u <DB 使用者> -p<DB 密碼>
    ```
   
    - EC2 連線到 Redis
        - 安裝 redis-cli
        - 進入 redis
        ```
        redis-cli -h <Redis endpoint> -p 6379
        ```

5. 刪除 stack

    刪除 stack 會把之前透過 CloudFormation 佈署的所有服務也移除。
    
    ```
    aws cloudformation delete-stack --stack-name cf-aurora-sample --profile <Your profile name>
    aws cloudformation delete-stack --stack-name cf-mysql-sample --profile <Your profile name>
    aws cloudformation delete-stack --stack-name cf-redis-sample  --profile <Your profile name>
    aws cloudformation delete-stack --stack-name cf-ec2-sample  --profile <Your profile name>
    ```

