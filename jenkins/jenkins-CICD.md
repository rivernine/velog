# CICD
## Start
* Gitlab과 jenkins를 이용하여 빌드/배포 자동화를 구성한다.

## Scenario
1. Push to gitlab develop branch
2. Allow merge request
3. Build / Deploy

## 1. Allow webhook configuration
1. Login administrator (Gitlab)
2. Click configuration icon
3. Setting -> Network -> Outbound requests
-> Check the `Allow requests to the local network from web hooks and services`

## 2. Create gitlab repository
1. Create gitlab repository
2. Create `master`, `develop` branch

## 3. Create new pipeline
1. Jenkins -> New Item -> Enter an item name -> Pipeline -> OK
2. Build Triggers Tab -> Check the `Build when a change is pushed to GitLab. GitLab webhook URL ` -> 고급 -> Secret token의 Generate 클릭
**( GitLab webhook URL과 Secret token을 후에 사용할 것임 )**
1. Pipeline Tab -> `Pipeline script from SCM` -> SCM의 `Git` 선택-> gitlab repository URL 입력-> Credentials의 `Jenkins` 선택 -> Username, Password 입력 -> Add -> 방금 만든 Credentials 선택
2. Branches to build 입력 (Branch를 특정하고 싶은 경우)
3. Script Path 입력
4. 저장

## 4. Set webhook
1. Gitlab repository -> Settings -> Webhooks
2. URL, Secret Token 입력 (3-2 참고)
3. Trigger 선택 (Merge request events)
4. Add webhook 클릭
5. 생성된 Project Hooks에서 Test를 진행

## 5. Merge
1. Develop branch에 push
2. Gitlab에서 merge request 생성, merge
3. Jenkins에서 확인