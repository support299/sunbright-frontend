import { Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { cn } from "../../../lib/utils";
import { setCredentials } from "../../../store/authSlice";
import { useGoogleLoginMutation, useLoginMutation } from "../api/authApi";

const inputClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

const GSI_SCRIPT_ID = "google-gsi-client-script";

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [googleLogin, { isLoading: googleLoading }] = useGoogleLoginMutation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
  const googleHostRef = useRef(null);
  const [gsiLoaded, setGsiLoaded] = useState(() => Boolean(typeof window !== "undefined" && window.google?.accounts?.id));

  useEffect(() => {
    if (!clientId) return;
    if (typeof window === "undefined") return;
    if (window.google?.accounts?.id) {
      setGsiLoaded(true);
      return;
    }
    let script = document.getElementById(GSI_SCRIPT_ID);
    if (!script) {
      script = document.createElement("script");
      script.id = GSI_SCRIPT_ID;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => setGsiLoaded(true);
      document.head.appendChild(script);
    } else if (window.google?.accounts?.id) {
      setGsiLoaded(true);
    } else {
      script.addEventListener("load", () => setGsiLoaded(true), { once: true });
    }
  }, [clientId]);

  useEffect(() => {
    if (!clientId || !gsiLoaded || !googleHostRef.current || typeof window === "undefined") return;

    const el = googleHostRef.current;

    const handleCredentialResponse = async (response) => {
      if (!response?.credential) return;
      setError("");
      try {
        const apiRes = await googleLogin({ credential: response.credential }).unwrap();
        dispatch(setCredentials(apiRes.data));
        navigate("/", { replace: true });
      } catch (err) {
        const serverMsg = err?.data?.errors?.[0]?.message;
        setError(serverMsg || "Google sign-in failed. Try again or use your username and password.");
      }
    };

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      auto_select: false,
    });

    el.innerHTML = "";
    const width = Math.max(el.offsetWidth || 0, 320);
    window.google.accounts.id.renderButton(el, {
      theme: "outline",
      size: "large",
      width,
      text: "continue_with",
      shape: "rectangular",
      locale: "en",
    });
  }, [clientId, gsiLoaded, googleLogin, dispatch, navigate]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const response = await login(form).unwrap();
      dispatch(setCredentials(response.data));
      navigate("/", { replace: true });
    } catch {
      setError("Login failed. Check your credentials.");
    }
  };

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[20%] top-[-10%] h-[min(50vh,28rem)] w-[min(50vh,28rem)] rounded-full bg-primary/[0.07] blur-3xl" />
        <div className="absolute -right-[15%] bottom-[-15%] h-[min(45vh,24rem)] w-[min(45vh,24rem)] rounded-full bg-primary/[0.05] blur-3xl" />
      </div>

      <div className="relative z-[1] w-full max-w-[420px]">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/25">
            <Sun className="h-8 w-8 text-primary" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Sunbright Analytics</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Sign in to access project performance and dashboards</p>
          </div>
        </div>

        <Card className="border-border/80 bg-card/95 shadow-2xl shadow-black/20 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-lg font-semibold">Sign in</CardTitle>
            <p className="text-sm text-muted-foreground">Use your organization account or Google (if enabled).</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {clientId ? (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Google</p>
                <div
                  ref={googleHostRef}
                  className={cn(
                    "flex min-h-[44px] w-full items-center justify-center",
                    (googleLoading || !gsiLoaded) && "pointer-events-none opacity-60"
                  )}
                />
                {!gsiLoaded ? (
                  <p className="text-center text-xs text-muted-foreground">Loading Google Sign-In…</p>
                ) : null}
              </div>
            ) : null}

            {clientId ? (
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden>
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with password</span>
                </div>
              </div>
            ) : null}

            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-foreground" htmlFor="login-username">
                  Username
                </label>
                <input
                  id="login-username"
                  name="username"
                  autoComplete="username"
                  className={cn(inputClass)}
                  placeholder="Enter username"
                  value={form.username}
                  onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-foreground" htmlFor="login-password">
                  Password
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className={cn(inputClass)}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                />
              </div>
              {error ? (
                <p
                  className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}
              <Button className="h-11 w-full text-base font-semibold shadow-md" disabled={isLoading} size="lg" type="submit">
                {isLoading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-xs text-muted-foreground/80">Sunbright Solar USA — internal analytics</p>
      </div>
    </div>
  );
}

export default LoginPage;
