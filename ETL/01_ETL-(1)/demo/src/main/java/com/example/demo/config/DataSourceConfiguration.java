package com.example.demo.config;

import javax.sql.DataSource;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class DataSourceConfiguration {
  @Bean(name = "dataSource-dbsource")
  @Primary
  @ConfigurationProperties(prefix="spring.datasource-dbsource.hikari")
  public DataSource dataSourceDbSource() {
    return DataSourceBuilder.create().build();
  }

  @Bean(name = "dataSource-dbtarget")
  @ConfigurationProperties(prefix="spring.datasource-dbtarget.hikari")
  public DataSource dataSourceDbTarget() {
    return DataSourceBuilder.create().build();
  }
}
