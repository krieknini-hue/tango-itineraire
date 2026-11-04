import React, { useState } from 'react';
import { X, Smartphone, KeyRound, LogOut, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BandoneonIcon } from './FileteadoOrnaments';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMembership: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onOpenMembership }) => {
  const { user, isAuthenticated, sendOtp, verifyOtp, logout } = useAuth();
  
  const [phone, setPhone] = useState(user?.phone || '06 12 34 56 78');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success' | 'info'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    const res = await sendOtp(phone);
    setIsLoading(false);

    if (res.success) {
      setStep('otp');
      setFeedback({
        type: 'info',
        message: `${res.message} ${res.demoCode ? `(Code démo : ${res.demoCode})` : ''}`,
      });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    const res = await verifyOtp(phone, code);
    setIsLoading(false);

    if (res.success) {
      setFeedback({ type: 'success', message: 'Connexion réussie !' });
      setTimeout(() => {
        onClose();
        setStep('phone');
      }, 700);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Code incorrect.' });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-[#1b1210] w-full max-w-md rounded-2xl shadow-2xl border-2 border-[#d4af37]/60 overflow-hidden text-[#f7f2e7]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* En-tête salon 1950 */}
        <div className="bg-[#120b0a] text-[#fce59e] px-5 py-4 flex items-center justify-between border-b border-[#d4af37]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#241311] border border-[#d4af37] flex items-center justify-center">
              <BandoneonIcon className="w-4 h-4 text-[#f5d77f]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm tracking-wider uppercase">Espace Danseur Nomade</h3>
              <p className="text-[11px] font-serif-tango italic text-amber-200/70">Authentification mobile sans mot de passe</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-amber-200/60 hover:text-[#f5d77f] hover:bg-[#241714] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps */}
        <div className="p-6">
          {isAuthenticated && user ? (
            // Vue Utilisateur Connecté
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3.5 bg-[#150d0b] rounded-xl border border-[#d4af37]/30">
                <div className="w-10 h-10 rounded-full bg-[#8e1c2e] text-[#fce59e] border border-[#d4af37]/50 flex items-center justify-center font-bold text-sm font-mono">
                  {user.phone.slice(-4)}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#f7f2e7] font-mono">{user.phone}</p>
                  <p className="text-xs text-amber-200/70 font-serif-tango">
                    Statut :{' '}
                    <span className="font-semibold text-emerald-400 not-italic">
                      {user.isCotisationPaid
                        ? 'Cotisation 2026/2027 validée ✓'
                        : `Bêta Découverte (${user.daysRemainingInTrial}j restants)`}
                    </span>
                  </p>
                </div>
              </div>

              {/* Bouton Cotisation 2 € */}
              <div className="bg-[#211210] border border-[#d4af37]/40 rounded-xl p-3.5 text-xs text-amber-100 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#f5d77f] font-serif-tango">
                  <Sparkles className="w-4 h-4 text-[#d4af37]" />
                  <span>Cotisation annuelle Association : 2 € / an</span>
                </div>
                <p className="text-[11px] text-amber-200/70">
                  Soutenez l'infrastructure cartographique indépendante et la charte zéro faux plan.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenMembership();
                  }}
                  className="w-full mt-1 py-2 px-3 bg-gradient-to-r from-[#8e1c2e] to-[#731221] hover:from-[#aa2137] hover:to-[#8e1c2e] text-[#fce59e] border border-[#d4af37]/60 font-bold rounded-lg text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  Gérer ma cotisation (2 €)
                </button>
              </div>

              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-amber-200/40 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-[#d4af37]/60" /> Données sécurisées
                </span>
                <button
                  onClick={async () => {
                    await logout();
                    setStep('phone');
                  }}
                  className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Se déconnecter
                </button>
              </div>
            </div>
          ) : step === 'phone' ? (
            // Étape 1 : Saisie Téléphone
            <form onSubmit={handleSend} className="space-y-4">
              <div className="text-xs space-y-1">
                <p className="font-bold text-[#f5d77f] text-sm">Connexion rapide par SMS</p>
                <p className="text-amber-200/70">
                  Pas de mot de passe à mémoriser sur la route. Vous recevez un code unique à 6 chiffres par SMS.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wide text-amber-200/90 mb-1">
                  Numéro de téléphone mobile
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-[#d4af37] absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="06 12 34 56 78"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-[#120b0a] border border-[#d4af37]/40 rounded-xl text-[#f7f2e7] placeholder-amber-200/30 focus:border-[#d4af37] outline-none font-mono"
                    required
                  />
                </div>
              </div>

              {feedback && (
                <div
                  className={`text-xs p-2.5 rounded-lg border ${
                    feedback.type === 'error'
                      ? 'bg-[#3a0d14] border-rose-500/50 text-rose-200'
                      : 'bg-[#12242d] border-[#5b8ea6]/60 text-cyan-200'
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#8e1c2e] to-[#731221] hover:from-[#aa2137] hover:to-[#8e1c2e] text-[#fce59e] border border-[#d4af37] font-display font-bold text-xs uppercase tracking-wide rounded-xl transition cursor-pointer shadow-md disabled:opacity-50"
              >
                {isLoading ? 'Envoi du code...' : 'Recevoir mon code SMS'}
              </button>
            </form>
          ) : (
            // Étape 2 : Saisie Code OTP
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="text-xs space-y-1">
                <p className="font-bold text-[#f5d77f] text-sm">Vérification du code</p>
                <p className="text-amber-200/70">
                  Entrez le code reçu au <span className="font-semibold text-[#f7f2e7] font-mono">{phone}</span>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wide text-amber-200/90 mb-1">
                  Code SMS (6 chiffres)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#d4af37] absolute left-3 top-3" />
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    className="w-full pl-9 pr-3 py-2 text-center tracking-widest font-mono text-base font-bold bg-[#120b0a] border border-[#d4af37]/40 rounded-xl text-[#f5d77f] focus:border-[#d4af37] outline-none"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {feedback && (
                <div
                  className={`text-xs p-2.5 rounded-lg border ${
                    feedback.type === 'error'
                      ? 'bg-[#3a0d14] border-rose-500/50 text-rose-200'
                      : feedback.type === 'success'
                      ? 'bg-[#122a1f] border-emerald-500/50 text-emerald-200'
                      : 'bg-[#12242d] border-[#5b8ea6]/60 text-cyan-200'
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#8e1c2e] to-[#731221] hover:from-[#aa2137] hover:to-[#8e1c2e] text-[#fce59e] border border-[#d4af37] font-display font-bold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer shadow-md disabled:opacity-50"
              >
                {isLoading ? 'Vérification...' : 'Valider et se connecter'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-xs text-amber-200/60 hover:text-[#f5d77f] underline cursor-pointer"
                >
                  Modifier le numéro de mobile
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
