import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  DumbbellIcon,
  CalendarIcon,
  UsersIcon,
  ClipboardListIcon,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { routes } from '@/lib/constants';
import { useAuth } from '@/components/auth/AuthProvider';
import { useEffect } from 'react';
import { UserRole } from '@/types/User';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const redirectPath =
        user.role === UserRole.Client ? routes.Dashboard : routes.MyClients;
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  const scrollToFeatures = () => {
    window.scrollTo({
      top: document.getElementById('features')?.offsetTop,
      behavior: 'smooth',
    });
  };

  return (
    <div className="flex flex-col gap-16 pb-10">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 pt-12 md:pt-20">
        <div className="bg-primary/10 font-medium px-4 py-1.5 rounded-full mb-2">
          Welcome to <span className="uppercase font-bold">EasyGym</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold max-w-3xl leading-tight">
          Fitness Management <span className="text-accent">Reimagined</span>
        </h1>
        <p className="text-primary max-w-2xl text-lg">
          The complete platform for both fitness enthusiasts and personal
          trainers to track workouts, monitor progress, and achieve fitness
          goals together.
        </p>
        <div className="flex flex-wrap gap-4 justify-center mt-4">
          <Button size="lg" asChild>
            <Link to={routes.Register}>
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button onClick={scrollToFeatures} size="lg" variant="outline">
            Learn More
          </Button>
        </div>
        <div className="relative mt-12 w-full max-w-5xl h-[400px] overflow-visible">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>

            <div
              className="absolute top-8 left-12 animate-float"
              style={{ animationDelay: '0s' }}
            >
              <div className="bg-card border border-accent/30 rounded-2xl p-6 shadow-xl backdrop-blur-sm transform rotate-[-8deg] transition-transform duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <DumbbellIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-accent">247</div>
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Workouts Logged
                </p>
              </div>
            </div>

            <div
              className="absolute top-4 right-16 animate-float"
              style={{ animationDelay: '1s' }}
            >
              <div className="bg-card border border-accent/30 rounded-2xl p-6 shadow-xl backdrop-blur-sm transform rotate-[6deg] transition-transform duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
                    <CalendarIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-accent">12</div>
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Programs
                </p>
              </div>
            </div>

            <div
              className="absolute bottom-12 left-20 animate-float"
              style={{ animationDelay: '0.5s' }}
            >
              <div className="bg-card border border-accent/30 rounded-2xl p-6 shadow-xl backdrop-blur-sm transform rotate-[4deg] transition-transform duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                    <UsersIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-accent">1.2k</div>
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Community Members
                </p>
              </div>
            </div>

            <div
              className="absolute bottom-16 right-12 animate-float"
              style={{ animationDelay: '1.5s' }}
            >
              <div className="bg-card border border-accent/30 rounded-2xl p-6 shadow-xl backdrop-blur-sm transform rotate-[-5deg] transition-transform duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <ClipboardListIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-accent">98%</div>
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Goal Success Rate
                </p>
              </div>
            </div>

            <Link to={routes.Login}>
              <div className="relative z-10 bg-gradient-to-br from-accent to-secondary rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-transform duration-300 cursor-pointer">
                <div className="text-center">
                  <div className="text-5xl font-bold text-white mb-2">💪</div>
                  <div className="text-2xl font-bold text-white mb-1">
                    Your Workout Journey
                  </div>
                  <div className="text-white">Starts Here</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything you need for your fitness success
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <FeatureCard
            icon={<DumbbellIcon className="h-6 w-6" />}
            title="Workout Tracking"
            description="Log and monitor your exercises, sets, reps, and weights with our intuitive interface."
          />
          <FeatureCard
            icon={<CalendarIcon className="h-6 w-6" />}
            title="Training Programs"
            description="Access professionally designed workout plans or create your own custom programs."
          />
          <FeatureCard
            icon={<UsersIcon className="h-6 w-6" />}
            title="Community Support"
            description="Connect with like-minded fitness enthusiasts and share your journey."
          />
          <FeatureCard
            icon={<ClipboardListIcon className="h-6 w-6" />}
            title="For Personal Trainers"
            description="Manage your clients, create custom programs, and track their progress all in one place."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 mt-8">
        <div className="bg-card rounded-2xl p-8 md:p-12 shadow-sm border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold">
                Ready to transform your fitness journey?
              </h3>
            </div>
            <Button size="lg" className="md:self-end" asChild>
              <Link to={routes.Register}>
                Start Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Home;
