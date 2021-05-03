# Jenkins plugin

## Simple theme
UI를 material 스타일로 바꿔준다.
특히나 Console output이 마음에 든다.

### 1.1 Install plugin
* 플러그인 관리를 들어간다.
![](./1.png)

![](./2.png)

`설치 가능`탭을 누르고 `simple theme`을 검색한다.
`Simple Theme Plugin`에 체크를 하고 **설치 후 재시작**을 한다.

### 1.2. Apply theme
다운로드 한 플러그인을 적용한다.

* `Jenkins 관리`의 `시스템 설정`메뉴를 선택한다.
![](./3.png)

* 하단의 `Theme`탭에서 `CSS URL`을 추가한다.
![](./4.png)

* 원하는 색상을 선택하고, 다음 url을 입력한다.
```sh
https://cdn.rawgit.com/afonsof/jenkins-material-theme/gh-pages/dist/material-{{your-color-name}}.css
```
![](./5.png)
![](./6.png)

### 1.3. Check
적용된 테마를 확인한다.
![](./7.png)