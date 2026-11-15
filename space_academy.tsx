import React, { useState, useEffect, useMemo } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, firebaseReady } from './firebase';
import { 
  Rocket, Map, Users, Settings, Award, ChevronRight, CheckCircle2, 
  AlertTriangle, Zap, Shield, Cpu, Activity, Flag, Undo2, Star, 
  Crosshair, Battery, Droplet, User, Radio, Flame, Sparkles, Navigation,
  Moon, Sun, Orbit, Satellite, Database, Check,
  BookOpen, FlaskConical, Lightbulb, Brain, Trophy, Play, Info,
  GraduationCap, X, ChevronLeft
} from 'lucide-react';

async function apiRequest(path, options = {}) {
  const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) },
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || 'The request could not be completed.');
  }
  return response.status === 204 ? null : response.json();
}

function AuthScreen({ loading }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (!firebaseReady || !auth) throw new Error('Firebase is not configured yet. Add the Firebase web app settings before signing in.');
      const credential = mode === 'register'
        ? await createUserWithEmailAndPassword(auth, email.trim(), password)
        : await signInWithEmailAndPassword(auth, email.trim(), password);
      void credential;
    } catch (requestError) {
      const messages = {
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/invalid-credential': 'Email or password is incorrect.',
        'auth/invalid-email': 'Enter a valid email address.',
        'auth/weak-password': 'Use a stronger password with at least 12 characters.',
        'auth/too-many-requests': 'Too many attempts. Wait a while and try again.',
      };
      setError(messages[requestError.code] || requestError.message || 'Could not sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) return <div className="min-h-screen bg-slate-950 text-slate-300 grid place-items-center">Checking your session…</div>;
  return (
    <main className="min-h-screen bg-[#050914] text-white flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.16]" style={{ backgroundImage: 'radial-gradient(circle, #b8d9ff 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      <div className="relative w-full max-w-5xl min-h-[620px] grid lg:grid-cols-[1.08fr_0.92fr] border border-slate-800 bg-[#080e1c] shadow-2xl shadow-black/50">
        <section className="relative min-h-64 lg:min-h-full overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800 p-8 sm:p-12 flex flex-col justify-between">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_20%_75%,rgba(8,145,178,0.13),transparent_52%)]" />
          <div className="relative flex items-center gap-3 text-cyan-200"><Rocket size={30}/><span className="font-black tracking-tight">SPACE QUEST</span></div>
          <div className="relative py-8"><div className="text-8xl text-center mb-8" aria-hidden="true">🪐</div><p className="text-sm text-cyan-300 mb-3">Your next mission starts here.</p><h1 className="text-3xl sm:text-4xl font-black leading-tight max-w-md">Keep your place among the stars.</h1><p className="text-slate-400 mt-4 max-w-sm leading-relaxed">Sign in to pick up your missions, progress, and discoveries.</p></div>
          <p className="relative text-xs text-slate-600">Space Quest · Mission Control</p>
        </section>
        <section className="p-7 sm:p-12 flex flex-col justify-center">
          <p className="text-xs text-slate-500 mb-3">COMMANDER ACCOUNT</p><h2 className="text-2xl sm:text-3xl font-bold">{mode === 'login' ? 'Sign in' : 'Create your account'}</h2>
          <p className="text-sm text-slate-400 mt-2 mb-8">{mode === 'login' ? 'Enter your details to continue.' : 'Your mission records will be saved to this account.'}</p>
          {error && <div role="alert" className="mb-5 border-l-2 border-red-400 bg-red-950/40 px-4 py-3 text-sm text-red-200">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block text-sm font-semibold text-slate-300">Email address<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} className="mt-2 w-full border-b border-slate-700 bg-slate-900/50 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:bg-slate-900" placeholder="you@example.com"/></label>
            <label className="block text-sm font-semibold text-slate-300">Password<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={mode === 'register' ? 12 : undefined} maxLength={128} value={password} onChange={event => setPassword(event.target.value)} className="mt-2 w-full border-b border-slate-700 bg-slate-900/50 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:bg-slate-900" placeholder={mode === 'register' ? 'At least 12 characters' : 'Enter your password'}/></label>
            {mode === 'register' && <p className="-mt-3 text-xs text-slate-500">Use 12–128 characters.</p>}
            <button disabled={submitting} className="w-full mt-2 bg-cyan-500 px-5 py-3.5 font-bold text-slate-950 transition-colors hover:bg-cyan-300 disabled:opacity-50">{submitting ? 'Please wait…' : mode === 'login' ? 'Sign in to Space Quest' : 'Create account'}</button>
          </form>
          <div className="mt-7 text-sm text-slate-500">{mode === 'login' ? 'New to Space Quest?' : 'Already have an account?'}{' '}<button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} className="font-bold text-cyan-300 hover:text-cyan-100">{mode === 'login' ? 'Create an account' : 'Sign in'}</button></div>
        </section>
      </div>
    </main>
  );
}

// ==========================================
// CONSTANTS & DATABASE
// ==========================================

// --- NEW EDUCATIONAL DATABASE ---
const COMPONENT_EDU = {
  engine_chem: {
    kids: "Chemical engines push the rocket up using fire! They mix fuel and spark it to throw hot gas out the back. This pushes the rocket forward!",
    explorer: "Chemical engines rely on Newton's Third Law (action and reaction). They mix a liquid fuel with an oxidizer to create a controlled, high-pressure explosion. The expanding gas shoots out the nozzle, creating massive thrust.",
    fact: "The Saturn V rocket engines burned 15 tons of fuel per second!"
  },
  engine_ion: {
    kids: "Ion drives don't use fire. They use electricity to shoot out tiny invisible particles (ions) super fast. They push gently but can run for years!",
    explorer: "Ion thrusters use electrical power to accelerate ions (charged atoms) to extremely high speeds. They have very low thrust but incredible fuel efficiency (Specific Impulse), making them perfect for deep space.",
    fact: "The Dawn spacecraft used an ion drive to visit two different asteroids."
  },
  util_solar: {
    kids: "Solar panels catch sunlight and turn it into electricity to power the spaceship's computers and heaters.",
    explorer: "Photovoltaic (solar) arrays convert photons from the Sun directly into electrical voltage. Their effectiveness drops significantly the further you travel from the Sun (like past Mars).",
    fact: "The International Space Station has solar arrays that cover an area as big as a football field."
  },
  tank_large: {
    kids: "Cryo-tanks are like super-thermos flasks. They keep rocket fuel freezing cold so it stays liquid instead of turning into gas.",
    explorer: "Cryogenic tanks store propellants like liquid hydrogen and liquid oxygen at extremely low temperatures (below -150°C). They require complex insulation but offer the highest performance for rockets.",
    fact: "Liquid hydrogen is so cold it can freeze air solid!"
  },
  cmd_probe: {
    kids: "A probe is a robot brain. It doesn't need air, food, or water, so it's perfect for exploring dangerous places humans can't go yet.",
    explorer: "Unmanned probes use sophisticated AI, radiation-hardened computers, and automated navigation. They remove the massive weight penalty of human life support systems.",
    fact: "Voyager 1 is a probe that has left our solar system and is flying in interstellar space!"
  }
};

const PRE_LAUNCH_EDU = {
  'Moon': {
    lesson: "The Moon is Earth's only natural satellite. It has only 1/6th of Earth's gravity, meaning you could jump six times higher! Because it has no atmosphere, there is no wind or weather, so astronauts' footprints from 50 years ago are still there.",
    question: "Why do astronauts' footprints stay on the Moon forever?",
    options: ["Because the dirt is sticky", "Because there is no wind or weather", "Because of low gravity"],
    answer: 1
  },
  'Mars': {
    lesson: "Mars is called the Red Planet because its surface is covered in iron oxide (rust). It has a very thin atmosphere mostly made of carbon dioxide. Scientists are exploring Mars with rovers to see if ancient microscopic life ever existed in its dried-up rivers.",
    question: "What makes Mars look red?",
    options: ["Red clouds in the sky", "Lava from volcanoes", "Iron oxide (rust) on the surface"],
    answer: 2
  }
};

const REAL_MISSIONS = [
  { 
    name: 'Apollo 11', year: '1969', agency: 'NASA', 
    desc: 'The first mission to land humans on the Moon. Neil Armstrong and Buzz Aldrin walked on the lunar surface, proving human spaceflight beyond Earth was possible.',
    details: 'Commanded by Neil Armstrong, with Lunar Module Pilot Buzz Aldrin and Command Module Pilot Michael Collins. It fulfilled President John F. Kennedy\'s national goal to land a man on the Moon by the end of the 1960s.', 
    tech: ['Saturn V Rocket', 'Lunar Module (Eagle)', 'Command Module (Columbia)'], 
    discoveries: ['First humans on another celestial body', 'Brought back 21.5 kg of lunar rocks', 'Proved human spaceflight beyond Earth orbit was possible'] 
  },
  { 
    name: 'Voyager 1', year: '1977', agency: 'NASA', 
    desc: 'A robotic probe that took close-up pictures of Jupiter and Saturn. It is now the most distant human-made object, traveling through interstellar space.',
    details: 'Launched in 1977 to take advantage of a rare planetary alignment, Voyager 1 explored the outer planets and their major moons. It carries the Golden Record, a message from humanity to the cosmos.', 
    tech: ['Radioisotope Thermoelectric Generators (RTGs)', 'High-Gain Antenna', 'Golden Record'], 
    discoveries: ['Active volcanoes on Jupiter\'s moon Io', 'Detailed structure of Saturn\'s rings', 'First human object in interstellar space'] 
  },
  { 
    name: 'Perseverance', year: '2020', agency: 'NASA', 
    desc: 'A car-sized rover currently exploring Jezero Crater on Mars, looking for signs of ancient microbial life and collecting rock samples.',
    details: 'Perseverance carries advanced scientific instruments and the Ingenuity Mars Helicopter, which performed the first powered flight on another planet. It is currently packing samples for a future return mission to Earth.', 
    tech: ['Nuclear Power System (MMRTG)', 'Ingenuity Helicopter', 'MOXIE (Oxygen Generator)'], 
    discoveries: ['Evidence of an ancient Martian lake', 'Successfully produced oxygen from Martian CO2', 'First powered flight on Mars via Ingenuity'] 
  },
  { 
    name: 'Chandrayaan-3', year: '2023', agency: 'ISRO', 
    desc: 'Made India the first country to successfully land a spacecraft near the rugged south pole of the Moon.',
    details: 'Consisted of a Lander (Vikram) and a Rover (Pragyan). The mission aimed to explore the lunar south pole, a region that is believed to hold water ice in permanently shadowed craters.', 
    tech: ['LVM3 Launch Vehicle', 'Vikram Lander', 'Pragyan Rover'], 
    discoveries: ['Confirmed presence of sulfur on the Moon', 'First landing near lunar south pole', 'Measured temperature profiles of lunar topsoil'] 
  }
];

const MISSIONS = [
  { id: 'moon', title: 'Moon Explorer', target: 'Moon', diff: 'Beginner', color: 'from-slate-400 to-slate-600', obj: 'Explore the lunar surface and collect rock samples.', reqs: { thrust: 50, fuel: 50, power: 10, crew: 1 }, distance: '384,400 km', xp: 50 },
  { id: 'mars', title: 'Mars Expedition', target: 'Mars', diff: 'Intermediate', color: 'from-red-500 to-orange-600', obj: 'Search for signs of ancient water in Jezero Crater.', reqs: { thrust: 120, fuel: 150, power: 40, crew: 2 }, distance: '225M km', xp: 150 },
  { id: 'venus', title: 'Venus Cloud Probe', target: 'Venus', diff: 'Intermediate', color: 'from-amber-500 to-orange-500', obj: 'Send a probe to survive the crushing, acidic atmosphere.', reqs: { thrust: 100, fuel: 100, power: 30, crew: 0 }, distance: '61M km', xp: 130 },
  { id: 'saturn', title: 'Saturn Rings', target: 'Saturn', diff: 'Advanced', color: 'from-yellow-600 to-amber-700', obj: 'Study the composition of Saturns rings.', reqs: { thrust: 250, fuel: 350, power: 80, crew: 0 }, distance: '1.4B km', xp: 300 },
  { id: 'titan', title: 'Titan Submarine', target: 'Titan', diff: 'Advanced', color: 'from-teal-600 to-emerald-800', obj: 'Explore the liquid methane lakes of Saturns largest moon.', reqs: { thrust: 280, fuel: 380, power: 90, crew: 0 }, distance: '1.4B km', xp: 350 },
  { id: 'jupiter', title: 'Jupiter Moons', target: 'Jupiter', diff: 'Advanced', color: 'from-orange-400 to-red-500', obj: 'Investigate Europa for subsurface oceans.', reqs: { thrust: 200, fuel: 300, power: 60, crew: 0 }, distance: '778M km', xp: 250 },
  { id: 'pluto', title: 'Kuiper Belt Express', target: 'Pluto', diff: 'Advanced', color: 'from-indigo-400 to-purple-600', obj: 'Perform a high-speed flyby of the dwarf planet Pluto.', reqs: { thrust: 300, fuel: 400, power: 120, crew: 0 }, distance: '5.9B km', xp: 500 },
  { id: 'asteroid', title: 'Asteroid Miner', target: 'Asteroid Belt', diff: 'Intermediate', color: 'from-stone-500 to-stone-700', obj: 'Land on Bennu and extract rare minerals.', reqs: { thrust: 100, fuel: 120, power: 30, crew: 1 }, distance: '400M km', xp: 120 },
  { id: 'satellite', title: 'Satellite Rescue', target: 'Earth Orbit', diff: 'Beginner', color: 'from-blue-400 to-cyan-500', obj: 'Repair a damaged communications satellite.', reqs: { thrust: 30, fuel: 20, power: 20, crew: 2 }, distance: '400 km', xp: 40 }
];

const PARTS = {
  // ENGINES
  engine_chem: { id: 'engine_chem', type: 'engine', name: 'Chemical Thruster', icon: Flame, weight: 20, thrust: 100, fuel_cap: 0, power_gen: 0, power_use: 5, crew_cap: 0, class: 'bg-orange-500', desc: 'Standard thrust. Good for inner solar system.' },
  engine_heavy: { id: 'engine_heavy', type: 'engine', name: 'Heavy Booster', icon: Flame, weight: 60, thrust: 300, fuel_cap: 0, power_gen: 0, power_use: 10, crew_cap: 0, class: 'bg-red-600', desc: 'Massive thrust for heavy payloads.' },
  engine_ion: { id: 'engine_ion', type: 'engine', name: 'Ion Drive', icon: Zap, weight: 10, thrust: 40, fuel_cap: 0, power_gen: 0, power_use: 50, crew_cap: 0, class: 'bg-cyan-500', desc: 'Highly efficient, requires massive electricity.' },
  
  // FUEL TANKS
  tank_small: { id: 'tank_small', type: 'fuel', name: 'Standard Tank', icon: Droplet, weight: 30, thrust: 0, fuel_cap: 100, power_gen: 0, power_use: 0, crew_cap: 0, class: 'bg-slate-300 text-slate-800', desc: 'Basic fuel storage.' },
  tank_large: { id: 'tank_large', type: 'fuel', name: 'Cryo-Tank', icon: Droplet, weight: 70, thrust: 0, fuel_cap: 400, power_gen: 0, power_use: 10, crew_cap: 0, class: 'bg-slate-100 text-slate-900', desc: 'Huge fuel capacity for deep space.' },
  
  // COMMAND
  cmd_probe: { id: 'cmd_probe', type: 'command', name: 'AI Core Probe', icon: Cpu, weight: 15, thrust: 0, fuel_cap: 0, power_gen: 0, power_use: 15, crew_cap: 0, class: 'bg-emerald-500', desc: 'Unmanned automated core.' },
  cmd_capsule: { id: 'cmd_capsule', type: 'command', name: 'Crew Capsule', icon: Users, weight: 40, thrust: 0, fuel_cap: 0, power_gen: 0, power_use: 25, crew_cap: 3, class: 'bg-blue-500', desc: 'Standard habitat for up to 3 astronauts.' },
  cmd_station: { id: 'cmd_station', type: 'command', name: 'Command Station', icon: Shield, weight: 80, thrust: 0, fuel_cap: 0, power_gen: 0, power_use: 60, crew_cap: 6, class: 'bg-indigo-500', desc: 'Large living quarters.' },
  
  // UTILITY
  util_solar: { id: 'util_solar', type: 'utility', name: 'Solar Array', icon: Sun, weight: 15, thrust: 0, fuel_cap: 0, power_gen: 80, power_use: 0, crew_cap: 0, class: 'bg-yellow-400 text-yellow-900', desc: 'Generates power from the sun.' },
  util_rtg: { id: 'util_rtg', type: 'utility', name: 'RTG Nuclear', icon: Activity, weight: 30, thrust: 0, fuel_cap: 0, power_gen: 150, power_use: 0, crew_cap: 0, class: 'bg-purple-500', desc: 'Reliable nuclear power anywhere.' },
  util_rover: { id: 'util_rover', type: 'utility', name: 'Surface Rover', icon: Flag, weight: 40, thrust: 0, fuel_cap: 0, power_gen: 0, power_use: 15, crew_cap: 0, class: 'bg-orange-300 text-orange-900', desc: 'Exploration vehicle for surfaces.' }
};

const CREW_ROSTER = [
  { id: 'c1', name: 'Cmdr. Sarah', role: 'Commander', skill: 'Leadership', bonus: 'Boosts crew morale' },
  { id: 'c2', name: 'Dr. Aris', role: 'Scientist', skill: 'Geology', bonus: '+20% Science XP' },
  { id: 'c3', name: 'Eng. Chen', role: 'Engineer', skill: 'Repairs', bonus: 'Fixes broken parts' },
  { id: 'c4', name: 'Pilot Jax', role: 'Pilot', skill: 'Navigation', bonus: 'Saves 10% Fuel' },
  { id: 'c5', name: 'Dr. Vega', role: 'Medical', skill: 'Life Support', bonus: 'Maintains health' },
  { id: 'c6', name: 'NOVA-1', role: 'AI Assistant', skill: 'Computation', bonus: 'Instant calculations' }
];

const PLANETS = [
  { name: 'Mercury', dist: '57.9M km', size: '4,879 km', temp: '430°C', type: 'Rocky', color: 'bg-stone-400', desc: 'The smallest planet, closest to the sun. It has no atmosphere to retain heat, leading to extreme temperature swings.', flashcards: ["Mercury is the fastest planet, zipping around the Sun in just 88 days!", "It has no moons and no rings.", "Temperatures swing from 430°C in the day to -180°C at night!", "Mercury is shrinking! Its iron core is cooling, causing the planet to contract.", "Despite being closest to the Sun, Venus is actually hotter."] },
  { name: 'Venus', dist: '108.2M km', size: '12,104 km', temp: '471°C', type: 'Rocky', color: 'bg-orange-300', desc: 'Earths toxic twin. Its thick atmosphere traps heat, making it the hottest planet in our solar system.', flashcards: ["Venus is the hottest planet due to a runaway greenhouse effect.", "It spins backwards compared to most other planets.", "A day on Venus is longer than a year on Venus!", "The atmospheric pressure is 92 times heavier than Earth's.", "It has thick clouds made of sulfuric acid!"] },
  { name: 'Earth', dist: '149.6M km', size: '12,742 km', temp: '15°C', type: 'Rocky', color: 'bg-blue-500', desc: 'Our home. The only known planet with liquid water on its surface and life.', flashcards: ["Earth is the only planet known to harbor life.", "About 71% of Earth's surface is covered in water.", "Our atmosphere protects us from meteoroids and radiation.", "Earth has a powerful magnetic field generated by its spinning iron core.", "It takes exactly 365.25 days to orbit the Sun, which is why we have Leap Years!"] },
  { name: 'Mars', dist: '227.9M km', size: '6,779 km', temp: '-65°C', type: 'Rocky', color: 'bg-red-500', desc: 'The Red Planet. It features massive volcanoes, deep canyons, and evidence of ancient water.', flashcards: ["Mars is red because its surface is covered in iron oxide (rust).", "It is home to Olympus Mons, the largest volcano in the solar system.", "Mars has two tiny, potato-shaped moons: Phobos and Deimos.", "Billions of years ago, Mars likely had oceans of liquid water.", "Gravity on Mars is only 38% as strong as on Earth."] },
  { name: 'Jupiter', dist: '778.5M km', size: '139,820 km', temp: '-110°C', type: 'Gas Giant', color: 'bg-orange-400', desc: 'The largest planet. It is a gas giant with a Great Red Spot, a storm larger than Earth.', flashcards: ["Jupiter is massive—more than twice as heavy as all other planets combined!", "The Great Red Spot is a giant storm that has raged for hundreds of years.", "Jupiter has incredibly short days, spinning once every 10 hours.", "It has a faint ring system made of dust.", "Jupiter has at least 95 moons, including Ganymede, the largest moon in the solar system."] },
  { name: 'Saturn', dist: '1.4B km', size: '116,460 km', temp: '-140°C', type: 'Gas Giant', color: 'bg-yellow-200', desc: 'Famous for its stunning, complex ring system made of ice and rock.', flashcards: ["Saturn's beautiful rings are made of billions of pieces of ice and rock.", "It is the least dense planet—it would actually float in a giant bathtub of water!", "Saturn is mostly made of hydrogen and helium gas.", "It has 146 moons, the most of any planet in our solar system.", "Winds in Saturn's upper atmosphere reach 1,800 kilometers per hour!"] },
  { name: 'Uranus', dist: '2.9B km', size: '50,724 km', temp: '-195°C', type: 'Ice Giant', color: 'bg-cyan-200', desc: 'An ice giant that rotates on its side, giving it extreme seasons.', flashcards: ["Uranus rotates on its side, likely knocked over by a massive collision long ago.", "It is considered an 'Ice Giant' because of the icy materials in its mantle.", "A single season on Uranus lasts for 21 Earth years!", "It has 13 faint rings.", "Uranus gets its light blue color from methane gas in its atmosphere."] },
  { name: 'Neptune', dist: '4.5B km', size: '49,244 km', temp: '-200°C', type: 'Ice Giant', color: 'bg-blue-700', desc: 'The windiest planet, dark, cold, and whipped by supersonic winds.', flashcards: ["Neptune is the most distant planet in our solar system.", "It has the strongest winds in the solar system, reaching 2,100 km/h!", "Neptune is very dark; high noon there looks like twilight on Earth.", "It has 14 known moons, the largest being Triton.", "Triton actually orbits Neptune backwards!"] }
];

// ==========================================
// MAIN APPLICATION
// ==========================================

export default function SpaceQuestApp() {
  // --- STATE ---
  const [view, setView] = useState('dashboard');
  
  // Firebase email/password auth and Firestore commander profile
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileReady, setProfileReady] = useState(false);

  const [profile, setProfile] = useState({ name: 'Commander', level: 1, xp: 0, learningXp: 0, missions: 0, badges: [] });

  const loadAccount = async (accountUser) => {
    if (!db) throw new Error('Firebase is not configured.');
    setProfileReady(false);
    const profileRef = doc(db, 'users', accountUser.uid, 'profiles', 'commander');
    const snapshot = await getDoc(profileRef);
    let savedProfile = snapshot.exists() ? snapshot.data() : null;
    if (!savedProfile) {
      const localCopy = localStorage.getItem(`spacequest_profile_${accountUser.uid}`);
      const parsed = localCopy ? JSON.parse(localCopy) : {};
      savedProfile = {
        name: parsed.name || 'Commander',
        level: parsed.level || 1,
        xp: parsed.xp || 0,
        learningXp: parsed.learningXp || 0,
        missions: parsed.missions || 0,
        badges: parsed.badges || [],
        updatedAt: new Date().toISOString(),
      };
      await setDoc(profileRef, savedProfile);
    }
    setProfile({
      name: savedProfile.name,
      level: savedProfile.level,
      xp: savedProfile.xp,
      learningXp: savedProfile.learningXp,
      missions: savedProfile.missions,
      badges: savedProfile.badges || [],
    });
    setUser(accountUser);
    setProfileReady(true);
  };

  useEffect(() => {
    if (!firebaseReady || !auth) {
      setAuthReady(true);
      return undefined;
    }
    return onAuthStateChanged(auth, (accountUser) => {
      if (!accountUser) {
        setUser(null);
        setProfileReady(false);
        setAuthReady(true);
        return;
      }
      loadAccount(accountUser)
        .catch((error) => console.error('Could not load commander profile:', error.message))
        .finally(() => setAuthReady(true));
    });
  }, []);

  useEffect(() => {
    if (!user || !db || !profileReady) return;
    localStorage.setItem(`spacequest_profile_${user.uid}`, JSON.stringify(profile));
    setDoc(doc(db, 'users', user.uid, 'profiles', 'commander'), {
      ...profile,
      updatedAt: new Date().toISOString(),
    }, { merge: true }).catch((error) => console.error('Could not sync commander profile:', error.message));
  }, [profile, user, profileReady]);

  const handleLogout = async () => {
    if (auth) await signOut(auth).catch((error) => console.error('Could not sign out:', error.message));
    setUser(null);
    setProfileReady(false);
    setProfile({ name: 'Commander', level: 1, xp: 0, learningXp: 0, missions: 0, badges: [] });
    setNasaApod(null);
    setMeteorites([]);
    setNeoSnapshot(null);
    setNasaError('');
  };

  // NASA information is requested from the Express API; the API key stays server-side.
  const [nasaApod, setNasaApod] = useState(null);
  const [meteorites, setMeteorites] = useState([]);
  const [neoSnapshot, setNeoSnapshot] = useState(null);
  const [nasaError, setNasaError] = useState('');
  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;
    const apodFallback = {
      media_type: 'image',
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop',
      title: 'Earth from space',
      explanation: 'Our home planet is the only known celestial body to support life, protected by a delicate atmosphere and magnetic field.',
    };
    const meteoriteFallback = [
      { name: 'Hoba', year: '1920-01-01T00:00:00.000', recclass: 'Iron, IVB', mass: '60000000' },
      { name: 'Cape York', year: '1818-01-01T00:00:00.000', recclass: 'Iron, IIIAB', mass: '58200000' },
      { name: 'Campo del Cielo', year: '1576-01-01T00:00:00.000', recclass: 'Iron, IAB-MG', mass: '50000000' },
      { name: 'Canyon Diablo', year: '1891-01-01T00:00:00.000', recclass: 'Iron, IAB-MG', mass: '30000000' },
      { name: 'Armanty', year: '1898-01-01T00:00:00.000', recclass: 'Iron, IIIE', mass: '28000000' },
      { name: 'Gibeon', year: '1836-01-01T00:00:00.000', recclass: 'Iron, IVA', mass: '26000000' },
    ];
    Promise.allSettled([apiRequest('/api/nasa/apod'), apiRequest('/api/nasa/meteorites'), apiRequest('/api/nasa/neo')])
      .then(([apodResult, meteoriteResult, neoResult]) => {
        if (cancelled) return;
        const apodData = apodResult.status === 'fulfilled' ? apodResult.value : null;
        const meteoriteData = meteoriteResult.status === 'fulfilled' ? meteoriteResult.value.meteorites : null;
        const neoData = neoResult.status === 'fulfilled' ? neoResult.value : null;
        setNasaApod(apodData ? {
          ...apodData,
          media_type: apodData.mediaType,
          url: apodData.imageUrl,
        } : apodFallback);
        setMeteorites(meteoriteData || meteoriteFallback);
        setNeoSnapshot(neoData);
        setNasaError(apodData && meteoriteData && neoData ? '' : 'Some NASA data is unavailable; showing backup information where possible.');
      });
    return () => { cancelled = true; };
  }, [user]);

  // Mission State
  const [activeMission, setActiveMission] = useState(null);
  const [blueprint, setBlueprint] = useState({ command: null, utility: null, fuel: null, engine: null });
  const [selectedCrew, setSelectedCrew] = useState([]);
  const [simState, setSimState] = useState({ step: 'idle', logs: [], fuelLeft: 0, hull: 100 });
  const [exploreScore, setExploreScore] = useState(0);

  // Education State
  const [eduMode, setEduMode] = useState('kids'); // 'kids' or 'explorer'
  const [eduModalPart, setEduModalPart] = useState(null);
  const [preLaunchPassed, setPreLaunchPassed] = useState(false);
  const [labGravity, setLabGravity] = useState('Earth');

  // Solar System Flashcard State
  const [activePlanetFlashcards, setActivePlanetFlashcards] = useState(null);
  const [flashcardIdx, setFlashcardIdx] = useState(0);

  // Real World Missions State
  const [selectedRealMission, setSelectedRealMission] = useState(null);

  // Mentor State
  const [mentor, setMentor] = useState({ show: true, message: "Welcome to Space Quest! Select a destination on the left to begin your journey.", mood: 'happy' });

  // --- PHYSICS ENGINE ---
  const stats = useMemo(() => {
    let mass = 0, thrust = 0, fuel = 0, powerGen = 0, powerUse = 0, crewCap = 0;
    Object.values(blueprint).forEach(partId => {
      if (partId && PARTS[partId]) {
        const p = PARTS[partId];
        mass += p.weight; thrust += p.thrust; fuel += p.fuel_cap;
        powerGen += p.power_gen; powerUse += p.power_use; crewCap += p.crew_cap;
      }
    });

    const twr = mass > 0 ? (thrust / mass).toFixed(2) : 0;
    const powerNet = powerGen - powerUse;
    
    // Readiness checks
    const hasCmd = !!blueprint.command;
    const hasFuel = fuel > 0;
    const hasEng = !!blueprint.engine;
    const canLift = thrust > mass;
    const hasPower = powerNet >= 0;
    
    let missionReady = hasCmd && hasFuel && hasEng && canLift && hasPower;
    
    if (activeMission) {
      if (fuel < activeMission.reqs.fuel) missionReady = false;
      if (thrust < activeMission.reqs.thrust) missionReady = false;
      if (crewCap < activeMission.reqs.crew) missionReady = false;
      if (powerGen < activeMission.reqs.power) missionReady = false;
    }

    return { mass, thrust, fuel, powerGen, powerUse, powerNet, crewCap, twr, canLift, missionReady };
  }, [blueprint, activeMission]);

  // --- MENTOR LOGIC ---
  useEffect(() => {
    if (view === 'dashboard') setMentor({ show: true, message: `Welcome back, ${profile.name}! You have ${profile.xp} XP. Let's launch a mission!`, mood: 'happy' });
    else if (view === 'missions') setMentor({ show: true, message: "Choose your destination. Pay attention to the mission requirements!", mood: 'neutral' });
    else if (view === 'academy') setMentor({ show: true, message: "Welcome to ASTRA Academy. Let's learn the real science behind space exploration.", mood: 'happy' });
    else if (view === 'spacelab') setMentor({ show: true, message: "Welcome to the Lab! Here you can run simulations and test the laws of physics.", mood: 'happy' });
    else if (view === 'builder') {
      if (!blueprint.command) setMentor({ show: true, message: "Start by adding a Command Module to house your crew or AI.", mood: 'neutral' });
      else if (!blueprint.engine) setMentor({ show: true, message: "A spacecraft needs an engine to generate thrust.", mood: 'neutral' });
      else if (!blueprint.fuel) setMentor({ show: true, message: "Engines need fuel! Add a fuel tank.", mood: 'neutral' });
      else if (!stats.canLift) setMentor({ show: true, message: "Warning! The ship is too heavy. Thrust must be greater than Mass (TWR > 1).", mood: 'warning' });
      else if (stats.powerNet < 0) setMentor({ show: true, message: "Power Failure! You are using more power than you generate. Add a utility power source.", mood: 'warning' });
      else if (activeMission && !stats.missionReady) setMentor({ show: true, message: "Your ship flies, but it doesn't meet the specific requirements for this mission yet.", mood: 'warning' });
      else setMentor({ show: true, message: "All systems green! Your spacecraft is cleared for crew selection.", mood: 'happy' });
    }
    else if (view === 'crew') {
      if (stats.crewCap === 0) setMentor({ show: true, message: "This is an unmanned AI probe. No crew needed!", mood: 'neutral' });
      else setMentor({ show: true, message: `Select up to ${stats.crewCap} astronauts for this mission.`, mood: 'neutral' });
    }
    else if (view === 'planner') setMentor({ show: true, message: "Review the flight trajectory and resource limits before committing to launch.", mood: 'neutral' });
  }, [view, blueprint, stats, activeMission, profile]);

  // --- ACTIONS ---
  const handleNav = (targetView) => {
    setView(targetView);
  };

  const equipPart = (slot, partId) => {
    setBlueprint(prev => ({ ...prev, [slot]: partId }));
  };

  const toggleCrew = (id) => {
    if (selectedCrew.includes(id)) setSelectedCrew(prev => prev.filter(c => c !== id));
    else if (selectedCrew.length < stats.crewCap) setSelectedCrew(prev => [...prev, id]);
  };

  const startSimulation = () => {
    setView('simulation');
    setSimState({ step: 'countdown', logs: ['T-Minus 3 seconds...'], fuelLeft: stats.fuel, hull: 100 });
    
    setTimeout(() => setSimState(s => ({ ...s, step: 'liftoff', logs: [...s.logs, 'Liftoff! Engines nominal.'] })), 3000);
    setTimeout(() => setSimState(s => ({ ...s, step: 'transit', logs: [...s.logs, 'Leaving Earth atmosphere...', 'Entering transit trajectory.'] })), 7000);
    setTimeout(() => setSimState(s => ({ ...s, step: 'event', logs: [...s.logs, 'WARNING: Anomalous object detected in flight path!'] })), 12000);
  };

  const handleSimEvent = (choice) => {
    if (choice === 'evade') {
      setSimState(s => ({ ...s, step: 'transit', fuelLeft: s.fuelLeft - 30, logs: [...s.logs, 'Evasive maneuvers successful. Consumed 30 fuel.'] }));
      setMentor({ show: true, message: "Good piloting! We dodged it, but burned extra fuel.", mood: 'happy' });
    } else {
      setSimState(s => ({ ...s, step: 'transit', hull: s.hull - 40, logs: [...s.logs, 'Braced for impact. Hull integrity dropped by 40%.'] }));
      setMentor({ show: true, message: "Ouch! The shields held, but the hull took a beating.", mood: 'warning' });
    }
    setTimeout(() => setSimState(s => ({ ...s, step: 'arrival', logs: [...s.logs, `Arrived at ${activeMission.target} orbit.`] })), 4000);
  };

  const endMission = () => {
    const xpGained = activeMission.xp + exploreScore;
    const newXp = profile.xp + xpGained;
    const newLevel = Math.floor(newXp / 500) + 1;
    
    setProfile(p => ({
      ...p,
      xp: newXp,
      level: newLevel,
      missions: p.missions + 1,
      badges: [...new Set([...p.badges, activeMission.target])]
    }));
    
    setView('report');
    setPreLaunchPassed(false);
  };

  // ==========================================
  // RENDERERS
  // ==========================================

  const renderSidebar = () => (
    <div className="w-64 bg-slate-900/80 backdrop-blur-2xl border-r border-white/5 flex flex-col p-6 z-50 fixed h-full shadow-2xl">
      <div className="flex items-center gap-3 mb-10 text-cyan-400">
        <Rocket size={32} />
        <h1 className="text-2xl font-black tracking-tighter">SPACE<br/>QUEST</h1>
      </div>

      <nav className="space-y-2 flex-grow overflow-y-auto custom-scroll pr-2">
        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2 mt-4">Command</div>
        {[
          { id: 'dashboard', icon: Activity, label: 'Mission Control' },
          { id: 'missions', icon: Map, label: 'Missions' },
          { id: 'builder', icon: Settings, label: 'Ship Builder' },
          { id: 'crew', icon: Users, label: 'Crew' },
          { id: 'solarsystem', icon: Orbit, label: 'Solar System' },
        ].map(item => {
          const Icon = item.icon;
          return (
          <button 
            key={item.id} 
            onClick={() => handleNav(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium text-sm
              ${view === item.id ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
            `}
          >
            <Icon size={18}/> {item.label}
          </button>
        )})}

        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2 mt-8">Learning</div>
        {[
          { id: 'academy', icon: BookOpen, label: 'Space Academy' },
          { id: 'spacelab', icon: FlaskConical, label: 'Space Lab' },
        ].map(item => {
          const Icon = item.icon;
          return (
          <button 
            key={item.id} 
            onClick={() => handleNav(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium text-sm
              ${view === item.id ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
            `}
          >
            <Icon size={18}/> {item.label}
          </button>
        )})}
      </nav>

      <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
            <User size={20} className="text-slate-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">{profile.name}</div>
            <div className="text-xs text-cyan-400">Level {profile.level} Cmdr</div>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full mt-3 px-3 py-2 rounded-lg text-left text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900">Sign out · {user?.email}</button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="animate-fade-in text-white p-10 max-w-5xl mx-auto">
      <h1 className="text-5xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Welcome, {profile.name}!</h1>
      <p className="text-xl text-slate-400 mb-10">Mission Control is online. The universe awaits.</p>

      {neoSnapshot && <section className="mb-10 rounded-3xl border border-cyan-900/60 bg-slate-900/70 p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3"><h2 className="text-xl font-bold text-cyan-300">NASA/JPL near-Earth objects today</h2><span className="text-xs text-slate-400">{neoSnapshot.count} recorded close approaches</span></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">{neoSnapshot.asteroids.slice(0, 3).map((asteroid) => <a key={asteroid.id} href={asteroid.nasaUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-800 bg-slate-950 p-4 hover:border-cyan-700"><div className="font-bold text-slate-200">{asteroid.name}</div><div className="mt-2 text-xs text-slate-400">Closest approach {Number(asteroid.missDistanceKm).toLocaleString(undefined, { maximumFractionDigits: 0 })} km</div><div className={`mt-2 text-xs ${asteroid.hazardous ? 'text-red-400' : 'text-emerald-400'}`}>{asteroid.hazardous ? 'Potentially hazardous' : 'Tracked'}</div></a>)}</div>
      </section>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-xl flex items-center gap-4">
          <div className="p-4 bg-blue-500/20 text-blue-400 rounded-2xl"><Award size={24}/></div>
          <div>
            <div className="text-2xl font-black">{profile.xp}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mission XP</div>
          </div>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-xl flex items-center gap-4">
          <div className="p-4 bg-indigo-500/20 text-indigo-400 rounded-2xl"><Brain size={24}/></div>
          <div>
            <div className="text-2xl font-black">{profile.learningXp}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Learning XP</div>
          </div>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-xl flex items-center gap-4">
          <div className="p-4 bg-purple-500/20 text-purple-400 rounded-2xl"><Flag size={24}/></div>
          <div>
            <div className="text-2xl font-black">{profile.missions}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Missions</div>
          </div>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-xl flex items-center gap-4">
          <div className="p-4 bg-amber-500/20 text-amber-400 rounded-2xl"><Trophy size={24}/></div>
          <div>
            <div className="text-2xl font-black">{profile.badges.length}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Badges</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-1 border border-indigo-500/30 h-full">
          <div className="bg-slate-950/80 backdrop-blur-md p-8 rounded-[22px] flex flex-col h-full justify-center">
            <h2 className="text-2xl font-bold mb-2">Ready to Launch?</h2>
            <p className="text-indigo-200 mb-6">Start a new mission and explore the solar system.</p>
            <button onClick={() => handleNav('missions')} className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-2">
              Open Mission Board <ChevronRight/>
            </button>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-3xl p-1 border border-emerald-500/30 h-full">
          <div className="bg-slate-950/80 backdrop-blur-md p-8 rounded-[22px] flex flex-col h-full justify-center">
            <h2 className="text-2xl font-bold mb-2">Space Academy</h2>
            <p className="text-emerald-200 mb-6">Learn real space science and earn Learning XP.</p>
            <button onClick={() => handleNav('academy')} className="px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2">
              Start Learning <BookOpen/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMissions = () => (
    <div className="animate-fade-in text-white p-10 max-w-6xl mx-auto">
      <h1 className="text-4xl font-black mb-8">Select Mission</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MISSIONS.map(m => (
          <div 
            key={m.id}
            onClick={() => { setActiveMission(m); setBlueprint({command: null, utility: null, fuel: null, engine: null}); setSelectedCrew([]); handleNav('builder'); }}
            className="group relative cursor-pointer bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl transition-all hover:-translate-y-2 hover:border-cyan-500/50 hover:shadow-[0_10px_30px_rgba(6,182,212,0.2)] overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${m.color}`}></div>
            <div className="flex justify-between items-start mb-4 mt-2">
              <h3 className="text-2xl font-bold">{m.title}</h3>
              <span className={`text-xs px-2 py-1 rounded-md font-bold border ${m.diff === 'Beginner' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : m.diff === 'Intermediate' ? 'bg-amber-950 text-amber-400 border-amber-800' : 'bg-red-950 text-red-400 border-red-800'}`}>
                {m.diff}
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-6 min-h-[40px]">{m.obj}</p>
            
            <div className="bg-slate-950 rounded-xl p-4 mb-6 border border-slate-800/50 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Target</span><span className="font-medium">{m.target}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Reward</span><span className="font-medium text-blue-400">+{m.xp} XP</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Req. Fuel</span><span className="font-medium text-cyan-400">{m.reqs.fuel}u</span></div>
            </div>

            <div className="w-full text-center text-sm font-bold text-slate-300 group-hover:text-cyan-400 transition-colors flex items-center justify-center gap-2">
              DESIGN SPACECRAFT <ChevronRight size={16}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBuilder = () => {
    const categories = [
      { id: 'command', name: 'Command' },
      { id: 'utility', name: 'Utility' },
      { id: 'fuel', name: 'Fuel Tank' },
      { id: 'engine', name: 'Engine' },
    ];

    return (
      <div className="animate-fade-in text-white p-8 h-screen overflow-hidden flex flex-col relative">
        {/* Educational Modal */}
        {eduModalPart && COMPONENT_EDU[eduModalPart] && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-10 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-slate-900 border-2 border-cyan-500 rounded-3xl max-w-2xl w-full p-8 shadow-[0_0_40px_rgba(6,182,212,0.3)]">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3 text-cyan-400">
                  <Lightbulb size={32} />
                  <h2 className="text-2xl font-black">{PARTS[eduModalPart].name} Science</h2>
                </div>
                <div className="flex bg-slate-800 rounded-full p-1 border border-slate-700">
                  <button onClick={() => setEduMode('kids')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${eduMode === 'kids' ? 'bg-cyan-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>Kids Mode</button>
                  <button onClick={() => setEduMode('explorer')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${eduMode === 'explorer' ? 'bg-cyan-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>Explorer Mode</button>
                </div>
              </div>
              
              <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 mb-6 min-h-[120px] flex items-center text-lg leading-relaxed text-slate-200">
                {COMPONENT_EDU[eduModalPart][eduMode]}
              </div>

              <div className="bg-indigo-950/50 rounded-2xl p-5 border border-indigo-500/30 flex items-start gap-4 mb-8">
                <Brain className="text-indigo-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-indigo-300 text-sm mb-1">Did you know?</h4>
                  <p className="text-slate-300 text-sm">{COMPONENT_EDU[eduModalPart].fact}</p>
                </div>
              </div>

              <button 
                onClick={() => {
                  setProfile(p => ({ ...p, learningXp: p.learningXp + 10 }));
                  setEduModalPart(null);
                }} 
                className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all"
              >
                Close & Collect +10 Learning XP
              </button>
            </div>
          </div>
        )}

        <header className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <div className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Spacecraft Design Studio</div>
            <h1 className="text-3xl font-black">{activeMission ? activeMission.title : 'Free Build'}</h1>
          </div>
          <button 
            onClick={() => handleNav('crew')}
            disabled={!stats.missionReady}
            className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all
              ${stats.missionReady ? 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
            `}
          >
            Assign Crew <ChevronRight/>
          </button>
        </header>

        <div className="flex gap-6 flex-grow overflow-hidden">
          {/* LEFT: Inventory */}
          <div className="w-1/3 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-4 flex flex-col gap-4 overflow-y-auto custom-scroll">
            {categories.map(cat => (
              <div key={cat.id}>
                <h3 className="text-slate-400 font-bold uppercase text-xs mb-2 pl-2">{cat.name} Modules</h3>
                <div className="space-y-2">
                  {Object.values(PARTS).filter(p => p.type === cat.id).map(part => {
                    const Icon = part.icon;
                    return (
                    <div 
                      key={part.id}
                      className={`p-3 rounded-2xl border-2 transition-all flex gap-3 items-center
                        ${blueprint[cat.id] === part.id ? 'bg-cyan-900/30 border-cyan-500 shadow-inner' : 'bg-slate-950/50 border-transparent hover:border-slate-600'}
                      `}
                    >
                      <div 
                        onClick={() => equipPart(cat.id, part.id)}
                        className="flex-grow flex items-center gap-3 cursor-pointer"
                      >
                        <div className={`p-2 rounded-xl ${part.class} text-white`}><Icon size={24}/></div>
                        <div>
                          <div className="font-bold text-sm">{part.name}</div>
                          <div className="text-[10px] text-slate-400">{part.desc}</div>
                        </div>
                      </div>
                      
                      {COMPONENT_EDU[part.id] && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEduModalPart(part.id); }}
                          className="shrink-0 p-2 bg-slate-800 hover:bg-cyan-600 hover:text-white text-cyan-400 rounded-full transition-colors group relative"
                          title="Learn the Science!"
                        >
                          <Info size={16} />
                        </button>
                      )}
                    </div>
                  )})}
                </div>
              </div>
            ))}
          </div>

          {/* CENTER: Visual Assembly */}
          <div className="w-1/3 bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center rounded-3xl relative flex flex-col items-center justify-end pb-10 border border-slate-700/50 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]"></div>
            
            <div className="z-10 flex flex-col items-center gap-1 w-48 relative">
              {/* Core connecting line visually */}
              <div className="absolute top-0 bottom-10 left-1/2 -translate-x-1/2 w-2 bg-slate-800 -z-10 rounded-full"></div>

              {categories.map(cat => {
                const part = PARTS[blueprint[cat.id]];
                
                if (!part) return (
                  <div key={`empty-${cat.id}`} className="w-full h-20 border-2 border-dashed border-slate-600 rounded-2xl flex items-center justify-center bg-slate-900/50 text-slate-500 text-xs font-bold uppercase">
                    Slot
                  </div>
                );

                // Shape styling
                let shape = "w-full rounded-xl";
                if (cat.id === 'command') shape = "w-3/4 h-24 rounded-t-[50px] rounded-b-lg border-t-4 border-slate-300";
                if (cat.id === 'utility') shape = "w-11/12 h-16 rounded-xl border-x-4 border-white/20";
                if (cat.id === 'fuel') shape = "w-full h-32 rounded-xl border-x-8 border-slate-400";
                if (cat.id === 'engine') shape = "w-5/6 h-20 rounded-t-lg rounded-b-[40px] border-b-8 border-red-500";

                const Icon = part.icon;

                return (
                  <div key={cat.id} className={`${shape} ${part.class} flex flex-col items-center justify-center shadow-lg relative group transition-all duration-300 hover:scale-105`}>
                    <Icon size={24}/>
                    <span className="text-[10px] font-bold mt-1 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">{part.name}</span>
                    <button onClick={() => equipPart(cat.id, null)} className="absolute -right-3 -top-3 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Crosshair size={14}/>
                    </button>
                  </div>
                )
              })}
            </div>
            
            {/* Launch pad base graphic */}
            <div className="absolute bottom-0 w-full h-4 bg-slate-700 border-t border-slate-500 z-0"></div>
          </div>

          {/* RIGHT: Stats */}
          <div className="w-1/3 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 flex flex-col overflow-y-auto">
            <h3 className="text-xl font-bold mb-6 border-b border-slate-700/50 pb-4">Diagnostics</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-1 text-slate-400"><span>Thrust to Weight (TWR)</span><span className={`font-bold ${stats.canLift ? 'text-emerald-400' : 'text-red-400'}`}>{stats.twr}</span></div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden"><div className={`h-full ${stats.canLift ? 'bg-emerald-500' : 'bg-red-500'}`} style={{width: `${Math.min(stats.twr * 30, 100)}%`}}></div></div>
                {!stats.canLift && <p className="text-[10px] text-red-400 mt-1">Ship is too heavy to launch! TWR must be {'>'} 1.0</p>}
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1 text-slate-400"><span>Power Grid</span><span className={`font-bold ${stats.powerNet >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>{stats.powerNet >= 0 ? '+' : ''}{stats.powerNet}W</span></div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-yellow-400 h-full" style={{width: `${(stats.powerGen / Math.max(1, stats.powerGen+stats.powerUse)) * 100}%`}}></div>
                  <div className="bg-purple-500 h-full" style={{width: `${(stats.powerUse / Math.max(1, stats.powerGen+stats.powerUse)) * 100}%`}}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-center"><div className="text-2xl font-black text-blue-400">{stats.fuel}</div><div className="text-[10px] uppercase text-slate-500 font-bold">Fuel Cap</div></div>
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-center"><div className="text-2xl font-black text-indigo-400">{stats.crewCap}</div><div className="text-[10px] uppercase text-slate-500 font-bold">Crew Cap</div></div>
              </div>

              {activeMission && (
                <div className="mt-auto bg-slate-950 rounded-2xl p-4 border border-slate-800">
                  <h4 className="text-xs uppercase font-bold text-cyan-400 mb-3">Mission Checks</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center"><span className="text-slate-400">Thrust ({activeMission.reqs.thrust})</span> {stats.thrust >= activeMission.reqs.thrust ? <CheckCircle2 className="text-emerald-500" size={16}/> : <AlertTriangle className="text-amber-500" size={16}/>}</div>
                    <div className="flex justify-between items-center"><span className="text-slate-400">Fuel ({activeMission.reqs.fuel})</span> {stats.fuel >= activeMission.reqs.fuel ? <CheckCircle2 className="text-emerald-500" size={16}/> : <AlertTriangle className="text-amber-500" size={16}/>}</div>
                    <div className="flex justify-between items-center"><span className="text-slate-400">Power ({activeMission.reqs.power})</span> {stats.powerGen >= activeMission.reqs.power ? <CheckCircle2 className="text-emerald-500" size={16}/> : <AlertTriangle className="text-amber-500" size={16}/>}</div>
                    <div className="flex justify-between items-center"><span className="text-slate-400">Crew Seats ({activeMission.reqs.crew})</span> {stats.crewCap >= activeMission.reqs.crew ? <CheckCircle2 className="text-emerald-500" size={16}/> : <AlertTriangle className="text-amber-500" size={16}/>}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCrew = () => (
    <div className="animate-fade-in text-white p-10 max-w-5xl mx-auto">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black mb-2">Assemble Crew</h1>
          <p className="text-slate-400">Your spacecraft has <span className="font-bold text-white">{stats.crewCap} seats</span>.</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-cyan-400">{selectedCrew.length} / {stats.crewCap}</div>
          <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Selected</div>
        </div>
      </header>

      {stats.crewCap === 0 ? (
        <div className="bg-emerald-950/30 border border-emerald-500/50 p-12 rounded-3xl text-center max-w-2xl mx-auto">
          <Cpu size={64} className="mx-auto text-emerald-400 mb-6" />
          <h2 className="text-2xl font-bold mb-4">Unmanned Mission Confirmed</h2>
          <p className="text-slate-300 mb-8">AI Core is fully operational and requires no life support or human crew.</p>
          <button onClick={() => handleNav('planner')} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold shadow-lg transition-transform hover:scale-105">Proceed to Flight Plan</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {CREW_ROSTER.map(c => {
              const isSelected = selectedCrew.includes(c.id);
              const isDisabled = !isSelected && selectedCrew.length >= stats.crewCap;
              return (
                <div 
                  key={c.id}
                  onClick={() => !isDisabled && toggleCrew(c.id)}
                  className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center text-center
                    ${isSelected ? 'bg-indigo-900/40 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : isDisabled ? 'bg-slate-900/30 border-slate-800 opacity-50 cursor-not-allowed' : 'bg-slate-900/60 border-slate-700 hover:border-slate-500'}
                  `}
                >
                  <div className={`w-16 h-16 rounded-full mb-4 flex items-center justify-center ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}><User size={32}/></div>
                  <h3 className="font-bold text-lg">{c.name}</h3>
                  <div className="text-indigo-400 text-sm font-bold mb-2">{c.role}</div>
                  <div className="bg-slate-950 text-xs text-slate-400 px-3 py-1 rounded-full">{c.bonus}</div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-center">
             <button 
                onClick={() => handleNav('planner')}
                disabled={selectedCrew.length !== stats.crewCap}
                className={`px-10 py-4 rounded-xl font-bold transition-all ${selectedCrew.length === stats.crewCap ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
              >
                Confirm Crew Roster
              </button>
          </div>
        </>
      )}
    </div>
  );

  const renderPlanner = () => (
    <div className="animate-fade-in text-white p-10 max-w-6xl mx-auto h-screen flex flex-col relative">
      {/* Learn Before You Launch Overlay */}
      {!preLaunchPassed && PRE_LAUNCH_EDU[activeMission.target] && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-10">
          <div className="max-w-3xl w-full">
            <div className="text-center mb-10">
              <GraduationCap size={64} className="mx-auto text-emerald-400 mb-4" />
              <h1 className="text-4xl font-black">Learn Before You Launch</h1>
              <p className="text-xl text-slate-400">Commander, review this briefing before flight.</p>
            </div>
            
            <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl mb-8 shadow-2xl text-lg leading-relaxed text-slate-200">
              {PRE_LAUNCH_EDU[activeMission.target].lesson}
            </div>

            <div className="bg-indigo-950/50 border border-indigo-500/50 p-8 rounded-3xl">
              <h3 className="text-xl font-bold mb-4 text-indigo-300">Pre-Flight Quiz: {PRE_LAUNCH_EDU[activeMission.target].question}</h3>
              <div className="grid gap-3">
                {PRE_LAUNCH_EDU[activeMission.target].options.map((opt, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      if (idx === PRE_LAUNCH_EDU[activeMission.target].answer) {
                        setPreLaunchPassed(true);
                        setProfile(p => ({ ...p, learningXp: p.learningXp + 50 }));
                        setMentor({ show: true, message: "Correct! You've earned +50 Learning XP. Cleared for launch.", mood: 'happy' });
                      } else {
                        setMentor({ show: true, message: "Not quite. Re-read the briefing and try again!", mood: 'warning' });
                      }
                    }}
                    className="p-4 bg-slate-900 hover:bg-indigo-600 border border-slate-700 rounded-xl text-left font-medium transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => handleNav('crew')} className="mt-8 mx-auto flex items-center gap-2 text-slate-400 hover:text-white"><Undo2 size={18}/> Back to Crew</button>
          </div>
        </div>
      )}

      <h1 className="text-4xl font-black mb-8">Flight Planner</h1>
      
      <div className="flex-grow bg-slate-950 border border-slate-800 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center mb-8 shadow-inner">
        {/* Orbital Trajectory Map */}
        <div className="absolute inset-0 flex items-center justify-between px-32 pointer-events-none opacity-40">
          <svg className="w-full h-full absolute inset-0 text-cyan-500/30 stroke-current stroke-2" style={{strokeDasharray: "10, 10"}}>
            <path d="M 150 50% Q 50% 20% calc(100% - 150px) 50%" fill="none" className="animate-pulse" />
          </svg>
        </div>

        <div className="flex justify-between w-full px-20 relative z-10 items-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-500 rounded-full shadow-[0_0_40px_rgba(59,130,246,0.5)] mx-auto mb-4 border-2 border-white/20"></div>
            <h3 className="font-black text-2xl">Earth</h3>
            <p className="text-slate-400">Launch Pad</p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-700 text-center">
            <div className="text-cyan-400 font-bold uppercase tracking-widest text-xs">Distance</div>
            <div className="font-black text-xl">{activeMission.distance}</div>
          </div>

          <div className="text-center">
            <div className={`w-24 h-24 rounded-full shadow-[0_0_40px_currentColor] mx-auto mb-4 border-2 border-white/20 flex items-center justify-center
               ${activeMission.id === 'mars' ? 'bg-red-500 text-red-500' : activeMission.id === 'moon' ? 'bg-slate-300 text-slate-300' : activeMission.id === 'saturn' ? 'bg-yellow-200 text-yellow-200' : 'bg-orange-500 text-orange-500'}
            `}></div>
            <h3 className="font-black text-2xl">{activeMission.target}</h3>
            <p className="text-slate-400">Destination</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center shrink-0">
        <button onClick={() => handleNav('crew')} className="px-6 py-3 text-slate-400 hover:text-white flex items-center gap-2"><Undo2 size={18}/> Back</button>
        <button onClick={startSimulation} className="px-12 py-4 bg-red-600 hover:bg-red-500 text-white font-black text-xl rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-transform hover:scale-105 flex items-center gap-2">
          <Flame/> INITIATE LAUNCH
        </button>
      </div>
    </div>
  );

  const renderAcademy = () => (
    <div className="animate-fade-in text-white p-10 max-w-6xl mx-auto">
      
      {/* REAL WORLD MISSION MODAL */}
      {selectedRealMission && (
        <div className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/50 rounded-3xl w-full max-w-3xl overflow-hidden shadow-[0_0_50px_rgba(79,70,229,0.2)] animate-fade-in relative flex flex-col">
            <button 
              onClick={() => setSelectedRealMission(null)} 
              className="absolute top-6 right-6 p-2 bg-slate-800 hover:bg-red-500 rounded-full text-white transition-colors z-20"
            >
              <X size={20} />
            </button>
            <div className="p-10 border-b border-slate-800 bg-indigo-950/30">
              <div className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-2">{selectedRealMission.agency} • {selectedRealMission.year}</div>
              <h2 className="text-4xl font-black text-white">{selectedRealMission.name}</h2>
            </div>
            <div className="p-10 overflow-y-auto max-h-[60vh] custom-scroll space-y-6">
              <p className="text-lg text-slate-300 leading-relaxed">{selectedRealMission.details}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                  <h4 className="text-cyan-400 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2"><Cpu size={16}/> Technology Used</h4>
                  <ul className="space-y-3">
                    {selectedRealMission.tech.map((t, i) => (
                      <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1 shrink-0"></div>{t}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                  <h4 className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2"><FlaskConical size={16}/> Key Discoveries</h4>
                  <ul className="space-y-3">
                    {selectedRealMission.discoveries.map((d, i) => (
                      <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0"></div>{d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-8">
        <BookOpen size={40} className="text-indigo-400" />
        <div>
          <h1 className="text-4xl font-black">Space Academy</h1>
          <p className="text-slate-400">Learn the real science behind space exploration.</p>
        </div>
      </div>
      {nasaError && <p role="status" className="mb-5 text-amber-300 text-sm">{nasaError}</p>}
      
      {/* NASA OPEN SOURCE API INTEGRATION */}
      {nasaApod && (
        <div className="mb-10 bg-slate-900/60 backdrop-blur-xl border border-slate-700 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
           <div className={`absolute top-0 right-0 ${nasaError ? 'bg-amber-700' : 'bg-blue-600'} text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest z-10`}>
             {nasaError ? 'Backup NASA data' : 'Live NASA API Data'}
           </div>
           {nasaApod.media_type === 'image' && (
             <img src={nasaApod.url} alt={nasaApod.title} className="w-full md:w-1/3 rounded-2xl border border-slate-700 shadow-lg object-cover aspect-video" />
           )}
           <div className="flex-grow">
             <h2 className="text-2xl font-bold mb-1 text-cyan-400">NASA Astronomy Picture of the Day</h2>
             <h3 className="text-xl font-bold mb-3">{nasaApod.title}</h3>
             <p className="text-slate-300 text-sm leading-relaxed max-h-40 overflow-y-auto custom-scroll pr-2">{nasaApod.explanation}</p>
           </div>
        </div>
      )}

      {/* NASA METEORITE DATABASE INTEGRATION */}
      {meteorites.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 mt-10 border-b border-slate-800 pb-2 flex items-center gap-3">
            <Database className="text-orange-400"/> NASA Open Database: Largest Meteorite Strikes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meteorites.map((m, i) => (
              <div key={i} className="bg-slate-900/60 backdrop-blur-xl border border-slate-700 p-6 rounded-3xl hover:border-orange-500/50 transition-colors group relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-orange-600 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest z-10">
                  data.nasa.gov
                </div>
                <div className="flex justify-between items-start mb-4 mt-2">
                  <h3 className="text-2xl font-black text-orange-300 group-hover:text-orange-400 transition-colors">{m.name}</h3>
                  <span className="bg-slate-800 text-xs px-3 py-1 rounded-full font-bold border border-slate-600">
                    {m.year ? m.year.substring(0, 4) : 'Unknown'}
                  </span>
                </div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4">Class: {m.recclass}</div>
                <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 text-sm">Recorded Mass:</span>
                  <span className="font-bold text-red-400 text-lg">{(parseInt(m.mass) / 1000).toLocaleString()} kg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6 mt-10 border-b border-slate-800 pb-2">Real-World Missions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {REAL_MISSIONS.map((m, i) => (
          <div 
            key={i} 
            onClick={() => setSelectedRealMission(m)}
            className="bg-slate-900/60 backdrop-blur-xl border border-slate-700 p-6 rounded-3xl hover:border-indigo-500 transition-colors cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-black text-indigo-300 group-hover:text-indigo-400 transition-colors">{m.name}</h3>
              <span className="bg-slate-800 text-xs px-3 py-1 rounded-full font-bold">{m.year}</span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Agency: {m.agency}</div>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">{m.desc}</p>
            <div className="text-indigo-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               View Mission File <ChevronRight size={14}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSpaceLab = () => {
    const fallDurations = { 'Earth': '1s', 'Mars': '2.6s', 'Moon': '6s' };

    return (
      <div className="animate-fade-in text-white p-10 max-w-6xl mx-auto h-screen flex flex-col">
        <div className="flex items-center gap-4 mb-8">
          <FlaskConical size={40} className="text-emerald-400" />
          <div>
            <h1 className="text-4xl font-black">Space Lab</h1>
            <p className="text-slate-400">Interactive physics simulations.</p>
          </div>
        </div>

        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gravity Simulator */}
          <div className="bg-slate-900/60 border border-slate-700 rounded-3xl p-8 flex flex-col relative overflow-hidden">
            <h2 className="text-2xl font-bold mb-2 text-emerald-300">Gravity Simulator</h2>
            <p className="text-sm text-slate-400 mb-6">Observe how fast an object falls on different planets due to gravity.</p>
            
            <div className="flex gap-2 mb-8 z-10">
              {['Earth', 'Mars', 'Moon'].map(p => (
                <button 
                  key={p} 
                  onClick={() => {
                    setLabGravity(p);
                    // trigger reflow hack to restart animation
                    const ball = document.getElementById('grav-ball');
                    if (ball) {
                      ball.style.animation = 'none';
                      ball.offsetHeight; /* trigger reflow */
                      ball.style.animation = null; 
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${labGravity === p ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex-grow border-2 border-dashed border-slate-700 rounded-2xl relative bg-slate-950 flex justify-center">
              <div className="absolute bottom-0 w-full h-10 bg-slate-800 rounded-b-xl border-t-2 border-emerald-900/50"></div>
              
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes gravityFall { 0% { top: 10%; } 100% { top: calc(100% - 70px); } }
                .anim-fall { animation: gravityFall ${fallDurations[labGravity]} cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards infinite alternate; }
              `}}/>
              
              <div id="grav-ball" className="anim-fall absolute w-12 h-12 bg-white rounded-full shadow-[0_0_20px_white]"></div>
            </div>
            <div className="mt-4 text-center text-xs text-slate-500 font-mono bg-slate-950 p-2 rounded-lg border border-slate-800">
              Acceleration: {labGravity === 'Earth' ? '9.8 m/s²' : labGravity === 'Mars' ? '3.7 m/s²' : '1.6 m/s²'}
            </div>
          </div>

          {/* Learn Note */}
          <div className="bg-slate-900/60 border border-slate-700 rounded-3xl p-8 flex flex-col justify-center text-center">
             <Lightbulb size={64} className="mx-auto text-yellow-400 mb-6" />
             <h2 className="text-2xl font-bold mb-4">More Simulations Coming Soon!</h2>
             <p className="text-slate-400 mb-8">ASTRA is setting up the Orbital Mechanics and Thrust experiment modules. Keep learning to unlock them.</p>
             <button onClick={() => handleNav('academy')} className="mx-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-full font-bold">Read Space Academy Logs</button>
          </div>
        </div>
      </div>
    );
  };

  const renderSimulation = () => (
    <div className="absolute inset-0 bg-black z-50 text-white flex flex-col items-center justify-center overflow-hidden">
      {/* Starfield Animation */}
      <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '50px 50px', animation: simState.step !== 'countdown' ? 'scrollBg 2s linear infinite' : 'none' }}></div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scrollBg { from { transform: translateY(0); } to { transform: translateY(50px); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .shake { animation: shake 0.2s infinite; }
        @keyframes flyUp { to { transform: translateY(-100vh); opacity: 0; } }
        .fly { animation: flyUp 3s ease-in forwards; }
      `}}/>

      <div className="relative z-10 w-full max-w-4xl text-center px-4">
        
        {simState.step === 'countdown' && (
          <div className="animate-pulse">
            <h1 className="text-8xl md:text-[150px] font-black text-red-500 mb-4 drop-shadow-[0_0_50px_red]">T-MINUS 3</h1>
            <p className="text-2xl text-slate-300 tracking-widest uppercase">Ignition Sequence Start</p>
          </div>
        )}

        {simState.step === 'liftoff' && (
          <div className="shake">
            <h1 className="text-7xl font-black text-orange-400 mb-20 drop-shadow-[0_0_40px_orange]">LIFTOFF!</h1>
            <div className="w-32 h-64 bg-slate-300 rounded-t-full relative mx-auto">
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-24 h-32 bg-gradient-to-t from-yellow-300 via-orange-500 to-transparent blur-md rounded-b-full"></div>
            </div>
          </div>
        )}

        {simState.step === 'transit' && (
          <div className="fly">
            <h1 className="text-5xl font-bold text-blue-300 mb-20 drop-shadow-[0_0_20px_blue]">Entering Orbit...</h1>
            <div className="w-24 h-48 bg-slate-300 rounded-t-full relative mx-auto">
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-16 h-20 bg-gradient-to-t from-cyan-300 to-transparent blur-sm rounded-b-full"></div>
            </div>
          </div>
        )}

        {simState.step === 'event' && (
          <div className="bg-slate-900/90 backdrop-blur-xl p-10 rounded-3xl border border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.3)] animate-fade-in inline-block text-left w-full max-w-2xl">
            <div className="flex items-center gap-4 mb-6 text-amber-500">
              <AlertTriangle size={48} />
              <h2 className="text-3xl font-black">COLLISION WARNING</h2>
            </div>
            <p className="text-lg text-slate-300 mb-8">Sensors detect a dense cloud of micrometeoroids directly in our flight path. Evasive maneuvers will consume extra fuel, or we can brace for impact and rely on hull integrity.</p>
            <div className="grid grid-cols-2 gap-6">
               <button onClick={() => handleSimEvent('evade')} className="p-6 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-2xl transition-colors">
                  <Flame size={32} className="text-orange-400 mb-3" />
                  <div className="text-xl font-bold mb-1">Evasive Burn</div>
                  <div className="text-sm text-slate-400">Uses 30 Fuel. Zero damage.</div>
               </button>
               <button onClick={() => handleSimEvent('shield')} className="p-6 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-2xl transition-colors">
                  <Shield size={32} className="text-blue-400 mb-3" />
                  <div className="text-xl font-bold mb-1">Brace for Impact</div>
                  <div className="text-sm text-slate-400">Saves fuel. Takes 40% Hull Damage.</div>
               </button>
            </div>
          </div>
        )}

        {simState.step === 'arrival' && (
          <div className="animate-fade-in">
            <h1 className="text-6xl font-black text-emerald-400 mb-6 drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]">DESTINATION REACHED</h1>
            <p className="text-2xl text-slate-300 mb-10">Orbit established around {activeMission.target}.</p>
            <button 
              onClick={() => { setView('exploration'); setExploreScore(0); }}
              className="px-10 py-5 bg-emerald-600 hover:bg-emerald-500 rounded-full font-bold text-xl shadow-lg transition-transform hover:scale-105 inline-flex items-center gap-3"
            >
              Begin Surface Operations <ChevronRight size={24}/>
            </button>
          </div>
        )}

        {/* HUD Logs */}
        <div className="fixed bottom-10 left-10 text-left text-xs font-mono text-cyan-400 opacity-70">
          <div className="mb-2 uppercase tracking-widest text-slate-500">Mission Logs</div>
          {simState.logs.map((log, i) => <div key={i} className="mb-1">{'>'} {log}</div>)}
        </div>
      </div>
    </div>
  );

  const renderExploration = () => {
    return (
      <div className={`absolute inset-0 z-50 text-white overflow-hidden ${activeMission.id === 'mars' ? 'bg-orange-950' : activeMission.id === 'moon' ? 'bg-slate-900' : 'bg-slate-950'}`}>
        <header className="absolute top-6 left-6 right-6 bg-black/50 backdrop-blur-md p-4 rounded-2xl flex justify-between items-center z-20 border border-white/10">
          <div>
            <h1 className="text-2xl font-bold">{activeMission.target} Surface</h1>
            <p className="text-slate-300 text-sm">Click anomalies to collect scientific data.</p>
          </div>
          <div className="text-right">
             <div className="text-3xl font-black text-cyan-400">{exploreScore} / 50</div>
             <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Science XP</div>
          </div>
          {exploreScore >= 50 && (
            <button onClick={endMission} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold animate-pulse shadow-[0_0_20px_blue]">
              End Mission
            </button>
          )}
        </header>

        {/* The interactive surface */}
        <div className="absolute inset-0 pt-32 pb-10 px-10 z-10">
           {[...Array(6)].map((_, i) => (
             <div 
               key={i}
               onClick={(e) => { setExploreScore(p => p + 10); e.target.style.display = 'none'; }}
               className="absolute w-20 h-20 bg-white/10 border-2 border-white/30 rounded-full cursor-pointer hover:bg-white/30 flex items-center justify-center animate-bounce shadow-xl transition-colors backdrop-blur-sm"
               style={{ top: `${Math.random() * 60 + 20}%`, left: `${Math.random() * 80 + 10}%`, animationDelay: `${i * 0.3}s` }}
             >
               <Database className="text-white pointer-events-none" size={32}/>
             </div>
           ))}
           {/* Horizon graphic */}
           <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
        </div>
      </div>
    );
  };

  const renderReport = () => (
    <div className="animate-fade-in text-white p-10 max-w-4xl mx-auto h-screen flex flex-col justify-center text-center">
      <Award size={100} className="mx-auto text-yellow-400 mb-6 drop-shadow-[0_0_40px_rgba(250,204,21,0.5)]" />
      <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">MISSION SUCCESS</h1>
      <p className="text-2xl text-slate-300 mb-12">You successfully explored {activeMission.target}!</p>
      
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700 shadow-2xl mb-10 text-left max-w-2xl mx-auto w-full">
        <h3 className="text-xl font-bold mb-6 border-b border-slate-700 pb-4">Mission Report</h3>
        <div className="space-y-4">
           <div className="flex justify-between items-center"><span className="text-slate-400">Target Reached</span><span className="font-bold text-white">{activeMission.target}</span></div>
           <div className="flex justify-between items-center"><span className="text-slate-400">Fuel Remaining</span><span className="font-bold text-yellow-400">{simState.fuelLeft} units</span></div>
           <div className="flex justify-between items-center"><span className="text-slate-400">Hull Integrity</span><span className="font-bold text-emerald-400">{simState.hull}%</span></div>
           <div className="flex justify-between items-center"><span className="text-slate-400">Science Collected</span><span className="font-bold text-cyan-400">+{exploreScore} XP</span></div>
           <div className="flex justify-between items-center pt-4 border-t border-slate-800"><span className="text-lg font-bold text-slate-300">Total XP Earned</span><span className="text-3xl font-black text-blue-500">+{activeMission.xp + exploreScore} XP</span></div>
        </div>
      </div>

      <button onClick={() => handleNav('dashboard')} className="mx-auto px-12 py-5 bg-white text-slate-900 font-black text-xl rounded-full hover:bg-slate-200 transition-transform hover:scale-105">
        Return to Base
      </button>
    </div>
  );

  const renderSolarSystem = () => (
    <div className="animate-fade-in text-white p-10 max-w-6xl mx-auto relative h-screen">
      
      {/* FLASHCARD MODAL */}
      {activePlanetFlashcards && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)] animate-fade-in relative">
            <button 
              onClick={() => setActivePlanetFlashcards(null)}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-red-500 rounded-full text-white transition-colors z-20"
            >
              <X size={20} />
            </button>

            <div className={`h-32 ${activePlanetFlashcards.color} flex items-center justify-center relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
              <h2 className="text-5xl font-black text-white relative z-10 drop-shadow-lg tracking-wider">{activePlanetFlashcards.name}</h2>
            </div>
            
            <div className="p-10 text-center min-h-[250px] flex flex-col justify-center relative">
              <div className="text-cyan-400 font-bold uppercase tracking-widest text-xs mb-4">Fact {flashcardIdx + 1} of 5</div>
              <p className="text-2xl md:text-3xl font-bold text-slate-200 leading-relaxed">
                "{activePlanetFlashcards.flashcards[flashcardIdx]}"
              </p>
            </div>

            <div className="flex justify-between items-center p-6 bg-slate-950 border-t border-slate-800">
              <button 
                onClick={() => setFlashcardIdx(p => Math.max(0, p - 1))}
                disabled={flashcardIdx === 0}
                className="p-3 rounded-full bg-slate-800 text-white disabled:opacity-30 hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="flex gap-2">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === flashcardIdx ? 'bg-cyan-400' : 'bg-slate-700'}`}></div>
                ))}
              </div>
              <button 
                onClick={() => {
                  if (flashcardIdx < 4) {
                    setFlashcardIdx(p => p + 1);
                  } else {
                    setProfile(p => ({ ...p, learningXp: p.learningXp + 20 }));
                    setActivePlanetFlashcards(null);
                    setMentor({ show: true, message: `Great job studying ${activePlanetFlashcards.name}! +20 Learning XP!`, mood: 'happy' });
                  }
                }}
                className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-colors ${flashcardIdx === 4 ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-cyan-600 hover:bg-cyan-500'}`}
              >
                {flashcardIdx === 4 ? 'Finish (+20 XP)' : 'Next Fact'} <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-4xl font-black mb-8">Solar System Explorer</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANETS.map(p => (
          <div 
            key={p.name} 
            onClick={() => { setActivePlanetFlashcards(p); setFlashcardIdx(0); }}
            className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl text-center hover:border-cyan-500/50 transition-colors group cursor-pointer"
          >
             <div className={`w-24 h-24 rounded-full mx-auto mb-6 shadow-[0_0_20px_currentColor] transition-transform group-hover:scale-110 ${p.color}`}></div>
             <h3 className="text-2xl font-bold mb-1">{p.name}</h3>
             <p className="text-xs text-cyan-400 font-bold uppercase tracking-widest mb-4">{p.type}</p>
             <p className="text-sm text-slate-400 mb-6 h-24">{p.desc}</p>
             
             <div className="bg-slate-950 rounded-xl p-3 text-xs text-left space-y-1 mb-4">
                <div className="flex justify-between"><span className="text-slate-500">Distance</span><span className="font-bold text-slate-300">{p.dist}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Size</span><span className="font-bold text-slate-300">{p.size}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Temp</span><span className="font-bold text-slate-300">{p.temp}</span></div>
             </div>
             
             <div className="text-cyan-400 text-sm font-bold flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               Explore Facts <ChevronRight size={16}/>
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMentorFloat = () => {
    if (!mentor.show) return null;
    return (
      <div className="fixed bottom-6 right-6 z-40 flex items-end gap-4 max-w-sm pointer-events-none animate-fade-in">
        <div className={`p-4 rounded-2xl shadow-2xl backdrop-blur-md text-sm border font-medium bg-slate-900/90 text-white
          ${mentor.mood === 'warning' ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]'}
        `}>
          <div className="text-[10px] text-cyan-400 font-black tracking-widest uppercase mb-1 border-b border-slate-700/50 pb-1">ASTRA (AI Teacher)</div>
          {mentor.message}
        </div>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 shadow-[0_0_15px_rgba(0,255,255,0.5)] shrink-0 bg-slate-950
          ${mentor.mood === 'warning' ? 'border-amber-400' : 'border-cyan-400'}
        `}>
          <div className="w-10 h-10 rounded-full bg-cyan-200 animate-pulse flex items-center justify-center">
            <Brain className="text-cyan-800" size={20} />
          </div>
        </div>
      </div>
    );
  };

  // --- MAIN RENDER ---
  if (!authReady || !user) {
    return <AuthScreen loading={!authReady} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans selection:bg-cyan-500/30 overflow-hidden relative">
      {/* Background Styling */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"></div>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
      </div>
      
      {/* Custom CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}}/>

      {/* Render Sidebar if not in Sim/Explore */}
      {view !== 'simulation' && view !== 'exploration' && renderSidebar()}

      {/* Main Content Area */}
      <div className={`flex-grow relative z-10 overflow-y-auto ${view !== 'simulation' && view !== 'exploration' ? 'ml-64' : ''}`}>
        {view === 'dashboard' && renderDashboard()}
        {view === 'missions' && renderMissions()}
        {view === 'builder' && renderBuilder()}
        {view === 'crew' && renderCrew()}
        {view === 'planner' && renderPlanner()}
        {view === 'simulation' && renderSimulation()}
        {view === 'exploration' && renderExploration()}
        {view === 'report' && renderReport()}
        {view === 'solarsystem' && renderSolarSystem()}
        {view === 'academy' && renderAcademy()}
        {view === 'spacelab' && renderSpaceLab()}
      </div>

      {view !== 'simulation' && view !== 'exploration' && renderMentorFloat()}
    </div>
  );
}
