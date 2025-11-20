import { useNavigate } from "react-router-dom";
import googleLogo from "../assets/googleLogo.svg";
import { BackgroundBeams } from "../components/ui/background-beams";
import { signin } from "../auth/auth";
import anyCardLogo from "../../public/anyCardLogo.png";

export default function LoginPage() {
  const navigate = useNavigate();
  //   const [showPassword, setShowPassword] = useState(false);
  //   const [rememberDevice, setRememberDevice] = useState(false);

  //   // Form state
  //   const [formData, setFormData] = useState({
  //     email: "",
  //     password: "",
  //   });

  //   // UI state
  //   const [error, setError] = useState("");
  //   const [success, setSuccess] = useState("");

  //   // Handle input changes
  //   const handleInputChange = (field: string, value: string) => {
  //     setFormData((prev) => ({
  //       ...prev,
  //       [field]: value,
  //     }));
  //     // Clear error when user starts typing
  //     if (error) setError("");
  //   };

  //   // Handle form submission
  //   const handleSubmit = (e: React.FormEvent) => {
  //     e.preventDefault();

  //     // Basic validation
  //     if (!formData.email || !formData.password) {
  //       setError("Please fill in all fields");
  //       return;
  //     }

  //     if (!formData.email.includes("@")) {
  //       setError("Please enter a valid email address");
  //       return;
  //     }

  //     // Form is valid - UI only, no API call
  //     setError("");
  //     setSuccess("Form is valid (API calls removed)");
  //   };

  //   // Handle forgot password
  //   const handleForgotPassword = () => {
  //     if (!formData.email) {
  //       setError("Please enter your email address first");
  //       return;
  //     }

  //     setError("");
  //     setSuccess("Password reset requested (API calls removed)");
  //   };

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Animated Background Elements */}
      <BackgroundBeams />

      {/* Main Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-80px)]">
        {/* Left Section - Promotional */}
        <div className="hidden lg:flex lg:w-1/2 pl-20 pr-12 pt-20 pb-12 flex-col justify-between">
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              {/* <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                insert new logo here
              </div> */}
              <span className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                AnyCard
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white leading-tight">
                Collect, trade, and generate anything.
              </h1>
              <h2 className="text-2xl font-semibold text-gray-300 leading-tight">
                Easily create your own card set,
                <br />
                and collect the daily generated sets.
              </h2>
            </div>
            <img
              alt=""
              src={anyCardLogo}
              className="[filter:invert(1)_hue-rotate(360deg)] w-[80%] "
            />
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="w-full lg:w-1/2 py-[12%] flex justify-center">
          <div className="w-full max-w-md space-y-8">
            {/* Login Title */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-white">
                Login to your account
              </h1>
            </div>

            {/* Error/Success Messages
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-green-300 text-sm">{success}</span>
              </div>
            )}

            {/* Login Form 
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field 
              <div className="space-y-3">
                <label
                  htmlFor="email"
                  className="text-base font-medium text-gray-300"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("email", e.target.value)
                    }
                    className="w-full"
                  />
                </div>
              </div>
              {/* Password Field 
              <div className="">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-base font-medium text-gray-300"
                  >
                    Password
                  </label>
                  {/* <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-base text-blue-400 hover:text-blue-300 transition-colors duration-300 disabled:opacity-50"
                  >
                    Forgot your password?
                  </button> 
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="w-full "
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2  bg-transparent"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              {/* Remember Device 
              <div className="flex items-center space-x-4">
                <input
                  title="remember"
                  id="remember"
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setRememberDevice(e.target.checked)
                  }
                  className="w-5 h-5 border-white/20 rounded bg-white/10 checked:bg-blue-500 checked:border-blue-500 cursor-pointer"
                />
                <p className="text-white ml-1"> Remember this device</p>
              </div>
              {/* Sign In Button 
              <button
                type="submit"
                className="in w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 text-lg rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25 cursor-pointer"
              >
                <p className="text-white">Sign in</p>
              </button>
              {/* Registration Link 
              <div className="text-center">
                <span className="text-gray-300 text-base">
                  Don't have an account?{" "}
                </span>
                <Link
                  to="/register"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300 text-base"
                >
                  Register.
                </Link>
              </div> */}
            {/* Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-base">
                {/* <span className="px-5 py-2 bg-black/20 backdrop-blur-sm text-gray-300 rounded-lg">
                  Or log in with
                </span> */}
              </div>
            </div>
            {/* Social Login Buttons  */}
            <div className="space-y-4">
              <button
                type="button"
                className="in w-full flex items-center justify-center bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-colors duration-300 py-4 text-base rounded-lg"
                onClick={async () => {
                  try {
                    await signin();
                    // Redirect to homepage after successful login
                    navigate("/");
                  } catch (error) {
                    // Error handling is done in the signin function
                    console.error("Login failed:", error);
                  }
                }}
              >
                <img src={googleLogo} alt="Google" className="w-6 h-6 mr-2" />
                <p className="text-black">Continue with Google</p>
              </button>
            </div>
            {/* </form> */}
          </div>
        </div>
      </div>
    </div>
  );
}
