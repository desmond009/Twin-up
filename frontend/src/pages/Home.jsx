import { Link } from 'react-router-dom';
import MyImage from '../assets/images/skill_subset.jpg';

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-blue-100 via-green-50 to-blue-200 overflow-hidden">
      {/* Decorative blurred gradient blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-200 rounded-full opacity-40 blur-2xl z-0" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-green-200 rounded-full opacity-30 blur-2xl z-0" />
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-300 rounded-full opacity-20 blur-3xl z-0" />
      <main className="flex-1 flex flex-col items-center justify-center px-2 md:px-4 z-10 relative">
        <section className="w-full max-w-4xl mx-auto rounded-2xl shadow-2xl p-6 md:p-12 flex flex-col items-center bg-white/70 backdrop-blur-md border border-gray-100 mt-12 mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 text-blue-700 leading-tight text-center drop-shadow-sm">Welcome to Twin-up</h1>
          <p className="text-base md:text-lg text-gray-700 mb-6 leading-relaxed text-center max-w-2xl">
            <span className="font-semibold text-blue-600">Skills</span> are the currency of the modern world. Whether you want to learn a new language, master a software tool, or develop a creative talent, skills open doors to new opportunities, boost confidence, and empower you to achieve your goals.<br /><br />
            <span className="font-semibold text-green-600">Skill swapping</span> is a powerful way to grow. Instead of paying for expensive courses, you can exchange what you know for what you want to learn. It’s a win-win: you teach your expertise, and in return, you gain new abilities from others. This creates a vibrant, supportive community where everyone can thrive.<br /><br />
            <span className="font-semibold">Why Twin-up?</span>
          </p>
          <ul className="list-disc list-inside mx-auto max-w-xl mb-4 mt-2 text-base text-gray-600 space-y-1">
            <li>Unlock new career and life opportunities by learning in-demand skills.</li>
            <li>Share your knowledge and make a real impact in someone’s journey.</li>
            <li>Build meaningful connections and expand your network.</li>
            <li>Learn at your own pace, in a friendly, collaborative environment.</li>
            <li>Save money and time by exchanging value directly with peers.</li>
          </ul>
          <span className="font-semibold text-blue-600">Join Twin-up</span> and become part of a global movement where everyone can teach, learn, and grow—together.
          <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto justify-center">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-8 py-2 rounded-lg shadow hover:bg-blue-700 text-lg font-medium transition w-full sm:w-auto text-center"
              aria-label="Register for Twin-up"
            >
              Register
            </Link>
            <Link
              to="/login"
              className="bg-white border border-blue-600 text-blue-700 px-8 py-2 rounded-lg shadow hover:bg-blue-50 text-lg font-medium transition w-full sm:w-auto text-center"
              aria-label="Login to Twin-up"
            >
              Login
            </Link>
          </div>
        </section>
      </main>
      <footer className="bg-gray-900 text-gray-200 mt-auto z-10 relative">
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-2 text-lg">Twin-up</h3>
            <ul className="space-y-1 text-sm">
              <li><a href="#" className="hover:underline">About Us</a></li>
              <li><a href="#" className="hover:underline">How It Works</a></li>
              <li><a href="#" className="hover:underline">Community</a></li>
              <li><a href="#" className="hover:underline">Blog</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2 text-lg">Support</h3>
            <ul className="space-y-1 text-sm">
              <li><a href="#" className="hover:underline">Help Center</a></li>
              <li><a href="#" className="hover:underline">Contact Us</a></li>
              <li><a href="#" className="hover:underline">Safety Tips</a></li>
              <li><a href="#" className="hover:underline">Report Abuse</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2 text-lg">Legal</h3>
            <ul className="space-y-1 text-sm">
              <li><a href="#" className="hover:underline">Terms of Service</a></li>
              <li><a href="#" className="hover:underline">Privacy Policy</a></li>
              <li><a href="#" className="hover:underline">Cookie Policy</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2 text-lg">Connect</h3>
            <ul className="space-y-1 text-sm">
              <li><a href="#" className="hover:underline">Twitter</a></li>
              <li><a href="#" className="hover:underline">LinkedIn</a></li>
              <li><a href="#" className="hover:underline">Instagram</a></li>
              <li><a href="#" className="hover:underline">Facebook</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Twin-up. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
