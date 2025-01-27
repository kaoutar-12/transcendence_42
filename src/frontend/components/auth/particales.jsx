import { useEffect, useState, memo } from 'react';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const ParticlesBackground = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesOptions = {
    autoPlay: true,
    background: {
      color: {
        value: "#000"
      },
    },
    fullScreen: {
      enable: false,
      zIndex: 0
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onClick: {
          enable: false,
        },
        onHover: {
          enable: true,
          mode: 'repulse',
        },
        resize: {
          enable: false,
        },
      },
    },
    particles: {
      color: {
        value: "#ff0000"
      },
      links: {
        color: "#ffffff",
        distance: 300,
        enable: true,
        opacity: 0.5,
        width: 1
      },
      move: {
        direction: "none",
        enable: true,
        
        random: false,
        speed: 2,
        straight: false
      },
      number: {
        density: {
          enable: true,
          area: 800
        },
        value: 140
      },
      opacity: {
        value: 0.5
      },
      shape: {
        type: "circle"
      },
      size: {
        value: { min: 1, max: 3 }
      }
    },
    detectRetina: true
  };

  return init ? (
    <div className="absolute inset-0 pointer-events-none w-full h-full" style={{ zIndex: 0 }}>
      <Particles
        id="tsparticles"
        options={particlesOptions}
        className='w-full h-full'
      />
    </div>
  ) : null;
};

export default memo(ParticlesBackground);