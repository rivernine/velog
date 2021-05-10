package com.example.demo.domain.product;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@ToString
@Getter
@Setter
@NoArgsConstructor
public class TransProduct {
  private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm:ss");

  private Long id;
  private String name;
  private Long price;
  private LocalDateTime created;
  private boolean discount;

  public TransProduct(String name, Long price, String created, boolean discount) {
    this.price = price;
    this.name = name;
    this.created = LocalDateTime.parse(created, FORMATTER);
    this.discount = discount;
  }

  public TransProduct(String name, Long price, LocalDateTime created, boolean discount) {
    this.price = price;
    this.name = name;
    this.created = created;
    this.discount = discount;
  }

  public TransProduct(Long id, String name, Long price, String created, boolean discount) {
    this.id = id;
    this.price = price;
    this.name = name;
    this.created = LocalDateTime.parse(created, FORMATTER);
    this.discount = discount;
  }
}
