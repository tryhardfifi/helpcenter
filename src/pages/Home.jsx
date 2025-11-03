import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="text-xl font-light tracking-tight">AI SEO</div>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-white text-sm font-light hover:text-gray-300 transition-colors">
                Home
              </Link>
              <Link to="/pricing" className="text-gray-400 text-sm font-light hover:text-white transition-colors">
                Pricing
              </Link>
            </div>
          </div>
          <Link to="/login">
            <Button
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white hover:text-black transition-colors"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-7xl md:text-8xl font-light tracking-tight mb-8 leading-none">
            Track Your<br />AI Mentions
          </h1>
          <p className="text-2xl md:text-3xl text-gray-400 font-light mb-12 max-w-3xl mx-auto leading-relaxed">
            Monitor visibility across ChatGPT, Claude, Perplexity,<br />
            and other answer engines.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <Link to="/login">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-6 h-auto"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-black text-lg px-8 py-6 h-auto"
              >
                View Pricing
              </Button>
            </Link>
          </div>

          {/* Key Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-32 text-left">
            <div className="border-l border-white/20 pl-6">
              <h3 className="text-xl font-light mb-3">Real-time Tracking</h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Monitor AI mentions across multiple platforms in real-time. Track sentiment, rankings, and trends.
              </p>
            </div>
            <div className="border-l border-white/20 pl-6">
              <h3 className="text-xl font-light mb-3">Competitor Analysis</h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Compare your visibility against competitors. Understand your position in the AI landscape.
              </p>
            </div>
            <div className="border-l border-white/20 pl-6">
              <h3 className="text-xl font-light mb-3">Content Optimization</h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Get insights to optimize your content for AI visibility. Improve your rankings systematically.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-t border-white/10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-6xl font-light mb-3">1,247</div>
              <div className="text-gray-400 font-light">Average Mentions/Month</div>
            </div>
            <div>
              <div className="text-6xl font-light mb-3">23.4%</div>
              <div className="text-gray-400 font-light">Average Growth Rate</div>
            </div>
            <div>
              <div className="text-6xl font-light mb-3">5+</div>
              <div className="text-gray-400 font-light">Answer Engines Tracked</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t border-white/10 py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl font-light mb-6">
            Start tracking today
          </h2>
          <p className="text-xl text-gray-400 font-light mb-8">
            14-day free trial. No credit card required.
          </p>
          <Link to="/login">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-6 h-auto"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
