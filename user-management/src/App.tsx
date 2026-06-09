import type {
  CreateUserRequest,
  FetchUsersParams,
  UpdateUserRequest,
  UserVO
} from './types/user';

const demoUser: UserVO = {
  id: 1,
  name: '张三',
  role: '管理员',
  status: 'enabled'
};

const demoCreateRequest: CreateUserRequest = {
  name: '李四',
  role: '运营',
  status: 'disabled'
};

const demoUpdateRequest: UpdateUserRequest = {
  id: demoUser.id,
  name: demoCreateRequest.name,
  role: demoCreateRequest.role,
  status: demoCreateRequest.status
};

const demoFetchParams: FetchUsersParams = {
  keyword: '张',
  shouldFail: false
};

function App() {
  const statusText = demoUser.status === 'enabled' ? '启用' : '禁用';

  return (
    <main className="page">
      <section className="panel">
        <p className="eyebrow">Vite + React + TypeScript</p>
        <h1>用户管理项目骨架</h1>
        <p className="description">
          当前已完成工程化初始化，并先落地用户管理相关 TypeScript 类型。
        </p>

        <div className="type-grid">
          <div>
            <span className="label">UserVO</span>
            <strong>{demoUser.name}</strong>
            <p>{demoUser.role} / {statusText}</p>
          </div>
          <div>
            <span className="label">CreateUserRequest</span>
            <strong>{demoCreateRequest.name}</strong>
            <p>{demoCreateRequest.role}</p>
          </div>
          <div>
            <span className="label">UpdateUserRequest</span>
            <strong>ID: {demoUpdateRequest.id}</strong>
            <p>{demoUpdateRequest.status}</p>
          </div>
          <div>
            <span className="label">FetchUsersParams</span>
            <strong>{demoFetchParams.keyword}</strong>
            <p>shouldFail: {String(demoFetchParams.shouldFail)}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
