# Data Analysis

## Kaggle
[Kaggle](https://www.kaggle.com/)에는 다양한 data를 csv파일로 제공한다.
데이터 분석의 샘플데이터로 이용하기 정말 좋다.

### Kaggle api
다양한 csv파일 다운로드 하는 일은 식은 죽 먹기이다.
더 나아가 linux에서 wget이나 curl로 다운로드를 하고싶은 욕구가 생기기도 한다.
이를 해결하기 위해 Kaggle api를 사용할 것이다. 

#### 1. pip
`pip`가 존재하지 않는다면 설치해준다
```sh
$ sudo apt-get install python-pip3
```

#### 2. Kaggle
pip로 kaggle을 설치한다.
```sh
$ pip3 install --user kaggle
```

#### 3. check
제대로 설치되었는지 확인해본다.
```sh
$ kaggle dataset -h
```

#### 3-1. troubleshooting
만일 `kaggle: command not found`에러가 발생하면 python binary 폴더를 PATH에 추가한다.
```sh
$ sudo vim ~/.profile

PATH=$PATH:$HOME.local/bin/kaggle
```

#### 4. Download csv
```sh
# kaggle datasets download <owner>/<dataset-name>
$ kaggle datasets download mkechinov/ecommerce-behavior-data-from-multi-category-store

Downloading ecommerce-behavior-data-from-multi-category-store.zip to /home/cbecdbadm
100%|███████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████▊| 4.29G/4.29G [01:38<00:00, 57.2MB/s]
100%|████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████| 4.29G/4.29G [01:38<00:00, 46.7MB/s]
```
