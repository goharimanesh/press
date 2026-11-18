/* =====================================================================
   MODEL REGISTRY — the only file you edit to add a model to the showcase
   ---------------------------------------------------------------------
   1. Put the model in its own folder:   models/<id>/index.html
   2. Optional extras in the same folder:
        cover.svg  (or cover.png / cover.jpg — set "cover" below)
        podcast.mp3 (also .m4a .aac .ogg .opus .wav .webm) → plays automatically
   3. Add an entry to "models" below (copy an existing one).
   This is a plain .js file (not JSON) so the site also works when you
   open index.html directly from your laptop (file://), without a server.
   ===================================================================== */
window.SHOWCASE = {
  title: 'Interactive Research Showcase',
  institution: 'Department of Mechanical Engineering · University of Torbat Heydarieh',

  labs: {
    arcslab: {
      name: 'ARCSLAB',
      short: 'ARCSLAB',
      full: 'Advanced Robotics and Control Systems Laboratory',
      tagline: 'Advancing soft and continuum robotics',
      blurb: 'Robots that bend rather than rotate: slender continuum manipulators and compliant soft machines, with the modelling, sensing and control that make them precise and safe.',
      url: 'https://goharimanesh.github.io/arcslab/',
      people: [['Founder', 'Dr. Masoud Goharimanesh'], ['Co-founder', 'Dr. Ali Koochi']],
      areas: ['Continuum robots', 'Soft robots & PneuNets', 'Cosserat rod models', 'Reinforcement learning', 'Physics-informed neural networks', 'SOFA & MuJoCo', 'Vehicle dynamics', '3D printing'],
      mark: 'assets/img/arcslab-mark.svg'
    },
    sss: {
      name: 'SSSLAB',
      short: 'S³ Lab',
      full: 'Smart Small Systems Laboratory',
      tagline: 'From non-classical mechanics to smart micro/nano systems',
      blurb: 'Simulating, predicting and controlling ultra-small systems, and turning those models into shared assets: open code, datasets, simulators and digital twins.',
      motto: 'Small Systems · Big Ideas · Greater Impact',
      url: 'https://akoochi.github.io/SSS-Lab/',
      people: [['Founder', 'Dr. Ali Koochi'], ['Co-founder', 'Dr. Masoud Goharimanesh']],
      areas: ['Pull-in & electromechanical instability', 'Casimir & van der Waals forces', 'Non-classical continuum theories', 'Surface elasticity', 'Nanotweezers & nanoresonators', 'Graphene & MXene devices', 'PINNs, RL & digital twins', 'MEMS/NEMS sensing'],
      mark: 'assets/img/sss-mark.svg'
    }
  },

  models: [
    {
      id: 's3-cnw-nanotweezer-twin',
      lab: 'sss',
      title: 'Electrostatic Carbon-Nanowire Nanotweezer',
      subtitle: 'Interactive 3D digital twin',
      authors: ['Faeze Kavianpour', 'Mohammad Reza Gharib', 'Ali Koochi', 'Masoud Goharimanesh'],
      venue: '2nd Int. & 8th National Conf. on Mechanical-Civil Eng. & Advanced Technologies, University of Esfarayen',
      language: 'English',
      abstract: 'Two free-standing carbon nanowires (L = 19.6 µm, φ = 0.3 µm, g₀ = 6.9 µm) grow from Au/Si microelectrodes on an SOI chip, reproducing the Chang et al. (2009) nanotweezer. Each arm is an Euler–Bernoulli cantilever (24 Hermite elements) loaded by the exact cylinder–cylinder electrostatic force. Tip-displacement control traces both the stable and the unstable branch, and the model is calibrated to the 3D COMSOL pull-in of 99.4 V (experiment: 101 V).',
      features: ['Voltage sweep through pull-in and back (hysteresis)', 'Micro-particle grasping between the tips', 'Live parametric study of L, φ, g₀ and E', 'Exact electric-field lines with charge flow', 'Webcam hand-gesture control', 'Presentation mode, PNG snapshot & CSV export'],
      tags: ['NEMS', 'Pull-in', 'FEM', 'Digital twin', 'Three.js', 'MediaPipe'],
      cover: 'cover.svg',
      entry: 'index.html',
      podcast: null          // null = auto-detect podcast.mp3 / .m4a / … in the folder
    },
    {
      id: 's3-fgm-tapered-nanotweezer',
      lab: 'sss',
      title: 'Tapered FGM Nanotweezer',
      subtitle: 'Live equilibrium-path solver with gesture control',
      authors: ['Yousef Karimi', 'Ali Koochi', 'Masoud Goharimanesh'],
      venue: 'University of Torbat Heydarieh',
      language: 'Persian (فارسی)',
      abstract: 'Two tapered cantilever arms made of a functionally graded material (metal root → ceramic tip, power-law modulus) with modified couple-stress size effects, Gurtin–Murdoch surface elasticity, fringing-field electrostatics and the Casimir force. A Hermite FEM solver (40 graded elements, 6-point Gauss) with displacement-controlled Newton–Raphson runs in the browser on every parameter change, and is validated against GDQ and PINN results.',
      features: ['Full equilibrium path, stable and unstable branches, solved live', 'Six design presets: convergent, straight, needle, divergent, PINN', 'Taper, FGM index, modulus ratio, size, Casimir and surface parameters', 'FGM colour map from metal to ceramic', 'MediaPipe pinch-to-actuate hand control', 'Validation table inside the model'],
      tags: ['FGM', 'Couple stress', 'Casimir', 'Surface effects', 'FEM', 'MediaPipe'],
      cover: 'cover.svg',
      entry: 'index.html',
      podcast: null
    },
    {
      id: 'arcs-continuum-arm-demo',
      lab: 'arcslab',
      title: 'Constant-Curvature Continuum Arm',
      subtitle: 'Interactive kinematics and ∞-path tracking',
      authors: ['ARCSLAB'],
      venue: 'Lab demo model · starting point for new ARCSLAB models',
      language: 'English',
      abstract: 'A three-section planar tendon-driven continuum robot described by the piecewise-constant-curvature model. Bend each section by hand, let damped-least-squares inverse kinematics track a figure-eight (∞) trajectory, or drag the target with the pointer, and watch the tendon displacements and the tracking error update live.',
      features: ['Piecewise-constant-curvature forward kinematics', 'Damped-least-squares inverse kinematics', 'Figure-eight trajectory tracking with live error plot', 'Pointer-following mode', 'Tendon displacement readouts', 'Reachable-workspace cloud'],
      tags: ['Continuum robot', 'PCC model', 'Inverse kinematics', 'Tendon-driven', 'Canvas'],
      cover: 'cover.svg',
      entry: 'index.html',
      podcast: null
    }
  ]
};
