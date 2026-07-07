import { FormEvent, useEffect, useMemo, useState } from 'react';
import { login, register, verifyMfa } from './api/authApi';
import { getProfile, updateProfile } from './api/userDataApi';
import { AUTH_API_URL, TOKEN_STORAGE_KEY, USER_DATA_API_URL } from './api/config';
import type { UserProfile } from './types';

type AuthMode = 'login' | 'register';

type MfaState = {
  challengeId: string;
  mfaType?: string | null;
};

const emptyProfileForm = {
  nickname: '',
  avatarUrl: '',
  headerUrl: '',
  phoneNumber: ''
};

export function App() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaState, setMfaState] = useState<MfaState | null>(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || '');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isAuthorized = Boolean(token);

  const apiInfo = useMemo(
    () => [
      { label: 'Auth API', value: AUTH_API_URL },
      { label: 'User Data API', value: USER_DATA_API_URL }
    ],
    []
  );

  useEffect(() => {
    if (!token) {
      setProfile(null);
      return;
    }
    void loadProfile(token);
  }, [token]);

  async function loadProfile(accessToken = token) {
    setLoading(true);
    setError('');
    try {
      const loadedProfile = await getProfile(accessToken);
      setProfile(loadedProfile);
      setProfileForm({
        nickname: loadedProfile.nickname || '',
        avatarUrl: loadedProfile.avatarUrl || '',
        headerUrl: loadedProfile.headerUrl || '',
        phoneNumber: loadedProfile.phoneNumber || ''
      });
    } catch (caught) {
      setError(toMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      if (mode === 'register') {
        await register({ email, password });
        setMessage('Аккаунт создан. Теперь можно войти. Профиль в user-data-service создан автоматически.');
        setMode('login');
        return;
      }

      const response = await login({ email, password });
      if (response.mfaRequired && response.challengeId) {
        setMfaState({ challengeId: response.challengeId, mfaType: response.mfaType });
        setMessage(`Нужен MFA-код (${response.mfaType || 'MFA'}). Challenge создан.`);
        return;
      }
      if (response.token) {
        saveToken(response.token);
        setMessage('Вход выполнен. Загружаю профиль.');
      }
    } catch (caught) {
      setError(toMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  async function submitMfa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mfaState?.challengeId) {
      setError('Нет активного MFA challenge. Повтори вход.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await verifyMfa(mfaState.challengeId, mfaCode);
      if (response.token) {
        saveToken(response.token);
        setMfaState(null);
        setMfaCode('');
        setMessage('MFA подтверждена. Вход выполнен.');
      }
    } catch (caught) {
      setError(toMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setError('Нет access token. Сначала войди.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const updatedProfile = await updateProfile(token, normalizeProfileForm(profileForm));
      setProfile(updatedProfile);
      setMessage('Профиль обновлён.');
    } catch (caught) {
      setError(toMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  function saveToken(accessToken: string) {
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    setToken(accessToken);
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken('');
    setProfile(null);
    setMfaState(null);
    setMessage('Вы вышли.');
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Donatay MVP</p>
          <h1>Локальная проверка auth-service + user-data-service</h1>
          <p className="hero-text">
            Эта версия клиента уже разделяет auth и профильные данные по разным backend-сервисам.
          </p>
        </div>
        <div className="api-grid">
          {apiInfo.map((item) => (
            <div className="api-pill" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      {message && <div className="notice success">{message}</div>}
      {error && <div className="notice error">{error}</div>}

      {!isAuthorized && !mfaState && (
        <section className="panel auth-panel">
          <div className="tabs">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
              Вход
            </button>
            <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
              Регистрация
            </button>
          </div>

          <form onSubmit={submitAuth} className="form-stack">
            <label>
              Email
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
            </label>
            <label>
              Пароль
              <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={6} required />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? 'Подожди...' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
            </button>
          </form>
        </section>
      )}

      {!isAuthorized && mfaState && (
        <section className="panel auth-panel">
          <p className="eyebrow">MFA challenge</p>
          <h2>Подтверждение входа</h2>
          <p className="muted">Тип: {mfaState.mfaType || 'MFA'}</p>
          <p className="muted mono">challengeId: {mfaState.challengeId}</p>
          <form onSubmit={submitMfa} className="form-stack">
            <label>
              Код
              <input value={mfaCode} onChange={(event) => setMfaCode(event.target.value)} inputMode="numeric" required />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? 'Проверяю...' : 'Подтвердить MFA'}
            </button>
            <button type="button" className="secondary" onClick={() => setMfaState(null)}>
              Вернуться к логину
            </button>
          </form>
        </section>
      )}

      {isAuthorized && (
        <section className="dashboard-grid">
          <article className="panel profile-card">
            <div className="profile-header" style={{ backgroundImage: profile?.headerUrl ? `url(${profile.headerUrl})` : undefined }} />
            <div className="profile-body">
              <div className="avatar">{profile?.avatarUrl ? <img src={profile.avatarUrl} alt="avatar" /> : <span>{profile?.email?.[0]?.toUpperCase() || 'U'}</span>}</div>
              <div>
                <p className="eyebrow">Профиль</p>
                <h2>{profile?.nickname || 'Без никнейма'}</h2>
                <p className="muted">{profile?.email}</p>
                <p className="muted mono">{profile?.uuid}</p>
              </div>
            </div>
          </article>

          <article className="panel">
            <div className="panel-title-row">
              <h2>Редактирование профиля</h2>
              <button className="secondary" onClick={logout}>Выйти</button>
            </div>
            <form onSubmit={submitProfile} className="form-stack">
              <label>
                Никнейм
                <input value={profileForm.nickname} onChange={(event) => setProfileForm({ ...profileForm, nickname: event.target.value })} />
              </label>
              <label>
                Avatar URL
                <input value={profileForm.avatarUrl} onChange={(event) => setProfileForm({ ...profileForm, avatarUrl: event.target.value })} />
              </label>
              <label>
                Header URL
                <input value={profileForm.headerUrl} onChange={(event) => setProfileForm({ ...profileForm, headerUrl: event.target.value })} />
              </label>
              <label>
                Телефон
                <input value={profileForm.phoneNumber} onChange={(event) => setProfileForm({ ...profileForm, phoneNumber: event.target.value })} />
              </label>
              <button type="submit" disabled={loading}>{loading ? 'Сохраняю...' : 'Сохранить профиль'}</button>
              <button type="button" className="secondary" onClick={() => void loadProfile()} disabled={loading}>Перезагрузить профиль</button>
            </form>
          </article>
        </section>
      )}
    </main>
  );
}

function normalizeProfileForm(form: typeof emptyProfileForm) {
  return {
    nickname: form.nickname || undefined,
    avatarUrl: form.avatarUrl || undefined,
    headerUrl: form.headerUrl || undefined,
    phoneNumber: form.phoneNumber || undefined
  };
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Неизвестная ошибка';
}
