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
import { UserRole } from '@/types/User';
import { useAuth } from '@/components/auth/AuthProvider';
import { Link } from 'react-router';
import {
  UserPlusIcon,
  ShieldCheckIcon,
  DumbbellIcon,
  UserIcon,
} from 'lucide-react';

const Register = () => {
  const { register } = useAuth();

  const accountTypes = [
    {
      value: UserRole.Client,
      icon: UserIcon,
      label: 'Client',
      description: 'Track your progress and book workouts',
    },
    {
      value: UserRole.Trainer,
      icon: DumbbellIcon,
      label: 'Trainer',
      description: 'Lead and manage sessions',
    },
    {
      value: UserRole.Admin,
      icon: ShieldCheckIcon,
      label: 'Admin',
      description: 'Full system access',
    },
  ];

  const FormSchema = z
    .object({
      name: z.string(),
      email: z.string().email({
        message: 'Invalid email address.',
      }),
      password: z.string().min(8, {
        message: 'Password must be at least 8 characters.',
      }),
      confirmPassword: z.string().min(8, {
        message: 'Password must be at least 8 characters.',
      }),
      role: z.enum(Object.values(UserRole) as [UserRole, ...UserRole[]]),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: UserRole.Client,
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const registerResponse = await register(data);

    if (registerResponse?.id) {
      toast.success('Registered successfully');
    } else {
      toast.error(`Failed to register: ${registerResponse}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen-content">
      <div className="w-full max-w-2xl px-6">
        <div className="flex flex-col items-center text-center mb-8">
          <UserPlusIcon className="w-14 h-14 text-accent" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Join us!</h1>
          <p className="text-muted-foreground">
            Create an account and start your fitness journey effortlessly
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-lg p-8">
          <Form {...form}>
            <FormWrapper onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem fullWidth>
                    <FormLabel className="text-sm font-medium">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
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
              <div className="grid grid-cols-2 gap-4 w-full items-start">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem fullWidth>
                      <FormLabel className="text-sm font-medium">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Create a password"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <div className="min-h-6">
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem fullWidth>
                      <FormLabel className="text-sm font-medium">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm your password"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <div className="min-h-6">
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem fullWidth>
                    <FormLabel className="text-sm font-medium mb-3 block">
                      Account Type
                    </FormLabel>
                    <div className="grid grid-cols-3 gap-3">
                      {accountTypes.map((role) => {
                        const Icon = role.icon;
                        const isSelected = field.value === role.value;
                        return (
                          <button
                            key={role.value}
                            type="button"
                            onClick={() => field.onChange(role.value)}
                            className={`
                              relative flex flex-col items-center p-4 rounded-lg border-2 transition-all cursor-pointer
                              ${
                                isSelected
                                  ? 'border-accent bg-accent/5'
                                  : 'border-border hover:border-accent/50 bg-background'
                              }
                            `}
                          >
                            <Icon
                              className={`w-8 h-8 mb-2 ${
                                isSelected
                                  ? 'text-accent'
                                  : 'text-muted-foreground'
                              }`}
                            />
                            <span
                              className={`text-sm font-medium mb-1 ${
                                isSelected
                                  ? 'text-foreground'
                                  : 'text-foreground'
                              }`}
                            >
                              {role.label}
                            </span>
                            <span className="text-xs text-muted-foreground text-center">
                              {role.description}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="min-h-6">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 font-medium text-base mt-2"
              >
                Create Account
              </Button>
            </FormWrapper>
          </Form>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-accent hover:text-accent/80 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
