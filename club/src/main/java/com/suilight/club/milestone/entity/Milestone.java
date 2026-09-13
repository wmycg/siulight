package com.suilight.club.milestone.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("milestones")
public class Milestone {
    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("visitor_token")
    private String visitorToken;

    private String content;

    @TableField("created_at")
    private LocalDateTime createdAt;

    private String semester;
}
