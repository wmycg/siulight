package com.suilight.club.milestone.controller;

import com.suilight.club.milestone.dto.MilestoneCreateRequest;
import com.suilight.club.milestone.entity.Milestone;
import com.suilight.club.milestone.service.MilestoneService;
import com.suilight.club.milestone.vo.MilestoneStatusVO;
import com.suilight.club.milestone.vo.MilestoneVO;
import jakarta.servlet.http.HttpSession;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/milestones")
public class MilestoneController {
    private static final String VISITOR_TOKEN = "milestoneVisitorToken";

    private final MilestoneService milestoneService;

    public MilestoneController(MilestoneService milestoneService) {
        this.milestoneService = milestoneService;
    }

    @GetMapping
    public List<MilestoneVO> findAll() {
        return milestoneService.findAll().stream().map(MilestoneVO::from).toList();
    }

    @GetMapping("/status")
    public MilestoneStatusVO status(HttpSession session) {
        String visitorToken = visitorToken(session);
        return new MilestoneStatusVO(
                milestoneService.currentSemester(),
                milestoneService.hasPosted(visitorToken));
    }

    @PostMapping
    public MilestoneVO create(@RequestBody MilestoneCreateRequest request, HttpSession session) {
        try {
            Milestone milestone = milestoneService.create(
                    visitorToken(session), request == null ? null : request.getContent());
            return MilestoneVO.from(milestone);
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "本学期已经留过言", exception);
        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, exception.getMessage(), exception);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage(), exception);
        }
    }

    private String visitorToken(HttpSession session) {
        Object existing = session.getAttribute(VISITOR_TOKEN);
        if (existing instanceof String token && !token.isBlank()) {
            return token;
        }
        String token = UUID.randomUUID().toString();
        session.setAttribute(VISITOR_TOKEN, token);
        return token;
    }
}
