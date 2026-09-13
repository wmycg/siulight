package com.suilight.club.milestone.vo;

import com.suilight.club.milestone.entity.Milestone;
import lombok.Data;

import java.time.ZoneId;

@Data
public class MilestoneVO {
    private Long id;
    private String content;
    private String timestamp;
    private String semester;

    public static MilestoneVO from(Milestone milestone) {
        MilestoneVO vo = new MilestoneVO();
        vo.setId(milestone.getId());
        vo.setContent(milestone.getContent());
        vo.setTimestamp(milestone.getCreatedAt()
                .atZone(ZoneId.of("Asia/Shanghai"))
                .toOffsetDateTime()
                .toString());
        vo.setSemester(milestone.getSemester());
        return vo;
    }
}
