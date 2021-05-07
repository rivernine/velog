package com.example.demo.config;

import javax.sql.DataSource;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class DataSourceConfig {
  @Bean(name = "sourceDataSource")
  @Primary
  @ConfigurationProperties(prefix="spring.source-datasource.hikari")
  public DataSource sourceDataSource() {
    return DataSourceBuilder.create().build();
  }

  @Bean(name = "targetDataSource")
  @ConfigurationProperties(prefix="spring.target-datasource.hikari")
  public DataSource targetDataSource() {
    return DataSourceBuilder.create().build();
  }
}
