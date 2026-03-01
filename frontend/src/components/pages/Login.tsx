import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import FormWrapper from '@/components/ui/widgets/FormWrapper';
import { useAuth } from '@/components/auth/AuthProvider';
import { Link, useNavigate } from 'react-router';
import { UsersIcon } from 'lucide-react';
import { UserRole } from '@/types/User';
import { routes } from '@/lib/constants';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const FormSchema = z.object({
    email: z.string().email({
      message: 'Invalid email address.',
    }),
    password: z.string().min(8, {
      message: 'Password must be at least 8 characters.',
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const loginResponse = await login(data);
    if (loginResponse?.id) {
      toast.success('Logged in successfully');
      const redirectPath =
        loginResponse.role === UserRole.Client
          ? routes.Dashboard
          : routes.MyClients;
      navigate(redirectPath);
    } else {
      toast.error(`Failed to login: ${loginResponse}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen-content">
      <div className="w-full max-w-md px-6">
        <div className="flex flex-col items-center text-center mb-8">
          <UsersIcon className="w-14 h-14 text-accent" />
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back!
          </h1>
          <p className="text-muted-foreground">
            Sign in to continue to Easygym
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-lg p-8">
          <Form {...form}>
            <FormWrapper onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem fullWidth>
                    <FormLabel className="text-sm font-medium">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@example.com"
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem fullWidth>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-medium">
                        Password
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full h-11 font-medium text-base mt-2"
              >
                Sign In
              </Button>
            </FormWrapper>
          </Form>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-accent hover:text-accent/80 font-medium transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
