package com.example.demo.web.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(MockitoExtension.class)
@WebMvcTest
public class HelloControllerTest {
  
  @Autowired
  private MockMvc mvc;

  @Test
  public void return_hello() throws Exception {
    String hello = "hello";

    mvc.perform(get("/hello"))
              .andExpect(status().isOk())
              .andExpect(content().string(hello));
  }
}