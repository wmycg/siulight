package com.suilight.club.milestone.service;

import com.suilight.club.milestone.entity.Milestone;

import java.util.List;

public interface MilestoneService {
    List<Milestone> findAll();

    Milestone create(String visitorToken, String content);

    boolean deleteById(Long id);

    boolean hasPosted(String visitorToken);

    String currentSemester();
}
