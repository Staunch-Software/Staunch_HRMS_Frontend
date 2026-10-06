import React, { useState } from 'react';
import styles from './Admin_Login.module.css';
import StaunchLogo from '../../Images/StaunchLogo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { apiLogin } from '../../services/apiClient';

function Admin_Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorUser, setErrorUser] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setErrorUser('');
    setErrorPassword('');

    let isValid = true;

    if (!username.trim()) {
        setErrorUser('Enter your username to continue');
        isValid = false;
    }

    if (!password) {
        setErrorPassword('Enter your password to continue');
        isValid = false;
    }

    if (!isValid) return;

    setSubmitting(true);
    try {
      await apiLogin(username.trim(), password);
      // Hard navigation (not react-router's navigate()) so EmployeeContext/
      // DepartmentContext/etc. remount fresh with the token already in
      // localStorage — they fetch once on mount and don't retry, so a
      // client-side route change right after login would otherwise leave
      // their pre-login failed fetch unresolved until a manual refresh.
      window.location.href = '/app/dashboard';
    } catch (err) {
      setErrorPassword(err.message || 'Invalid username or password');
    } finally {
      setSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.container}>
      <div className={styles.signInForm}>
        <img
          src={StaunchLogo}
          alt="Staunch Logo"
          className={styles.staunchLogo}
        />
        <h1 className={styles.title}>
          <span className={styles.starPart}>Admin</span>Edge
        </h1>
        <p className={styles.accessText}>
          Sign in to get started with Staunch Payroll
        </p>

        <form onSubmit={handleLogin} noValidate>
          <div className={styles.inputGroup}>
            <div className={styles.inputFieldWrapper}>
              <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
              <input
                type="text"
                placeholder="Username"
                className={`${styles.input} ${errorUser ? styles.inputError : ''}`}
                value={username}
                onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorUser) setErrorUser('');
                }}
                aria-invalid={!!errorUser}
                aria-describedby={errorUser ? "username-error" : undefined}
              />
            </div>
            {errorUser && <p id="username-error" className={styles.error}>{errorUser}</p>}
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputFieldWrapper}>
              <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className={`${styles.input} ${errorPassword ? styles.inputError : ''}`}
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorPassword) setErrorPassword('');
                }}
                aria-invalid={!!errorPassword}
                aria-describedby={errorPassword ? "password-error" : undefined}
              />
              <span className={styles.passwordToggle} onClick={togglePasswordVisibility} title={showPassword ? "Hide password" : "Show password"} aria-label={showPassword ? "Hide password" : "Show password"}>
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>
            {errorPassword && <p id="password-error" className={styles.error}>{errorPassword}</p>}
          </div>

          <button type="submit" className={styles.signInButton} disabled={submitting}>
            {submitting ? 'SIGNING IN...' : 'SIGN IN'}
          </button>

          <div className={styles.keepSignedIn}>
            <label>
              <input type="checkbox" />
              Keep me signed in
            </label>
            <a href="/forgot-password" className={styles.forgotPassword}>
              Forgot password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Admin_Login;
