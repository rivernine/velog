# Shell Script Syntax
## 🎁 목차
- [Shell Script Syntax](#shell-script-syntax)
  - [🎁 목차](#-목차)
  - [Syntax](#syntax)
## Syntax
* 문자열 split
  - example
    ```sh
    echo "My name is Jack" | awk -F' ' '{print $1,$2,$3}'
    ```
* exit n
  - 현재 쉘을 종료한다. 종료시 n값을 리턴한다.
* import
  - 다른 shell script를 import한다.
  - example
    ```sh
    source ./scripts/example.sh    
    # 또는
    . ./scripts/example.sh    
    ```
* 문자열 치환
  - `tr`
  - `sed` : 좀 더 세부적인 컨트롤이 필요할 때
    - example
      ```sh
      echo "hi" | sed 's/hi/hello/' 	# hello
      echo "hi hi" | sed 's/hi/hello/' 	# hello hi
      echo "hi hi" | sed 's/hi/hello/g' 	# hello hello
      echo "hello" | sed 's/hello/& world/g'	# hello world (`&`는 패턴 매칭된 부분을 의미)
      ```
* 문자열 존재 여부
  - `=~`
* 출력을 한 줄로 구분
  - ```sh
    IFS=$'\n' ARR=(`df`)
    echo ${ARR[@]}
    ```
  - ```sh
    #/bin/bash
    IFS=$'\n'
    GREPS=(`ls -al`)
    IFS=$''
    ```
* single quote `'` 안에서 변수 사용
  - ```sh
    VAR="HELLO"
    echo 'This is test $VAR'
    echo 'This is test '"$VAR"'

    # 출력
    # This is test $VAR
    # This is test HELLO
    ```
* `[[]]`와 `[]`의 차이
  - ```sh
    # 위 둘은 같은 코드이다.
    # [[]]는 변수에 ""를 쓸 필요가 없다
    [ "$foo" = bar ] 
    [[ $foo = bar ]]
    ```
* 문자열 + 숫자
  - ```sh
    $(($STRING_NUM) + 1)
    ```
* 출력 색 바꾸기
  - ```sh
    echo -e "\n\033[4;31mLight Colors\033[0m  \t\t\033[1;4;31mDark Colors\033[0m" 
    echo -e "\e[0;30;47m Black    \e[0m 0;30m \t\e[1;30;40m Dark Gray  \e[0m 1;30m"
    echo -e "\e[0;31;47m Red      \e[0m 0;31m \t\e[1;31;40m Dark Red   \e[0m 1;31m"
    echo -e "\e[0;32;47m Green    \e[0m 0;32m \t\e[1;32;40m Dark Green \e[0m 1;32m"
    echo -e "\e[0;33;47m Brown    \e[0m 0;33m \t\e[1;33;40m Yellow     \e[0m 1;33m"
    echo -e "\e[0;34;47m Blue     \e[0m 0;34m \t\e[1;34;40m Dark Blue  \e[0m 1;34m"
    echo -e "\e[0;35;47m Magenta  \e[0m 0;35m \t\e[1;35;40m DarkMagenta\e[0m 1;35m"
    echo -e "\e[0;36;47m Cyan     \e[0m 0;36m \t\e[1;36;40m Dark Cyan  \e[0m 1;36m"
    echo -e "\e[0;37;47m LightGray\e[0m 0;37m \t\e[1;37;40m White      \e[0m 1;37m"
    ```
* 파일 사이즈 0으로 만들기
  - `cat /dev/null > file`    

