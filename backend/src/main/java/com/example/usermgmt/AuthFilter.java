package com.example.usermgmt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// 鉴权过滤器：除了登录接口，其余请求都必须带 Bearer token，否则 401。
// 对应前端 request 层"自动带 Authorization 头"和"401 统一跳登录"。
@Component
public class AuthFilter extends OncePerRequestFilter {

  @Override
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {
    // getServletPath 不含 context-path(/api)，所以登录路径是 /login
    String path = req.getServletPath();
    if ("/login".equals(path)) {
      chain.doFilter(req, res);
      return;
    }

    String auth = req.getHeader("Authorization");
    if (auth == null || !auth.startsWith("Bearer ")) {
      res.setStatus(401);
      return;
    }
    chain.doFilter(req, res);
  }
}
