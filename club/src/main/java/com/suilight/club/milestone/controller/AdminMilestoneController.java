package com.suilight.club.milestone.controller;

import com.suilight.club.admin.entity.Admin;
import com.suilight.club.admin.service.AdminService;
import com.suilight.club.logs.service.LogService;
import com.suilight.club.milestone.service.MilestoneService;
import com.suilight.club.milestone.vo.MilestoneVO;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/** 管理员查看和清理里程碑留言。 */
@RestController
@RequestMapping("/api/admin/milestones")
public class AdminMilestoneController {

    private final AdminService adminService;
    private final LogService logService;
    private final MilestoneService milestoneService;

    public AdminMilestoneController(
            AdminService adminService,
            LogService logService,
            MilestoneService milestoneService) {
        this.adminService = adminService;
        this.logService = logService;
        this.milestoneService = milestoneService;
    }

    @GetMapping
    public List<MilestoneVO> findAll(HttpSession session) {
        Admin admin = currentAdmin(session);
        logService.record(admin, "查看里程碑列表");
        return milestoneService.findAll().stream().map(MilestoneVO::from).toList();
    }

    @DeleteMapping("/{id}")
    public boolean delete(@PathVariable Long id, HttpSession session) {
        Admin admin = currentAdmin(session);
        boolean success = milestoneService.deleteById(id);
        if (success) {
            logService.record(admin, "删除里程碑（ID:" + id + "）");
        }
        return success;
    }

    private Admin currentAdmin(HttpSession session) {
        Object value = session.getAttribute("adminId");
        if (!(value instanceof Integer id)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "请先登录");
        }
        Admin admin = adminService.findById(id);
        if (admin == null) {
            session.invalidate();
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "管理员不存在");
        }
        return admin;
    }
}
