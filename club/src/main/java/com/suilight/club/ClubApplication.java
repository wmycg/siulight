package com.suilight.club;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan({
        "com.suilight.club.admin.mapper",
        "com.suilight.club.events.mapper",
        "com.suilight.club.submit.mapper",
        "com.suilight.club.logs.mapper",
        "com.suilight.club.milestone.mapper"
})
public class ClubApplication {

    public static void main(String[] args) {
        SpringApplication.run(ClubApplication.class, args);
    }

}
