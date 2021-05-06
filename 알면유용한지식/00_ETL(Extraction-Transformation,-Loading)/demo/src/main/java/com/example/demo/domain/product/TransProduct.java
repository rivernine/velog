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
  private boolean isDiscount;

  public TransProduct(String name, Long price, String created, boolean isDiscount) {
    this.price = price;
    this.name = name;
    this.created = LocalDateTime.parse(created, FORMATTER);
    this.isDiscount = isDiscount;
  }

  public TransProduct(Long id, String name, Long price, String created, boolean isDiscount) {
    this.id = id;
    this.price = price;
    this.name = name;
    this.created = LocalDateTime.parse(created, FORMATTER);
    this.isDiscount = isDiscount;
  }
}
