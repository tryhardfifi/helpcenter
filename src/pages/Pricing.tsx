import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$99',
      period: '/month',
      description: 'For small companies tracking AI visibility',
      features: [
        '3 answer engines tracked',
        '50 prompts tracked',
        'Email support',
        'Basic analytics',
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Growth',
      price: '$399',
      period: '/month',
      description: 'For growing companies optimizing content',
      badge: 'Popular',
      features: [
        '5 answer engines tracked',
        '100 prompts tracked',
        '6 optimized articles per month',
        'Advanced analytics',
        'Priority support',
      ],
      cta: 'Get Started',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large teams orchestrating AEO',
      features: [
        '10+ answer engines tracked',
        'Unlimited prompts',
        'Multiple companies tracked',
        'Dedicated support',
        'SSO/SAML compliance',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="text-xl font-light tracking-tight">AI SEO</div>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-gray-400 text-sm font-light hover:text-white transition-colors">
                Home
              </Link>
              <Link to="/pricing" className="text-white text-sm font-light hover:text-gray-300 transition-colors">
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

      {/* Hero + Pricing Combined */}
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-light tracking-tight mb-6 leading-tight">
              Flexible plans for<br />every marketing team
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-light max-w-3xl mx-auto">
              From bootstrapped startups to global enterprises.<br />
              Track AI visibility at any scale.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative border rounded-lg p-8 transition-all ${
                  plan.highlighted
                    ? 'border-white bg-white/5'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-white text-black text-xs font-medium px-3 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-light mb-2">{plan.name}</h3>
                  <div className="flex items-baseline mb-3">
                    <span className="text-5xl font-light">{plan.price}</span>
                    {plan.period && (
                      <span className="text-gray-400 ml-2">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm font-light">
                    {plan.description}
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-white shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300 font-light">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Link to="/login" className="block">
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? 'bg-white text-black hover:bg-gray-200'
                        : 'bg-transparent border border-white hover:bg-white hover:text-black'
                    } transition-colors`}
                    variant={plan.highlighted ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <p className="text-gray-400 text-sm font-light">
              All plans include 14-day free trial. No credit card required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
