import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  Mail, 
  Brain, 
  Target, 
  Bookmark, 
  Clock,
  Star,
  Zap,
  Shield,
  Users,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-genie-500 to-magic-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900">
              DigestGenie
            </span>
            <Badge variant="secondary" className="ml-2 bg-magic-100 text-magic-700">
              AI Powered ✨
            </Badge>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-gray-600 hover:text-genie-600 transition-colors">
              Genie Powers
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-genie-600 transition-colors">
              How It Works
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-genie-600 transition-colors">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signin">
              <Button className="bg-gradient-to-r from-genie-500 to-genie-600 hover:from-genie-600 hover:to-genie-700">
                Start Free Magic
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-6 bg-magic-50 border-magic-200 text-magic-700">
              <Star className="w-3 h-3 mr-1" />
              Your AI Newsletter Genie
            </Badge>
            
            <h1 className="font-display text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Three Wishes Granted:
              <span className="bg-gradient-to-r from-genie-500 via-magic-500 to-genie-600 bg-clip-text text-transparent block mt-2">
                Organize, Summarize, Simplify
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Rub the lamp and watch your newsletter chaos transform into magical organization. 
              DigestGenie uses AI to tame your inbox and reclaim your time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/auth/signin">
                <Button size="lg" className="bg-gradient-to-r from-genie-500 to-genie-600 hover:from-genie-600 hover:to-genie-700 text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all animate-magic-glow">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Rub the Lamp - Start Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 rounded-full">
                <span className="mr-2">🎥</span>
                Watch Magic Demo
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Free forever plan
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Setup in 2 minutes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-genie-50 border-genie-200 text-genie-700">
              <Zap className="w-3 h-3 mr-1" />
              Magical Newsletter Powers
            </Badge>
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">
              Your Genie Grants These Wishes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Each feature is designed to make your newsletter experience magical and effortless.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-genie-500 to-genie-600 rounded-xl flex items-center justify-center mb-4 group-hover:animate-genie-sparkle">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold">Magic Organization</CardTitle>
                <CardDescription>
                  Automatically sort newsletters into perfect categories with AI intelligence
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-magic-500 to-magic-600 rounded-xl flex items-center justify-center mb-4 group-hover:animate-genie-sparkle">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold">Genie Summaries</CardTitle>
                <CardDescription>
                  Get the essence of every newsletter in seconds with AI-powered summaries
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-genie-500 to-magic-500 rounded-xl flex items-center justify-center mb-4 group-hover:animate-genie-sparkle">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold">Relevance Spell</CardTitle>
                <CardDescription>
                  AI scores content relevance so you only see what matters most to you
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:animate-genie-sparkle">
                  <Bookmark className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold">Treasure Chest</CardTitle>
                <CardDescription>
                  Save your favorite insights and build your personal knowledge collection
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:animate-genie-sparkle">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold">Daily Magic</CardTitle>
                <CardDescription>
                  Receive a personalized digest email with your best content each morning
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:animate-genie-sparkle">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold">Time Magic</CardTitle>
                <CardDescription>
                  Reclaim hours every week by letting your genie handle the newsletter overload
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-gradient-to-br from-genie-50 to-magic-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-white border-genie-200 text-genie-700">
              <Sparkles className="w-3 h-3 mr-1" />
              Simple Magic Process
            </Badge>
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">
              Three Steps to Newsletter Nirvana
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting started with DigestGenie is as easy as making a wish.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-genie-500 to-genie-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold animate-magic-glow">
                1
              </div>
              <h3 className="font-display text-xl font-semibold mb-4">Rub the Lamp</h3>
              <p className="text-gray-600">
                Sign up with Google and get your personal newsletter email address. 
                Your genie is ready to grant wishes!
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-magic-500 to-magic-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="font-display text-xl font-semibold mb-4">Make Your Wishes</h3>
              <p className="text-gray-600">
                Subscribe your favorite newsletters to your DigestGenie email. 
                Our AI immediately starts working its magic.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="font-display text-xl font-semibold mb-4">Enjoy the Magic</h3>
              <p className="text-gray-600">
                Watch as your newsletters are automatically organized, summarized, 
                and delivered in a beautiful, digestible format.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto text-center">
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-genie-600 mb-2">5 min</div>
              <div className="text-gray-600">Average daily reading time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-genie-600 mb-2">94%</div>
              <div className="text-gray-600">Time saved vs manual reading</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-genie-600 mb-2">1000+</div>
              <div className="text-gray-600">Happy genie users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-genie-600 mb-2">∞</div>
              <div className="text-gray-600">Newsletters supported</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-genie-600 to-magic-600">
        <div className="container mx-auto text-center text-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-4xl font-bold mb-4">
              Ready for Newsletter Magic? 🧞‍♂️
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users who have already discovered the magic of organized newsletters. 
              Your genie is waiting to grant your wishes.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/signin">
                <Button size="lg" className="bg-white text-genie-600 hover:bg-gray-50 text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Your Magic Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            <p className="text-sm mt-6 opacity-75">
              ✨ Free forever • ⚡ No credit card required • 🚀 Ready in 2 minutes
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-300">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-genie-500 to-magic-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-bold text-xl text-white">
                  DigestGenie
                </span>
              </div>
              <p className="text-gray-400 mb-4">
                Your AI Newsletter Genie for magical email organization and summarization.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-genie-400 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-genie-400 transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Genie Powers</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-genie-400 transition-colors">Magic Organization</a></li>
                <li><a href="#" className="hover:text-genie-400 transition-colors">AI Summaries</a></li>
                <li><a href="#" className="hover:text-genie-400 transition-colors">Smart Filtering</a></li>
                <li><a href="#" className="hover:text-genie-400 transition-colors">Daily Digest</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-genie-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-genie-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-genie-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-genie-400 transition-colors">Help Center</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-genie-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-genie-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-genie-400 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 DigestGenie. Made with ✨ and AI magic.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}