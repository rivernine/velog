package com.rivernine.cryptogenerator.upbitApiTest;

import com.google.gson.JsonObject;
import com.google.gson.Gson;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.client.RestTemplate;

@ExtendWith(MockitoExtension.class)
@SpringBootTest
public class UpbitApiTest {  

  
  @Test
  public void getMarketsTest() {
    RestTemplate restTemplate = new RestTemplate();
    Gson gson = new Gson();

    String jsonString = restTemplate.getForObject("https://api.upbit.com/v1/ticker?markets=KRW-BTC", String.class);
    JsonObject[] jsonObjectArray = gson.fromJson(jsonString, JsonObject[].class);

    System.out.println(jsonObjectArray[0].toString());
  }
}
