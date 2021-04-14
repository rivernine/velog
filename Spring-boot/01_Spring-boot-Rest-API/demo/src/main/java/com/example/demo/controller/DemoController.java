package com.example.demo.controller;

@Controller 
public class HelloController { 
    @RequestMapping("/") 
    @ResponseBody 
    public String index() { 
        return "Hello, Spring"; 
        } 
    }
