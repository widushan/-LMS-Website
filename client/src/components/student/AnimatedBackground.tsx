import React from 'react';

const icons = [
  // Book icon
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
  // Code icon
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>,
  // Lightbulb
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.501-11.3l.001-.01A6.01 6.01 0 0012 1.5a6.01 6.01 0 00-1.502 10.49l.001.01A6.01 6.01 0 0012 12.75zm0 5.25v2.25m-4.5-2.25h9m-9-4.5h9" /></svg>,
  // Academic cap
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147L12 14.64l7.74-4.493m-15.48 0L12 5.655l7.74 4.492m-15.48 0v4.708c0 .645.333 1.243.882 1.583L12 20.44l7.118-4.012c.55-.34.882-.938.882-1.583v-4.708" /></svg>,
  // Pencil
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>,
];

const FloatingElement: React.FC<{
  delay: number;
  duration: number;
  x: string;
  y: string;
  iconIdx: number;
  scale?: number;
}> = ({ delay, duration, x, y, iconIdx, scale = 1 }) => {
  return (
    <div
      className="absolute text-blue-300/40 pointer-events-none"
      style={{
        left: x,
        top: y,
        animation: `float ${duration}s ease-in-out ${delay}s infinite alternate`,
        transform: `scale(${scale})`
      }}
    >
      {icons[iconIdx]}
    </div>
  );
};

const AnimatedBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Drifting blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 blur-[100px] rounded-full animate-drift"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-100/40 blur-[100px] rounded-full animate-drift-slow"></div>

      {/* Decorative Icons */}
      <FloatingElement x="10%" y="20%" delay={0} duration={6} iconIdx={0} scale={1.2} />
      <FloatingElement x="85%" y="15%" delay={1} duration={8} iconIdx={1} scale={0.9} />
      <FloatingElement x="75%" y="60%" delay={2} duration={7} iconIdx={2} scale={1.1} />
      <FloatingElement x="15%" y="75%" delay={3} duration={9} iconIdx={3} scale={0.8} />
      <FloatingElement x="50%" y="10%" delay={4} duration={10} iconIdx={4} scale={1.3} />
      <FloatingElement x="25%" y="45%" delay={0.5} duration={11} iconIdx={1} scale={0.7} />
      <FloatingElement x="90%" y="80%" delay={2.5} duration={7} iconIdx={0} scale={1} />

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(-5deg); }
        }
        @keyframes drift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(100px, 50px); }
        }
        @keyframes drift-slow {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-80px, -40px); }
        }
        .animate-drift {
          animation: drift 20s ease-in-out infinite alternate;
        }
        .animate-drift-slow {
          animation: drift-slow 25s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
};

export default AnimatedBackground;
