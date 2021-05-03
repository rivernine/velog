# [Jenkins] how to use agent

## start
- Jenkins는 master, agent 구조이다.
  - Master
    - jenkins의 모든 권한을 가지고 있다.
    - agent를 관리하고 agent에게 할당한다.
  - Agent
    - master에 의해 관리되는 서버이다.

## create (with SSH)
1. Install plugin (`SSH Build Agents plugin`)
2. Jenkins -> Jenkins 관리 -> 노드 관리 -> 신규 노드
3. 노드명 입력 -> `Permanent Agent` 체크
4. 내용 입력
   1. `# of executors` : 동시 수행할 job의 개수
   2. `Remote root directory` : agent가 실행될 폴더
   3. `Labels` : pipeline에서 호출핧 agent label
   4. `Launch method` : Launch agents via SSH
      1. `Host` : 연결할 서버 ip
      2. `Credentials` : `Add`를 클릭하여 연결할 서버 계정의 credential 생성
      3. `Host Key Verification Strategy` : Non verifying Verification Strategy


## Usage
```Jenkinsfile
pipeline {
  agent {
    node {
      label '$AGENT_LABELS'
    }
  }
}
```