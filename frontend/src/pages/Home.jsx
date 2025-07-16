import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-3xl bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center text-center">
          <h1 className="text-4xl font-extrabold mb-4 text-blue-700">Welcome to Skill Swap Platform</h1>
          <p className="text-lg text-gray-700 mb-6">
            <span className="font-semibold text-blue-600">Skills</span> are the currency of the modern world. Whether you want to learn a new language, master a software tool, or develop a creative talent, skills open doors to new opportunities, boost confidence, and empower you to achieve your goals.<br /><br />
            <span className="font-semibold text-green-600">Skill swapping</span> is a powerful way to grow. Instead of paying for expensive courses, you can exchange what you know for what you want to learn. It’s a win-win: you teach your expertise, and in return, you gain new abilities from others. This creates a vibrant, supportive community where everyone can thrive.<br /><br />
            <span className="font-semibold">Why Skill Swap?</span><br />
            <ul className="list-disc list-inside text-left mx-auto max-w-xl mb-4 mt-2 text-base text-gray-600">
              <li>Unlock new career and life opportunities by learning in-demand skills.</li>
              <li>Share your knowledge and make a real impact in someone’s journey.</li>
              <li>Build meaningful connections and expand your network.</li>
              <li>Learn at your own pace, in a friendly, collaborative environment.</li>
              <li>Save money and time by exchanging value directly with peers.</li>
            </ul>
            <span className="font-semibold text-blue-600">Join us</span> and become part of a global movement where everyone can teach, learn, and grow—together.
          </p>
        </div>
      </main>
      <footer className="bg-gray-900 text-gray-200 mt-10">
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-2 text-lg">Skill Swap</h3>
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
          &copy; {new Date().getFullYear()} Skill Swap Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
