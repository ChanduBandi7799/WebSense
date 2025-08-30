import React from 'react';
import { Search, Zap, Shield, Smartphone, Code, Activity, ArrowRight, Sparkles, Globe, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const features = [
    {
      icon: <Activity className="w-10 h-10" />,
      title: "Lighthouse Report",
      description: "Get comprehensive performance, accessibility, SEO, and best practices scores for your website with detailed optimization recommendations",
      color: "text-blue-500",
      bgGlow: "from-blue-500/10 to-slate-600/10",
      hoverGlow: "hover:shadow-blue-500/20"
    },
    {
      icon: <Shield className="w-10 h-10" />,
      title: "Privacy & Tracking",
      description: "Analyze third-party trackers, analytics scripts, and advertising services to understand privacy implications and data collection",
      color: "text-blue-500",
      bgGlow: "from-blue-500/10 to-slate-600/10",
      hoverGlow: "hover:shadow-blue-500/20"
    },
    {
      icon: <Code className="w-10 h-10" />,
      title: "Tech Stack Detection",
      description: "Identify the technologies, frameworks, libraries, and tools powering your website infrastructure with version details",
      color: "text-indigo-500",
      bgGlow: "from-indigo-500/10 to-slate-600/10",
      hoverGlow: "hover:shadow-indigo-500/20"
    },
    {
      icon: <Shield className="w-10 h-10" />,
      title: "Security Headers Check",
      description: "Analyze HTTP security headers to identify vulnerabilities, improve security posture, and protect against common attacks",
      color: "text-red-500",
      bgGlow: "from-red-500/10 to-slate-600/10",
      hoverGlow: "hover:shadow-red-500/20"
    },
    {
      icon: <Smartphone className="w-10 h-10" />,
      title: "Mobile Friendly Test",
      description: "Ensure your website provides optimal user experience across all mobile devices, tablets, and various screen sizes",
      color: "text-emerald-500",
      bgGlow: "from-emerald-500/10 to-slate-600/10",
      hoverGlow: "hover:shadow-emerald-500/20"
    }
  ];

  const benefits = [
    { text: "100% Free Analysis", icon: <CheckCircle className="w-5 h-5" /> },
    { text: "Instant Results", icon: <Zap className="w-5 h-5" /> },
    { text: "No Registration Required", icon: <Shield className="w-5 h-5" /> },
    { text: "Professional Reports", icon: <Activity className="w-5 h-5" /> },
    { text: "SEO Optimization Tips", icon: <Search className="w-5 h-5" /> },
    { text: "Performance Insights", icon: <Globe className="w-5 h-5" /> }
  ];

  const stats = [
    { number: "10M+", label: "Websites Analyzed", delay: "0s" },
    { number: "99.9%", label: "Uptime Guaranteed", delay: "0.2s" },
    { number: "< 30s", label: "Analysis Time", delay: "0.4s" },
    { number: "24/7", label: "Available Always", delay: "0.6s" }
  ];

  // Add CSS reset effect
  React.useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = '#020617';
    document.documentElement.style.backgroundColor = '#020617';
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 overflow-x-hidden" style={{ 
      backgroundColor: '#020617', 
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      margin: 0,
      padding: 0
    }}>
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-40">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-slate-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>
    
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-transparent to-slate-950/30"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 border border-blue-500/30 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 border border-slate-500/30 rounded-full animate-bounce"></div>
        <div className="absolute top-1/3 right-20 w-12 h-12 bg-gradient-to-r from-blue-500/20 to-slate-500/20 rounded-full animate-pulse"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-20 text-center z-10">
          <div className="mb-8 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-950/50 to-slate-900/50 rounded-full border border-slate-700/50 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
            <span className="text-sm text-slate-300 font-semibold tracking-wide">PROFESSIONAL WEBSITE INTELLIGENCE PLATFORM</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-8 bg-gradient-to-r from-slate-100 via-blue-100 to-slate-100 bg-clip-text text-transparent">
            WEBSENSE
          </h1>
          
          <p className="text-2xl md:text-3xl text-slate-200 mb-6 font-light tracking-wide">
            Professional Website Intelligence & Analysis
          </p>
          
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-4xl mx-auto leading-relaxed">
            Unlock the full potential of your website with our comprehensive analysis suite. Get instant insights into performance, 
            security, mobile compatibility, and technical infrastructure with enterprise-grade tools.
          </p>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="group p-6 bg-slate-900/30 rounded-xl border border-slate-800/50 backdrop-blur-sm hover:bg-slate-800/40 hover:border-blue-500/40 transition-all duration-500 hover:scale-105"
                style={{ animationDelay: stat.delay }}
              >
                <div className="text-3xl font-bold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors duration-300">
                  {stat.number}
                </div>
                <div className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          
          {/* CTA Button */}
          <div className="relative inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-slate-600 rounded-xl blur opacity-60 group-hover:opacity-80 transition duration-1000"></div>
            <a
              href="/add-website"
              className="relative inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-blue-600 to-slate-700 text-white text-xl font-bold rounded-xl hover:from-blue-500 hover:to-slate-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
            >
              <Search className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
              ANALYZE NOW FOR FREE
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </a>
          </div>
          
          <p className="mt-6 text-slate-500 text-sm font-medium">
            No registration required • Instant results • 100% Free forever
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-950/50 to-slate-900/50 rounded-full border border-slate-700/50 backdrop-blur-md mb-6">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-300 font-semibold tracking-wide">ANALYSIS SUITE</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-slate-100 mb-8">
              Complete Website Analysis Suite
            </h2>
            <p className="text-xl md:text-2xl text-slate-400 max-w-4xl mx-auto leading-relaxed">
              Five powerful analysis tools designed to optimize your website's performance, security, and user experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative p-8 bg-gradient-to-br ${feature.bgGlow} rounded-2xl border border-slate-800/40 hover:border-slate-700/60 transition-all duration-500 hover:scale-105 ${feature.hoverGlow} hover:shadow-2xl backdrop-blur-sm overflow-hidden`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Animated Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Icon Container */}
                <div className={`relative ${feature.color} mb-8 group-hover:scale-110 transition-all duration-500 inline-flex p-4 bg-slate-900/40 rounded-xl border border-slate-800/30`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-current to-transparent opacity-5 rounded-xl"></div>
                  {feature.icon}
                </div>
                
                <h3 className="relative text-2xl font-bold text-slate-100 mb-6 group-hover:text-blue-100 transition-all duration-300">
                  {feature.title}
                </h3>
                
                <p className="relative text-slate-400 leading-relaxed text-lg group-hover:text-slate-300 transition-colors duration-300">
                  {feature.description}
                </p>
                
                {/* Hover Arrow */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <ArrowRight className={`w-6 h-6 ${feature.color}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="relative py-32 px-4 bg-gradient-to-b from-slate-950/50 to-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-900/50 to-blue-950/50 rounded-full border border-slate-700/50 backdrop-blur-md mb-6">
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              <span className="text-sm text-slate-300 font-semibold tracking-wide">WHY CHOOSE US</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-slate-100 mb-8">
              Why Choose WEBSENSE?
            </h2>
            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto">
              Professional-grade website analysis tools, completely free and always available
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group flex items-center p-8 bg-gradient-to-r from-slate-900/30 to-slate-800/40 rounded-xl border border-slate-800/40 hover:border-blue-500/40 transition-all duration-500 hover:scale-105 hover:bg-gradient-to-r hover:from-slate-900/50 hover:to-slate-800/60 backdrop-blur-sm"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-blue-400 mr-6 group-hover:scale-110 transition-transform duration-300 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  {benefit.icon}
                </div>
                <span className="text-slate-100 font-semibold text-lg group-hover:text-blue-100 transition-colors duration-300">
                  {benefit.text}
                </span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="relative py-32 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="relative p-16 bg-gradient-to-br from-blue-950/40 via-slate-900/30 to-slate-950/40 rounded-2xl border border-slate-800/50 backdrop-blur-sm overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-4 left-4 w-32 h-32 bg-blue-500/10 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 right-4 w-32 h-32 bg-slate-500/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-5xl md:text-6xl font-bold text-slate-100 mb-8">
                Start Analyzing Your Website Today
              </h2>
              <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Get instant insights into your website's performance, security, and mobile compatibility. 
                Professional analysis tools, completely free forever.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-slate-600 rounded-xl blur opacity-60 group-hover:opacity-80 transition duration-1000"></div>
                  <a
                    href="/add-website"
                    className="relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-slate-700 text-white text-xl font-bold rounded-xl hover:from-blue-500 hover:to-slate-600 transition-all duration-300 hover:scale-105 group"
                  >
                    <Search className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                    Try Free Analysis
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                  </a>
                </div>
                
                <button className="px-10 py-5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-100 text-xl font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl backdrop-blur-sm border border-slate-700/40 hover:border-slate-600/50">
                  View Sample Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative py-20 px-4 border-t border-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-100 via-blue-100 to-slate-100 bg-clip-text text-transparent">
              WEBSENSE
            </div>
            <p className="text-slate-400 mb-10 max-w-3xl mx-auto text-lg leading-relaxed">
              Empowering websites with professional analysis tools. Monitor, analyze, and optimize your web presence 
              with our comprehensive suite of free tools designed for developers, businesses, and website owners worldwide.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8 text-slate-500">
              <span className="font-medium">© 2025 WEBSENSE</span>
              <div className="hidden sm:block w-1 h-1 bg-slate-600 rounded-full"></div>
              <span className="text-blue-400 font-bold text-lg">100% Free Forever</span>
              <div className="hidden sm:block w-1 h-1 bg-slate-600 rounded-full"></div>
              <span className="font-medium">No Registration Required</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;