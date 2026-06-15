package com.example.usermgmt;

// 用户实体。record 自动生成构造器/getter/equals，Jackson 直接按字段名序列化成 JSON。
// 字段与前端 src/types/user.ts 的 User 完全对齐。
public record User(Integer id, String name, String role, String status) {}
