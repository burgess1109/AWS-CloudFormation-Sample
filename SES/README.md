# 建立 SES ConfigurationSet & Mail Template

本範例是建立 ConfigurationSet 跟 SES template
- [ConfigurationSetEventDestination](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ses-configurationseteventdestination.htmll)可以追蹤某些 event，例如：SES 接收成功並準備發信(send)、成功寄送到對方 mail server(delivery)、接收者打開信件(open)等等，可參考 [CloudWatch Event Destination for Amazon SES Event Publishing](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/event-publishing-add-event-destination-cloudwatch.html#event-publishing-add-event-destination-cloudwatch-add)，有助於分析統計。
- [SES template](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ses-template.html)，傳送 mail 時指定某個 template 以及帶入相關參數即可，不用在 code 裡頭撰寫制式的 mail 內容。

1. SES domain 驗證
    請先進行 [AWS SES domain 驗證](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/verify-domain-procedure.html)，驗證完成才能使用 `@your_domain.com` 去發信，如果是用 route53 管理 domain，基本上手指點一點就能完成驗證了。

2. 部署 SES 設定
    ```
    aws --region us-east-1 cloudformation deploy --template-file ses-template.yml --stack-name cf-ses-sample --profile <Your profile name>
    ```

    - template-file : 執行佈署的 template 檔案
    - stack-name : cloudformation stack 名稱
    - profile : AWS credentials 的 profile name

    注意 region 必須在[有 SES 服務的 region](https://docs.aws.amazon.com/general/latest/gr/ses.html)

3. 建立完成
    - 查詢 configuration sets 即可看到剛剛部署的設定
    ```
    aws --region us-east-1 ses list-configuration-sets --profile <Your profile name>
    ```
    - 查詢 mail templates 即可看到剛剛部署的 template
    ```
    aws --region us-east-1 ses list-templates --profile <Your profile name>
    ```

4. 刪除 stack

    刪除 stack 會把之前透過 CloudFormation 佈署的所有服務也移除。
    
    ```
    aws cloudformation delete-stack --stack-name cf-ses-sample --profile <Your profile name>
    ```




