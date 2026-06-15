package com.example.usermgmt;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.Collator;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

// REST 控制器：实现前端 src/api 约定的全部接口。
// context-path=/api（见 application.properties），所以这里的 /users 实际是 /api/users。
@RestController
public class UserController {

  // 内存数据，和前端 mock 的 8 条种子数据保持一致（含一条 XSS 测试数据）
  private final List<User> users = Collections.synchronizedList(new ArrayList<>(List.of(
      new User(1, "张三", "管理员", "enabled"),
      new User(2, "李四", "运营", "disabled"),
      new User(3, "王五", "客服", "enabled"),
      new User(4, "<img src=x onerror=alert(\"xss\")>", "<button onclick=alert(\"xss\")>恶意角色</button>", "enabled"),
      new User(5, "赵六", "财务", "enabled"),
      new User(6, "孙七", "运营", "disabled"),
      new User(7, "周八", "客服", "enabled"),
      new User(8, "吴九", "管理员", "enabled")
  )));
  private final AtomicInteger nextId = new AtomicInteger(9);

  // POST /api/login —— 校验账号密码，发 token
  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
    if ("admin".equals(body.get("username")) && "123456".equals(body.get("password"))) {
      return ResponseEntity.ok(Map.of("token", "real-token-" + UUID.randomUUID()));
    }
    return ResponseEntity.status(401).build();
  }

  // GET /api/users —— 后端做"筛选 -> 排序 -> 分页"三步，返回 PageResult
  @GetMapping("/users")
  public Map<String, Object> list(
      @RequestParam(defaultValue = "") String keyword,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "5") int pageSize,
      @RequestParam(defaultValue = "") String sort,
      @RequestParam(defaultValue = "asc") String order) {

    List<User> result;
    synchronized (users) {
      result = new ArrayList<>(users);
    }

    // 1) 筛选
    if (!keyword.isBlank()) {
      result = result.stream()
          .filter(u -> u.name().contains(keyword))
          .collect(Collectors.toList());
    }

    // 2) 排序（白名单字段；中文用 Collator 正确排序）
    if (sort.equals("id") || sort.equals("name")) {
      Comparator<User> cmp = sort.equals("id")
          ? Comparator.comparingInt(User::id)
          : Comparator.comparing(User::name, Collator.getInstance(Locale.CHINESE));
      if (order.equals("desc")) {
        cmp = cmp.reversed();
      }
      result.sort(cmp);
    }

    // 3) 分页（total 是筛选后的总数）
    int total = result.size();
    int start = Math.max(0, (page - 1) * pageSize);
    int end = Math.min(total, start + pageSize);
    List<User> pageList = start < end ? new ArrayList<>(result.subList(start, end)) : List.of();

    Map<String, Object> resp = new LinkedHashMap<>();
    resp.put("list", pageList);
    resp.put("total", total);
    resp.put("page", page);
    resp.put("pageSize", pageSize);
    return resp;
  }

  // GET /api/users/{id} —— 单个详情
  @GetMapping("/users/{id}")
  public ResponseEntity<User> get(@PathVariable int id) {
    synchronized (users) {
      return users.stream()
          .filter(u -> u.id() == id)
          .findFirst()
          .map(ResponseEntity::ok)
          .orElseGet(() -> ResponseEntity.status(404).build());
    }
  }

  // POST /api/users —— 新增
  @PostMapping("/users")
  public User create(@RequestBody Map<String, String> body) {
    User u = new User(nextId.getAndIncrement(), body.get("name"), body.get("role"), body.get("status"));
    users.add(u);
    return u;
  }

  // PUT /api/users/{id} —— 更新
  @PutMapping("/users/{id}")
  public ResponseEntity<User> update(@PathVariable int id, @RequestBody Map<String, String> body) {
    synchronized (users) {
      for (int i = 0; i < users.size(); i++) {
        if (users.get(i).id() == id) {
          User u = new User(id, body.get("name"), body.get("role"), body.get("status"));
          users.set(i, u);
          return ResponseEntity.ok(u);
        }
      }
    }
    return ResponseEntity.status(404).build();
  }

  // DELETE /api/users/{id} —— 删除，返回 204 No Content
  @DeleteMapping("/users/{id}")
  public ResponseEntity<Void> delete(@PathVariable int id) {
    synchronized (users) {
      users.removeIf(u -> u.id() == id);
    }
    return ResponseEntity.noContent().build();
  }
}
