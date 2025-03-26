// src/components/AdminLoginPage/Admin_Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Admin_Login.module.css';
import StaunchLogo from '../../Images/StaunchLogo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function Admin_Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [errorUser, setErrorUser] = useState(''); // Error for Username
  const [errorPassword, setErrorPassword] = useState(''); // Error for Password
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Reset Error Messages
    setErrorUser('');
    setErrorPassword('');

    let isValid = true;

    if (!username) {
        setErrorUser('Enter your username to continue');
        isValid = false;
    }

    if (!password) {
        setErrorPassword('Enter your password to continue');
        isValid = false;
    }
    // **Replace with your actual authentication logic!**

    if (isValid) {
        if (username !== 'admin') {
            setErrorUser('Invalid Username');
            isValid = false;
        } 

        if (password !== 'password') {
            setErrorPassword('Password Does Not Match');
            isValid = false;
        }

        if (isValid) {
          // Simulate successful login
          localStorage.setItem('isLoggedIn', 'true');  // Store login status
          navigate('/dashboard');   // Redirect to dashboard
        }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}></header>

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

        <form onSubmit={handleLogin}>
          
          <div className={styles.inputGroup}>
            <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
            <input
              type="text"
              placeholder="Username"
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {errorUser && <p className={styles.error}>{errorUser}</p>} 
          </div>

          <div className={styles.inputGroup}>
            <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className={styles.passwordToggle} onClick={togglePasswordVisibility}>
              {showPassword ? (
                <FontAwesomeIcon icon={faEyeSlash} />
              ) : (
                <FontAwesomeIcon icon={faEye} />
              )}
            </span>
            {errorPassword && <p className={styles.error}>{errorPassword}</p>} 
          </div>

          <button type="submit" className={styles.signInButton}>
            SIGN IN
          </button>

          <div className={styles.keepSignedIn}>
            <label>
              <input type="checkbox" />
              Keep me signed in
            </label>
            <a href="#" className={styles.forgotPassword}>
              Forgot password?
            </a>
          </div>
        </form>

        {/* <div className={styles.signUpLink}>
          Don't have a Staunch account? <a href="#">Sign up now</a>
        </div> */}
      </div>
    </div>
  );
}

export default Admin_Login;