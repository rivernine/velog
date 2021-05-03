# Jenkins
## 개요
* Jenkins에서 host의 docker.sock을 사용할 수 있다.
* Jenkins는 jdk8까지 지원한다.

## Declarative vs Scripted
### Declarative 
* sample code
  ```Jenkinsfile
  pipeline {
    stages {
      stage("Build"){
        steps{
          echo "build..."
        }
      }
      stage("Test"){
        steps{
          echo "test..."
        }
      }
    }
  }
  ```
### Scripted
* sample code
  ```Jenkinsfile
  node{
    stage("Build"){
      echo "build..."
    }
    stage(Test"){
      echo "test..."
    }
  }
  ```
### Declarative의 우수성
1. Pipeline의 유효성 검사
   - Pipeline이 시작할 때 코드의 유효성 검사를 제공한다.
2. Stage단계에서의 재시작
   - 특정 stage부터 시작을 할 수 있다. (불필요한 stage skip 가능)
3. Options
   - options{}를 사용하여 Scripted에 비해여 가독성을 높여준다.
4. When
   - when{}을 사용하여 Scripted에 비하여 가독성을 높여준다.

## Agent
* Jenkins는 Master와 Agent로 구성되어 있다.
  * Master
    * Jenkins에 대한 모든 권한을 가지고 있음.
    * Agent를 관리하고 Job을 agent에게 할당한다.
  * Node
    * Job을 실행할 수 있는 서버
    * Master, Agent 모두 node라고 할 수 잇다.
  * Agent
    * Master에서 구성하는 시스템이다.
  * Executor
    * Node에서 job을 실행하는 장소

## Syntax
### Pipeline
* Declarative 선언
### Section
* agent
  * agnet 정의
  * any, none, label, node, docker, dockerfile, kubernetes 등
* post
  * stage 혹은 pipeline이 시작되기 전/후에 실행 될 block
  * always, changed, fixed, regression, aborted, failure, success 등
* stages
  * 하나 이상의 stage 모음
* steps
  * stage 내부에서 실행되는 단계
  * shell script
    * bash shell을 사용하고자 할때는 반드시 `#!/bin/bash`를 가장 첫줄에 적어주어야 한다.
    * example
      ```Jenkinsfile
      steps {
        sh ''' #!/bin/bash
        echo "test"
        '''
      }
      ```
* example
  ```jenkinsfile
  pipeline {
    agent any
    stages {
        stage('Example') {
            steps {
                echo 'Hello World'
            }
        }
    }
    post { 
        always { 
            echo 'I will always say Hello again!'
        }
    }
  }
  ```
### Directives
* environment
  * 파이프라인 내부에서 사용할 환경 변수
* options
  * pipeline의 옵션을 선택적으로 포함 시킬 수 있음
  * timeout, timestamps, parallelsAlwaysFailFast 등
* parameters
  * 사용자가 제공해야할 변수 선언
* triggers
  * pipeline을 다시 트리거해야 하는 자동화된 방법 정의
* tools
  * 설치도구 정의(agents none 시 무시)
* input
  * stage에 사용하면 입력하라는 메시지를 표시할 수 있음
* example
  ```Jenkinsfile
  pipeline {
    agent any
    environment { 
        CC = 'clang'
    }
    options {
        timeout(time: 1, unit: 'HOURS') 
    }
    parameters{

    }
    triggers {
        cron('H */4 * * 1-5')
    }
    tools {
        maven 'apache-maven-3.0.1' 
    }
    stages {        
        stage('Example') {
            environment { 
                CC = 'clang'
            }
            input {
                message "Should we continue?"
                ok "Yes, we should."
                submitter "alice,bob"
                parameters {
                    string(name: 'PERSON', defaultValue: 'Mr Jenkins', description: 'Who should I say hello to?')
                }
            }
            steps {
                echo "Hello, ${PERSON}, nice to meet you."
            }
        }
    }
  }
  ```

## 실행
### 순차적 실행
* example
  ```Jenkinsfile
  pipeline {
    agent none
    stages {
        stage('Non-Sequential Stage') {
            agent {
                label 'for-non-sequential'
            }
            steps {
                echo "On Non-Sequential Stage"
            }
        }
        stage('Sequential') {
            agent {
                label 'for-sequential'
            }
            environment {
                FOR_SEQUENTIAL = "some-value"
            }
            stages {
                stage('In Sequential 1') {
                    steps {
                        echo "In Sequential 1"
                    }
                }
                stage('In Sequential 2') {
                    steps {
                        echo "In Sequential 2"
                    }
                }
                stage('Parallel In Sequential') {
                    parallel {
                        stage('In Parallel 1') {
                            steps {
                                echo "In Parallel 1"
                            }
                        }
                        stage('In Parallel 2') {
                            steps {
                                echo "In Parallel 2"
                            }
                        }
                    }
                }
            }
        }
    }
  }
  ```
### 평행 실행
* example
  ```Jenkinsfile
  pipeline {
    agent any
    stages {
        stage('Non-Parallel Stage') {
            steps {
                echo 'This stage will be executed first.'
            }
        }
        stage('Parallel Stage') {
            when {
                branch 'master'
            }
            failFast true
            parallel {
                stage('Branch A') {
                    agent {
                        label "for-branch-a"
                    }
                    steps {
                        echo "On Branch A"
                    }
                }
                stage('Branch B') {
                    agent {
                        label "for-branch-b"
                    }
                    steps {
                        echo "On Branch B"
                    }
                }
                stage('Branch C') {
                    agent {
                        label "for-branch-c"
                    }
                    stages {
                        stage('Nested 1') {
                            steps {
                                echo "In stage Nested 1 within Branch C"
                            }
                        }
                        stage('Nested 2') {
                            steps {
                                echo "In stage Nested 2 within Branch C"
                            }
                        }
                    }
                }
            }
        }
    }
  }
  ```
