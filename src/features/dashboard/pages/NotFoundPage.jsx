import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="mt-16 text-center">
      <h1 className="text-3xl font-semibold text-slate-900">Page not found</h1>
      <Link className="mt-4 inline-block text-blue-600" to="/">
        Return to dashboard
      </Link>
    </div>
  );
}

export default NotFoundPage;
