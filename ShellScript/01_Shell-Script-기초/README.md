# Shell Script 기초
## 🎁 목차
- [Shell Script 기초](#shell-script-기초)
  - [🎁 목차](#-목차)
  - [0. 개요](#0-개요)
  - [1. Command substitution](#1-command-substitution)
  - [2. Parameter substitution](#2-parameter-substitution)
  - [3. Array](#3-array)
  - [4. Condition](#4-condition)
  - [5. 산술연산](#5-산술연산)
  - [6. Loop](#6-loop)
## 0. 개요
* shell script의 시작은 #!로 한다.
  - 이는 스크립트를 실행할 쉘을 지정하는 선언문이다.
  - 쉘은 bash, dash로 나뉜다.
  - bash
    - `#!/bin/bash`
    - dash에 비해 풍부한 기능과 다양한 문법을 제공한다. (history 등)    
  - dash
    - `#!/bin/sh`
    - bash에 비해 가볍다.
    - 사용자와 상호작용할 수 있는 기능이 적다.
    - bash에서 사용하던 스크립트가 dash에서는 에러를 뱉을 수 있다.
* shell script 파일은 실행 권한이 필요하다
```sh
chmod +x $SHELL_SCRIPT.sh

# 확인
ls -al $SHELL_SCRIPT
```
* 변수의 naming convention은 `UPPERCASE`를 사용한다.        
  
## 1. Command substitution
* `$(command)`로 작성한다.
* `command`를 실행하고, output을 캡쳐하여 command line에 추가한다.

## 2. Parameter substitution
* `${parameter}`로 작성한다.
* {}를 ""로 대체 가능하다.
* `parameter`는 변수 이름을 넣는다.

```bash
# example

animal=cat
echo $animal
# cat
echo ${animal}s
# cats
```
```bash
# example

animal=cat
echo ${#animal}
# 3
echo ${animal/at/ow}
# cow
  ```

## 3. Array
* `arr=(obj1 obj2 obj3 ...)`로 선언한다.
* `arr[@]`는 배열의 모든 원소를 의미한다.
* 원소 추가는 `+=`로 한다.
* `/` 혹은 `unset`을 이용하여 삭제한다.
  - `unset arr[i]` (권고)
  - `arr[@]/obj1`

## 4. Condition
- usage
```sh
if [ condition ]; then ... elif [ condition ]; then ... else fi
```
```sh
# example

if [ ${test} = 2 ]; then
  echo "number is 2"
elif [ ${test} = 3 ]; then
  echo "number is 3"
else
  echo "number is not 2 or 3"
fi
```
## 5. 산술연산
- usage
```sh
if (( operation )); then ... else fi
```
```sh
# example

if (( ${test} > 3 )); then
  echo "number is greater than 3"
else
  echo "number is not greater than 3"
fi
```

## 6. Loop
- while
```sh
while (()); do ... done
```
- for
```sh
for idx in ${arr[@]}; do ... done

for (( i = 0; i < 10; i++ )); do ... done
```