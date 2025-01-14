import Link from "next/link";
import "@/styles/home.css"

export default function App() {
  return (
    <main className="main">
      <h1 className="title">
        Welcom To Ft_Trancendence
      </h1>

      <nav className="nav-bar">
        <div className="item"><Link href="/auth/login">Login</Link></div>
        <div className="item"><Link href="/auth/register">Register</Link></div>
      </nav>
    </main>
  );
}
