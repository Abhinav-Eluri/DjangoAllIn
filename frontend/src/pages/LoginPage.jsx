import Login from '../components/auth/Login';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-responsive px-responsive dark-transition">
      <div className="max-w-sm sm:max-w-md w-full space-y-responsive">
        <div>
          <h2 className="mt-6 text-center text-responsive-2xl font-extrabold text-foreground">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-responsive-sm text-muted-foreground">
            Or{' '}
            <a
              href="/register"
              className="font-medium text-primary hover:text-primary/80 dark-transition"
            >
              create a new account
            </a>
          </p>
        </div>
        <Login />
      </div>
    </div>
  );
};

export default LoginPage;