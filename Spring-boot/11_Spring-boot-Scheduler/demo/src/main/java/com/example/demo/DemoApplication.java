package com.example.demo;

import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

// Job = lots of steps
// Step = ItemReader + ItemProcessor + ItemWriter
// ItemReader: 배치데이터를 읽어오는 인터페이스. (DB, file, xml 등)
// ItemProcessor: 읽어온 데이터를 가공/처리.
// ItemWriter: 가공/처리한 데이터를 DB, file 등에 저장. 

// @EnableBatchProcessing		// 배치기능 활성화
@EnableScheduling
@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

}
