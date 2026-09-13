package com.suilight.club.milestone.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.spring.service.impl.ServiceImpl;
import com.suilight.club.milestone.entity.Milestone;
import com.suilight.club.milestone.mapper.MilestoneMapper;
import com.suilight.club.milestone.service.MilestoneService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class MilestoneServiceImpl extends ServiceImpl<MilestoneMapper, Milestone>
        implements MilestoneService {

    private static final ZoneId PROJECT_ZONE = ZoneId.of("Asia/Shanghai");

    @Override
    public List<Milestone> findAll() {
        return list(new LambdaQueryWrapper<Milestone>().orderByAsc(Milestone::getCreatedAt));
    }

    @Override
    public Milestone create(String visitorToken, String content) {
        if (visitorToken == null || visitorToken.isBlank()) {
            throw new IllegalArgumentException("访客会话无效");
        }
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("铭文内容不能为空");
        }
        if (content.length() > 200) {
            throw new IllegalArgumentException("铭文不能超过 200 个字符");
        }
        if (hasPosted(visitorToken)) {
            throw new IllegalStateException("本学期已经留过言");
        }

        Milestone milestone = new Milestone();
        milestone.setVisitorToken(visitorToken);
        milestone.setContent(content.trim());
        milestone.setCreatedAt(LocalDateTime.now(PROJECT_ZONE));
        milestone.setSemester(currentSemester());
        save(milestone);
        return milestone;
    }

    @Override
    public boolean deleteById(Long id) {
        return removeById(id);
    }

    @Override
    public boolean hasPosted(String visitorToken) {
        return count(new LambdaQueryWrapper<Milestone>()
                .eq(Milestone::getVisitorToken, visitorToken)
                .eq(Milestone::getSemester, currentSemester())) > 0;
    }

    @Override
    public String currentSemester() {
        LocalDate today = LocalDate.now(PROJECT_ZONE);
        return today.getYear() + (today.getMonthValue() <= 6 ? "-春季" : "-秋季");
    }
}
