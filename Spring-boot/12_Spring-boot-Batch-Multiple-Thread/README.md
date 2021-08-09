# Spring-boot-Batch-Multiple-Thread

## 🎁 Contents
- [Spring-boot-Batch-Multiple-Thread](#spring-boot-batch-multiple-thread)
  - [🎁 Contents](#-contents)
  - [0. Summary](#0-summary)

## 0. Summary
Spring batch를 사용하여 ETL을 돌리던 중, 10,000건의 데이터처리에 약 1분정도의 시간이 소요된다는 것을 발견하였다.
`uptime`, `nmon`등을 통해 리소스들을 확인해본 결과 놀고있는 자원들이 꽤나 많았다.
타 서비스에 영향을 덜 줄 것이니 안정성 측면에서는 기특한 녀석이지만.. 
batch 전용 서버에서라면 얘기가 다르다.

이러한 이유로 Spring batch를 멀티스레드로 돌리는 방법을 기술하고자 한다.


---
**모든 소스는 [Github](https://github.com/rivernine/velog/)에 올려놓았다.**