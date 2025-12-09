import { useState, useEffect } from 'react';
import './LoadingScreen.css';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Atualiza o progresso gradualmente em 7 segundos
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + (100 / 70); // 70 intervalos de 100ms = 7 segundos
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-screen">
      <div className="loading-content">
        {/* Logo/Imagem - placeholder que pode ser substituído */}
        <div className="loading-logo">
          <div className="loading-icon">💅</div>
          <h1>Vitória Nail Designer</h1>
        </div>

        {/* Animação de unhas */}
        <div className="loading-animation">
          <div className="nail nail-1"></div>
          <div className="nail nail-2"></div>
          <div className="nail nail-3"></div>
          <div className="nail nail-4"></div>
          <div className="nail nail-5"></div>
        </div>

        {/* Barra de progresso */}
        <div className="loading-progress-container">
          <div className="loading-progress-bar">
            <div 
              className="loading-progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="loading-progress-text">{Math.round(progress)}%</span>
        </div>

        <p className="loading-message">Preparando sua experiência...</p>
      </div>
    </div>
  );
}
