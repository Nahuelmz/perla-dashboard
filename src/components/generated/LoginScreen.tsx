import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { T } from './mockData';
const DM_SANS = "'DM Sans', ui-sans-serif, system-ui, sans-serif";
const CARD_SHADOW = '0 8px 40px rgba(27,45,59,0.12), 0 1px 2px rgba(0,0,0,0.06)';
const GoogleIcon = () => <svg width="17" height="17" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
  </svg>;
const AppleIcon = () => <svg width="17" height="17" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M13.117 9.558c-.02-2.018 1.648-2.992 1.723-3.04-.94-1.374-2.4-1.562-2.92-1.58-1.24-.126-2.43.733-3.06.733-.63 0-1.6-.718-2.635-.698-1.347.02-2.6.788-3.294 1.993-1.41 2.44-.36 6.05 1.006 8.026.67.963 1.468 2.044 2.516 2.006 1.01-.04 1.392-.648 2.614-.648 1.222 0 1.57.648 2.635.628 1.09-.018 1.78-.977 2.445-1.944.77-1.115 1.088-2.194 1.107-2.25-.024-.01-2.12-.814-2.138-3.226ZM11.07 3.378c.558-.678.934-1.617.832-2.554-.806.033-1.78.537-2.358 1.215-.52.6-.973 1.558-.851 2.477.9.07 1.816-.457 2.377-1.138Z" fill="white" />
  </svg>;
type LoginScreenProps = {
  onLogin: () => void;
};
export const LoginScreen = ({
  onLogin
}: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const inputStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: '0.75rem',
    padding: '10px 14px',
    fontSize: '13px',
    fontWeight: 400,
    fontFamily: DM_SANS,
    background: 'rgba(0,0,0,0.025)',
    border: `1px solid ${T.border}`,
    color: T.text,
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s'
  };
  return <div className="w-full h-full flex items-center justify-center p-4" style={{
    backgroundImage: 'url(/serubg2.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    fontFamily: DM_SANS
  }}>
      <motion.div initial={{
      opacity: 0,
      y: 14
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1]
    }} className="relative w-full rounded-3xl p-8" style={{
      maxWidth: '400px',
      background: 'rgba(255,255,255,0.72)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      boxShadow: CARD_SHADOW,
      border: '1px solid rgba(255,255,255,0.55)'
    }}>
        {/* Logo badge + wordmark */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 flex items-center justify-center rounded-2xl shrink-0 text-white text-[15px] font-bold tracking-tight" style={{
          background: 'linear-gradient(135deg, #6b8f7e, #a0bfb3)',
          boxShadow: '0 4px 14px rgba(107,143,126,0.28)',
          fontFamily: DM_SANS
        }}>
            TB
          </div>
          <div>
            <p className="text-[18px] leading-tight" style={{
            color: T.text,
            fontFamily: DM_SANS,
            fontWeight: 600
          }}>
              <span>Turno</span>
              <span style={{
              color: T.orange
            }}>Bot</span>
            </p>
            <p className="text-[11px] leading-tight mt-0.5" style={{
            color: T.text3,
            fontWeight: 400
          }}>
              Gestión de turnos
            </p>
          </div>
        </div>

        <h1 className="text-[21px] leading-tight mb-1" style={{
        color: T.text,
        fontWeight: 400
      }}>
          Iniciá sesión
        </h1>
        <p className="text-[13px] mb-7" style={{
        color: T.text2,
        fontWeight: 400
      }}>
          Gestioná tus turnos desde cualquier lugar
        </p>

        {/* Social buttons */}
        <div className="space-y-2.5 mb-6">
          <button onClick={onLogin} className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-[13px] transition-all hover:bg-black/[0.03] active:scale-[0.98]" style={{
          background: '#fff',
          border: `1px solid ${T.border}`,
          color: T.text,
          fontWeight: 400,
          fontFamily: DM_SANS
        }}>
            <GoogleIcon /><span>Continuar con Google</span>
          </button>
          <button onClick={onLogin} className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-[13px] transition-all hover:opacity-85 active:scale-[0.98]" style={{
          background: '#1a1a1a',
          color: '#fff',
          fontWeight: 400,
          fontFamily: DM_SANS
        }}>
            <AppleIcon /><span>Continuar con Apple</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6" aria-hidden="true">
          <div className="flex-1 h-px" style={{
          background: T.border
        }} />
          <span className="text-[11px]" style={{
          color: T.text3,
          fontWeight: 400
        }}>o</span>
          <div className="flex-1 h-px" style={{
          background: T.border
        }} />
        </div>

        {/* Form */}
        <div className="space-y-3.5 mb-5">
          <div>
            <label className="text-[11px] uppercase tracking-wider mb-1.5 block" style={{
            color: T.text3,
            fontWeight: 400,
            letterSpacing: '0.08em'
          }}>
              Email
            </label>
            <input type="email" placeholder="hola@tunegocio.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} autoComplete="email" />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider mb-1.5 block" style={{
            color: T.text3,
            fontWeight: 400,
            letterSpacing: '0.08em'
          }}>
              Contraseña
            </label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} autoComplete="current-password" />
          </div>
        </div>

        {/* CTA */}
        <button onClick={onLogin} className="w-full py-3 rounded-xl text-[13px] text-white transition-all hover:opacity-90 active:scale-[0.98] mb-5" style={{
        background: '#2C5F8A',
        boxShadow: '0 4px 16px rgba(44,95,138,0.22)',
        fontWeight: 400,
        fontFamily: DM_SANS,
        letterSpacing: '0.01em'
      }}>
          Iniciar sesión
        </button>

        <p className="text-center text-[13px]" style={{
        color: T.text2,
        fontWeight: 400
      }}>
          <span>¿No tenés cuenta? </span>
          <button onClick={onLogin} className="underline-offset-2 hover:underline transition-colors" style={{
          color: '#2C5F8A',
          fontWeight: 400
        }}>
            Registrate
          </button>
        </p>
      </motion.div>
    </div>;
};
export default LoginScreen;